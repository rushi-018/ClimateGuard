"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ForecastDay {
  date: string
  day: string
  overallRisk: 'Low' | 'Medium' | 'High' | 'Critical'
  temperature: { min: number; max: number }
  precipitation: number
  windSpeed: number
  risks: {
    flood: number
    drought: number
    heatwave: number
    storm: number
    wildfire: number
  }
}

// Generate 10-day forecast data based on location
const generateForecastData = (location?: { lat: number; lon: number; city: string }): ForecastDay[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date('2025-10-11') // Fixed date for consistent server/client rendering
  
  // Static forecast data based on location characteristics
  const staticForecastPatterns = [
    { risk: 'Medium', temp: [18, 28], precip: 15, wind: 12, risks: [25, 40, 60, 20, 15] },
    { risk: 'Low', temp: [16, 24], precip: 5, wind: 8, risks: [15, 50, 35, 10, 25] },
    { risk: 'High', temp: [22, 35], precip: 45, wind: 18, risks: [70, 30, 80, 45, 35] },
    { risk: 'Medium', temp: [19, 29], precip: 25, wind: 14, risks: [35, 60, 45, 30, 40] },
    { risk: 'Low', temp: [17, 26], precip: 10, wind: 9, risks: [20, 45, 30, 15, 20] },
    { risk: 'Critical', temp: [25, 38], precip: 80, wind: 25, risks: [85, 25, 90, 70, 60] },
    { risk: 'High', temp: [21, 32], precip: 55, wind: 20, risks: [60, 35, 75, 55, 45] },
    { risk: 'Medium', temp: [20, 30], precip: 30, wind: 15, risks: [40, 55, 50, 35, 30] },
    { risk: 'Low', temp: [18, 27], precip: 12, wind: 10, risks: [25, 50, 40, 20, 25] },
    { risk: 'Medium', temp: [19, 28], precip: 35, wind: 16, risks: [45, 40, 55, 40, 35] }
  ]
  
  // Adjust patterns based on location (e.g., Phoenix is hotter, Miami more humid)
  const locationModifier = location?.city === 'Phoenix' ? 
    { tempBoost: 5, droughtBoost: 20, heatwaveBoost: 25 } :
    location?.city === 'Miami' ? 
    { tempBoost: 2, floodBoost: 15, stormBoost: 20 } :
    { tempBoost: 0, droughtBoost: 0, heatwaveBoost: 0, floodBoost: 0, stormBoost: 0 }
  
  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    
    const pattern = staticForecastPatterns[index]
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      day: days[date.getDay()],
      overallRisk: pattern.risk as 'Low' | 'Medium' | 'High' | 'Critical',
      temperature: {
        min: pattern.temp[0] + (locationModifier.tempBoost || 0),
        max: pattern.temp[1] + (locationModifier.tempBoost || 0)
      },
      precipitation: pattern.precip,
      windSpeed: pattern.wind,
      risks: {
        flood: Math.min(100, pattern.risks[0] + (locationModifier.floodBoost || 0)),
        drought: Math.min(100, pattern.risks[1] + (locationModifier.droughtBoost || 0)),
        heatwave: Math.min(100, pattern.risks[2] + (locationModifier.heatwaveBoost || 0)),
        storm: Math.min(100, pattern.risks[3] + (locationModifier.stormBoost || 0)),
        wildfire: pattern.risks[4]
      }
    }
  })
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Critical': return 'bg-red-500 text-white'
    case 'High': return 'bg-orange-500 text-white'
    case 'Medium': return 'bg-yellow-500 text-black'
    case 'Low': return 'bg-green-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

const getTrendIcon = (current: number, previous: number) => {
  if (current > previous) return <TrendingUp className="h-3 w-3 text-red-500" />
  if (current < previous) return <TrendingDown className="h-3 w-3 text-green-500" />
  return <Minus className="h-3 w-3 text-gray-500" />
}

interface RiskForecastProps {
  location?: { lat: number; lon: number; city: string }
}

export function RiskForecast({ location }: RiskForecastProps = {}) {
  const forecastData = generateForecastData(location)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>10-Day Climate Risk Forecast</CardTitle>
        </div>
        <CardDescription>
          Predicted climate risks and weather conditions for the next 10 days in {location?.city || 'your location'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {forecastData.map((day, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="text-center mb-3">
                <div className="font-semibold text-sm">{day.day}</div>
                <div className="text-xs text-muted-foreground">{day.date}</div>
                <Badge className={`mt-2 ${getRiskColor(day.overallRisk)}`}>
                  {day.overallRisk} Risk
                </Badge>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Temp:</span>
                  <span>{day.temperature.min}° - {day.temperature.max}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Rain:</span>
                  <span>{day.precipitation}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind:</span>
                  <span>{day.windSpeed} km/h</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="text-xs font-medium mb-2">Risk Factors:</div>
                <div className="space-y-1">
                  {Object.entries(day.risks).map(([riskType, value]) => (
                    <div key={riskType} className="flex justify-between items-center">
                      <span className="text-xs capitalize">{riskType}:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{value}%</span>
                        {index > 0 && getTrendIcon(value, forecastData[index - 1].risks[riskType as keyof typeof day.risks])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}