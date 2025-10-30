/**
 * Simplified Climate Risk Prediction
 * Using rule-based logic instead of TensorFlow to avoid errors
 */

interface WeatherInput {
  temperature: number; // °C
  precipitation: number; // mm
  humidity: number; // %
  windSpeed: number; // km/h
  pressure?: number; // hPa
  latitude: number; // degrees
  longitude: number; // degrees
}

interface RiskPrediction {
  overallRisk: number; // 0-1
  risks: {
    flood: number;
    drought: number;
    heatwave: number;
    storm: number;
    wildfire: number;
  };
  confidence: number;
  factors: string[];
}

class SimpleClimateRiskPredictor {
  private static instance: SimpleClimateRiskPredictor;

  static getInstance(): SimpleClimateRiskPredictor {
    if (!SimpleClimateRiskPredictor.instance) {
      SimpleClimateRiskPredictor.instance = new SimpleClimateRiskPredictor();
    }
    return SimpleClimateRiskPredictor.instance;
  }

  /**
   * Simple rule-based prediction - no TensorFlow needed
   */
  async predict(input: WeatherInput): Promise<RiskPrediction> {
    const { temperature, precipitation, humidity, windSpeed, latitude } = input;

    // Simple rule-based risk calculation
    const risks = {
      flood: this.calculateFloodRisk(precipitation, humidity),
      drought: this.calculateDroughtRisk(precipitation, temperature, humidity),
      heatwave: this.calculateHeatwaveRisk(temperature, humidity, latitude),
      storm: this.calculateStormRisk(windSpeed, temperature, precipitation),
      wildfire: this.calculateWildfireRisk(temperature, humidity, windSpeed),
    };

    const overallRisk = Math.max(...Object.values(risks));
    const confidence = 0.85; // Fixed confidence for simplicity

    const factors = this.identifyRiskFactors(risks, input);

    return {
      overallRisk,
      risks,
      confidence,
      factors,
    };
  }

  private calculateFloodRisk(precipitation: number, humidity: number): number {
    let risk = 0;
    if (precipitation > 50) risk += 0.4;
    if (precipitation > 100) risk += 0.3;
    if (humidity > 80) risk += 0.2;
    return Math.min(risk, 1.0);
  }

  private calculateDroughtRisk(
    precipitation: number,
    temperature: number,
    humidity: number
  ): number {
    let risk = 0;
    if (precipitation < 10) risk += 0.4;
    if (temperature > 35) risk += 0.3;
    if (humidity < 30) risk += 0.3;
    return Math.min(risk, 1.0);
  }

  private calculateHeatwaveRisk(
    temperature: number,
    humidity: number,
    latitude: number
  ): number {
    let risk = 0;
    if (temperature > 35) risk += 0.5;
    if (temperature > 40) risk += 0.3;
    if (humidity > 70 && temperature > 30) risk += 0.2; // Heat index effect
    // Latitude adjustment - closer to equator = higher base risk
    const latitudeRisk = Math.max(0, (30 - Math.abs(latitude)) / 30) * 0.1;
    risk += latitudeRisk;
    return Math.min(risk, 1.0);
  }

  private calculateStormRisk(
    windSpeed: number,
    temperature: number,
    precipitation: number
  ): number {
    let risk = 0;
    if (windSpeed > 40) risk += 0.4;
    if (windSpeed > 60) risk += 0.3;
    if (precipitation > 20 && windSpeed > 30) risk += 0.3;
    return Math.min(risk, 1.0);
  }

  private calculateWildfireRisk(
    temperature: number,
    humidity: number,
    windSpeed: number
  ): number {
    let risk = 0;
    if (temperature > 30 && humidity < 40) risk += 0.4;
    if (windSpeed > 20) risk += 0.3;
    if (temperature > 35 && humidity < 20) risk += 0.3;
    return Math.min(risk, 1.0);
  }

  private identifyRiskFactors(risks: any, input: WeatherInput): string[] {
    const factors: string[] = [];

    if (risks.heatwave > 0.6) factors.push("High temperature conditions");
    if (risks.flood > 0.6) factors.push("Heavy precipitation expected");
    if (risks.drought > 0.6)
      factors.push("Low precipitation and high temperature");
    if (risks.storm > 0.6) factors.push("High wind speeds");
    if (risks.wildfire > 0.6) factors.push("Hot, dry, and windy conditions");

    if (factors.length === 0) factors.push("Normal weather conditions");

    return factors;
  }
}

// Export singleton instance
export const climateRiskPredictor = SimpleClimateRiskPredictor.getInstance();
export type { WeatherInput, RiskPrediction };
