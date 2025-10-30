// Heat Index calculation for enhanced risk assessment
function calculateHeatIndex(tempC: number, humidity: number): number {
  // Convert Celsius to Fahrenheit for standard heat index formula
  const tempF = (tempC * 9) / 5 + 32;

  if (tempF < 80) return tempC; // Heat index not significant below 80°F

  // Rothfusz regression formula for heat index
  const hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * humidity -
    0.22475541 * tempF * humidity -
    6.83783e-3 * tempF * tempF -
    5.481717e-2 * humidity * humidity +
    1.22874e-3 * tempF * tempF * humidity +
    8.5282e-4 * tempF * humidity * humidity -
    1.99e-6 * tempF * tempF * humidity * humidity;

  // Convert back to Celsius
  return Math.round((((hi - 32) * 5) / 9) * 10) / 10;
}

export async function GET() {
  try {
    // Comprehensive global climate-vulnerable cities
    const cities = [
      // North America - Heat/Hurricane Risk
      {
        name: "Phoenix",
        country: "USA",
        lat: 33.4484,
        lon: -112.074,
        riskType: "Extreme Heat",
      },
      {
        name: "Miami",
        country: "USA",
        lat: 25.7617,
        lon: -80.1918,
        riskType: "Hurricane/Sea Level",
      },
      {
        name: "New Orleans",
        country: "USA",
        lat: 29.9511,
        lon: -90.0715,
        riskType: "Hurricane/Flood",
      },
      {
        name: "Los Angeles",
        country: "USA",
        lat: 34.0522,
        lon: -118.2437,
        riskType: "Wildfire/Drought",
      },
      {
        name: "New York",
        country: "USA",
        lat: 40.7128,
        lon: -74.006,
        riskType: "Storm Surge",
      },
      {
        name: "Toronto",
        country: "Canada",
        lat: 43.6532,
        lon: -79.3832,
        riskType: "Extreme Weather",
      },
      {
        name: "Mexico City",
        country: "Mexico",
        lat: 19.4326,
        lon: -99.1332,
        riskType: "Water Stress",
      },

      // South America - Flooding/Drought
      {
        name: "São Paulo",
        country: "Brazil",
        lat: -23.5505,
        lon: -46.6333,
        riskType: "Water Crisis",
      },
      {
        name: "Rio de Janeiro",
        country: "Brazil",
        lat: -22.9068,
        lon: -43.1729,
        riskType: "Landslide/Heat",
      },
      {
        name: "Lima",
        country: "Peru",
        lat: -12.0464,
        lon: -77.0428,
        riskType: "Water Scarcity",
      },
      {
        name: "Buenos Aires",
        country: "Argentina",
        lat: -34.6118,
        lon: -58.396,
        riskType: "Flooding",
      },
      {
        name: "Bogotá",
        country: "Colombia",
        lat: 4.711,
        lon: -74.0721,
        riskType: "Water Stress",
      },

      // Europe - Heat Waves/Flooding
      {
        name: "London",
        country: "UK",
        lat: 51.5074,
        lon: -0.1278,
        riskType: "Flooding",
      },
      {
        name: "Paris",
        country: "France",
        lat: 48.8566,
        lon: 2.3522,
        riskType: "Heat Wave",
      },
      {
        name: "Madrid",
        country: "Spain",
        lat: 40.4168,
        lon: -3.7038,
        riskType: "Extreme Heat",
      },
      {
        name: "Rome",
        country: "Italy",
        lat: 41.9028,
        lon: 12.4964,
        riskType: "Heat/Drought",
      },
      {
        name: "Amsterdam",
        country: "Netherlands",
        lat: 52.3676,
        lon: 4.9041,
        riskType: "Sea Level Rise",
      },
      {
        name: "Berlin",
        country: "Germany",
        lat: 52.52,
        lon: 13.405,
        riskType: "Extreme Weather",
      },
      {
        name: "Athens",
        country: "Greece",
        lat: 37.9838,
        lon: 23.7275,
        riskType: "Heat/Wildfire",
      },

      // Asia-Pacific - Typhoons/Heat/Flooding
      {
        name: "Mumbai",
        country: "India",
        lat: 19.076,
        lon: 72.8777,
        riskType: "Monsoon Flooding",
      },
      {
        name: "Delhi",
        country: "India",
        lat: 28.7041,
        lon: 77.1025,
        riskType: "Extreme Heat",
      },
      {
        name: "Kolkata",
        country: "India",
        lat: 22.5726,
        lon: 88.3639,
        riskType: "Cyclone/Flood",
      },
      {
        name: "Chennai",
        country: "India",
        lat: 13.0827,
        lon: 80.2707,
        riskType: "Cyclone/Heat",
      },
      {
        name: "Dhaka",
        country: "Bangladesh",
        lat: 23.8103,
        lon: 90.4125,
        riskType: "Flood/Cyclone",
      },
      {
        name: "Jakarta",
        country: "Indonesia",
        lat: -6.2088,
        lon: 106.8456,
        riskType: "Sinking/Flood",
      },
      {
        name: "Manila",
        country: "Philippines",
        lat: 14.5995,
        lon: 120.9842,
        riskType: "Typhoon",
      },
      {
        name: "Bangkok",
        country: "Thailand",
        lat: 13.7563,
        lon: 100.5018,
        riskType: "Flooding",
      },
      {
        name: "Ho Chi Minh City",
        country: "Vietnam",
        lat: 10.8231,
        lon: 106.6297,
        riskType: "Sea Level/Storm",
      },
      {
        name: "Tokyo",
        country: "Japan",
        lat: 35.6762,
        lon: 139.6503,
        riskType: "Typhoon/Heat",
      },
      {
        name: "Osaka",
        country: "Japan",
        lat: 34.6937,
        lon: 135.5023,
        riskType: "Typhoon",
      },
      {
        name: "Seoul",
        country: "South Korea",
        lat: 37.5665,
        lon: 126.978,
        riskType: "Extreme Weather",
      },
      {
        name: "Beijing",
        country: "China",
        lat: 39.9042,
        lon: 116.4074,
        riskType: "Drought/Sandstorm",
      },
      {
        name: "Shanghai",
        country: "China",
        lat: 31.2304,
        lon: 121.4737,
        riskType: "Typhoon/Heat",
      },
      {
        name: "Hong Kong",
        country: "China",
        lat: 22.3193,
        lon: 114.1694,
        riskType: "Typhoon",
      },
      {
        name: "Singapore",
        country: "Singapore",
        lat: 1.3521,
        lon: 103.8198,
        riskType: "Heat/Storm",
      },

      // Middle East - Extreme Heat/Water Stress
      {
        name: "Dubai",
        country: "UAE",
        lat: 25.2048,
        lon: 55.2708,
        riskType: "Extreme Heat",
      },
      {
        name: "Riyadh",
        country: "Saudi Arabia",
        lat: 24.7136,
        lon: 46.6753,
        riskType: "Extreme Heat",
      },
      {
        name: "Tehran",
        country: "Iran",
        lat: 35.6892,
        lon: 51.389,
        riskType: "Water Stress",
      },
      {
        name: "Kuwait City",
        country: "Kuwait",
        lat: 29.3759,
        lon: 47.9774,
        riskType: "Extreme Heat",
      },
      {
        name: "Doha",
        country: "Qatar",
        lat: 25.2854,
        lon: 51.531,
        riskType: "Extreme Heat",
      },

      // Africa - Drought/Heat/Flooding
      {
        name: "Lagos",
        country: "Nigeria",
        lat: 6.5244,
        lon: 3.3792,
        riskType: "Coastal Flooding",
      },
      {
        name: "Cairo",
        country: "Egypt",
        lat: 30.0444,
        lon: 31.2357,
        riskType: "Heat/Water Stress",
      },
      {
        name: "Cape Town",
        country: "South Africa",
        lat: -33.9249,
        lon: 18.4241,
        riskType: "Water Crisis",
      },
      {
        name: "Johannesburg",
        country: "South Africa",
        lat: -26.2041,
        lon: 28.0473,
        riskType: "Water Stress",
      },
      {
        name: "Nairobi",
        country: "Kenya",
        lat: -1.2921,
        lon: 36.8219,
        riskType: "Drought",
      },
      {
        name: "Dar es Salaam",
        country: "Tanzania",
        lat: -6.7924,
        lon: 39.2083,
        riskType: "Sea Level Rise",
      },
      {
        name: "Accra",
        country: "Ghana",
        lat: 5.6037,
        lon: -0.187,
        riskType: "Coastal Erosion",
      },
      {
        name: "Casablanca",
        country: "Morocco",
        lat: 33.5731,
        lon: -7.5898,
        riskType: "Water Stress",
      },

      // Oceania - Sea Level Rise/Extreme Weather
      {
        name: "Sydney",
        country: "Australia",
        lat: -33.8688,
        lon: 151.2093,
        riskType: "Wildfire/Heat",
      },
      {
        name: "Melbourne",
        country: "Australia",
        lat: -37.8136,
        lon: 144.9631,
        riskType: "Extreme Weather",
      },
      {
        name: "Perth",
        country: "Australia",
        lat: -31.9505,
        lon: 115.8605,
        riskType: "Drought/Heat",
      },
      {
        name: "Auckland",
        country: "New Zealand",
        lat: -36.8485,
        lon: 174.7633,
        riskType: "Storm/Flood",
      },

      // Island Nations - Sea Level Rise Critical
      {
        name: "Malé",
        country: "Maldives",
        lat: 4.1755,
        lon: 73.5093,
        riskType: "Sea Level Rise",
      },
      {
        name: "Suva",
        country: "Fiji",
        lat: -18.1248,
        lon: 178.4501,
        riskType: "Sea Level Rise",
      },
    ];

    const features = await Promise.all(
      cities.map(async (city) => {
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,precipitation,relative_humidity_2m&timezone=auto`
          );
          const data = await response.json();
          const current = data.current;

          // Advanced risk assessment based on city's primary risk and current conditions
          let riskType = city.riskType || "Low";
          let severity = "Low";
          let riskScore = 10;

          // Temperature-based risks
          if (current.temperature_2m > 40) {
            riskType = "Extreme Heat";
            severity = "Critical";
            riskScore = 95;
          } else if (current.temperature_2m > 35) {
            riskType = "Heatwave";
            severity = "High";
            riskScore = 80;
          } else if (current.temperature_2m > 30) {
            riskType = "Heat Stress";
            severity = "Medium";
            riskScore = 60;
          }

          // Precipitation-based risks
          if (current.precipitation > 25) {
            riskType = "Severe Flooding";
            severity = "Critical";
            riskScore = 90;
          } else if (current.precipitation > 15) {
            riskType = "Flood Warning";
            severity = "High";
            riskScore = 75;
          } else if (current.precipitation > 8) {
            riskType = "Flood Watch";
            severity = "Medium";
            riskScore = 50;
          }

          // Drought conditions
          if (current.precipitation < 0.1 && current.temperature_2m > 30) {
            riskType = "Severe Drought";
            severity = "High";
            riskScore = 85;
          } else if (
            current.precipitation < 0.5 &&
            current.temperature_2m > 25
          ) {
            riskType = "Drought Conditions";
            severity = "Medium";
            riskScore = 65;
          }

          // Enhanced risk scoring based on humidity and city context
          if (
            current.relative_humidity_2m > 80 &&
            current.temperature_2m > 30
          ) {
            riskScore += 10; // Heat index amplification
            riskType = "Heat Index Warning";
          }

          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [city.lon, city.lat],
            },
            properties: {
              lat: city.lat,
              lon: city.lon,
              city: city.name,
              country: city.country,
              riskType,
              severity,
              riskScore,
              primaryRisk: city.riskType, // City's known climate vulnerability
              temperature: Math.round(current.temperature_2m * 10) / 10 || 0,
              precipitation: Math.round(current.precipitation * 10) / 10 || 0,
              humidity: Math.round(current.relative_humidity_2m) || 0,
              windSpeed: 10, // Will be enhanced with real data
              heatIndex:
                current.temperature_2m && current.relative_humidity_2m
                  ? calculateHeatIndex(
                      current.temperature_2m,
                      current.relative_humidity_2m
                    )
                  : null,
              alertLevel:
                severity === "Critical"
                  ? "URGENT"
                  : severity === "High"
                  ? "WARNING"
                  : "WATCH",
              lastUpdated: new Date().toISOString(),
              dataSource: "Open-Meteo Real-Time API",
            },
          };
        } catch (error) {
          console.error(`Error fetching data for ${city.name}:`, error);
          // Return city's known risk profile as fallback
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [city.lon, city.lat],
            },
            properties: {
              lat: city.lat,
              lon: city.lon,
              city: city.name,
              country: city.country,
              riskType: city.riskType || "Data Unavailable",
              severity: "Medium", // Conservative estimate
              riskScore: 40,
              primaryRisk: city.riskType,
              temperature: 25, // Global average
              precipitation: 2,
              humidity: 60,
              windSpeed: 10,
              heatIndex: null,
              alertLevel: "WATCH",
              lastUpdated: new Date().toISOString(),
              dataSource: "Fallback - City Risk Profile",
              isRealTime: false,
            },
          };
        }
      })
    );

    return Response.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("Global map API error:", error);
    return Response.json(
      { error: "Failed to fetch global climate data" },
      { status: 500 }
    );
  }
}
