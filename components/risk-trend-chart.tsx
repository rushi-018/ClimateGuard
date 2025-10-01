"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface TrendData {
  date: string
  floodRisk: number
  droughtRisk: number
  heatwaveRisk: number
  stormRisk: number
}

interface RiskTrendChartProps {
  location?: { lat: number; lon: number; city: string }
  className?: string
}

export function RiskTrendChart({ location, className }: RiskTrendChartProps) {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(location || { lat: 40.7128, lon: -74.006, city: "New York" })
        })

        if (!response.ok) throw new Error("Failed to fetch trend data")
        
        const result = await response.json()
        setData(result.forecast || generateMockTrendData())
      } catch (err) {
        console.warn("Trend API failed, using mock data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setData(generateMockTrendData())
      } finally {
        setLoading(false)
      }
    }

    fetchTrendData()
  }, [location])

  const generateMockTrendData = (): TrendData[] => {
    const data: TrendData[] = []
    const today = new Date()
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Generate realistic trend data with some patterns
      const baseFlood = 0.2 + Math.sin(i * 0.5) * 0.2 + Math.random() * 0.1
      const baseDrought = 0.3 - Math.sin(i * 0.3) * 0.15 + Math.random() * 0.1
      const baseHeatwave = 0.25 + Math.cos(i * 0.4) * 0.2 + Math.random() * 0.1
      const baseStorm = 0.15 + Math.sin(i * 0.7) * 0.15 + Math.random() * 0.1
      
      data.push({
        date: date.toISOString().split('T')[0],
        floodRisk: Math.max(0, Math.min(1, baseFlood)),
        droughtRisk: Math.max(0, Math.min(1, baseDrought)),
        heatwaveRisk: Math.max(0, Math.min(1, baseHeatwave)),
        stormRisk: Math.max(0, Math.min(1, baseStorm)),
      })
    }
    
    return data
  }

  const getRiskTrend = (riskType: keyof Omit<TrendData, 'date'>) => {
    if (data.length < 2) return "stable"
    
    const firstValue = data[0][riskType]
    const lastValue = data[data.length - 1][riskType]
    const diff = lastValue - firstValue
    
    if (diff > 0.1) return "increasing"
    if (diff < -0.1) return "decreasing"
    return "stable"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="w-4 h-4 text-red-500" />
      case "decreasing": return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const riskTypes = [
    { key: "floodRisk" as const, label: "Flood", color: "#3b82f6" },
    { key: "droughtRisk" as const, label: "Drought", color: "#f59e0b" },
    { key: "heatwaveRisk" as const, label: "Heatwave", color: "#ef4444" },
    { key: "stormRisk" as const, label: "Storm", color: "#8b5cf6" },
  ]

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>10-Day Risk Forecast</CardTitle>
          <CardDescription>Climate risk trends and predictions</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            10-Day Risk Forecast
            {location && (
              <span className="text-sm font-normal text-muted-foreground">
                • {location.city}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Predictive analytics for climate risks with trend indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Using demo data due to API limitation: {error}
              </p>
            </div>
          )}
          
          {/* Risk Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {riskTypes.map(({ key, label, color }) => {
              const trend = getRiskTrend(key)
              const currentRisk = data[data.length - 1]?.[key] || 0
              const riskLevel = currentRisk > 0.7 ? "High" : currentRisk > 0.4 ? "Medium" : "Low"
              
              return (
                <motion.div
                  key={key}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-3 bg-card border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{label}</h4>
                    {getTrendIcon(trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-muted-foreground">{riskLevel}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {(currentRisk * 100).toFixed(0)}% risk score
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Trend Chart */}
          <div className="h-64">
            <Plot
              data={riskTypes.map(({ key, label, color }) => ({
                x: data.map(d => d.date),
                y: data.map(d => d[key]),
                type: "scatter",
                mode: "lines+markers",
                name: label,
                line: { color, width: 3 },
                marker: { size: 6, color },
                hovertemplate: `<b>${label}</b><br>Date: %{x}<br>Risk: %{y:.1%}<extra></extra>`,
              }))}
              layout={{
                title: { text: "" },
                xaxis: {
                  title: { text: "Date" },
                  gridcolor: "#f1f5f9",
                  showgrid: true,
                },
                yaxis: {
                  title: { text: "Risk Level" },
                  range: [0, 1],
                  tickformat: ".0%",
                  gridcolor: "#f1f5f9",
                  showgrid: true,
                },
                plot_bgcolor: "transparent",
                paper_bgcolor: "transparent",
                font: { color: "#64748b", size: 12 },
                legend: {
                  orientation: "h",
                  yanchor: "bottom",
                  y: 1.02,
                  xanchor: "right",
                  x: 1,
                },
                margin: { l: 50, r: 20, t: 40, b: 50 },
                hovermode: "x unified",
              }}
              config={{
                displayModeBar: false,
                responsive: true,
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* AI Insights */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">🤖 AI Insights</h4>
            <p className="text-sm text-muted-foreground">
              {getAIInsight(data, riskTypes)}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getAIInsight(data: TrendData[], riskTypes: { key: keyof TrendData; label: string; color: string }[]): string {
  if (data.length === 0) return "No data available for analysis."
  
  const trends = riskTypes.map(({ key, label }) => {
    const firstValue = data[0][key] as number
    const lastValue = data[data.length - 1][key] as number
    const diff = lastValue - firstValue
    return { label, diff, current: lastValue }
  })
  
  const increasingRisks = trends.filter(t => t.diff > 0.1)
  const highRisks = trends.filter(t => t.current > 0.6)
  
  if (highRisks.length > 0) {
    return `High risk alert: ${highRisks.map(r => r.label).join(", ")} showing elevated levels. Consider activating mitigation measures.`
  }
  
  if (increasingRisks.length > 0) {
    return `Trend alert: ${increasingRisks.map(r => r.label).join(", ")} risk${increasingRisks.length > 1 ? 's are' : ' is'} increasing over the forecast period. Monitor closely.`
  }
  
  return "Risk levels remain stable across all categories. Continue standard monitoring protocols."
}
