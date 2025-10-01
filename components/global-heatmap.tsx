"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Map, Satellite, Layers, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

// Dynamically import Plotly and Mapbox to avoid SSR issues
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

// Generate mock data for demonstration
const generateMockMapData = (): MapData => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-74.006, 40.7128] },
      properties: {
        lat: 40.7128,
        lon: -74.006,
        city: "New York",
        country: "USA",
        riskType: "extreme_heat",
        severity: "High",
        riskScore: 65,
        temperature: 32,
        precipitation: 2.5,
        humidity: 65,
        windSpeed: 15,
        lastUpdated: new Date().toISOString()
      }
    },
    {
      type: "Feature", 
      geometry: { type: "Point", coordinates: [-118.2437, 34.0522] },
      properties: {
        lat: 34.0522,
        lon: -118.2437,
        city: "Los Angeles",
        country: "USA",
        riskType: "wildfire",
        severity: "High",
        riskScore: 72,
        temperature: 35,
        precipitation: 0.1,
        humidity: 45,
        windSpeed: 25,
        lastUpdated: new Date().toISOString()
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [2.3522, 48.8566] },
      properties: {
        lat: 48.8566,
        lon: 2.3522,
        city: "Paris",
        country: "France",
        riskType: "flooding",
        severity: "Medium",
        riskScore: 45,
        temperature: 24,
        precipitation: 12.3,
        humidity: 78,
        windSpeed: 8,
        lastUpdated: new Date().toISOString()
      }
    }
  ]
})

export function GlobalHeatmap({ className, height = 500 }: GlobalHeatmapProps) {
  const [data, setData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<"terrain" | "satellite" | "street">("terrain")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/global-map")
        if (!response.ok) throw new Error("Failed to fetch map data")
        const result = await response.json()
        setData(result)
        setLastRefresh(new Date())
      } catch (err) {
        console.warn("Map API failed, using mock data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setData(generateMockMapData())
        setLastRefresh(new Date())
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMapData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
  }

  if (!data) return null

  // Extract coordinates and risk data
  const lats = data.features.map((f) => f.geometry.coordinates[1])
  const lons = data.features.map((f) => f.geometry.coordinates[0])
  const cities = data.features.map((f) => f.properties.city)
  const riskTypes = data.features.map((f) => f.properties.riskType)
  const severities = data.features.map((f) => f.properties.severity)
  const temperatures = data.features.map((f) => f.properties.temperature)

  // Color mapping for severity
  const getColor = (severity: string, riskType: string) => {
    const colorMap = {
      High: "#dc2626",
      Medium: "#f59e0b",
      Low: "#10b981",
      Unknown: "#6b7280",
    }
    return colorMap[severity as keyof typeof colorMap] || "#6b7280"
  }

  // Size mapping for severity
  const getSize = (severity: string) => {
    const sizeMap = {
      High: 20,
      Medium: 15,
      Low: 10,
      Unknown: 8,
    }
    return sizeMap[severity as keyof typeof sizeMap] || 8
  }

  const colors = severities.map((severity, index) => getColor(severity, riskTypes[index]))
  const sizes = severities.map((severity) => getSize(severity))

  return (
    <div className="w-full h-full">
      <Plot
        data={[
          {
            type: "scattergeo",
            lat: lats,
            lon: lons,
            text: cities.map(
              (city, index) =>
                `${city}<br>Risk: ${riskTypes[index]}<br>Severity: ${severities[index]}<br>Temp: ${temperatures[index]}°C`,
            ),
            mode: "markers",
            marker: {
              size: sizes,
              color: colors,
              line: {
                color: "white",
                width: 2,
              },
              opacity: 0.8,
            },
            hovertemplate: "%{text}<extra></extra>",
          },
        ]}
        layout={{
          title: {
            text: "Global Climate Risk Map",
            font: { size: 16, color: "#374151" },
          },
          geo: {
            projection: { type: "natural earth" },
            showland: true,
            landcolor: "#f8fafc",
            showocean: true,
            oceancolor: "#e0f2fe",
            showlakes: true,
            lakecolor: "#e0f2fe",
            showrivers: true,
            rivercolor: "#e0f2fe",
            coastlinecolor: "#cbd5e1",
            countrycolor: "#cbd5e1",
            bgcolor: "rgba(0,0,0,0)",
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          font: { color: "#374151" },
          margin: { l: 0, r: 0, t: 40, b: 0 },
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
