from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.database import engine, Base
from app.routers import predict, map_router, actions
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.rate_limiting import RateLimitingMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("climateguard.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="ClimateGuard API",
    description="Climate risk prediction and monitoring API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware (order matters!)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitingMiddleware, calls_per_minute=100)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/api", tags=["predictions"])
app.include_router(map_router.router, prefix="/api", tags=["map"])
app.include_router(actions.router, prefix="/api", tags=["actions"])

@app.get("/")
async def root():
    """Health check endpoint"""
    logger.info("Health check requested")
    return {"message": "ClimateGuard API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    logger.info("Health check endpoint called")
    return {
        "status": "ok",
        "service": "ClimateGuard API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/api/predict",
            "global_map": "/api/global-map", 
            "actions": "/api/actions"
        }
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting ClimateGuard API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
