from pydantic import BaseModel, Field
from typing import List, Dict, Any

class RegionRisk(BaseModel):
    region_id: int
    region_name: str
    country: str
    latitude: float
    longitude: float
    risk_score: float = Field(..., description="Overall risk score 0-1")
    risk_level: str = Field(..., description="Risk level: low, medium, high, critical")
    dominant_risk: str = Field(..., description="Primary risk type")
    risks: Dict[str, float] = Field(..., description="Individual risk scores by type")

class MapResponse(BaseModel):
    type: str = Field(default="FeatureCollection", description="GeoJSON type")
    features: List[Dict[str, Any]] = Field(..., description="GeoJSON features with risk data")
    metadata: Dict[str, Any] = Field(..., description="Additional metadata")
