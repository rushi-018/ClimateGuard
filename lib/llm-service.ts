import Groq from "groq-sdk";

// Initialize Groq client with API key from environment
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export interface ClimateContext {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  currentRisks: Array<{
    type: string;
    severity: string;
    level: number;
  }>;
  alerts: Array<{
    title: string;
    severity: string;
    region: string;
  }>;
  weather: {
    temperature?: number;
    conditions?: string;
    humidity?: number;
  };
  forecast: Array<{
    date: string;
    riskLevel: string;
    trends: string[];
  }>;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are an expert climate intelligence assistant integrated into Indradhanu, a real-time climate risk monitoring platform. Your role is to provide accurate, actionable climate advice based on real-time data.

Key Capabilities:
- Analyze location-specific climate risks (drought, flood, heatwave, wildfire, storms)
- Provide personalized safety recommendations
- Explain current weather patterns and future trends
- Offer preparedness advice for climate events
- Answer questions about specific risks and their severity

Response Guidelines:
- Be concise but informative (2-3 sentences for voice)
- Use data from the provided context (location, risks, alerts, weather, forecast)
- Prioritize safety and actionable advice
- Speak naturally as if in a voice conversation
- When severity is high (>70%), emphasize urgency
- Reference specific numbers and locations from context
- If asked about data you don't have, acknowledge limitations

Tone: Professional, helpful, reassuring but realistic about risks.`;

/**
 * Get LLM response from Groq with climate context
 * @param question User's question
 * @param context Climate data context
 * @param conversationHistory Previous messages for context
 * @returns AI response string
 */
export async function getClimateResponse(
  question: string,
  context: ClimateContext,
  conversationHistory: LLMMessage[] = []
): Promise<string> {
  try {
    // Build context string from real data
    const contextString = buildContextString(context);

    // Prepare messages with system prompt, context, history, and user question
    const messages: LLMMessage[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "system",
        content: `Current Climate Data Context:\n${contextString}`,
      },
      ...conversationHistory,
      {
        role: "user",
        content: question,
      },
    ];

    // Call Groq API with fast model for voice interaction
    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: process.env.NEXT_PUBLIC_GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.7, // Balanced creativity/consistency
      max_tokens: 200, // Keep responses concise for voice
      top_p: 0.9,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response from LLM");
    }

    return response.trim();
  } catch (error) {
    console.error("Groq API error:", error);

    // Fallback to rule-based response if LLM fails
    return getFallbackResponse(question, context);
  }
}

/**
 * Build context string from climate data
 */
function buildContextString(context: ClimateContext): string {
  const lines: string[] = [];

  // Location
  lines.push(
    `Location: ${context.location.name} (${context.location.lat}, ${context.location.lon})`
  );

  // Current Risks
  if (context.currentRisks.length > 0) {
    lines.push("\nCurrent Risks:");
    context.currentRisks.forEach((risk) => {
      lines.push(`  - ${risk.type}: ${risk.severity} (${risk.level}%)`);
    });
  }

  // Active Alerts
  if (context.alerts.length > 0) {
    lines.push("\nActive Alerts:");
    context.alerts.slice(0, 3).forEach((alert) => {
      lines.push(`  - ${alert.title} (${alert.severity}) in ${alert.region}`);
    });
  }

  // Weather
  if (context.weather.temperature !== undefined) {
    lines.push("\nCurrent Weather:");
    lines.push(`  - Temperature: ${context.weather.temperature}°F`);
    if (context.weather.conditions) {
      lines.push(`  - Conditions: ${context.weather.conditions}`);
    }
    if (context.weather.humidity !== undefined) {
      lines.push(`  - Humidity: ${context.weather.humidity}%`);
    }
  }

  // Forecast
  if (context.forecast.length > 0) {
    lines.push("\n7-Day Forecast:");
    context.forecast.slice(0, 3).forEach((day) => {
      lines.push(`  - ${day.date}: ${day.riskLevel} risk`);
      if (day.trends.length > 0) {
        lines.push(`    Trends: ${day.trends.join(", ")}`);
      }
    });
  }

  return lines.join("\n");
}

/**
 * Fallback to rule-based response if LLM fails
 */
function getFallbackResponse(
  question: string,
  context: ClimateContext
): string {
  const q = question.toLowerCase();
  const locationName = context.location.name;

  // Risk-specific responses
  if (q.includes("drought")) {
    const droughtRisk = context.currentRisks.find((r) =>
      r.type.toLowerCase().includes("drought")
    );
    if (droughtRisk) {
      return `${locationName} currently has a ${droughtRisk.severity.toLowerCase()} drought risk at ${
        droughtRisk.level
      }%. Monitor water usage and follow local conservation guidelines.`;
    }
    return `Drought risk information for ${locationName} is currently being updated. Please check the dashboard for the latest data.`;
  }

  if (q.includes("flood")) {
    const floodRisk = context.currentRisks.find((r) =>
      r.type.toLowerCase().includes("flood")
    );
    if (floodRisk) {
      return `${locationName} has a ${floodRisk.severity.toLowerCase()} flood risk at ${
        floodRisk.level
      }%. Stay alert for heavy rainfall and avoid low-lying areas.`;
    }
    return `Flood risk for ${locationName} is minimal. Continue monitoring weather updates for changes.`;
  }

  if (q.includes("heat") || q.includes("temperature")) {
    if (context.weather.temperature !== undefined) {
      return `Current temperature in ${locationName} is ${
        context.weather.temperature
      }°F. ${
        context.weather.temperature > 90
          ? "Stay hydrated and avoid prolonged sun exposure during peak hours."
          : "Conditions are moderate. Normal precautions apply."
      }`;
    }
  }

  if (q.includes("safe") || q.includes("safety")) {
    const highRisks = context.currentRisks.filter((r) => r.level > 70);
    if (highRisks.length > 0) {
      return `${locationName} has ${
        highRisks.length
      } high-severity risk(s): ${highRisks
        .map((r) => r.type)
        .join(", ")}. Follow local emergency guidelines and stay informed.`;
    }
    return `${locationName} has no high-severity risks at this time. Continue monitoring for updates.`;
  }

  if (q.includes("forecast") || q.includes("prediction")) {
    if (context.forecast.length > 0) {
      return `The 7-day forecast for ${locationName} shows ${context.forecast[0].riskLevel} risk trends. Check the dashboard for detailed predictions.`;
    }
  }

  // Default response
  return `I'm here to help with climate information for ${locationName}. You can ask about specific risks like drought, floods, heat, or check current safety conditions and forecasts.`;
}

/**
 * Streaming version for future implementation (optional)
 */
export async function* streamClimateResponse(
  question: string,
  context: ClimateContext,
  conversationHistory: LLMMessage[] = []
): AsyncGenerator<string, void, unknown> {
  try {
    const contextString = buildContextString(context);

    const messages: LLMMessage[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "system",
        content: `Current Climate Data Context:\n${contextString}`,
      },
      ...conversationHistory,
      {
        role: "user",
        content: question,
      },
    ];

    const stream = await groq.chat.completions.create({
      messages: messages as any,
      model: process.env.NEXT_PUBLIC_GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 200,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("Groq streaming error:", error);
    yield getFallbackResponse(question, context);
  }
}
