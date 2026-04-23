"""
FairGig Earnings Service - Shift logging, CSV import, and screenshot verification
Handles worker earnings data, platform-specific logic, and verification workflows
"""

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import csv
import io
import uuid
import os
from dotenv import load_dotenv
import pathlib

load_dotenv(pathlib.Path(__file__).parent.parent.parent / '.env')

DATABASE_URL = os.getenv('POSTGRES_URL', 'postgresql://user:password@localhost/fairgig')

app = FastAPI(title="FairGig Earnings Service", version="1.0.0")

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

# Models
class ShiftCreate(BaseModel):
    platform: str
    shift_date: str
    start_time: str
    end_time: str
    duration_hours: float
    gross_earnings: float
    platform_fees: float = 0
    net_earnings: float
    city: Optional[str] = None
    notes: Optional[str] = None

class ShiftResponse(BaseModel):
    id: str
    worker_id: str
    platform: str
    shift_date: str
    duration_hours: float
    gross_earnings: float
    net_earnings: float
    status: str
    created_at: str

class ScreenshotVerificationResponse(BaseModel):
    id: str
    shift_id: str
    status: str
    verification_notes: Optional[str]
    confidence_score: Optional[float]

# Routes
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "earnings-service"}

@app.post("/shifts", response_model=ShiftResponse)
def create_shift(worker_id: str, shift: ShiftCreate, conn=Depends(get_db)):
    """Create a new shift/earnings entry"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            shift_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO shifts 
                (id, worker_id, platform, shift_date, start_time, end_time, 
                 duration_hours, gross_earnings, platform_fees, net_earnings, status, city)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'logged', %s)
                RETURNING id, worker_id, platform, shift_date, duration_hours, 
                         gross_earnings, net_earnings, status, created_at
            """, (shift_id, worker_id, shift.platform, shift.shift_date, 
                  shift.start_time, shift.end_time, shift.duration_hours, 
                  shift.gross_earnings, shift.platform_fees, shift.net_earnings, shift.city))
            
            result = cur.fetchone()
            conn.commit()
            return result
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/shifts/{worker_id}")
def get_worker_shifts(worker_id: str, conn=Depends(get_db)):
    """Get all shifts for a worker"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, worker_id, platform, shift_date, duration_hours, 
                       gross_earnings, net_earnings, status, created_at
                FROM shifts
                WHERE worker_id = %s
                ORDER BY shift_date DESC
            """, (worker_id,))
            return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/shifts/{shift_id}/screenshot")
async def upload_shift_screenshot(
    shift_id: str,
    worker_id: str,
    file: UploadFile = File(...),
    conn=Depends(get_db)
):
    """Upload screenshot for shift verification"""
    try:
        # Save file (in production, use cloud storage like S3 or Vercel Blob)
        contents = await file.read()
        file_path = f"/uploads/screenshots/{worker_id}/{shift_id}.png"
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Create verification record
            verification_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO screenshot_verifications
                (id, shift_id, worker_id, screenshot_url, status)
                VALUES (%s, %s, %s, %s, 'pending')
                RETURNING id, shift_id, status
            """, (verification_id, shift_id, worker_id, file_path))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                "verification_id": result['id'],
                "status": result['status'],
                "message": "Screenshot uploaded for verification"
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/verifications/pending")
def get_pending_verifications(conn=Depends(get_db)):
    """Get all pending screenshot verifications (for verifier role)"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT sv.id, sv.shift_id, sv.worker_id, sv.screenshot_url, 
                       sv.status, sv.created_at,
                       s.platform, s.shift_date, s.gross_earnings,
                       u.full_name, u.city
                FROM screenshot_verifications sv
                JOIN shifts s ON sv.shift_id = s.id
                JOIN users u ON sv.worker_id = u.id
                WHERE sv.status = 'pending'
                ORDER BY sv.created_at ASC
            """)
            return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verifications/{verification_id}/verify")
def verify_screenshot(
    verification_id: str,
    verifier_id: str,
    approved: bool,
    notes: str = "",
    confidence: float = 0.95,
    conn=Depends(get_db)
):
    """Verify or reject a screenshot"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            status = 'verified' if approved else 'flagged'
            
            cur.execute("""
                UPDATE screenshot_verifications
                SET status = %s, verifier_id = %s, verification_notes = %s,
                    confidence_score = %s, verified_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, shift_id, status, verification_notes, confidence_score
            """, (status, verifier_id, notes, confidence, verification_id))
            
            verification = cur.fetchone()
            
            # Update shift status if verified
            if approved:
                cur.execute("""
                    UPDATE shifts SET status = 'verified'
                    WHERE id = %s
                """, (verification['shift_id'],))
            else:
                cur.execute("""
                    UPDATE shifts SET status = 'flagged'
                    WHERE id = %s
                """, (verification['shift_id'],))
            
            conn.commit()
            return verification
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/csv-import")
async def import_csv(
    worker_id: str,
    file: UploadFile = File(...),
    conn=Depends(get_db)
):
    """Import earnings from CSV file"""
    try:
        contents = await file.read()
        csv_file = io.StringIO(contents.decode('utf-8'))
        reader = csv.DictReader(csv_file)
        
        import_id = str(uuid.uuid4())
        rows_imported = 0
        rows_failed = 0
        
        with conn.cursor() as cur:
            for row in reader:
                try:
                    shift_id = str(uuid.uuid4())
                    cur.execute("""
                        INSERT INTO shifts
                        (id, worker_id, platform, shift_date, start_time, end_time,
                         duration_hours, gross_earnings, platform_fees, net_earnings, status)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'logged')
                    """, (
                        shift_id,
                        worker_id,
                        row.get('platform', 'Unknown'),
                        row.get('date'),
                        row.get('start_time'),
                        row.get('end_time'),
                        float(row.get('duration_hours', 0)),
                        float(row.get('gross_earnings', 0)),
                        float(row.get('platform_fees', 0)),
                        float(row.get('net_earnings', 0))
                    ))
                    rows_imported += 1
                except Exception as row_error:
                    rows_failed += 1
            
            # Record import
            cur.execute("""
                INSERT INTO csv_imports
                (id, worker_id, filename, file_url, status, total_rows, 
                 successfully_imported, failed_rows, completed_at)
                VALUES (%s, %s, %s, %s, 'completed', %s, %s, %s, CURRENT_TIMESTAMP)
            """, (import_id, worker_id, file.filename, f"/uploads/csv/{worker_id}/{import_id}.csv",
                  rows_imported + rows_failed, rows_imported, rows_failed))
            
            conn.commit()
        
        return {
            "import_id": import_id,
            "total_rows": rows_imported + rows_failed,
            "successfully_imported": rows_imported,
            "failed_rows": rows_failed,
            "status": "completed"
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/earnings/stats/{worker_id}")
def get_earnings_stats(worker_id: str, conn=Depends(get_db)):
    """Get earnings statistics for a worker"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    COUNT(*) as total_shifts,
                    SUM(gross_earnings) as total_earnings,
                    SUM(net_earnings) as total_net_earnings,
                    AVG(gross_earnings / NULLIF(duration_hours, 0)) as avg_hourly_rate,
                    SUM(duration_hours) as total_hours
                FROM shifts
                WHERE worker_id = %s AND status != 'flagged'
            """, (worker_id,))
            return cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
