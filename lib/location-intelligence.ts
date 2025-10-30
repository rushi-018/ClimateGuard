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
   * Update risk assessment for current location
   */
  private async updateRiskAssessment(): Promise<void> {
    if (!this.currentLocation) return;

    try {
      // Simulate risk assessment - in production, call real APIs
      const riskAssessment: LocationRiskAssessment = {
        location: this.currentLocation,
        overallRisk: Math.floor(Math.random() * 40) + 30, // 30-70
        riskFactors: {
          flooding: Math.random() * 100,
          heatWave: Math.random() * 100,
          drought: Math.random() * 100,
          wildfire: Math.random() * 100,
          airQuality: Math.random() * 100,
          seaLevelRise: Math.random() * 100,
        },
        localWeather: {
          temperature: Math.random() * 30 + 10,
          humidity: Math.random() * 60 + 40,
          windSpeed: Math.random() * 20,
          precipitation: Math.random() * 10,
        },
        recommendations: this.generateRecommendations(),
        lastUpdated: new Date(),
      };

      this.riskAssessment = riskAssessment;
      this.notifyListeners(riskAssessment);
    } catch (error) {
      console.error("[LocationIntelligence] Risk assessment error:", error);
      this.notifyError("Failed to update location-based risk assessment");
    }
  }

  /**
   * Generate location-specific recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations = [
      "Monitor local weather conditions closely",
      "Keep emergency supplies readily available",
      "Stay informed about evacuation routes",
      "Consider weather-resistant home improvements",
      "Install early warning systems if available",
    ];

    return recommendations.slice(0, 3); // Return 3 random recommendations
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
