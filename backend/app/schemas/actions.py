from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class ActionPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ActionCategory(str, Enum):
    PREPARATION = "preparation"
    RESPONSE = "response"
    RECOVERY = "recovery"
    MITIGATION = "mitigation"

class ActionResponse(BaseModel):
    id: int
    title: str = Field(..., description="Action title")
    description: str = Field(..., description="Detailed description")
    category: ActionCategory = Field(..., description="Action category")
    priority: ActionPriority = Field(..., description="Priority level")
    risk_types: List[str] = Field(..., description="Applicable risk types")
    timeline: str = Field(..., description="Expected timeline")
    resources_needed: List[str] = Field(..., description="Required resources")
    effectiveness: float = Field(..., description="Effectiveness score 0-1")
