export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("latitude") || "40.7128";
  const longitude = searchParams.get("longitude") || "-74.006";
  return await handleForecast(latitude, longitude);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lon, latitude, longitude } = body;
    const finalLat = lat || latitude || "40.7128";
    const finalLon = lon || longitude || "-74.006";
    return await handleForecast(finalLat.toString(), finalLon.toString());
  } catch (error) {
    return await handleForecast("40.7128", "-74.006");
  }
}

async function handleForecast(latitude: string, longitude: string) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto&forecast_days=10`
    );

    const data = await response.json();
    const daily = data.daily;

    // Calculate risk scores for each day
    const forecast = daily.time.map((date: string, index: number) => {
      const tempMax = daily.temperature_2m_max[index];
      const tempMin = daily.temperature_2m_min[index];
      const precip = daily.precipitation_sum[index];
      const humidity = daily.relative_humidity_2m_mean[index];
      const windSpeed = daily.wind_speed_10m_max[index];

      // Risk calculation logic
      let floodRisk = 0;
      let droughtRisk = 0;
      let heatwaveRisk = 0;

      // Flood risk: high precipitation + high humidity
      if (precip > 10) floodRisk += 40;
      if (precip > 20) floodRisk += 30;
      if (humidity > 80) floodRisk += 20;
      if (windSpeed > 15) floodRisk += 10;

      // Drought risk: low precipitation + high temperature
      if (precip < 1) droughtRisk += 30;
      if (tempMax > 30) droughtRisk += 25;
      if (humidity < 40) droughtRisk += 25;
      if (windSpeed > 20) droughtRisk += 20;

      // Heatwave risk: high temperature + low humidity
      if (tempMax > 35) heatwaveRisk += 50;
      if (tempMax > 30) heatwaveRisk += 30;
      if (humidity < 30) heatwaveRisk += 20;

      // Overall risk score (highest of the three)
      const overallRisk = Math.max(
        Math.min(floodRisk, 100),
        Math.min(droughtRisk, 100),
        Math.min(heatwaveRisk, 100)
      );

      return {
        date,
        floodRisk: Math.min(floodRisk, 100) / 100, // Normalize to 0-1
        droughtRisk: Math.min(droughtRisk, 100) / 100,
        heatwaveRisk: Math.min(heatwaveRisk, 100) / 100,
        stormRisk: Math.min(Math.max(windSpeed - 10, 0) * 5, 100) / 100,
        temperature: (tempMax + tempMin) / 2,
        temperatureMax: tempMax,
        temperatureMin: tempMin,
        precipitation: precip,
        humidity,
        windSpeed,
      };
    });

    return Response.json({
      forecast,
      location: {
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
      },
    });
  } catch (error) {
    console.error("Forecast API error:", error);

    // Fallback mock data
    const mockForecast = Array.from({ length: 10 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);

      return {
        date: date.toISOString().split("T")[0],
        floodRisk: 0.2 + Math.sin(i * 0.5) * 0.2 + Math.random() * 0.1,
        droughtRisk: 0.3 - Math.sin(i * 0.3) * 0.15 + Math.random() * 0.1,
        heatwaveRisk: 0.25 + Math.cos(i * 0.4) * 0.2 + Math.random() * 0.1,
        stormRisk: 0.15 + Math.sin(i * 0.7) * 0.15 + Math.random() * 0.1,
        temperature: 20 + Math.random() * 15,
        temperatureMax: 25 + Math.random() * 10,
        temperatureMin: 15 + Math.random() * 8,
        precipitation: Math.random() * 10,
        humidity: 40 + Math.random() * 40,
        windSpeed: 5 + Math.random() * 10,
      };
    });

    return Response.json({
      forecast: mockForecast,
      location: {
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
      },
      error: "Using mock data due to API error",
    });
  }
}
