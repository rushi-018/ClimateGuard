/**
 * React Hooks for Action Recommendations
 * Provides easy access to personalized climate action recommendations and emergency plans
 */

import { useState, useEffect, useCallback } from "react";
import {
  actionRecommendation,
  ActionRecommendation,
  EmergencyPlan,
  PersonalizedRecommendations,
  ActionCategory,
} from "@/lib/action-recommendation";

/**
 * Hook for personalized action recommendations based on location and preferences
 */
export function usePersonalizedRecommendations(
  lat: number,
  lng: number,
  preferences: {
    budget?: string;
    timeAvailable?: string;
    expertise?: string;
    priorities?: string[];
  } = {}
) {
  const [data, setData] = useState<PersonalizedRecommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!lat || !lng) return;

    setLoading(true);
    setError(null);

    try {
      const recommendations =
        await actionRecommendation.getPersonalizedRecommendations(
          lat,
          lng,
          preferences
        );
      setData(recommendations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch recommendations"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, JSON.stringify(preferences)]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const refetch = useCallback(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    data,
    loading,
    error,
    refetch,
    // Convenience accessors
    immediate: data?.immediate || [],
    shortTerm: data?.shortTerm || [],
    longTerm: data?.longTerm || [],
    emergency: data?.emergency || [],
    profile: data?.profile || null,
    progress: data?.progress || { completed: [], inProgress: [], planned: [] },
  };
}

/**
 * Hook for managing action progress and completion tracking
 */
export function useActionProgress() {
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [inProgressActions, setInProgressActions] = useState<string[]>([]);
  const [plannedActions, setPlannedActions] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("climateguard-action-progress");
    if (stored) {
      try {
        const progress = JSON.parse(stored);
        setCompletedActions(progress.completed || []);
        setInProgressActions(progress.inProgress || []);
        setPlannedActions(progress.planned || []);
      } catch (error) {
        console.warn("Error loading action progress from storage:", error);
      }
    }
  }, []);

  // Save to localStorage whenever progress changes
  const saveProgress = useCallback(() => {
    const progress = {
      completed: completedActions,
      inProgress: inProgressActions,
      planned: plannedActions,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(
      "climateguard-action-progress",
      JSON.stringify(progress)
    );
  }, [completedActions, inProgressActions, plannedActions]);

  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  const markAsCompleted = useCallback((actionId: string) => {
    setCompletedActions((prev) => {
      if (prev.includes(actionId)) return prev;
      return [...prev, actionId];
    });
    setInProgressActions((prev) => prev.filter((id) => id !== actionId));
    setPlannedActions((prev) => prev.filter((id) => id !== actionId));
  }, []);

  const markAsInProgress = useCallback((actionId: string) => {
    setInProgressActions((prev) => {
      if (prev.includes(actionId)) return prev;
      return [...prev, actionId];
    });
    setPlannedActions((prev) => prev.filter((id) => id !== actionId));
  }, []);

  const markAsPlanned = useCallback((actionId: string) => {
    setPlannedActions((prev) => {
      if (prev.includes(actionId)) return prev;
      return [...prev, actionId];
    });
  }, []);

  const removeFromProgress = useCallback((actionId: string) => {
    setCompletedActions((prev) => prev.filter((id) => id !== actionId));
    setInProgressActions((prev) => prev.filter((id) => id !== actionId));
    setPlannedActions((prev) => prev.filter((id) => id !== actionId));
  }, []);

  const getActionStatus = useCallback(
    (
      actionId: string
    ): "completed" | "in-progress" | "planned" | "not-started" => {
      if (completedActions.includes(actionId)) return "completed";
      if (inProgressActions.includes(actionId)) return "in-progress";
      if (plannedActions.includes(actionId)) return "planned";
      return "not-started";
    },
    [completedActions, inProgressActions, plannedActions]
  );

  const getProgressStats = useCallback(() => {
    const total =
      completedActions.length +
      inProgressActions.length +
      plannedActions.length;
    return {
      completed: completedActions.length,
      inProgress: inProgressActions.length,
      planned: plannedActions.length,
      total,
      completionRate: total > 0 ? (completedActions.length / total) * 100 : 0,
    };
  }, [completedActions, inProgressActions, plannedActions]);

  return {
    completedActions,
    inProgressActions,
    plannedActions,
    markAsCompleted,
    markAsInProgress,
    markAsPlanned,
    removeFromProgress,
    getActionStatus,
    getProgressStats,
  };
}

/**
 * Hook for action categories and filtering
 */
export function useActionCategories() {
  const [categories, setCategories] = useState<ActionCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const actionCategories = actionRecommendation.getActionCategories();
        setCategories(actionCategories);
      } catch (error) {
        console.error("Error loading action categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const getCategoryById = useCallback(
    (id: string) => {
      return categories.find((cat) => cat.id === id) || null;
    },
    [categories]
  );

  const getRecommendationsByCategory = useCallback(
    async (categoryId: string) => {
      return await actionRecommendation.getRecommendationsByCategory(
        categoryId
      );
    },
    []
  );

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    getCategoryById,
    getRecommendationsByCategory,
  };
}

/**
 * Hook for emergency plans and preparedness
 */
export function useEmergencyPlans(lat?: number, lng?: number) {
  const [plans, setPlans] = useState<EmergencyPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmergencyPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, get basic emergency plans
      // In production, this would be filtered by location-specific risks
      if (lat && lng) {
        const recommendations =
          await actionRecommendation.getPersonalizedRecommendations(lat, lng);
        setPlans(recommendations.emergency);
      } else {
        // Fallback to basic plans
        setPlans([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch emergency plans"
      );
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchEmergencyPlans();
  }, [fetchEmergencyPlans]);

  const getPlanById = useCallback((id: string) => {
    return actionRecommendation.getEmergencyPlanById(id);
  }, []);

  return {
    plans,
    loading,
    error,
    getPlanById,
    refetch: fetchEmergencyPlans,
  };
}

/**
 * Hook for tracking action completion and achievements
 */
export function useActionAchievements() {
  const { getProgressStats, completedActions } = useActionProgress();
  const [achievements, setAchievements] = useState<
    {
      id: string;
      title: string;
      description: string;
      icon: string;
      earned: boolean;
      earnedDate?: string;
    }[]
  >([]);

  const checkAchievements = useCallback(() => {
    const stats = getProgressStats();
    const newAchievements = [
      {
        id: "first-action",
        title: "Getting Started",
        description: "Complete your first climate action",
        icon: "🌱",
        earned: stats.completed >= 1,
        earnedDate: stats.completed >= 1 ? new Date().toISOString() : undefined,
      },
      {
        id: "five-actions",
        title: "Climate Champion",
        description: "Complete 5 climate actions",
        icon: "🏆",
        earned: stats.completed >= 5,
        earnedDate: stats.completed >= 5 ? new Date().toISOString() : undefined,
      },
      {
        id: "ten-actions",
        title: "Sustainability Leader",
        description: "Complete 10 climate actions",
        icon: "🌟",
        earned: stats.completed >= 10,
        earnedDate:
          stats.completed >= 10 ? new Date().toISOString() : undefined,
      },
      {
        id: "emergency-ready",
        title: "Emergency Ready",
        description: "Complete emergency preparedness actions",
        icon: "🚨",
        earned: completedActions.some((id) => id.includes("emergency")),
        earnedDate: completedActions.some((id) => id.includes("emergency"))
          ? new Date().toISOString()
          : undefined,
      },
    ];

    setAchievements(newAchievements);
  }, [getProgressStats, completedActions]);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  const getEarnedAchievements = useCallback(() => {
    return achievements.filter((achievement) => achievement.earned);
  }, [achievements]);

  const getUnearnedAchievements = useCallback(() => {
    return achievements.filter((achievement) => !achievement.earned);
  }, [achievements]);

  return {
    achievements,
    getEarnedAchievements,
    getUnearnedAchievements,
    checkAchievements,
  };
}

/**
 * Hook for getting specific action recommendation details
 */
export function useActionRecommendation(actionId: string) {
  const [recommendation, setRecommendation] =
    useState<ActionRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendation = async () => {
      setLoading(true);
      try {
        const rec = actionRecommendation.getRecommendationById(actionId);
        setRecommendation(rec);
      } catch (error) {
        console.error("Error loading recommendation:", error);
        setRecommendation(null);
      } finally {
        setLoading(false);
      }
    };

    if (actionId) {
      loadRecommendation();
    }
  }, [actionId]);

  return {
    recommendation,
    loading,
  };
}
