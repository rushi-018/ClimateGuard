"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Droplets,
  Thermometer,
  Users,
  Building,
  Leaf,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react"

interface ActionItem {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "immediate" | "short-term" | "long-term"
  icon: React.ReactNode
  status: "pending" | "in-progress" | "completed"
  estimatedTime: string
  resources?: string[]
}

export function RecommendedActions() {
  const actions: ActionItem[] = [
    {
      id: "1",
      title: "Activate Emergency Cooling Centers",
      description: "Open public cooling facilities in high-risk urban areas to protect vulnerable populations",
      priority: "high",
      category: "immediate",
      icon: <Thermometer className="w-4 h-4" />,
      status: "pending",
      estimatedTime: "2-4 hours",
      resources: ["Emergency Services", "Public Health"],
    },
    {
      id: "2",
      title: "Issue Heat Wave Public Advisory",
      description: "Broadcast safety guidelines and hydration reminders across all communication channels",
      priority: "high",
      category: "immediate",
      icon: <AlertCircle className="w-4 h-4" />,
      status: "in-progress",
      estimatedTime: "1 hour",
      resources: ["Communications", "Media Relations"],
    },
    {
      id: "3",
      title: "Implement Water Conservation Measures",
      description: "Restrict non-essential water usage in drought-affected agricultural regions",
      priority: "medium",
      category: "short-term",
      icon: <Droplets className="w-4 h-4" />,
      status: "pending",
      estimatedTime: "1-2 days",
      resources: ["Water Management", "Agriculture Dept"],
    },
    {
      id: "4",
      title: "Deploy Mobile Health Units",
      description: "Position medical support teams in high-risk areas for heat-related emergencies",
      priority: "high",
      category: "immediate",
      icon: <Users className="w-4 h-4" />,
      status: "completed",
      estimatedTime: "4-6 hours",
      resources: ["Healthcare", "Emergency Services"],
    },
    {
      id: "5",
      title: "Enhance Urban Green Infrastructure",
      description: "Accelerate tree planting and green roof installations to reduce urban heat island effect",
      priority: "medium",
      category: "long-term",
      icon: <Leaf className="w-4 h-4" />,
      status: "pending",
      estimatedTime: "3-6 months",
      resources: ["Urban Planning", "Environmental"],
    },
    {
      id: "6",
      title: "Upgrade Building Cooling Systems",
      description: "Inspect and optimize HVAC systems in critical infrastructure and public buildings",
      priority: "medium",
      category: "short-term",
      icon: <Building className="w-4 h-4" />,
      status: "in-progress",
      estimatedTime: "1-2 weeks",
      resources: ["Facilities Management", "Engineering"],
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-accent" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-warning" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "immediate":
        return "text-destructive"
      case "short-term":
        return "text-warning"
      case "long-term":
        return "text-primary"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <Card key={action.id} className="hover:bg-card/80 transition-all duration-200 hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm leading-tight">{action.title}</h4>
                    {getStatusIcon(action.status)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{action.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={getPriorityColor(action.priority)} size="sm">
                      {action.priority}
                    </Badge>
                    <span className={`text-xs font-medium ${getCategoryColor(action.category)}`}>
                      {action.category.replace("-", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">• {action.estimatedTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {action.resources && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">Resources:</span>
                <div className="flex gap-1 flex-wrap">
                  {action.resources.map((resource, index) => (
                    <Badge key={index} variant="outline" className="text-xs py-0 px-2">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    action.status === "completed"
                      ? "bg-accent"
                      : action.status === "in-progress"
                        ? "bg-warning"
                        : "bg-muted-foreground"
                  }`}
                ></div>
                <span className="text-xs text-muted-foreground capitalize">{action.status.replace("-", " ")}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                View Details
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
