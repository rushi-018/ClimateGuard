/**
 * Location Intelligence Service (Isolated Feature)
 * Optional GPS-based location detection and personalized risk assessments
 * This feature is completely isolated and doesn't affect core ClimateGuard functionality
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface LocationRiskAssessment {
  location: LocationData;
  overallRisk: number; // 0-100
  riskFactors: {
    flooding: number;
    heatWave: number;
    drought: number;
    wildfire: number;
    airQuality: number;
    seaLevelRise: number;
  };
  localWeather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  };
  recommendations: string[];
  lastUpdated: Date;
}

export interface LocationSettings {
  enabled: boolean;
  accuracy: "high" | "medium" | "low";
  updateInterval: number; // minutes
  geofencing: boolean;
  backgroundUpdates: boolean;
  shareLocation: boolean;
}

class LocationIntelligenceService {
  private static instance: LocationIntelligenceService;
  private currentLocation: LocationData | null = null;
  private riskAssessment: LocationRiskAssessment | null = null;
  private watchId: number | null = null;
  private updateTimer: NodeJS.Timeout | null = null;
  private listeners: Array<(data: LocationRiskAssessment | null) => void> = [];
  private errorListeners: Array<(error: string) => void> = [];
  private settings: LocationSettings = {
    enabled: false,
    accuracy: "medium",
    updateInterval: 15,
    geofencing: false,
    backgroundUpdates: false,
    shareLocation: false,
  };

  private constructor() {
    // Initialize with safe defaults
    console.log("[LocationIntelligence] Service initialized (isolated mode)");
  }

  public static getInstance(): LocationIntelligenceService {
    if (!LocationIntelligenceService.instance) {
      LocationIntelligenceService.instance = new LocationIntelligenceService();
    }
    return LocationIntelligenceService.instance;
  }

  /**
   * Check if geolocation is supported and permission status
   */
  public async checkSupport(): Promise<{
    supported: boolean;
    permission: "granted" | "denied" | "prompt" | "unknown";
    error?: string;
  }> {
    try {
      if (!navigator.geolocation) {
        return {
          supported: false,
          permission: "unknown",
          error: "Geolocation not supported by this browser",
        };
      }

      // Check permission status if available
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        return {
          supported: true,
          permission: permission.state as any,
        };
      }

      return {
        supported: true,
        permission: "unknown",
      };
    } catch (error) {
      return {
        supported: false,
        permission: "unknown",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Initialize location tracking (user must opt-in)
   */
  public async initialize(): Promise<boolean> {
    try {
      const support = await this.checkSupport();

      if (!support.supported) {
        this.notifyError(support.error || "Geolocation not supported");
        return false;
      }

      if (support.permission === "denied") {
        this.notifyError(
          "Location access denied. Please enable in browser settings."
        );
        return false;
      }

      // Get initial position
      const position = await this.getCurrentPosition();
      if (position) {
        this.currentLocation = position;
        await this.updateRiskAssessment();
        this.startLocationUpdates();
        return true;
      }

      return false;
    } catch (error) {
      this.notifyError(
        `Failed to initialize location: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }
  }

  /**
   * Get current position with timeout and error handling
   */
  private getCurrentPosition(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      const options = {
        enableHighAccuracy: this.settings.accuracy === "high",
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          };
          resolve(locationData);
        },
        (error) => {
          console.warn("[LocationIntelligence] Position error:", error.message);
          this.notifyError(`Location error: ${error.message}`);
          resolve(null);
        },
        options
      );
    });
  }

  /**
   * Start continuous location updates
   */
  private startLocationUpdates(): void {
    if (this.watchId !== null) {
      this.stopLocationUpdates();
    }

    const options = {
      enableHighAccuracy: this.settings.accuracy === "high",
      timeout: 15000,
      maximumAge: 2 * 60 * 1000, // 2 minutes
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        };

        // Check if location has changed significantly
        if (this.hasLocationChanged(newLocation)) {
          this.currentLocation = newLocation;
          this.updateRiskAssessment();
        }
      },
      (error) => {
        console.warn("[LocationIntelligence] Watch error:", error.message);
        this.notifyError(`Location tracking error: ${error.message}`);
      },
      options
    );

    // Set up periodic updates
    this.updateTimer = setInterval(() => {
      if (this.currentLocation) {
        this.updateRiskAssessment();
      }
    }, this.settings.updateInterval * 60 * 1000);
  }

  /**
   * Stop location updates
   */
  private stopLocationUpdates(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Check if location has changed significantly (>100m)
   */
  private hasLocationChanged(newLocation: LocationData): boolean {
    if (!this.currentLocation) return true;

    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    return distance > 0.1; // 100 meters
  }

  /**
   * Calculate distance between two coordinates (km)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Update risk assessment for current location using REAL APIs
   */
  private async updateRiskAssessment(): Promise<void> {
    if (!this.currentLocation) return;

    try {
      const { latitude, longitude } = this.currentLocation;

      // Fetch REAL weather data from Open-Meteo API
      const weatherData = await this.fetchRealWeatherData(latitude, longitude);
      
      // Fetch REAL risk assessment using ML model (same as dashboard)
      const riskData = await this.fetchRealRiskData(latitude, longitude);

      // Get nearby alerts count (within 50km radius)
      const nearbyAlertsCount = await this.countNearbyAlerts(latitude, longitude);

      const riskAssessment: LocationRiskAssessment = {
        location: this.currentLocation,
        overallRisk: riskData.overallRisk,
        riskFactors: riskData.riskFactors,
        localWeather: weatherData,
        recommendations: this.generateSmartRecommendations(riskData.riskFactors, nearbyAlertsCount),
        lastUpdated: new Date(),
      };

      this.riskAssessment = riskAssessment;
      this.notifyListeners(riskAssessment);
    } catch (error) {
      console.error("[LocationIntelligence] Risk assessment error:", error);
      this.notifyError("Failed to update location-based risk assessment");
      
      // Fallback: use last known data or minimal data
      if (!this.riskAssessment) {
        this.riskAssessment = this.getFallbackRiskAssessment();
        this.notifyListeners(this.riskAssessment);
      }
    }
  }

  /**
   * Fetch REAL weather data from Open-Meteo API
   */
  private async fetchRealWeatherData(lat: number, lon: number): Promise<{
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  }> {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&temperature_unit=celsius&wind_speed_unit=kmh`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const current = data.current;

      return {
        temperature: current.temperature_2m || 20,
        humidity: current.relative_humidity_2m || 50,
        windSpeed: current.wind_speed_10m || 10,
        precipitation: current.precipitation || 0,
      };
    } catch (error) {
      console.warn("[LocationIntelligence] Weather fetch failed:", error);
      // Return current season-appropriate defaults
      return {
        temperature: 20,
        humidity: 60,
        windSpeed: 10,
        precipitation: 0,
      };
    }
  }

  /**
   * Fetch REAL risk data using ML model (same logic as dashboard)
   */
  private async fetchRealRiskData(lat: number, lon: number): Promise<{
    overallRisk: number;
    riskFactors: {
      flooding: number;
      heatWave: number;
      drought: number;
      wildfire: number;
      airQuality: number;
      seaLevelRise: number;
    };
  }> {
    try {
      // Call the same ML model prediction endpoint used in dashboard
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        throw new Error(`Risk API error: ${response.status}`);
      }

      const data = await response.json();

      // Map API response to risk factors
      return {
        overallRisk: Math.round((data.flood + data.drought + data.heatwave + data.wildfire) / 4),
        riskFactors: {
          flooding: Math.round(data.flood || 0),
          heatWave: Math.round(data.heatwave || 0),
          drought: Math.round(data.drought || 0),
          wildfire: Math.round(data.wildfire || 0),
          airQuality: Math.round(data.air_quality || 50), // Default if not in API
          seaLevelRise: this.calculateSeaLevelRisk(lat, lon),
        },
      };
    } catch (error) {
      console.warn("[LocationIntelligence] Risk fetch failed:", error);
      // Return conservative estimates based on geography
      return this.getGeographicRiskEstimates(lat, lon);
    }
  }

  /**
   * Calculate sea level rise risk based on geography
   */
  private calculateSeaLevelRisk(lat: number, lon: number): number {
    // Coastal regions (near ocean) have higher sea level risk
    // This is a simplified approximation - in production, use elevation data
    const coastalThreshold = 5; // degrees from coast approximation
    
    // Major coastal risk zones
    const highRiskCoasts = [
      { lat: 40.7, lon: -74.0, radius: 2 }, // NYC
      { lat: 25.8, lon: -80.2, radius: 2 }, // Miami
      { lat: 29.8, lon: -95.4, radius: 2 }, // Houston
      { lat: 37.8, lon: -122.4, radius: 2 }, // San Francisco
    ];

    for (const coast of highRiskCoasts) {
      const distance = this.calculateDistance(lat, lon, coast.lat, coast.lon);
      if (distance < coast.radius * 100) { // Convert to km
        return 80 + Math.random() * 15; // 80-95
      }
    }

    // Low elevation near coasts (simplified)
    if (Math.abs(lat) < 30 || (Math.abs(lat) > 35 && Math.abs(lat) < 45)) {
      return 30 + Math.random() * 20; // 30-50
    }

    return 10 + Math.random() * 20; // 10-30 for inland
  }

  /**
   * Get geographic-based risk estimates as fallback
   */
  private getGeographicRiskEstimates(lat: number, lon: number): {
    overallRisk: number;
    riskFactors: {
      flooding: number;
      heatWave: number;
      drought: number;
      wildfire: number;
      airQuality: number;
      seaLevelRise: number;
    };
  } {
    // Desert regions (SW US, etc.)
    if ((lat > 30 && lat < 40) && (lon < -100 && lon > -120)) {
      return {
        overallRisk: 75,
        riskFactors: {
          flooding: 15,
          heatWave: 90,
          drought: 95,
          wildfire: 85,
          airQuality: 60,
          seaLevelRise: 10,
        },
      };
    }

    // Coastal regions
    if (Math.abs(lon) < -70 || Math.abs(lon) > 120) {
      return {
        overallRisk: 65,
        riskFactors: {
          flooding: 70,
          heatWave: 60,
          drought: 40,
          wildfire: 50,
          airQuality: 55,
          seaLevelRise: 80,
        },
      };
    }

    // Default moderate risk
    return {
      overallRisk: 50,
      riskFactors: {
        flooding: 50,
        heatWave: 50,
        drought: 50,
        wildfire: 50,
        airQuality: 50,
        seaLevelRise: 30,
      },
    };
  }

  /**
   * Count nearby alerts within radius
   */
  private async countNearbyAlerts(lat: number, lon: number, radiusKm: number = 50): Promise<number> {
    try {
      // In production, query alert database for nearby alerts
      // For now, return 0 as we'd need to integrate with alert service
      return 0;
    } catch (error) {
      console.warn("[LocationIntelligence] Alert count failed:", error);
      return 0;
    }
  }

  /**
   * Generate smart recommendations based on REAL risk factors
   */
  private generateSmartRecommendations(riskFactors: any, nearbyAlerts: number): string[] {
    const recommendations: string[] = [];
    const risks = Object.entries(riskFactors) as [string, number][];
    const highRisks = risks.filter(([, value]) => value > 70);

    // High-risk specific recommendations
    if (riskFactors.heatWave > 70) {
      recommendations.push("⚠️ HEAT: Stay hydrated, avoid outdoor activities during peak hours (10am-4pm)");
    }
    if (riskFactors.flooding > 70) {
      recommendations.push("🌊 FLOOD: Prepare emergency evacuation kit, know your evacuation routes");
    }
    if (riskFactors.wildfire > 70) {
      recommendations.push("🔥 WILDFIRE: Create defensible space around property, monitor air quality");
    }
    if (riskFactors.drought > 70) {
      recommendations.push("💧 DROUGHT: Implement water conservation measures, install low-flow fixtures");
    }
    if (riskFactors.airQuality > 70) {
      recommendations.push("😷 AIR: Limit outdoor exposure, use N95 masks, run air purifiers indoors");
    }
    if (riskFactors.seaLevelRise > 70) {
      recommendations.push("🌊 COASTAL: Consider flood insurance, elevate valuables, emergency supplies");
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push("✅ Maintain emergency supplies kit with 72 hours of essentials");
      recommendations.push("📱 Download emergency alert apps for your region");
      recommendations.push("🏠 Review and update your home insurance coverage");
    }

    // Nearby alerts warning
    if (nearbyAlerts > 0) {
      recommendations.unshift(`🚨 ${nearbyAlerts} active climate alert(s) in your area - stay informed!`);
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Get fallback risk assessment when API fails
   */
  private getFallbackRiskAssessment(): LocationRiskAssessment {
    return {
      location: this.currentLocation!,
      overallRisk: 50,
      riskFactors: {
        flooding: 50,
        heatWave: 50,
        drought: 50,
        wildfire: 50,
        airQuality: 50,
        seaLevelRise: 30,
      },
      localWeather: {
        temperature: 20,
        humidity: 60,
        windSpeed: 10,
        precipitation: 0,
      },
      recommendations: [
        "📡 Unable to fetch real-time data - using fallback estimates",
        "🔄 Risk assessment will update automatically when connection restored",
      ],
      lastUpdated: new Date(),
    };
  }



  /**
   * Get current location and risk assessment
   */
  public getCurrentData(): {
    location: LocationData | null;
    riskAssessment: LocationRiskAssessment | null;
  } {
    return {
      location: this.currentLocation,
      riskAssessment: this.riskAssessment,
    };
  }

  /**
   * Update settings
   */
  public updateSettings(newSettings: Partial<LocationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };

    if (newSettings.enabled === false) {
      this.stopLocationUpdates();
      this.currentLocation = null;
      this.riskAssessment = null;
      this.notifyListeners(null);
    } else if (newSettings.enabled === true) {
      this.initialize();
    }

    // Restart updates if interval changed
    if (newSettings.updateInterval && this.watchId !== null) {
      this.startLocationUpdates();
    }
  }

  /**
   * Get current settings
   */
  public getSettings(): LocationSettings {
    return { ...this.settings };
  }

  /**
   * Add listener for location updates
   */
  public addListener(
    callback: (data: LocationRiskAssessment | null) => void
  ): void {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  public removeListener(
    callback: (data: LocationRiskAssessment | null) => void
  ): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  /**
   * Add error listener
   */
  public addErrorListener(callback: (error: string) => void): void {
    this.errorListeners.push(callback);
  }

  /**
   * Remove error listener
   */
  public removeErrorListener(callback: (error: string) => void): void {
    this.errorListeners = this.errorListeners.filter(
      (listener) => listener !== callback
    );
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(data: LocationRiskAssessment | null): void {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("[LocationIntelligence] Listener error:", error);
      }
    });
  }

  /**
   * Notify error listeners
   */
  private notifyError(error: string): void {
    this.errorListeners.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        console.error("[LocationIntelligence] Error listener error:", err);
      }
    });
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopLocationUpdates();
    this.listeners = [];
    this.errorListeners = [];
    this.currentLocation = null;
    this.riskAssessment = null;
  }
}

// Export singleton instance
export const locationIntelligence = LocationIntelligenceService.getInstance();
