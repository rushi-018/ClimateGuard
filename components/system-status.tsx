"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Activity, TestTube, MapPin, TrendingUp, Shield } from "lucide-react"

interface HealthStatus {
  status: string
  service: string
  timestamp: string
}

interface PredictResponse {
  risk_score: number
  risk_label: string
  confidence: number
  explanation: string
  weather_data: any
}

interface ActionItem {
  id: number
  title: string
  description: string
  priority: string
  timeline: string
  status: string
}

export function SystemStatus() {
  const [healthStatus, setHealthStatus] = useState<"loading" | "success" | "error">("loading")
  const [healthData, setHealthData] = useState<HealthStatus | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [testLoading, setTestLoading] = useState<Record<string, boolean>>({})

  const API_BASE_URL = "/api"

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      setHealthStatus("loading")
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
        setHealthStatus(data.status === "ok" ? "success" : "error")
        console.log("[v0] Health check successful:", data)
      } else {
        setHealthStatus("error")
        console.log("[v0] Health check failed with status:", response.status)
      }
    } catch (error) {
      console.log("[v0] Health check failed:", error)
      setHealthStatus("error")
    }
  }

  const testEndpoint = async (endpoint: string, testData?: any) => {
    setTestLoading((prev) => ({ ...prev, [endpoint]: true }))

    try {
      const url = `${API_BASE_URL}/${endpoint}`
      const options: RequestInit = {
        headers: { "Content-Type": "application/json" },
      }

      if (endpoint === "predict") {
        options.method = "POST"
        options.body = JSON.stringify({
          temperature: 35.5,
          precipitation: 2.1,
          latitude: 40.7128,
          longitude: -74.006,
        })
      } else {
        options.method = "GET"
      }

      console.log(`[v0] Testing ${endpoint} endpoint:`, url)
      const response = await fetch(url, options)
      const data = await response.json()

      if (endpoint === "global-map") {
        console.log("[v0] Global map data:", data)
      } else if (endpoint === "predict") {
        console.log("[v0] Prediction data:", data)
      } else if (endpoint === "actions") {
        console.log("[v0] Actions data:", data)
      }

      setTestResults((prev) => ({
        ...prev,
        [endpoint]: { success: true, data, status: response.status },
      }))
    } catch (error) {
      console.error(`[v0] Test ${endpoint} failed:`, error)
      setTestResults((prev) => ({
        ...prev,
        [endpoint]: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      }))
    } finally {
      setTestLoading((prev) => ({ ...prev, [endpoint]: false }))
    }
  }

  const getStatusIcon = () => {
    switch (healthStatus) {
      case "loading":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (healthStatus) {
      case "loading":
        return "Checking connection..."
      case "success":
        return "API connected with real climate data"
      case "error":
        return "API unavailable"
    }
  }

  return (
    <div className="space-y-4">
      {/* System Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>
            <Button variant="outline" size="sm" onClick={checkHealth} disabled={healthStatus === "loading"}>
              {healthStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
            </Button>
          </div>

          {healthStatus === "success" && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-sm text-green-800 dark:text-green-200">
                <strong>Live Data:</strong> Connected to Open-Meteo API for real-time climate data.
              </div>
            </div>
          )}

          {healthData && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div>Service: {healthData.service}</div>
              <div>Last Updated: {new Date(healthData.timestamp).toLocaleString()}</div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  predict
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  global-map
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  actions
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Test Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            API Test Panel
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Real Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Test Predict */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Test /predict</span>
                <Badge variant="outline" className="text-xs">
                  Real Weather Data
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testEndpoint("predict")}
                disabled={testLoading.predict}
              >
                {testLoading.predict ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
              </Button>
            </div>

            {testResults.predict && (
              <div className="ml-6 p-3 bg-muted rounded-lg text-sm">
                {testResults.predict.success ? (
                  <div className="space-y-1">
                    <div className="text-green-600 font-medium">✅ Success (Live Data)</div>
                    <div>Risk Score: {testResults.predict.data.risk_score}</div>
                    <div>Risk Label: {testResults.predict.data.risk_label}</div>
                    <div>Risk Type: {testResults.predict.data.risk_type}</div>
                    <div>Confidence: {testResults.predict.data.confidence}</div>
                    <div className="text-xs text-muted-foreground mt-2">{testResults.predict.data.explanation}</div>
                  </div>
                ) : (
                  <div className="text-red-600">❌ Error: {testResults.predict.error}</div>
                )}
              </div>
            )}

            {/* Test Global Map */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="font-medium">Test /global-map</span>
                <Badge variant="outline" className="text-xs">
                  8 Global Cities
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testEndpoint("global-map")}
                disabled={testLoading["global-map"]}
              >
                {testLoading["global-map"] ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
              </Button>
            </div>

            {testResults["global-map"] && (
              <div className="ml-6 p-3 bg-muted rounded-lg text-sm">
                {testResults["global-map"].success ? (
                  <div className="space-y-1">
                    <div className="text-green-600 font-medium">✅ Success (Live Data)</div>
                    <div>Cities: {testResults["global-map"].data.features?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Real-time weather data from Open-Meteo API</div>
                    <div className="text-xs text-muted-foreground">Check console for full GeoJSON data</div>
                  </div>
                ) : (
                  <div className="text-red-600">❌ Error: {testResults["global-map"].error}</div>
                )}
              </div>
            )}

            {/* Test Actions */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Test /actions</span>
                <Badge variant="outline" className="text-xs">
                  Emergency Actions
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testEndpoint("actions")}
                disabled={testLoading.actions}
              >
                {testLoading.actions ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
              </Button>
            </div>

            {testResults.actions && (
              <div className="ml-6 p-3 bg-muted rounded-lg text-sm">
                {testResults.actions.success ? (
                  <div className="space-y-2">
                    <div className="text-green-600 font-medium">✅ Success (Real Actions)</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {testResults.actions.data.actions?.slice(0, 3).map((action: ActionItem) => (
                        <div key={action.id} className="p-2 bg-background rounded border">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {action.priority} • {action.timeline} • {action.status}
                          </div>
                        </div>
                      ))}
                      {testResults.actions.data.actions?.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{testResults.actions.data.actions.length - 3} more actions
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">❌ Error: {testResults.actions.error}</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
