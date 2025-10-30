"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Thermometer, Droplets, Sun, BarChart3, TrendingUp, MapPin } from "lucide-react"
import { Suspense, lazy } from 'react'
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load the heavy components
const WorldMap = lazy(() => import("@/components/world-map").then(module => ({ default: module.WorldMap })))
const GlobalClimateTrends = lazy(() => import("@/components/global-climate-trends").then(module => ({ default: module.GlobalClimateTrends })))

// Loading component for the map
const MapSkeleton = () => (
  <div className="w-full h-full animate-pulse bg-muted rounded-lg flex items-center justify-center">
    <div className="text-muted-foreground flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <div>Loading Global Map...</div>
    </div>
  </div>
)

export default function GlobalViewPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Global Climate Intelligence</h1>
            <p className="text-muted-foreground">
              Advanced worldwide climate analysis, historical comparisons, and regional insights
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Global Overview</TabsTrigger>
              <TabsTrigger value="trends">Climate Analytics</TabsTrigger>
              <TabsTrigger value="regional">Regional Explorer</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Interactive Global Map */}
              <Card className="h-[70vh]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Interactive Global Climate Risk Map
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Real-time global climate risks with interactive hotspot exploration
                  </p>
                </CardHeader>
                <CardContent className="h-[calc(100%-100px)]">
                  <Suspense fallback={<MapSkeleton />}>
                    <WorldMap />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Current Global Statistics */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      Extreme Heat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Alerts</span>
                        <Badge variant="destructive">23</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cities above 40°C threshold
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sun className="w-4 h-4 text-orange-500" />
                      Drought Zones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Affected Regions</span>
                        <Badge variant="secondary">15</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Severe water scarcity areas
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Flood Risk
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">High-Risk Areas</span>
                        <Badge variant="default">8</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Elevated water level zones
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      Risk Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Overall Change</span>
                        <Badge variant="destructive">+12%</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Compared to last month
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Suspense 
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                <GlobalClimateTrends />
              </Suspense>
            </TabsContent>

            <TabsContent value="regional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Regional Climate Deep Dive
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select a region for detailed climate analysis and historical comparison
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Regional analysis tools coming soon</p>
                    <p className="text-sm">Select regions from the global map above for detailed insights</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
