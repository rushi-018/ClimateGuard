import { climateRiskPredictor } from "@/lib/ml-model-simple";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      temperature,
      precipitation,
      humidity,
      latitude,
      longitude,
      windSpeed,
      pressure,
    } = body;

    // Fetch current weather data if not provided
    let weatherData;
    if (!temperature || !precipitation || !humidity) {
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${
            latitude || 40.7128
          }&longitude=${
            longitude || -74.006
          }&current=temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m,surface_pressure&timezone=auto`
        );
        weatherData = await weatherResponse.json();
      } catch (error) {
        console.warn("Weather API failed, using input data or defaults");
      }
    }

    // Prepare input for ML model
    const current = weatherData?.current;
    const mlInput = {
      temperature: temperature || current?.temperature_2m || 20,
      precipitation: precipitation || current?.precipitation || 0,
      humidity: humidity || current?.relative_humidity_2m || 50,
      windSpeed: windSpeed || current?.wind_speed_10m || 10,
      pressure: pressure || current?.surface_pressure,
      latitude: latitude || 40.7128,
      longitude: longitude || -74.006,
    };

    // Get ML prediction
    const prediction = await climateRiskPredictor.predict(mlInput);

    // Convert to percentage format for compatibility
    const response = {
      flood_risk: Math.round(prediction.risks.flood * 100),
      drought_risk: Math.round(prediction.risks.drought * 100),
      heatwave_risk: Math.round(prediction.risks.heatwave * 100),
      storm_risk: Math.round(prediction.risks.storm * 100),
      overall_risk: Math.round(prediction.overallRisk * 100),
      overallRisk: prediction.overallRisk,
      confidence: prediction.confidence,
      factors: prediction.factors,
      weather_data: {
        temperature: mlInput.temperature,
        precipitation: mlInput.precipitation,
        humidity: mlInput.humidity,
        wind_speed: mlInput.windSpeed,
        pressure: mlInput.pressure,
      },
      location: {
        latitude: mlInput.latitude,
        longitude: mlInput.longitude,
      },
      model_info: { type: "rule-based", version: "1.0" },
      timestamp: new Date().toISOString(),
    };

    return Response.json(response);
  } catch (error) {
    console.error("Prediction API error:", error);

    // Fallback response
    return Response.json({
      flood_risk: 30 + Math.random() * 40,
      drought_risk: 25 + Math.random() * 35,
      heatwave_risk: 35 + Math.random() * 30,
      storm_risk: 20 + Math.random() * 25,
      overall_risk: 50,
      confidence: 0.7,
      weather_data: {
        temperature: 22,
        precipitation: 5,
        humidity: 60,
        wind_speed: 12,
      },
      location: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      model_info: { modelType: "Fallback", initialized: false },
      timestamp: new Date().toISOString(),
      error: "Using fallback data due to API error",
    });
  }
}
