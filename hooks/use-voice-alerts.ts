/**
 * React Hook for Voice Alerts
 * Manages background polling and voice announcements
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchAllCriticalAlerts,
  prepareAnnouncement,
  getVoiceAlertSettings,
  saveVoiceAlertSettings,
  dismissAlert,
  cleanupAlertHistory,
  getAnnouncementHistory,
  type CombinedAlert,
  type VoiceAlertSettings,
} from "@/lib/voice-alert-system";

export interface VoiceAlertState {
  currentAlert: CombinedAlert | null;
  isAnnouncing: boolean;
  queuedAlerts: CombinedAlert[];
  settings: VoiceAlertSettings;
  history: ReturnType<typeof getAnnouncementHistory>;
}

export function useVoiceAlerts(location?: {
  name: string;
  lat: number;
  lon: number;
}) {
  const [state, setState] = useState<VoiceAlertState>({
    currentAlert: null,
    isAnnouncing: false,
    queuedAlerts: [],
    settings: getVoiceAlertSettings(),
    history: [],
  });

  const [userInteracted, setUserInteracted] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const lastCheckRef = useRef<number>(0);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Track user interaction (required before first voice alert)
  useEffect(() => {
    const handleInteraction = () => setUserInteracted(true);

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    window.addEventListener("scroll", handleInteraction, {
      once: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, []);

  // Check for critical alerts
  const checkForAlerts = useCallback(async () => {
    if (!location) return;
    if (!state.settings.enabled) return;
    if (!userInteracted) return; // Don't announce without user interaction
    if (document.hidden) return; // Don't announce when tab is not visible

    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckRef.current;

    // Respect check interval
    if (timeSinceLastCheck < state.settings.checkInterval) return;

    lastCheckRef.current = now;

    try {
      const criticalAlerts = await fetchAllCriticalAlerts(
        location.lat,
        location.lon,
        location.name
      );

      if (criticalAlerts.length > 0) {
        // Update queue with new alerts
        setState((prev) => ({
          ...prev,
          queuedAlerts: [...criticalAlerts, ...prev.queuedAlerts].slice(0, 10), // Max 10 in queue
        }));
      }
    } catch (error) {
      console.error("Error checking for alerts:", error);
    }
  }, [
    location,
    state.settings.enabled,
    state.settings.checkInterval,
    userInteracted,
  ]);

  // Process alert queue
  const processQueue = useCallback(() => {
    if (state.isAnnouncing) return; // Already announcing
    if (state.queuedAlerts.length === 0) return; // Nothing to announce
    if (!synthesisRef.current) return; // No speech synthesis
    if (document.hidden) return; // Don't announce in background

    const nextAlert = state.queuedAlerts[0];
    const { text, fingerprint } = prepareAnnouncement(nextAlert);

    // Update state
    setState((prev) => ({
      ...prev,
      currentAlert: nextAlert,
      isAnnouncing: true,
      queuedAlerts: prev.queuedAlerts.slice(1),
    }));

    // Create and speak utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    utterance.onend = () => {
      setState((prev) => ({
        ...prev,
        currentAlert: null,
        isAnnouncing: false,
        history: getAnnouncementHistory(),
      }));
    };

    utterance.onerror = (error) => {
      console.error("Speech synthesis error:", error);
      setState((prev) => ({
        ...prev,
        currentAlert: null,
        isAnnouncing: false,
      }));
    };

    synthesisRef.current.speak(utterance);
  }, [state.isAnnouncing, state.queuedAlerts]);

  // Stop current announcement
  const stopAnnouncement = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setState((prev) => ({
      ...prev,
      currentAlert: null,
      isAnnouncing: false,
    }));
  }, []);

  // Skip to next alert
  const skipToNext = useCallback(() => {
    stopAnnouncement();
    // processQueue will be called by useEffect
  }, [stopAnnouncement]);

  // Clear queue
  const clearQueue = useCallback(() => {
    stopAnnouncement();
    setState((prev) => ({
      ...prev,
      queuedAlerts: [],
    }));
  }, [stopAnnouncement]);

  // Mute for duration
  const muteFor = useCallback(
    (minutes: number) => {
      const muteUntil = Date.now() + minutes * 60 * 1000;
      const newSettings = { ...state.settings, muteUntil };
      saveVoiceAlertSettings(newSettings);
      setState((prev) => ({
        ...prev,
        settings: newSettings,
      }));
      stopAnnouncement();
      clearQueue();
    },
    [state.settings, stopAnnouncement, clearQueue]
  );

  // Update settings
  const updateSettings = useCallback(
    (updates: Partial<VoiceAlertSettings>) => {
      const newSettings = { ...state.settings, ...updates };
      saveVoiceAlertSettings(newSettings);
      setState((prev) => ({
        ...prev,
        settings: newSettings,
      }));
    },
    [state.settings]
  );

  // Dismiss alert
  const handleDismissAlert = useCallback((fingerprint: string) => {
    dismissAlert(fingerprint);
    setState((prev) => ({
      ...prev,
      history: getAnnouncementHistory(),
    }));
  }, []);

  // Start polling ONLY when explicitly enabled
  useEffect(() => {
    // Don't start polling if disabled
    if (!state.settings.enabled || !location) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Enabled and have location - start polling
    // Initial check after a small delay to ensure user interaction
    const initialCheckTimeout = setTimeout(() => {
      if (userInteracted) {
        checkForAlerts();
      }
    }, 3000);

    // Set up polling interval
    pollingIntervalRef.current = setInterval(
      checkForAlerts,
      state.settings.checkInterval
    );

    // Cleanup old history once per session
    cleanupAlertHistory();

    return () => {
      clearTimeout(initialCheckTimeout);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [
    state.settings.enabled,
    state.settings.checkInterval,
    location,
    userInteracted,
    checkForAlerts,
  ]);

  // Process queue when conditions are right
  useEffect(() => {
    if (!state.isAnnouncing && state.queuedAlerts.length > 0) {
      // Small delay to respect minimum interval between announcements
      const timer = setTimeout(processQueue, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.isAnnouncing, state.queuedAlerts.length, processQueue]);

  // Load history on mount
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      history: getAnnouncementHistory(),
    }));
  }, []);

  return {
    ...state,
    stopAnnouncement,
    skipToNext,
    clearQueue,
    muteFor,
    updateSettings,
    dismissAlert: handleDismissAlert,
    checkNow: checkForAlerts,
  };
}
