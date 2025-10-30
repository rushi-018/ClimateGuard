/**
 * Economic Intelligence Dashboard
 * World Bank data integration for business decision support and financial risk assessment
 */

"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, BarChart3, 
  Building2, Globe, PieChart, Target, Briefcase, Calculator,
  ArrowUpRight, ArrowDownRight, Info, RefreshCw, Download,
  Factory, Leaf, Users, Shield, Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  useCountryEconomicData,
  useMultiCountryComparison,
  useBusinessImpactAssessment,
  useInvestmentOpportunities,
  useRegionalImpact,
  useEconomicStats,
  useEconomicRiskAlerts
} from "@/hooks/use-economic-intelligence"

interface EconomicIntelligenceDashboardProps {
  className?: string
  compact?: boolean
}

export function EconomicIntelligenceDashboard({ 
  className,
  compact = false 
}: EconomicIntelligenceDashboardProps) {
  const [selectedCountry, setSelectedCountry] = useState("US")
  const [comparisonCountries, setComparisonCountries] = useState(["US", "CN", "DE", "BR"])
  const [selectedRegion, setSelectedRegion] = useState("North America")
  const [businessSector, setBusinessSector] = useState("technology")
  const [businessSize, setBusinessSize] = useState<"small" | "medium" | "large" | "enterprise">("medium")

  // Economic intelligence hooks
  const { data: countryData, loading: countryLoading, error: countryError } = useCountryEconomicData(selectedCountry)
  const { data: comparisonData, comparison, loading: compLoading } = useMultiCountryComparison(comparisonCountries)
  const { assessment, generateAssessment, loading: assessmentLoading } = useBusinessImpactAssessment()
  const { opportunities, stats: investmentStats, loading: opportunitiesLoading } = useInvestmentOpportunities()
  const { impact: regionalImpact, loading: regionalLoading } = useRegionalImpact(selectedRegion)
  const { stats: economicStats } = useEconomicStats(comparisonCountries)
  const { alerts: riskAlerts, criticalAlerts, alertCount } = useEconomicRiskAlerts(comparisonCountries, {
    vulnerability: 70,
    climateCostPercentage: 3,
    gdpGrowthRate: 2
  })

  const formatCurrency = (amount: number, decimals = 1) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(decimals)}T`
    }
    return `$${amount.toFixed(decimals)}B`
  }

  const formatNumber = (num: number, decimals = 0) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(decimals)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(decimals)}K`
    }
    return num.toFixed(decimals)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Economic Intelligence
            </CardTitle>
            {alertCount > 0 && (
              <Badge variant="destructive">
                {alertCount} Alerts
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {countryLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Loading economic data...</span>
            </div>
          ) : countryData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{countryData.country}</span>
                <Badge variant="outline">
                  {formatCurrency(countryData.gdp.total)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Economic Vulnerability</span>
                  <span className="font-medium">{countryData.economicVulnerability.score}%</span>
                </div>
                <Progress value={countryData.economicVulnerability.score} className="h-2" />
              </div>
              <div className="text-xs text-muted-foreground">
                Climate costs: {countryData.climateCosts.percentageOfGDP.toFixed(1)}% of GDP
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Economic data unavailable</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <div className="space-y-6">
        {/* Header with Alert Summary */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Economic Intelligence Dashboard
            </h2>
            <p className="text-muted-foreground">
              World Bank data integration for business decision support
            </p>
          </div>
          {alertCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {criticalAlerts} Critical
              </Badge>
              <Badge variant="secondary">
                {alertCount} Total Alerts
              </Badge>
            </div>
          )}
        </div>

        {/* Economic Overview Cards */}
        {economicStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total GDP</p>
                    <p className="text-2xl font-bold">{formatCurrency(economicStats.gdp.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Avg Vulnerability</p>
                    <p className="text-2xl font-bold">{economicStats.vulnerability.average.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Climate Costs</p>
                    <p className="text-2xl font-bold">{formatCurrency(economicStats.climateCosts.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Countries</p>
                    <p className="text-2xl font-bold">{economicStats.dataPoints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Risk Alerts */}
        {riskAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Economic Risk Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {riskAlerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{alert.country}</p>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
                {riskAlerts.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm">
                      View {riskAlerts.length - 5} more alerts
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="business">Business Impact</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Country Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Country Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CN">China</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {countryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                      <span>Loading economic data...</span>
                    </div>
                  ) : countryData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">GDP Total</p>
                          <p className="text-xl font-bold">{formatCurrency(countryData.gdp.total)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Per Capita</p>
                          <p className="text-xl font-bold">${formatNumber(countryData.gdp.perCapita)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Growth Rate</p>
                          <p className={`text-xl font-bold flex items-center gap-1 ${
                            countryData.gdp.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {countryData.gdp.growthRate >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {countryData.gdp.growthRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Income Level</p>
                          <p className="text-sm font-medium">{countryData.incomeLevel}</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Economic Vulnerability</p>
                          <Badge variant={countryData.economicVulnerability.score > 70 ? 'destructive' : 
                                        countryData.economicVulnerability.score > 50 ? 'default' : 'secondary'}>
                            {countryData.economicVulnerability.score}%
                          </Badge>
                        </div>
                        <Progress value={countryData.economicVulnerability.score} className="mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Resilience Score: {countryData.economicVulnerability.resilience}%
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Climate Costs</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Annual Damages:</span>
                            <span className="font-medium">{formatCurrency(countryData.climateCosts.annualDamages)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Adaptation Costs:</span>
                            <span className="font-medium">{formatCurrency(countryData.climateCosts.adaptationCosts)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>% of GDP:</span>
                            <span className="font-medium">{countryData.climateCosts.percentageOfGDP.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : countryError ? (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>{countryError}</AlertDescription>
                    </Alert>
                  ) : null}
                </CardContent>
              </Card>

              {/* Sector Analysis */}
              {countryData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Sector Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(countryData.sectors).map(([sector, data]) => (
                        <div key={sector} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{sector}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {data.gdpContribution.toFixed(1)}% GDP
                              </Badge>
                              <Badge variant={data.climateRisk > 70 ? 'destructive' : 
                                           data.climateRisk > 50 ? 'default' : 'secondary'} className="text-xs">
                                {data.climateRisk.toFixed(0)}% Risk
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Adaptation Potential:</span>
                              <Progress value={data.adaptationPotential} className="h-1 mt-1" />
                            </div>
                            <div>
                              <span className="text-muted-foreground">Employment Impact:</span>
                              <span className="font-medium ml-1">{formatNumber(data.employmentImpact)} jobs</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Business Impact Tab */}
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Business Impact Assessment
                </CardTitle>
                <CardDescription>
                  Analyze climate risks and financial impacts for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Business Sector</Label>
                    <Select value={businessSector} onValueChange={setBusinessSector}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="tourism">Tourism</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Business Size</Label>
                    <Select value={businessSize} onValueChange={(value: any) => setBusinessSize(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1-50 employees)</SelectItem>
                        <SelectItem value="medium">Medium (51-250 employees)</SelectItem>
                        <SelectItem value="large">Large (251-1000 employees)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Asia">Asia</SelectItem>
                        <SelectItem value="South America">South America</SelectItem>
                        <SelectItem value="Africa">Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => generateAssessment(businessSector, selectedRegion, businessSize, selectedCountry)}
                  disabled={assessmentLoading}
                  className="w-full"
                >
                  {assessmentLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Assessment...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Generate Business Impact Assessment
                    </>
                  )}
                </Button>

                {assessment && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Separator />
                    
                    {/* Risk Profile */}
                    <div>
                      <h4 className="font-medium mb-3">Risk Profile</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(assessment.riskProfile).map(([risk, value]) => (
                          <div key={risk} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm capitalize">{risk}</span>
                              <Badge variant={value > 70 ? 'destructive' : value > 50 ? 'default' : 'secondary'}>
                                {value}%
                              </Badge>
                            </div>
                            <Progress value={value} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Projections */}
                    <div>
                      <h4 className="font-medium mb-3">Financial Impact Projections</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-2">Potential Losses</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Low Scenario:</span>
                                <span className="font-medium">${formatNumber(assessment.financialProjections.potentialLosses.lowScenario)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Medium Scenario:</span>
                                <span className="font-medium">${formatNumber(assessment.financialProjections.potentialLosses.mediumScenario)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>High Scenario:</span>
                                <span className="font-medium text-red-600">${formatNumber(assessment.financialProjections.potentialLosses.highScenario)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-2">Adaptation Costs</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Immediate:</span>
                                <span className="font-medium">${formatNumber(assessment.financialProjections.adaptationCosts.immediate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Medium-term:</span>
                                <span className="font-medium">${formatNumber(assessment.financialProjections.adaptationCosts.mediumTerm)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Long-term:</span>
                                <span className="font-medium">${formatNumber(assessment.financialProjections.adaptationCosts.longTerm)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium mb-3">Recommendations</h4>
                      <Tabs defaultValue="immediate">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="immediate">Immediate</TabsTrigger>
                          <TabsTrigger value="shortTerm">Short-term</TabsTrigger>
                          <TabsTrigger value="longTerm">Long-term</TabsTrigger>
                          <TabsTrigger value="investment">Investment</TabsTrigger>
                        </TabsList>
                        {Object.entries(assessment.recommendations).map(([timeframe, recommendations]) => (
                          <TabsContent key={timeframe} value={timeframe} className="space-y-2">
                            {recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-blue-800">{rec}</span>
                              </div>
                            ))}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Opportunities Tab */}
          <TabsContent value="investments" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {investmentStats && (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Total Investment</p>
                          <p className="text-xl font-bold">${formatNumber(investmentStats.totalInvestment / 1000000)}M</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Avg Return</p>
                          <p className="text-xl font-bold">{investmentStats.avgReturn.toFixed(1)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">CO2 Reduction</p>
                          <p className="text-xl font-bold">{formatNumber(investmentStats.totalCO2Reduction / 1000)}K tons</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Climate Investment Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {opportunitiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading investment opportunities...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {opportunities.map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{opportunity.title}</h4>
                            <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={opportunity.riskLevel === 'high' ? 'destructive' : 
                                           opportunity.riskLevel === 'medium' ? 'default' : 'secondary'}>
                              {opportunity.riskLevel} risk
                            </Badge>
                            <Badge variant="outline">
                              {opportunity.type}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Investment</p>
                            <p className="font-medium">${formatNumber(opportunity.investmentRequired / 1000000)}M</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Financial Return</p>
                            <p className="font-medium text-green-600">{opportunity.potentialReturn.financial}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">CO2 Reduction</p>
                            <p className="font-medium">{formatNumber(opportunity.potentialReturn.environmental / 1000)}K tons</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Jobs Created</p>
                            <p className="font-medium">{formatNumber(opportunity.potentialReturn.social)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Sector: {opportunity.sector}</span>
                          <span>Timeframe: {opportunity.timeHorizon} years</span>
                          <span>Market: ${formatNumber(opportunity.marketSize)}B</span>
                          {opportunity.location && <span>Location: {opportunity.location}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regional Analysis Tab */}
          <TabsContent value="regional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Regional Economic Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Region</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Asia">Asia</SelectItem>
                      <SelectItem value="South America">South America</SelectItem>
                      <SelectItem value="Africa">Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {regionalLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading regional analysis...</span>
                  </div>
                ) : regionalImpact ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total GDP</p>
                        <p className="text-2xl font-bold">{formatCurrency(regionalImpact.totalGDP)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Climate Risk</p>
                        <p className="text-2xl font-bold text-orange-600">{regionalImpact.climateRisk.toFixed(0)}%</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Economic Losses</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(regionalImpact.economicLosses)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Adaptation Costs</p>
                        <p className="text-2xl font-bold">{formatCurrency(regionalImpact.adaptationCosts)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Jobs at Risk</p>
                        <p className="text-2xl font-bold text-yellow-600">{formatNumber(regionalImpact.jobsAtRisk)}M</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-4">Sector Impact Analysis</h4>
                      <div className="space-y-3">
                        {regionalImpact.sectors.map((sector) => (
                          <div key={sector.name} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                {sector.name === 'agriculture' && <Leaf className="w-4 h-4 text-green-600" />}
                                {sector.name === 'manufacturing' && <Factory className="w-4 h-4 text-gray-600" />}
                                {sector.name === 'services' && <Building2 className="w-4 h-4 text-blue-600" />}
                                {sector.name === 'tourism' && <Users className="w-4 h-4 text-purple-600" />}
                              </div>
                              <div>
                                <p className="font-medium capitalize">{sector.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatNumber(sector.employment)}M jobs
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={sector.impact > 70 ? 'destructive' : 
                                           sector.impact > 50 ? 'default' : 'secondary'}>
                                {sector.impact}% risk
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}