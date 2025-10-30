/**
 * Climate Adaptation Dashboard
 * Main component displaying personalized adaptation plan and progress
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Droplets,
  Zap,
  Leaf,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Award,
  Flame,
  RefreshCcw,
  Sparkles,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useAdaptationPlan } from "@/hooks/use-adaptation-plan";
import { AdaptationOnboarding } from "./adaptation-onboarding";
import type { AdaptationAction, UserProfile } from "@/lib/adaptation-advisor";

interface AdaptationDashboardProps {
  location: {
    city: string;
    lat: number;
    lon: number;
  };
}

export function AdaptationDashboard({ location }: AdaptationDashboardProps) {
  const {
    plan,
    isGenerating,
    hasCompletedOnboarding,
    progress,
    getUrgentActions,
    getImportantActions,
    getLongTermActions,
    getTotalImpact,
    getAchievedImpact,
    getNextAction,
    getStreak,
    getAchievements,
    createPlan,
    markActionComplete,
    markActionIncomplete,
    regeneratePlan,
  } = useAdaptationPlan(location);

  // Only show onboarding if explicitly set OR if no plan exists after loading
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleOnboardingComplete = async (profile: UserProfile) => {
    await createPlan(profile);
    setShowOnboarding(false);
  };

  // If user hasn't completed onboarding AND no plan exists, show the questionnaire
  if (showOnboarding || (!hasCompletedOnboarding && !plan && !isGenerating)) {
    return (
      <AdaptationOnboarding
        location={location}
        onComplete={handleOnboardingComplete}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  // Show loading state while generating plan
  if (isGenerating) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-12 w-12 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold">Creating Your Personalized Plan...</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Our AI is analyzing climate risks for {location.city} and generating customized
              recommendations just for you.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Target className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Adaptation Plan Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Complete the onboarding questionnaire to get your personalized climate adaptation
              roadmap.
            </p>
            <Button onClick={() => setShowOnboarding(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalImpact = getTotalImpact();
  const achievedImpact = getAchievedImpact();
  const urgentActions = getUrgentActions();
  const importantActions = getImportantActions();
  const longTermActions = getLongTermActions();
  const nextAction = getNextAction();
  const streak = getStreak();
  const achievements = getAchievements();

  return (
    <div className="space-y-6">
      {/* Header with Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Your Climate Adaptation Plan
              </CardTitle>
              <CardDescription>
                Personalized roadmap for {location.city} • Last updated:{" "}
                {plan.lastUpdated.toLocaleDateString()}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={regeneratePlan} disabled={isGenerating}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress Overview */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {progress.completedActions} of {progress.totalActions} actions completed
                </span>
              </div>
              <Progress value={progress.percentComplete} className="h-3" />
            </div>

            {/* Impact Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <ImpactCard
                icon={Droplets}
                label="Water Saved"
                achieved={achievedImpact.waterSaved}
                total={totalImpact.waterSaved}
                unit="gal/yr"
                color="blue"
              />
              <ImpactCard
                icon={Zap}
                label="Energy Saved"
                achieved={achievedImpact.energySaved}
                total={totalImpact.energySaved}
                unit="kWh/yr"
                color="yellow"
              />
              <ImpactCard
                icon={Leaf}
                label="CO2 Reduced"
                achieved={achievedImpact.co2Reduced}
                total={totalImpact.co2Reduced}
                unit="kg/yr"
                color="green"
              />
              <ImpactCard
                icon={DollarSign}
                label="Money Saved"
                achieved={achievedImpact.moneySaved}
                total={totalImpact.moneySaved}
                unit="$/yr"
                color="emerald"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamification: Streak & Achievements */}
      {(streak > 0 || achievements.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streak > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  {streak} Day Streak! 🔥
                </CardTitle>
                <CardDescription>
                  You've completed actions {streak} times in a row. Keep it up!
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {achievements.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {achievements.slice(0, 4).map((achievement) => (
                      <Badge key={achievement} variant="secondary">
                        {achievement}
                      </Badge>
                    ))}
                    {achievements.length > 4 && (
                      <Badge variant="outline">+{achievements.length - 4} more</Badge>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      )}

      {/* Next Recommended Action */}
      {nextAction && (
        <Alert>
          <Target className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-medium">Next Recommended Action: </span>
                {nextAction.title}
                <p className="text-sm text-muted-foreground mt-1">{nextAction.description}</p>
              </div>
              <Button
                size="sm"
                onClick={() => markActionComplete(nextAction.id)}
                className="ml-4"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions by Category */}
      <Tabs defaultValue="urgent" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="urgent">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Urgent ({urgentActions.length})
          </TabsTrigger>
          <TabsTrigger value="important">
            <Clock className="h-4 w-4 mr-2" />
            Important ({importantActions.length})
          </TabsTrigger>
          <TabsTrigger value="long-term">
            <Calendar className="h-4 w-4 mr-2" />
            Long-Term ({longTermActions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="urgent" className="space-y-4">
          <ActionsList
            actions={urgentActions}
            category="urgent"
            onComplete={markActionComplete}
            onUncomplete={markActionIncomplete}
          />
        </TabsContent>

        <TabsContent value="important" className="space-y-4">
          <ActionsList
            actions={importantActions}
            category="important"
            onComplete={markActionComplete}
            onUncomplete={markActionIncomplete}
          />
        </TabsContent>

        <TabsContent value="long-term" className="space-y-4">
          <ActionsList
            actions={longTermActions}
            category="long-term"
            onComplete={markActionComplete}
            onUncomplete={markActionIncomplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface ImpactCardProps {
  icon: any;
  label: string;
  achieved: number;
  total: number;
  unit: string;
  color: "blue" | "yellow" | "green" | "emerald";
}

function ImpactCard({ icon: Icon, label, achieved, total, unit, color }: ImpactCardProps) {
  const percent = total > 0 ? Math.round((achieved / total) * 100) : 0;

  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950",
    yellow: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950",
    green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color]} mb-3`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">
            {achieved.toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">/ {total.toLocaleString()} {unit}</span>
          </p>
          <Progress value={percent} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ActionsListProps {
  actions: AdaptationAction[];
  category: string;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
}

function ActionsList({ actions, category, onComplete, onUncomplete }: ActionsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>All {category} actions completed! 🎉</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          isExpanded={expandedId === action.id}
          onToggle={() => setExpandedId(expandedId === action.id ? null : action.id)}
          onComplete={onComplete}
          onUncomplete={onUncomplete}
        />
      ))}
    </div>
  );
}

interface ActionCardProps {
  action: AdaptationAction;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
}

function ActionCard({ action, isExpanded, onToggle, onComplete, onUncomplete }: ActionCardProps) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Card className={action.completed ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => (action.completed ? onUncomplete(action.id) : onComplete(action.id))}
              className="mt-1"
            >
              {action.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
              )}
            </button>
            <div className="flex-1">
              <CardTitle className={`text-lg ${action.completed ? "line-through" : ""}`}>
                {action.title}
              </CardTitle>
              <CardDescription className="mt-1">{action.description}</CardDescription>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className={difficultyColors[action.difficulty]}>
                  {action.difficulty}
                </Badge>
                <Badge variant="outline">{action.timeframe}</Badge>
                <Badge variant="outline">{action.cost.range}</Badge>
                {action.cost.paybackPeriod && (
                  <Badge variant="secondary">ROI: {action.cost.paybackPeriod}</Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isExpanded ? "Less" : "More"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <Separator className="mb-4" />
          
          {/* Impact Metrics */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Expected Impact</h4>
              <div className="grid grid-cols-2 gap-2">
                {action.impact.waterSaved && (
                  <div className="flex items-center gap-2 text-sm">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>{action.impact.waterSaved.toLocaleString()} gal/yr water saved</span>
                  </div>
                )}
                {action.impact.energySaved && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>{action.impact.energySaved.toLocaleString()} kWh/yr energy saved</span>
                  </div>
                )}
                {action.impact.co2Reduced && (
                  <div className="flex items-center gap-2 text-sm">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span>{action.impact.co2Reduced.toLocaleString()} kg/yr CO2 reduced</span>
                  </div>
                )}
                {action.impact.moneySaved && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span>${action.impact.moneySaved.toLocaleString()}/yr saved</span>
                  </div>
                )}
                {action.impact.resilienceScore && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span>+{action.impact.resilienceScore} resilience score</span>
                  </div>
                )}
              </div>
            </div>

            {/* Implementation Steps */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Implementation Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {action.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Resources & Help</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {action.resources.map((resource, index) => (
                  <li key={index}>• {resource}</li>
                ))}
              </ul>
            </div>

            {/* Related Risks */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Addresses These Risks</h4>
              <div className="flex flex-wrap gap-2">
                {action.relatedRisks.map((risk) => (
                  <Badge key={risk} variant="outline">
                    {risk}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
