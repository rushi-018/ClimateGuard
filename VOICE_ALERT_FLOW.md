# Voice Alert System - Visual Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER OPENS DASHBOARD                        │
│                    http://localhost:3000/dashboard                  │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌────────────────────────────────────────────────────────────────────┐
│                    VoiceAlertBanner Component                       │
│                    (Initially Hidden - No Banner)                   │
│                                                                      │
│  Default Settings (in localStorage):                                │
│  • enabled: false          ← MUST OPT-IN                           │
│  • minSeverity: 'Extreme'  ← Only most critical                    │
│  • checkInterval: 120000   ← Check every 2 minutes                 │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
         ┌─────────────────────────────────────────┐
         │   User clicks gear icon (⚙️)            │
         │   Enables "Voice Alerts"                │
         │   Saves Settings                        │
         └─────────────────────────────────────────┘
                                  │
                                  ↓
┌────────────────────────────────────────────────────────────────────┐
│                  BACKGROUND POLLING STARTS                          │
│                  (hooks/use-voice-alerts.ts)                        │
│                                                                      │
│  Every 2 minutes:                                                   │
│  1. Check if tab is visible                                         │
│  2. Check if enough time passed (2 min since last)                 │
│  3. Call voice-alert-system.fetchAllCriticalAlerts()               │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌────────────────────────────────────────────────────────────────────┐
│               FETCH FROM 4 REAL DATA SOURCES                        │
│               (lib/voice-alert-system.ts)                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  1. WEATHER ALERTS (Open-Meteo API)                          │ │
│  │     GET: api.open-meteo.com/v1/forecast                       │ │
│  │     • Extreme heat (≥105°F)                                   │ │
│  │     • Extreme cold (≤10°F)                                    │ │
│  │     • Heavy rain (≥0.5")                                      │ │
│  │     • High winds (≥40mph)                                     │ │
│  │     • Thunderstorms                                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  2. DISASTER ALERTS (NASA EONET API)                         │ │
│  │     GET: eonet.gsfc.nasa.gov/api/v3/events                   │ │
│  │     • Wildfires                                               │ │
│  │     • Floods                                                  │ │
│  │     • Earthquakes                                             │ │
│  │     • Volcanic eruptions                                      │ │
│  │     • Storms                                                  │ │
│  │     • Filter: Within 200 miles of location                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  3. RISK ALERTS (Internal ML API)                            │ │
│  │     POST: /api/predict                                        │ │
│  │     • Flood risk                                              │ │
│  │     • Drought risk                                            │ │
│  │     • Heatwave risk                                           │ │
│  │     • Wildfire risk                                           │ │
│  │     • Air quality risk                                        │ │
│  │     • Filter: Risk score ≥ 50%                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  4. AIR QUALITY ALERTS (OpenAQ API)                          │ │
│  │     GET: api.openaq.org/v2/latest                            │ │
│  │     • PM2.5 measurements                                      │ │
│  │     • Convert to AQI scale                                    │ │
│  │     • Filter: AQI ≥ 101 (Unhealthy)                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌────────────────────────────────────────────────────────────────────┐
│                    SMART FILTERING (7 CONDITIONS)                   │
│               For each alert, check ALL conditions:                 │
│                                                                      │
│  1. ✓ System enabled?            (user must enable)                │
│  2. ✓ Severity meets threshold?  (Extreme by default)              │
│  3. ✓ Not in history?            (not announced in last 2 hours)   │
│  4. ✓ Not muted?                 (user didn't mute recently)       │
│  5. ✓ Enough time since last?    (≥2 min since any announcement)   │
│  6. ✓ Enough time for same type? (≥2 hours for same alert)         │
│  7. ✓ Tab visible?               (not in background tab)            │
│                                                                      │
│  If ALL 7 pass → Add to queue                                      │
│  If ANY fail   → Discard alert                                      │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │   Any alerts pass?      │
                    └─────────────────────────┘
                             │         │
                      YES ───┘         └─── NO
                       │                      │
                       ↓                      ↓
      ┌──────────────────────────┐    ┌───────────────┐
      │   PRIORITY SCORING       │    │  NO ACTION    │
      │                          │    │  (silent)     │
      │  Rank by priority:       │    └───────────────┘
      │  • Extreme = 100 pts     │
      │  • Disaster+close = 80   │
      │  • Weather+immediate = 70│
      │  • Risk+high% = 60       │
      │  • Air quality = 50      │
      │                          │
      │  Sort queue high→low     │
      └──────────────────────────┘
                 │
                 ↓
      ┌──────────────────────────┐
      │   ADD TO QUEUE           │
      │   Update localStorage:   │
      │   • voiceAlertHistory    │
      │   • lastVoiceAnnouncement│
      └──────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────────────┐
│                   VISUAL BANNER APPEARS                             │
│                   (components/voice-alert-banner.tsx)               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  🚨 CRITICAL ALERT                                          │   │
│  │                                                              │   │
│  │  Extreme Heatwave in Phoenix, AZ                            │   │
│  │  Temperature forecast: 110°F                                │   │
│  │  Advice: Stay indoors, drink water, avoid outdoor activity  │   │
│  │                                                              │   │
│  │  [⏸️ Pause] [⏭️ Skip] [⏹️ Stop] [🔇 Mute 15m] [🔇 Mute 1h] │   │
│  │                                                              │   │
│  │  📍 Phoenix, AZ  |  📋 2 in queue  |  ⚙️ Settings           │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Animations (Framer Motion):                                        │
│  • Slide in from top                                                │
│  • Fade in/out                                                      │
│  • Pulse effect on critical severity                                │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌────────────────────────────────────────────────────────────────────┐
│                 WEB SPEECH API ANNOUNCEMENT                         │
│                 (window.speechSynthesis)                            │
│                                                                      │
│  Voice Settings:                                                    │
│  • Rate: 0.9 (slightly slower for clarity)                         │
│  • Pitch: 1.1 (higher for urgency on Extreme)                      │
│  • Volume: 0.8                                                      │
│                                                                      │
│  Text: "Critical alert for Phoenix, Arizona. Extreme Heatwave.     │
│         Temperature forecast 110 degrees Fahrenheit. Stay indoors,  │
│         drink water, avoid outdoor activity."                       │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │  User Interaction?      │
                    └─────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
      [⏸️ Pause]        [⏭️ Skip]         [⏹️ Stop]
           │                 │                 │
           ↓                 ↓                 ↓
    Pause speech      Stop current,     Stop all,
    (can resume)      play next         clear queue
           │                 │                 │
           └─────────────────┼─────────────────┘
                             │
                             ↓
                    ┌─────────────────────────┐
                    │  More in queue?         │
                    └─────────────────────────┐
                             │         │
                      YES ───┘         └─── NO
                       │                      │
                       ↓                      ↓
            ┌─────────────────────┐    ┌────────────────┐
            │  Wait 1 second      │    │  Hide banner   │
            │  Process next       │    │  Store history │
            │  in queue           │    └────────────────┘
            └─────────────────────┘           │
                     │                        │
                     └────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │  Return to polling      │
                    │  Wait 2 minutes         │
                    │  Check for new alerts   │
                    └─────────────────────────┘
                                  │
                                  │ (LOOP)
                                  ↓
                    ┌─────────────────────────┐
                    │  System continues       │
                    │  checking every 2 min   │
                    │  until disabled or      │
                    │  browser closed         │
                    └─────────────────────────┘
```

---

## State Transitions

### Initial State (Page Load)

```
┌─────────────────────────────────────┐
│  enabled: false                     │
│  currentAlert: null                 │
│  isAnnouncing: false                │
│  queuedAlerts: []                   │
│  bannerVisible: false               │
│  polling: false                     │
└─────────────────────────────────────┘
```

### After User Enables (First Interaction Required)

```
┌─────────────────────────────────────┐
│  enabled: true          ← Changed   │
│  currentAlert: null                 │
│  isAnnouncing: false                │
│  queuedAlerts: []                   │
│  bannerVisible: false               │
│  polling: true          ← Changed   │
│  hasUserInteracted: true ← Changed  │
└─────────────────────────────────────┘
```

### During Announcement

```
┌─────────────────────────────────────┐
│  enabled: true                      │
│  currentAlert: {...}    ← Populated │
│  isAnnouncing: true     ← Changed   │
│  queuedAlerts: [...]    ← May have  │
│  bannerVisible: true    ← Changed   │
│  polling: true                      │
│  utterance: SpeechSynthesisUtterance│
└─────────────────────────────────────┘
```

### After Mute (15 min)

```
┌─────────────────────────────────────┐
│  enabled: true                      │
│  currentAlert: null                 │
│  isAnnouncing: false                │
│  queuedAlerts: []       ← Cleared   │
│  bannerVisible: false               │
│  polling: true          ← Still on  │
│  muteUntil: Date+15min  ← Set       │
└─────────────────────────────────────┘
```

---

## Data Flow Example

### Scenario: Extreme Heat in Phoenix, AZ

```
1. User selects "Phoenix, AZ" in location selector
   └─→ location = { lat: 33.4484, lon: -112.0740, name: "Phoenix, AZ" }

2. Background polling triggers (every 2 min)
   └─→ fetchAllCriticalAlerts(location, settings)

3. Weather API call
   GET api.open-meteo.com/v1/forecast?latitude=33.4484&longitude=-112.0740
   Response:
   {
     current: { temperature_2m: 43.3 },  // 110°F in Celsius
     daily: { ... }
   }
   └─→ isWeatherAlertCritical() = true (≥105°F)
   └─→ Generate alert:
       {
         type: 'weather',
         severity: 'Extreme',
         title: 'Extreme Heatwave',
         message: 'Temperature forecast: 110°F',
         location: 'Phoenix, AZ',
         timestamp: 1706380800000,
         advice: 'Stay indoors, drink water, avoid outdoor activity',
         icon: '🌡️'
       }

4. Fingerprinting
   fingerprint = "weather-Phoenix,AZ-Extreme-20250127"
   └─→ Check localStorage history
   └─→ Not found in last 2 hours
   └─→ ✅ Pass deduplication check

5. Smart filtering (7 conditions)
   1. enabled = true                     ✅
   2. severity ('Extreme') ≥ minSeverity ('Extreme')  ✅
   3. Not in history (checked above)     ✅
   4. muteUntil = null (not muted)       ✅
   5. lastAnnouncement = 5 min ago (≥2 min)  ✅
   6. Same alert type last seen = never (≥2 hr)  ✅
   7. document.hidden = false (tab visible)  ✅
   └─→ ALL CONDITIONS PASS

6. Add to queue
   queuedAlerts = [
     {
       alert: {...},
       priority: 110  // Extreme (100) + immediate weather (10)
     }
   ]

7. Process queue
   └─→ currentAlert = queuedAlerts[0]
   └─→ isAnnouncing = true
   └─→ bannerVisible = true

8. Web Speech API
   utterance = new SpeechSynthesisUtterance(
     "Critical alert for Phoenix, Arizona. Extreme Heatwave. " +
     "Temperature forecast 110 degrees Fahrenheit. " +
     "Stay indoors, drink water, avoid outdoor activity."
   )
   utterance.rate = 0.9
   utterance.pitch = 1.1
   utterance.volume = 0.8
   speechSynthesis.speak(utterance)

9. Update localStorage
   voiceAlertHistory += [
     {
       fingerprint: "weather-Phoenix,AZ-Extreme-20250127",
       announcedAt: 1706380800000
     }
   ]
   lastVoiceAnnouncement = 1706380800000

10. Banner shows
    ┌────────────────────────────────────────────────────────┐
    │  🚨 CRITICAL ALERT                                      │
    │  Extreme Heatwave in Phoenix, AZ                        │
    │  Temperature forecast: 110°F                            │
    │  Advice: Stay indoors, drink water, avoid outdoor...   │
    │  [⏸️] [⏭️] [⏹️] [🔇 15m] [🔇 1h] [⚙️]                   │
    └────────────────────────────────────────────────────────┘

11. After announcement ends
    └─→ currentAlert = null
    └─→ isAnnouncing = false
    └─→ bannerVisible = false
    └─→ Return to polling (wait 2 min for next check)
```

---

## Error Handling

### API Failure Scenarios

```
┌─────────────────────────────────────────────────────────┐
│  Weather API Error (Open-Meteo)                         │
├─────────────────────────────────────────────────────────┤
│  1. Network timeout (>10s)                              │
│     → Log error to console                              │
│     → Return empty array []                             │
│     → Continue with other sources                       │
│                                                          │
│  2. Invalid response (404, 500)                         │
│     → Log error with status code                        │
│     → Return empty array []                             │
│     → Continue with other sources                       │
│                                                          │
│  3. CORS error                                          │
│     → Should not happen (API allows CORS)               │
│     → If occurs, return empty array []                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  NASA EONET API Error                                   │
├─────────────────────────────────────────────────────────┤
│  1. No events found                                     │
│     → Normal case, return empty array []                │
│     → Not an error                                      │
│                                                          │
│  2. API down (503)                                      │
│     → Log warning                                       │
│     → Return empty array []                             │
│     → Continue with other sources                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  OpenAQ API Error                                       │
├─────────────────────────────────────────────────────────┤
│  1. No data for location                                │
│     → Common for remote areas                           │
│     → Return empty array []                             │
│     → Not an error                                      │
│                                                          │
│  2. Rate limit exceeded (429)                           │
│     → Log warning                                       │
│     → Return empty array []                             │
│     → Retry on next poll (2 min later)                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Internal Risk API Error (/api/predict)                 │
├─────────────────────────────────────────────────────────┤
│  1. Server error (500)                                  │
│     → Log error with details                            │
│     → Return empty array []                             │
│     → May indicate backend issue                        │
│                                                          │
│  2. Invalid location data                               │
│     → Validate before calling                           │
│     → Return empty array []                             │
└─────────────────────────────────────────────────────────┘
```

### Speech Synthesis Errors

```
┌─────────────────────────────────────────────────────────┐
│  Browser Support Issues                                 │
├─────────────────────────────────────────────────────────┤
│  1. speechSynthesis not available                       │
│     → Check: if (!window.speechSynthesis) return        │
│     → Show visual-only banner                           │
│     → Log warning to console                            │
│                                                          │
│  2. No voices available                                 │
│     → Wait for voiceschanged event                      │
│     → Retry after 500ms                                 │
│     → Fallback to visual-only after 3 retries           │
│                                                          │
│  3. User gesture required                               │
│     → hasUserInteracted flag prevents this              │
│     → If occurs, show "Click to enable" prompt          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Speech Interruption                                    │
├─────────────────────────────────────────────────────────┤
│  1. User closes tab during announcement                 │
│     → Browser auto-stops speech                         │
│     → No action needed                                  │
│                                                          │
│  2. User switches tab                                   │
│     → document.hidden = true                            │
│     → Pause announcement                                │
│     → Resume when tab becomes visible                   │
│                                                          │
│  3. System volume muted                                 │
│     → Speech still "plays" (no audio)                   │
│     → Banner still shows text                           │
│     → User can read visually                            │
└─────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Memory Usage

```
Component                   Memory Impact
─────────────────────────────────────────────────────
localStorage History        ~5-20 KB (max 20 alerts)
Alert Queue                 ~1-5 KB (max 10 alerts)
Speech Utterance           ~2 KB per announcement
React State                ~10 KB total
API Response Cache         ~50-100 KB temporary
─────────────────────────────────────────────────────
TOTAL:                     ~70-140 KB
```

### CPU Usage

```
Activity                    CPU Impact
─────────────────────────────────────────────────────
Background Polling         ~0.1% (only during checks)
Speech Synthesis          ~1-3% (during announcement)
Banner Animations         ~0.5% (Framer Motion GPU)
API Calls                 ~0.2% per request
─────────────────────────────────────────────────────
AVERAGE:                  ~0.1% idle, ~2-4% active
```

### Network Usage

```
API                        Request Size    Response Size
────────────────────────────────────────────────────────────
Open-Meteo Weather        ~500 bytes      ~10-20 KB
NASA EONET                ~300 bytes      ~50-200 KB
OpenAQ                    ~400 bytes      ~5-10 KB
/api/predict              ~1 KB           ~2-5 KB
────────────────────────────────────────────────────────────
TOTAL per check:          ~2 KB           ~70-235 KB
Per hour (30 checks):     ~60 KB          ~2-7 MB
```

### Battery Impact (Mobile)

```
Scenario                   Battery Drain
─────────────────────────────────────────────────────
Idle (system disabled)     0% additional
Polling only (no alerts)   ~0.5% per hour
With announcements         ~1-2% per hour
Screen on + banner         ~2-3% per hour
```

---

## Security & Privacy

### Data Collection

```
✅ NO user data collected
✅ NO tracking or analytics
✅ NO cookies set
✅ NO server-side logging
✅ Only localStorage (client-side)
```

### API Calls

```
What is sent:
  • Latitude/Longitude only (from selected location)
  • No personal information
  • No device identifiers
  • No IP logging (by us)

What is NOT sent:
  • User name/email
  • Device info
  • Browser fingerprint
  • Usage patterns
```

### localStorage Data

```
Stored Locally (never leaves device):
  • voiceAlertSettings: User preferences
  • voiceAlertHistory: Alert fingerprints + timestamps
  • lastVoiceAnnouncement: Timestamp only

Can be cleared anytime:
  • Browser settings → Clear browsing data → localStorage
  • Or programmatically: localStorage.clear()
```

---

## Accessibility

### Screen Reader Support

- Banner content is readable by screen readers
- ARIA labels on all buttons
- Semantic HTML structure
- Focus management during announcements

### Keyboard Navigation

- `Tab`: Navigate between controls
- `Space`: Activate buttons (pause, skip, stop)
- `Escape`: Close settings dialog
- `Enter`: Confirm settings save

### Visual Accessibility

- High contrast colors for alerts
- Clear severity badges (Extreme, High, Medium, Low)
- Icons + text labels (not icon-only)
- Readable font sizes (16px minimum)

### Motion Accessibility

- Respects `prefers-reduced-motion`
- Animations can be disabled via browser settings
- No required animations (visual feedback only)

---

**End of Visual Flow Documentation**
