/**
 * React Hook for ClimateGuard Alert Service Integration
 * Provides easy-to-use hooks for components to interact with the global alert system
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  alertService,
  GlobalAlert,
  AlertSubscription,
  GlobalAlertSettings,
} from "@/lib/alert-service";

/**
 * Hook to access all global alerts
 */
export function useGlobalAlerts() {
  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const handleAlertsUpdate = (updatedAlerts: GlobalAlert[]) => {
      setAlerts(updatedAlerts);
      setLoading(false);
    };

    // Subscribe to alert updates
    alertService.addListener(handleAlertsUpdate);

    // Initial load
    setAlerts(alertService.getAllAlerts());
    setLoading(false);

    return () => {
      alertService.removeListener(handleAlertsUpdate);
    };
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    alertService.dismissAlert(alertId);
  }, []);

  const clearAllAlerts = useCallback(() => {
    alertService.clearAllAlerts();
  }, []);

  const addAlert = useCallback((alert: GlobalAlert) => {
    alertService.addAlert(alert);
  }, []);

  return {
    alerts,
    loading,
    dismissAlert,
    clearAllAlerts,
    addAlert,
    // Convenience filters
    criticalAlerts: alerts.filter((a) => a.severity === "critical"),
    highAlerts: alerts.filter((a) => a.severity === "high"),
    alertCount: alerts.length,
    hasCriticalAlerts: alerts.some((a) => a.severity === "critical"),
  };
}

/**
 * Hook for component-specific alert subscriptions
 */
export function useAlertSubscription(
  componentName: string,
  options: {
    severityFilter?: "all" | "medium" | "high" | "critical";
    typeFilter?: GlobalAlert["type"][];
    locationFilter?: string;
    enabled?: boolean;
  } = {}
) {
  const [componentAlerts, setComponentAlerts] = useState<GlobalAlert[]>([]);
  const subscriptionRef = useRef<string | null>(null);

  const {
    severityFilter = "medium",
    typeFilter = [],
    locationFilter,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) {
      if (subscriptionRef.current) {
        alertService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      setComponentAlerts([]);
      return;
    }

    const subscriptionId = `${componentName}-${Date.now()}`;
    subscriptionRef.current = subscriptionId;

    const subscription: AlertSubscription = {
      id: subscriptionId,
      componentName,
      severityFilter,
      typeFilter,
      locationFilter,
      callback: (alert: GlobalAlert) => {
        setComponentAlerts((prev) => {
          // Avoid duplicates
          if (prev.some((a) => a.id === alert.id)) return prev;
          return [alert, ...prev].slice(0, 10); // Keep only latest 10
        });
      },
    };

    alertService.subscribe(subscription);

    return () => {
      if (subscriptionRef.current) {
        alertService.unsubscribe(subscriptionRef.current);
      }
    };
  }, [componentName, severityFilter, typeFilter, locationFilter, enabled]);

  const clearComponentAlerts = useCallback(() => {
    setComponentAlerts([]);
  }, []);

  return {
    alerts: componentAlerts,
    clearAlerts: clearComponentAlerts,
    alertCount: componentAlerts.length,
    latestAlert: componentAlerts[0] || null,
  };
}

/**
 * Hook for alert settings management
 */
export function useAlertSettings() {
  const [settings, setSettings] = useState<GlobalAlertSettings>(
    alertService.getSettings()
  );

  const updateSettings = useCallback(
    (newSettings: Partial<GlobalAlertSettings>) => {
      alertService.updateSettings(newSettings);
      setSettings(alertService.getSettings());
    },
    []
  );

  const resetSettings = useCallback(() => {
    const defaultSettings: GlobalAlertSettings = {
      enabled: true,
      sound: true,
      desktop: true,
      email: false,
      voice: true,
      globalSeverityFilter: "medium",
      autoRefresh: true,
      refreshInterval: 30000,
      maxAlertsDisplay: 20,
      notificationDuration: 5,
      soundVolume: 0.5,
    };
    updateSettings(defaultSettings);
  }, [updateSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}

/**
 * Hook for creating alerts from ML predictions
 */
export function usePredictionAlerts(componentName: string) {
  const createAlertFromPrediction = useCallback(
    (prediction: any, location: string) => {
      const alert = alertService.createPredictionAlert(
        prediction,
        location,
        componentName
      );
      alertService.addAlert(alert);
      return alert;
    },
    [componentName]
  );

  return {
    createAlertFromPrediction,
  };
}

/**
 * Hook for location-based alerts
 */
export function useLocationAlerts(location?: string) {
  const [locationAlerts, setLocationAlerts] = useState<GlobalAlert[]>([]);

  useEffect(() => {
    if (!location) {
      setLocationAlerts([]);
      return;
    }

    const updateLocationAlerts = () => {
      const alerts = alertService.getAlertsByLocation(location);
      setLocationAlerts(alerts);
    };

    // Initial load
    updateLocationAlerts();

    // Subscribe to updates
    alertService.addListener(updateLocationAlerts);

    return () => {
      alertService.removeListener(updateLocationAlerts);
    };
  }, [location]);

  return {
    alerts: locationAlerts,
    alertCount: locationAlerts.length,
    criticalCount: locationAlerts.filter((a) => a.severity === "critical")
      .length,
    highCount: locationAlerts.filter((a) => a.severity === "high").length,
  };
}

/**
 * Hook for alert statistics
 */
export function useAlertStats() {
  const { alerts } = useGlobalAlerts();

  const stats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    low: alerts.filter((a) => a.severity === "low").length,

    // By type
    climateAlerts: alerts.filter((a) => a.category === "climate").length,
    weatherAlerts: alerts.filter((a) => a.category === "weather").length,
    predictionAlerts: alerts.filter((a) => a.category === "prediction").length,
    systemAlerts: alerts.filter((a) => a.category === "system").length,

    // By time
    recentAlerts: alerts.filter(
      (a) => Date.now() - a.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    ).length,

    // Action required
    actionRequired: alerts.filter((a) => a.actionRequired).length,
  };

  return stats;
}

/**
 * Hook for creating system alerts
 */
export function useSystemAlerts(componentName: string) {
  const createSystemAlert = useCallback(
    (
      title: string,
      message: string,
      severity: GlobalAlert["severity"] = "medium",
      data?: any
    ) => {
      const alert: GlobalAlert = {
        id: `system-${componentName}-${Date.now()}`,
        type: "system",
        severity,
        title,
        message,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        actionRequired: severity === "high" || severity === "critical",
        confidence: 1.0,
        source: "system",
        category: "system",
        priority: severity === "critical" ? 5 : severity === "high" ? 4 : 3,
        component: componentName,
        data,
      };

      alertService.addAlert(alert);
      return alert;
    },
    [componentName]
  );

  const createErrorAlert = useCallback(
    (error: Error, context?: string) => {
      // Log to console instead of showing alerts to users
      console.error(
        `[${componentName}] ${context ? context + ": " : ""}`,
        error
      );
      return null;
    },
    [componentName]
  );

  const createSuccessAlert = useCallback(
    (message: string, data?: any) => {
      // Log to console instead of showing alerts to users
      console.log(`[${componentName}] Success:`, message, data);
      return null;
    },
    [componentName]
  );

  return {
    createSystemAlert,
    createErrorAlert,
    createSuccessAlert,
  };
}

/**
 * Hook for voice announcement control
 */
export function useVoiceAlerts() {
  const announceAlert = useCallback((alert: GlobalAlert) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const announcement = `${alert.title}. ${
      alert.location ? `Location: ${alert.location}. ` : ""
    }${alert.message}`;

    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.8;
    utterance.pitch = alert.severity === "critical" ? 1.2 : 1.0;
    utterance.volume = 0.7;

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopAnnouncements = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    announceAlert,
    stopAnnouncements,
  };
}
