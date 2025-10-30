/**
 * Voice Alert Banner
 * Visual indicator during voice announcements
 */

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  SkipForward,
  X,
  Bell,
  Settings,
  Clock,
  AlertTriangle,
  Flame,
  Droplets,
  Wind,
  Sun,
  CloudRain
} from "lucide-react"
import { useVoiceAlerts } from "@/hooks/use-voice-alerts"
import { type CombinedAlert } from "@/lib/voice-alert-system"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface VoiceAlertBannerProps {
  location: {
    name: string
    lat: number
    lon: number
  }
}

const ALERT_ICONS = {
  weather: CloudRain,
  disaster: AlertTriangle,
  risk: Flame,
  air_quality: Wind
}

function getAlertIcon(alert: CombinedAlert) {
  if ('event' in alert) return CloudRain
  if ('category' in alert && alert.type === 'disaster') return AlertTriangle
  if ('riskType' in alert) {
    if (alert.riskType === 'drought') return Sun
    if (alert.riskType === 'flood') return Droplets
    if (alert.riskType === 'wildfire') return Flame
    if (alert.riskType === 'storm') return Wind
    return Flame
  }
  if ('aqi' in alert) return Wind
  return Bell
}

function formatAlertTitle(alert: CombinedAlert): string {
  if ('event' in alert) return alert.event
  if ('category' in alert && alert.type === 'disaster') return alert.title
  if ('riskType' in alert) return alert.title
  if ('aqi' in alert) return `AQI ${alert.aqi} - ${alert.category}`
  return 'Climate Alert'
}

export function VoiceAlertBanner({ location }: VoiceAlertBannerProps) {
  const {
    currentAlert,
    isAnnouncing,
    queuedAlerts,
    settings,
    history,
    stopAnnouncement,
    skipToNext,
    clearQueue,
    muteFor,
    updateSettings,
    dismissAlert: handleDismissAlert
  } = useVoiceAlerts(location)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme': return 'destructive'
      case 'Severe': return 'default'
      case 'Moderate': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <>
      {/* Floating announcement banner */}
      <AnimatePresence>
        {isAnnouncing && currentAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950 shadow-2xl">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-orange-500/20">
                    {(() => {
                      const Icon = getAlertIcon(currentAlert)
                      return <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    })()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="h-4 w-4 text-orange-600 dark:text-orange-400 animate-pulse" />
                      <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        Voice Alert Playing
                      </span>
                      <Badge variant={getSeverityColor(currentAlert.severity)}>
                        {currentAlert.severity}
                      </Badge>
                    </div>
                    
                    <h4 className="font-semibold text-foreground mb-1">
                      {formatAlertTitle(currentAlert)}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {currentAlert.description}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={stopAnnouncement}
                      title="Stop"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                    
                    {queuedAlerts.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={skipToNext}
                        title="Skip to next"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={stopAnnouncement}
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Quick mute options */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => muteFor(15)}
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Mute 15min
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => muteFor(60)}
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Mute 1hr
                  </Button>
                  {queuedAlerts.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearQueue}
                      className="text-xs"
                    >
                      Clear Queue ({queuedAlerts.length})
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings and History Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-4 right-4 z-40"
          >
            <Settings className="h-4 w-4 mr-2" />
            Voice Alerts
            {settings.enabled && (
              <Badge variant="secondary" className="ml-2">
                ON
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Voice Alert Settings</DialogTitle>
            <DialogDescription>
              Configure voice announcements for critical climate events
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voice-enabled" className="text-base font-semibold">
                    Enable Voice Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Announce critical climate events
                  </p>
                </div>
                <Switch
                  id="voice-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(enabled) => updateSettings({ enabled })}
                />
              </div>

              <Separator />

              {/* Minimum Severity */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Minimum Severity for Voice
                </Label>
                <div className="space-y-2">
                  {(['Extreme', 'Severe', 'Moderate'] as const).map((severity) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`severity-${severity}`}
                        checked={settings.minSeverity === severity}
                        onChange={() => updateSettings({ minSeverity: severity })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`severity-${severity}`} className="font-normal">
                        {severity} {severity === 'Extreme' && '(Recommended)'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Check Frequency */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Check Frequency
                </Label>
                <div className="space-y-2">
                  {[
                    { label: 'Every 1 minute', value: 60000 },
                    { label: 'Every 2 minutes (Recommended)', value: 120000 },
                    { label: 'Every 5 minutes', value: 300000 },
                    { label: 'Every 10 minutes', value: 600000 }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`interval-${option.value}`}
                        checked={settings.checkInterval === option.value}
                        onChange={() => updateSettings({ checkInterval: option.value })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`interval-${option.value}`} className="font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Current Status */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Current Status
                </Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{location.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Queued Alerts:</span>
                    <span className="font-medium">{queuedAlerts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Announced:</span>
                    <span className="font-medium">{history.length}</span>
                  </div>
                  {settings.muteUntil && settings.muteUntil > Date.now() && (
                    <div className="flex justify-between text-orange-600">
                      <span>Muted until:</span>
                      <span className="font-medium">
                        {new Date(settings.muteUntil).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* History */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Recent Announcements
                </Label>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No voice announcements yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 10).map((record) => (
                      <div
                        key={record.fingerprint}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {record.fingerprint.split('-').slice(0, 3).join(' - ')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {record.lastAnnounced.toLocaleString()} • {record.timesAnnounced}x
                          </div>
                        </div>
                        {!record.dismissed && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismissAlert(record.fingerprint)}
                            className="text-xs"
                          >
                            Dismiss
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
