/**
 * Global Alert Dashboard Component
 * Centralized alert management and display for ClimateGuard
 */

"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Bell, BellRing, AlertTriangle, X, Settings, Volume2, VolumeX, 
  Smartphone, Mail, RefreshCw, Filter, MapPin, Clock, TrendingUp,
  Droplets, Sun, Wind, Flame, Zap, AlertCircle, Trash2, Eye, EyeOff
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useGlobalAlerts, useAlertSettings, useAlertStats, useVoiceAlerts } from "@/hooks/use-alerts"
import { GlobalAlert } from "@/lib/alert-service"

interface GlobalAlertDashboardProps {
  className?: string
  compact?: boolean
}

export function GlobalAlertDashboard({ className, compact = false }: GlobalAlertDashboardProps) {
  const { alerts, loading, dismissAlert, clearAllAlerts, criticalAlerts, hasCriticalAlerts } = useGlobalAlerts()
  const { settings, updateSettings } = useAlertSettings()
  const stats = useAlertStats()
  const { announceAlert, stopAnnouncements } = useVoiceAlerts()
  
  const [showSettings, setShowSettings] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "high">("all")
  const [showDismissed, setShowDismissed] = useState(false)

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === "critical") return alert.severity === "critical"
    if (filterSeverity === "high") return alert.severity === "high" || alert.severity === "critical"
    return true
  })

  const getAlertIcon = (type: GlobalAlert["type"]) => {
    const icons = {
      extreme_heat: Sun,
      flooding: Droplets,
      drought: Sun,
      storm: Wind,
      wildfire: Flame,
      air_quality: Wind,
      system: AlertCircle,
      location: MapPin,
      prediction: TrendingUp
    }
    return icons[type] || AlertTriangle
  }

  const getAlertColor = (severity: GlobalAlert["severity"]) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-50 border-red-200"
      case "high": return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low": return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  const getSeverityBadgeVariant = (severity: GlobalAlert["severity"]) => {
    switch (severity) {
      case "critical": return "destructive"
      case "high": return "default"
      case "medium": return "secondary"
      case "low": return "outline"
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {hasCriticalAlerts ? (
                <BellRing className="w-5 h-5 text-red-500 animate-pulse" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
              Alerts
            </CardTitle>
            <Badge variant={hasCriticalAlerts ? "destructive" : "secondary"}>
              {alerts.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active alerts</p>
            </div>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => {
                  const IconComponent = getAlertIcon(alert.type)
                  return (
                    <div key={alert.id} className={`p-2 rounded-lg border ${getAlertColor(alert.severity)}`}>
                      <div className="flex items-start gap-2">
                        <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{alert.title}</p>
                          <p className="text-xs opacity-75 truncate">{alert.message}</p>
                        </div>
                        <Badge variant={getSeverityBadgeVariant(alert.severity) as any} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
                {alerts.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View {alerts.length - 5} more alerts
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Alert Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">High</p>
                <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Recent</p>
                <p className="text-2xl font-bold">{stats.recentAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Alert Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {hasCriticalAlerts ? (
                  <BellRing className="w-5 h-5 text-red-500 animate-pulse" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                Climate Alerts Dashboard
              </CardTitle>
              <CardDescription>
                Real-time monitoring and alert management system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterSeverity} onValueChange={(value) => setFilterSeverity(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="high">High & Critical</SelectItem>
                  <SelectItem value="critical">Critical Only</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              {alerts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllAlerts}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 border rounded-lg bg-muted/30"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sound"
                      checked={settings.sound}
                      onCheckedChange={(checked) => updateSettings({ sound: checked })}
                    />
                    <Label htmlFor="sound" className="flex items-center gap-1">
                      {settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      Sound
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="desktop"
                      checked={settings.desktop}
                      onCheckedChange={(checked) => updateSettings({ desktop: checked })}
                    />
                    <Label htmlFor="desktop" className="flex items-center gap-1">
                      <Smartphone className="w-4 h-4" />
                      Desktop
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="voice"
                      checked={settings.voice}
                      onCheckedChange={(checked) => updateSettings({ voice: checked })}
                    />
                    <Label htmlFor="voice" className="flex items-center gap-1">
                      <Volume2 className="w-4 h-4" />
                      Voice
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-refresh"
                      checked={settings.autoRefresh}
                      onCheckedChange={(checked) => updateSettings({ autoRefresh: checked })}
                    />
                    <Label htmlFor="auto-refresh" className="flex items-center gap-1">
                      <RefreshCw className="w-4 h-4" />
                      Auto-refresh
                    </Label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alert List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading alerts...</span>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No active alerts</h3>
              <p className="text-muted-foreground mb-4">
                {filterSeverity === "all" 
                  ? "All systems are running normally"
                  : `No ${filterSeverity} alerts at this time`
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredAlerts.map((alert) => {
                    const IconComponent = getAlertIcon(alert.type)
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-white/50">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium text-sm">{alert.title}</h4>
                                {alert.location && (
                                  <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {alert.location}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getSeverityBadgeVariant(alert.severity) as any} className="text-xs">
                                  {alert.severity}
                                </Badge>
                                <span className="text-xs opacity-75">
                                  {formatTimestamp(alert.timestamp)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm mt-2 opacity-90">{alert.message}</p>
                            
                            {alert.riskFactors && alert.riskFactors.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {alert.riskFactors.slice(0, 3).map((factor, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-4 text-xs opacity-75">
                                <span>Confidence: {Math.round(alert.confidence * 100)}%</span>
                                <span>Source: {alert.source}</span>
                                <span>Component: {alert.component}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {settings.voice && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => announceAlert(alert)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => dismissAlert(alert.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}