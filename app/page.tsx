"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedGlobe } from "@/components/animated-globe"
import { Navbar } from "@/components/navbar"
import { ArrowRight, Shield, TrendingUp, AlertTriangle, Zap, Globe, Mic, Calculator, Bell, Sparkles, Bot } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <Badge variant="outline" className="mb-4 px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered Climate Intelligence
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    ClimateGuard
                  </span>
                  <br />
                  <span className="text-2xl md:text-4xl text-muted-foreground">
                    Real-Time Climate Risk Intelligence
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  Advanced AI-powered platform for climate risk monitoring, prediction, and adaptive action planning. 
                  Get real-time alerts, voice-powered Q&A, and carbon impact calculations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transform hover:scale-105 transition-all duration-200">
                  <Link href="/dashboard">
                    <Bot className="mr-2 w-5 h-5" />
                    Launch AI Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="hover:bg-primary/5 border-2 hover:border-primary/50 transition-all duration-200">
                  <Link href="/global">
                    <Globe className="mr-2 w-4 h-4" />
                    Explore Global View
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                <div className="text-center p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs text-muted-foreground">AI Monitoring</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                  <div className="text-2xl font-bold text-blue-600">10-Day</div>
                  <div className="text-xs text-muted-foreground">ML Predictions</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors">
                  <div className="text-2xl font-bold text-green-600">Voice</div>
                  <div className="text-xs text-muted-foreground">AI Q&A</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
                  <div className="text-2xl font-bold text-orange-600">Carbon</div>
                  <div className="text-xs text-muted-foreground">Impact Calc</div>
                </div>
              </div>
            </motion.div>

            <div className="relative">
              <div className="w-full h-96 lg:h-[500px] animate-float">
                <AnimatedGlobe />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Advanced Climate Intelligence</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive tools for climate risk assessment and management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">Risk Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Real-time flood, drought, and heatwave risk monitoring with color-coded alerts.
              </p>
            </Card>

            <Card className="p-6 hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Predictive Analytics</h3>
              <p className="text-sm text-muted-foreground">
                10-day climate predictions using advanced machine learning models.
              </p>
            </Card>

            <Card className="p-6 hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Action Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Personalized recommendations for climate risk mitigation and adaptation.
              </p>
            </Card>

            <Card className="p-6 hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Instant notifications for emerging climate risks in your region.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Build Climate Resilience?</h2>
            <p className="text-muted-foreground text-lg">
              Join organizations worldwide using ClimateGuard for comprehensive climate risk management.
            </p>
            <Button size="lg" asChild className="animate-pulse-glow">
              <Link href="/dashboard">
                Start Monitoring Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
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
