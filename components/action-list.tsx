"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, AlertTriangle, CheckCircle, Clock, ArrowRight, Shield, Users, Zap, Target } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Action {
  id: string
  title: string
  description: string
  priority: "Critical" | "High" | "Medium" | "Low"
  timeline: string
  status: "Ready" | "Active" | "Planning" | "Completed" | "Blocked"
  riskTypes: string[]
  impact: string
  resources: string[]
  cost: "Low" | "Medium" | "High"
  effectiveness: number // 0-100
  carbonReduction?: number // kg CO2 equivalent
}

interface ActionListProps {
  risks?: Array<{ type: string; severity: string; score: number }>
  location?: { lat: number; lon: number; city: string }
  className?: string
}

const PRIORITY_COLORS = {
  Critical: "destructive",
  High: "default",
  Medium: "secondary",
  Low: "outline",
}

const STATUS_COLORS = {
  Ready: "default",
  Active: "destructive",
  Planning: "secondary",
  Completed: "outline",
  Blocked: "destructive",
}

const ACTION_ICONS = {
  emergency: AlertTriangle,
  infrastructure: Shield,
  community: Users,
  technology: Zap,
  policy: Target,
}

export function ActionList({ risks = [], location, className }: ActionListProps) {
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true)
        
        // Build query parameters based on detected risks
        const params = new URLSearchParams()
        if (risks.length > 0) {
          params.set("risk_types", risks.map(r => r.type).join(","))
          params.set("max_severity", Math.max(...risks.map(r => Math.floor(r.score / 25))).toString())
        }
        if (location) {
          params.set("lat", location.lat.toString())
          params.set("lon", location.lon.toString())
        }
        
        const response = await fetch(`/api/actions?${params.toString()}`)
        
        if (!response.ok) throw new Error("Failed to fetch actions")
        
        const result = await response.json()
        setActions(parseActionsFromAPI(result.actions || []))
      } catch (err) {
        console.warn("Actions API failed, using mock data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setActions(generateMockActions(risks))
      } finally {
        setLoading(false)
      }
    }

    fetchActions()
  }, [risks, location])

  const parseActionsFromAPI = (apiActions: any[]): Action[] => {
    return apiActions.map((action, index) => ({
      id: action.id?.toString() || index.toString(),
      title: action.title || "Climate Action",
      description: action.description || "Action description",
      priority: action.priority || "Medium",
      timeline: action.timeline || "1-7 days",
      status: action.status || "Ready",
      riskTypes: Array.isArray(action.risk_types) ? action.risk_types : ["general"],
      impact: action.impact || "Reduces climate risk",
      resources: action.resources_required ? action.resources_required.split(", ") : ["Staff", "Equipment"],
      cost: action.cost || "Medium",
      effectiveness: Math.floor(Math.random() * 30) + 70, // 70-100%
      carbonReduction: Math.floor(Math.random() * 500) + 100,
    }))
  }

  const generateMockActions = (detectedRisks: any[]): Action[] => {
    const baseActions: Action[] = [
      {
        id: "1",
        title: "Emergency Response Coordination",
        description: "Activate emergency operations center and coordinate response efforts across all departments",
        priority: "Critical",
        timeline: "Immediate (0-2 hours)",
        status: "Ready",
        riskTypes: ["flood", "storm", "heatwave"],
        impact: "Rapid response coordination, reduces response time by 40%",
        resources: ["Emergency Staff", "Communication Systems", "Command Center"],
        cost: "High",
        effectiveness: 95,
        carbonReduction: 50,
      },
      {
        id: "2", 
        title: "Smart Early Warning System",
        description: "Deploy AI-powered early warning alerts to at-risk populations via multiple channels",
        priority: "High",
        timeline: "1-6 hours",
        status: "Active",
        riskTypes: ["flood", "heatwave", "storm"],
        impact: "Prevents casualties, enables proactive evacuation",
        resources: ["Alert Systems", "Mobile Networks", "Social Media"],
        cost: "Medium",
        effectiveness: 88,
        carbonReduction: 25,
      },
      {
        id: "3",
        title: "Community Resilience Hubs",
        description: "Open public cooling/warming centers with backup power and emergency supplies",
        priority: "High",
        timeline: "2-8 hours",
        status: "Planning",
        riskTypes: ["heatwave", "storm"],
        impact: "Provides safe shelter for 500+ vulnerable residents",
        resources: ["Public Facilities", "Backup Generators", "Emergency Supplies"],
        cost: "Medium",
        effectiveness: 82,
        carbonReduction: 150,
      },
      {
        id: "4",
        title: "Infrastructure Protection Protocol",
        description: "Secure critical infrastructure and deploy flood barriers at vulnerable points",
        priority: "High",
        timeline: "4-12 hours",
        status: "Ready",
        riskTypes: ["flood", "storm"],
        impact: "Protects power grid, water treatment, and transportation",
        resources: ["Engineering Teams", "Flood Barriers", "Backup Systems"],
        cost: "High",
        effectiveness: 90,
        carbonReduction: 200,
      },
      {
        id: "5",
        title: "Water Conservation Measures",
        description: "Implement emergency water restrictions and activate conservation protocols",
        priority: "Medium",
        timeline: "1-3 days",
        status: "Planning",
        riskTypes: ["drought", "heatwave"],
        impact: "Reduces water demand by 30%, preserves emergency reserves",
        resources: ["Water Management", "Public Communications", "Enforcement"],
        cost: "Low",
        effectiveness: 75,
        carbonReduction: 80,
      },
      {
        id: "6",
        title: "Green Infrastructure Deployment", 
        description: "Deploy portable green infrastructure solutions for flood management and cooling",
        priority: "Medium",
        timeline: "1-7 days",
        status: "Ready",
        riskTypes: ["flood", "heatwave"],
        impact: "Natural flood management, urban cooling effect",
        resources: ["Green Tech", "Installation Teams", "Maintenance"],
        cost: "Medium",
        effectiveness: 78,
        carbonReduction: 300,
      },
    ]

    // Filter actions based on detected risks
    if (detectedRisks.length > 0) {
      const riskTypes = detectedRisks.map(r => r.type.toLowerCase())
      return baseActions.filter(action => 
        action.riskTypes.some(type => riskTypes.includes(type))
      ).slice(0, 4)
    }

    return baseActions.slice(0, 4)
  }

  const getActionIcon = (action: Action) => {
    if (action.priority === "Critical") return AlertTriangle
    if (action.riskTypes.includes("flood") || action.riskTypes.includes("storm")) return Shield
    if (action.title.toLowerCase().includes("community")) return Users
    if (action.title.toLowerCase().includes("smart") || action.title.toLowerCase().includes("ai")) return Zap
    return Target
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Zap className="w-4 h-4 text-orange-500" /></motion.div>
      case "Completed": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Blocked": return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>AI-driven climate adaptation strategies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const categories = ["all", "emergency", "infrastructure", "community", "technology"]
  const filteredActions = selectedCategory === "all" 
    ? actions 
    : actions.filter(action => action.riskTypes.includes(selectedCategory))

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
                <Shield className="w-5 h-5" />
                Recommended Actions
                {location && (
                  <span className="text-sm font-normal text-muted-foreground">
                    • {location.city}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                AI-powered adaptive strategies based on current risk assessment
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {actions.length} Actions
            </Badge>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Using demo data: {error}</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredActions.map((action, index) => {
                const IconComponent = getActionIcon(action)
                const priorityColor = action.priority === "Critical" ? "red" : 
                                     action.priority === "High" ? "orange" : 
                                     action.priority === "Medium" ? "blue" : "gray"
                
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="transform-gpu"
                  >
                    <Card className="border-l-4 hover:shadow-md transition-all duration-300"
                          style={{ borderLeftColor: `var(--${priorityColor}-500)` }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-full bg-${priorityColor}-50`}>
                              <IconComponent className={`w-5 h-5 text-${priorityColor}-600`} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm">{action.title}</h3>
                                <Badge variant={PRIORITY_COLORS[action.priority] as any} className="text-xs">
                                  {action.priority}
                                </Badge>
                                <Badge variant={STATUS_COLORS[action.status] as any} className="text-xs flex items-center gap-1">
                                  {getStatusIcon(action.status)}
                                  {action.status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {action.description}
                              </p>
                              
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="font-medium">Timeline:</span> {action.timeline}
                                </div>
                                <div>
                                  <span className="font-medium">Cost:</span> {action.cost}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right ml-2">
                            <div className="text-lg font-bold text-green-600">
                              {action.effectiveness}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Effectiveness
                            </div>
                          </div>
                        </div>

                        {/* Impact & Carbon Reduction */}
                        <div className="space-y-2 mb-3">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Impact</h4>
                            <p className="text-xs">{action.impact}</p>
                          </div>
                          
                          {action.carbonReduction && (
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-green-600 font-medium">
                                🌱 -{action.carbonReduction}kg CO₂
                              </div>
                              <div className="text-xs text-muted-foreground">
                                carbon reduction potential
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Implementation Progress</span>
                            <span>{action.effectiveness}%</span>
                          </div>
                          <Progress value={action.effectiveness} className="h-1" />
                        </div>

                        {/* Resources & Action Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {action.resources.slice(0, 3).map((resource, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                            {action.resources.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{action.resources.length - 3} more
                              </Badge>
                            )}
                          </div>
                          
                          <Button size="sm" variant="outline" className="text-xs">
                            Deploy Action
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>

          {filteredActions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No actions available for selected category</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
