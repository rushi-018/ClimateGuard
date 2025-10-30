# Voice Alert System - Quick Test Card

## 🚀 Quick Start (2 minutes)

1. **Start dev server**

   ```bash
   cd d:\Engineering\Projects\indradhanu
   npm run dev
   ```

2. **Open dashboard**

   ```
   http://localhost:3000/dashboard
   ```

3. **Enable voice alerts**

   - Look for gear icon ⚙️ (bottom-right corner)
   - Toggle "Enable Voice Alerts" to ON
   - Click "Save Settings"

4. **Wait 2 minutes**
   - System checks for critical alerts
   - If found, banner appears + voice announces
   - If none, nothing happens (expected!)

---

## ✅ Quick Validation Checklist

### Phase 1: No Auto-Play ✅

- [ ] Open dashboard → NO voice plays automatically
- [ ] Refresh page → Still no auto-play
- [ ] Switch tabs → No voice when returning

### Phase 2: Enable System ✅

- [ ] Click gear icon ⚙️
- [ ] Toggle "Enable Voice Alerts" ON
- [ ] Settings save successfully
- [ ] Refresh → Settings persist

### Phase 3: Wait for Alert ⏱️

- [ ] Wait 2 minutes (check console logs)
- [ ] If critical alert exists:
  - [ ] Banner slides in from top
  - [ ] Voice announces alert
  - [ ] Controls visible (pause, skip, stop)
- [ ] If no alerts:
  - [ ] Nothing happens (correct!)
  - [ ] Check console: "No critical alerts found"

### Phase 4: Test Controls 🎛️

- [ ] **Pause**: Voice pauses mid-sentence
- [ ] **Resume**: Voice continues from pause point
- [ ] **Skip**: Jumps to next alert (if queued)
- [ ] **Stop**: Stops voice + hides banner
- [ ] **Mute 15m**: No announcements for 15 minutes
- [ ] **Mute 1h**: No announcements for 1 hour

### Phase 5: Test Deduplication 🚫

- [ ] Note current alert details
- [ ] Wait for next check (2 min)
- [ ] Same alert does NOT repeat
- [ ] Check History panel → Only 1 entry

---

## 🧪 Test Scenarios

### Scenario A: Extreme Heat (Phoenix, AZ) 🌡️

**When**: Summer months (June-August)
**Expected**: Extreme heat warning (≥105°F)

1. Select "Phoenix, AZ" from location dropdown
2. Enable voice alerts
3. Wait 2 minutes
4. **Expected**: "Extreme Heatwave" alert announces
5. **Banner shows**: Temperature, safety advice

### Scenario B: Active Wildfire (California) 🔥

**When**: Any time (check NASA EONET first)
**Expected**: Disaster alert if within 200 miles

1. Visit: https://eonet.gsfc.nasa.gov/api/v3/events
2. Find active wildfire location
3. Select nearby city in dashboard
4. Enable voice alerts
5. Wait 2 minutes
6. **Expected**: Wildfire disaster alert
7. **Banner shows**: Distance, safety instructions

### Scenario C: High Risk Score 📊

**When**: Any location with ≥50% risk
**Expected**: Risk prediction alert

1. Select any location
2. Enable voice alerts
3. Wait 2 minutes
4. If risk ≥ 50%:
   - **Expected**: Risk type alert (flood, drought, etc.)
   - **Banner shows**: Risk percentage, recommendations

### Scenario D: Poor Air Quality 💨

**When**: Check OpenAQ for current AQI ≥101
**Expected**: Air quality health alert

1. Visit: https://api.openaq.org/v2/latest?limit=100
2. Find location with AQI ≥101 (PM2.5 > 35.5)
3. Select that location in dashboard
4. Enable voice alerts
5. Wait 2 minutes
6. **Expected**: Air quality health alert
7. **Banner shows**: AQI level, health advice

---

## 🔍 Debugging Tools

### Console Commands

**Check settings:**

```javascript
JSON.parse(localStorage.getItem("voiceAlertSettings"));
```

**Check history:**

```javascript
JSON.parse(localStorage.getItem("voiceAlertHistory"));
```

**Check last announcement:**

```javascript
localStorage.getItem("lastVoiceAnnouncement");
```

**Clear everything:**

```javascript
localStorage.removeItem("voiceAlertSettings");
localStorage.removeItem("voiceAlertHistory");
localStorage.removeItem("lastVoiceAnnouncement");
```

**Test speech synthesis:**

```javascript
window.speechSynthesis.speak(new SpeechSynthesisUtterance("Test alert"));
```

### Network Tab (DevTools F12)

**Check API calls:**

1. Open DevTools → Network tab
2. Wait for 2-minute check
3. Should see requests to:

   - `api.open-meteo.com/v1/forecast`
   - `eonet.gsfc.nasa.gov/api/v3/events`
   - `api.openaq.org/v2/latest`
   - `localhost:3000/api/predict`

4. Check responses:
   - All should return 200 OK
   - Or 404 if no data (expected for some)

---

## ❌ Common Issues & Fixes

### Issue: No alerts ever announce

**Cause**: Settings too strict or no critical conditions exist

**Fix**:

1. Open settings
2. Change "Minimum Severity" to "All Severities"
3. Try different location (Phoenix, AZ for heat)
4. Check console for API errors

### Issue: Voice doesn't play

**Cause**: Browser requires user interaction first

**Fix**:

1. Click anywhere on page
2. Or click a button in dashboard
3. Then try enabling alerts

### Issue: Alerts repeat too often

**Cause**: Deduplication not working

**Fix**:

1. Check console for fingerprint logs
2. Verify localStorage history:
   ```javascript
   JSON.parse(localStorage.getItem("voiceAlertHistory"));
   ```
3. If empty, there's a bug (report it)
4. If full, check timestamps (should be >2 hours apart)

### Issue: No API data

**Cause**: Network issue or API down

**Fix**:

1. Check internet connection
2. Open Network tab → Check responses
3. Try different location
4. Wait 2 min and retry

### Issue: Settings don't save

**Cause**: localStorage disabled (private browsing)

**Fix**:

1. Use regular browser window (not incognito)
2. Check browser localStorage settings
3. Try different browser (Chrome, Edge work best)

---

## 📊 Expected Results Summary

| Test                 | Expected Behavior             | Time Required |
| -------------------- | ----------------------------- | ------------- |
| Auto-play disabled   | No voice on page load         | Immediate     |
| Enable system        | Settings save & persist       | Immediate     |
| First alert check    | Console log "Checking..."     | 2 minutes     |
| Critical alert found | Banner + voice announce       | 2 minutes     |
| No critical alerts   | Nothing happens               | 2 minutes     |
| Pause control        | Voice pauses mid-sentence     | Immediate     |
| Skip control         | Jumps to next alert           | Immediate     |
| Stop control         | Voice stops, banner hides     | Immediate     |
| Mute 15m             | No alerts for 15 minutes      | 15 minutes    |
| Deduplication        | Same alert not repeated       | 2+ hours      |
| Rate limiting        | ≥2 min between any alerts     | 2+ minutes    |
| Priority queue       | Extreme first, High second    | Immediate     |
| Settings persist     | After page refresh            | Immediate     |
| History tracking     | Last 20 shown in panel        | Ongoing       |
| Visual indicators    | Location, queue count, status | Immediate     |

---

## 🎯 Success Criteria

### ✅ Must Have (Critical)

- [ ] No auto-play on page load
- [ ] Real data from at least 1 API
- [ ] Voice alerts can be enabled/disabled
- [ ] Deduplication prevents repeats
- [ ] Rate limiting works (≥2 min between)
- [ ] Visual banner shows during announcement
- [ ] Pause/Stop controls work

### ✅ Should Have (Important)

- [ ] All 4 APIs return data
- [ ] Priority queue sorts correctly
- [ ] Settings persist after refresh
- [ ] History panel shows last 20
- [ ] Mute functionality works
- [ ] Skip to next alert works

### ✅ Nice to Have (Optional)

- [ ] Smooth animations
- [ ] Responsive on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

---

## 📝 Testing Notes Template

**Date**: ********\_********  
**Tester**: ********\_********  
**Browser**: ********\_********  
**Location Tested**: ********\_********

### Results:

**Auto-play disabled?** ☐ Pass ☐ Fail  
**Notes**: ****************\_\_\_****************

**System enabled successfully?** ☐ Pass ☐ Fail  
**Notes**: ****************\_\_\_****************

**Alert announced?** ☐ Pass ☐ Fail  
**Notes**: ****************\_\_\_****************

**Controls worked?** ☐ Pass ☐ Fail  
**Notes**: ****************\_\_\_****************

**Deduplication worked?** ☐ Pass ☐ Fail  
**Notes**: ****************\_\_\_****************

**Rate limiting worked?** ☐ Pass ☐ Fail  
**Notes**: ****************\_\_\_****************

**Settings persisted?** ☐ Pass ☐ Fail  
**Notes**: ****************\_\_\_****************

### Overall Assessment:

☐ Ready for production  
☐ Needs minor fixes  
☐ Needs major fixes

### Issues Found:

1. ***
2. ***
3. ***

### Recommendations:

---

---

---

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] All 10 test cases passed
- [ ] No TypeScript errors
- [ ] No console errors in production build
- [ ] API keys secured (if any added later)
- [ ] Performance tested (CPU, memory, battery)
- [ ] Tested on Chrome, Firefox, Safari, Edge
- [ ] Tested on mobile devices
- [ ] Documentation complete
- [ ] User guide created
- [ ] Team trained on new system

---

## 📞 Support

### If You Find Bugs:

1. Check console for errors
2. Note exact steps to reproduce
3. Check localStorage values
4. Test in different browser
5. Report with all details above

### For Questions:

- Check `INTELLIGENT_VOICE_ALERTS.md` for full docs
- Check `VOICE_ALERT_FLOW.md` for architecture
- Check code comments in source files

---

**Quick Test Status**: ☐ Not Started ☐ In Progress ☐ Complete

**Last Updated**: January 27, 2025
