"""
Script to seed the database with initial data for development and testing.
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta
import random

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine
from app.models.region import Region
from app.models.prediction import Prediction, RiskScore, RiskType, RiskLevel

# Sample regions data
SAMPLE_REGIONS = [
    {"name": "New York", "country": "USA", "latitude": 40.7128, "longitude": -74.0060, "population": 8400000},
    {"name": "London", "country": "UK", "latitude": 51.5074, "longitude": -0.1278, "population": 9000000},
    {"name": "Tokyo", "country": "Japan", "latitude": 35.6762, "longitude": 139.6503, "population": 14000000},
    {"name": "Sydney", "country": "Australia", "latitude": -33.8688, "longitude": 151.2093, "population": 5300000},
    {"name": "Mumbai", "country": "India", "latitude": 19.0760, "longitude": 72.8777, "population": 20400000},
    {"name": "São Paulo", "country": "Brazil", "latitude": -23.5505, "longitude": -46.6333, "population": 12300000},
    {"name": "Cairo", "country": "Egypt", "latitude": 30.0444, "longitude": 31.2357, "population": 10100000},
    {"name": "Lagos", "country": "Nigeria", "latitude": 6.5244, "longitude": 3.3792, "population": 15300000},
    {"name": "Bangkok", "country": "Thailand", "latitude": 13.7563, "longitude": 100.5018, "population": 10500000},
    {"name": "Mexico City", "country": "Mexico", "latitude": 19.4326, "longitude": -99.1332, "population": 9200000},
]

def seed_regions(db):
    """Seed regions table with sample data"""
    print("Seeding regions...")
    
    for region_data in SAMPLE_REGIONS:
        # Check if region already exists
        existing = db.query(Region).filter(Region.name == region_data["name"]).first()
        if not existing:
            region = Region(**region_data)
            db.add(region)
    
    db.commit()
    print(f"Seeded {len(SAMPLE_REGIONS)} regions")

def seed_risk_scores(db):
    """Seed risk scores for all regions"""
    print("Seeding risk scores...")
    
    regions = db.query(Region).all()
    risk_types = [RiskType.FLOOD, RiskType.DROUGHT, RiskType.HEATWAVE, RiskType.WILDFIRE, RiskType.STORM]
    
    for region in regions:
        for risk_type in risk_types:
            # Check if risk score already exists
            existing = db.query(RiskScore).filter(
                RiskScore.region_id == region.id,
                RiskScore.risk_type == risk_type
            ).first()
            
            if not existing:
                current_score = random.uniform(0.1, 0.9)
                historical_avg = random.uniform(0.2, 0.8)
                
                # Determine trend
                if current_score > historical_avg + 0.1:
                    trend = "increasing"
                elif current_score < historical_avg - 0.1:
                    trend = "decreasing"
                else:
                    trend = "stable"
                
                risk_score = RiskScore(
                    region_id=region.id,
                    risk_type=risk_type,
                    current_score=current_score,
                    historical_avg=historical_avg,
                    trend=trend
                )
                db.add(risk_score)
    
    db.commit()
    print(f"Seeded risk scores for {len(regions)} regions")

def seed_predictions(db):
    """Seed predictions table with sample historical data"""
    print("Seeding predictions...")
    
    regions = db.query(Region).all()
    risk_types = [RiskType.FLOOD, RiskType.DROUGHT, RiskType.HEATWAVE, RiskType.WILDFIRE, RiskType.STORM]
    
    # Generate predictions for the last 30 days
    for region in regions:
        for i in range(30):
            prediction_date = datetime.utcnow() - timedelta(days=i)
            valid_until = prediction_date + timedelta(days=1)
            
            # Generate 1-3 predictions per day per region
            num_predictions = random.randint(1, 3)
            
            for _ in range(num_predictions):
                risk_type = random.choice(risk_types)
                risk_score = random.uniform(0.1, 0.9)
                
                # Determine risk level
                if risk_score >= 0.8:
                    risk_level = RiskLevel.CRITICAL
                elif risk_score >= 0.6:
                    risk_level = RiskLevel.HIGH
                elif risk_score >= 0.4:
                    risk_level = RiskLevel.MEDIUM
                else:
                    risk_level = RiskLevel.LOW
                
                prediction = Prediction(
                    region_id=region.id,
                    risk_type=risk_type,
                    risk_score=risk_score,
                    risk_level=risk_level,
                    confidence=random.uniform(0.6, 0.95),
                    prediction_date=prediction_date,
                    valid_until=valid_until,
                    temperature=random.uniform(-10, 45),
                    precipitation=random.uniform(0, 100),
                    humidity=random.uniform(30, 95),
                    wind_speed=random.uniform(0, 80)
                )
                db.add(prediction)
    
    db.commit()
    print("Seeded historical predictions")

def main():
    """Main seeding function"""
    print("Starting database seeding...")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Seed data
        seed_regions(db)
        seed_risk_scores(db)
        seed_predictions(db)
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
