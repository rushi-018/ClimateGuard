/**
 * Action Recommendation Service for ClimateGuard
 * Provides intelligent, location-specific climate adaptation strategies and emergency preparedness plans
 */

import { economicIntelligence } from "./economic-intelligence";
import { locationIntelligence } from "./location-intelligence";
import { alertService } from "./alert-service";

export interface ActionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  priority: "high" | "medium" | "low";
}

export interface ActionRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  urgency: "immediate" | "short-term" | "medium-term" | "long-term";
  difficulty: "easy" | "moderate" | "difficult" | "expert";
  cost: {
    range: "free" | "low" | "medium" | "high" | "enterprise";
    estimate?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  impact: {
    environmental: number; // 0-100 score
    economic: number; // 0-100 score
    social: number; // 0-100 score
    overall: number; // 0-100 score
  };
  steps: {
    id: string;
    title: string;
    description: string;
    estimatedTime: string;
    resources: string[];
  }[];
  prerequisites?: string[];
  benefits: string[];
  risks: string[];
  location: {
    applicable: boolean;
    specificReasons: string[];
    localAdaptations?: string[];
  };
  sources: {
    type: "government" | "research" | "ngo" | "industry";
    title: string;
    url?: string;
  }[];
  successMetrics: {
    metric: string;
    target: string;
    timeframe: string;
  }[];
}

export interface EmergencyPlan {
  id: string;
  title: string;
  description: string;
  triggerConditions: string[];
  severity: "watch" | "warning" | "emergency" | "disaster";
  phases: {
    phase: "preparation" | "response" | "recovery";
    actions: {
      id: string;
      action: string;
      timeframe: string;
      responsible: string;
      critical: boolean;
    }[];
  }[];
  resources: {
    type: "contact" | "supply" | "location" | "information";
    name: string;
    details: string;
    priority: "essential" | "important" | "helpful";
  }[];
  communication: {
    contacts: { name: string; number: string; type: string }[];
    channels: string[];
    templates: { situation: string; message: string }[];
  };
}

export interface PersonalizedRecommendations {
  profile: {
    location: { lat: number; lng: number; address: string };
    risks: string[];
    priorities: string[];
    constraints: { budget: string; time: string; expertise: string };
  };
  immediate: ActionRecommendation[];
  shortTerm: ActionRecommendation[];
  longTerm: ActionRecommendation[];
  emergency: EmergencyPlan[];
  progress: {
    completed: string[];
    inProgress: string[];
    planned: string[];
  };
}

class ActionRecommendationService {
  private static instance: ActionRecommendationService;
  private actionCategories: ActionCategory[] = [];
  private baseRecommendations: ActionRecommendation[] = [];
  private emergencyPlans: EmergencyPlan[] = [];

  constructor() {
    this.initializeCategories();
    this.initializeBaseRecommendations();
    this.initializeEmergencyPlans();
  }

  static getInstance(): ActionRecommendationService {
    if (!ActionRecommendationService.instance) {
      ActionRecommendationService.instance = new ActionRecommendationService();
    }
    return ActionRecommendationService.instance;
  }

  private initializeCategories(): void {
    this.actionCategories = [
      {
        id: "home-adaptation",
        name: "Home & Property",
        description: "Protect and adapt your home for climate resilience",
        icon: "🏠",
        priority: "high",
      },
      {
        id: "energy-efficiency",
        name: "Energy Efficiency",
        description: "Reduce energy consumption and costs",
        icon: "⚡",
        priority: "high",
      },
      {
        id: "water-management",
        name: "Water Management",
        description: "Conservation and flood protection strategies",
        icon: "💧",
        priority: "high",
      },
      {
        id: "emergency-prep",
        name: "Emergency Preparedness",
        description: "Be ready for climate emergencies",
        icon: "🚨",
        priority: "high",
      },
      {
        id: "transportation",
        name: "Sustainable Transport",
        description: "Climate-friendly mobility options",
        icon: "🚗",
        priority: "medium",
      },
      {
        id: "community",
        name: "Community Action",
        description: "Collective climate resilience initiatives",
        icon: "👥",
        priority: "medium",
      },
      {
        id: "investment",
        name: "Climate Investments",
        description: "Financial strategies for climate adaptation",
        icon: "💰",
        priority: "medium",
      },
      {
        id: "health-safety",
        name: "Health & Safety",
        description: "Protect health from climate impacts",
        icon: "🏥",
        priority: "high",
      },
    ];
  }

  private initializeBaseRecommendations(): void {
    this.baseRecommendations = [
      // Home Adaptation
      {
        id: "install-smart-thermostat",
        title: "Install Smart Thermostat",
        description:
          "Optimize heating and cooling with intelligent temperature control",
        category: "energy-efficiency",
        priority: "high",
        urgency: "short-term",
        difficulty: "easy",
        cost: {
          range: "low",
          estimate: { min: 100, max: 300, currency: "USD" },
        },
        impact: {
          environmental: 75,
          economic: 80,
          social: 60,
          overall: 72,
        },
        steps: [
          {
            id: "research",
            title: "Research Compatible Models",
            description:
              "Find smart thermostats compatible with your HVAC system",
            estimatedTime: "1-2 hours",
            resources: ["Internet research", "HVAC system manual"],
          },
          {
            id: "purchase",
            title: "Purchase Device",
            description: "Buy from reputable retailer with good warranty",
            estimatedTime: "30 minutes",
            resources: ["Credit card", "Transportation"],
          },
          {
            id: "install",
            title: "Install and Configure",
            description:
              "Follow manufacturer instructions for installation and setup",
            estimatedTime: "2-3 hours",
            resources: ["Basic tools", "WiFi connection", "Mobile app"],
          },
        ],
        benefits: [
          "Reduce energy bills by 10-15%",
          "Improve comfort with consistent temperatures",
          "Remote control and scheduling",
          "Integration with other smart home devices",
        ],
        risks: [
          "Initial installation complexity",
          "Potential compatibility issues",
          "Privacy concerns with data collection",
        ],
        location: {
          applicable: true,
          specificReasons: [
            "Universal applicability for homes with HVAC systems",
          ],
          localAdaptations: ["Consider local utility rebate programs"],
        },
        sources: [
          {
            type: "government",
            title: "ENERGY STAR Smart Thermostats",
            url: "https://www.energystar.gov/products/heating_cooling/smart_thermostats",
          },
        ],
        successMetrics: [
          {
            metric: "Energy consumption reduction",
            target: "10-15% decrease",
            timeframe: "3 months",
          },
          {
            metric: "Cost savings",
            target: "$100-200 annually",
            timeframe: "12 months",
          },
        ],
      },
      {
        id: "rainwater-harvesting",
        title: "Install Rainwater Harvesting System",
        description:
          "Collect and store rainwater for irrigation and emergency use",
        category: "water-management",
        priority: "medium",
        urgency: "medium-term",
        difficulty: "moderate",
        cost: {
          range: "medium",
          estimate: { min: 500, max: 2000, currency: "USD" },
        },
        impact: {
          environmental: 85,
          economic: 70,
          social: 75,
          overall: 77,
        },
        steps: [
          {
            id: "assess",
            title: "Assess Roof and Storage Needs",
            description:
              "Calculate roof catchment area and water storage requirements",
            estimatedTime: "2-3 hours",
            resources: ["Measuring tape", "Calculator", "Weather data"],
          },
          {
            id: "design",
            title: "Design System",
            description:
              "Plan gutter connections, storage tanks, and distribution",
            estimatedTime: "4-6 hours",
            resources: ["Graph paper", "System design guides"],
          },
          {
            id: "install",
            title: "Install Components",
            description: "Set up gutters, downspouts, tanks, and filtration",
            estimatedTime: "1-2 days",
            resources: ["Tools", "Materials", "Possible contractor help"],
          },
        ],
        benefits: [
          "Reduce water bills",
          "Emergency water supply",
          "Reduce stormwater runoff",
          "Support garden irrigation",
        ],
        risks: [
          "Initial investment required",
          "Maintenance needs",
          "Local regulations may apply",
        ],
        location: {
          applicable: true,
          specificReasons: ["Beneficial in areas with seasonal rainfall"],
          localAdaptations: ["Check local building codes and permits"],
        },
        sources: [
          {
            type: "ngo",
            title: "Rainwater Harvesting Guide",
            url: "https://www.epa.gov/soakuptherain/rainwater-harvesting",
          },
        ],
        successMetrics: [
          {
            metric: "Water collected",
            target: "500-2000 gallons per year",
            timeframe: "12 months",
          },
          {
            metric: "Water bill reduction",
            target: "15-25% decrease",
            timeframe: "12 months",
          },
        ],
      },
      {
        id: "emergency-kit",
        title: "Build Comprehensive Emergency Kit",
        description:
          "Prepare essential supplies for climate-related emergencies",
        category: "emergency-prep",
        priority: "critical",
        urgency: "immediate",
        difficulty: "easy",
        cost: {
          range: "low",
          estimate: { min: 200, max: 500, currency: "USD" },
        },
        impact: {
          environmental: 40,
          economic: 60,
          social: 95,
          overall: 65,
        },
        steps: [
          {
            id: "inventory",
            title: "Inventory Current Supplies",
            description: "Check what emergency supplies you already have",
            estimatedTime: "1 hour",
            resources: ["Notebook", "Checklist"],
          },
          {
            id: "purchase",
            title: "Purchase Missing Items",
            description:
              "Buy essential items like water, food, first aid supplies",
            estimatedTime: "2-3 hours",
            resources: [
              "Shopping list",
              "Transportation",
              "Storage containers",
            ],
          },
          {
            id: "organize",
            title: "Organize and Store",
            description: "Pack supplies in accessible, waterproof containers",
            estimatedTime: "2 hours",
            resources: ["Storage containers", "Labels", "Inventory list"],
          },
        ],
        benefits: [
          "Ready for emergencies",
          "Peace of mind",
          "Potential to help neighbors",
          "Insurance against supply disruptions",
        ],
        risks: [
          "Items may expire if not maintained",
          "Storage space requirements",
          "Initial cost investment",
        ],
        location: {
          applicable: true,
          specificReasons: [
            "Essential for all locations prone to climate events",
          ],
          localAdaptations: [
            "Customize based on local hazards (floods, hurricanes, etc.)",
          ],
        },
        sources: [
          {
            type: "government",
            title: "Ready.gov Emergency Kit",
            url: "https://www.ready.gov/kit",
          },
        ],
        successMetrics: [
          {
            metric: "Kit completeness",
            target: "100% of essential items",
            timeframe: "1 month",
          },
          {
            metric: "Regular maintenance",
            target: "Quarterly inventory check",
            timeframe: "Ongoing",
          },
        ],
      },
      {
        id: "solar-panels",
        title: "Install Residential Solar Panels",
        description: "Generate clean energy and reduce electricity costs",
        category: "energy-efficiency",
        priority: "high",
        urgency: "medium-term",
        difficulty: "expert",
        cost: {
          range: "high",
          estimate: { min: 15000, max: 30000, currency: "USD" },
        },
        impact: {
          environmental: 95,
          economic: 85,
          social: 70,
          overall: 83,
        },
        steps: [
          {
            id: "assessment",
            title: "Energy Assessment",
            description: "Evaluate current energy usage and solar potential",
            estimatedTime: "1-2 weeks",
            resources: [
              "Energy bills",
              "Professional consultation",
              "Roof inspection",
            ],
          },
          {
            id: "quotes",
            title: "Get Installation Quotes",
            description: "Compare quotes from certified solar installers",
            estimatedTime: "2-3 weeks",
            resources: [
              "Multiple installer consultations",
              "Financing options",
            ],
          },
          {
            id: "permits",
            title: "Obtain Permits",
            description: "Secure necessary permits and utility approvals",
            estimatedTime: "2-4 weeks",
            resources: ["Permit applications", "Utility coordination"],
          },
          {
            id: "installation",
            title: "Professional Installation",
            description: "Complete system installation and inspection",
            estimatedTime: "1-3 days",
            resources: ["Professional installation team", "System components"],
          },
        ],
        benefits: [
          "Significant electricity bill reduction",
          "Increase home value",
          "Environmental impact reduction",
          "Energy independence",
          "Federal and local tax incentives",
        ],
        risks: [
          "High upfront investment",
          "Weather-dependent generation",
          "Roof condition requirements",
          "Technology obsolescence risk",
        ],
        location: {
          applicable: true,
          specificReasons: ["Most effective in areas with good solar exposure"],
          localAdaptations: [
            "Consider local solar incentives and net metering policies",
          ],
        },
        sources: [
          {
            type: "government",
            title: "Database of State Incentives for Renewables",
            url: "https://www.dsireusa.org/",
          },
        ],
        successMetrics: [
          {
            metric: "Energy production",
            target: "80-120% of home consumption",
            timeframe: "12 months",
          },
          {
            metric: "Payback period",
            target: "6-10 years",
            timeframe: "Long-term",
          },
        ],
      },
    ];
  }

  private initializeEmergencyPlans(): void {
    this.emergencyPlans = [
      {
        id: "hurricane-plan",
        title: "Hurricane Emergency Plan",
        description:
          "Comprehensive plan for hurricane preparation, response, and recovery",
        triggerConditions: [
          "Hurricane watch issued for your area",
          "Sustained winds approaching 74+ mph",
          "Storm surge warnings",
          "Evacuation orders issued",
        ],
        severity: "disaster",
        phases: [
          {
            phase: "preparation",
            actions: [
              {
                id: "monitor",
                action: "Monitor weather forecasts and official warnings",
                timeframe: "72+ hours before",
                responsible: "All family members",
                critical: true,
              },
              {
                id: "supplies",
                action: "Check and replenish emergency supplies",
                timeframe: "48-72 hours before",
                responsible: "Designated family member",
                critical: true,
              },
              {
                id: "secure-property",
                action: "Secure outdoor furniture, install storm shutters",
                timeframe: "24-48 hours before",
                responsible: "All adults",
                critical: true,
              },
              {
                id: "evacuation-ready",
                action: "Pack evacuation bags and prepare transportation",
                timeframe: "12-24 hours before",
                responsible: "All family members",
                critical: true,
              },
            ],
          },
          {
            phase: "response",
            actions: [
              {
                id: "shelter-in-place",
                action: "Move to designated safe room away from windows",
                timeframe: "During storm",
                responsible: "All family members",
                critical: true,
              },
              {
                id: "communication",
                action: "Maintain contact with emergency services and family",
                timeframe: "During storm",
                responsible: "Designated communicator",
                critical: true,
              },
              {
                id: "avoid-flood-water",
                action: "Never walk or drive through flood water",
                timeframe: "During and after",
                responsible: "All family members",
                critical: true,
              },
            ],
          },
          {
            phase: "recovery",
            actions: [
              {
                id: "safety-check",
                action: "Check for injuries and structural damage",
                timeframe: "Immediately after",
                responsible: "All adults",
                critical: true,
              },
              {
                id: "utility-safety",
                action: "Check for gas leaks, electrical hazards, water damage",
                timeframe: "Within hours",
                responsible: "Trained adult",
                critical: true,
              },
              {
                id: "document-damage",
                action: "Photograph damage for insurance claims",
                timeframe: "Within 24 hours",
                responsible: "Designated documenter",
                critical: false,
              },
            ],
          },
        ],
        resources: [
          {
            type: "contact",
            name: "Emergency Services",
            details: "911",
            priority: "essential",
          },
          {
            type: "contact",
            name: "Local Emergency Management",
            details: "Check local government website",
            priority: "essential",
          },
          {
            type: "supply",
            name: "Emergency Kit",
            details: "Water, food, first aid, flashlights, radio, batteries",
            priority: "essential",
          },
          {
            type: "information",
            name: "NOAA Weather Radio",
            details: "Official weather updates and warnings",
            priority: "essential",
          },
        ],
        communication: {
          contacts: [
            { name: "Emergency Services", number: "911", type: "emergency" },
            {
              name: "Family Rally Point",
              number: "Designated contact",
              type: "coordination",
            },
            {
              name: "Insurance Company",
              number: "Policy documents",
              type: "recovery",
            },
          ],
          channels: [
            "NOAA Weather Radio",
            "Local news",
            "Emergency alert system",
            "Social media",
          ],
          templates: [
            {
              situation: "Safe and sheltering",
              message:
                "We are safe and sheltering in place at [location]. Will update when conditions improve.",
            },
            {
              situation: "Evacuating",
              message:
                "We are evacuating to [destination]. Expected to arrive by [time]. Will update upon arrival.",
            },
          ],
        },
      },
    ];
  }

  async getPersonalizedRecommendations(
    lat: number,
    lng: number,
    preferences: {
      budget?: string;
      timeAvailable?: string;
      expertise?: string;
      priorities?: string[];
    } = {}
  ): Promise<PersonalizedRecommendations> {
    try {
      // Get location-specific data
      const locationData =
        locationIntelligence.getCurrentData()?.riskAssessment;
      const economicData = await economicIntelligence.getCountryEconomicData(
        "US"
      ); // Default to US for now
      const alerts = alertService.getAllAlerts();

      // Get high-risk categories based on location
      const highRiskCategories = this.identifyHighRiskCategories(
        locationData,
        alerts
      );

      // Filter and prioritize recommendations
      const recommendations = this.baseRecommendations.filter((rec) => {
        // Check if recommendation is applicable to location
        return rec.location.applicable;
      });

      // Sort by priority and location relevance
      const sortedRecommendations = this.prioritizeRecommendations(
        recommendations,
        highRiskCategories,
        preferences
      );

      // Categorize by urgency
      const immediate = sortedRecommendations
        .filter((r) => r.urgency === "immediate")
        .slice(0, 5);
      const shortTerm = sortedRecommendations
        .filter((r) => r.urgency === "short-term")
        .slice(0, 8);
      const longTerm = sortedRecommendations
        .filter((r) => r.urgency === "medium-term" || r.urgency === "long-term")
        .slice(0, 10);

      // Get relevant emergency plans
      const relevantEmergencyPlans = this.getRelevantEmergencyPlans(
        locationData,
        alerts
      );

      return {
        profile: {
          location: {
            lat,
            lng,
            address: locationData?.location?.address?.city || "Unknown",
          },
          risks: highRiskCategories,
          priorities: preferences.priorities || [],
          constraints: {
            budget: preferences.budget || "medium",
            time: preferences.timeAvailable || "moderate",
            expertise: preferences.expertise || "beginner",
          },
        },
        immediate,
        shortTerm,
        longTerm,
        emergency: relevantEmergencyPlans,
        progress: {
          completed: [],
          inProgress: [],
          planned: [],
        },
      };
    } catch (error) {
      console.error("Error generating personalized recommendations:", error);

      // Return basic recommendations if location services fail
      return {
        profile: {
          location: { lat, lng, address: "Location services unavailable" },
          risks: ["general"],
          priorities: [],
          constraints: {
            budget: "medium",
            time: "moderate",
            expertise: "beginner",
          },
        },
        immediate: this.baseRecommendations
          .filter((r) => r.urgency === "immediate")
          .slice(0, 3),
        shortTerm: this.baseRecommendations
          .filter((r) => r.urgency === "short-term")
          .slice(0, 5),
        longTerm: this.baseRecommendations
          .filter(
            (r) => r.urgency === "medium-term" || r.urgency === "long-term"
          )
          .slice(0, 7),
        emergency: this.emergencyPlans.slice(0, 2),
        progress: {
          completed: [],
          inProgress: [],
          planned: [],
        },
      };
    }
  }

  private identifyHighRiskCategories(
    locationData: any,
    alerts: any[]
  ): string[] {
    const risks: string[] = [];

    if (locationData?.riskLevel > 70) {
      risks.push("emergency-prep", "home-adaptation");
    }

    if (locationData?.vulnerabilities?.floodRisk > 60) {
      risks.push("water-management", "emergency-prep");
    }

    if (locationData?.vulnerabilities?.heatRisk > 70) {
      risks.push("energy-efficiency", "health-safety");
    }

    if (alerts.some((alert) => alert.severity === "critical")) {
      risks.push("emergency-prep");
    }

    return risks.length > 0 ? risks : ["general"];
  }

  private prioritizeRecommendations(
    recommendations: ActionRecommendation[],
    highRiskCategories: string[],
    preferences: any
  ): ActionRecommendation[] {
    return recommendations.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Boost score for high-risk category match
      if (highRiskCategories.includes(a.category)) scoreA += 50;
      if (highRiskCategories.includes(b.category)) scoreB += 50;

      // Priority weight
      const priorityWeight = { critical: 40, high: 30, medium: 20, low: 10 };
      scoreA += priorityWeight[a.priority];
      scoreB += priorityWeight[b.priority];

      // Impact weight
      scoreA += a.impact.overall * 0.3;
      scoreB += b.impact.overall * 0.3;

      // Budget constraint
      if (preferences.budget === "low" && a.cost.range === "free") scoreA += 20;
      if (preferences.budget === "low" && b.cost.range === "free") scoreB += 20;

      return scoreB - scoreA;
    });
  }

  private getRelevantEmergencyPlans(
    locationData: any,
    alerts: any[]
  ): EmergencyPlan[] {
    // For now, return all plans - in production this would be filtered by location
    return this.emergencyPlans;
  }

  getActionCategories(): ActionCategory[] {
    return this.actionCategories;
  }

  getRecommendationById(id: string): ActionRecommendation | null {
    return this.baseRecommendations.find((rec) => rec.id === id) || null;
  }

  getEmergencyPlanById(id: string): EmergencyPlan | null {
    return this.emergencyPlans.find((plan) => plan.id === id) || null;
  }

  async getRecommendationsByCategory(
    category: string
  ): Promise<ActionRecommendation[]> {
    return this.baseRecommendations.filter((rec) => rec.category === category);
  }
}

// Export singleton instance
export const actionRecommendation = ActionRecommendationService.getInstance();
