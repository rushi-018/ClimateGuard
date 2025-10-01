"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Zap, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Web Speech API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface VoiceQAProps {
  className?: string
}

interface QASession {
  id: string
  question: string
  answer: string
  timestamp: Date
  confidence: number
}

export function VoiceQA({ className }: VoiceQAProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentText, setCurrentText] = useState("")
  const [sessions, setSessions] = useState<QASession[]>([])
  const [isSupported, setIsSupported] = useState(false)

  // Web Speech API references
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Check for Web Speech API support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      const speechSynthesis = window.speechSynthesis

      if (SpeechRecognition && speechSynthesis) {
        setIsSupported(true)
        
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'en-US'

        recognitionInstance.onstart = () => {
          setIsListening(true)
          setCurrentText("Listening...")
        }

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setCurrentText(transcript)
          handleVoiceQuestion(transcript)
        }

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setCurrentText("Error: " + event.error)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
        setSynthesis(speechSynthesis)
      }
    }
  }, [])

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
    }
  }

  const speakAnswer = (text: string) => {
    if (synthesis && !isSpeaking) {
      // Cancel any ongoing speech
      synthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleVoiceQuestion = async (question: string) => {
    setIsProcessing(true)
    
    try {
      const answer = await processClimateQuestion(question)
      const session: QASession = {
        id: Date.now().toString(),
        question,
        answer: answer.text,
        timestamp: new Date(),
        confidence: answer.confidence,
      }

      setSessions(prev => [session, ...prev.slice(0, 4)]) // Keep last 5 sessions
      speakAnswer(answer.text)
    } catch (error) {
      console.error('Failed to process question:', error)
      setCurrentText("Sorry, I couldn't process that question.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextQuestion = async () => {
    if (currentText.trim()) {
      await handleVoiceQuestion(currentText.trim())
      setCurrentText("")
    }
  }

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Voice Climate Assistant
          </CardTitle>
          <CardDescription>
            Voice-powered climate risk Q&A system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">Voice features not supported in this browser</p>
            <p className="text-sm">Try Chrome, Edge, or Safari for voice interaction</p>
          </div>
        </CardContent>
      </Card>
    )
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
            <MessageSquare className="w-5 h-5" />
            Voice Climate Assistant
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </CardTitle>
          <CardDescription>
            Ask about climate risks anywhere in the world using voice or text
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Voice Controls */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <motion.div
                animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Button
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className="rounded-full w-16 h-16"
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
              </motion.div>
              
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                  animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={isSpeaking ? stopSpeaking : undefined}
                disabled={!isSpeaking}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                {isSpeaking ? "Stop" : "Speaker"}
              </Button>
              
              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              )}
            </div>
          </div>

          {/* Text Input Alternative */}
          <div className="flex gap-2">
            <Input
              placeholder="Or type your climate question here..."
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextQuestion()}
              disabled={isListening || isProcessing}
            />
            <Button 
              onClick={handleTextQuestion}
              disabled={!currentText.trim() || isProcessing}
            >
              Ask
            </Button>
          </div>

          {/* Current Status */}
          {(isListening || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-muted/50 rounded-lg"
            >
              <div className="text-sm font-medium mb-1">
                {isListening ? "🎤 Listening..." : "🤖 Processing your question..."}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentText}
              </div>
            </motion.div>
          )}

          {/* Recent Q&A Sessions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recent Questions</h4>
            <AnimatePresence>
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-3 bg-muted/50 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Q: {session.question}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {(session.confidence * 100).toFixed(0)}%
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => speakAnswer(session.answer)}
                        className="text-xs p-1 h-auto"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    A: {session.answer}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.timestamp.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sessions.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Try asking: "What's the climate risk in New York?"</p>
              </div>
            )}
          </div>

          {/* Example Questions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Example Questions</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "What's the flood risk in Miami?",
                "Climate risks in Tokyo next week",
                "Drought conditions in California",
                "Storm alerts for London"
              ].map((example) => (
                <Button
                  key={example}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentText(example)
                    handleVoiceQuestion(example)
                  }}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/**
 * Process climate-related questions using AI/rule-based logic
 */
async function processClimateQuestion(question: string): Promise<{ text: string; confidence: number }> {
  const normalizedQuestion = question.toLowerCase()
  
  // Extract location from question
  const locationMatch = extractLocation(normalizedQuestion)
  
  // Determine question type
  const questionType = determineQuestionType(normalizedQuestion)
  
  try {
    // Fetch relevant data based on question
    let responseText = ""
    let confidence = 0.8

    if (questionType.includes("risk") || questionType.includes("alert")) {
      const riskData = await fetchRiskData(locationMatch)
      responseText = generateRiskResponse(riskData, locationMatch, questionType)
    } else if (questionType.includes("weather")) {
      const weatherData = await fetchWeatherData(locationMatch)
      responseText = generateWeatherResponse(weatherData, locationMatch)
    } else if (questionType.includes("forecast") || questionType.includes("prediction")) {
      const forecastData = await fetchForecastData(locationMatch)
      responseText = generateForecastResponse(forecastData, locationMatch)
    } else {
      // General climate information
      responseText = generateGeneralResponse(normalizedQuestion, locationMatch)
      confidence = 0.6
    }

    return { text: responseText, confidence }
  } catch (error) {
    return {
      text: `I'm having trouble accessing climate data right now. Please try again later or check our dashboard for the latest information about ${locationMatch || "your area"}.`,
      confidence: 0.5
    }
  }
}

function extractLocation(question: string): string {
  // Simple location extraction - in production, use NLP library
  const locationPatterns = [
    /in\s+([a-z\s]+?)(?:\s|$|\.|\?)/i,
    /for\s+([a-z\s]+?)(?:\s|$|\.|\?)/i,
    /at\s+([a-z\s]+?)(?:\s|$|\.|\?)/i,
  ]
  
  for (const pattern of locationPatterns) {
    const match = question.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  // Common city names
  const cities = ["new york", "london", "tokyo", "miami", "california", "los angeles", "chicago", "houston"]
  for (const city of cities) {
    if (question.includes(city)) {
      return city
    }
  }
  
  return "your area"
}

function determineQuestionType(question: string): string[] {
  const types = []
  
  if (question.includes("risk") || question.includes("danger")) types.push("risk")
  if (question.includes("flood")) types.push("flood")
  if (question.includes("drought")) types.push("drought")
  if (question.includes("heat") || question.includes("temperature")) types.push("heatwave")
  if (question.includes("storm") || question.includes("wind")) types.push("storm")
  if (question.includes("weather")) types.push("weather")
  if (question.includes("forecast") || question.includes("predict")) types.push("forecast")
  if (question.includes("alert") || question.includes("warning")) types.push("alert")
  
  return types.length > 0 ? types : ["general"]
}

async function fetchRiskData(location: string) {
  // Mock implementation - in production, this would call the actual API
  return {
    location,
    floodRisk: 0.3 + Math.random() * 0.4,
    droughtRisk: 0.2 + Math.random() * 0.3,
    heatwaveRisk: 0.4 + Math.random() * 0.3,
    stormRisk: 0.2 + Math.random() * 0.2,
  }
}

async function fetchWeatherData(location: string) {
  return {
    location,
    temperature: 20 + Math.random() * 15,
    precipitation: Math.random() * 10,
    humidity: 40 + Math.random() * 40,
    windSpeed: 5 + Math.random() * 15,
  }
}

async function fetchForecastData(location: string) {
  return {
    location,
    forecast: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      risk: 0.2 + Math.random() * 0.3,
      temperature: 18 + Math.random() * 12,
    }))
  }
}

function generateRiskResponse(data: any, location: string, types: string[]): string {
  const risks = [
    { name: "flood", value: data.floodRisk, emoji: "🌊" },
    { name: "drought", value: data.droughtRisk, emoji: "🌵" },
    { name: "heatwave", value: data.heatwaveRisk, emoji: "🔥" },
    { name: "storm", value: data.stormRisk, emoji: "⛈️" },
  ]
  
  const highestRisk = risks.reduce((prev, current) => prev.value > current.value ? prev : current)
  const riskLevel = highestRisk.value > 0.7 ? "high" : highestRisk.value > 0.4 ? "moderate" : "low"
  
  return `Based on current data for ${location}, the primary climate risk is ${highestRisk.emoji} ${highestRisk.name} with a ${riskLevel} risk level of ${(highestRisk.value * 100).toFixed(0)}%. ${getRiskAdvice(highestRisk.name, riskLevel)}`
}

function generateWeatherResponse(data: any, location: string): string {
  return `Current weather conditions in ${location}: Temperature is ${data.temperature.toFixed(1)}°C, with ${data.precipitation.toFixed(1)}mm precipitation, ${data.humidity.toFixed(0)}% humidity, and ${data.windSpeed.toFixed(1)} km/h wind speed.`
}

function generateForecastResponse(data: any, location: string): string {
  const avgRisk = data.forecast.reduce((sum: number, day: any) => sum + day.risk, 0) / data.forecast.length
  const trend = avgRisk > 0.4 ? "increasing climate risks" : "stable conditions"
  
  return `The 7-day forecast for ${location} shows ${trend} with an average risk level of ${(avgRisk * 100).toFixed(0)}%. Monitor conditions closely and follow safety guidelines.`
}

function generateGeneralResponse(question: string, location: string): string {
  return `I can help you with climate risk information for ${location}. Try asking about specific risks like floods, droughts, heatwaves, or storms. You can also ask for weather forecasts or safety recommendations.`
}

function getRiskAdvice(riskType: string, level: string): string {
  const advice = {
    flood: {
      high: "Avoid low-lying areas and have an emergency kit ready.",
      moderate: "Stay alert for weather updates and avoid unnecessary travel.",
      low: "Normal precautions apply."
    },
    drought: {
      high: "Conserve water and follow local restrictions.",
      moderate: "Be mindful of water usage.",
      low: "No special precautions needed."
    },
    heatwave: {
      high: "Stay indoors during peak hours and stay hydrated.",
      moderate: "Limit outdoor activities and drink plenty of water.",
      low: "Normal summer precautions apply."
    },
    storm: {
      high: "Secure outdoor items and avoid travel if possible.",
      moderate: "Monitor weather updates closely.",
      low: "Be aware of changing conditions."
    }
  }
  
  return advice[riskType as keyof typeof advice]?.[level as keyof (typeof advice)[keyof typeof advice]] || "Follow local emergency guidelines."
}