"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Simulated 10-day prediction data
const predictionData = [
  {
    date: "Day 1",
    temperature: 28,
    precipitation: 12,
    humidity: 65,
    riskScore: 3.2,
  },
  {
    date: "Day 2",
    temperature: 31,
    precipitation: 8,
    humidity: 58,
    riskScore: 4.1,
  },
  {
    date: "Day 3",
    temperature: 34,
    precipitation: 5,
    humidity: 52,
    riskScore: 5.8,
  },
  {
    date: "Day 4",
    temperature: 37,
    precipitation: 2,
    humidity: 48,
    riskScore: 7.2,
  },
  {
    date: "Day 5",
    temperature: 39,
    precipitation: 1,
    humidity: 45,
    riskScore: 8.5,
  },
  {
    date: "Day 6",
    temperature: 41,
    precipitation: 0,
    humidity: 42,
    riskScore: 9.1,
  },
  {
    date: "Day 7",
    temperature: 38,
    precipitation: 3,
    humidity: 47,
    riskScore: 7.8,
  },
  {
    date: "Day 8",
    temperature: 35,
    precipitation: 15,
    humidity: 62,
    riskScore: 5.4,
  },
  {
    date: "Day 9",
    temperature: 32,
    precipitation: 22,
    humidity: 68,
    riskScore: 4.2,
  },
  {
    date: "Day 10",
    temperature: 29,
    precipitation: 18,
    humidity: 71,
    riskScore: 3.6,
  },
]

export function PredictionChart() {
  return (
    <ChartContainer
      config={{
        temperature: {
          label: "Temperature (°C)",
          color: "hsl(var(--chart-4))",
        },
        precipitation: {
          label: "Precipitation (mm)",
          color: "hsl(var(--chart-1))",
        },
        riskScore: {
          label: "Risk Score",
          color: "hsl(var(--chart-4))",
        },
      }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={predictionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="var(--color-temperature)"
            strokeWidth={2}
            dot={{ fill: "var(--color-temperature)", strokeWidth: 2, r: 4 }}
            name="Temperature (°C)"
          />
          <Line
            type="monotone"
            dataKey="precipitation"
            stroke="var(--color-precipitation)"
            strokeWidth={2}
            dot={{ fill: "var(--color-precipitation)", strokeWidth: 2, r: 4 }}
            name="Precipitation (mm)"
          />
          <Line
            type="monotone"
            dataKey="riskScore"
            stroke="var(--color-riskScore)"
            strokeWidth={2}
            dot={{ fill: "var(--color-riskScore)", strokeWidth: 2, r: 4 }}
            name="Risk Score"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
