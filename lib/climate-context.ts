import { ClimateContext } from "./llm-service";

/**
 * Build comprehensive climate context from current dashboard data
 * This gathers real-time information to provide to the LLM
 */
export async function buildClimateContext(
  location: {
    name: string;
    lat: number;
    lon: number;
    timezone?: string;
  },
  getRisksData?: () => any[],
  getAlertsData?: () => any[],
  getForecastData?: () => any[]
): Promise<ClimateContext> {
  // Gather current risks from RiskCards component
  const currentRisks = getRisksData
    ? getRisksData().map((risk) => ({
        type: risk.type,
        severity: risk.severity,
        level: risk.level,
      }))
    : [];

  // Gather active alerts from RealClimateAlerts component
  const alerts = getAlertsData
    ? getAlertsData()
        .slice(0, 5)
        .map((alert) => ({
          title: alert.title,
          severity: alert.severity,
          region: alert.region || location.name,
        }))
    : [];

  // Fetch current weather data
  const weather = await fetchCurrentWeather(location.lat, location.lon);

  // Gather forecast data from RiskForecast component
  const forecast = getForecastData
    ? getForecastData().map((day) => ({
        date: day.date,
        riskLevel: day.riskLevel,
        trends: day.trends || [],
      }))
    : [];

  return {
    location: {
      name: location.name,
      lat: location.lat,
      lon: location.lon,
    },
    currentRisks,
    alerts,
    weather,
    forecast,
  };
}

/**
 * Fetch current weather from Open-Meteo API
 */
async function fetchCurrentWeather(
  lat: number,
  lon: number
): Promise<{
  temperature?: number;
  conditions?: string;
  humidity?: number;
}> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`
    );

    if (!response.ok) {
      console.warn("Weather API failed, using fallback");
      return {};
    }

    const data = await response.json();
    const current = data.current;

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      conditions: getWeatherDescription(current.weather_code),
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return {};
  }
}

/**
 * Convert WMO weather codes to human-readable descriptions
 */
function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
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

  return weatherCodes[code] || "Unknown";
}

/**
 * Simple in-memory context cache to reduce API calls
 */
let contextCache: {
  data: ClimateContext | null;
  timestamp: number;
  locationKey: string;
} = {
  data: null,
  timestamp: 0,
  locationKey: "",
};

const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Get cached climate context or build new one
 */
export async function getCachedClimateContext(
  location: {
    name: string;
    lat: number;
    lon: number;
    timezone?: string;
  },
  getRisksData?: () => any[],
  getAlertsData?: () => any[],
  getForecastData?: () => any[]
): Promise<ClimateContext> {
  const locationKey = `${location.name}_${location.lat}_${location.lon}`;
  const now = Date.now();

  // Return cached data if fresh and same location
  if (
    contextCache.data &&
    contextCache.locationKey === locationKey &&
    now - contextCache.timestamp < CACHE_TTL
  ) {
    return contextCache.data;
  }

  // Build fresh context
  const context = await buildClimateContext(
    location,
    getRisksData,
    getAlertsData,
    getForecastData
  );

  // Update cache
  contextCache = {
    data: context,
    timestamp: now,
    locationKey,
  };

  return context;
}
