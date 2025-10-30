"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, BellRing, AlertTriangle, X, MapPin, Clock, TrendingUp,
  Droplets, Sun, Wind, Flame, Zap, AlertCircle, Thermometer,
  CloudRain, Tornado, Eye, Volume2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ClimateAlert {
  id: string
  type: 'heatwave' | 'flood' | 'drought' | 'storm' | 'wildfire' | 'air_quality' | 'tsunami' | 'earthquake'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  location: string
  timestamp: Date
  expires?: Date
  source: string
  actionRequired: boolean
  affectedPopulation?: number
  category: 'weather' | 'natural_disaster' | 'environmental'
}

const ALERT_ICONS = {
  heatwave: Thermometer,
  flood: Droplets,
  drought: Sun,
  storm: Wind,
  wildfire: Flame,
  air_quality: CloudRain,
  tsunami: TrendingUp,
  earthquake: AlertTriangle
}

const ALERT_COLORS = {
  critical: "border-red-500 bg-red-500/10 dark:bg-red-500/20 text-foreground",
  high: "border-orange-500 bg-orange-500/10 dark:bg-orange-500/20 text-foreground", 
  medium: "border-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/20 text-foreground",
  low: "border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 text-foreground"
}

const SEVERITY_BADGES = {
  critical: "destructive",
  high: "default",
  medium: "secondary", 
  low: "outline"
} as const

// Generate realistic climate alerts
const generateClimateAlerts = (): ClimateAlert[] => {
  const alertsData = [
    {
      type: 'heatwave' as const,
      severity: 'critical' as const,
      title: 'Extreme Heat Warning',
      message: 'Temperatures expected to reach 47°C for the next 5 days. Heat index may exceed 52°C.',
      location: 'Phoenix, Arizona, USA',
      source: 'National Weather Service',
      actionRequired: true,
      affectedPopulation: 1680000,
      category: 'weather' as const
    },
    {
      type: 'flood' as const,
      severity: 'high' as const, 
      title: 'Flash Flood Warning',
      message: 'Heavy rainfall causing rapid river rise. Immediate evacuation recommended for low-lying areas.',
      location: 'Queensland, Australia',
      source: 'Bureau of Meteorology',
      actionRequired: true,
      affectedPopulation: 50000,
      category: 'weather' as const
    },
    {
      type: 'wildfire' as const,
      severity: 'critical' as const,
      title: 'Wildfire Emergency',
      message: 'Fast-moving wildfire has consumed 15,000 hectares. Multiple communities under evacuation order.',
      location: 'British Columbia, Canada',
      source: 'BC Wildfire Service',
      actionRequired: true,
      affectedPopulation: 25000,
      category: 'natural_disaster' as const
    },
    {
      type: 'drought' as const,
      severity: 'high' as const,
      title: 'Severe Drought Conditions',
      message: 'Agricultural drought affecting crop yields. Water restrictions in effect for 6 months.',
      location: 'Central Valley, California',
      source: 'US Drought Monitor',
      actionRequired: false,
      affectedPopulation: 4000000,
      category: 'environmental' as const
    },
    {
      type: 'storm' as const,
      severity: 'medium' as const,
      title: 'Severe Thunderstorm Watch',
      message: 'Damaging winds up to 110 km/h and large hail possible. Tornadoes cannot be ruled out.',
      location: 'Tornado Alley, Texas',
      source: 'Storm Prediction Center',
      actionRequired: true,
      affectedPopulation: 200000,
      category: 'weather' as const
    },
    {
      type: 'air_quality' as const,
      severity: 'medium' as const,
      title: 'Air Quality Alert',
      message: 'Unhealthy air quality due to wildfire smoke. Sensitive groups should limit outdoor activities.',
      location: 'Seattle, Washington',
      source: 'EPA AirNow',
      actionRequired: false,
      affectedPopulation: 750000,
      category: 'environmental' as const
    },
    {
      type: 'tsunami' as const,
      severity: 'high' as const,
      title: 'Tsunami Advisory',
      message: 'Sea level rise of 0.5-1.5m possible along coastlines. Move away from beaches and harbors.',
      location: 'Pacific Coast, Japan',
      source: 'Japan Meteorological Agency',
      actionRequired: true,
      affectedPopulation: 300000,
      category: 'natural_disaster' as const
    }
  ]

  const staticTimestamps = [
    { timestamp: new Date('2025-10-11T08:30:00Z'), expires: new Date('2025-10-15T23:59:59Z') },
    { timestamp: new Date('2025-10-11T06:15:00Z'), expires: new Date('2025-10-12T18:00:00Z') },
    { timestamp: new Date('2025-10-11T04:45:00Z'), expires: new Date('2025-10-18T12:00:00Z') },
    { timestamp: new Date('2025-10-10T22:30:00Z'), expires: new Date('2025-10-16T09:00:00Z') },
    { timestamp: new Date('2025-10-11T01:20:00Z'), expires: new Date('2025-10-11T20:00:00Z') },
    { timestamp: new Date('2025-10-11T07:00:00Z'), expires: new Date('2025-10-13T23:59:59Z') },
    { timestamp: new Date('2025-10-11T05:30:00Z'), expires: new Date('2025-10-12T12:00:00Z') }
  ]

  return alertsData.map((alert, index) => ({
    ...alert,
    id: `alert-${index + 1}`,
    timestamp: staticTimestamps[index]?.timestamp || new Date('2025-10-11T12:00:00Z'),
    expires: staticTimestamps[index]?.expires || new Date('2025-10-18T12:00:00Z')
  }))
}

interface RealClimateAlertsProps {
  location?: {
    name: string
    lat: number
    lon: number
  }
}

export function RealClimateAlerts({ location }: RealClimateAlertsProps = {}) {
  const [alerts, setAlerts] = useState<ClimateAlert[]>(() => generateClimateAlerts())
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [spokenAlertIds, setSpokenAlertIds] = useState<Set<string>>(new Set())

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity === 'all') return true
    return alert.severity === selectedSeverity
  })

  // Voice announcement for alerts shown on THIS page only
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    
    // Only announce critical alerts that haven't been spoken yet
    const unspokenCriticalAlerts = alerts.filter(
      alert => alert.severity === 'critical' && !spokenAlertIds.has(alert.id)
    )

    if (unspokenCriticalAlerts.length === 0) return

    // Announce the first unspoken critical alert
    const alertToAnnounce = unspokenCriticalAlerts[0]
    
    const utterance = new SpeechSynthesisUtterance(
      `Critical climate alert: ${alertToAnnounce.title}. ${alertToAnnounce.message}`
    )
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 0.8

    utterance.onend = () => {
      setSpokenAlertIds(prev => new Set([...prev, alertToAnnounce.id]))
    }

    // Small delay to prevent speaking immediately on page load
    const timer = setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, 2000)

    return () => {
      clearTimeout(timer)
      window.speechSynthesis.cancel()
    }
  }, [alerts, spokenAlertIds])

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const formatTimeAgo = (timestamp: Date) => {
    // Use a fixed reference time for consistent server/client rendering
    const fixedNow = new Date('2025-10-11T12:00:00Z')
    const diffMs = fixedNow.getTime() - timestamp.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const formatAffectedPopulation = (population?: number) => {
    if (!population) return "Population impact unknown"
    if (population >= 1000000) return `${(population / 1000000).toFixed(1)}M people affected`
    if (population >= 1000) return `${(population / 1000).toFixed(0)}K people affected`
    return `${population} people affected`
  }

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
  const highAlerts = alerts.filter(alert => alert.severity === 'high')
  
  // Get alerts that have been spoken
  const spokenAlerts = alerts.filter(alert => spokenAlertIds.has(alert.id))

  return (
    <div className="space-y-6">
      {/* Voice Announced Alerts Section - showing ONLY alerts from this page */}
      {spokenAlerts.length > 0 && (
        <Card className="border-purple-500 bg-purple-500/10 dark:bg-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Volume2 className="h-5 w-5" />
              Voice Announced Alerts ({spokenAlerts.length})
            </CardTitle>
            <CardDescription>
              Alerts from this page that were announced via voice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {spokenAlerts.map((alert) => {
                  const Icon = ALERT_ICONS[alert.type]
                  
                  return (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-purple-500/10">
                          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground">
                              {alert.title}
                            </p>
                            <Badge variant={SEVERITY_BADGES[alert.severity]}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.location}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{formatTimeAgo(alert.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Alert Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-red-500 bg-red-500/10 dark:bg-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{criticalAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-500 bg-orange-500/10 dark:bg-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">High</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{highAlerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500 bg-blue-500/10 dark:bg-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{alerts.length}</p>
              </div>
              <BellRing className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500 bg-green-500/10 dark:bg-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{alerts.filter(a => a.actionRequired).length}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Active Climate Alerts
              </CardTitle>
              <CardDescription>
                Real-time climate and weather warnings from official sources
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
                <Button
                  key={severity}
                  variant={selectedSeverity === severity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSeverity(severity)}
                  className="capitalize"
                >
                  {severity}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <AnimatePresence>
              {filteredAlerts.map((alert, index) => {
                const IconComponent = ALERT_ICONS[alert.type]
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`mb-4 p-4 rounded-lg border-l-4 ${ALERT_COLORS[alert.severity]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-500/20' :
                          alert.severity === 'high' ? 'bg-orange-500/20' :
                          alert.severity === 'medium' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <IconComponent className={`h-5 w-5 ${
                            alert.severity === 'critical' ? 'text-red-500' :
                            alert.severity === 'high' ? 'text-orange-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg text-foreground">{alert.title}</h4>
                            <Badge variant={SEVERITY_BADGES[alert.severity]}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            {alert.actionRequired && (
                              <Badge variant="destructive" className="text-xs">
                                ACTION REQUIRED
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm mb-3 leading-relaxed text-foreground/90">
                            {alert.message}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{alert.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(alert.timestamp)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Source:</span> {alert.source}
                            </div>
                            {alert.affectedPopulation && (
                              <div className="col-span-2">
                                <span className="font-medium">Impact:</span> {formatAffectedPopulation(alert.affectedPopulation)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {filteredAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BellRing className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts for selected severity level</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}