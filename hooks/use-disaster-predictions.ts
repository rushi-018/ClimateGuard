/**
 * React Hook for 48-Hour Disaster Predictions
 * Manages state and updates for disaster forecasting
 */

import { useState, useEffect, useCallback } from "react";
import {
  generate48HourPredictions,
  type DisasterPrediction,
  type Action,
} from "@/lib/disaster-predictor";

export function useDisasterPredictions(location?: {
  name: string;
  lat: number;
  lon: number;
}) {
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch predictions
  const fetchPredictions = useCallback(async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      const newPredictions = await generate48HourPredictions(location);
      setPredictions(newPredictions);
      setLastUpdated(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch predictions";
      setError(message);
      console.error("Error fetching predictions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Auto-fetch on mount and location change
  useEffect(() => {
    if (location) {
      fetchPredictions();
    }
  }, [location, fetchPredictions]);

  // Get predictions by severity
  const getHighRiskPredictions = useCallback(() => {
    return predictions.filter(
      (p) => p.severity === "extreme" || p.severity === "high"
    );
  }, [predictions]);

  const getCriticalPredictions = useCallback(() => {
    return predictions.filter((p) => p.severity === "extreme");
  }, [predictions]);

  // Get predictions by time window
  const getImminentPredictions = useCallback(() => {
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;
    return predictions.filter((p) => {
      const peakTime =
        p.timeWindow.peakTime?.getTime() || p.timeWindow.end.getTime();
      return peakTime - now < sixHours;
    });
  }, [predictions]);

  // Get all immediate actions across predictions
  const getAllImmediateActions = useCallback(() => {
    const actions: Action[] = [];
    predictions.forEach((pred) => {
      pred.preparedness.immediateActions.forEach((action) => {
        // Avoid duplicates
        if (!actions.find((a) => a.title === action.title)) {
          actions.push(action);
        }
      });
    });
    // Sort by priority
    return actions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [predictions]);

  // Mark action as completed
  const markActionComplete = useCallback(
    (predictionId: string, actionId: string) => {
      setPredictions((prev) =>
        prev.map((pred) => {
          if (pred.id === predictionId) {
            return {
              ...pred,
              preparedness: {
                ...pred.preparedness,
                immediateActions: pred.preparedness.immediateActions.map(
                  (action) =>
                    action.id === actionId
                      ? { ...action, completed: true }
                      : action
                ),
              },
            };
          }
          return pred;
        })
      );
    },
    []
  );

  // Get overall risk level
  const getOverallRiskLevel = useCallback((): {
    level: "low" | "moderate" | "high" | "extreme";
    score: number;
  } => {
    if (predictions.length === 0) {
      return { level: "low", score: 0 };
    }

    // Calculate weighted risk score
    let totalScore = 0;
    let totalWeight = 0;

    predictions.forEach((pred) => {
      const severityWeight = {
        low: 1,
        moderate: 2,
        high: 3,
        extreme: 4,
      }[pred.severity];

      const score =
        (pred.probability / 100) * (pred.confidence / 100) * severityWeight;
      const weight = pred.confidence / 100;

      totalScore += score * weight;
      totalWeight += weight;
    });

    const avgScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    // Map score to level
    let level: "low" | "moderate" | "high" | "extreme";
    if (avgScore < 1) level = "low";
    else if (avgScore < 2) level = "moderate";
    else if (avgScore < 3) level = "high";
    else level = "extreme";

    return {
      level,
      score: Math.round(avgScore * 100) / 100,
    };
  }, [predictions]);

  // Get time until next prediction
  const getTimeToNextEvent = useCallback((): {
    hours: number;
    prediction: DisasterPrediction | null;
  } => {
    if (predictions.length === 0) {
      return { hours: 48, prediction: null };
    }

    const now = Date.now();
    let nearestTime = Infinity;
    let nearestPred: DisasterPrediction | null = null;

    predictions.forEach((pred) => {
      const peakTime =
        pred.timeWindow.peakTime?.getTime() || pred.timeWindow.end.getTime();
      const timeUntil = peakTime - now;
      if (timeUntil > 0 && timeUntil < nearestTime) {
        nearestTime = timeUntil;
        nearestPred = pred;
      }
    });

    return {
      hours: Math.round(nearestTime / (60 * 60 * 1000)),
      prediction: nearestPred,
    };
  }, [predictions]);

  return {
    predictions,
    isLoading,
    error,
    lastUpdated,
    fetchPredictions,
    getHighRiskPredictions,
    getCriticalPredictions,
    getImminentPredictions,
    getAllImmediateActions,
    markActionComplete,
    getOverallRiskLevel,
    getTimeToNextEvent,
  };
}
