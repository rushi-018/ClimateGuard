from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ClimateData(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    precipitation: float = Field(..., description="Precipitation in mm")
    humidity: float = Field(..., description="Humidity percentage")
    wind_speed: float = Field(..., description="Wind speed in km/h")

class PredictionRequest(BaseModel):
    region: str = Field(..., description="Region name or identifier")
    climate_data: ClimateData
    risk_type: Optional[str] = Field(None, description="Specific risk type to predict")

class PredictionResponse(BaseModel):
    risk_score: float = Field(..., description="Risk score between 0 and 1")
    risk_label: str = Field(..., description="Risk level label")
    confidence: float = Field(..., description="Prediction confidence")
    risk_type: str = Field(..., description="Type of climate risk")
    region: str = Field(..., description="Region name")
    prediction_date: datetime = Field(..., description="When prediction was made")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
