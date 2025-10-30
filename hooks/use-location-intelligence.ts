/**
 * React Hooks for Location Intelligence (Isolated Feature)
 * Optional GPS-based hooks that don't interfere with core functionality
 */

import { useState, useEffect, useCallback } from "react";
import {
  locationIntelligence,
  LocationData,
  LocationRiskAssessment,
  LocationSettings,
} from "@/lib/location-intelligence";

/**
 * Hook for location intelligence support check
 */
export function useLocationSupport() {
  const [support, setSupport] = useState<{
    supported: boolean;
    permission: "granted" | "denied" | "prompt" | "unknown";
    error?: string;
  } | null>(null);

  useEffect(() => {
    locationIntelligence.checkSupport().then(setSupport);
  }, []);

  return support;
}

/**
 * Main hook for location intelligence data
 */
export function useLocationIntelligence() {
  const [data, setData] = useState<{
    location: LocationData | null;
    riskAssessment: LocationRiskAssessment | null;
  }>({ location: null, riskAssessment: null });

  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (riskAssessment: LocationRiskAssessment | null) => {
      const currentData = locationIntelligence.getCurrentData();
      setData(currentData);
      setIsLoading(false);
      setError(null);
    };

    const handleError = (errorMessage: string) => {
      setError(errorMessage);
      setIsLoading(false);
    };

    locationIntelligence.addListener(handleUpdate);
    locationIntelligence.addErrorListener(handleError);

    // Get initial data
    const initialData = locationIntelligence.getCurrentData();
    setData(initialData);
    setIsEnabled(locationIntelligence.getSettings().enabled);

    return () => {
      locationIntelligence.removeListener(handleUpdate);
      locationIntelligence.removeErrorListener(handleError);
    };
  }, []);

  const enableLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await locationIntelligence.initialize();
      if (success) {
        locationIntelligence.updateSettings({ enabled: true });
        setIsEnabled(true);
      } else {
        setError("Failed to initialize location services");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disableLocation = useCallback(() => {
    locationIntelligence.updateSettings({ enabled: false });
    setIsEnabled(false);
    setData({ location: null, riskAssessment: null });
    setError(null);
  }, []);

  return {
    ...data,
    isEnabled,
    isLoading,
    error,
    enableLocation,
    disableLocation,
  };
}

/**
 * Hook for location settings management
 */
export function useLocationSettings() {
  const [settings, setSettings] = useState<LocationSettings>(
    locationIntelligence.getSettings()
  );

  const updateSettings = useCallback(
    (newSettings: Partial<LocationSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      locationIntelligence.updateSettings(newSettings);
      setSettings(updatedSettings);
    },
    [settings]
  );

  const resetSettings = useCallback(() => {
    const defaultSettings: LocationSettings = {
      enabled: false,
      accuracy: "medium",
      updateInterval: 15,
      geofencing: false,
      backgroundUpdates: false,
      shareLocation: false,
    };
    locationIntelligence.updateSettings(defaultSettings);
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}

/**
 * Hook for location-based risk summary
 */
export function useLocationRiskSummary() {
  const { riskAssessment } = useLocationIntelligence();

  const riskSummary = useCallback(() => {
    if (!riskAssessment) return null;

    const { riskFactors, overallRisk } = riskAssessment;

    // Find highest risk factor
    const risks = Object.entries(riskFactors);
    const highestRisk = risks.reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    );

    // Categorize overall risk
    const riskLevel =
      overallRisk >= 80
        ? "critical"
        : overallRisk >= 60
        ? "high"
        : overallRisk >= 40
        ? "medium"
        : "low";

    // Count high risks (>70)
    const highRiskCount = risks.filter(([, value]) => value > 70).length;

    return {
      overallRisk,
      riskLevel,
      primaryRisk: {
        type: highestRisk[0],
        value: highestRisk[1],
        label: formatRiskType(highestRisk[0]),
      },
      highRiskCount,
      recommendations: riskAssessment.recommendations,
      lastUpdated: riskAssessment.lastUpdated,
    };
  }, [riskAssessment]);

  return riskSummary();
}

/**
 * Hook for location-based weather data
 */
export function useLocationWeather() {
  const { riskAssessment } = useLocationIntelligence();

  return riskAssessment?.localWeather || null;
}

/**
 * Hook for location coordinates display
 */
export function useLocationCoordinates() {
  const { location } = useLocationIntelligence();

  const formatCoordinates = useCallback(() => {
    if (!location) return null;

    return {
      latitude: location.latitude.toFixed(4),
      longitude: location.longitude.toFixed(4),
      accuracy: `±${Math.round(location.accuracy)}m`,
      timestamp: location.timestamp,
      address: location.address,
    };
  }, [location]);

  return formatCoordinates();
}

/**
 * Utility function to format risk types
 */
function formatRiskType(riskType: string): string {
  const typeMap: Record<string, string> = {
    flooding: "Flooding",
    heatWave: "Heat Wave",
    drought: "Drought",
    wildfire: "Wildfire",
    airQuality: "Air Quality",
    seaLevelRise: "Sea Level Rise",
  };

  return typeMap[riskType] || riskType;
}

/**
 * Hook for emergency location sharing
 */
export function useEmergencyLocation() {
  const { location, isEnabled } = useLocationIntelligence();

  const shareLocation = useCallback(() => {
    if (!location || !isEnabled) return null;

    const emergencyData = {
      coordinates: {
        lat: location.latitude,
        lng: location.longitude,
      },
      accuracy: location.accuracy,
      timestamp: location.timestamp.toISOString(),
      googleMapsUrl: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
      emergencyServices: "911", // Could be location-specific
    };

    return emergencyData;
  }, [location, isEnabled]);

  return shareLocation();
}
