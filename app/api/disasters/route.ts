// Real-time disaster monitoring API
export async function GET() {
  try {
    const alerts = await Promise.all([
      fetchNOAAAlerts(),
      fetchGDACSAlerts(),
      fetchEMSCAlerts(), // European Mediterranean Seismological Centre
      fetchUSGSEarthquakes(),
    ]);

    // Combine and prioritize alerts
    const combinedAlerts = alerts.flat().sort((a: any, b: any) => {
      const severityOrder: Record<string, number> = {
        Critical: 4,
        High: 3,
        Medium: 2,
        Low: 1,
      };
      return (
        (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      );
    });

    return Response.json(
      {
        totalAlerts: combinedAlerts.length,
        criticalAlerts: combinedAlerts.filter((a) => a.severity === "Critical")
          .length,
        alerts: combinedAlerts.slice(0, 10), // Limit to 10 alerts to avoid cache issues
        lastUpdated: new Date().toISOString(),
        sources: ["NOAA", "GDACS", "EMSC", "USGS"],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Disaster monitoring API error:", error);
    return getFallbackAlerts();
  }
}

// NOAA Weather Alerts (US-focused but global impact)
async function fetchNOAAAlerts() {
  try {
    const response = await fetch(
      "https://api.weather.gov/alerts/active?limit=50",
      {
        headers: { "User-Agent": "ClimateGuard/1.0 (contact@climateguard.ai)" },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );
    const data = await response.json();

    return (
      data.features?.map((alert: any) => ({
        id: alert.id,
        title: alert.properties.headline,
        description:
          alert.properties.description?.substring(0, 100) + "..." ||
          "No description available",
        severity: mapNOAASeverity(alert.properties.severity),
        type: categorizeAlertType(alert.properties.event),
        location: alert.properties.areaDesc,
        coordinates: alert.geometry?.coordinates?.[0]?.[0] || null,
        startTime: alert.properties.onset,
        endTime: alert.properties.expires,
        source: "NOAA",
        url: alert.properties.web,
        isRealTime: true,
      })) || []
    );
  } catch (error) {
    console.warn("NOAA API failed:", error);
    return [];
  }
}

// Global Disaster Alert and Coordination System
async function fetchGDACSAlerts() {
  try {
    const response = await fetch("https://www.gdacs.org/xml/rss.xml", {
      headers: { "User-Agent": "ClimateGuard/1.0" },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    const xmlText = await response.text();

    // Basic XML parsing for RSS feed
    const alerts = parseGDACSXML(xmlText);

    return alerts.map((alert: any) => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: mapGDACSSeverity(alert.severity),
      type: alert.eventType,
      location: alert.location,
      coordinates: null, // GDACS coordinates need separate parsing
      startTime: alert.date,
      source: "GDACS",
      url: alert.link,
      isRealTime: true,
    }));
  } catch (error) {
    console.warn("GDACS API failed:", error);
    return [];
  }
}

// USGS Earthquake Data
async function fetchUSGSEarthquakes() {
  try {
    const response = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"
    );
    const data = await response.json();

    return data.features.map((quake: any) => ({
      id: quake.id,
      title: `Magnitude ${quake.properties.mag} Earthquake`,
      description: quake.properties.title,
      severity:
        quake.properties.mag > 7
          ? "Critical"
          : quake.properties.mag > 5.5
          ? "High"
          : "Medium",
      type: "Earthquake",
      location: quake.properties.place,
      coordinates: [
        quake.geometry.coordinates[1],
        quake.geometry.coordinates[0],
      ], // Lat, Lon
      startTime: new Date(quake.properties.time).toISOString(),
      source: "USGS",
      url: quake.properties.url,
      magnitude: quake.properties.mag,
      depth: quake.geometry.coordinates[2],
      isRealTime: true,
    }));
  } catch (error) {
    console.warn("USGS API failed:", error);
    return [];
  }
}

// European Mediterranean Seismological Centre
async function fetchEMSCAlerts() {
  try {
    // EMSC provides real-time seismic data
    const response = await fetch(
      "https://www.seismicportal.eu/fdsnws/event/1/query?format=json&limit=20&minmag=4.5"
    );
    const data = await response.json();

    return (
      data.features?.map((event: any) => ({
        id: event.id,
        title: `Magnitude ${event.properties.mag} Seismic Event`,
        description: `${event.properties.flynn_region} - Depth: ${event.geometry.coordinates[2]}km`,
        severity: event.properties.mag > 6.5 ? "Critical" : "High",
        type: "Seismic Activity",
        location: event.properties.flynn_region,
        coordinates: [
          event.geometry.coordinates[1],
          event.geometry.coordinates[0],
        ],
        startTime: event.properties.time,
        source: "EMSC",
        magnitude: event.properties.mag,
        isRealTime: true,
      })) || []
    );
  } catch (error) {
    console.warn("EMSC API failed:", error);
    return [];
  }
}

// Utility functions
function mapNOAASeverity(severity: string): string {
  const severityMap: Record<string, string> = {
    Extreme: "Critical",
    Severe: "High",
    Moderate: "Medium",
    Minor: "Low",
  };
  return severityMap[severity] || "Medium";
}

function mapGDACSSeverity(severity: string): string {
  // GDACS uses Red/Orange/Green system
  if (severity?.includes("Red")) return "Critical";
  if (severity?.includes("Orange")) return "High";
  return "Medium";
}

function categorizeAlertType(eventType: string): string {
  const typeMap = {
    Hurricane: "Hurricane",
    Tornado: "Tornado",
    Flood: "Flood",
    "Flash Flood": "Flash Flood",
    Heat: "Heat Wave",
    "Winter Storm": "Winter Storm",
    Fire: "Wildfire",
  };

  for (const [key, value] of Object.entries(typeMap)) {
    if (eventType?.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return "Weather Alert";
}

function parseGDACSXML(xmlText: string) {
  // Simple XML parsing for RSS items
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const item = match[1];
    const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const description =
      item.match(/<description>(.*?)<\/description>/)?.[1] || "";
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
    const date = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

    items.push({
      id: Date.now() + Math.random(),
      title: title.replace(/<!\[CDATA\[(.*?)\]\]>/, "$1"),
      description: description
        .replace(/<!\[CDATA\[(.*?)\]\]>/, "$1")
        .substring(0, 200),
      link,
      date,
      severity: title.includes("Red")
        ? "Red"
        : title.includes("Orange")
        ? "Orange"
        : "Green",
      eventType: extractEventType(title),
      location: extractLocation(title),
    });
  }

  return items;
}

function extractEventType(title: string): string {
  if (title.includes("Cyclone") || title.includes("Hurricane"))
    return "Cyclone";
  if (title.includes("Earthquake")) return "Earthquake";
  if (title.includes("Flood")) return "Flood";
  if (title.includes("Volcano")) return "Volcanic Activity";
  if (title.includes("Drought")) return "Drought";
  return "Natural Disaster";
}

function extractLocation(title: string): string {
  // Extract location from GDACS title format
  const match = title.match(/in\s+([^-]+)/);
  return match?.[1]?.trim() || "Global";
}

function getFallbackAlerts() {
  // Provide realistic fallback alerts based on current global climate patterns
  const fallbackAlerts = [
    {
      id: "fallback-1",
      title: "Global Temperature Monitoring Alert",
      description:
        "Continuing above-average temperatures reported globally. Monitor for heat-related health risks.",
      severity: "Medium",
      type: "Heat Monitoring",
      location: "Global",
      source: "ClimateGuard",
      isRealTime: false,
      startTime: new Date().toISOString(),
    },
    {
      id: "fallback-2",
      title: "Seasonal Weather Pattern Advisory",
      description:
        "Regional weather services recommend monitoring local conditions for seasonal climate variations.",
      severity: "Low",
      type: "General Advisory",
      location: "Regional",
      source: "ClimateGuard",
      isRealTime: false,
      startTime: new Date().toISOString(),
    },
  ];

  return Response.json({
    totalAlerts: fallbackAlerts.length,
    criticalAlerts: 0,
    alerts: fallbackAlerts,
    lastUpdated: new Date().toISOString(),
    sources: ["Fallback Data"],
    note: "Real-time data temporarily unavailable",
  });
}
