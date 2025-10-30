"use client"

import { Suspense, lazy, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { LocationSelector, type Location, POPULAR_LOCATIONS } from "@/components/location-selector"

// Lazy load components for better performance
const GlobalHeatmap = lazy(() => import("@/components/enhanced-global-heatmap").then(module => ({ default: module.GlobalHeatmap })))
const RiskCards = lazy(() => import("@/components/risk-cards").then(module => ({ default: module.RiskCards })))
const RiskTrendChart = lazy(() => import("@/components/risk-trend-chart").then(module => ({ default: module.RiskTrendChart })))
const ActionList = lazy(() => import("@/components/action-list").then(module => ({ default: module.ActionList })))
const VoiceQA = lazy(() => import('@/components/voice-qa').then(module => ({ default: module.VoiceQA })))
import { RealClimateAlerts } from '@/components/real-climate-alerts'
const LocationIntelligencePanel = lazy(() => import('@/components/location-intelligence-panel').then(module => ({ default: module.LocationIntelligencePanel })))
const EconomicIntelligenceDashboard = lazy(() => import('@/components/economic-intelligence-dashboard').then(module => ({ default: module.EconomicIntelligenceDashboard })))
const ActionRecommendationsDashboard = lazy(() => import('@/components/action-recommendations-dashboard').then(module => ({ default: module.ActionRecommendationsDashboard })))
const RiskForecast = lazy(() => import('@/components/risk-forecast').then(module => ({ default: module.RiskForecast })))
const AdaptationDashboard = lazy(() => import('@/components/adaptation-dashboard').then(module => ({ default: module.AdaptationDashboard })))
const DisasterPredictor = lazy(() => import('@/components/disaster-predictor').then(module => ({ default: module.DisasterPredictor })))

// Simple loading components
const MapSkeleton = () => (
  <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
)

const CardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
)

const ChartSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-96 w-full" />
  </div>
)

export default function Dashboard() {
  // Default location is New York City
  const [selectedLocation, setSelectedLocation] = useState<Location>(
    POPULAR_LOCATIONS.find(loc => loc.id === "new-york") || POPULAR_LOCATIONS[0]
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">ClimateGuard Dashboard</h1>
              <p className="text-muted-foreground mt-2">Real-time climate risk monitoring and analysis</p>
            </div>
            <LocationSelector 
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="adaptation">🎯 My Plan</TabsTrigger>
            <TabsTrigger value="predictor">⚠️ 48h Forecast</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="economic">Economic</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            {/* Global Climate Map Section - Full Width at Top */}
            <Card>
              <CardHeader>
                <CardTitle>Global Climate Risk Map</CardTitle>
                <CardDescription>Interactive visualization of worldwide climate risks and hotspots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <Suspense fallback={<MapSkeleton />}>
                    <GlobalHeatmap />
                  </Suspense>
                </div>
              </CardContent>
            </Card>
            
            {/* Current Risk Assessment - Vertical Scrollable Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Current Risk Assessment</CardTitle>
                <CardDescription>Real-time climate risk indicators for {selectedLocation.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto pr-2">
                  <Suspense fallback={<CardSkeleton />}>
                    <RiskCards location={selectedLocation} />
                  </Suspense>
                </div>
              </CardContent>
            </Card>

            {/* 10-Day Risk Forecast Section - Full Width */}
            <Suspense fallback={<ChartSkeleton />}>
              <RiskForecast location={selectedLocation} />
            </Suspense>
          </TabsContent>

          <TabsContent value="adaptation" className="space-y-6">
            <Suspense fallback={<ChartSkeleton />}>
              <AdaptationDashboard location={selectedLocation} />
            </Suspense>
          </TabsContent>

          <TabsContent value="predictor" className="space-y-6">
            <Suspense fallback={<ChartSkeleton />}>
              <DisasterPredictor location={{
                name: selectedLocation.name,
                lat: selectedLocation.lat,
                lon: selectedLocation.lon
              }} />
            </Suspense>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <RealClimateAlerts location={{
              name: selectedLocation.name,
              lat: selectedLocation.lat,
              lon: selectedLocation.lon
            }} />
            
            {/* Voice Assistant Section */}
            <Card>
              <CardHeader>
                <CardTitle>AI Voice Assistant</CardTitle>
                <CardDescription>Ask questions about climate data and get instant insights powered by Groq AI</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <VoiceQA location={selectedLocation} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location Intelligence</CardTitle>
                <CardDescription>Location-specific climate insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <LocationIntelligencePanel />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="economic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Economic Impact Analysis</CardTitle>
                <CardDescription>Financial implications and economic forecasting for climate risks</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <EconomicIntelligenceDashboard />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Actionable insights and recommendations for climate risk mitigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <Suspense fallback={<ChartSkeleton />}>
                    <ActionList />
                  </Suspense>
                  <Suspense fallback={<ChartSkeleton />}>
                    <ActionRecommendationsDashboard />
                  </Suspense>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>
    </div>
  )
}