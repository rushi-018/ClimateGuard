/**
 * React Hooks for API Integration
 * Provides easy access to live weather, economic, and disaster data from real-world APIs
 */

import { useState, useEffect, useCallback } from "react";
import {
  apiIntegration,
  LiveWeatherData,
  LiveEconomicData,
  LiveDisasterData,
  APIResponse,
} from "@/lib/api-integration";

/**
 * Hook for live weather data
 */
export function useLiveWeatherData(
  lat: number,
  lng: number,
  autoRefresh = true
) {
  const [data, setData] = useState<APIResponse<LiveWeatherData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!lat || !lng) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiIntegration.getLiveWeatherData(lat, lng);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch weather data"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 10 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: data?.data || null,
    loading,
    error,
    refetch,
    source: data?.source || null,
    cached: data?.cached || false,
    timestamp: data?.timestamp || null,
  };
}

/**
 * Hook for live economic data
 */
export function useLiveEconomicData(countryCode: string, autoRefresh = true) {
  const [data, setData] = useState<APIResponse<LiveEconomicData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!countryCode) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiIntegration.getLiveEconomicData(countryCode);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch economic data"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [countryCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every hour if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: data?.data || null,
    loading,
    error,
    refetch,
    source: data?.source || null,
    cached: data?.cached || false,
    timestamp: data?.timestamp || null,
  };
}

/**
 * Hook for live disaster data
 */
export function useLiveDisasterData(autoRefresh = true) {
  const [data, setData] = useState<APIResponse<LiveDisasterData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiIntegration.getLiveDisasterData();
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch disaster data"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 15 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: data?.data || null,
    loading,
    error,
    refetch,
    source: data?.source || null,
    cached: data?.cached || false,
    timestamp: data?.timestamp || null,
  };
}

/**
 * Hook for API health monitoring
 */
export function useAPIHealthStatus() {
  const [healthStatus, setHealthStatus] = useState<{
    weather: {
      status: "healthy" | "degraded" | "down";
      lastCheck: Date;
      rateLimit?: any;
    };
    economic: { status: "healthy" | "degraded" | "down"; lastCheck: Date };
    disaster: { status: "healthy" | "degraded" | "down"; lastCheck: Date };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    try {
      const status = await apiIntegration.getAPIHealthStatus();
      setHealthStatus(status);
    } catch (error) {
      console.error("[APIHealth] Failed to check API health:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();

    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    healthStatus,
    loading,
    checkHealth,
    isHealthy:
      healthStatus?.weather.status === "healthy" &&
      healthStatus?.economic.status === "healthy" &&
      healthStatus?.disaster.status === "healthy",
  };
}

/**
 * Hook for API cache management
 */
export function useAPICacheManager() {
  const [cacheStats, setCacheStats] = useState<{
    totalEntries: number;
    totalSize: string;
    hitRate: number;
  } | null>(null);

  const updateStats = useCallback(() => {
    const stats = apiIntegration.getCacheStats();
    setCacheStats(stats);
  }, []);

  const clearCache = useCallback(() => {
    apiIntegration.clearCache();
    updateStats();
  }, [updateStats]);

  useEffect(() => {
    updateStats();

    // Update stats every minute
    const interval = setInterval(updateStats, 60 * 1000);
    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    cacheStats,
    clearCache,
    updateStats,
  };
}

/**
 * Combined hook for all live data sources
 */
export function useLiveClimateData(
  lat: number,
  lng: number,
  countryCode: string = "US",
  options: {
    enableWeather?: boolean;
    enableEconomic?: boolean;
    enableDisaster?: boolean;
    autoRefresh?: boolean;
  } = {}
) {
  const {
    enableWeather = true,
    enableEconomic = true,
    enableDisaster = true,
    autoRefresh = true,
  } = options;

  const weather = useLiveWeatherData(
    enableWeather ? lat : 0,
    enableWeather ? lng : 0,
    autoRefresh
  );

  const economic = useLiveEconomicData(
    enableEconomic ? countryCode : "",
    autoRefresh
  );

  const disaster = useLiveDisasterData(enableDisaster && autoRefresh);

  const health = useAPIHealthStatus();

  const isLoading = weather.loading || economic.loading || disaster.loading;
  const hasError = weather.error || economic.error || disaster.error;

  const refetchAll = useCallback(() => {
    if (enableWeather) weather.refetch();
    if (enableEconomic) economic.refetch();
    if (enableDisaster) disaster.refetch();
  }, [
    enableWeather,
    weather,
    enableEconomic,
    economic,
    enableDisaster,
    disaster,
  ]);

  return {
    weather: enableWeather ? weather : null,
    economic: enableEconomic ? economic : null,
    disaster: enableDisaster ? disaster : null,
    health,
    isLoading,
    hasError,
    refetchAll,
    // Convenience aggregations
    allSources: [
      enableWeather && weather.source,
      enableEconomic && economic.source,
      enableDisaster && disaster.source,
    ].filter(Boolean),
    lastUpdated: Math.max(
      enableWeather && weather.timestamp ? weather.timestamp.getTime() : 0,
      enableEconomic && economic.timestamp ? economic.timestamp.getTime() : 0,
      enableDisaster && disaster.timestamp ? disaster.timestamp.getTime() : 0
    ),
  };
}

/**
 * Hook for location-based weather alerts from live data
 */
export function useLiveWeatherAlerts(lat: number, lng: number) {
  const { data: weatherData, loading, error } = useLiveWeatherData(lat, lng);

  const alerts = weatherData?.alerts || [];
  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "extreme" || alert.severity === "severe"
  );

  const activeAlerts = alerts.filter(
    (alert) => new Date() >= alert.startTime && new Date() <= alert.endTime
  );

  return {
    alerts,
    criticalAlerts,
    activeAlerts,
    hasCriticalAlerts: criticalAlerts.length > 0,
    hasActiveAlerts: activeAlerts.length > 0,
    loading,
    error,
  };
}

/**
 * Hook for integration with existing ClimateGuard services
 */
export function useIntegratedClimateData(
  lat: number,
  lng: number,
  countryCode: string = "US"
) {
  const liveData = useLiveClimateData(lat, lng, countryCode);

  // Transform live data to match existing service formats
  const transformedData = {
    // Weather data for enhanced global heatmap
    weatherLayer: liveData.weather?.data
      ? {
          temperature: liveData.weather.data.current.temperature,
          humidity: liveData.weather.data.current.humidity,
          pressure: liveData.weather.data.current.pressure,
          windSpeed: liveData.weather.data.current.windSpeed,
          alerts: liveData.weather.data.alerts.map((alert) => ({
            id: alert.id,
            title: alert.title,
            severity: alert.severity,
            type: "weather" as const,
            startTime: alert.startTime,
            endTime: alert.endTime,
            location: liveData.weather?.data?.location,
          })),
        }
      : null,

    // Economic data enhancement
    economicEnhancement: liveData.economic?.data
      ? {
          realTimeGDP: liveData.economic.data.indicators.gdp.value,
          currentInflation: liveData.economic.data.indicators.inflation.value,
          climateCosts: liveData.economic.data.climateCosts,
          lastUpdated: liveData.economic.timestamp,
        }
      : null,

    // Disaster events for alert system
    disasterEvents:
      liveData.disaster?.data?.events.map((event) => ({
        id: event.id,
        title: event.title,
        type: event.category,
        severity: event.severity,
        location: event.location.coordinates,
        status: event.status,
        startTime: event.startDate,
        endTime: event.endDate,
      })) || [],
  };

  return {
    ...liveData,
    transformedData,
    // Integration helpers
    enhanceAlerts: (existingAlerts: any[]) => [
      ...existingAlerts,
      ...(transformedData.weatherLayer?.alerts || []),
      ...transformedData.disasterEvents.map((event) => ({
        id: event.id,
        title: event.title,
        severity: event.severity,
        type: event.type,
        startTime: event.startTime,
        endTime: event.endTime,
      })),
    ],
    enhanceEconomicData: (existingData: any) => ({
      ...existingData,
      liveEnhancements: transformedData.economicEnhancement,
    }),
  };
}
