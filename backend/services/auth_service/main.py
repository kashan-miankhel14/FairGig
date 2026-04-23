"""
FairGig Auth Service - JWT-based authentication and authorization
Manages user registration, login, token generation, and role-based access control
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import jwt
import os
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from dotenv import load_dotenv
import pathlib

# Load .env from backend/ directory
load_dotenv(pathlib.Path(__file__).parent.parent.parent / '.env')

# Configuration
DATABASE_URL = os.getenv('POSTGRES_URL', 'postgresql://user:password@localhost/fairgig')
JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

app = FastAPI(title="FairGig Auth Service", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()

# Pydantic Models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    email: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str  # 'worker', 'verifier', 'advocate'
    city: Optional[str] = None
    state: Optional[str] = None

class TokenPayload(BaseModel):
    user_id: str
    email: str
    role: str
    exp: int

# Utility Functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_access_token(user_id: str, email: str, role: str) -> str:
    """Create JWT token"""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': int(expiration.timestamp()),
        'iat': int(datetime.utcnow().timestamp())
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> TokenPayload:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "auth-service"}

@app.post("/auth/register", response_model=LoginResponse)
def register(request: RegisterRequest, conn=Depends(get_db)):
    """Register a new user"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check if user exists
            cur.execute("SELECT id FROM users WHERE email = %s", (request.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Validate role
            if request.role not in ['worker', 'verifier', 'advocate']:
                raise HTTPException(status_code=400, detail="Invalid role")
            
            # Hash password
            hashed_pwd = hash_password(request.password)
            
            # Insert user
            cur.execute("""
                INSERT INTO users (email, password_hash, full_name, role, city, state, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'active')
                RETURNING id, email, role
            """, (request.email, hashed_pwd, request.full_name, request.role, request.city, request.state))
            
            user = cur.fetchone()
            conn.commit()
            
            # Generate token
            token = create_access_token(user['id'], user['email'], user['role'])
            
            return LoginResponse(
                access_token=token,
                user_id=user['id'],
                role=user['role'],
                email=user['email']
            )
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest, conn=Depends(get_db)):
    """Authenticate user and return JWT token"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, email, password_hash, role FROM users WHERE email = %s",
                (request.email,)
            )
            user = cur.fetchone()
            
            if not user or not verify_password(request.password, user['password_hash']):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            # Update last login
            cur.execute(
                "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s",
                (user['id'],)
            )
            conn.commit()
            
            # Generate token
            token = create_access_token(user['id'], user['email'], user['role'])
            
            return LoginResponse(
                access_token=token,
                user_id=user['id'],
                role=user['role'],
                email=user['email']
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/auth/verify")
def verify(token: str, conn=Depends(get_db)):
    """Verify token and return user info"""
    payload = verify_token(token)
    return {
        "valid": True,
        "user_id": payload.user_id,
        "email": payload.email,
        "role": payload.role,
        "expires_at": payload.exp
    }

@app.get("/auth/user/{user_id}")
def get_user(user_id: str, conn=Depends(get_db)):
    """Get user details"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, email, full_name, role, city, state, status, created_at
                FROM users WHERE id = %s
            """, (user_id,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
