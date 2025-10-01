from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class RiskType(enum.Enum):
    FLOOD = "flood"
    DROUGHT = "drought"
    HEATWAVE = "heatwave"
    WILDFIRE = "wildfire"
    STORM = "storm"

class RiskLevel(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    risk_type = Column(Enum(RiskType), nullable=False)
    risk_score = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_level = Column(Enum(RiskLevel), nullable=False)
    confidence = Column(Float, default=0.8)  # Prediction confidence
    prediction_date = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=False)
    temperature = Column(Float)  # Celsius
    precipitation = Column(Float)  # mm
    humidity = Column(Float)  # percentage
    wind_speed = Column(Float)  # km/h
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    region = relationship("Region", back_populates="predictions")
    
    def __repr__(self):
        return f"<Prediction(region_id={self.region_id}, risk_type='{self.risk_type}', risk_score={self.risk_score})>"

class RiskScore(Base):
    __tablename__ = "risk_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    risk_type = Column(Enum(RiskType), nullable=False)
    current_score = Column(Float, nullable=False)  # 0.0 to 1.0
    historical_avg = Column(Float, default=0.0)
    trend = Column(String, default="stable")  # "increasing", "decreasing", "stable"
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    region = relationship("Region", back_populates="risk_scores")
    
    def __repr__(self):
        return f"<RiskScore(region_id={self.region_id}, risk_type='{self.risk_type}', score={self.current_score})>"
