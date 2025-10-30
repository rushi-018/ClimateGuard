/**
 * NASA EONET Disaster Alerts
 * Real-time natural disaster events from Earth Observatory
 */

export interface DisasterAlert {
  id: string;
  type: "disaster";
  category:
    | "wildfire"
    | "flood"
    | "storm"
    | "drought"
    | "earthquake"
    | "volcano"
    | "other";
  title: string;
  description: string;
  severity: "Extreme" | "Severe" | "Moderate";
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  distance?: number; // miles from user location
  effective: Date;
  expires: Date;
  source: string;
  link?: string;
  raw?: any;
}

interface EONETEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  categories: Array<{
    id: string;
    title: string;
  }>;
  sources: Array<{
    id: string;
    url: string;
  }>;
  geometry: Array<{
    date: string;
    type: string;
    coordinates: number[];
  }>;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Map EONET category to our disaster type
 */
function mapCategory(categoryId: string): DisasterAlert["category"] {
  const mapping: { [key: string]: DisasterAlert["category"] } = {
    wildfires: "wildfire",
    floods: "flood",
    severeStorms: "storm",
    drought: "drought",
    earthquakes: "earthquake",
    volcanoes: "volcano",
  };
  return mapping[categoryId] || "other";
}

/**
 * Determine severity based on distance and category
 */
function determineSeverity(
  category: DisasterAlert["category"],
  distance: number
): DisasterAlert["severity"] {
  if (distance < 25) {
    return "Extreme"; // Very close, immediate threat
  }
  if (distance < 50) {
    return "Severe"; // Close enough to be dangerous
  }
  if (distance < 100) {
    return "Moderate"; // Nearby, monitor situation
  }
  return "Moderate";
}

/**
 * Fetch real disaster alerts from NASA EONET
 */
export async function fetchDisasterAlerts(
  userLat: number,
  userLon: number,
  locationName: string
): Promise<DisasterAlert[]> {
  try {
    // Fetch open (active) events from last 30 days
    const daysBack = 30;
    const response = await fetch(
      `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=${daysBack}&limit=50`
    );

    if (!response.ok) {
      console.warn("NASA EONET API failed:", response.status);
      return [];
    }

    const data = await response.json();
    const events: EONETEvent[] = data.events || [];
    const alerts: DisasterAlert[] = [];

    // Process each event
    for (const event of events) {
      // Get most recent coordinates
      const geometry = event.geometry[event.geometry.length - 1];
      if (!geometry || !geometry.coordinates) continue;

      const [disasterLon, disasterLat] = geometry.coordinates;

      // Calculate distance from user location
      const distance = calculateDistance(
        userLat,
        userLon,
        disasterLat,
        disasterLon
      );

      // Only alert if within 200 miles
      if (distance > 200) continue;

      const category = mapCategory(event.categories[0]?.id || "");
      const severity = determineSeverity(category, distance);

      // Generate alert message based on category and distance
      let description = event.description || event.title;

      if (distance < 25) {
        description = `IMMEDIATE THREAT: ${event.title} detected ${Math.round(
          distance
        )} miles away. ${getCategoryAdvice(category, "immediate")}`;
      } else if (distance < 50) {
        description = `WARNING: ${event.title} is ${Math.round(
          distance
        )} miles from your location. ${getCategoryAdvice(category, "close")}`;
      } else if (distance < 100) {
        description = `ALERT: ${event.title} detected ${Math.round(
          distance
        )} miles away. ${getCategoryAdvice(category, "nearby")}`;
      } else {
        description = `${event.title} is ${Math.round(
          distance
        )} miles away. Monitor for updates.`;
      }

      alerts.push({
        id: `disaster-${event.id}`,
        type: "disaster",
        category,
        title: event.title,
        description,
        severity,
        location: locationName,
        coordinates: {
          lat: disasterLat,
          lon: disasterLon,
        },
        distance: Math.round(distance),
        effective: new Date(geometry.date),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        source: "NASA EONET",
        link: event.link,
        raw: event,
      });
    }

    // Sort by distance (closest first)
    alerts.sort((a, b) => (a.distance || 999) - (b.distance || 999));

    return alerts;
  } catch (error) {
    console.error("Error fetching disaster alerts:", error);
    return [];
  }
}

/**
 * Get category-specific safety advice
 */
function getCategoryAdvice(
  category: DisasterAlert["category"],
  proximity: "immediate" | "close" | "nearby"
): string {
  const advice: { [key: string]: { [key: string]: string } } = {
    wildfire: {
      immediate:
        "Evacuate immediately. Follow official evacuation routes. Have emergency kit ready.",
      close:
        "Prepare to evacuate. Monitor air quality. Have emergency supplies packed.",
      nearby:
        "Stay alert for evacuation orders. Monitor air quality and avoid outdoor activities.",
    },
    flood: {
      immediate:
        "Move to higher ground immediately. Do not drive through flooded areas.",
      close:
        "Prepare to evacuate. Move valuables to upper floors. Monitor flood warnings.",
      nearby: "Stay informed about flood conditions. Avoid low-lying areas.",
    },
    storm: {
      immediate:
        "Seek shelter immediately. Stay away from windows. Monitor emergency alerts.",
      close:
        "Prepare for severe weather. Secure outdoor items. Have emergency supplies ready.",
      nearby:
        "Monitor weather conditions closely. Be prepared for severe weather.",
    },
    earthquake: {
      immediate:
        "Drop, Cover, and Hold. Stay away from windows and heavy objects.",
      close:
        "Prepare for aftershocks. Check for damage. Have emergency supplies ready.",
      nearby: "Monitor for aftershocks. Check emergency supplies.",
    },
    volcano: {
      immediate: "Evacuate immediately. Avoid ash fall areas. Protect airways.",
      close:
        "Prepare to evacuate. Monitor air quality. Have masks and emergency supplies.",
      nearby: "Monitor volcanic activity. Stay indoors if ash is present.",
    },
    drought: {
      immediate:
        "Extreme water conservation required. Follow all water restrictions.",
      close: "Conserve water. Follow local water use restrictions.",
      nearby: "Monitor water levels. Be mindful of water usage.",
    },
    other: {
      immediate: "Follow official emergency guidance.",
      close: "Monitor situation closely and follow official updates.",
      nearby: "Stay informed about the situation.",
    },
  };

  return advice[category]?.[proximity] || "Follow official emergency guidance.";
}

/**
 * Determine if a disaster alert should trigger voice announcement
 */
export function isDisasterAlertCritical(alert: DisasterAlert): boolean {
  // Critical if Extreme severity OR within 50 miles
  return (
    alert.severity === "Extreme" ||
    (alert.distance !== undefined && alert.distance < 50)
  );
}
