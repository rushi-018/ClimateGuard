/**
 * Weather Service - Handles all weather data fetching with fallbacks
 * Integrates with Open-Meteo API and provides dummy data when needed
 */

export interface WeatherData {
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  pressure?: number;
  uvIndex?: number;
  visibility?: number;
}

export interface LocationData {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

export interface RiskData {
  riskType: string;
  severity: "Low" | "Medium" | "High";
  riskScore: number; // 0-1
  confidence: number; // 0-1
  description: string;
}

export interface ClimateRiskPoint {
  location: LocationData;
  current: WeatherData;
  forecast: WeatherData[];
  risks: RiskData[];
  lastUpdated: string;
}

// Major cities for global coverage
const GLOBAL_CITIES: LocationData[] = [
  { lat: 40.7128, lon: -74.006, city: "New York", country: "USA" },
  { lat: 51.5074, lon: -0.1278, city: "London", country: "UK" },
  { lat: 35.6762, lon: 139.6503, city: "Tokyo", country: "Japan" },
  { lat: -33.8688, lon: 151.2093, city: "Sydney", country: "Australia" },
  { lat: 19.076, lon: 72.8777, city: "Mumbai", country: "India" },
  { lat: -23.5505, lon: -46.6333, city: "São Paulo", country: "Brazil" },
  { lat: 30.0444, lon: 31.2357, city: "Cairo", country: "Egypt" },
  { lat: 6.5244, lon: 3.3792, city: "Lagos", country: "Nigeria" },
  { lat: 55.7558, lon: 37.6176, city: "Moscow", country: "Russia" },
  { lat: 39.9042, lon: 116.4074, city: "Beijing", country: "China" },
  { lat: -34.6037, lon: -58.3816, city: "Buenos Aires", country: "Argentina" },
  { lat: 52.52, lon: 13.405, city: "Berlin", country: "Germany" },
  { lat: 48.8566, lon: 2.3522, city: "Paris", country: "France" },
  { lat: 41.9028, lon: 12.4964, city: "Rome", country: "Italy" },
  { lat: 25.2048, lon: 55.2708, city: "Dubai", country: "UAE" },
];

class WeatherService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /**
   * Fetch current weather data for a location
   */
  async fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = `weather_${lat}_${lon}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return this.parseWeatherData(cached.data.current);
    }

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m,surface_pressure,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=10`
      );

      if (!response.ok)
        throw new Error(`Weather API error: ${response.status}`);

      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return this.parseWeatherData(data.current);
    } catch (error) {
      console.warn(`Weather API failed for ${lat},${lon}:`, error);
      return this.getFallbackWeatherData(lat, lon);
    }
  }

  /**
   * Fetch 10-day forecast for a location
   */
  async fetchForecastData(lat: number, lon: number): Promise<WeatherData[]> {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=10`
      );

      if (!response.ok)
        throw new Error(`Forecast API error: ${response.status}`);

      const data = await response.json();
      return this.parseForecastData(data.daily);
    } catch (error) {
      console.warn(`Forecast API failed for ${lat},${lon}:`, error);
      return this.getFallbackForecastData();
    }
  }

  /**
   * Calculate risk assessments based on weather data
   */
  calculateRisks(current: WeatherData, forecast: WeatherData[]): RiskData[] {
    const risks: RiskData[] = [];

    // Heatwave Risk
    const heatwaveRisk = this.calculateHeatwaveRisk(current, forecast);
    if (heatwaveRisk.riskScore > 0.3) risks.push(heatwaveRisk);

    // Flood Risk
    const floodRisk = this.calculateFloodRisk(current, forecast);
    if (floodRisk.riskScore > 0.3) risks.push(floodRisk);

    // Drought Risk
    const droughtRisk = this.calculateDroughtRisk(current, forecast);
    if (droughtRisk.riskScore > 0.3) risks.push(droughtRisk);

    // Storm Risk
    const stormRisk = this.calculateStormRisk(current, forecast);
    if (stormRisk.riskScore > 0.3) risks.push(stormRisk);

    return risks.length > 0
      ? risks
      : [
          {
            riskType: "low",
            severity: "Low",
            riskScore: 0.1,
            confidence: 0.9,
            description: "No significant climate risks detected",
          },
        ];
  }

  /**
   * Get global climate risk data for all major cities
   */
  async getGlobalRiskData(): Promise<ClimateRiskPoint[]> {
    const promises = GLOBAL_CITIES.map(async (location) => {
      try {
        const current = await this.fetchWeatherData(location.lat, location.lon);
        const forecast = await this.fetchForecastData(
          location.lat,
          location.lon
        );
        const risks = this.calculateRisks(current, forecast);

        return {
          location,
          current,
          forecast,
          risks,
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.warn(`Failed to fetch data for ${location.city}:`, error);
        return this.getFallbackClimateRisk(location);
      }
    });

    return Promise.all(promises);
  }

  private parseWeatherData(current: any): WeatherData {
    return {
      temperature: current.temperature_2m || 20,
      precipitation: current.precipitation || 0,
      humidity: current.relative_humidity_2m || 50,
      windSpeed: current.wind_speed_10m || 5,
      pressure: current.surface_pressure,
      uvIndex: current.uv_index,
    };
  }

  private parseForecastData(daily: any): WeatherData[] {
    const forecast: WeatherData[] = [];
    const days = Math.min(daily.time?.length || 0, 10);

    for (let i = 0; i < days; i++) {
      forecast.push({
        temperature:
          (daily.temperature_2m_max?.[i] + daily.temperature_2m_min?.[i]) / 2 ||
          20,
        precipitation: daily.precipitation_sum?.[i] || 0,
        humidity: daily.relative_humidity_2m?.[i] || 50,
        windSpeed: daily.wind_speed_10m?.[i] || 5,
      });
    }

    return forecast;
  }

  private calculateHeatwaveRisk(
    current: WeatherData,
    forecast: WeatherData[]
  ): RiskData {
    let score = 0;

    if (current.temperature > 35) score += 0.4;
    else if (current.temperature > 30) score += 0.2;

    const avgForecastTemp =
      forecast.reduce((sum, day) => sum + day.temperature, 0) / forecast.length;
    if (avgForecastTemp > 32) score += 0.3;

    if (current.humidity < 30) score += 0.2;

    return {
      riskType: "heatwave",
      severity: score > 0.7 ? "High" : score > 0.4 ? "Medium" : "Low",
      riskScore: Math.min(score, 1),
      confidence: 0.85,
      description:
        score > 0.7
          ? "Extreme heat conditions expected"
          : score > 0.4
          ? "Elevated temperatures with heat stress risk"
          : "Moderate heat risk",
    };
  }

  private calculateFloodRisk(
    current: WeatherData,
    forecast: WeatherData[]
  ): RiskData {
    let score = 0;

    if (current.precipitation > 20) score += 0.4;
    else if (current.precipitation > 10) score += 0.2;

    const totalForecastPrecip = forecast.reduce(
      (sum, day) => sum + day.precipitation,
      0
    );
    if (totalForecastPrecip > 100) score += 0.3;
    else if (totalForecastPrecip > 50) score += 0.2;

    if (current.humidity > 80) score += 0.2;

    return {
      riskType: "flood",
      severity: score > 0.7 ? "High" : score > 0.4 ? "Medium" : "Low",
      riskScore: Math.min(score, 1),
      confidence: 0.8,
      description:
        score > 0.7
          ? "High flood risk due to heavy rainfall"
          : score > 0.4
          ? "Moderate flood risk from precipitation"
          : "Low flood risk",
    };
  }

  private calculateDroughtRisk(
    current: WeatherData,
    forecast: WeatherData[]
  ): RiskData {
    let score = 0;

    if (current.precipitation < 0.1 && current.temperature > 25) score += 0.3;
    if (current.humidity < 30) score += 0.2;

    const avgForecastPrecip =
      forecast.reduce((sum, day) => sum + day.precipitation, 0) /
      forecast.length;
    if (avgForecastPrecip < 1) score += 0.3;

    const dryDays = forecast.filter((day) => day.precipitation < 0.1).length;
    if (dryDays > 7) score += 0.2;

    return {
      riskType: "drought",
      severity: score > 0.7 ? "High" : score > 0.4 ? "Medium" : "Low",
      riskScore: Math.min(score, 1),
      confidence: 0.75,
      description:
        score > 0.7
          ? "Severe drought conditions developing"
          : score > 0.4
          ? "Dry conditions with drought risk"
          : "Low drought risk",
    };
  }

  private calculateStormRisk(
    current: WeatherData,
    forecast: WeatherData[]
  ): RiskData {
    let score = 0;

    if (current.windSpeed > 20) score += 0.4;
    else if (current.windSpeed > 15) score += 0.2;

    if (current.precipitation > 15 && current.windSpeed > 10) score += 0.3;

    const maxWindSpeed = Math.max(...forecast.map((day) => day.windSpeed));
    if (maxWindSpeed > 25) score += 0.3;

    return {
      riskType: "storm",
      severity: score > 0.7 ? "High" : score > 0.4 ? "Medium" : "Low",
      riskScore: Math.min(score, 1),
      confidence: 0.7,
      description:
        score > 0.7
          ? "Severe storm conditions expected"
          : score > 0.4
          ? "Stormy weather with potential risks"
          : "Low storm risk",
    };
  }

  private getFallbackWeatherData(lat: number, lon: number): WeatherData {
    // Generate realistic fallback data based on approximate location
    const isNorthern = lat > 0;
    const isTropical = Math.abs(lat) < 23.5;

    return {
      temperature: isTropical
        ? 28 + Math.random() * 8
        : isNorthern
        ? 15 + Math.random() * 15
        : 20 + Math.random() * 10,
      precipitation: Math.random() * 10,
      humidity: 40 + Math.random() * 40,
      windSpeed: 5 + Math.random() * 10,
      pressure: 1013 + Math.random() * 20,
      uvIndex: Math.random() * 10,
    };
  }

  private getFallbackForecastData(): WeatherData[] {
    return Array.from({ length: 10 }, () => ({
      temperature: 20 + Math.random() * 15,
      precipitation: Math.random() * 8,
      humidity: 40 + Math.random() * 40,
      windSpeed: 5 + Math.random() * 10,
    }));
  }

  private getFallbackClimateRisk(location: LocationData): ClimateRiskPoint {
    const current = this.getFallbackWeatherData(location.lat, location.lon);
    const forecast = this.getFallbackForecastData();
    const risks = this.calculateRisks(current, forecast);

    return {
      location,
      current,
      forecast,
      risks,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const weatherService = new WeatherService();
