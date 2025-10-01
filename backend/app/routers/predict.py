from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.prediction_service import PredictionService
from app.models.region import Region
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict_climate_risk(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Predict climate risk for a given region and climate data.
    
    - **region**: Region name or identifier
    - **climate_data**: Current climate conditions
    - **risk_type**: Optional specific risk type to predict
    """
    try:
        logger.info(f"Prediction request for region: {request.region}")
        
        # Get or create region
        region = db.query(Region).filter(Region.name == request.region).first()
        if not region:
            # For demo purposes, create a mock region
            region = Region(
                name=request.region,
                country="Unknown",
                latitude=0.0,
                longitude=0.0
            )
            db.add(region)
            db.commit()
            db.refresh(region)
        
        # Use prediction service
        prediction_service = PredictionService()
        prediction = await prediction_service.predict_risk(
            region=region,
            climate_data=request.climate_data,
            risk_type=request.risk_type
        )
        
        logger.info(f"Prediction completed for {request.region}: {prediction.risk_score}")
        return prediction
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/predict/history/{region_name}")
async def get_prediction_history(
    region_name: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get prediction history for a region"""
    try:
        region = db.query(Region).filter(Region.name == region_name).first()
        if not region:
            raise HTTPException(status_code=404, detail="Region not found")
        
        # This would typically query the predictions table
        # For now, return mock data
        return {
            "region": region_name,
            "predictions": [],
            "message": "Historical data would be returned here"
        }
        
    except Exception as e:
        logger.error(f"History retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
