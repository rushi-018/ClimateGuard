from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.actions import ActionResponse, ActionPriority, ActionCategory
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Mock adaptive strategies database
MOCK_ACTIONS = [
    {
        "id": 1,
        "title": "Emergency Cooling Centers",
        "description": "Activate public cooling centers during extreme heat events to protect vulnerable populations.",
        "category": ActionCategory.RESPONSE,
        "priority": ActionPriority.CRITICAL,
        "risk_types": ["heatwave"],
        "timeline": "Immediate (0-24 hours)",
        "resources_needed": ["Public facilities", "Staff", "Transportation", "Medical supplies"],
        "effectiveness": 0.85
    },
    {
        "id": 2,
        "title": "Flood Barrier Deployment",
        "description": "Deploy temporary flood barriers and sandbags in high-risk areas before predicted flooding.",
        "category": ActionCategory.PREPARATION,
        "priority": ActionPriority.HIGH,
        "risk_types": ["flood"],
        "timeline": "24-48 hours",
        "resources_needed": ["Sandbags", "Barriers", "Heavy machinery", "Personnel"],
        "effectiveness": 0.75
    },
    {
        "id": 3,
        "title": "Water Conservation Measures",
        "description": "Implement mandatory water restrictions and promote conservation practices during drought conditions.",
        "category": ActionCategory.MITIGATION,
        "priority": ActionPriority.MEDIUM,
        "risk_types": ["drought"],
        "timeline": "1-7 days",
        "resources_needed": ["Public communication", "Enforcement", "Alternative water sources"],
        "effectiveness": 0.65
    },
    {
        "id": 4,
        "title": "Evacuation Planning",
        "description": "Prepare and execute evacuation plans for areas at critical risk of multiple climate hazards.",
        "category": ActionCategory.PREPARATION,
        "priority": ActionPriority.CRITICAL,
        "risk_types": ["flood", "wildfire", "storm"],
        "timeline": "12-72 hours",
        "resources_needed": ["Transportation", "Shelters", "Communication systems", "Emergency services"],
        "effectiveness": 0.90
    },
    {
        "id": 5,
        "title": "Agricultural Support",
        "description": "Provide drought-resistant seeds and irrigation support to farmers in affected areas.",
        "category": ActionCategory.RECOVERY,
        "priority": ActionPriority.MEDIUM,
        "risk_types": ["drought"],
        "timeline": "1-4 weeks",
        "resources_needed": ["Seeds", "Irrigation equipment", "Financial support", "Technical expertise"],
        "effectiveness": 0.70
    },
    {
        "id": 6,
        "title": "Early Warning Systems",
        "description": "Enhance weather monitoring and alert systems to provide timely warnings to communities.",
        "category": ActionCategory.PREPARATION,
        "priority": ActionPriority.HIGH,
        "risk_types": ["flood", "drought", "heatwave", "storm", "wildfire"],
        "timeline": "Ongoing",
        "resources_needed": ["Monitoring equipment", "Communication infrastructure", "Staff training"],
        "effectiveness": 0.80
    },
    {
        "id": 7,
        "title": "Infrastructure Hardening",
        "description": "Upgrade critical infrastructure to withstand extreme weather events and climate impacts.",
        "category": ActionCategory.MITIGATION,
        "priority": ActionPriority.HIGH,
        "risk_types": ["flood", "heatwave", "storm"],
        "timeline": "3-12 months",
        "resources_needed": ["Construction materials", "Engineering expertise", "Significant funding"],
        "effectiveness": 0.85
    },
    {
        "id": 8,
        "title": "Community Education",
        "description": "Educate communities about climate risks and personal preparedness measures.",
        "category": ActionCategory.PREPARATION,
        "priority": ActionPriority.MEDIUM,
        "risk_types": ["flood", "drought", "heatwave", "wildfire", "storm"],
        "timeline": "Ongoing",
        "resources_needed": ["Educational materials", "Community outreach", "Training programs"],
        "effectiveness": 0.60
    }
]

@router.get("/actions", response_model=List[ActionResponse])
async def get_adaptive_actions(
    risk_type: Optional[str] = Query(None, description="Filter by risk type"),
    priority: Optional[ActionPriority] = Query(None, description="Filter by priority level"),
    category: Optional[ActionCategory] = Query(None, description="Filter by action category"),
    limit: int = Query(20, description="Maximum number of actions to return"),
    db: Session = Depends(get_db)
):
    """
    Get adaptive climate action strategies.
    
    - **risk_type**: Filter actions by specific climate risk type
    - **priority**: Filter by priority level (low, medium, high, critical)
    - **category**: Filter by action category (preparation, response, recovery, mitigation)
    - **limit**: Maximum number of actions to return
    """
    try:
        logger.info(f"Actions request - risk_type: {risk_type}, priority: {priority}, category: {category}")
        
        filtered_actions = MOCK_ACTIONS.copy()
        
        # Apply filters
        if risk_type:
            filtered_actions = [
                action for action in filtered_actions 
                if risk_type in action["risk_types"]
            ]
        
        if priority:
            filtered_actions = [
                action for action in filtered_actions 
                if action["priority"] == priority
            ]
        
        if category:
            filtered_actions = [
                action for action in filtered_actions 
                if action["category"] == category
            ]
        
        # Apply limit
        filtered_actions = filtered_actions[:limit]
        
        # Convert to response models
        response_actions = [ActionResponse(**action) for action in filtered_actions]
        
        logger.info(f"Returning {len(response_actions)} adaptive actions")
        return response_actions
        
    except Exception as e:
        logger.error(f"Actions retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve actions: {str(e)}")

@router.get("/actions/{action_id}", response_model=ActionResponse)
async def get_action_details(
    action_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific action"""
    try:
        action = next((a for a in MOCK_ACTIONS if a["id"] == action_id), None)
        
        if not action:
            raise HTTPException(status_code=404, detail="Action not found")
        
        return ActionResponse(**action)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Action details error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/actions/categories", response_model=List[str])
async def get_action_categories():
    """Get all available action categories"""
    return [category.value for category in ActionCategory]

@router.get("/actions/priorities", response_model=List[str])
async def get_action_priorities():
    """Get all available priority levels"""
    return [priority.value for priority in ActionPriority]
