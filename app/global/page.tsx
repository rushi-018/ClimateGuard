"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WorldMap } from "@/components/world-map"
import { Badge } from "@/components/ui/badge"
import { Globe, Thermometer, Droplets, Sun } from "lucide-react"

export default function GlobalViewPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Global Climate View</h1>
            <p className="text-muted-foreground">Worldwide climate risk monitoring and analysis</p>
          </div>

          <div className="grid gap-6">
            {/* Global Map - Full Width */}
            <Card className="h-[70vh]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Global Climate Risk Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <WorldMap />
              </CardContent>
            </Card>

            {/* Global Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Thermometer className="w-4 h-4 text-destructive" />
                    Heat Risk Regions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High Risk Areas</span>
                      <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
                        23 regions
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Major cities experiencing extreme temperatures above 40°C
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sun className="w-4 h-4 text-warning" />
                    Drought Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Affected Areas</span>
                      <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                        15 regions
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">Agricultural regions with severe water scarcity</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Droplets className="w-4 h-4 text-primary" />
                    Flood Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">At-Risk Zones</span>
                      <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                        8 regions
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Coastal and river areas with elevated water levels
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
