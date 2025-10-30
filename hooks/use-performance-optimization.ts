/**
 * React hooks for performance optimization and monitoring
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  performanceService,
  PerformanceMetrics,
  OptimizationSettings,
} from "@/lib/performance-optimization";

// Hook for monitoring performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initial load
    const loadMetrics = () => {
      try {
        const currentMetrics = performanceService.getMetrics();
        setMetrics(currentMetrics);
        setIsLoading(false);
      } catch (error) {
        console.error("[Performance Hook] Failed to load metrics:", error);
        setIsLoading(false);
      }
    };

    loadMetrics();

    // Update every 10 seconds
    intervalRef.current = setInterval(loadMetrics, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const refreshMetrics = useCallback(() => {
    try {
      const currentMetrics = performanceService.getMetrics();
      setMetrics(currentMetrics);
    } catch (error) {
      console.error("[Performance Hook] Failed to refresh metrics:", error);
    }
  }, []);

  return {
    metrics,
    isLoading,
    refreshMetrics,
  };
}

// Hook for performance insights and recommendations
export function usePerformanceInsights() {
  const [insights, setInsights] = useState<{
    score: number;
    insights: {
      category: "critical" | "warning" | "good";
      message: string;
      recommendation: string;
    }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInsights = () => {
      try {
        const currentInsights = performanceService.getPerformanceInsights();
        setInsights(currentInsights);
        setIsLoading(false);
      } catch (error) {
        console.error("[Performance Hook] Failed to load insights:", error);
        setIsLoading(false);
      }
    };

    loadInsights();

    // Update every 30 seconds
    const interval = setInterval(loadInsights, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshInsights = useCallback(() => {
    try {
      const currentInsights = performanceService.getPerformanceInsights();
      setInsights(currentInsights);
    } catch (error) {
      console.error("[Performance Hook] Failed to refresh insights:", error);
    }
  }, []);

  return {
    insights,
    isLoading,
    refreshInsights,
  };
}

// Hook for optimization settings
export function useOptimizationSettings() {
  const [settings, setSettings] = useState<OptimizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const currentSettings = performanceService.getSettings();
      setSettings(currentSettings);
      setIsLoading(false);
    } catch (error) {
      console.error("[Performance Hook] Failed to load settings:", error);
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Partial<OptimizationSettings>) => {
      setIsSaving(true);
      try {
        performanceService.updateSettings(newSettings);
        const updatedSettings = performanceService.getSettings();
        setSettings(updatedSettings);
      } catch (error) {
        console.error("[Performance Hook] Failed to update settings:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const resetSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      const defaultSettings: OptimizationSettings = {
        enableDataCompression: true,
        enableImageOptimization: true,
        enableCodeSplitting: true,
        enableServiceWorker: true,
        cacheStrategy: "hybrid",
        compressionLevel: 3,
        preloadCriticalData: true,
        enableAnalytics: true,
      };

      performanceService.updateSettings(defaultSettings);
      setSettings(defaultSettings);
    } catch (error) {
      console.error("[Performance Hook] Failed to reset settings:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    updateSettings,
    resetSettings,
  };
}

// Hook for advanced caching operations
export function useAdvancedCache() {
  const [cacheStats, setCacheStats] = useState({
    memoryUsage: 0,
    diskUsage: 0,
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
  });

  const setCache = useCallback(async (key: string, data: any, ttl?: number) => {
    try {
      await performanceService.setCache(key, data, ttl);
      // Update stats (simplified)
      setCacheStats((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));
    } catch (error) {
      console.error("[Performance Hook] Cache set failed:", error);
      throw error;
    }
  }, []);

  const getCache = useCallback(async (key: string) => {
    try {
      setCacheStats((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));

      const data = await performanceService.getCache(key);

      if (data !== null) {
        setCacheStats((prev) => ({
          ...prev,
          cacheHits: prev.cacheHits + 1,
          hitRate: ((prev.cacheHits + 1) / (prev.totalRequests || 1)) * 100,
        }));
      }

      return data;
    } catch (error) {
      console.error("[Performance Hook] Cache get failed:", error);
      return null;
    }
  }, []);

  const removeCache = useCallback((key: string) => {
    try {
      performanceService.removeCache(key);
    } catch (error) {
      console.error("[Performance Hook] Cache remove failed:", error);
    }
  }, []);

  const clearAllCaches = useCallback(() => {
    try {
      performanceService.clearAllCaches();
      setCacheStats({
        memoryUsage: 0,
        diskUsage: 0,
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0,
      });
    } catch (error) {
      console.error("[Performance Hook] Cache clear failed:", error);
    }
  }, []);

  // Update cache usage stats
  useEffect(() => {
    const updateStats = () => {
      try {
        // Calculate approximate memory usage
        let memoryUsage = 0;
        let diskUsage = 0;

        // Session storage (memory)
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("perf_cache_")) {
            memoryUsage += sessionStorage.getItem(key)?.length || 0;
          }
        });

        // Local storage (disk)
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("perf_cache_")) {
            diskUsage += localStorage.getItem(key)?.length || 0;
          }
        });

        setCacheStats((prev) => ({
          ...prev,
          memoryUsage,
          diskUsage,
        }));
      } catch (error) {
        console.error(
          "[Performance Hook] Failed to update cache stats:",
          error
        );
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    cacheStats,
    setCache,
    getCache,
    removeCache,
    clearAllCaches,
  };
}

// Hook for image optimization
export function useImageOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeImage = useCallback(
    async (imageUrl: string, quality: number = 0.8) => {
      setIsOptimizing(true);
      try {
        const optimizedUrl = await performanceService.optimizeImage(
          imageUrl,
          quality
        );
        return optimizedUrl;
      } catch (error) {
        console.error("[Performance Hook] Image optimization failed:", error);
        return imageUrl; // Return original if optimization fails
      } finally {
        setIsOptimizing(false);
      }
    },
    []
  );

  return {
    optimizeImage,
    isOptimizing,
  };
}

// Hook for preloading critical data
export function useDataPreloader() {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadStatus, setPreloadStatus] = useState<{
    completed: number;
    total: number;
    errors: string[];
  }>({
    completed: 0,
    total: 0,
    errors: [],
  });

  const preloadCriticalData = useCallback(async () => {
    setIsPreloading(true);
    setPreloadStatus({
      completed: 0,
      total: 0,
      errors: [],
    });

    try {
      await performanceService.preloadCriticalData();
      setPreloadStatus((prev) => ({
        ...prev,
        completed: prev.total,
      }));
    } catch (error) {
      console.error("[Performance Hook] Preload failed:", error);
      setPreloadStatus((prev) => ({
        ...prev,
        errors: [
          ...prev.errors,
          error instanceof Error ? error.message : "Unknown error",
        ],
      }));
    } finally {
      setIsPreloading(false);
    }
  }, []);

  return {
    preloadCriticalData,
    isPreloading,
    preloadStatus,
  };
}

// Hook for API response time tracking
export function useAPIPerformanceTracking() {
  const [apiMetrics, setApiMetrics] = useState<
    Record<
      string,
      {
        averageTime: number;
        requests: number;
        totalTime: number;
        lastRequest: Date;
      }
    >
  >({});

  const trackAPICall = useCallback((apiName: string, responseTime: number) => {
    setApiMetrics((prev) => {
      const existing = prev[apiName] || {
        averageTime: 0,
        requests: 0,
        totalTime: 0,
        lastRequest: new Date(),
      };

      const newRequests = existing.requests + 1;
      const newTotalTime = existing.totalTime + responseTime;

      return {
        ...prev,
        [apiName]: {
          averageTime: newTotalTime / newRequests,
          requests: newRequests,
          totalTime: newTotalTime,
          lastRequest: new Date(),
        },
      };
    });

    // Also track in performance service
    performanceService.measureAPIResponse(apiName, Date.now() - responseTime);
  }, []);

  const getAPIMetrics = useCallback(
    (apiName: string) => {
      return apiMetrics[apiName] || null;
    },
    [apiMetrics]
  );

  const resetAPIMetrics = useCallback(() => {
    setApiMetrics({});
  }, []);

  return {
    trackAPICall,
    getAPIMetrics,
    resetAPIMetrics,
    allMetrics: apiMetrics,
  };
}

// Hook for comprehensive performance monitoring
export function usePerformanceMonitoring() {
  const {
    metrics,
    isLoading: metricsLoading,
    refreshMetrics,
  } = usePerformanceMetrics();
  const {
    insights,
    isLoading: insightsLoading,
    refreshInsights,
  } = usePerformanceInsights();
  const {
    settings,
    updateSettings,
    isLoading: settingsLoading,
  } = useOptimizationSettings();
  const { cacheStats, clearAllCaches } = useAdvancedCache();

  const exportData = useCallback(() => {
    try {
      return performanceService.exportPerformanceData();
    } catch (error) {
      console.error("[Performance Hook] Export failed:", error);
      return null;
    }
  }, []);

  const runOptimization = useCallback(async () => {
    try {
      // Clear old caches
      clearAllCaches();

      // Preload critical data
      await performanceService.preloadCriticalData();

      // Refresh metrics and insights
      refreshMetrics();
      refreshInsights();

      return true;
    } catch (error) {
      console.error("[Performance Hook] Optimization run failed:", error);
      return false;
    }
  }, [clearAllCaches, refreshMetrics, refreshInsights]);

  return {
    metrics,
    insights,
    settings,
    cacheStats,
    isLoading: metricsLoading || insightsLoading || settingsLoading,
    updateSettings,
    refreshMetrics,
    refreshInsights,
    clearAllCaches,
    exportData,
    runOptimization,
  };
}
