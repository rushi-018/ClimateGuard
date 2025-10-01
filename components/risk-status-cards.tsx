"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Thermometer, Droplets, Sun, TrendingUp, TrendingDown } from "lucide-react"

interface RiskCardProps {
  title: string
  description: string
  riskLevel: "low" | "medium" | "high"
  percentage: number
  trend: "up" | "down" | "stable"
  icon: React.ReactNode
  details: string
}

function RiskCard({ title, description, riskLevel, percentage, trend, icon, details }: RiskCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "medium":
        return "bg-warning/20 text-warning border-warning/30"
      case "low":
        return "bg-accent/20 text-accent border-accent/30"
      default:
        return "bg-secondary/20 text-secondary border-secondary/30"
    }
  }

  const getProgressColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive"
      case "medium":
        return "bg-warning"
      case "low":
        return "bg-accent"
      default:
        return "bg-secondary"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-destructive" />
      case "down":
        return <TrendingDown className="w-3 h-3 text-accent" />
      default:
        return null
    }
  }

  return (
    <Card className="hover:bg-card/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">{icon}</div>
            <div>
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant="secondary" className={getRiskColor(riskLevel)}>
              {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Risk Level</span>
            <span className="text-xs font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">{details}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function RiskStatusCards() {
  const riskData = [
    {
      title: "Flood Risk",
      description: "Coastal & river regions",
      riskLevel: "low" as const,
      percentage: 25,
      trend: "down" as const,
      icon: <Droplets className="w-5 h-5 text-primary" />,
      details: "Precipitation levels below seasonal average. River levels stable.",
    },
    {
      title: "Drought Risk",
      description: "Agricultural areas",
      riskLevel: "medium" as const,
      percentage: 65,
      trend: "up" as const,
      icon: <Sun className="w-5 h-5 text-warning" />,
      details: "Soil moisture declining. Irrigation demand increasing in farming regions.",
    },
    {
      title: "Heatwave Risk",
      description: "Urban centers",
      riskLevel: "high" as const,
      percentage: 85,
      trend: "up" as const,
      icon: <Thermometer className="w-5 h-5 text-destructive" />,
      details: "Extreme temperatures expected. Heat index above 40°C in metropolitan areas.",
    },
  ]

  return (
    <div className="space-y-4">
      {riskData.map((risk, index) => (
        <RiskCard key={index} {...risk} />
      ))}
    </div>
  )
}
