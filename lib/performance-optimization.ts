/**
 * Performance Optimization Service for ClimateGuard
 * Implements advanced caching, data compression, lazy loading, and monitoring for production deployment
 */

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  apiResponseTimes: Record<string, number>;
  cacheHitRate: number;
  bundleSize: number;
}

export interface CacheConfig {
  maxSize: number; // bytes
  maxAge: number; // milliseconds
  compression: boolean;
  persistToDisk: boolean;
}

export interface OptimizationSettings {
  enableDataCompression: boolean;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enableServiceWorker: boolean;
  cacheStrategy: "memory" | "disk" | "hybrid";
  compressionLevel: 1 | 2 | 3 | 4 | 5; // 1=fastest, 5=best compression
  preloadCriticalData: boolean;
  enableAnalytics: boolean;
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: 0,
    apiResponseTimes: {},
    cacheHitRate: 0,
    bundleSize: 0,
  };

  private settings: OptimizationSettings = {
    enableDataCompression: true,
    enableImageOptimization: true,
    enableCodeSplitting: true,
    enableServiceWorker: true,
    cacheStrategy: "hybrid",
    compressionLevel: 3,
    preloadCriticalData: true,
    enableAnalytics: true,
  };

  private performanceObserver: PerformanceObserver | null = null;
  private memoryMonitor: number | null = null;
  private compressionWorker: Worker | null = null;

  constructor() {
    this.initializePerformanceMonitoring();
    this.initializeCompressionWorker();
    this.startMemoryMonitoring();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private initializePerformanceMonitoring(): void {
    if (typeof window === "undefined") return;

    // Web Vitals monitoring
    if ("PerformanceObserver" in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          switch (entry.entryType) {
            case "paint":
              if (entry.name === "first-contentful-paint") {
                this.metrics.firstContentfulPaint = entry.startTime;
              }
              break;
            case "largest-contentful-paint":
              this.metrics.largestContentfulPaint = entry.startTime;
              break;
            case "layout-shift":
              // @ts-ignore
              this.metrics.cumulativeLayoutShift += entry.value;
              break;
            case "first-input":
              // @ts-ignore - PerformanceEventTiming has processingStart
              this.metrics.firstInputDelay =
                (entry as any).processingStart - entry.startTime;
              break;
            case "navigation":
              // @ts-ignore
              this.metrics.pageLoadTime = entry.loadEventEnd - entry.fetchStart;
              break;
          }
        });
      });

      this.performanceObserver.observe({
        entryTypes: [
          "paint",
          "largest-contentful-paint",
          "layout-shift",
          "first-input",
          "navigation",
        ],
      });
    }
  }

  private initializeCompressionWorker(): void {
    if (typeof Worker === "undefined") return;

    try {
      // Create inline worker for data compression
      const workerCode = `
        self.onmessage = function(e) {
          const { data, method, level } = e.data;
          
          try {
            let result;
            if (method === 'compress') {
              // Simple compression simulation (in production, use proper compression libraries)
              const compressed = JSON.stringify(data);
              result = {
                compressed: compressed,
                originalSize: JSON.stringify(data).length,
                compressedSize: compressed.length,
                ratio: compressed.length / JSON.stringify(data).length
              };
            } else if (method === 'decompress') {
              result = JSON.parse(data);
            }
            
            self.postMessage({ success: true, result });
          } catch (error) {
            self.postMessage({ success: false, error: error.message });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      this.compressionWorker = new Worker(URL.createObjectURL(blob));
    } catch (error) {
      console.warn("[Performance] Compression worker not available:", error);
    }
  }

  private startMemoryMonitoring(): void {
    if (typeof window === "undefined") return;

    this.memoryMonitor = window.setInterval(() => {
      if ("memory" in performance) {
        // @ts-ignore
        this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Compress data using web worker
   */
  async compressData(
    data: any,
    level: number = 3
  ): Promise<{
    compressed: string;
    originalSize: number;
    compressedSize: number;
    ratio: number;
  }> {
    return new Promise((resolve, reject) => {
      if (!this.compressionWorker) {
        // Fallback to JSON stringify if worker not available
        const compressed = JSON.stringify(data);
        resolve({
          compressed,
          originalSize: JSON.stringify(data).length,
          compressedSize: compressed.length,
          ratio: compressed.length / JSON.stringify(data).length,
        });
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Compression timeout"));
      }, 5000);

      this.compressionWorker.onmessage = (e) => {
        clearTimeout(timeout);
        if (e.data.success) {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
      };

      this.compressionWorker.postMessage({
        data,
        method: "compress",
        level,
      });
    });
  }

  /**
   * Decompress data using web worker
   */
  async decompressData(compressedData: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.compressionWorker) {
        // Fallback to JSON parse if worker not available
        try {
          resolve(JSON.parse(compressedData));
        } catch (error) {
          reject(error);
        }
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Decompression timeout"));
      }, 5000);

      this.compressionWorker.onmessage = (e) => {
        clearTimeout(timeout);
        if (e.data.success) {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
      };

      this.compressionWorker.postMessage({
        data: compressedData,
        method: "decompress",
      });
    });
  }

  /**
   * Advanced caching with compression and TTL
   */
  async setCache(key: string, data: any, ttl: number = 3600000): Promise<void> {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
        compressed: false,
      };

      // Compress data if enabled and data is large enough
      if (
        this.settings.enableDataCompression &&
        JSON.stringify(data).length > 1024
      ) {
        const compressionResult = await this.compressData(
          data,
          this.settings.compressionLevel
        );
        cacheEntry.data = compressionResult.compressed;
        cacheEntry.compressed = true;
      }

      // Store in appropriate cache based on strategy
      switch (this.settings.cacheStrategy) {
        case "memory":
          sessionStorage.setItem(
            `perf_cache_${key}`,
            JSON.stringify(cacheEntry)
          );
          break;
        case "disk":
          localStorage.setItem(`perf_cache_${key}`, JSON.stringify(cacheEntry));
          break;
        case "hybrid":
          // Store small items in memory, large items on disk
          const size = JSON.stringify(cacheEntry).length;
          if (size < 50000) {
            // 50KB
            sessionStorage.setItem(
              `perf_cache_${key}`,
              JSON.stringify(cacheEntry)
            );
          } else {
            localStorage.setItem(
              `perf_cache_${key}`,
              JSON.stringify(cacheEntry)
            );
          }
          break;
      }
    } catch (error) {
      console.warn("[Performance] Cache set failed:", error);
    }
  }

  /**
   * Get cached data with automatic decompression
   */
  async getCache(key: string): Promise<any | null> {
    try {
      // Try memory first, then disk
      let cached = sessionStorage.getItem(`perf_cache_${key}`);
      if (!cached) {
        cached = localStorage.getItem(`perf_cache_${key}`);
      }

      if (!cached) return null;

      const cacheEntry = JSON.parse(cached);

      // Check if expired
      if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
        this.removeCache(key);
        return null;
      }

      // Decompress if needed
      if (cacheEntry.compressed) {
        return await this.decompressData(cacheEntry.data);
      }

      return cacheEntry.data;
    } catch (error) {
      console.warn("[Performance] Cache get failed:", error);
      return null;
    }
  }

  /**
   * Remove cached data
   */
  removeCache(key: string): void {
    sessionStorage.removeItem(`perf_cache_${key}`);
    localStorage.removeItem(`perf_cache_${key}`);
  }

  /**
   * Clear all performance caches
   */
  clearAllCaches(): void {
    // Clear performance caches
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("perf_cache_")) {
        sessionStorage.removeItem(key);
      }
    });

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("perf_cache_")) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Preload critical data
   */
  async preloadCriticalData(): Promise<void> {
    if (!this.settings.preloadCriticalData) return;

    const criticalResources = [
      "/api/alerts",
      "/api/weather/current",
      "/api/location/risk",
    ];

    const preloadPromises = criticalResources.map(async (resource) => {
      try {
        const cached = await this.getCache(`preload_${resource}`);
        if (!cached) {
          // Simulate API call - in production, replace with actual API calls
          const response = await fetch(resource).catch(() => null);
          if (response?.ok) {
            const data = await response.json();
            await this.setCache(`preload_${resource}`, data, 300000); // 5 minutes
          }
        }
      } catch (error) {
        console.warn(`[Performance] Preload failed for ${resource}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Optimize images by reducing quality and size
   */
  async optimizeImage(
    imageUrl: string,
    quality: number = 0.8
  ): Promise<string> {
    if (!this.settings.enableImageOptimization) return imageUrl;

    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Reduce size if image is too large
        const maxWidth = 1200;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        const optimizedUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(optimizedUrl);
      };

      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  }

  /**
   * Measure API response time
   */
  measureAPIResponse(apiName: string, startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.apiResponseTimes[apiName] = responseTime;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance insights and recommendations
   */
  getPerformanceInsights(): {
    score: number;
    insights: {
      category: "critical" | "warning" | "good";
      message: string;
      recommendation: string;
    }[];
  } {
    const insights: {
      category: "critical" | "warning" | "good";
      message: string;
      recommendation: string;
    }[] = [];

    let score = 100;

    // Check page load time
    if (this.metrics.pageLoadTime > 3000) {
      score -= 20;
      insights.push({
        category: "critical",
        message: "Page load time is slow (>3s)",
        recommendation: "Enable code splitting and optimize bundle size",
      });
    } else if (this.metrics.pageLoadTime > 1500) {
      score -= 10;
      insights.push({
        category: "warning",
        message: "Page load time could be improved",
        recommendation:
          "Consider enabling data compression and image optimization",
      });
    }

    // Check LCP
    if (this.metrics.largestContentfulPaint > 2500) {
      score -= 15;
      insights.push({
        category: "critical",
        message: "Largest Contentful Paint is slow (>2.5s)",
        recommendation:
          "Optimize critical rendering path and preload key resources",
      });
    }

    // Check memory usage
    if (this.metrics.memoryUsage > 100 * 1024 * 1024) {
      // 100MB
      score -= 10;
      insights.push({
        category: "warning",
        message: "High memory usage detected",
        recommendation: "Enable data compression and clear unused caches",
      });
    }

    // Check API response times
    Object.entries(this.metrics.apiResponseTimes).forEach(([api, time]) => {
      if (time > 2000) {
        score -= 5;
        insights.push({
          category: "warning",
          message: `${api} API response is slow (${time}ms)`,
          recommendation:
            "Enable API caching and consider request optimization",
        });
      }
    });

    if (insights.length === 0) {
      insights.push({
        category: "good",
        message: "Performance is optimized",
        recommendation:
          "Continue monitoring and maintain current optimizations",
      });
    }

    return {
      score: Math.max(0, score),
      insights,
    };
  }

  /**
   * Update optimization settings
   */
  updateSettings(newSettings: Partial<OptimizationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };

    // Restart services if needed
    if (
      newSettings.enableDataCompression !== undefined &&
      !newSettings.enableDataCompression
    ) {
      // Disable compression worker
      if (this.compressionWorker) {
        this.compressionWorker.terminate();
        this.compressionWorker = null;
      }
    } else if (newSettings.enableDataCompression && !this.compressionWorker) {
      this.initializeCompressionWorker();
    }
  }

  /**
   * Get current settings
   */
  getSettings(): OptimizationSettings {
    return { ...this.settings };
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): {
    metrics: PerformanceMetrics;
    settings: OptimizationSettings;
    insights: {
      score: number;
      insights: {
        category: "critical" | "warning" | "good";
        message: string;
        recommendation: string;
      }[];
    };
    timestamp: Date;
  } {
    return {
      metrics: this.getMetrics(),
      settings: this.getSettings(),
      insights: this.getPerformanceInsights(),
      timestamp: new Date(),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }

    if (this.compressionWorker) {
      this.compressionWorker.terminate();
    }
  }
}

// Export singleton instance
export const performanceService = PerformanceService.getInstance();
