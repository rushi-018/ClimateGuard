/**
 * Weather Alerts from Open-Meteo API
 * Provides real-time weather warnings and alerts
 */

export interface WeatherAlert {
  id: string;
  type: "weather";
  event: string;
  headline: string;
  description: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  urgency: "Immediate" | "Expected" | "Future" | "Past";
  certainty: "Observed" | "Likely" | "Possible" | "Unlikely";
  effective: Date;
  expires: Date;
  sender: string;
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  raw?: any;
}

const WEATHER_CODE_DESCRIPTIONS: { [key: number]: string } = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

/**
 * Fetch real weather alerts from Open-Meteo
 */
export async function fetchWeatherAlerts(
  latitude: number,
  longitude: number,
  locationName: string
): Promise<WeatherAlert[]> {
  try {
    // Fetch current and forecast weather data
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${latitude}&longitude=${longitude}&` +
        `current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&` +
        `daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&` +
        `temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&` +
        `timezone=auto&forecast_days=7`
    );

    if (!response.ok) {
      console.warn("Weather API failed:", response.status);
      return [];
    }

    const data = await response.json();
    const alerts: WeatherAlert[] = [];

    // Analyze current conditions for extreme weather
    const current = data.current;
    const daily = data.daily;

    // EXTREME HEAT WARNING
    if (current.temperature_2m >= 105) {
      alerts.push({
        id: `heat-${locationName}-${Date.now()}`,
        type: "weather",
        event: "Excessive Heat Warning",
        headline: `Excessive Heat Warning - ${Math.round(
          current.temperature_2m
        )}°F`,
        description: `Dangerously hot conditions with temperatures at ${Math.round(
          current.temperature_2m
        )}°F and feels-like temperature of ${Math.round(
          current.apparent_temperature
        )}°F. Heat index may exceed safe levels. Stay indoors during peak hours, stay hydrated, and check on vulnerable individuals.`,
        severity: "Extreme",
        urgency: "Immediate",
        certainty: "Observed",
        effective: new Date(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        sender: "Open-Meteo Weather Service",
        location: locationName,
        coordinates: { lat: latitude, lon: longitude },
        raw: current,
      });
    } else if (current.temperature_2m >= 95) {
      alerts.push({
        id: `heat-${locationName}-${Date.now()}`,
        type: "weather",
        event: "Heat Advisory",
        headline: `Heat Advisory - ${Math.round(current.temperature_2m)}°F`,
        description: `Hot conditions with temperatures at ${Math.round(
          current.temperature_2m
        )}°F. Limit outdoor activities during peak afternoon hours and stay hydrated.`,
        severity: "Moderate",
        urgency: "Expected",
        certainty: "Likely",
        effective: new Date(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        sender: "Open-Meteo Weather Service",
        location: locationName,
        coordinates: { lat: latitude, lon: longitude },
        raw: current,
      });
    }

    // EXTREME COLD WARNING
    if (current.temperature_2m <= 10) {
      alerts.push({
        id: `cold-${locationName}-${Date.now()}`,
        type: "weather",
        event: "Extreme Cold Warning",
        headline: `Extreme Cold Warning - ${Math.round(
          current.temperature_2m
        )}°F`,
        description: `Dangerously cold conditions with temperatures at ${Math.round(
          current.temperature_2m
        )}°F and wind chill of ${Math.round(
          current.apparent_temperature
        )}°F. Frostbite and hypothermia possible. Avoid prolonged outdoor exposure.`,
        severity: "Extreme",
        urgency: "Immediate",
        certainty: "Observed",
        effective: new Date(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        sender: "Open-Meteo Weather Service",
        location: locationName,
        coordinates: { lat: latitude, lon: longitude },
        raw: current,
      });
    }

    // HEAVY RAIN / FLOOD WARNING
    if (current.precipitation >= 0.5) {
      const severity = current.precipitation >= 2 ? "Severe" : "Moderate";
      alerts.push({
        id: `rain-${locationName}-${Date.now()}`,
        type: "weather",
        event:
          severity === "Severe" ? "Flash Flood Warning" : "Heavy Rain Advisory",
        headline: `${
          severity === "Severe" ? "Flash Flood Warning" : "Heavy Rain"
        } - ${current.precipitation.toFixed(1)}" rainfall`,
        description: `Heavy rainfall detected with ${current.precipitation.toFixed(
          2
        )} inches. ${
          severity === "Severe"
            ? "Rapid flooding possible in low-lying areas. Do not drive through flooded roads."
            : "Watch for localized flooding."
        }`,
        severity: severity as "Severe" | "Moderate",
        urgency: severity === "Severe" ? "Immediate" : "Expected",
        certainty: "Observed",
        effective: new Date(),
        expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
        sender: "Open-Meteo Weather Service",
        location: locationName,
        coordinates: { lat: latitude, lon: longitude },
        raw: current,
      });
    }

    // HIGH WIND WARNING
    if (current.wind_speed_10m >= 40) {
      alerts.push({
        id: `wind-${locationName}-${Date.now()}`,
        type: "weather",
        event: "High Wind Warning",
        headline: `High Wind Warning - ${Math.round(
          current.wind_speed_10m
        )} mph winds`,
        description: `Dangerously high winds at ${Math.round(
          current.wind_speed_10m
        )} mph. Secure loose objects, avoid travel if possible, and stay away from windows. Power outages possible.`,
        severity: "Severe",
        urgency: "Immediate",
        certainty: "Observed",
        effective: new Date(),
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000),
        sender: "Open-Meteo Weather Service",
        location: locationName,
        coordinates: { lat: latitude, lon: longitude },
        raw: current,
      });
    }

    // THUNDERSTORM WARNING
    if (current.weather_code >= 95) {
      const hasHail = current.weather_code >= 96;
      alerts.push({
        id: `storm-${locationName}-${Date.now()}`,
        type: "weather",
        event: hasHail ? "Severe Thunderstorm Warning" : "Thunderstorm Warning",
        headline: hasHail
          ? "Severe Thunderstorm with Hail"
          : "Thunderstorm in Progress",
        description: `${
          WEATHER_CODE_DESCRIPTIONS[current.weather_code]
        } detected. ${
          hasHail
            ? "Large hail possible. Seek shelter immediately."
            : "Lightning and heavy rain. Stay indoors and away from windows."
        }`,
        severity: hasHail ? "Severe" : "Moderate",
        urgency: "Immediate",
        certainty: "Observed",
        effective: new Date(),
        expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
        sender: "Open-Meteo Weather Service",
        location: locationName,
        coordinates: { lat: latitude, lon: longitude },
        raw: current,
      });
    }

    // FORECAST-BASED ALERTS (Next 24-48 hours)
    if (
      daily &&
      daily.temperature_2m_max &&
      daily.temperature_2m_max.length > 0
    ) {
      const tomorrow = daily.temperature_2m_max[1];
      const dayAfter = daily.temperature_2m_max[2];

      // Upcoming extreme heat
      if (tomorrow >= 110 || dayAfter >= 110) {
        const maxTemp = Math.max(tomorrow, dayAfter);
        alerts.push({
          id: `heat-forecast-${locationName}-${Date.now()}`,
          type: "weather",
          event: "Extreme Heat Forecast",
          headline: `Extreme Heat Expected - Up to ${Math.round(maxTemp)}°F`,
          description: `Dangerous heat wave approaching with temperatures forecast to reach ${Math.round(
            maxTemp
          )}°F in the next 48 hours. Prepare now: stock up on water, check air conditioning, and plan to stay indoors.`,
          severity: "Severe",
          urgency: "Expected",
          certainty: "Likely",
          effective: new Date(),
          expires: new Date(Date.now() + 48 * 60 * 60 * 1000),
          sender: "Open-Meteo Weather Service",
          location: locationName,
          coordinates: { lat: latitude, lon: longitude },
          raw: daily,
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error("Error fetching weather alerts:", error);
    return [];
  }
}

/**
 * Determine if a weather alert should trigger voice announcement
 */
export function isWeatherAlertCritical(alert: WeatherAlert): boolean {
  // Critical if severity is Extreme or Severe AND urgency is Immediate
  return (
    (alert.severity === "Extreme" || alert.severity === "Severe") &&
    (alert.urgency === "Immediate" || alert.urgency === "Expected") &&
    alert.certainty !== "Unlikely"
  );
}
