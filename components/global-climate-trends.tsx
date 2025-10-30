"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Globe, TrendingUp, TrendingDown, Calendar, MapPin, BarChart3,
  Thermometer, Droplets, Wind, Flame, Sun, Cloud, Zap
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface ClimateData {
  month: string
  current: number
  historical: number
  region: string
}

interface RegionData {
  region: string
  riskLevel: number
  temperature: number
  precipitation: number
  extremeEvents: number
}

// Mock historical vs current data
const generateClimateData = (): ClimateData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map(month => ({
    month,
    current: Math.random() * 40 + 10,
    historical: Math.random() * 35 + 12,
    region: 'Global'
  }))
}

// Mock regional data
const generateRegionalData = (): RegionData[] => {
  const regions = [
    'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 'Arctic', 'Antarctica'
  ]
  return regions.map(region => ({
    region,
    riskLevel: Math.floor(Math.random() * 100),
    temperature: Math.random() * 50 - 10,
    precipitation: Math.random() * 2000,
    extremeEvents: Math.floor(Math.random() * 50)
  }))
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb']

export function GlobalClimateTrends() {
  const [selectedRegion, setSelectedRegion] = useState<string>("global")
  const [timeRange, setTimeRange] = useState<string>("2024")
  const [viewType, setViewType] = useState<string>("temperature")
  
  const climateData = generateClimateData()
  const regionalData = generateRegionalData()

  const extremeEventsData = [
    { name: 'Heatwaves', value: 34, color: '#ff4444' },
    { name: 'Floods', value: 28, color: '#4444ff' },
    { name: 'Droughts', value: 22, color: '#ffaa44' },
    { name: 'Storms', value: 16, color: '#aa44ff' }
  ]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Global Climate Analysis Controls
          </CardTitle>
          <CardDescription>Select region, time range, and data type for detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global Overview</SelectItem>
                  <SelectItem value="north-america">North America</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                  <SelectItem value="oceania">Oceania</SelectItem>
                  <SelectItem value="arctic">Arctic Region</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024 (Current)</SelectItem>
                  <SelectItem value="2020-2024">2020-2024</SelectItem>
                  <SelectItem value="2010-2024">2010-2024</SelectItem>
                  <SelectItem value="historical">Historical (1990-2024)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Type</label>
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="precipitation">Precipitation</SelectItem>
                  <SelectItem value="extreme-events">Extreme Events</SelectItem>
                  <SelectItem value="risk-index">Risk Index</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Climate Trends</TabsTrigger>
          <TabsTrigger value="comparison">Historical Comparison</TabsTrigger>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="events">Extreme Events</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current vs Historical Climate Trends</CardTitle>
              <CardDescription>
                Comparing {timeRange} data with historical averages for {selectedRegion.replace('-', ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={climateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Current Year"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="historical" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Historical Average"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  Temperature Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Global Average</span>
                    <Badge variant="destructive">+1.2°C</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    75% above historical average
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  Precipitation Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Regional Variance</span>
                    <Badge variant="default">-8%</Badge>
                  </div>
                  <Progress value={42} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    8% below historical average
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Climate Risk Analysis</CardTitle>
              <CardDescription>Risk levels and climate indicators by major world regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="riskLevel" fill="#8884d8" name="Risk Level %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Extreme Event Distribution</CardTitle>
                <CardDescription>Global distribution of extreme weather events in {timeRange}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={extremeEventsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {extremeEventsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Impact Severity</CardTitle>
                <CardDescription>Severity levels of recent extreme weather events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extremeEventsData.map((event, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-sm font-medium">{event.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={event.value} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground w-10">
                          {event.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}