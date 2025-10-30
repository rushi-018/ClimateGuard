/**
 * Climate Adaptation AI Advisor
 * Personalized action plans to help users adapt to climate risks
 */

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UserProfile {
  location: {
    city: string;
    lat: number;
    lon: number;
  };
  propertyType: "house" | "apartment" | "condo" | "mobile-home" | "other";
  ownership: "own" | "rent";
  householdSize: number;
  budget: "low" | "medium" | "high";
  primaryConcerns: string[]; // e.g., ["heat", "water-shortage", "floods", "energy-costs"]
  existingMeasures: string[]; // What they've already done
  preferredActions: string[]; // Types of actions they're willing to take
}

export interface AdaptationAction {
  id: string;
  title: string;
  description: string;
  category: "urgent" | "important" | "long-term";
  priority: number; // 1-10
  timeframe: "30-days" | "60-days" | "90-days" | "6-months" | "1-year";
  difficulty: "easy" | "medium" | "hard";
  cost: {
    amount: number;
    range: string; // "$50-$100"
    paybackPeriod?: string; // "6 months", "2 years"
  };
  impact: {
    waterSaved?: number; // gallons per year
    energySaved?: number; // kWh per year
    co2Reduced?: number; // kg per year
    moneySaved?: number; // $ per year
    resilienceScore?: number; // 0-100
  };
  steps: string[]; // How to implement
  resources: string[]; // Links, guides, contractors
  relatedRisks: string[]; // Which climate risks this addresses
  completed: boolean;
  completedAt?: Date;
}

export interface AdaptationPlan {
  id: string;
  userId: string;
  profile: UserProfile;
  generatedAt: Date;
  lastUpdated: Date;
  actions: AdaptationAction[];
  totalImpact: {
    waterSaved: number;
    energySaved: number;
    co2Reduced: number;
    moneySaved: number;
    resilienceScore: number;
  };
  progress: {
    completedActions: number;
    totalActions: number;
    percentComplete: number;
  };
}

// ============================================================================
// Risk Analysis
// ============================================================================

/**
 * Analyze location-specific climate risks
 */
export async function analyzeLocationRisks(location: {
  city: string;
  lat: number;
  lon: number;
}): Promise<{
  primaryRisks: string[];
  severity: { [risk: string]: number };
  trends: { [risk: string]: "increasing" | "stable" | "decreasing" };
}> {
  // Fetch risk predictions from your existing API
  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location),
    });

    const data = await response.json();

    const risks: { [key: string]: number } = {
      flood: data.flood_risk || 0,
      drought: data.drought_risk || 0,
      heatwave: data.heatwave_risk || 0,
      wildfire: data.wildfire_risk || 0,
      storm: data.storm_risk || 0,
    };

    // Determine primary risks (> 50%)
    const primaryRisks = Object.entries(risks)
      .filter(([_, score]) => score > 50)
      .map(([risk, _]) => risk);

    // Determine trends (simplified - in production, compare historical data)
    const trends: { [key: string]: "increasing" | "stable" | "decreasing" } =
      {};
    Object.keys(risks).forEach((risk) => {
      // Simplified: high risk = increasing, medium = stable, low = decreasing
      if (risks[risk] > 70) trends[risk] = "increasing";
      else if (risks[risk] > 40) trends[risk] = "stable";
      else trends[risk] = "decreasing";
    });

    return {
      primaryRisks,
      severity: risks,
      trends,
    };
  } catch (error) {
    console.error("Error analyzing location risks:", error);
    // Fallback to location-based heuristics
    return getFallbackRisks(location.city);
  }
}

function getFallbackRisks(city: string): {
  primaryRisks: string[];
  severity: { [risk: string]: number };
  trends: { [risk: string]: "increasing" | "stable" | "decreasing" };
} {
  const cityRisks: {
    [key: string]: {
      primary: string[];
      severity: { [risk: string]: number };
    };
  } = {
    Phoenix: {
      primary: ["heatwave", "drought", "wildfire"],
      severity: {
        heatwave: 85,
        drought: 80,
        wildfire: 70,
        flood: 15,
        storm: 25,
      },
    },
    Miami: {
      primary: ["flood", "storm", "heatwave"],
      severity: {
        flood: 80,
        storm: 75,
        heatwave: 60,
        drought: 20,
        wildfire: 10,
      },
    },
    "New York": {
      primary: ["flood", "storm"],
      severity: {
        flood: 65,
        storm: 70,
        heatwave: 45,
        drought: 30,
        wildfire: 15,
      },
    },
  };

  const defaultRisks = {
    primary: ["heatwave", "flood"],
    severity: { heatwave: 55, flood: 50, drought: 40, wildfire: 35, storm: 45 },
  };

  const risks = cityRisks[city] || defaultRisks;

  const trends: { [key: string]: "increasing" | "stable" | "decreasing" } = {};
  Object.keys(risks.severity).forEach((risk) => {
    trends[risk] = risks.severity[risk] > 60 ? "increasing" : "stable";
  });

  return {
    primaryRisks: risks.primary,
    severity: risks.severity,
    trends,
  };
}

// ============================================================================
// Action Recommendation (LLM-Powered)
// ============================================================================

/**
 * Generate personalized adaptation actions using LLM
 */
export async function generateAdaptationActions(
  profile: UserProfile,
  risks: {
    primaryRisks: string[];
    severity: { [risk: string]: number };
    trends: { [risk: string]: "increasing" | "stable" | "decreasing" };
  }
): Promise<AdaptationAction[]> {
  const prompt = `You are a climate adaptation expert helping a homeowner create an actionable plan to adapt to climate risks.

USER PROFILE:
- Location: ${profile.location.city}
- Property: ${profile.propertyType} (${profile.ownership})
- Household: ${profile.householdSize} people
- Budget: ${profile.budget}
- Primary Concerns: ${profile.primaryConcerns.join(", ")}
- Already Done: ${profile.existingMeasures.join(", ") || "Nothing yet"}

CLIMATE RISKS (0-100 scale):
${Object.entries(risks.severity)
  .map(([risk, score]) => `- ${risk}: ${score}/100 (${risks.trends[risk]})`)
  .join("\n")}

Primary Risks: ${risks.primaryRisks.join(", ")}

Generate a personalized climate adaptation plan with 8-12 specific actions across three timeframes:
1. URGENT (30 days) - 3-4 quick wins, low cost, high impact
2. IMPORTANT (60 days) - 3-4 medium-term projects, moderate investment
3. LONG-TERM (90+ days) - 2-4 major upgrades, higher cost but transformative

For each action, provide:
- Title (concise, actionable)
- Description (1-2 sentences)
- Category (urgent/important/long-term)
- Timeframe (30-days/60-days/90-days/6-months/1-year)
- Difficulty (easy/medium/hard)
- Cost estimate (specific number and range)
- Impact metrics:
  * waterSaved (gallons/year) if applicable
  * energySaved (kWh/year) if applicable
  * co2Reduced (kg/year) if applicable
  * moneySaved ($/year) if applicable
  * resilienceScore (0-100) - how much this improves climate resilience
- 3-5 implementation steps
- 2-3 resource links or recommendations
- Which climate risks this addresses

Prioritize actions that:
- Address the highest severity risks first
- Match the user's budget (${profile.budget})
- Are appropriate for ${profile.propertyType} and ${profile.ownership} status
- Don't duplicate what they've already done

Return ONLY valid JSON array of actions, no markdown formatting:
[
  {
    "title": "...",
    "description": "...",
    "category": "urgent",
    "timeframe": "30-days",
    "difficulty": "easy",
    "cost": {
      "amount": 150,
      "range": "$100-$200",
      "paybackPeriod": "6 months"
    },
    "impact": {
      "energySaved": 1200,
      "moneySaved": 180,
      "co2Reduced": 540,
      "resilienceScore": 25
    },
    "steps": ["Step 1", "Step 2", "Step 3"],
    "resources": ["Resource 1", "Resource 2"],
    "relatedRisks": ["heatwave"]
  }
]`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a climate adaptation expert. Return ONLY valid JSON arrays with no markdown formatting or explanatory text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content || "[]";

    // Clean up response (remove markdown code blocks if present)
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    }

    const actions = JSON.parse(cleanedResponse);

    // Add IDs and completion status
    return actions.map((action: any, index: number) => ({
      id: `action-${Date.now()}-${index}`,
      ...action,
      priority:
        action.category === "urgent"
          ? 10
          : action.category === "important"
          ? 5
          : 3,
      completed: false,
    }));
  } catch (error) {
    console.error("Error generating adaptation actions:", error);
    // Fallback to template-based actions
    return getTemplateActions(profile, risks);
  }
}

/**
 * Fallback template-based actions if LLM fails
 */
function getTemplateActions(
  profile: UserProfile,
  risks: {
    primaryRisks: string[];
    severity: { [risk: string]: number };
  }
): AdaptationAction[] {
  const actions: AdaptationAction[] = [];
  let idCounter = 0;

  // Heat-related actions
  if (risks.primaryRisks.includes("heatwave") || risks.severity.heatwave > 50) {
    actions.push({
      id: `action-${Date.now()}-${idCounter++}`,
      title: "Install Programmable Thermostat",
      description:
        "Smart thermostat learns your schedule and optimizes cooling efficiency, reducing energy waste.",
      category: "urgent",
      priority: 9,
      timeframe: "30-days",
      difficulty: "easy",
      cost: {
        amount: 150,
        range: "$100-$200",
        paybackPeriod: "1 year",
      },
      impact: {
        energySaved: 1200,
        moneySaved: 180,
        co2Reduced: 540,
        resilienceScore: 20,
      },
      steps: [
        "Research compatible thermostats (Nest, Ecobee, Honeywell)",
        "Purchase unit online or at hardware store",
        "Install yourself (1 hour) or hire electrician ($50-100)",
        "Connect to WiFi and configure schedule",
        "Monitor energy savings through app",
      ],
      resources: [
        "Energy Star thermostat guide",
        "Utility company rebate programs",
        "DIY installation videos",
      ],
      relatedRisks: ["heatwave"],
      completed: false,
    });

    actions.push({
      id: `action-${Date.now()}-${idCounter++}`,
      title: "Apply Reflective Window Film",
      description:
        "UV-blocking window film reduces heat gain by 30% while maintaining natural light.",
      category: "urgent",
      priority: 8,
      timeframe: "30-days",
      difficulty: "medium",
      cost: {
        amount: 200,
        range: "$150-$300",
        paybackPeriod: "2 years",
      },
      impact: {
        energySaved: 800,
        moneySaved: 120,
        co2Reduced: 360,
        resilienceScore: 25,
      },
      steps: [
        "Measure window square footage",
        "Purchase 3M or Gila window film",
        "Clean windows thoroughly",
        "Apply film using squeegee method",
        "Trim excess and seal edges",
      ],
      resources: [
        "Window film installation guide",
        "Home Depot/Lowe's supplies",
        "Professional installation services",
      ],
      relatedRisks: ["heatwave"],
      completed: false,
    });
  }

  // Drought/water actions
  if (risks.primaryRisks.includes("drought") || risks.severity.drought > 50) {
    actions.push({
      id: `action-${Date.now()}-${idCounter++}`,
      title: "Install Low-Flow Fixtures",
      description:
        "Replace showerheads and faucet aerators to reduce water consumption by 30-50%.",
      category: "urgent",
      priority: 9,
      timeframe: "30-days",
      difficulty: "easy",
      cost: {
        amount: 100,
        range: "$80-$150",
        paybackPeriod: "8 months",
      },
      impact: {
        waterSaved: 15000,
        moneySaved: 150,
        resilienceScore: 30,
      },
      steps: [
        "Purchase WaterSense certified fixtures",
        "Remove old showerheads/aerators with wrench",
        "Wrap threads with plumber's tape",
        "Install new fixtures (15 min each)",
        "Test for leaks and adjust",
      ],
      resources: [
        "EPA WaterSense product finder",
        "Local utility rebate programs",
        "Installation video tutorials",
      ],
      relatedRisks: ["drought"],
      completed: false,
    });

    actions.push({
      id: `action-${Date.now()}-${idCounter++}`,
      title: "Convert to Drought-Resistant Landscaping",
      description:
        "Replace water-hungry lawn with native plants and xeriscaping to save thousands of gallons.",
      category: "important",
      priority: 7,
      timeframe: "60-days",
      difficulty: "hard",
      cost: {
        amount: 2500,
        range: "$2000-$4000",
        paybackPeriod: "3 years",
      },
      impact: {
        waterSaved: 50000,
        moneySaved: 500,
        resilienceScore: 45,
      },
      steps: [
        "Design xeriscape plan with native plants",
        "Remove existing turf grass",
        "Amend soil with compost",
        "Install drip irrigation system",
        "Plant drought-tolerant species",
        "Add mulch layer (3-4 inches)",
      ],
      resources: [
        "Local native plant society",
        "Xeriscape design guide",
        "Landscape contractor referrals",
      ],
      relatedRisks: ["drought", "heatwave"],
      completed: false,
    });
  }

  // Flood actions
  if (risks.primaryRisks.includes("flood") || risks.severity.flood > 50) {
    actions.push({
      id: `action-${Date.now()}-${idCounter++}`,
      title: "Install Sump Pump & Backup Battery",
      description:
        "Protect basement from flooding with automatic water removal system and power backup.",
      category: "important",
      priority: 8,
      timeframe: "60-days",
      difficulty: "hard",
      cost: {
        amount: 1200,
        range: "$1000-$1500",
        paybackPeriod: "Prevents $10K+ damage",
      },
      impact: {
        resilienceScore: 60,
      },
      steps: [
        "Assess basement flood risk and drainage",
        "Choose appropriate sump pump capacity",
        "Hire licensed plumber for installation",
        "Install battery backup system",
        "Test monthly and maintain annually",
      ],
      resources: [
        "Basement waterproofing contractors",
        "Sump pump comparison guide",
        "FEMA flood mitigation resources",
      ],
      relatedRisks: ["flood", "storm"],
      completed: false,
    });
  }

  // Universal long-term actions
  actions.push({
    id: `action-${Date.now()}-${idCounter++}`,
    title: "Install Solar Panels & Battery Storage",
    description:
      "Generate clean energy and maintain power during grid outages with solar+battery system.",
    category: "long-term",
    priority: 6,
    timeframe: "6-months",
    difficulty: "hard",
    cost: {
      amount: 20000,
      range: "$18000-$25000",
      paybackPeriod: "7 years",
    },
    impact: {
      energySaved: 8000,
      moneySaved: 1200,
      co2Reduced: 3600,
      resilienceScore: 80,
    },
    steps: [
      "Get 3-5 quotes from certified installers",
      "Calculate roof orientation and capacity",
      "Apply for federal tax credit (30%)",
      "Check utility company net metering policy",
      "Schedule installation (1-3 days)",
      "Connect to grid and activate monitoring",
    ],
    resources: [
      "EnergySage solar calculator",
      "Federal solar tax credit info",
      "State/local incentive programs",
    ],
    relatedRisks: ["heatwave", "storm", "wildfire"],
    completed: false,
  });

  return actions;
}

// ============================================================================
// Plan Management
// ============================================================================

/**
 * Generate complete adaptation plan for user
 */
export async function generateAdaptationPlan(
  profile: UserProfile
): Promise<AdaptationPlan> {
  const risks = await analyzeLocationRisks(profile.location);
  const actions = await generateAdaptationActions(profile, risks);

  const plan: AdaptationPlan = {
    id: `plan-${Date.now()}`,
    userId: `user-${Date.now()}`, // In production, use actual user ID
    profile,
    generatedAt: new Date(),
    lastUpdated: new Date(),
    actions,
    totalImpact: calculateTotalImpact(actions),
    progress: {
      completedActions: 0,
      totalActions: actions.length,
      percentComplete: 0,
    },
  };

  return plan;
}

/**
 * Calculate total impact of all actions
 */
function calculateTotalImpact(actions: AdaptationAction[]): {
  waterSaved: number;
  energySaved: number;
  co2Reduced: number;
  moneySaved: number;
  resilienceScore: number;
} {
  return actions.reduce(
    (total, action) => ({
      waterSaved: total.waterSaved + (action.impact.waterSaved || 0),
      energySaved: total.energySaved + (action.impact.energySaved || 0),
      co2Reduced: total.co2Reduced + (action.impact.co2Reduced || 0),
      moneySaved: total.moneySaved + (action.impact.moneySaved || 0),
      resilienceScore: Math.min(
        100,
        total.resilienceScore + (action.impact.resilienceScore || 0)
      ),
    }),
    {
      waterSaved: 0,
      energySaved: 0,
      co2Reduced: 0,
      moneySaved: 0,
      resilienceScore: 0,
    }
  );
}

/**
 * Mark action as completed and recalculate progress
 */
export function completeAction(
  plan: AdaptationPlan,
  actionId: string
): AdaptationPlan {
  const updatedActions = plan.actions.map((action) =>
    action.id === actionId
      ? { ...action, completed: true, completedAt: new Date() }
      : action
  );

  const completedCount = updatedActions.filter((a) => a.completed).length;

  return {
    ...plan,
    actions: updatedActions,
    lastUpdated: new Date(),
    progress: {
      completedActions: completedCount,
      totalActions: plan.actions.length,
      percentComplete: Math.round((completedCount / plan.actions.length) * 100),
    },
  };
}

/**
 * Get actions by category
 */
export function getActionsByCategory(
  plan: AdaptationPlan,
  category: "urgent" | "important" | "long-term"
): AdaptationAction[] {
  return plan.actions
    .filter((action) => action.category === category)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Get actions by timeframe
 */
export function getActionsByTimeframe(
  plan: AdaptationPlan,
  timeframe: string
): AdaptationAction[] {
  return plan.actions
    .filter((action) => action.timeframe === timeframe)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Calculate impact of completed actions only
 */
export function getCompletedImpact(plan: AdaptationPlan): {
  waterSaved: number;
  energySaved: number;
  co2Reduced: number;
  moneySaved: number;
  resilienceScore: number;
} {
  const completedActions = plan.actions.filter((a) => a.completed);
  return calculateTotalImpact(completedActions);
}
