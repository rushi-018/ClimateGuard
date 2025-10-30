"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Zap, Loader2, Bell, AlertTriangle, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useVoiceAlerts, useGlobalAlerts, useAlertSettings } from "@/hooks/use-alerts"
import { getClimateResponse, type LLMMessage } from "@/lib/llm-service"
import { getCachedClimateContext } from "@/lib/climate-context"

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

// SpeechRecognition types are declared in types/speech.d.ts

interface VoiceQAProps {
  className?: string
  location?: {
    name: string
    lat: number
    lon: number
    timezone?: string
  }
  getRisksData?: () => any[]
  getAlertsData?: () => any[]
  getForecastData?: () => any[]
}

interface QASession {
  id: string
  question: string
  answer: string
  timestamp: Date
  confidence: number
}

export function VoiceQA({ className, location, getRisksData, getAlertsData, getForecastData }: VoiceQAProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentText, setCurrentText] = useState("")
  const [sessions, setSessions] = useState<QASession[]>([])
  const [isSupported, setIsSupported] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<LLMMessage[]>([])

  // Default location if not provided
  const defaultLocation = {
    name: "New York City",
    lat: 40.7128,
    lon: -74.006,
    timezone: "America/New_York"
  }
  const currentLocation = location || defaultLocation

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

        setRecognition(recognitionInstance as any)
        setSynthesis(speechSynthesis)
      }
    }
  }, [])

  // Voice alerts integration - DISABLED AUTO-PLAY
  // The new intelligent voice alert system (voice-alert-banner) handles all voice announcements
  // with real data, deduplication, and user controls. No need for auto-play here.
  // Keeping these hooks for potential manual control in the future.
  const { announceAlert, stopAnnouncements } = useVoiceAlerts()
  const { alerts, criticalAlerts, hasCriticalAlerts } = useGlobalAlerts()
  const { settings } = useAlertSettings()

  // DISABLED: Auto-announce removed to prevent repetitive alerts on page load
  // The VoiceAlertBanner component now handles all voice announcements intelligently
  // useEffect(() => {
  //   if (settings.voice && criticalAlerts.length > 0 && !isSpeaking && !isListening) {
  //     const veryHighCriticalAlerts = criticalAlerts.filter(alert => alert.severity === "critical")
  //     if (veryHighCriticalAlerts.length > 0) {
  //       const latestVeryHigh = veryHighCriticalAlerts[0]
  //       announceAlert(latestVeryHigh)
  //     }
  //   }
  // }, [criticalAlerts.length, settings.voice, isSpeaking, isListening, announceAlert, criticalAlerts])

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
      // Build climate context from current dashboard data
      const context = await getCachedClimateContext(
        currentLocation,
        getRisksData,
        getAlertsData,
        getForecastData
      )

      // Get LLM response with conversation history
      const answer = await getClimateResponse(question, context, conversationHistory)

      // Update conversation history (keep last 6 messages = 3 exchanges)
      setConversationHistory(prev => [
        ...prev.slice(-4), // Keep last 2 exchanges
        { role: "user", content: question },
        { role: "assistant", content: answer }
      ])

      const session: QASession = {
        id: Date.now().toString(),
        question,
        answer: answer,
        timestamp: new Date(),
        confidence: 0.9, // High confidence with LLM
      }

      setSessions(prev => [session, ...prev.slice(0, 4)]) // Keep last 5 sessions
      speakAnswer(answer)
    } catch (error) {
      console.error('Failed to process question:', error)
      const errorMessage = "I apologize, but I'm having trouble processing your question right now. Please try again or check the dashboard for climate information."
      setCurrentText(errorMessage)
      speakAnswer(errorMessage)
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Voice Climate Assistant
                {hasCriticalAlerts && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Critical Alerts
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Voice-powered climate risk Q&A system {settings.voice && "• Voice alerts enabled"}
              </CardDescription>
            </div>
            {alerts.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant={hasCriticalAlerts ? "destructive" : "secondary"} className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  {alerts.length}
                </Badge>
              </div>
            )}
          </div>
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
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered with Real Data
            </Badge>
          </CardTitle>
          <CardDescription>
            Ask about climate risks for {currentLocation.name} using voice or text • Powered by Groq AI
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
                <p className="text-sm">Try asking: "What's the climate risk in {currentLocation.name}?"</p>
              </div>
            )}
          </div>

          {/* Example Questions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Example Questions</h4>
            <div className="flex flex-wrap gap-2">
              {[
                `What are the risks in ${currentLocation.name}?`,
                "Should I be concerned about the heat?",
                "What's the weather forecast?",
                "Any critical alerts I should know about?"
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