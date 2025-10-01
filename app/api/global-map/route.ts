export async function GET() {
  try {
    const cities = [
      { name: "New York", lat: 40.7128, lon: -74.006 },
      { name: "London", lat: 51.5074, lon: -0.1278 },
      { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
      { name: "Sydney", lat: -33.8688, lon: 151.2093 },
      { name: "Mumbai", lat: 19.076, lon: 72.8777 },
      { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
      { name: "Cairo", lat: 30.0444, lon: 31.2357 },
      { name: "Lagos", lat: 6.5244, lon: 3.3792 },
    ]

    const features = await Promise.all(
      cities.map(async (city) => {
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,precipitation,relative_humidity_2m&timezone=auto`,
          )
          const data = await response.json()
          const current = data.current

          // Determine risk type and severity based on real data
          let riskType = "Low"
          let severity = "Low"

          if (current.temperature_2m > 35) {
            riskType = "Heatwave"
            severity = "High"
          } else if (current.temperature_2m > 30) {
            riskType = "Heatwave"
            severity = "Medium"
          } else if (current.precipitation > 15) {
            riskType = "Flood"
            severity = "High"
          } else if (current.precipitation > 5) {
            riskType = "Flood"
            severity = "Medium"
          } else if (current.precipitation < 0.1 && current.temperature_2m > 25) {
            riskType = "Drought"
            severity = current.temperature_2m > 30 ? "High" : "Medium"
          }

          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [city.lon, city.lat],
            },
            properties: {
              riskType,
              severity,
              city: city.name,
              temperature: current.temperature_2m,
              precipitation: current.precipitation,
              humidity: current.relative_humidity_2m,
            },
          }
        } catch (error) {
          console.error(`Error fetching data for ${city.name}:`, error)
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [city.lon, city.lat],
            },
            properties: {
              riskType: "Unknown",
              severity: "Low",
              city: city.name,
              temperature: null,
              precipitation: null,
              humidity: null,
            },
          }
        }
      }),
    )

    return Response.json({
      type: "FeatureCollection",
      features,
    })
  } catch (error) {
    console.error("Global map API error:", error)
    return Response.json({ error: "Failed to fetch global climate data" }, { status: 500 })
  }
}
