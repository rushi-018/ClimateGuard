"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, BellRing, AlertTriangle, Zap, Thermometer, Droplets, Wind, Shield, X, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface AlertsSystemProps {
  className?: string
}

interface ClimateAlert {
  id: string
  type: "extreme_heat" | "flooding" | "drought" | "storm" | "wildfire" | "air_quality"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  location: string
  timestamp: Date
  expiresAt: Date
  actionRequired: boolean
  confidence: number
  source: "satellite" | "weather_station" | "ai_prediction" | "community_report"
}

interface AlertThresholds {
  temperature: number
  precipitation: number
  windSpeed: number
  airQuality: number
  floodRisk: number
}

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  email: boolean
  severityFilter: "all" | "medium" | "high" | "critical"
  location: string
}

const MOCK_ALERTS: ClimateAlert[] = [
  {
    id: "heat-001",
    type: "extreme_heat",
    severity: "high",
    title: "Extreme Heat Warning",
    message: "Temperatures expected to exceed 40°C for 3+ consecutive days. Heat index may reach dangerous levels.",
    location: "Phoenix, AZ",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    actionRequired: true,
    confidence: 92,
    source: "ai_prediction"
  },
  {
    id: "flood-002",
    type: "flooding",
    severity: "critical",
    title: "Flash Flood Emergency",
    message: "Rapid water rise detected in low-lying areas. Immediate evacuation recommended for affected zones.",
    location: "Houston, TX",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    actionRequired: true,
    confidence: 96,
    source: "satellite"
  },
  {
    id: "air-003",
    type: "air_quality",
    severity: "medium",
    title: "Air Quality Alert",
    message: "PM2.5 levels elevated due to wildfire smoke. Sensitive individuals should limit outdoor activities.",
    location: "Los Angeles, CA",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    actionRequired: false,
    confidence: 85,
    source: "weather_station"
  }
]

export function RealTimeAlerts({ className }: AlertsSystemProps) {
  const [alerts, setAlerts] = useState<ClimateAlert[]>(MOCK_ALERTS)
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: false,
    email: false,
    severityFilter: "medium",
    location: "Current Location"
  })
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    temperature: 35,
    precipitation: 50,
    windSpeed: 60,
    airQuality: 150,
    floodRisk: 70
  })
  const [showSettings, setShowSettings] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  
  const { toast } = useToast()

  // Request notification permission
  useEffect(() => {
    if (settings.desktop && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [settings.desktop])

  // Simulate real-time alert generation
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance every 30 seconds
        generateRandomAlert()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const generateRandomAlert = useCallback(() => {
    const alertTypes: ClimateAlert["type"][] = ["extreme_heat", "flooding", "drought", "storm", "wildfire", "air_quality"]
    const severities: ClimateAlert["severity"][] = ["low", "medium", "high", "critical"]
    const locations = ["New York, NY", "Miami, FL", "Denver, CO", "Seattle, WA", "Chicago, IL"]
    
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    
    const alertMessages = {
      extreme_heat: "Dangerous heat conditions developing with potential health risks",
      flooding: "Rising water levels detected in multiple monitoring stations",
      drought: "Severe water shortage conditions persist with agricultural impacts",
      storm: "Severe weather system approaching with high winds and precipitation",
      wildfire: "Fire risk elevated due to dry conditions and strong winds",
      air_quality: "Pollutant levels exceeding healthy standards for sensitive groups"
    }

    const newAlert: ClimateAlert = {
      id: `alert-${Date.now()}`,
      type,
      severity,
      title: `${type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ${severity === 'critical' ? 'Emergency' : 'Alert'}`,
      message: alertMessages[type],
      location,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + (Math.random() * 24 + 6) * 60 * 60 * 1000), // 6-30 hours
      actionRequired: severity === "high" || severity === "critical",
      confidence: Math.floor(Math.random() * 30 + 70), // 70-100%
      source: ["satellite", "weather_station", "ai_prediction", "community_report"][Math.floor(Math.random() * 4)] as any
    }

    // Filter by severity
    const severityOrder = { "low": 0, "medium": 1, "high": 2, "critical": 3 }
    const filterOrder = { "all": 0, "medium": 1, "high": 2, "critical": 3 }
    
    if (severityOrder[newAlert.severity] >= filterOrder[settings.severityFilter]) {
      setAlerts(prev => [newAlert, ...prev].slice(0, 20)) // Keep only latest 20 alerts
      
      // Show notification
      if (settings.enabled) {
        showNotification(newAlert)
      }
    }
  }, [settings])

  const showNotification = (alert: ClimateAlert) => {
    // Toast notification
    toast({
      title: `🚨 ${alert.title}`,
      description: `${alert.location}: ${alert.message}`,
      variant: alert.severity === "critical" ? "destructive" : "default",
    })

    // Desktop notification
    if (settings.desktop && "Notification" in window && Notification.permission === "granted") {
      new Notification(`ClimateGuard Alert: ${alert.title}`, {
        body: `${alert.location}: ${alert.message}`,
        icon: "/placeholder-logo.png",
        badge: "/placeholder-logo.png",
        tag: alert.id,
        requireInteraction: alert.severity === "critical"
      })
    }

    // Sound notification
    if (settings.sound) {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different tones for different severities
      const frequencies = { low: 440, medium: 523, high: 659, critical: 880 }
      oscillator.frequency.value = frequencies[alert.severity]
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const getAlertIcon = (type: ClimateAlert["type"]) => {
    const icons = {
      extreme_heat: Thermometer,
      flooding: Droplets,
      drought: Droplets,
      storm: Wind,
      wildfire: Zap,
      air_quality: Wind
    }
    return icons[type] || AlertTriangle
  }

  const getSeverityColor = (severity: ClimateAlert["severity"]) => {
    switch (severity) {
      case "low": return "bg-blue-50 border-blue-200 text-blue-800"
      case "medium": return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "high": return "bg-orange-50 border-orange-200 text-orange-800"
      case "critical": return "bg-red-50 border-red-200 text-red-800"
    }
  }

  const getSeverityBadgeColor = (severity: ClimateAlert["severity"]) => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "critical": return "bg-red-100 text-red-800"
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const severityOrder = { "low": 0, "medium": 1, "high": 2, "critical": 3 }
    const filterOrder = { "all": 0, "medium": 1, "high": 2, "critical": 3 }
    return severityOrder[alert.severity] >= filterOrder[settings.severityFilter]
  })

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isMonitoring ? (
                  <BellRing className="w-5 h-5 text-green-600 animate-pulse" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                Real-Time Climate Alerts
                <Badge variant="outline" className="text-xs">
                  {filteredAlerts.length} Active
                </Badge>
              </CardTitle>
              <CardDescription>
                AI-powered early warning system for climate risks
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="monitoring" className="text-sm">Monitor</Label>
                <Switch
                  id="monitoring"
                  checked={isMonitoring}
                  onCheckedChange={setIsMonitoring}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-4 space-y-4 bg-muted/20"
              >
                <h4 className="font-medium">Notification Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound">Sound Alerts</Label>
                      <Switch
                        id="sound"
                        checked={settings.sound}
                        onCheckedChange={(checked) => setSettings(prev => ({...prev, sound: checked}))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="desktop">Desktop Notifications</Label>
                      <Switch
                        id="desktop"
                        checked={settings.desktop}
                        onCheckedChange={(checked) => setSettings(prev => ({...prev, desktop: checked}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="severity">Minimum Severity</Label>
                      <select
                        id="severity"
                        className="w-full p-2 border rounded-md text-sm"
                        value={settings.severityFilter}
                        onChange={(e) => setSettings(prev => ({...prev, severityFilter: e.target.value as any}))}
                      >
                        <option value="all">All Alerts</option>
                        <option value="medium">Medium & Above</option>
                        <option value="high">High & Critical Only</option>
                        <option value="critical">Critical Only</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="location">Alert Location</Label>
                      <Input
                        id="location"
                        value={settings.location}
                        onChange={(e) => setSettings(prev => ({...prev, location: e.target.value}))}
                        placeholder="Enter city or region"
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>🔔 Sound alerts use different tones for severity levels</p>
                      <p>🖥️ Desktop notifications require browser permission</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Indicator */}
          {isMonitoring && (
            <Alert className="border-green-200 bg-green-50">
              <Shield className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex items-center justify-between">
                  <span>Monitoring active • Real-time climate data analysis</span>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Active Alerts */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">No active alerts</p>
                  <p className="text-sm">
                    {isMonitoring ? "Monitoring for climate risks..." : "Enable monitoring to receive real-time alerts"}
                  </p>
                </motion.div>
              ) : (
                filteredAlerts.map((alert, index) => {
                  const AlertIcon = getAlertIcon(alert.type)
                  const isExpired = alert.expiresAt < new Date()
                  
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`${getSeverityColor(alert.severity)} ${isExpired ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">
                                <AlertIcon className="w-5 h-5" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium truncate">{alert.title}</h5>
                                  <Badge className={`text-xs ${getSeverityBadgeColor(alert.severity)}`}>
                                    {alert.severity.toUpperCase()}
                                  </Badge>
                                  {alert.actionRequired && (
                                    <Badge variant="destructive" className="text-xs">
                                      ACTION REQUIRED
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm mb-3">{alert.message}</p>
                                
                                <div className="flex flex-wrap items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">📍</span>
                                    <span>{alert.location}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">🎯</span>
                                    <span>{alert.confidence}% confidence</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">⏰</span>
                                    <span>{alert.timestamp.toLocaleTimeString()}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">📡</span>
                                    <span>{alert.source.replace('_', ' ')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissAlert(alert.id)}
                              className="ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions */}
          {filteredAlerts.some(alert => alert.actionRequired) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <h5 className="font-medium text-orange-800 mb-2">⚡ Immediate Actions Required</h5>
                <div className="space-y-2 text-sm text-orange-700">
                  {filteredAlerts
                    .filter(alert => alert.actionRequired)
                    .map(alert => (
                      <div key={alert.id} className="flex items-center gap-2">
                        <span>•</span>
                        <span>{alert.location}: {alert.type.replace('_', ' ')} response needed</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}