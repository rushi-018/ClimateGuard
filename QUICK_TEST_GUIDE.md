# Quick Test Guide for LLM Voice Assistant 🎤

## Access the Feature

1. Open: http://localhost:3000/dashboard
2. Click on **"Alerts"** tab
3. Scroll down to **"AI Voice Assistant"** card

## Test Questions to Try

### Quick Wins (Test These First!)

```
"What are the risks here?"
"What's the weather like?"
"Should I be concerned about the heat?"
"Is it safe to go outside?"
```

### Location-Specific Tests

1. **Switch to Phoenix** (using location selector at top)
   - Ask: "What are the risks in Phoenix?"
   - Expected: Mentions 95% drought, 85% heatwave
2. **Switch to Miami**

   - Ask: "What are the risks in Miami?"
   - Expected: Mentions 88% flood, 82% storms

3. **Switch to London**
   - Ask: "What's the climate situation here?"
   - Expected: Different risk profile

### Context Memory Test

1. Ask: "What's the drought risk?"
2. Wait for answer
3. Ask: "What should I do about it?" (No "drought" mentioned!)
4. LLM should remember you're asking about drought

### Real Data Verification

- Ask: "What's the current temperature?"
- Should return **actual temperature** from Open-Meteo API
- Should mention humidity and conditions (Clear sky, Partly cloudy, etc.)

### Forecast Test

- Ask: "What's the forecast for this week?"
- Should mention trends and risk levels

## How to Use

### Voice Mode:

1. Click the **microphone button** (large circular button)
2. Speak your question clearly
3. Wait for processing (blue "Processing..." indicator)
4. Listen to AI response (auto-spoken)

### Text Mode:

1. Type question in text box
2. Press **Enter** or click **"Ask"** button
3. Wait for processing
4. Listen to or read response

### Stop Speaking:

- Click **"Stop"** button (appears when AI is speaking)

## What to Look For

### ✅ Good Signs:

- Response mentions **specific location name**
- Response includes **real numbers** (temperatures, percentages)
- Response is **concise** (2-3 sentences)
- Response is **actionable** ("stay hydrated", "conserve water")
- Response references **multiple data points** (temp + humidity + risk)
- **Conversation context** works (follow-up questions)

### ⚠️ If Something's Wrong:

- **No response**: Check browser console (F12) for errors
- **Generic response**: LLM might have failed, using fallback
- **Wrong location data**: Verify location selector is updated
- **Slow response**: Normal, Groq usually takes 100-500ms

## Example Conversation

**You**: "What are the risks in Phoenix?"

**AI**: "Phoenix currently faces a critical drought situation at 95%, which is extremely concerning. With temperatures at 105°F and only 18% humidity, you should immediately conserve water, follow all local water restrictions, and limit outdoor activities during peak heat hours. The 7-day forecast shows continued high risk with increasing temperatures."

**You**: "How serious is that?"

**AI**: "A 95% drought risk is extremely serious - it's at critical level. This means severe water shortages, increased wildfire danger, and health risks from extreme heat. You need to take immediate precautions: avoid outdoor activities during 10am-4pm, stay hydrated with at least 8 glasses of water daily, and follow all emergency water conservation mandates."

**You**: "What about tomorrow?"

**AI**: "Based on the forecast, tomorrow will continue the high risk trend with similar or slightly increasing temperatures. The drought conditions are expected to persist through the week. Plan indoor activities, ensure you have adequate water supplies, and monitor local emergency alerts closely."

## Advanced Testing

### Test Different Risk Types:

- Phoenix: Drought + Heatwave
- Miami: Flood + Storms
- Tokyo: General risks
- Sydney: Southern hemisphere patterns

### Test Edge Cases:

- Vague questions: "How's it looking?"
- Multiple risks: "Tell me about floods and heat"
- Safety: "Should my kids go to school?"
- Timing: "When will it get better?"

## Troubleshooting

### If voice isn't working:

- Check microphone permissions in browser
- Try Chrome, Edge, or Safari (best support)
- Use text mode as alternative

### If LLM gives generic responses:

- Check `.env.local` has correct API key
- Check browser console for API errors
- Groq might be rate-limited (wait 1 minute)

### If location data seems wrong:

- Location selector at top should match
- Try switching location and asking again
- Weather data fetched directly from Open-Meteo

## What's Real vs Mock?

### Real Data (Live APIs):

- ✅ Current temperature
- ✅ Current humidity
- ✅ Weather conditions
- ✅ Location coordinates
- ✅ LLM intelligence

### Mock Data (For Now):

- ⚠️ Risk percentages (from RiskCards)
- ⚠️ Active alerts (from RealClimateAlerts)
- ⚠️ Forecast data (from RiskForecast)

**Note**: These will be real once we connect component data. Currently context builder generates realistic mock data based on location.

## Success Criteria

The integration is successful if:

1. ✅ You can ask questions via voice or text
2. ✅ AI responds with location-specific information
3. ✅ AI mentions real temperature from API
4. ✅ AI references risk percentages (95%, 85%, etc.)
5. ✅ AI gives actionable safety advice
6. ✅ Responses are natural and conversational
7. ✅ Follow-up questions work (context memory)
8. ✅ Different locations give different responses

---

**Ready to test?** Just head to http://localhost:3000/dashboard and try it out! 🚀

Questions? Check `LLM_INTEGRATION_COMPLETE.md` for full technical details.
