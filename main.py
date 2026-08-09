"""
Society Management System - FastAPI Backend
Production-ready application entry point
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZIPMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import logging
import os
from typing import Optional

# Database imports
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

# Import routes
from routes import (
    auth_routes,
    society_routes,
    member_routes,
    financial_routes,
    committee_routes,
    security_routes,
    asset_routes,
    complaint_routes,
    document_routes,
    analytics_routes,
    admin_routes
)

# Configuration
from config import (
    DATABASE_URL,
    ENVIRONMENT,
    DEBUG_MODE,
    ALLOWED_ORIGINS,
    API_VERSION,
    PROJECT_NAME
)

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database setup
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    echo=DEBUG_MODE,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    logger.info(f"Starting {PROJECT_NAME} - Version {API_VERSION}")
    
    # Startup logic
    try:
        # Create all tables
        from database.models import Base
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
    
    yield
    
    # Shutdown logic
    logger.info("Shutting down application")
    engine.dispose()

# Create FastAPI app
app = FastAPI(
    title=PROJECT_NAME,
    description="Comprehensive Society Management System",
    version=API_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs" if not DEBUG_MODE else "/api/docs",
    redoc_url="/api/redoc" if not DEBUG_MODE else "/api/redoc",
    openapi_url="/api/openapi.json" if DEBUG_MODE else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600
)

# Trusted hosts middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure for your domain
)

# GZIP compression
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# Custom error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "Internal server error",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Health check endpoint
@app.get("/api/health", tags=["System"])
async def health_check():
    """System health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": ENVIRONMENT,
        "version": API_VERSION,
        "database": "connected"
    }

# Root endpoint
@app.get("/", tags=["System"])
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {PROJECT_NAME}",
        "version": API_VERSION,
        "documentation": "/api/docs",
        "api_prefix": "/api/v1"
    }

# Include routers
@app.include_router(
    auth_routes.router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

@app.include_router(
    society_routes.router,
    prefix="/api/v1/societies",
    tags=["Society Management"]
)

@app.include_router(
    member_routes.router,
    prefix="/api/v1/members",
    tags=["Member Management"]
)

@app.include_router(
    financial_routes.router,
    prefix="/api/v1/financial",
    tags=["Financial Management"]
)

@app.include_router(
    committee_routes.router,
    prefix="/api/v1/committee",
    tags=["Governance & Committee"]
)

@app.include_router(
    security_routes.router,
    prefix="/api/v1/security",
    tags=["Security & Visitors"]
)

@app.include_router(
    asset_routes.router,
    prefix="/api/v1/assets",
    tags=["Asset & Maintenance"]
)

@app.include_router(
    complaint_routes.router,
    prefix="/api/v1/complaints",
    tags=["Complaints & Grievances"]
)

@app.include_router(
    document_routes.router,
    prefix="/api/v1/documents",
    tags=["Documents & Notices"]
)

@app.include_router(
    analytics_routes.router,
    prefix="/api/v1/analytics",
    tags=["Analytics & Reports"]
)

@app.include_router(
    admin_routes.router,
    prefix="/api/v1/admin",
    tags=["Administration"]
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info(f"Application started - {ENVIRONMENT} environment")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Application shutdown")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG_MODE,
        log_level="info"
    )
