/**
 * Air Quality Alerts
 * Real-time air quality data from OpenAQ
 */

export interface AirQualityAlert {
  id: string;
  type: "air_quality";
  severity: "Extreme" | "Severe" | "Moderate" | "Low";
  aqi: number;
  category: string;
  pollutant: string;
  title: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  effective: Date;
  expires: Date;
  source: string;
  raw?: any;
}

/**
 * Calculate AQI category and severity
 */
function getAQIInfo(aqi: number): {
  category: string;
  severity: AirQualityAlert["severity"];
  color: string;
} {
  if (aqi >= 301) {
    return { category: "Hazardous", severity: "Extreme", color: "Maroon" };
  }
  if (aqi >= 201) {
    return { category: "Very Unhealthy", severity: "Extreme", color: "Purple" };
  }
  if (aqi >= 151) {
    return { category: "Unhealthy", severity: "Severe", color: "Red" };
  }
  if (aqi >= 101) {
    return {
      category: "Unhealthy for Sensitive Groups",
      severity: "Moderate",
      color: "Orange",
    };
  }
  if (aqi >= 51) {
    return { category: "Moderate", severity: "Low", color: "Yellow" };
  }
  return { category: "Good", severity: "Low", color: "Green" };
}

/**
 * Get health advice based on AQI
 */
function getAQIAdvice(aqi: number, category: string): string {
  if (aqi >= 301) {
    return "Health alert: Everyone may experience serious health effects. Remain indoors and keep activity levels low. Run an air purifier if available.";
  }
  if (aqi >= 201) {
    return "Health warnings of emergency conditions. Everyone should avoid all outdoor exertion. Close windows and use air filtration.";
  }
  if (aqi >= 151) {
    return "Everyone may begin to experience health effects. Avoid prolonged outdoor activities. Sensitive groups should stay indoors.";
  }
  if (aqi >= 101) {
    return "Sensitive groups should reduce prolonged or heavy outdoor exertion. Watch for symptoms and take breaks.";
  }
  if (aqi >= 51) {
    return "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.";
  }
  return "Air quality is good. Enjoy outdoor activities.";
}

/**
 * Estimate AQI from PM2.5 concentration
 */
function pm25ToAQI(pm25: number): number {
  // Simplified AQI calculation for PM2.5
  if (pm25 <= 12) return Math.round((50 / 12) * pm25);
  if (pm25 <= 35.4)
    return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  if (pm25 <= 55.4)
    return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  if (pm25 <= 150.4)
    return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  if (pm25 <= 250.4)
    return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
  return Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301);
}

/**
 * Fetch air quality alerts from OpenAQ API
 */
export async function fetchAirQualityAlerts(
  latitude: number,
  longitude: number,
  locationName: string
): Promise<AirQualityAlert[]> {
  try {
    // OpenAQ API - get latest measurements within 25km radius
    const radius = 25000; // 25km in meters
    const response = await fetch(
      `https://api.openaq.org/v2/latest?` +
        `coordinates=${latitude},${longitude}&` +
        `radius=${radius}&` +
        `limit=10&` +
        `parameter=pm25&` +
        `order_by=lastUpdated&` +
        `sort=desc`
    );

    if (!response.ok) {
      console.warn("OpenAQ API failed:", response.status);
      // Fallback: Try alternative AQI estimation from weather conditions
      return [];
    }

    const data = await response.json();
    const alerts: AirQualityAlert[] = [];

    if (data.results && data.results.length > 0) {
      // Get the most recent PM2.5 measurement
      const latestStation = data.results[0];
      const pm25Measurement = latestStation.measurements?.find(
        (m: any) => m.parameter === "pm25"
      );

      if (pm25Measurement) {
        const pm25Value = pm25Measurement.value;
        const aqi = pm25ToAQI(pm25Value);
        const aqiInfo = getAQIInfo(aqi);

        // Only create alert if AQI is Unhealthy or worse (>= 101)
        if (aqi >= 101) {
          const stationName = latestStation.location || locationName;

          alerts.push({
            id: `aqi-${locationName}-${Date.now()}`,
            type: "air_quality",
            severity: aqiInfo.severity,
            aqi: Math.round(aqi),
            category: aqiInfo.category,
            pollutant: "PM2.5",
            title: `${aqiInfo.category} Air Quality`,
            description: `Air Quality Index is ${Math.round(aqi)} (${
              aqiInfo.category
            }) due to ${pm25Value.toFixed(
              1
            )} µg/m³ PM2.5 at ${stationName}. ${getAQIAdvice(
              aqi,
              aqiInfo.category
            )}`,
            location: locationName,
            coordinates: {
              lat: latestStation.coordinates?.latitude || latitude,
              lon: latestStation.coordinates?.longitude || longitude,
            },
            effective: new Date(pm25Measurement.lastUpdated),
            expires: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
            source: `OpenAQ - ${latestStation.location}`,
            raw: latestStation,
          });
        }
      }
    }

    return alerts;
  } catch (error) {
    console.error("Error fetching air quality alerts:", error);
    return [];
  }
}

/**
 * Determine if an air quality alert should trigger voice announcement
 */
export function isAirQualityAlertCritical(alert: AirQualityAlert): boolean {
  // Critical if AQI >= 200 (Very Unhealthy or Hazardous)
  return alert.aqi >= 200;
}
