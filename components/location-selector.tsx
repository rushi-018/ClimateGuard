"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"

export interface Location {
  id: string
  name: string
  city: string
  lat: number
  lon: number
  country: string
  timezone: string
}

const POPULAR_LOCATIONS: Location[] = [
  {
    id: "new-york",
    name: "New York City",
    city: "New York City",
    lat: 40.7128,
    lon: -74.0060,
    country: "United States",
    timezone: "America/New_York"
  },
  {
    id: "london",
    name: "London",
    city: "London",
    lat: 51.5074,
    lon: -0.1278,
    country: "United Kingdom", 
    timezone: "Europe/London"
  },
  {
    id: "tokyo",
    name: "Tokyo",
    city: "Tokyo",
    lat: 35.6762,
    lon: 139.6503,
    country: "Japan",
    timezone: "Asia/Tokyo"
  },
  {
    id: "sydney",
    name: "Sydney",
    city: "Sydney",
    lat: -33.8688,
    lon: 151.2093,
    country: "Australia",
    timezone: "Australia/Sydney"
  },
  {
    id: "mumbai",
    name: "Mumbai",
    city: "Mumbai",
    lat: 19.0760,
    lon: 72.8777,
    country: "India",
    timezone: "Asia/Kolkata"
  },
  {
    id: "sao-paulo",
    name: "São Paulo",
    city: "São Paulo",
    lat: -23.5505,
    lon: -46.6333,
    country: "Brazil",
    timezone: "America/Sao_Paulo"
  },
  {
    id: "cairo",
    name: "Cairo",
    city: "Cairo",
    lat: 30.0444,
    lon: 31.2357,
    country: "Egypt",
    timezone: "Africa/Cairo"
  },
  {
    id: "lagos",
    name: "Lagos",
    city: "Lagos",
    lat: 6.5244,
    lon: 3.3792,
    country: "Nigeria",
    timezone: "Africa/Lagos"
  },
  {
    id: "phoenix",
    name: "Phoenix",
    city: "Phoenix",
    lat: 33.4484,
    lon: -112.0740,
    country: "United States",
    timezone: "America/Phoenix"
  },
  {
    id: "miami",
    name: "Miami",
    city: "Miami",
    lat: 25.7617,
    lon: -80.1918,
    country: "United States",
    timezone: "America/New_York"
  },
  {
    id: "vancouver",
    name: "Vancouver",
    city: "Vancouver",
    lat: 49.2827,
    lon: -123.1207,
    country: "Canada",
    timezone: "America/Vancouver"
  },
  {
    id: "singapore",
    name: "Singapore",
    city: "Singapore",
    lat: 1.3521,
    lon: 103.8198,
    country: "Singapore",
    timezone: "Asia/Singapore"
  }
]

interface LocationSelectorProps {
  selectedLocation: Location
  onLocationChange: (location: Location) => void
  className?: string
}

export function LocationSelector({ selectedLocation, onLocationChange, className }: LocationSelectorProps) {
  const handleLocationChange = (locationId: string) => {
    const location = POPULAR_LOCATIONS.find(loc => loc.id === locationId)
    if (location) {
      onLocationChange(location)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedLocation.id} onValueChange={handleLocationChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a location">
            <span className="flex items-center gap-2">
              <span className="font-medium">{selectedLocation.name}</span>
              <span className="text-muted-foreground text-sm">({selectedLocation.country})</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {POPULAR_LOCATIONS.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              <div className="flex flex-col">
                <span className="font-medium">{location.name}</span>
                <span className="text-sm text-muted-foreground">{location.country}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { POPULAR_LOCATIONS }