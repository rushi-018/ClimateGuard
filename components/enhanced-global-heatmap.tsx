"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Map, Satellite, Layers, RefreshCw, Globe, Bell, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { useAlertSubscription, useSystemAlerts } from "@/hooks/use-alerts"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface RiskPoint {
  lat: number
  lon: number
  city: string
  country: string
  riskType: string
  severity: "Low" | "Medium" | "High"
  riskScore: number // 0-100
  temperature: number
  precipitation: number
  humidity: number
  windSpeed?: number
  lastUpdated: string
}

interface MapData {
  type: "FeatureCollection"
  features: Array<{
    type: "Feature"
    geometry: {
      type: "Point"
      coordinates: [number, number]
    }
    properties: RiskPoint
  }>
}

interface GlobalHeatmapProps {
  className?: string
  height?: number
}

export function GlobalHeatmap({ className, height = 500 }: GlobalHeatmapProps) {
  const [data, setData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<"terrain" | "satellite" | "street">("terrain")
  const [selectedRisk, setSelectedRisk] = useState<string>("all")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  // Alert system integration
  const { alerts: mapAlerts, alertCount } = useAlertSubscription("global-heatmap", {
    typeFilter: ["extreme_heat", "flooding", "drought", "storm", "wildfire"],
    severityFilter: "high" // Only show high-severity alerts on map
  })
  const { createErrorAlert, createSuccessAlert } = useSystemAlerts("global-heatmap")

  const riskTypes = ["all", "flood", "drought", "heatwave", "storm"]

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch("/api/global-map")
        if (!response.ok) throw new Error("Failed to fetch map data")
        const result = await response.json()
        
        setData(result)
        setLastRefresh(new Date())
        
        // Check for high-risk locations and create alerts
        if (result.features) {
          const highRiskLocations = result.features.filter((feature: any) => 
            feature.properties.severity === "High" || feature.properties.severity === "Critical"
          )
          
          if (highRiskLocations.length > 0) {
            createSuccessAlert(`Map updated: ${highRiskLocations.length} high-risk locations detected`)
          } else {
            createSuccessAlert("Map updated successfully")
          }
        }
      } catch (err) {
        console.warn("Map API failed, using mock data:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(errorMessage)
        setData(generateMockMapData())
        setLastRefresh(new Date())
        createErrorAlert(new Error(errorMessage), "Map data fetch")
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMapData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [createErrorAlert, createSuccessAlert])

  const generateMockMapData = (): MapData => {
    const cities = [
      { city: "New York", country: "USA", lat: 40.7128, lon: -74.0060 },
      { city: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
      { city: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
      { city: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
      { city: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
      { city: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
      { city: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
      { city: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
      { city: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6176 },
      { city: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
    ]

    const riskTypes = ["flood", "drought", "heatwave", "storm"]
    const severities: ("Low" | "Medium" | "High")[] = ["Low", "Medium", "High"]

    const features = cities.map((city, index) => {
      const riskType = riskTypes[index % riskTypes.length]
      const severity = severities[index % severities.length]
      const riskScore = severity === "High" ? 70 + Math.random() * 30 : 
                       severity === "Medium" ? 40 + Math.random() * 30 : 
                       Math.random() * 40

      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [city.lon, city.lat] as [number, number],
        },
        properties: {
          ...city,
          riskType,
          severity,
          riskScore: Math.round(riskScore),
          temperature: 15 + Math.random() * 25,
          precipitation: Math.random() * 20,
          humidity: 30 + Math.random() * 50,
          windSpeed: 5 + Math.random() * 15,
          lastUpdated: new Date().toISOString(),
        },
      }
    })

    return {
      type: "FeatureCollection",
      features,
    }
  }

  const getColor = (severity: string, riskType: string) => {
    const baseColors = {
      flood: { High: "#1e40af", Medium: "#3b82f6", Low: "#93c5fd" },
      drought: { High: "#ea580c", Medium: "#f97316", Low: "#fed7aa" },
      heatwave: { High: "#dc2626", Medium: "#ef4444", Low: "#fca5a5" },
      storm: { High: "#7c3aed", Medium: "#8b5cf6", Low: "#c4b5fd" },
      default: { High: "#6b7280", Medium: "#9ca3af", Low: "#d1d5db" },
    }
    
    return baseColors[riskType as keyof typeof baseColors]?.[severity as keyof typeof baseColors.flood] || 
           baseColors.default[severity as keyof typeof baseColors.default]
  }

  const getSizeByRisk = (riskScore: number) => {
    return Math.max(8, Math.min(25, (riskScore / 100) * 25))
  }

  const filteredData = data ? {
    ...data,
    features: selectedRisk === "all" 
      ? data.features 
      : data.features.filter(f => f.properties.riskType?.toLowerCase() === selectedRisk.toLowerCase())
  } : null

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Global Climate Risk Map
          </CardTitle>
          <CardDescription>Real-time climate risk visualization</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading global climate data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Global Climate Risk Map
          </CardTitle>
          <CardDescription>Real-time climate risk visualization</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ API Error</div>
            <p className="text-sm text-muted-foreground mb-4">Using demo data: {error}</p>
            <Button onClick={() => window.location.reload()} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!filteredData) return null

  const mapData = filteredData.features.map(f => f.properties)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Global Climate Risk Map
                {/* Global alert indicator */}
                {alertCount > 0 && (
                  <div className="relative">
                    <Bell className="w-4 h-4 text-red-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white text-[8px] text-white font-bold flex items-center justify-center">
                      {alertCount > 9 ? '9+' : alertCount}
                    </div>
                  </div>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span>Real-time climate risk visualization • Updated {lastRefresh.toLocaleTimeString()}</span>
                {alertCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {alertCount} Alert{alertCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {mapData.length} Locations
              </Badge>
              {/* High-risk location indicator */}
              {mapData.filter(d => d.severity === "High").length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {mapData.filter(d => d.severity === "High").length} High Risk
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 mt-4">
            {/* Risk Type Filter */}
            <div className="flex gap-1">
              {riskTypes.map((risk) => (
                <Button
                  key={risk}
                  variant={selectedRisk === risk ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRisk(risk)}
                  className="text-xs capitalize"
                >
                  {risk === "all" ? "All Risks" : risk}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div style={{ height }}>
            <Plot
              data={[
                {
                  type: "scattermapbox",
                  lat: mapData.map(d => d.lat),
                  lon: mapData.map(d => d.lon),
                  mode: "markers",
                  marker: {
                    size: mapData.map(d => getSizeByRisk(d.riskScore)),
                    color: mapData.map(d => getColor(d.severity, d.riskType)),
                    opacity: 0.8,
                    line: { color: "white", width: 2 },
                  },
                  text: mapData.map(d => 
                    `<b>${d.city}, ${d.country}</b><br>` +
                    `Risk: ${d.riskType} (${d.severity})<br>` +
                    `Score: ${d.riskScore}/100<br>` +
                    `Temp: ${d.temperature.toFixed(1)}°C<br>` +
                    `Precipitation: ${d.precipitation.toFixed(1)}mm<br>` +
                    `Humidity: ${d.humidity.toFixed(0)}%`
                  ),
                  hovertemplate: "%{text}<extra></extra>",
                  showlegend: false,
                }
              ]}
              layout={{
                mapbox: {
                  style: mapStyle === "terrain" ? "open-street-map" : 
                         mapStyle === "satellite" ? "satellite-streets" : "streets",
                  center: { lat: 20, lon: 0 },
                  zoom: 1.5,
                },
                margin: { t: 0, b: 0, l: 0, r: 0 },
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                font: { color: "#64748b", size: 12 },
                hovermode: "closest",
              }}
              config={{
                displayModeBar: false,
                responsive: true,
                scrollZoom: true,
                doubleClick: "reset",
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Legend */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium">Risk Levels:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>High</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Low</span>
                </div>
              </div>
              <div className="text-muted-foreground">
                • Size indicates risk score • Hover for details
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}