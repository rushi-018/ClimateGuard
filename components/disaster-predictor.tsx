/**
 * 48-Hour Disaster Predictor Dashboard
 * Emergency preparedness and prediction display
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Flame,
  Droplets,
  Wind,
  Zap,
  Sun,
  CloudRain,
  ShieldAlert,
  Users,
  Package,
  Phone,
  Map,
  Home,
  Activity,
  RefreshCw,
  Calendar,
  Target,
  AlertCircle,
} from "lucide-react";
import { useDisasterPredictions } from "@/hooks/use-disaster-predictions";
import type { DisasterPrediction, Action } from "@/lib/disaster-predictor";

interface DisasterPredictorProps {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
}

const DISASTER_ICONS: Record<string, any> = {
  flood: Droplets,
  wildfire: Flame,
  hurricane: Wind,
  tornado: Wind,
  earthquake: AlertTriangle,
  heatwave: Sun,
  storm: CloudRain,
  drought: Sun,
  tsunami: TrendingUp,
  blizzard: CloudRain,
  cyclone: Wind,
  landslide: AlertTriangle,
  avalanche: AlertTriangle,
  volcano: Flame,
  thunderstorm: Zap,
  lightning: Zap,
  freezing: Sun,
  heat: Sun,
  wind: Wind,
  rain: CloudRain,
};

const SEVERITY_COLORS = {
  low: "text-blue-600 bg-blue-500/10 border-blue-500",
  moderate: "text-yellow-600 bg-yellow-500/10 border-yellow-500",
  high: "text-orange-600 bg-orange-500/10 border-orange-500",
  extreme: "text-red-600 bg-red-500/10 border-red-500",
};

const PRIORITY_COLORS = {
  critical: "border-l-red-500 bg-red-500/5",
  high: "border-l-orange-500 bg-orange-500/5",
  medium: "border-l-yellow-500 bg-yellow-500/5",
  low: "border-l-blue-500 bg-blue-500/5",
};

export function DisasterPredictor({ location }: DisasterPredictorProps) {
  const {
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
  } = useDisasterPredictions(location);

  const [selectedPrediction, setSelectedPrediction] = useState<DisasterPrediction | null>(null);
  const overallRisk = getOverallRiskLevel();
  const timeToNext = getTimeToNextEvent();
  const highRiskPredictions = getHighRiskPredictions();
  const immediateActions = getAllImmediateActions();

  return (
    <div className="space-y-6">
      {/* Header with Overall Risk */}
      <Card className={`border-2 ${SEVERITY_COLORS[overallRisk.level]}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6" />
                48-Hour Disaster Forecast
              </CardTitle>
              <CardDescription>
                AI-powered predictions for {location.name}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPredictions()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Overall Risk</p>
              <Badge variant="outline" className={`text-lg font-bold ${SEVERITY_COLORS[overallRisk.level]}`}>
                {overallRisk.level.toUpperCase()}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Score: {overallRisk.score.toFixed(1)}/4.0
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Active Predictions</p>
              <p className="text-3xl font-bold">{predictions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {highRiskPredictions.length} high risk
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Next Event</p>
              <p className="text-3xl font-bold">{timeToNext.hours}h</p>
              <p className="text-xs text-muted-foreground mt-1">
                {timeToNext.prediction?.title || "No imminent threats"}
              </p>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Analyzing weather patterns and disaster risks...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictions Display */}
      {!isLoading && predictions.length > 0 && (
        <Tabs defaultValue="predictions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="preparedness">Preparedness</TabsTrigger>
            <TabsTrigger value="actions">
              Actions
              {immediateActions.filter((a) => !a.completed).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {immediateActions.filter((a) => !a.completed).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            {predictions.map((prediction, index) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                index={index}
                onSelect={() => setSelectedPrediction(prediction)}
                isSelected={selectedPrediction?.id === prediction.id}
              />
            ))}
          </TabsContent>

          <TabsContent value="preparedness" className="space-y-4">
            {selectedPrediction ? (
              <PreparednessPanel prediction={selectedPrediction} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Select a prediction to view preparedness information
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <ActionChecklist
              actions={immediateActions}
              onToggle={(actionId) => {
                const pred = predictions.find((p) =>
                  p.preparedness.immediateActions.some((a) => a.id === actionId)
                );
                if (pred) {
                  markActionComplete(pred.id, actionId);
                }
              }}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* No Predictions */}
      {!isLoading && predictions.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">All Clear</h3>
            <p className="text-muted-foreground">
              No significant disaster threats detected in the next 48 hours for {location.name}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Prediction Card Component
function PredictionCard({
  prediction,
  index,
  onSelect,
  isSelected,
}: {
  prediction: DisasterPrediction;
  index: number;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const Icon = DISASTER_ICONS[prediction.type] || AlertTriangle; // Fallback to AlertTriangle if icon not found
  const timeUntilPeak = prediction.timeWindow.peakTime
    ? Math.round(
        (prediction.timeWindow.peakTime.getTime() - Date.now()) / (60 * 60 * 1000)
      )
    : 24;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`cursor-pointer transition-all ${
          isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
        } ${SEVERITY_COLORS[prediction.severity]}`}
        onClick={onSelect}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${SEVERITY_COLORS[prediction.severity]}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{prediction.title}</h3>
                  <p className="text-sm text-muted-foreground">{prediction.description}</p>
                </div>
                <Badge variant="outline" className="ml-2">
                  {prediction.severity}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Probability</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={prediction.probability} className="flex-1" />
                    <span className="text-sm font-medium">{prediction.probability}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={prediction.confidence} className="flex-1" />
                    <span className="text-sm font-medium">{prediction.confidence}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peak Time</p>
                  <p className="text-sm font-medium mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {timeUntilPeak}h
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {prediction.impact.estimatedAffected.toLocaleString()} affected
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {prediction.location.radius}km radius
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Preparedness Panel Component
function PreparednessPanel({ prediction }: { prediction: DisasterPrediction }) {
  const [activeTab, setActiveTab] = useState<"supplies" | "evacuation" | "contacts">("supplies");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Preparedness</CardTitle>
        <CardDescription>Comprehensive preparation guide for {prediction.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="supplies">
              <Package className="h-4 w-4 mr-2" />
              Supplies
            </TabsTrigger>
            <TabsTrigger value="evacuation">
              <Map className="h-4 w-4 mr-2" />
              Evacuation
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Phone className="h-4 w-4 mr-2" />
              Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supplies" className="space-y-4 mt-4">
            <SupplyChecklist supplies={prediction.preparedness.supply48Hours} />
          </TabsContent>

          <TabsContent value="evacuation" className="space-y-4 mt-4">
            {prediction.preparedness.evacuationPlan ? (
              <EvacuationInfo evacuation={prediction.preparedness.evacuationPlan} />
            ) : (
              <Alert>
                <Home className="h-4 w-4" />
                <AlertTitle>Shelter in Place</AlertTitle>
                <AlertDescription>
                  Evacuation not currently recommended. Monitor updates and be prepared to evacuate
                  if conditions change.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4 mt-4">
            <EmergencyContacts contacts={prediction.preparedness.emergencyContacts} />
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h4 className="font-semibold">Preparedness Timeline</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {prediction.preparedness.timeline.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${PRIORITY_COLORS[item.priority]}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{item.time}</span>
                    <Badge variant="outline" className="ml-auto">
                      {item.priority}
                    </Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    {item.actions.map((action, i) => (
                      <li key={i}>• {action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

// Supply Checklist Component
function SupplyChecklist({ supplies }: { supplies: any }) {
  const categories = Object.entries(supplies) as [string, any][];

  return (
    <div className="space-y-4">
      {categories.map(([category, data]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm capitalize">
              {category.replace(/_/g, " ")}
              <Badge variant="secondary" className="ml-2">
                Priority {data.priority}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.amount && (
              <p className="text-sm font-medium mb-2">Amount: {data.amount}</p>
            )}
            {data.items && (
              <ul className="text-sm text-muted-foreground space-y-1">
                {data.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Evacuation Info Component
function EvacuationInfo({ evacuation }: { evacuation: any }) {
  return (
    <div className="space-y-4">
      <Alert variant={evacuation.urgency === "immediate" ? "destructive" : "default"}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Evacuation {evacuation.recommended ? "Recommended" : "Not Required"}</AlertTitle>
        <AlertDescription className="capitalize">
          Urgency: {evacuation.urgency.replace(/-/g, " ")}
        </AlertDescription>
      </Alert>

      {evacuation.routes && evacuation.routes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Evacuation Routes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {evacuation.routes.map((route: any, i: number) => (
              <div key={i} className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium">{route.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{route.description}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span>Distance: {route.distance}km</span>
                  <span>Time: ~{route.estimatedTime} min</span>
                  <Badge variant="outline">{route.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Emergency Contacts Component
function EmergencyContacts({ contacts }: { contacts: any[] }) {
  return (
    <div className="space-y-3">
      {contacts.map((contact, i) => (
        <Card key={i}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{contact.name}</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {contact.type.replace(/_/g, " ")}
                </p>
              </div>
              <Badge variant={contact.available24_7 ? "default" : "secondary"}>
                {contact.available24_7 ? "24/7" : "Limited Hours"}
              </Badge>
            </div>
            <Button variant="outline" className="w-full mt-3" asChild>
              <a href={`tel:${contact.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                {contact.phone}
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Action Checklist Component
function ActionChecklist({
  actions,
  onToggle,
}: {
  actions: Action[];
  onToggle: (id: string) => void;
}) {
  const sortedActions = [...actions].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const completedCount = actions.filter((a) => a.completed).length;
  const progress = actions.length > 0 ? (completedCount / actions.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Immediate Actions</CardTitle>
            <CardDescription>
              {completedCount} of {actions.length} completed
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg">
            {Math.round(progress)}%
          </Badge>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {sortedActions.map((action) => (
              <div
                key={action.id}
                className={`p-4 rounded-lg border-l-4 transition-all ${
                  action.completed
                    ? "bg-green-500/5 border-l-green-500 opacity-60"
                    : PRIORITY_COLORS[action.priority]
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggle(action.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    {action.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium ${action.completed ? "line-through" : ""}`}>
                        {action.title}
                      </h4>
                      <Badge variant="outline" className="flex-shrink-0">
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {action.timeframe}
                      </span>
                      <span className="capitalize">{action.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
