"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Globe, TrendingUp, Users, Leaf, Target } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">About ClimateGuard</h1>
              <p className="text-xl text-muted-foreground text-balance">
                Empowering communities with real-time climate intelligence for a resilient future
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    ClimateGuard provides comprehensive climate risk assessment and monitoring tools to help
                    communities, organizations, and governments make informed decisions for climate adaptation and
                    resilience building.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Advanced Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Our platform leverages machine learning and real-time data from global weather stations, satellites,
                    and climate models to provide accurate 10-day predictions and risk assessments.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Supporting UN Sustainable Development Goal 13
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Climate Action</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      ClimateGuard directly contributes to SDG 13 by providing tools for climate change mitigation,
                      adaptation, impact reduction, and early warning systems. Our platform helps communities build
                      resilience against climate-related hazards and natural disasters.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">Early Warning Systems</Badge>
                      <Badge variant="outline">Risk Assessment</Badge>
                      <Badge variant="outline">Adaptation Planning</Badge>
                      <Badge variant="outline">Community Resilience</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="w-4 h-4" />
                    Global Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monitoring climate risks across all continents with real-time data integration from international
                    weather networks.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-4 h-4" />
                    Community Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Designed for emergency managers, urban planners, agricultural specialists, and community leaders
                    working on climate resilience.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-4 h-4" />
                    Predictive Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Advanced machine learning models provide accurate climate predictions and actionable recommendations
                    for risk mitigation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Supporting UN SDG 13: Climate Action</span>
            </div>
            <div className="text-sm text-muted-foreground">© 2025 ClimateGuard. Built for climate resilience.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
