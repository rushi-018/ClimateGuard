import random
import math
from datetime import datetime, timedelta
from typing import Optional
from app.schemas.prediction import ClimateData, PredictionResponse
from app.models.region import Region
from app.models.prediction import RiskType, RiskLevel
import logging

logger = logging.getLogger(__name__)

class PredictionService:
    """
    Climate risk prediction service with dummy logic.
    This can be easily replaced with actual ML models later.
    """
    
    def __init__(self):
        self.risk_thresholds = {
            "low": 0.3,
            "medium": 0.6,
            "high": 0.8
        }
        
        # Risk factors for different climate conditions
        self.risk_factors = {
            "flood": {
                "precipitation_weight": 0.4,
                "temperature_weight": 0.1,
                "humidity_weight": 0.3,
                "wind_weight": 0.2
            },
            "drought": {
                "precipitation_weight": -0.5,  # Negative because less precipitation = higher drought risk
                "temperature_weight": 0.3,
                "humidity_weight": -0.2,
                "wind_weight": 0.1
            },
            "heatwave": {
                "precipitation_weight": -0.1,
                "temperature_weight": 0.6,
                "humidity_weight": 0.2,
                "wind_weight": -0.1
            },
            "wildfire": {
                "precipitation_weight": -0.3,
                "temperature_weight": 0.4,
                "humidity_weight": -0.2,
                "wind_weight": 0.3
            },
            "storm": {
                "precipitation_weight": 0.3,
                "temperature_weight": 0.1,
                "humidity_weight": 0.2,
                "wind_weight": 0.4
            }
        }
    
    async def predict_risk(
        self, 
        region: Region, 
        climate_data: ClimateData, 
        risk_type: Optional[str] = None
    ) -> PredictionResponse:
        """
        Predict climate risk based on region and climate data.
        Uses dummy logic that can be replaced with ML models.
        """
        try:
            logger.info(f"Predicting risk for region {region.name}")
            
            # If no specific risk type requested, determine the most likely risk
            if not risk_type:
                risk_type = self._determine_primary_risk(climate_data)
            
            # Calculate risk score using dummy logic
            risk_score = self._calculate_risk_score(climate_data, risk_type)
            
            # Determine risk level
            risk_level = self._get_risk_level(risk_score)
            
            # Generate confidence score (dummy logic)
            confidence = self._calculate_confidence(climate_data, risk_type)
            
            response = PredictionResponse(
                risk_score=round(risk_score, 3),
                risk_label=risk_level,
                confidence=round(confidence, 3),
                risk_type=risk_type,
                region=region.name,
                prediction_date=datetime.utcnow()
            )
            
            logger.info(f"Prediction completed: {risk_type} risk = {risk_score:.3f}")
            return response
            
        except Exception as e:
            logger.error(f"Prediction service error: {str(e)}")
            raise
    
    def _determine_primary_risk(self, climate_data: ClimateData) -> str:
        """Determine the most likely risk type based on climate conditions"""
        scores = {}
        
        for risk_type in self.risk_factors.keys():
            scores[risk_type] = self._calculate_risk_score(climate_data, risk_type)
        
        # Return the risk type with highest score
        primary_risk = max(scores, key=scores.get)
        logger.debug(f"Primary risk determined: {primary_risk} (scores: {scores})")
        return primary_risk
    
    def _calculate_risk_score(self, climate_data: ClimateData, risk_type: str) -> float:
        """
        Calculate risk score using dummy logic based on climate conditions.
        This is where ML models would be integrated.
        """
        if risk_type not in self.risk_factors:
            # Default random score for unknown risk types
            return random.uniform(0.2, 0.8)
        
        factors = self.risk_factors[risk_type]
        
        # Normalize climate data to 0-1 scale for calculation
        temp_norm = min(max((climate_data.temperature + 10) / 60, 0), 1)  # -10°C to 50°C range
        precip_norm = min(climate_data.precipitation / 100, 1)  # 0-100mm+ range
        humidity_norm = climate_data.humidity / 100  # Already 0-100%
        wind_norm = min(climate_data.wind_speed / 100, 1)  # 0-100km/h+ range
        
        # Calculate weighted score
        score = (
            factors["temperature_weight"] * temp_norm +
            factors["precipitation_weight"] * precip_norm +
            factors["humidity_weight"] * humidity_norm +
            factors["wind_weight"] * wind_norm
        )
        
        # Normalize to 0-1 range and add some randomness for realism
        base_score = (score + 1) / 2  # Convert from -1,1 to 0,1
        random_factor = random.uniform(0.8, 1.2)  # Add ±20% randomness
        final_score = min(max(base_score * random_factor, 0), 1)
        
        # Add some seasonal/regional variation (dummy logic)
        seasonal_adjustment = self._get_seasonal_adjustment(risk_type)
        final_score = min(max(final_score + seasonal_adjustment, 0), 1)
        
        return final_score
    
    def _get_seasonal_adjustment(self, risk_type: str) -> float:
        """Add seasonal variation to risk scores (dummy logic)"""
        current_month = datetime.now().month
        
        # Simple seasonal adjustments
        if risk_type == "heatwave" and current_month in [6, 7, 8]:  # Summer
            return random.uniform(0.1, 0.2)
        elif risk_type == "flood" and current_month in [3, 4, 5]:  # Spring
            return random.uniform(0.05, 0.15)
        elif risk_type == "drought" and current_month in [7, 8, 9]:  # Late summer
            return random.uniform(0.05, 0.15)
        elif risk_type == "storm" and current_month in [9, 10, 11]:  # Fall
            return random.uniform(0.05, 0.15)
        
        return random.uniform(-0.05, 0.05)  # Small random variation
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level label"""
        if risk_score >= self.risk_thresholds["high"]:
            return "critical" if risk_score >= 0.9 else "high"
        elif risk_score >= self.risk_thresholds["medium"]:
            return "medium"
        else:
            return "low"
    
    def _calculate_confidence(self, climate_data: ClimateData, risk_type: str) -> float:
        """
        Calculate prediction confidence based on data quality and model certainty.
        This is dummy logic that would be replaced with actual model confidence metrics.
        """
        # Base confidence
        base_confidence = 0.75
        
        # Adjust based on data completeness (all fields present = higher confidence)
        data_completeness = 1.0  # All required fields are present
        
        # Adjust based on extreme values (more extreme = potentially less reliable)
        extremeness_penalty = 0
        if climate_data.temperature > 45 or climate_data.temperature < -20:
            extremeness_penalty += 0.1
        if climate_data.precipitation > 200:
            extremeness_penalty += 0.1
        if climate_data.wind_speed > 80:
            extremeness_penalty += 0.1
        
        # Add some randomness for realism
        random_factor = random.uniform(0.9, 1.1)
        
        confidence = (base_confidence * data_completeness - extremeness_penalty) * random_factor
        return min(max(confidence, 0.3), 0.95)  # Keep between 30% and 95%
    
    async def get_historical_trends(self, region: Region, risk_type: str, days: int = 30):
        """
        Get historical risk trends for a region.
        This would query actual historical data in a real implementation.
        """
        # Generate mock historical data
        trends = []
        base_date = datetime.utcnow() - timedelta(days=days)
        
        for i in range(days):
            date = base_date + timedelta(days=i)
            # Generate trending data with some pattern
            trend_factor = math.sin(i * 0.2) * 0.2 + 0.5  # Sine wave pattern
            risk_score = max(0.1, min(0.9, trend_factor + random.uniform(-0.1, 0.1)))
            
            trends.append({
                "date": date.isoformat(),
                "risk_score": round(risk_score, 3),
                "risk_level": self._get_risk_level(risk_score)
            })
        
        return trends
    
    def get_risk_factors_explanation(self, risk_type: str) -> dict:
        """Get explanation of factors that influence a specific risk type"""
        explanations = {
            "flood": {
                "primary_factors": ["Heavy precipitation", "High humidity", "Strong winds"],
                "description": "Flood risk increases with heavy rainfall, high humidity, and strong winds that can cause storm surges.",
                "prevention_tips": ["Monitor weather alerts", "Prepare evacuation routes", "Secure property"]
            },
            "drought": {
                "primary_factors": ["Low precipitation", "High temperature", "Low humidity"],
                "description": "Drought risk increases with prolonged periods of low rainfall and high temperatures.",
                "prevention_tips": ["Water conservation", "Drought-resistant crops", "Water storage"]
            },
            "heatwave": {
                "primary_factors": ["High temperature", "High humidity", "Low wind"],
                "description": "Heatwave risk increases with sustained high temperatures, especially with high humidity.",
                "prevention_tips": ["Stay hydrated", "Avoid outdoor activities", "Use cooling centers"]
            },
            "wildfire": {
                "primary_factors": ["High temperature", "Low precipitation", "Strong winds"],
                "description": "Wildfire risk increases with hot, dry conditions and strong winds that can spread fires.",
                "prevention_tips": ["Clear vegetation", "Fire-resistant landscaping", "Emergency evacuation plans"]
            },
            "storm": {
                "primary_factors": ["Strong winds", "Heavy precipitation", "Temperature changes"],
                "description": "Storm risk increases with strong winds, heavy precipitation, and rapid temperature changes.",
                "prevention_tips": ["Secure outdoor items", "Emergency supplies", "Safe shelter areas"]
            }
        }
        
        return explanations.get(risk_type, {
            "primary_factors": ["Various climate conditions"],
            "description": "Risk assessment based on multiple climate factors.",
            "prevention_tips": ["Stay informed", "Follow local guidance", "Prepare emergency plans"]
        })
