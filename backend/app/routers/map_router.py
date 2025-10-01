from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.map import MapResponse, RegionRisk
from typing import List, Optional
import logging
import random

logger = logging.getLogger(__name__)
router = APIRouter()

MOCK_REGIONS = [
    {"name": "New York", "country": "USA", "lat": 40.7128, "lng": -74.0060},
    {"name": "Delhi", "country": "India", "lat": 28.6139, "lng": 77.2090},
    {"name": "Sydney", "country": "Australia", "lat": -33.8688, "lng": 151.2093},
    {"name": "London", "country": "UK", "lat": 51.5074, "lng": -0.1278},
    {"name": "São Paulo", "country": "Brazil", "lat": -23.5505, "lng": -46.6333},
    {"name": "Tokyo", "country": "Japan", "lat": 35.6762, "lng": 139.6503},
    {"name": "Cairo", "country": "Egypt", "lat": 30.0444, "lng": 31.2357},
    {"name": "Lagos", "country": "Nigeria", "lat": 6.5244, "lng": 3.3792},
    {"name": "Bangkok", "country": "Thailand", "lat": 13.7563, "lng": 100.5018},
    {"name": "Mexico City", "country": "Mexico", "lat": 19.4326, "lng": -99.1332},
    {"name": "Moscow", "country": "Russia", "lat": 55.7558, "lng": 37.6176},
    {"name": "Cape Town", "country": "South Africa", "lat": -33.9249, "lng": 18.4241},
]

def get_random_risk_type() -> str:
    """Get a random risk type"""
    risk_types = ["Flood", "Drought", "Heatwave"]
    return random.choice(risk_types)

def get_random_severity() -> str:
    """Get a random severity level"""
    severities = ["Low", "Medium", "High"]
    return random.choice(severities)

def generate_risk_level(score: float) -> str:
    """Convert risk score to risk level"""
    if score >= 0.8:
        return "critical"
    elif score >= 0.6:
        return "high"
    elif score >= 0.4:
        return "medium"
    else:
        return "low"

def generate_mock_risks() -> dict:
    """Generate mock risk scores for different risk types"""
    return {
        "flood": round(random.uniform(0.1, 0.9), 2),
        "drought": round(random.uniform(0.1, 0.9), 2),
        "heatwave": round(random.uniform(0.1, 0.9), 2),
        "wildfire": round(random.uniform(0.1, 0.9), 2),
        "storm": round(random.uniform(0.1, 0.9), 2),
    }

@router.get("/global-map")
async def get_global_climate_map(
    risk_type: Optional[str] = Query(None, description="Filter by specific risk type"),
    min_risk: Optional[float] = Query(0.0, description="Minimum risk score filter"),
    db: Session = Depends(get_db)
):
    """
    Get global climate risk map data in clean GeoJSON format.
    
    Returns a FeatureCollection with Point geometries and risk properties.
    """
    try:
        logger.info(f"Global map request - risk_type: {risk_type}, min_risk: {min_risk}")
        
        features = []
        
        for region in MOCK_REGIONS:
            # Generate realistic risk data for each region
            region_risk_type = get_random_risk_type()
            region_severity = get_random_severity()
            
            # Apply risk type filter if specified
            if risk_type and region_risk_type != risk_type:
                continue
            
            # Create clean GeoJSON feature with requested structure
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [region["lng"], region["lat"]]
                },
                "properties": {
                    "riskType": region_risk_type,
                    "severity": region_severity,
                    "city": region["name"],
                    "country": region["country"]
                }
            }
            features.append(feature)
        
        # Return clean GeoJSON FeatureCollection
        geojson_response = {
            "type": "FeatureCollection",
            "features": features
        }
        
        logger.info(f"Returning {len(features)} risk points for global map")
        return JSONResponse(content=geojson_response)
        
    except Exception as e:
        logger.error(f"Global map error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve global map data: {str(e)}")

@router.get("/regions", response_model=List[RegionRisk])
async def get_regions_summary(
    limit: int = Query(50, description="Maximum number of regions to return"),
    db: Session = Depends(get_db)
):
    """Get summary of all regions with risk data"""
    try:
        regions = []
        
        for i, region in enumerate(MOCK_REGIONS[:limit]):
            risks = generate_mock_risks()
            overall_risk = sum(risks.values()) / len(risks)
            dominant_risk = max(risks, key=risks.get)
            
            region_risk = RegionRisk(
                region_id=i + 1,
                region_name=region["name"],
                country=region["country"],
                latitude=region["lat"],
                longitude=region["lng"],
                risk_score=round(overall_risk, 2),
                risk_level=generate_risk_level(overall_risk),
                dominant_risk=dominant_risk,
                risks=risks
            )
            regions.append(region_risk)
        
        logger.info(f"Returning {len(regions)} region summaries")
        return regions
        
    except Exception as e:
        logger.error(f"Regions summary error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
