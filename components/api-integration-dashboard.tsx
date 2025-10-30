/**
 * API Integration Dashboard
 * Displays live weather, economic, and disaster data from real-world APIs
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CloudRain,
  Thermometer,
  Wind,
  Eye,
  Gauge,
  Droplets,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  Clock,
  MapPin,
  Zap,
  Globe,
  Activity,
} from 'lucide-react';
import {
  useLiveWeatherData,
  useLiveEconomicData,
  useLiveDisasterData,
  useAPIHealthStatus,
  useAPICacheManager,
  useLiveClimateData,
} from '@/hooks/use-api-integration';
import { useLocationIntelligence } from '@/hooks/use-location-intelligence';

interface APIIntegrationDashboardProps {
  className?: string;
}

const severityColors = {
  minor: 'bg-blue-100 text-blue-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  severe: 'bg-orange-100 text-orange-800',
  extreme: 'bg-red-100 text-red-800',
};

const statusColors = {
  healthy: 'bg-green-100 text-green-800',
  degraded: 'bg-yellow-100 text-yellow-800',
  down: 'bg-red-100 text-red-800',
};

const sourceColors = {
  api: 'bg-green-100 text-green-800',
  cache: 'bg-blue-100 text-blue-800',
  fallback: 'bg-orange-100 text-orange-800',
};

export function APIIntegrationDashboard({ className }: APIIntegrationDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Get user location for live data
  const { location } = useLocationIntelligence();
  const lat = location?.latitude || 40.7128; // Default to NYC
  const lng = location?.longitude || -74.0060;

  // Hooks for live data
  const liveClimateData = useLiveClimateData(lat, lng, "US", {
    enableWeather: true,
    enableEconomic: true,
    enableDisaster: true,
    autoRefresh: true,
  });

  const { healthStatus, loading: healthLoading, checkHealth } = useAPIHealthStatus();
  const { cacheStats, clearCache } = useAPICacheManager();

  const formatNumber = (num: number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (num: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const WeatherCard = ({ weather }: { weather: any }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="w-5 h-5" />
          Live Weather Data
        </CardTitle>
        <CardDescription>
          {weather?.data?.location.name}, {weather?.data?.location.country}
        </CardDescription>
        <div className="flex gap-2">
          <Badge variant="outline" className={sourceColors[weather?.source as keyof typeof sourceColors] || sourceColors.fallback}>
            {weather?.source || 'fallback'}
          </Badge>
          {weather?.cached && <Badge variant="outline">Cached</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {weather?.data ? (
          <div className="space-y-6">
            {/* Current Conditions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Thermometer className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{Math.round(weather.data.current.temperature)}°C</div>
                <div className="text-sm text-muted-foreground">Temperature</div>
              </div>
              <div className="text-center">
                <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{weather.data.current.humidity}%</div>
                <div className="text-sm text-muted-foreground">Humidity</div>
              </div>
              <div className="text-center">
                <Wind className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                <div className="text-2xl font-bold">{Math.round(weather.data.current.windSpeed)}</div>
                <div className="text-sm text-muted-foreground">km/h</div>
              </div>
              <div className="text-center">
                <Gauge className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{Math.round(weather.data.current.pressure)}</div>
                <div className="text-sm text-muted-foreground">hPa</div>
              </div>
            </div>

            {/* Weather Alerts */}
            {weather.data.alerts.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Active Weather Alerts ({weather.data.alerts.length})
                </h4>
                <div className="space-y-2">
                  {weather.data.alerts.slice(0, 3).map((alert: any) => (
                    <div key={alert.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">{alert.description}</div>
                        </div>
                        <Badge variant="outline" className={severityColors[alert.severity as keyof typeof severityColors]}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7-Day Forecast */}
            <div>
              <h4 className="font-medium mb-3">7-Day Forecast</h4>
              <div className="grid grid-cols-7 gap-2">
                {weather.data.forecast.map((day: any, index: number) => (
                  <div key={day.date} className="text-center p-2 border rounded">
                    <div className="text-xs font-medium">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-bold mt-1">{Math.round(day.maxTemp)}°</div>
                    <div className="text-xs text-muted-foreground">{Math.round(day.minTemp)}°</div>
                    <div className="text-xs mt-1">{day.precipitationChance}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CloudRain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No weather data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const EconomicCard = ({ economic }: { economic: any }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Live Economic Data
        </CardTitle>
        <CardDescription>
          {economic?.data?.country} ({economic?.data?.countryCode})
        </CardDescription>
        <div className="flex gap-2">
          <Badge variant="outline" className={sourceColors[economic?.source as keyof typeof sourceColors] || sourceColors.fallback}>
            {economic?.source || 'fallback'}
          </Badge>
          {economic?.cached && <Badge variant="outline">Cached</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {economic?.data ? (
          <div className="space-y-6">
            {/* Key Economic Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">
                  {formatCurrency(economic.data.indicators.gdp.value / 1e12, 'USD')}T
                </div>
                <div className="text-sm text-muted-foreground">GDP ({economic.data.indicators.gdp.year})</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Activity className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">
                  {formatNumber(economic.data.indicators.inflation.value, 1)}%
                </div>
                <div className="text-sm text-muted-foreground">Inflation ({economic.data.indicators.inflation.year})</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">
                  {formatNumber(economic.data.indicators.population.value / 1e6, 1)}M
                </div>
                <div className="text-sm text-muted-foreground">Population ({economic.data.indicators.population.year})</div>
              </div>
            </div>

            {/* Climate Economics */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Climate Economics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Total Climate Damages</div>
                  <div className="text-2xl font-bold text-red-900">
                    {formatCurrency(economic.data.climateCosts.totalDamages / 1e9, 'USD')}B
                  </div>
                  <div className="text-sm text-red-600">Annual cost ({economic.data.climateCosts.year})</div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Adaptation Costs</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(economic.data.climateCosts.adaptationCosts / 1e9, 'USD')}B
                  </div>
                  <div className="text-sm text-blue-600">Required investment</div>
                </div>
              </div>
            </div>

            {/* Climate Financing */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-green-800">Climate Financing</div>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(economic.data.indicators.climateFinancing.value / 1e9, 'USD')}B
              </div>
              <div className="text-sm text-green-600">Available funding ({economic.data.indicators.climateFinancing.year})</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No economic data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const DisasterCard = ({ disaster }: { disaster: any }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Live Disaster Events
        </CardTitle>
        <CardDescription>
          Active natural disasters and emergencies worldwide
        </CardDescription>
        <div className="flex gap-2">
          <Badge variant="outline" className={sourceColors[disaster?.source as keyof typeof sourceColors] || sourceColors.fallback}>
            {disaster?.source || 'fallback'}
          </Badge>
          {disaster?.cached && <Badge variant="outline">Cached</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {disaster?.data?.events ? (
          <div className="space-y-4">
            {disaster.data.events.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No active disasters reported</p>
              </div>
            ) : (
              disaster.data.events.slice(0, 5).map((event: any) => (
                <div key={event.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{event.description}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className={severityColors[event.severity as keyof typeof severityColors]}>
                        {event.severity}
                      </Badge>
                      <Badge variant="outline" className={event.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.category}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Started {formatDate(event.startDate)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {disaster.data.events.length > 5 && (
              <div className="text-center py-2">
                <Button variant="outline" size="sm">
                  View All {disaster.data.events.length} Events
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No disaster data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (liveClimateData.isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading live climate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Integration</h1>
          <p className="text-muted-foreground mt-2">
            Live data from weather services, economic databases, and disaster monitoring systems
          </p>
        </div>
        <Button onClick={liveClimateData.refetchAll} disabled={liveClimateData.isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${liveClimateData.isLoading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* API Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            API Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Weather API</div>
                <div className="text-sm text-muted-foreground">WeatherAPI.com</div>
              </div>
              <Badge variant="outline" className={statusColors[healthStatus?.weather.status || 'down']}>
                {healthStatus?.weather.status || 'unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Economic API</div>
                <div className="text-sm text-muted-foreground">World Bank</div>
              </div>
              <Badge variant="outline" className={statusColors[healthStatus?.economic.status || 'down']}>
                {healthStatus?.economic.status || 'unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Disaster API</div>
                <div className="text-sm text-muted-foreground">NASA EONET</div>
              </div>
              <Badge variant="outline" className={statusColors[healthStatus?.disaster.status || 'down']}>
                {healthStatus?.disaster.status || 'unknown'}
              </Badge>
            </div>
          </div>
          
          {/* Cache Stats */}
          {cacheStats && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="font-medium">Cache Statistics</span>
                </div>
                <Button variant="outline" size="sm" onClick={clearCache}>
                  Clear Cache
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Entries</div>
                  <div className="font-medium">{cacheStats.totalEntries}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Size</div>
                  <div className="font-medium">{cacheStats.totalSize}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Hit Rate</div>
                  <div className="font-medium">{cacheStats.hitRate}%</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {liveClimateData.hasError && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some API services are experiencing issues. Displaying cached or fallback data where available.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="economic">Economic</TabsTrigger>
          <TabsTrigger value="disaster">Disasters</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Current Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span>Temperature</span>
                    </div>
                    <span className="font-medium">
                      {liveClimateData.weather?.data ? `${Math.round(liveClimateData.weather.data.current.temperature)}°C` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span>GDP</span>
                    </div>
                    <span className="font-medium">
                      {liveClimateData.economic?.data ? formatCurrency(liveClimateData.economic.data.indicators.gdp.value / 1e12, 'USD') + 'T' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span>Active Disasters</span>
                    </div>
                    <span className="font-medium">
                      {liveClimateData.disaster?.data?.events?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveClimateData.allSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">Source {index + 1}</span>
                      <Badge variant="outline" className={sourceColors[source as keyof typeof sourceColors]}>
                        {source}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <Card>
              <CardHeader>
                <CardTitle>Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="font-medium">
                    {formatDate(new Date(liveClimateData.lastUpdated))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weather">
          <WeatherCard weather={liveClimateData.weather} />
        </TabsContent>

        <TabsContent value="economic">
          <EconomicCard economic={liveClimateData.economic} />
        </TabsContent>

        <TabsContent value="disaster">
          <DisasterCard disaster={liveClimateData.disaster} />
        </TabsContent>
      </Tabs>
    </div>
  );
}