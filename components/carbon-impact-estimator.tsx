"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Leaf, TrendingDown, Calculator, Zap, Target } from "lucide-react"
import { motion } from "framer-motion"

interface CarbonImpactProps {
  currentRiskLevel?: number // 0-100
  className?: string
}

interface AdaptationMeasure {
  id: string
  name: string
  category: "infrastructure" | "technology" | "nature" | "behavior"
  carbonReduction: number // kg CO2 per year
  cost: "Low" | "Medium" | "High"
  effectiveness: number // 0-100
  description: string
  implementationTime: string
}

interface ImpactCalculation {
  totalReduction: number
  percentageImprovement: number
  yearlyBenefit: number
  costEffectiveness: number
  measures: AdaptationMeasure[]
}

const ADAPTATION_MEASURES: AdaptationMeasure[] = [
  {
    id: "green-infrastructure",
    name: "Green Infrastructure",
    category: "nature",
    carbonReduction: 2500,
    cost: "Medium",
    effectiveness: 85,
    description: "Urban forests, green roofs, and permeable surfaces that naturally manage water and reduce heat",
    implementationTime: "6-18 months"
  },
  {
    id: "smart-buildings",
    name: "Smart Building Systems",
    category: "technology",
    carbonReduction: 3200,
    cost: "High",
    effectiveness: 92,
    description: "AI-powered HVAC, smart lighting, and automated energy management systems",
    implementationTime: "3-12 months"
  },
  {
    id: "renewable-energy",
    name: "Renewable Energy Transition",
    category: "infrastructure",
    carbonReduction: 5000,
    cost: "High",
    effectiveness: 95,
    description: "Solar panels, wind power, and battery storage systems for resilient clean energy",
    implementationTime: "12-24 months"
  },
  {
    id: "water-conservation",
    name: "Water Conservation Systems",
    category: "infrastructure",
    carbonReduction: 1200,
    cost: "Low",
    effectiveness: 75,
    description: "Rainwater harvesting, greywater recycling, and efficient irrigation systems",
    implementationTime: "2-6 months"
  },
  {
    id: "community-programs",
    name: "Community Resilience Programs",
    category: "behavior",
    carbonReduction: 800,
    cost: "Low",
    effectiveness: 70,
    description: "Education, emergency preparedness, and community gardens for local resilience",
    implementationTime: "1-3 months"
  },
  {
    id: "flood-barriers",
    name: "Natural Flood Management",
    category: "nature",
    carbonReduction: 1500,
    cost: "Medium",
    effectiveness: 80,
    description: "Wetlands restoration, bioswales, and living shorelines for flood protection",
    implementationTime: "6-18 months"
  },
  {
    id: "heat-resilience",
    name: "Heat Resilience Solutions",
    category: "infrastructure",
    carbonReduction: 2000,
    cost: "Medium",
    effectiveness: 88,
    description: "Cool roofs, urban shading, and heat-reflective materials for temperature control",
    implementationTime: "3-9 months"
  },
  {
    id: "smart-transportation",
    name: "Smart Transportation",
    category: "technology",
    carbonReduction: 4500,
    cost: "High",
    effectiveness: 90,
    description: "Electric vehicle infrastructure, smart traffic systems, and public transit optimization",
    implementationTime: "12-36 months"
  }
]

export function CarbonImpactEstimator({ currentRiskLevel = 50, className }: CarbonImpactProps) {
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([])
  const [customPopulation, setCustomPopulation] = useState(100000)
  const [timeHorizon, setTimeHorizon] = useState(10)
  const [calculation, setCalculation] = useState<ImpactCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (selectedMeasures.length > 0) {
      calculateImpact()
    } else {
      setCalculation(null)
    }
  }, [selectedMeasures, customPopulation, timeHorizon])

  const calculateImpact = async () => {
    setIsCalculating(true)
    
    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const measures = ADAPTATION_MEASURES.filter(m => selectedMeasures.includes(m.id))
    
    const totalAnnualReduction = measures.reduce((sum, measure) => {
      // Scale reduction based on population
      const scaleFactor = customPopulation / 100000
      return sum + (measure.carbonReduction * scaleFactor)
    }, 0)
    
    const totalLifetimeReduction = totalAnnualReduction * timeHorizon
    
    // Calculate risk reduction percentage based on selected measures
    const avgEffectiveness = measures.reduce((sum, m) => sum + m.effectiveness, 0) / measures.length || 0
    const riskReduction = Math.min(currentRiskLevel * (avgEffectiveness / 100) * 0.7, currentRiskLevel)
    
    // Calculate economic benefits (simplified)
    const carbonPrice = 50 // $50 per tonne CO2
    const yearlyBenefit = (totalAnnualReduction / 1000) * carbonPrice
    
    // Calculate cost-effectiveness score
    const avgCostScore = measures.reduce((sum, m) => {
      const costScore = m.cost === "Low" ? 3 : m.cost === "Medium" ? 2 : 1
      return sum + costScore
    }, 0) / measures.length || 0
    
    const costEffectiveness = (avgEffectiveness * avgCostScore) / 100

    setCalculation({
      totalReduction: totalLifetimeReduction,
      percentageImprovement: riskReduction,
      yearlyBenefit,
      costEffectiveness,
      measures
    })
    
    setIsCalculating(false)
  }

  const toggleMeasure = (measureId: string) => {
    setSelectedMeasures(prev => 
      prev.includes(measureId)
        ? prev.filter(id => id !== measureId)
        : [...prev, measureId]
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "nature": return "🌱"
      case "technology": return "⚡"
      case "infrastructure": return "🏗️"
      case "behavior": return "👥"
      default: return "🔧"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "nature": return "bg-green-50 border-green-200 text-green-800"
      case "technology": return "bg-blue-50 border-blue-200 text-blue-800"
      case "infrastructure": return "bg-orange-50 border-orange-200 text-orange-800"
      case "behavior": return "bg-purple-50 border-purple-200 text-purple-800"
      default: return "bg-gray-50 border-gray-200 text-gray-800"
    }
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
            <Calculator className="w-5 h-5" />
            Carbon Impact Estimator
            <Badge variant="outline" className="text-xs">
              <Leaf className="w-3 h-3 mr-1" />
              Climate Action
            </Badge>
          </CardTitle>
          <CardDescription>
            Calculate the carbon reduction potential of climate adaptation measures
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="population">Population Coverage</Label>
              <Input
                id="population"
                type="number"
                value={customPopulation}
                onChange={(e) => setCustomPopulation(Number(e.target.value))}
                min={1000}
                max={10000000}
                step={1000}
              />
              <p className="text-xs text-muted-foreground">
                Number of people benefiting from these measures
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeHorizon">Time Horizon (years)</Label>
              <Input
                id="timeHorizon"
                type="number"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
                min={1}
                max={50}
              />
              <p className="text-xs text-muted-foreground">
                Evaluation period for carbon impact
              </p>
            </div>
          </div>

          {/* Measure Selection */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Select Adaptation Measures</h4>
            <div className="grid grid-cols-1 gap-3">
              {ADAPTATION_MEASURES.map((measure) => {
                const isSelected = selectedMeasures.includes(measure.id)
                
                return (
                  <motion.div
                    key={measure.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover:shadow-md"
                      }`}
                      onClick={() => toggleMeasure(measure.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">
                                {getCategoryIcon(measure.category)}
                              </span>
                              <h5 className="font-medium">{measure.name}</h5>
                              <Badge variant="outline" className={`text-xs ${getCategoryColor(measure.category)}`}>
                                {measure.category}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {measure.description}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <Leaf className="w-3 h-3 text-green-600" />
                                <span className="font-medium">{measure.carbonReduction.toLocaleString()}</span>
                                <span className="text-muted-foreground">kg CO²/year</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-blue-600" />
                                <span className="font-medium">{measure.effectiveness}%</span>
                                <span className="text-muted-foreground">effective</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Cost:</span>
                                <Badge variant={measure.cost === "Low" ? "default" : measure.cost === "Medium" ? "secondary" : "destructive"} className="text-xs">
                                  {measure.cost}
                                </Badge>
                              </div>
                              
                              <div className="text-muted-foreground">
                                {measure.implementationTime}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected 
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "border-muted-foreground"
                            }`}>
                              {isSelected && "✓"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Results */}
          {(calculation || isCalculating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Impact Assessment</h4>
                {isCalculating && <div className="text-xs text-muted-foreground">Calculating...</div>}
              </div>

              {isCalculating ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : calculation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-5 h-5 text-green-600" />
                        <h5 className="font-medium">Carbon Reduction</h5>
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {(calculation.totalReduction / 1000).toFixed(1)} tonnes
                      </div>
                      <div className="text-sm text-muted-foreground">
                        CO² over {timeHorizon} years
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-5 h-5 text-blue-600" />
                        <h5 className="font-medium">Risk Reduction</h5>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {calculation.percentageImprovement.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Climate risk improvement
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-orange-600" />
                        <h5 className="font-medium">Economic Benefit</h5>
                      </div>
                      <div className="text-2xl font-bold text-orange-700">
                        ${calculation.yearlyBenefit.toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Annual carbon value
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <h5 className="font-medium">Effectiveness</h5>
                      </div>
                      <div className="space-y-2">
                        <Progress value={calculation.costEffectiveness * 20} className="h-2" />
                        <div className="text-sm text-muted-foreground">
                          Cost-effectiveness score
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {calculation && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-medium mb-2">🎯 Summary</h5>
                  <p className="text-sm text-muted-foreground">
                    Implementing {calculation.measures.length} adaptation measures for {customPopulation.toLocaleString()} people
                    could reduce {(calculation.totalReduction / 1000).toFixed(1)} tonnes of CO² over {timeHorizon} years,
                    while improving climate resilience by {calculation.percentageImprovement.toFixed(1)}%.
                    This represents approximately ${calculation.yearlyBenefit.toFixed(0)} in annual carbon benefits.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {selectedMeasures.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">Select adaptation measures to see their carbon impact</p>
              <p className="text-sm">Choose from infrastructure, technology, nature-based, or behavioral solutions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}