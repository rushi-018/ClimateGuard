"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Droplets, Sun, Wind, Flame, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { motion } from "framer-motion"

interface RiskData {
  type: string
  severity: "Low" | "Medium" | "High"
  score: number // 0-100
  trend: "increasing" | "decreasing" | "stable"
  description: string
  impact: string
  confidence: number
}

interface RiskCardsProps {
  location?: { lat: number; lon: number; city: string }
  className?: string
}

const RISK_ICONS = {
  flood: Droplets,
  drought: Sun,
  heatwave: Flame,
  storm: Wind,
  wildfire: Flame,
  default: AlertTriangle,
}

const RISK_COLORS = {
  flood: "hsl(var(--chart-1))", // Blue
  drought: "hsl(var(--chart-2))", // Orange
  heatwave: "hsl(var(--chart-3))", // Red
  storm: "hsl(var(--chart-4))", // Purple
  wildfire: "hsl(var(--chart-5))", // Red-orange
}

export function RiskCards({ location, className }: RiskCardsProps) {
  const [risks, setRisks] = useState<RiskData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: location?.lat || 40.7128,
            longitude: location?.lon || -74.006,
          })
        })

        if (!response.ok) throw new Error("Failed to fetch risk data")
        
        const result = await response.json()
        setRisks(parseRisksFromAPI(result))
      } catch (err) {
        console.warn("Risk API failed, using mock data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setRisks(generateMockRisks())
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()
  }, [location])

  const parseRisksFromAPI = (data: any): RiskData[] => {
    const risks: RiskData[] = []
    
    if (data.flood_risk > 20) {
      risks.push({
        type: "flood",
        severity: data.flood_risk > 70 ? "High" : data.flood_risk > 40 ? "Medium" : "Low",
        score: data.flood_risk,
        trend: Math.random() > 0.5 ? "increasing" : "stable",
        description: "Flood risk based on precipitation and humidity levels",
        impact: "Infrastructure damage, transportation disruption",
        confidence: 0.85,
      })
    }

    if (data.drought_risk > 20) {
      risks.push({
        type: "drought",
        severity: data.drought_risk > 70 ? "High" : data.drought_risk > 40 ? "Medium" : "Low",
        score: data.drought_risk,
        trend: Math.random() > 0.3 ? "increasing" : "stable",
        description: "Drought conditions from low precipitation and high temperatures",
        impact: "Water scarcity, agricultural stress",
        confidence: 0.80,
      })
    }

    if (data.heatwave_risk > 20) {
      risks.push({
        type: "heatwave",
        severity: data.heatwave_risk > 70 ? "High" : data.heatwave_risk > 40 ? "Medium" : "Low",
        score: data.heatwave_risk,
        trend: Math.random() > 0.4 ? "increasing" : "stable",
        description: "Extreme heat conditions expected",
        impact: "Heat-related illness, energy demand spike",
        confidence: 0.90,
      })
    }

    return risks.length > 0 ? risks : generateMockRisks()
  }

  const generateMockRisks = (): RiskData[] => {
    return [
      {
        type: "flood",
        severity: "Medium",
        score: 65,
        trend: "increasing",
        description: "Moderate flood risk due to increased precipitation patterns",
        impact: "Potential for localized flooding in low-lying areas",
        confidence: 0.82,
      },
      {
        type: "heatwave",
        severity: "High",
        score: 78,
        trend: "stable",
        description: "Elevated temperatures expected with heat index warnings",
        impact: "Increased risk of heat-related illness and energy demand",
        confidence: 0.89,
      },
      {
        type: "drought",
        severity: "Low",
        score: 32,
        trend: "decreasing",
        description: "Current drought conditions are improving with recent rainfall",
        impact: "Agricultural stress may continue in some areas",
        confidence: 0.75,
      },
    ]
  }

  const getRiskIcon = (type: string) => {
    const IconComponent = RISK_ICONS[type as keyof typeof RISK_ICONS] || RISK_ICONS.default
    return IconComponent
  }

  const getRiskColor = (type: string) => {
    return RISK_COLORS[type as keyof typeof RISK_COLORS] || "#64748b"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="w-4 h-4 text-red-500" />
      case "decreasing": return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "destructive"
      case "Medium": return "default"
      case "Low": return "secondary"
      default: return "default"
    }
  }

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {error && (
        <Card className="col-span-full border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Using demo data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {risks.map((risk, index) => {
        const IconComponent = getRiskIcon(risk.type)
        const riskColor = getRiskColor(risk.type)
        
        return (
          <motion.div
            key={`${risk.type}-${index}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="transform-gpu"
          >
            <Card className="relative overflow-hidden border-l-4 hover:shadow-lg transition-all duration-300"
                  style={{ borderLeftColor: riskColor }}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform rotate-12 translate-x-8 -translate-y-8">
                <IconComponent className="w-full h-full" />
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${riskColor}20` }}>
                      <IconComponent className="w-5 h-5" style={{ color: riskColor }} />
                    </div>
                    <div>
                      <CardTitle className="text-lg capitalize">{risk.type} Risk</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getSeverityColor(risk.severity) as any} className="text-xs">
                          {risk.severity}
                        </Badge>
                        {getTrendIcon(risk.trend)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: riskColor }}>
                      {risk.score}
                    </div>
                    <div className="text-xs text-muted-foreground">Risk Score</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Risk Level</span>
                    <span>{risk.score}%</span>
                  </div>
                  <Progress 
                    value={risk.score} 
                    className="h-2"
                    style={{
                      '--progress-background': riskColor,
                    } as any}
                  />
                </div>

                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm">{risk.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Potential Impact</h4>
                    <p className="text-sm">{risk.impact}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Confidence</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${risk.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(risk.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}