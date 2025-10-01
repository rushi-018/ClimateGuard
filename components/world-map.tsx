"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ZoomIn, ZoomOut, RotateCcw, Search } from "lucide-react"

interface ClimateRiskPoint {
  lat: number
  lng: number
  risk: "low" | "medium" | "high"
  type: "flood" | "drought" | "heatwave"
  city: string
  country: string
  severity: string
}

export function WorldMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [markers, setMarkers] = useState<any[]>([])
  const [currentZoom, setCurrentZoom] = useState(2)

  // Real climate risk data points with actual cities
  const riskPoints: ClimateRiskPoint[] = [
    {
      lat: 40.7128,
      lng: -74.006,
      risk: "medium",
      type: "flood",
      city: "New York",
      country: "USA",
      severity: "Moderate",
    },
    { lat: 51.5074, lng: -0.1278, risk: "low", type: "flood", city: "London", country: "UK", severity: "Low" },
    {
      lat: 35.6762,
      lng: 139.6503,
      risk: "high",
      type: "heatwave",
      city: "Tokyo",
      country: "Japan",
      severity: "Extreme",
    },
    {
      lat: -33.8688,
      lng: 151.2093,
      risk: "high",
      type: "drought",
      city: "Sydney",
      country: "Australia",
      severity: "Severe",
    },
    {
      lat: 55.7558,
      lng: 37.6173,
      risk: "medium",
      type: "heatwave",
      city: "Moscow",
      country: "Russia",
      severity: "Moderate",
    },
    {
      lat: 19.4326,
      lng: -99.1332,
      risk: "high",
      type: "heatwave",
      city: "Mexico City",
      country: "Mexico",
      severity: "High",
    },
    {
      lat: -23.5505,
      lng: -46.6333,
      risk: "medium",
      type: "flood",
      city: "São Paulo",
      country: "Brazil",
      severity: "Moderate",
    },
    {
      lat: 28.6139,
      lng: 77.209,
      risk: "high",
      type: "heatwave",
      city: "New Delhi",
      country: "India",
      severity: "Extreme",
    },
    {
      lat: 1.3521,
      lng: 103.8198,
      risk: "medium",
      type: "flood",
      city: "Singapore",
      country: "Singapore",
      severity: "Moderate",
    },
    { lat: 30.0444, lng: 31.2357, risk: "high", type: "drought", city: "Cairo", country: "Egypt", severity: "Severe" },
    {
      lat: 34.0522,
      lng: -118.2437,
      risk: "high",
      type: "heatwave",
      city: "Los Angeles",
      country: "USA",
      severity: "High",
    },
    { lat: 52.52, lng: 13.405, risk: "low", type: "flood", city: "Berlin", country: "Germany", severity: "Low" },
    {
      lat: 48.8566,
      lng: 2.3522,
      risk: "medium",
      type: "heatwave",
      city: "Paris",
      country: "France",
      severity: "Moderate",
    },
    {
      lat: -26.2041,
      lng: 28.0473,
      risk: "high",
      type: "drought",
      city: "Johannesburg",
      country: "South Africa",
      severity: "Severe",
    },
    { lat: 25.2048, lng: 55.2708, risk: "high", type: "heatwave", city: "Dubai", country: "UAE", severity: "Extreme" },
  ]

  useEffect(() => {
    if (typeof window === "undefined") return

    const initMap = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      const L = (await import("leaflet")).default

      // Import Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      if (!mapRef.current || map) return

      // Initialize map with dark theme
      const leafletMap = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: false,
        markerZoomAnimation: false,
      })

      // Add dark theme tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
        zIndex: 1,
      }).addTo(leafletMap)

      const createScalableIcon = (risk: string, type: string, zoom: number) => {
        const colors = {
          high: "#ef4444",
          medium: "#f59e0b",
          low: "#22c55e",
        }

        const typeIcons = {
          flood: "💧",
          drought: "🌵",
          heatwave: "🔥",
        }

        const baseSize = Math.max(16, Math.min(40, 12 + zoom * 2))
        const fontSize = Math.max(8, Math.min(16, 6 + zoom * 1.2))

        return L.divIcon({
          html: `
            <div style="
              background-color: ${colors[risk as keyof typeof colors]};
              width: ${baseSize}px;
              height: ${baseSize}px;
              border-radius: 50%;
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${fontSize}px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              position: relative;
              z-index: 1000;
              cursor: pointer;
              transition: all 0.2s ease;
            ">
              ${typeIcons[type as keyof typeof typeIcons]}
            </div>
          `,
          className: "custom-marker",
          iconSize: [baseSize, baseSize],
          iconAnchor: [baseSize / 2, baseSize / 2],
        })
      }

      const markerLayerGroup = L.layerGroup().addTo(leafletMap)
      markerLayerGroup.getPane = () => leafletMap.getPane("markerPane")

      // Add markers for each risk point
      const newMarkers = riskPoints.map((point) => {
        const marker = L.marker([point.lat, point.lng], {
          icon: createScalableIcon(point.risk, point.type, currentZoom),
          zIndexOffset: 1000,
          riseOnHover: true,
        }).addTo(markerLayerGroup)

        // Add tooltip with risk information
        marker.bindTooltip(
          `<div style="background: rgba(0,0,0,0.9); color: white; padding: 8px; border-radius: 4px; font-size: 12px; z-index: 2000;">
            <strong>${point.city}, ${point.country}</strong><br/>
            <span style="color: ${point.risk === "high" ? "#ef4444" : point.risk === "medium" ? "#f59e0b" : "#22c55e"}">
              ${point.type.charAt(0).toUpperCase() + point.type.slice(1)} - ${point.severity}
            </span>
          </div>`,
          {
            direction: "top",
            offset: [0, -10],
            opacity: 0.95,
            className: "custom-tooltip",
            permanent: false,
            sticky: true,
          },
        )

        return marker
      })

      leafletMap.on("zoomend", () => {
        const zoom = leafletMap.getZoom()
        setCurrentZoom(zoom)

        // Update all marker icons with new zoom-based size
        newMarkers.forEach((marker, index) => {
          const point = riskPoints[index]
          marker.setIcon(createScalableIcon(point.risk, point.type, zoom))
        })
      })

      const style = document.createElement("style")
      style.textContent = `
        .custom-marker {
          z-index: 1000 !important;
        }
        .custom-tooltip {
          z-index: 2000 !important;
        }
        .leaflet-marker-pane {
          z-index: 600 !important;
        }
        .leaflet-tooltip-pane {
          z-index: 650 !important;
        }
      `
      document.head.appendChild(style)

      setMap(leafletMap)
      setMarkers(newMarkers)
    }

    initMap()

    return () => {
      if (map) {
        map.remove()
        setMap(null)
      }
    }
  }, [])

  const handleZoomIn = () => {
    if (map) map.zoomIn()
  }

  const handleZoomOut = () => {
    if (map) map.zoomOut()
  }

  const handleReset = () => {
    if (map) {
      map.setView([20, 0], 2)
    }
  }

  const handleSearch = () => {
    if (!map || !searchQuery.trim()) return

    const searchTerm = searchQuery.toLowerCase()
    const foundPoint = riskPoints.find(
      (point) => point.city.toLowerCase().includes(searchTerm) || point.country.toLowerCase().includes(searchTerm),
    )

    if (foundPoint) {
      map.setView([foundPoint.lat, foundPoint.lng], 8)
      // Find and open the corresponding marker tooltip
      const markerIndex = riskPoints.indexOf(foundPoint)
      if (markers[markerIndex]) {
        markers[markerIndex].openTooltip()
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" style={{ minHeight: "400px" }} />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1001]">
        <Button size="sm" variant="secondary" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute top-4 left-4 flex gap-2 z-[1001]">
        <Input
          placeholder="Search city or country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-48"
        />
        <Button size="sm" variant="secondary" onClick={handleSearch}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <Card className="absolute bottom-4 left-4 p-4 bg-background/95 backdrop-blur-sm z-[1001]">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Climate Risk Levels</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
              <span className="text-xs font-medium">High Risk</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-white shadow-lg"></div>
              <span className="text-xs font-medium">Medium Risk</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
              <span className="text-xs font-medium">Low Risk</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>💧 Flood Risk</div>
              <div>🌵 Drought Risk</div>
              <div>🔥 Heatwave Risk</div>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">Zoom Level: {currentZoom}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
