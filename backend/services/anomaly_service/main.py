"""
FairGig Anomaly Detection Service - Statistical analysis and vulnerability detection
Identifies suspicious patterns, outliers, and potential wage theft indicators
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import statistics
import uuid
import os
from dotenv import load_dotenv
import pathlib

load_dotenv(pathlib.Path(__file__).parent.parent.parent / '.env')

DATABASE_URL = os.getenv('POSTGRES_URL', 'postgresql://user:password@localhost/fairgig')

app = FastAPI(title="FairGig Anomaly Detection Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()

class AnomalyFlag(BaseModel):
    id: str
    worker_id: str
    flag_type: str
    severity: str
    description: str
    status: str = "open"

def calculate_z_score(value: float, mean: float, stdev: float) -> float:
    """Calculate Z-score for outlier detection"""
    if stdev == 0:
        return 0
    return abs((value - mean) / stdev)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "anomaly-service"}

@app.post("/analyze/{worker_id}")
def analyze_worker(worker_id: str, conn=Depends(get_db)):
    """Run comprehensive anomaly analysis on worker earnings"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get worker's shifts
            cur.execute("""
                SELECT id, platform, shift_date, duration_hours, 
                       gross_earnings, net_earnings, created_at
                FROM shifts
                WHERE worker_id = %s AND status != 'flagged'
                ORDER BY shift_date DESC
            """, (worker_id,))
            shifts = cur.fetchall()
            
            if not shifts:
                return {"flags": [], "message": "No shifts to analyze"}
            
            flags = []
            
            # 1. Earnings Outlier Detection
            hourly_rates = []
            for shift in shifts:
                if shift['duration_hours'] > 0:
                    hourly_rate = shift['gross_earnings'] / shift['duration_hours']
                    hourly_rates.append(hourly_rate)
            
            if len(hourly_rates) > 2:
                mean_hourly = statistics.mean(hourly_rates)
                stdev_hourly = statistics.stdev(hourly_rates) if len(hourly_rates) > 1 else 0
                
                for i, shift in enumerate(shifts[:10]):  # Check recent 10
                    if shift['duration_hours'] > 0:
                        hourly_rate = shift['gross_earnings'] / shift['duration_hours']
                        z_score = calculate_z_score(hourly_rate, mean_hourly, stdev_hourly)
                        
                        if z_score > 2.5:  # High outlier
                            flag_id = str(uuid.uuid4())
                            cur.execute("""
                                INSERT INTO anomaly_flags
                                (id, worker_id, shift_id, flag_type, severity, 
                                 description, detection_method, statistical_value, threshold_value, status)
                                VALUES (%s, %s, %s, 'unusually_high_earnings', 'low',
                                       %s, 'z_score_analysis', %s, %s, 'open')
                            """, (flag_id, worker_id, shift['id'],
                                  f"Hourly rate {hourly_rate:.2f} is {z_score:.2f}x std dev above mean {mean_hourly:.2f}",
                                  hourly_rate, mean_hourly))
                            flags.append({
                                "flag_type": "unusually_high_earnings",
                                "severity": "low",
                                "z_score": z_score
                            })
            
            # 2. Temporal Pattern Analysis
            shift_times = {}
            for shift in shifts:
                created = shift['created_at']
                if hasattr(created, 'hour'):
                    hour = created.hour
                else:
                    try:
                        hour = int(str(created).split('T')[1].split(':')[0])
                    except Exception:
                        hour = 12
                shift_times[hour] = shift_times.get(hour, 0) + 1
            
            unusual_hours = [h for h, count in shift_times.items() if count > 6 and (h < 6 or h > 22)]
            if unusual_hours:
                flag_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO anomaly_flags
                    (id, worker_id, flag_type, severity, description, 
                     detection_method, status)
                    VALUES (%s, %s, 'unusual_shift_timing', 'medium',
                           %s, 'temporal_analysis', 'open')
                """, (flag_id, worker_id,
                      f"Worker consistently logs shifts at unusual hours: {unusual_hours}"))
                flags.append({
                    "flag_type": "unusual_shift_timing",
                    "severity": "medium",
                    "hours": unusual_hours
                })
            
            # 3. Missing Shift Pattern
            if len(shifts) > 5:
                cutoff = (datetime.now() - timedelta(days=30)).date()
                recent_shifts = [s for s in shifts if 
                               (s['shift_date'] if hasattr(s['shift_date'], 'year') 
                                else datetime.fromisoformat(str(s['shift_date'])).date()) > cutoff]
                if len(recent_shifts) == 0:
                    flag_id = str(uuid.uuid4())
                    cur.execute("""
                        INSERT INTO anomaly_flags
                        (id, worker_id, flag_type, severity, description, 
                         detection_method, status)
                        VALUES (%s, %s, 'inactivity_period', 'low',
                               %s, 'temporal_analysis', 'open')
                    """, (flag_id, worker_id, "No activity in last 30 days after consistent logging"))
                    flags.append({
                        "flag_type": "inactivity_period",
                        "severity": "low"
                    })
            
            # 4. Platform Inconsistency Detection
            platforms = {}
            for shift in shifts:
                platform = shift['platform']
                if platform not in platforms:
                    platforms[platform] = []
                if shift['duration_hours'] > 0:
                    platforms[platform].append(shift['gross_earnings'] / shift['duration_hours'])
            
            # Get city median rates
            cur.execute("SELECT city FROM users WHERE id = %s", (worker_id,))
            worker = cur.fetchone()
            
            if worker and worker.get('city'):
                for platform, rates in platforms.items():
                    if rates:
                        worker_avg = statistics.mean(rates)
                        
                        # Get city median for comparison
                        cur.execute("""
                            SELECT median_hourly_rate FROM earnings_aggregation
                            WHERE city = %s AND platform = %s
                            ORDER BY last_calculated DESC LIMIT 1
                        """, (worker.get('city'), platform))
                        
                        agg = cur.fetchone()
                        if agg:
                            city_median = float(agg['median_hourly_rate'])
                            ratio = worker_avg / city_median if city_median > 0 else 1
                            
                            if ratio < 0.7:  # Earning significantly less
                                flag_id = str(uuid.uuid4())
                                cur.execute("""
                                    INSERT INTO anomaly_flags
                                    (id, worker_id, flag_type, severity, description,
                                     detection_method, statistical_value, threshold_value, status)
                                    VALUES (%s, %s, 'platform_inconsistency', 'high',
                                           %s, 'comparative_analysis', %s, %s, 'open')
                                """, (flag_id, worker_id,
                                      f"Earnings {ratio:.2f}x below city median for {platform}",
                                      worker_avg, city_median))
                                flags.append({
                                    "flag_type": "platform_inconsistency",
                                    "severity": "high",
                                    "platform": platform,
                                    "ratio": ratio
                                })
            
            conn.commit()
            return {
                "worker_id": worker_id,
                "analysis_date": datetime.now().isoformat(),
                "total_shifts_analyzed": len(shifts),
                "flags_detected": len(flags),
                "flags": flags
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/flags/worker/{worker_id}")
def get_worker_flags(worker_id: str, status: Optional[str] = None, conn=Depends(get_db)):
    """Get all flags for a worker"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if status:
                cur.execute("""
                    SELECT * FROM anomaly_flags
                    WHERE worker_id = %s AND status = %s
                    ORDER BY created_at DESC
                """, (worker_id, status))
            else:
                cur.execute("""
                    SELECT * FROM anomaly_flags
                    WHERE worker_id = %s
                    ORDER BY created_at DESC
                """, (worker_id,))
            return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/flags/critical")
def get_critical_flags(conn=Depends(get_db)):
    """Get all critical/high severity flags across all workers"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT af.*, u.full_name, u.email, u.city
                FROM anomaly_flags af
                JOIN users u ON af.worker_id = u.id
                WHERE af.severity IN ('critical', 'high') AND af.status = 'open'
                ORDER BY af.created_at DESC
            """)
            return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/flags/{flag_id}/resolve")
def resolve_flag(flag_id: str, notes: str = "", conn=Depends(get_db)):
    """Mark a flag as resolved"""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE anomaly_flags
                SET status = 'resolved', resolution_notes = %s, resolved_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (notes, flag_id))
            conn.commit()
            return {"status": "resolved", "flag_id": flag_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
