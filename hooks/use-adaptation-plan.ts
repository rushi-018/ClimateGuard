/**
 * React Hook for Climate Adaptation Plan Management
 * Handles state, persistence, and updates for user's adaptation journey
 */

import { useState, useEffect, useCallback } from "react";
import {
  generateAdaptationPlan,
  completeAction,
  getActionsByCategory,
  getCompletedImpact,
  type UserProfile,
  type AdaptationPlan,
  type AdaptationAction,
} from "@/lib/adaptation-advisor";

const STORAGE_KEY = "climateGuardAdaptationPlan";
const PROFILE_KEY = "climateGuardUserProfile";

export function useAdaptationPlan(location?: {
  city: string;
  lat: number;
  lon: number;
}) {
  const [plan, setPlan] = useState<AdaptationPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // =========================================================================
  // Load from localStorage on mount
  // =========================================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // Load saved profile
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setHasCompletedOnboarding(true);
      }

      // Load saved plan
      const savedPlan = localStorage.getItem(STORAGE_KEY);
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        // Convert date strings back to Date objects
        parsedPlan.generatedAt = new Date(parsedPlan.generatedAt);
        parsedPlan.lastUpdated = new Date(parsedPlan.lastUpdated);
        parsedPlan.actions = parsedPlan.actions.map((action: any) => ({
          ...action,
          completedAt: action.completedAt ? new Date(action.completedAt) : undefined,
        }));
        setPlan(parsedPlan);
      }
    } catch (err) {
      console.error("Error loading adaptation plan from storage:", err);
      setError("Failed to load saved plan");
    }
  }, []);

  // =========================================================================
  // Save to localStorage whenever plan changes
  // =========================================================================

  useEffect(() => {
    if (typeof window === "undefined" || !plan) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch (err) {
      console.error("Error saving adaptation plan:", err);
    }
  }, [plan]);

  useEffect(() => {
    if (typeof window === "undefined" || !profile) return;

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.error("Error saving user profile:", err);
    }
  }, [profile]);

  // =========================================================================
  // Generate new plan
  // =========================================================================

  const createPlan = useCallback(
    async (userProfile: UserProfile) => {
      setIsGenerating(true);
      setError(null);

      try {
        // If location provided, use it; otherwise use profile location
        const profileWithLocation = location
          ? { ...userProfile, location }
          : userProfile;

        const newPlan = await generateAdaptationPlan(profileWithLocation);
        setPlan(newPlan);
        setProfile(profileWithLocation);
        setHasCompletedOnboarding(true);
        return newPlan;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate plan";
        setError(message);
        console.error("Error generating adaptation plan:", err);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [location]
  );

  // =========================================================================
  // Mark action as complete
  // =========================================================================

  const markActionComplete = useCallback(
    (actionId: string) => {
      if (!plan) return;

      const updatedPlan = completeAction(plan, actionId);
      setPlan(updatedPlan);

      // Track completion in analytics (if you have analytics)
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "action_completed", {
          action_id: actionId,
          action_title:
            plan.actions.find((a) => a.id === actionId)?.title || "Unknown",
        });
      }
    },
    [plan]
  );

  // =========================================================================
  // Uncomplete action (undo)
  // =========================================================================

  const markActionIncomplete = useCallback(
    (actionId: string) => {
      if (!plan) return;

      const updatedActions = plan.actions.map((action) =>
        action.id === actionId
          ? { ...action, completed: false, completedAt: undefined }
          : action
      );

      const completedCount = updatedActions.filter((a) => a.completed).length;

      const updatedPlan: AdaptationPlan = {
        ...plan,
        actions: updatedActions,
        lastUpdated: new Date(),
        progress: {
          completedActions: completedCount,
          totalActions: plan.actions.length,
          percentComplete: Math.round((completedCount / plan.actions.length) * 100),
        },
      };

      setPlan(updatedPlan);
    },
    [plan]
  );

  // =========================================================================
  // Get actions by category
  // =========================================================================

  const getUrgentActions = useCallback(() => {
    if (!plan) return [];
    return getActionsByCategory(plan, "urgent");
  }, [plan]);

  const getImportantActions = useCallback(() => {
    if (!plan) return [];
    return getActionsByCategory(plan, "important");
  }, [plan]);

  const getLongTermActions = useCallback(() => {
    if (!plan) return [];
    return getActionsByCategory(plan, "long-term");
  }, [plan]);

  // =========================================================================
  // Get impact metrics
  // =========================================================================

  const getTotalImpact = useCallback(() => {
    if (!plan) {
      return {
        waterSaved: 0,
        energySaved: 0,
        co2Reduced: 0,
        moneySaved: 0,
        resilienceScore: 0,
      };
    }
    return plan.totalImpact;
  }, [plan]);

  const getAchievedImpact = useCallback(() => {
    if (!plan) {
      return {
        waterSaved: 0,
        energySaved: 0,
        co2Reduced: 0,
        moneySaved: 0,
        resilienceScore: 0,
      };
    }
    return getCompletedImpact(plan);
  }, [plan]);

  // =========================================================================
  // Get next recommended action
  // =========================================================================

  const getNextAction = useCallback((): AdaptationAction | null => {
    if (!plan) return null;

    // Find highest priority incomplete action
    const incomplete = plan.actions
      .filter((action) => !action.completed)
      .sort((a, b) => {
        // Sort by category priority first, then by action priority
        const categoryWeight = {
          urgent: 1000,
          important: 100,
          "long-term": 10,
        };
        const aWeight = categoryWeight[a.category] + a.priority;
        const bWeight = categoryWeight[b.category] + b.priority;
        return bWeight - aWeight;
      });

    return incomplete[0] || null;
  }, [plan]);

  // =========================================================================
  // Reset/clear plan
  // =========================================================================

  const resetPlan = useCallback(() => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setPlan(null);
    setProfile(null);
    setHasCompletedOnboarding(false);
    setError(null);
  }, []);

  // =========================================================================
  // Regenerate plan (keep profile, generate new actions)
  // =========================================================================

  const regeneratePlan = useCallback(async () => {
    if (!profile) {
      setError("No profile found. Please complete onboarding first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const newPlan = await generateAdaptationPlan(profile);
      setPlan(newPlan);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to regenerate plan";
      setError(message);
      console.error("Error regenerating adaptation plan:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [profile]);

  // =========================================================================
  // Calculate streaks and achievements
  // =========================================================================

  const getStreak = useCallback((): number => {
    if (!plan) return 0;

    const completedActions = plan.actions
      .filter((a) => a.completed && a.completedAt)
      .sort((a, b) => {
        const aTime = a.completedAt?.getTime() || 0;
        const bTime = b.completedAt?.getTime() || 0;
        return bTime - aTime; // Most recent first
      });

    if (completedActions.length === 0) return 0;

    let streak = 0;
    let lastDate: Date | null = null;

    for (const action of completedActions) {
      if (!action.completedAt) continue;

      if (lastDate === null) {
        streak = 1;
        lastDate = action.completedAt;
      } else {
        const daysDiff = Math.floor(
          (lastDate.getTime() - action.completedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 7) {
          // Within a week counts as continuous
          streak++;
          lastDate = action.completedAt;
        } else {
          break; // Streak broken
        }
      }
    }

    return streak;
  }, [plan]);

  const getAchievements = useCallback((): string[] => {
    if (!plan) return [];

    const achievements: string[] = [];
    const progress = plan.progress.percentComplete;
    const completed = plan.progress.completedActions;
    const impact = getCompletedImpact(plan);

    if (completed >= 1) achievements.push("First Step Taken");
    if (completed >= 3) achievements.push("Getting Started");
    if (completed >= 5) achievements.push("Momentum Builder");
    if (progress >= 25) achievements.push("Quarter Way There");
    if (progress >= 50) achievements.push("Halfway Hero");
    if (progress >= 75) achievements.push("Almost There");
    if (progress >= 100) achievements.push("Climate Champion");

    if (impact.waterSaved >= 10000) achievements.push("Water Saver");
    if (impact.energySaved >= 5000) achievements.push("Energy Efficient");
    if (impact.co2Reduced >= 1000) achievements.push("Carbon Cutter");
    if (impact.moneySaved >= 500) achievements.push("Money Smart");

    const streak = getStreak();
    if (streak >= 3) achievements.push("On a Roll");
    if (streak >= 5) achievements.push("Consistency King");

    return achievements;
  }, [plan, getStreak]);

  // =========================================================================
  // Return hook interface
  // =========================================================================

  return {
    // State
    plan,
    profile,
    isGenerating,
    error,
    hasCompletedOnboarding,

    // Actions
    createPlan,
    markActionComplete,
    markActionIncomplete,
    resetPlan,
    regeneratePlan,

    // Getters
    getUrgentActions,
    getImportantActions,
    getLongTermActions,
    getTotalImpact,
    getAchievedImpact,
    getNextAction,
    getStreak,
    getAchievements,

    // Computed values
    progress: plan?.progress || { completedActions: 0, totalActions: 0, percentComplete: 0 },
    nextAction: getNextAction(),
    achievements: getAchievements(),
    streak: getStreak(),
  };
}
