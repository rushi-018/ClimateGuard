/**
 * Risk Score Alerts
 * Based on ML predictions from risk assessment API
 */

export interface RiskAlert {
  id: string;
  type: "risk";
  riskType: "drought" | "flood" | "heatwave" | "wildfire" | "storm";
  severity: "Extreme" | "Severe" | "Moderate" | "Low";
  score: number; // 0-100
  title: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  trend: "increasing" | "stable" | "decreasing";
  effective: Date;
  expires: Date;
  raw?: any;
}

/**
 * Map risk score to severity
 */
function scoreToSeverity(score: number): RiskAlert["severity"] {
  if (score >= 90) return "Extreme";
  if (score >= 75) return "Severe";
  if (score >= 50) return "Moderate";
  return "Low";
}

/**
 * Get risk-specific advice
 */
function getRiskAdvice(
  riskType: RiskAlert["riskType"],
  severity: RiskAlert["severity"]
): string {
  const advice: { [key: string]: { [key: string]: string } } = {
    drought: {
      Extreme:
        "Critical water shortage. Immediate conservation required. Follow all water restrictions and emergency guidelines.",
      Severe:
        "Severe water stress. Conserve water, follow local restrictions, and prepare for rationing.",
      Moderate:
        "Elevated drought conditions. Be mindful of water usage and follow conservation recommendations.",
      Low: "Monitor water levels. Practice water conservation.",
    },
    flood: {
      Extreme:
        "Extreme flood risk. Evacuate if in low-lying areas. Do not drive through flooded roads.",
      Severe:
        "High flood risk. Prepare to evacuate. Move valuables to upper floors.",
      Moderate:
        "Moderate flood risk. Stay alert for weather updates and avoid flood-prone areas.",
      Low: "Low flood risk. Monitor weather conditions.",
    },
    heatwave: {
      Extreme:
        "Dangerous heat conditions. Stay indoors during peak hours, stay hydrated, and check on vulnerable individuals.",
      Severe:
        "Extreme heat. Limit outdoor activities, drink plenty of water, and use air conditioning.",
      Moderate:
        "Hot conditions. Stay hydrated and limit prolonged sun exposure.",
      Low: "Warm weather. Practice normal heat safety.",
    },
    wildfire: {
      Extreme:
        "Extreme wildfire danger. Prepare for evacuation. Monitor air quality and avoid outdoor activities.",
      Severe:
        "High wildfire risk. Create defensible space around property. Have evacuation plan ready.",
      Moderate:
        "Elevated wildfire risk. Be cautious with outdoor activities. Monitor air quality.",
      Low: "Low wildfire risk. Practice fire safety.",
    },
    storm: {
      Extreme:
        "Severe storm conditions. Seek shelter immediately. Stay away from windows.",
      Severe:
        "Strong storm risk. Secure outdoor items and prepare for power outages.",
      Moderate:
        "Moderate storm risk. Monitor weather updates and secure loose objects.",
      Low: "Low storm risk. Monitor weather conditions.",
    },
  };

  return advice[riskType]?.[severity] || "Follow local safety guidelines.";
}

/**
 * Get emoji for risk type
 */
function getRiskEmoji(riskType: RiskAlert["riskType"]): string {
  const emojis: { [key: string]: string } = {
    drought: "🌵",
    flood: "🌊",
    heatwave: "🔥",
    wildfire: "🔥",
    storm: "⛈️",
  };
  return emojis[riskType] || "⚠️";
}

/**
 * Fetch risk alerts from your prediction API
 */
export async function fetchRiskAlerts(
  latitude: number,
  longitude: number,
  locationName: string
): Promise<RiskAlert[]> {
  try {
    // Fetch from your existing predict API
    const response = await fetch(
      `/api/predict?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      console.warn("Risk prediction API failed:", response.status);
      return [];
    }

    const data = await response.json();
    const alerts: RiskAlert[] = [];

    // Process each risk type
    const riskTypes: Array<RiskAlert["riskType"]> = [
      "drought",
      "flood",
      "heatwave",
      "wildfire",
      "storm",
    ];

    for (const riskType of riskTypes) {
      const score = data.risks?.[riskType] || data[riskType] || 0;

      // Only create alert if score is significant (>= 50)
      if (score < 50) continue;

      const severity = scoreToSeverity(score);
      const emoji = getRiskEmoji(riskType);

      // Determine trend from forecast if available
      let trend: RiskAlert["trend"] = "stable";
      if (data.forecast) {
        const futureForecast = data.forecast.slice(1, 4); // Next 3 days
        const futureScores = futureForecast.map((f: any) => f[riskType] || 0);
        const avgFuture =
          futureScores.reduce((a: number, b: number) => a + b, 0) /
          futureScores.length;

        if (avgFuture > score + 5) trend = "increasing";
        else if (avgFuture < score - 5) trend = "decreasing";
      }

      const trendText =
        trend === "increasing"
          ? " Conditions expected to worsen."
          : trend === "decreasing"
          ? " Conditions expected to improve."
          : " Conditions expected to remain stable.";

      alerts.push({
        id: `risk-${riskType}-${locationName}-${Date.now()}`,
        type: "risk",
        riskType,
        severity,
        score: Math.round(score),
        title: `${emoji} ${
          riskType.charAt(0).toUpperCase() + riskType.slice(1)
        } ${severity} Risk`,
        description: `${
          riskType.charAt(0).toUpperCase() + riskType.slice(1)
        } risk at ${Math.round(
          score
        )}% in ${locationName}.${trendText} ${getRiskAdvice(
          riskType,
          severity
        )}`,
        location: locationName,
        coordinates: {
          lat: latitude,
          lon: longitude,
        },
        trend,
        effective: new Date(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        raw: data,
      });
    }

    // Sort by severity and score
    alerts.sort((a, b) => {
      const severityOrder = { Extreme: 0, Severe: 1, Moderate: 2, Low: 3 };
      const severityDiff =
        severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.score - a.score;
    });

    return alerts;
  } catch (error) {
    console.error("Error fetching risk alerts:", error);
    return [];
  }
}

/**
 * Determine if a risk alert should trigger voice announcement
 */
export function isRiskAlertCritical(alert: RiskAlert): boolean {
  // Critical if score >= 90 (Extreme severity)
  return alert.score >= 90 && alert.severity === "Extreme";
}
