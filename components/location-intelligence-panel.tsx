/**
 * Location Intelligence Panel (Optional Feature)
 * Isolated GPS-based location component that doesn't interfere with core functionality
 */

"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, Loader2, AlertTriangle, CheckCircle, Settings, 
  Navigation, Thermometer, Droplets, Wind, Eye, EyeOff,
  Share, Shield, Clock, Target, Info
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  useLocationIntelligence,
  useLocationSupport,
  useLocationSettings,
  useLocationRiskSummary,
  useLocationWeather,
  useLocationCoordinates,
  useEmergencyLocation
} from "@/hooks/use-location-intelligence"

interface LocationIntelligencePanelProps {
  className?: string
  compact?: boolean
  showSettings?: boolean
}

export function LocationIntelligencePanel({ 
  className, 
  compact = false,
  showSettings = true
}: LocationIntelligencePanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showEmergencyInfo, setShowEmergencyInfo] = useState(false)

  // Location intelligence hooks
  const support = useLocationSupport()
  const {
    location,
    riskAssessment,
    isEnabled,
    isLoading,
    error,
    enableLocation,
    disableLocation
  } = useLocationIntelligence()
  
  const { settings, updateSettings } = useLocationSettings()
  const riskSummary = useLocationRiskSummary()
  const weather = useLocationWeather()
  const coordinates = useLocationCoordinates()
  const emergencyData = useEmergencyLocation()

  // Show loading state while checking support
  if (!support) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Checking location support...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show unsupported state
  if (!support.supported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Intelligence
            <Badge variant="secondary">Optional</Badge>
          </CardTitle>
          <CardDescription>GPS-based personalized risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Location services are not supported in this browser. 
              {support.error && ` Error: ${support.error}`}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Permission denied state
  if (support.permission === 'denied') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Intelligence
            <Badge variant="secondary">Optional</Badge>
          </CardTitle>
          <CardDescription>GPS-based personalized risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Location access has been denied. Please enable location permissions in your browser settings to use this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Compact view
  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              Location
              <Badge variant="outline" className="text-xs">Optional</Badge>
            </CardTitle>
            <Switch
              checked={isEnabled}
              onCheckedChange={isEnabled ? disableLocation : enableLocation}
              disabled={isLoading}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Getting location...</span>
            </div>
          ) : isEnabled && riskSummary ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Risk</span>
                <Badge variant={
                  riskSummary.riskLevel === 'critical' ? 'destructive' :
                  riskSummary.riskLevel === 'high' ? 'default' :
                  riskSummary.riskLevel === 'medium' ? 'secondary' : 'outline'
                }>
                  {riskSummary.riskLevel}
                </Badge>
              </div>
              <Progress value={riskSummary.overallRisk} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Primary: {riskSummary.primaryRisk.label}
              </div>
            </div>
          ) : isEnabled && error ? (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          ) : !isEnabled ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Location services disabled</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  // Full view
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
                <MapPin className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                Location Intelligence
                <Badge variant="outline">Optional Feature</Badge>
                {isEnabled && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                GPS-based personalized climate risk assessment and recommendations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {showSettings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Control */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <Label htmlFor="location-toggle" className="text-base font-medium">
                Enable Location Services
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Get personalized climate risk assessments based on your location
              </p>
            </div>
            <Switch
              id="location-toggle"
              checked={isEnabled}
              onCheckedChange={isEnabled ? disableLocation : enableLocation}
              disabled={isLoading}
            />
          </div>

          {/* Error State */}
          {error && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Getting your location...</span>
            </div>
          )}

          {/* Location Data */}
          <AnimatePresence>
            {isEnabled && !isLoading && location && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Coordinates */}
                {coordinates && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Coordinates</Label>
                      <div className="text-sm font-mono bg-muted p-2 rounded">
                        <div>Lat: {coordinates.latitude}</div>
                        <div>Lng: {coordinates.longitude}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {coordinates.accuracy}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <div className="text-sm p-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {coordinates.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {coordinates.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Assessment */}
                {riskSummary && (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <Label className="text-base font-medium">Risk Assessment</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overall Risk Level</span>
                          <Badge variant={
                            riskSummary.riskLevel === 'critical' ? 'destructive' :
                            riskSummary.riskLevel === 'high' ? 'default' :
                            riskSummary.riskLevel === 'medium' ? 'secondary' : 'outline'
                          }>
                            {riskSummary.riskLevel} ({riskSummary.overallRisk}%)
                          </Badge>
                        </div>
                        <Progress value={riskSummary.overallRisk} />
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Primary Risk:</span>
                            <br />
                            <span className="font-medium">{riskSummary.primaryRisk.label}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">High Risk Factors:</span>
                            <br />
                            <span className="font-medium">{riskSummary.highRiskCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weather Data */}
                {weather && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Local Conditions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium">{weather.temperature.toFixed(1)}°C</div>
                          <div className="text-xs text-muted-foreground">Temperature</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">{weather.humidity.toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">Humidity</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <Wind className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">{weather.windSpeed.toFixed(1)} km/h</div>
                          <div className="text-xs text-muted-foreground">Wind</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <Droplets className="w-4 h-4 text-cyan-500" />
                        <div>
                          <div className="text-sm font-medium">{weather.precipitation.toFixed(1)} mm</div>
                          <div className="text-xs text-muted-foreground">Precipitation</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {riskSummary?.recommendations && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Recommendations</Label>
                    <div className="space-y-2">
                      {riskSummary.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Location Sharing */}
                {emergencyData && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Emergency Info</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEmergencyInfo(!showEmergencyInfo)}
                      >
                        {showEmergencyInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    
                    <AnimatePresence>
                      {showEmergencyInfo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 bg-red-50 border border-red-200 rounded"
                        >
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Share className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-red-800">Shareable Location</span>
                            </div>
                            <div className="font-mono text-xs bg-white p-2 rounded border">
                              {emergencyData.googleMapsUrl}
                            </div>
                            <div className="text-red-700">
                              Emergency Services: {emergencyData.emergencyServices}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced Settings */}
          <AnimatePresence>
            {showAdvanced && showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-muted/30 rounded-lg"
              >
                <Label className="text-base font-medium">Location Settings</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Update Interval</Label>
                    <select
                      value={settings.updateInterval}
                      onChange={(e) => updateSettings({ updateInterval: Number(e.target.value) })}
                      className="w-full p-2 text-sm border rounded"
                    >
                      <option value={5}>5 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Accuracy</Label>
                    <select
                      value={settings.accuracy}
                      onChange={(e) => updateSettings({ accuracy: e.target.value as any })}
                      className="w-full p-2 text-sm border rounded"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Background Updates</Label>
                    <Switch
                      checked={settings.backgroundUpdates}
                      onCheckedChange={(checked) => updateSettings({ backgroundUpdates: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Geofencing Alerts</Label>
                    <Switch
                      checked={settings.geofencing}
                      onCheckedChange={(checked) => updateSettings({ geofencing: checked })}
                    />
                  </div>
                </div>

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    Location data is processed locally and never stored on our servers. 
                    You can disable this feature at any time.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disabled State */}
          {!isEnabled && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Navigation className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Location Services Disabled</h3>
              <p className="text-sm mb-4">
                Enable location services to get personalized climate risk assessments based on your current location.
              </p>
              <Button onClick={enableLocation} disabled={isLoading}>
                <MapPin className="w-4 h-4 mr-2" />
                Enable Location Intelligence
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}