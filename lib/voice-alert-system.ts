/**
 * Voice Alert System
 * Intelligent voice announcements for critical climate events
 */

import {
  fetchWeatherAlerts,
  isWeatherAlertCritical,
  type WeatherAlert,
} from "./alert-sources/weather-alerts";
import {
  fetchDisasterAlerts,
  isDisasterAlertCritical,
  type DisasterAlert,
} from "./alert-sources/disaster-alerts";
import {
  fetchRiskAlerts,
  isRiskAlertCritical,
  type RiskAlert,
} from "./alert-sources/risk-alerts";
import {
  fetchAirQualityAlerts,
  isAirQualityAlertCritical,
  type AirQualityAlert,
} from "./alert-sources/air-quality-alerts";

export type CombinedAlert =
  | WeatherAlert
  | DisasterAlert
  | RiskAlert
  | AirQualityAlert;

export interface VoiceAlertSettings {
  enabled: boolean;
  minSeverity: "Extreme" | "Severe" | "Moderate";
  checkInterval: number; // milliseconds
  muteUntil?: number; // timestamp
  maxAlertsPerSession: number;
}

export interface AlertHistory {
  [fingerprint: string]: {
    firstSeen: number;
    lastAnnounced: number;
    timesAnnounced: number;
    userDismissed: boolean;
    severityAtAnnouncement: string;
  };
}

const DEFAULT_SETTINGS: VoiceAlertSettings = {
  enabled: false, // Opt-in by default
  minSeverity: "Extreme", // Only critical by default
  checkInterval: 120000, // 2 minutes
  maxAlertsPerSession: 10,
};

const MINIMUM_ANNOUNCEMENT_INTERVAL = 120000; // 2 minutes between announcements
const DUPLICATE_THRESHOLD = 7200000; // 2 hours - don't re-announce same alert

/**
 * Generate unique fingerprint for alert deduplication
 */
function generateAlertFingerprint(alert: CombinedAlert): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  if ("event" in alert) {
    // Weather alert
    return `weather-${alert.event}-${alert.location}-${date}`;
  }
  if ("category" in alert && alert.type === "disaster") {
    // Disaster alert
    return `disaster-${alert.category}-${alert.coordinates.lat.toFixed(
      1
    )}-${alert.coordinates.lon.toFixed(1)}-${date}`;
  }
  if ("riskType" in alert) {
    // Risk alert
    return `risk-${alert.riskType}-${alert.location}-${alert.severity}-${date}`;
  }
  if ("aqi" in alert) {
    // Air quality alert
    const aqiBracket = Math.floor(alert.aqi / 50) * 50; // Group by 50s
    return `aqi-${alert.location}-${aqiBracket}-${date}`;
  }

  // Fallback for any alert type (should never reach here with proper types)
  const fallbackAlert = alert as WeatherAlert;
  return `alert-${fallbackAlert.type || "unknown"}-${
    fallbackAlert.location || "unknown"
  }-${date}`;
}

/**
 * Get alert history from localStorage
 */
function getAlertHistory(): AlertHistory {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem("voiceAlertHistory");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save alert history to localStorage
 */
function saveAlertHistory(history: AlertHistory): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("voiceAlertHistory", JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save alert history:", error);
  }
}

/**
 * Get voice alert settings
 */
export function getVoiceAlertSettings(): VoiceAlertSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem("voiceAlertSettings");
    return stored
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save voice alert settings
 */
export function saveVoiceAlertSettings(
  settings: Partial<VoiceAlertSettings>
): void {
  if (typeof window === "undefined") return;

  try {
    const current = getVoiceAlertSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem("voiceAlertSettings", JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save voice alert settings:", error);
  }
}

/**
 * Check if alert should be announced
 */
function shouldAnnounceAlert(
  alert: CombinedAlert,
  fingerprint: string,
  settings: VoiceAlertSettings
): boolean {
  // 1. Check if voice alerts are enabled
  if (!settings.enabled) return false;

  // 2. Check if muted
  if (settings.muteUntil && Date.now() < settings.muteUntil) return false;

  // 3. Check severity meets minimum threshold
  const severity = alert.severity;
  if (settings.minSeverity === "Extreme" && severity !== "Extreme")
    return false;
  if (
    settings.minSeverity === "Severe" &&
    severity !== "Extreme" &&
    severity !== "Severe"
  )
    return false;

  // 4. Check if it's actually critical based on source-specific logic
  let isCritical = false;
  if ("event" in alert) {
    isCritical = isWeatherAlertCritical(alert as WeatherAlert);
  } else if ("category" in alert && alert.type === "disaster") {
    isCritical = isDisasterAlertCritical(alert as DisasterAlert);
  } else if ("riskType" in alert) {
    isCritical = isRiskAlertCritical(alert as RiskAlert);
  } else if ("aqi" in alert) {
    isCritical = isAirQualityAlertCritical(alert as AirQualityAlert);
  }

  if (!isCritical) return false;

  // 5. Check alert history
  const history = getAlertHistory();
  const alertRecord = history[fingerprint];

  if (alertRecord) {
    // Already announced
    if (alertRecord.userDismissed) return false;

    // Check if enough time has passed since last announcement
    const timeSinceLastAnnouncement = Date.now() - alertRecord.lastAnnounced;
    if (timeSinceLastAnnouncement < DUPLICATE_THRESHOLD) return false;

    // Only re-announce if severity increased
    const severityOrder = { Low: 0, Moderate: 1, Severe: 2, Extreme: 3 };
    const currentSeverityLevel =
      severityOrder[severity as keyof typeof severityOrder] || 0;
    const previousSeverityLevel =
      severityOrder[
        alertRecord.severityAtAnnouncement as keyof typeof severityOrder
      ] || 0;

    if (currentSeverityLevel <= previousSeverityLevel) return false;
  }

  // 6. Check session alert limit
  const sessionAlerts = Object.values(history).filter(
    (record) => Date.now() - record.lastAnnounced < 3600000 // Last hour
  ).length;

  if (sessionAlerts >= settings.maxAlertsPerSession) return false;

  // 7. Check minimum time between any announcements
  const lastAnnouncement = localStorage.getItem("lastVoiceAnnouncement");
  if (lastAnnouncement) {
    const timeSinceLast = Date.now() - parseInt(lastAnnouncement);
    if (timeSinceLast < MINIMUM_ANNOUNCEMENT_INTERVAL) return false;
  }

  return true;
}

/**
 * Record alert announcement
 */
function recordAnnouncement(alert: CombinedAlert, fingerprint: string): void {
  const history = getAlertHistory();
  const now = Date.now();

  history[fingerprint] = {
    firstSeen: history[fingerprint]?.firstSeen || now,
    lastAnnounced: now,
    timesAnnounced: (history[fingerprint]?.timesAnnounced || 0) + 1,
    userDismissed: false,
    severityAtAnnouncement: alert.severity,
  };

  saveAlertHistory(history);
  localStorage.setItem("lastVoiceAnnouncement", now.toString());
}

/**
 * Dismiss alert permanently
 */
export function dismissAlert(fingerprint: string): void {
  const history = getAlertHistory();

  if (history[fingerprint]) {
    history[fingerprint].userDismissed = true;
    saveAlertHistory(history);
  }
}

/**
 * Generate natural voice announcement text
 */
function generateAnnouncementText(alert: CombinedAlert): string {
  if ("event" in alert) {
    // Weather alert
    return `Weather alert: ${alert.event} in ${alert.location}. ${
      alert.description.split(".")[0]
    }.`;
  }

  if ("category" in alert && alert.type === "disaster") {
    // Disaster alert
    const distance = alert.distance ? `${alert.distance} miles away` : "nearby";
    return `${alert.category} alert: ${
      alert.title
    } detected ${distance}. ${alert.description
      .split(".")
      .slice(0, 2)
      .join(".")}.`;
  }

  if ("riskType" in alert) {
    // Risk alert
    return `Climate risk alert: ${alert.riskType} at ${alert.score}% in ${
      alert.location
    }. ${alert.description.split(".").slice(0, 2).join(".")}.`;
  }

  if ("aqi" in alert) {
    // Air quality alert
    return `Air quality alert: ${alert.category} conditions with AQI of ${
      alert.aqi
    }. ${alert.description.split(".")[0]}.`;
  }

  // Fallback for any alert type (should never reach here with proper types)
  const fallbackAlert = alert as WeatherAlert;
  return `Alert: ${fallbackAlert.headline || "Climate Alert"}. ${
    fallbackAlert.description || "Please check details."
  }`;
}

/**
 * Priority score for sorting alerts
 */
function getAlertPriority(alert: CombinedAlert): number {
  let priority = 0;

  // Severity points
  if (alert.severity === "Extreme") priority += 100;
  else if (alert.severity === "Severe") priority += 50;
  else if (alert.severity === "Moderate") priority += 25;

  // Type points (immediate threats get higher priority)
  if ("category" in alert && alert.type === "disaster") {
    priority += 80; // Disasters are immediate threats
    if (alert.distance && alert.distance < 25) priority += 20;
  } else if ("event" in alert && alert.urgency === "Immediate") {
    priority += 70; // Immediate weather events
  } else if ("aqi" in alert && alert.aqi >= 300) {
    priority += 60; // Hazardous air quality
  } else if ("riskType" in alert) {
    priority += 40; // Risk predictions
  }

  return priority;
}

/**
 * Fetch all critical alerts for location
 */
export async function fetchAllCriticalAlerts(
  latitude: number,
  longitude: number,
  locationName: string
): Promise<CombinedAlert[]> {
  const settings = getVoiceAlertSettings();
  if (!settings.enabled) return [];

  try {
    // Fetch from all sources in parallel
    const [weatherAlerts, disasterAlerts, riskAlerts, airQualityAlerts] =
      await Promise.all([
        fetchWeatherAlerts(latitude, longitude, locationName),
        fetchDisasterAlerts(latitude, longitude, locationName),
        fetchRiskAlerts(latitude, longitude, locationName),
        fetchAirQualityAlerts(latitude, longitude, locationName),
      ]);

    // Combine all alerts
    const allAlerts: CombinedAlert[] = [
      ...weatherAlerts,
      ...disasterAlerts,
      ...riskAlerts,
      ...airQualityAlerts,
    ];

    // Filter for announceability
    const announceable = allAlerts.filter((alert) => {
      const fingerprint = generateAlertFingerprint(alert);
      return shouldAnnounceAlert(alert, fingerprint, settings);
    });

    // Sort by priority
    announceable.sort((a, b) => getAlertPriority(b) - getAlertPriority(a));

    return announceable;
  } catch (error) {
    console.error("Error fetching critical alerts:", error);
    return [];
  }
}

/**
 * Get announcement text and record for an alert
 */
export function prepareAnnouncement(alert: CombinedAlert): {
  text: string;
  fingerprint: string;
} {
  const fingerprint = generateAlertFingerprint(alert);
  const text = generateAnnouncementText(alert);

  recordAnnouncement(alert, fingerprint);

  return { text, fingerprint };
}

/**
 * Clear old alert history (older than 7 days)
 */
export function cleanupAlertHistory(): void {
  const history = getAlertHistory();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const [fingerprint, record] of Object.entries(history)) {
    if (record.lastAnnounced < sevenDaysAgo) {
      delete history[fingerprint];
    }
  }

  saveAlertHistory(history);
}

/**
 * Get announcement history for UI display
 */
export function getAnnouncementHistory(): Array<{
  fingerprint: string;
  lastAnnounced: Date;
  timesAnnounced: number;
  dismissed: boolean;
}> {
  const history = getAlertHistory();

  return Object.entries(history)
    .map(([fingerprint, record]) => ({
      fingerprint,
      lastAnnounced: new Date(record.lastAnnounced),
      timesAnnounced: record.timesAnnounced,
      dismissed: record.userDismissed,
    }))
    .sort((a, b) => b.lastAnnounced.getTime() - a.lastAnnounced.getTime())
    .slice(0, 20); // Last 20 announcements
}
