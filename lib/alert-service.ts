/**
 * Comprehensive Alert Service for ClimateGuard
 * Manages real-time alerts across all components with centralized state management
 */

import { toast } from "@/hooks/use-toast";

export interface GlobalAlert {
  id: string;
  type:
    | "extreme_heat"
    | "flooding"
    | "drought"
    | "storm"
    | "wildfire"
    | "air_quality"
    | "system"
    | "location"
    | "prediction";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  location?: string;
  timestamp: Date;
  expiresAt: Date;
  actionRequired: boolean;
  confidence: number;
  source:
    | "satellite"
    | "weather_station"
    | "ai_prediction"
    | "community_report"
    | "ml_model"
    | "user_location"
    | "system";
  // Enhanced alert metadata
  riskFactors?: string[];
  category: "climate" | "weather" | "prediction" | "system" | "user";
  priority: 1 | 2 | 3 | 4 | 5; // 1 = lowest, 5 = highest
  component: string; // Which component triggered the alert
  data?: any; // Additional context data
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: "navigate" | "external" | "dismiss" | "custom";
  url?: string;
  callback?: () => void;
}

export interface AlertSubscription {
  id: string;
  componentName: string;
  severityFilter: "all" | "medium" | "high" | "critical";
  typeFilter: GlobalAlert["type"][];
  locationFilter?: string;
  callback: (alert: GlobalAlert) => void;
}

export interface GlobalAlertSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  voice: boolean; // New: voice announcements
  globalSeverityFilter: "all" | "medium" | "high" | "critical";
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
  maxAlertsDisplay: number;
  notificationDuration: number; // seconds
  soundVolume: number; // 0-1
}

class AlertService {
  private alerts: Map<string, GlobalAlert> = new Map();
  private subscriptions: Map<string, AlertSubscription> = new Map();
  private settings: GlobalAlertSettings = {
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
    voice: true,
    globalSeverityFilter: "medium",
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    maxAlertsDisplay: 20,
    notificationDuration: 5,
    soundVolume: 0.5,
  };
  private listeners: Set<(alerts: GlobalAlert[]) => void> = new Set();
  private refreshTimer: NodeJS.Timeout | null = null;
  private audioContext: AudioContext | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;

  constructor() {
    this.initializeAudio();
    this.initializeSpeech();
    this.startAutoRefresh();
    this.requestNotificationPermission();
  }

  /**
   * Initialize audio context for sound notifications
   */
  private initializeAudio() {
    if (
      typeof window !== "undefined" &&
      (window.AudioContext || (window as any).webkitAudioContext)
    ) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  /**
   * Initialize speech synthesis for voice announcements
   */
  private initializeSpeech() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  /**
   * Request notification permissions
   */
  private async requestNotificationPermission() {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      await Notification.requestPermission();
    }
  }

  /**
   * Start auto-refresh for real-time alerts
   */
  private startAutoRefresh() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);

    if (this.settings.autoRefresh) {
      this.refreshTimer = setInterval(() => {
        this.refreshFromAPIs();
      }, this.settings.refreshInterval);
    }
  }

  /**
   * Refresh alerts from all available APIs
   */
  private async refreshFromAPIs() {
    try {
      // Fetch from disaster monitoring API
      const disasterResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/disasters`
      );
      const disasterData = await disasterResponse.json();

      if (disasterData.alerts && disasterData.alerts.length > 0) {
        disasterData.alerts.forEach((alert: any) => {
          const globalAlert: GlobalAlert = {
            id: `disaster-${alert.id || Date.now()}`,
            type: this.mapDisasterTypeToAlertType(alert.type),
            severity: alert.severity.toLowerCase() as GlobalAlert["severity"],
            title: alert.title,
            message: alert.description || alert.message,
            location: alert.location,
            timestamp: new Date(
              alert.timestamp || alert.startTime || Date.now()
            ),
            expiresAt: new Date(
              alert.endTime || Date.now() + 24 * 60 * 60 * 1000
            ),
            actionRequired:
              alert.severity === "Critical" || alert.severity === "High",
            confidence: 95, // High confidence for real disaster data
            source: "satellite",
            category: "climate",
            priority: this.mapSeverityToPriority(alert.severity),
            component: "disaster-api",
            data: alert,
          };
          this.addAlert(globalAlert);
        });
      }

      // Fetch from global map API for location-specific risks
      const mapResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/global-map`
      );
      const mapData = await mapResponse.json();

      if (mapData.features && mapData.features.length > 0) {
        mapData.features.forEach((feature: any) => {
          const props = feature.properties;
          if (props.severity === "High" || props.severity === "Critical") {
            const globalAlert: GlobalAlert = {
              id: `location-${props.city}-${Date.now()}`,
              type: this.mapRiskTypeToAlertType(props.riskType),
              severity: props.severity.toLowerCase() as GlobalAlert["severity"],
              title: `${props.riskType} Alert in ${props.city}`,
              message: `${props.riskType} conditions detected with ${props.temperature}°C temperature and ${props.precipitation}mm precipitation`,
              location: `${props.city}, ${props.country}`,
              timestamp: new Date(),
              expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
              actionRequired: props.severity === "Critical",
              confidence: props.riskScore || 85,
              source: "weather_station",
              category: "weather",
              priority: this.mapSeverityToPriority(props.severity),
              component: "global-map",
              data: props,
            };
            this.addAlert(globalAlert);
          }
        });
      }
    } catch (error) {
      console.error("Failed to refresh alerts from APIs:", error);
    }
  }

  /**
   * Map disaster types to alert types
   */
  private mapDisasterTypeToAlertType(
    disasterType: string
  ): GlobalAlert["type"] {
    const mapping: { [key: string]: GlobalAlert["type"] } = {
      Heat: "extreme_heat",
      "Excessive Heat": "extreme_heat",
      Flood: "flooding",
      "Flash Flood": "flooding",
      Drought: "drought",
      Wind: "storm",
      Thunderstorm: "storm",
      "Severe Weather": "storm",
      Fire: "wildfire",
      Wildfire: "wildfire",
      "Air Quality": "air_quality",
      Earthquake: "storm",
    };
    return mapping[disasterType] || "storm";
  }

  /**
   * Map risk types to alert types
   */
  private mapRiskTypeToAlertType(riskType: string): GlobalAlert["type"] {
    const mapping: { [key: string]: GlobalAlert["type"] } = {
      Heatwave: "extreme_heat",
      Flood: "flooding",
      Drought: "drought",
      Storm: "storm",
      Wildfire: "wildfire",
    };
    return mapping[riskType] || "storm";
  }

  /**
   * Map severity to priority level
   */
  private mapSeverityToPriority(severity: string): 1 | 2 | 3 | 4 | 5 {
    const mapping: { [key: string]: 1 | 2 | 3 | 4 | 5 } = {
      Low: 2,
      Medium: 3,
      High: 4,
      Critical: 5,
    };
    return mapping[severity] || 3;
  }

  /**
   * Add a new alert to the system
   */
  addAlert(alert: GlobalAlert) {
    // Check if alert already exists
    if (this.alerts.has(alert.id)) return;

    this.alerts.set(alert.id, alert);

    // Trigger notifications
    this.processAlert(alert);

    // Notify all listeners
    this.notifyListeners();

    // Notify component-specific subscriptions
    this.notifySubscriptions(alert);
  }

  /**
   * Process alert for notifications
   */
  private processAlert(alert: GlobalAlert) {
    if (!this.settings.enabled) return;

    // Check severity filter
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const filterOrder = { all: 0, medium: 2, high: 3, critical: 4 };

    if (
      severityOrder[alert.severity] <
      filterOrder[this.settings.globalSeverityFilter]
    ) {
      return;
    }

    // Show toast notification
    this.showToastNotification(alert);

    // Show desktop notification
    if (this.settings.desktop) {
      this.showDesktopNotification(alert);
    }

    // Play sound notification
    if (this.settings.sound) {
      this.playSoundNotification(alert);
    }

    // Voice announcement
    if (this.settings.voice) {
      this.announceAlert(alert);
    }
  }

  /**
   * Show toast notification
   */
  private showToastNotification(alert: GlobalAlert) {
    const severityIcons = {
      low: "🔵",
      medium: "🟡",
      high: "🟠",
      critical: "🔴",
    };

    toast({
      title: `${severityIcons[alert.severity]} ${alert.title}`,
      description: `${alert.location ? alert.location + ": " : ""}${
        alert.message
      }`,
      variant: alert.severity === "critical" ? "destructive" : "default",
      duration: this.settings.notificationDuration * 1000,
    });
  }

  /**
   * Show desktop notification
   */
  private showDesktopNotification(alert: GlobalAlert) {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    new Notification(`ClimateGuard Alert: ${alert.title}`, {
      body: `${alert.location ? alert.location + ": " : ""}${alert.message}`,
      icon: "/placeholder-logo.png",
      badge: "/placeholder-logo.png",
      tag: alert.id,
      requireInteraction: alert.severity === "critical",
      silent: !this.settings.sound,
    });
  }

  /**
   * Play sound notification
   */
  private playSoundNotification(alert: GlobalAlert) {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Different frequencies for different severities
      const frequencies = {
        low: 220,
        medium: 440,
        high: 659,
        critical: 880,
      };

      oscillator.frequency.value = frequencies[alert.severity];
      oscillator.type = alert.severity === "critical" ? "sawtooth" : "sine";

      const volume = this.settings.soundVolume;
      gainNode.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.5
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Failed to play sound notification:", error);
    }
  }

  /**
   * Voice announcement of alert
   */
  private announceAlert(alert: GlobalAlert) {
    if (!this.speechSynthesis || this.speechSynthesis.speaking) return;

    const announcement = `Climate alert: ${alert.title}. ${
      alert.location ? `Location: ${alert.location}. ` : ""
    }${alert.message}`;

    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.8;
    utterance.pitch = alert.severity === "critical" ? 1.2 : 1.0;
    utterance.volume = this.settings.soundVolume;

    this.speechSynthesis.speak(utterance);
  }

  /**
   * Subscribe to alerts from a specific component
   */
  subscribe(subscription: AlertSubscription) {
    this.subscriptions.set(subscription.id, subscription);
  }

  /**
   * Unsubscribe from alerts
   */
  unsubscribe(subscriptionId: string) {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Notify component subscriptions
   */
  private notifySubscriptions(alert: GlobalAlert) {
    this.subscriptions.forEach((subscription) => {
      // Check severity filter
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      const filterOrder = { all: 0, medium: 2, high: 3, critical: 4 };

      if (
        severityOrder[alert.severity] < filterOrder[subscription.severityFilter]
      ) {
        return;
      }

      // Check type filter
      if (
        subscription.typeFilter.length > 0 &&
        !subscription.typeFilter.includes(alert.type)
      ) {
        return;
      }

      // Check location filter
      if (
        subscription.locationFilter &&
        alert.location &&
        !alert.location
          .toLowerCase()
          .includes(subscription.locationFilter.toLowerCase())
      ) {
        return;
      }

      // Call subscription callback
      try {
        subscription.callback(alert);
      } catch (error) {
        console.error(
          `Error in alert subscription callback for ${subscription.componentName}:`,
          error
        );
      }
    });
  }

  /**
   * Add global listener for all alerts
   */
  addListener(callback: (alerts: GlobalAlert[]) => void) {
    this.listeners.add(callback);
    // Immediately notify with current alerts
    callback(this.getAllAlerts());
  }

  /**
   * Remove global listener
   */
  removeListener(callback: (alerts: GlobalAlert[]) => void) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    const alerts = this.getAllAlerts();
    this.listeners.forEach((callback) => {
      try {
        callback(alerts);
      } catch (error) {
        console.error("Error in alert listener callback:", error);
      }
    });
  }

  /**
   * Get all alerts sorted by priority and timestamp
   */
  getAllAlerts(): GlobalAlert[] {
    return Array.from(this.alerts.values())
      .filter((alert) => alert.expiresAt > new Date())
      .sort((a, b) => {
        // Sort by priority first, then by timestamp
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, this.settings.maxAlertsDisplay);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: GlobalAlert["severity"]): GlobalAlert[] {
    return this.getAllAlerts().filter((alert) => alert.severity === severity);
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: GlobalAlert["type"]): GlobalAlert[] {
    return this.getAllAlerts().filter((alert) => alert.type === type);
  }

  /**
   * Get alerts by location
   */
  getAlertsByLocation(location: string): GlobalAlert[] {
    return this.getAllAlerts().filter(
      (alert) =>
        alert.location &&
        alert.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  /**
   * Dismiss an alert
   */
  dismissAlert(alertId: string) {
    this.alerts.delete(alertId);
    this.notifyListeners();
  }

  /**
   * Clear all alerts
   */
  clearAllAlerts() {
    this.alerts.clear();
    this.notifyListeners();
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<GlobalAlertSettings>) {
    this.settings = { ...this.settings, ...newSettings };

    // Restart auto-refresh if interval changed
    if (
      newSettings.autoRefresh !== undefined ||
      newSettings.refreshInterval !== undefined
    ) {
      this.startAutoRefresh();
    }
  }

  /**
   * Get current settings
   */
  getSettings(): GlobalAlertSettings {
    return { ...this.settings };
  }

  /**
   * Create alert from ML prediction
   */
  createPredictionAlert(
    prediction: any,
    location: string,
    componentName: string
  ): GlobalAlert {
    const highestRisk = Math.max(
      prediction.floodRisk || 0,
      prediction.droughtRisk || 0,
      prediction.heatwaveRisk || 0,
      prediction.stormRisk || 0,
      prediction.wildfireRisk || 0,
      prediction.airQualityRisk || 0
    );

    let alertType: GlobalAlert["type"] = "storm";
    let title = "Climate Risk Alert";

    // Determine primary risk type
    if (prediction.floodRisk === highestRisk) {
      alertType = "flooding";
      title = "Flood Risk Alert";
    } else if (prediction.droughtRisk === highestRisk) {
      alertType = "drought";
      title = "Drought Risk Alert";
    } else if (prediction.heatwaveRisk === highestRisk) {
      alertType = "extreme_heat";
      title = "Heat Wave Risk Alert";
    } else if (prediction.wildfireRisk === highestRisk) {
      alertType = "wildfire";
      title = "Wildfire Risk Alert";
    } else if (prediction.airQualityRisk === highestRisk) {
      alertType = "air_quality";
      title = "Air Quality Alert";
    }

    const severity: GlobalAlert["severity"] =
      highestRisk > 0.8
        ? "critical"
        : highestRisk > 0.6
        ? "high"
        : highestRisk > 0.4
        ? "medium"
        : "low";

    return {
      id: `prediction-${location}-${Date.now()}`,
      type: alertType,
      severity,
      title,
      message: `AI prediction indicates ${(highestRisk * 100).toFixed(
        0
      )}% risk level. ${
        prediction.riskFactors?.join(", ") || "Multiple risk factors detected."
      }`,
      location,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      actionRequired: severity === "high" || severity === "critical",
      confidence: prediction.confidence || 0.8,
      source: "ml_model",
      category: "prediction",
      priority: this.mapSeverityToPriority(
        severity.charAt(0).toUpperCase() + severity.slice(1)
      ),
      component: componentName,
      data: prediction,
      riskFactors: prediction.riskFactors,
      actions: prediction.adaptationRecommendations?.map(
        (rec: string, idx: number) => ({
          id: `action-${idx}`,
          label: rec,
          type: "custom" as const,
        })
      ),
    };
  }

  /**
   * Cleanup and destroy service instance
   */
  destroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    this.alerts.clear();
    this.subscriptions.clear();
    this.listeners.clear();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export singleton instance
export const alertService = new AlertService();

// Types are already exported above as export interface
