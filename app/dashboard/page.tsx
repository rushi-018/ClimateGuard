"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlobalHeatmap } from "@/components/enhanced-global-heatmap"
import { RiskTrendChart } from "@/components/risk-trend-chart"
import { RiskCards } from "@/components/risk-cards"
import { ActionList } from "@/components/action-list"
import { VoiceQA } from '@/components/voice-qa'
import { CarbonImpactEstimator } from '@/components/carbon-impact-estimator'
import { RealTimeAlerts } from '@/components/real-time-alerts'
import { MapPin, TrendingUp, AlertTriangle, Shield, Mic, Calculator, Bell } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Climate Risk Dashboard</h1>
            <p className="text-muted-foreground">Real-time climate monitoring and risk assessment</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-1">
                <Bell className="w-4 h-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-1">
                <Mic className="w-4 h-4" />
                Voice Q&A
              </TabsTrigger>
              <TabsTrigger value="carbon" className="flex items-center gap-1">
                <Calculator className="w-4 h-4" />
                Carbon Impact
              </TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
                {/* Left Panel - World Map */}
                <div className="lg:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Global Climate Risk Map
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)]">
                      <GlobalHeatmap />
                    </CardContent>
                  </Card>
                </div>

                {/* Right Panel - Risk Status and Predictions */}
                <div className="lg:col-span-1 space-y-6 overflow-y-auto">
                  {/* Current Risk Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Current Risk Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RiskCards />
                    </CardContent>
                  </Card>

                  {/* Next 10 Days Prediction */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Next 10 Days Prediction
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                      <RiskTrendChart />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <RealTimeAlerts />
            </TabsContent>

            <TabsContent value="voice">
              <VoiceQA />
            </TabsContent>

            <TabsContent value="carbon">
              <CarbonImpactEstimator />
            </TabsContent>

            <TabsContent value="actions">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    <ActionList />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Impact Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CarbonImpactEstimator currentRiskLevel={65} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
