/**
 * Action Recommendations Dashboard
 * Comprehensive interface for personalized climate action recommendations and emergency planning
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  Target,
  Users,
  Shield,
  Lightbulb,
  TrendingUp,
  Award,
  MapPin,
  Settings,
  ExternalLink,
  Play,
  Pause,
  CheckCircle,
  X,
} from 'lucide-react';
import {
  usePersonalizedRecommendations,
  useActionProgress,
  useActionCategories,
  useEmergencyPlans,
  useActionAchievements,
} from '@/hooks/use-action-recommendations';
import { useLocationIntelligence } from '@/hooks/use-location-intelligence';

interface ActionRecommendationsDashboardProps {
  className?: string;
}

const priorityColors = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const urgencyColors = {
  immediate: 'bg-red-100 text-red-800',
  'short-term': 'bg-orange-100 text-orange-800',
  'medium-term': 'bg-yellow-100 text-yellow-800',
  'long-term': 'bg-green-100 text-green-800',
};

const difficultyIcons = {
  easy: '😊',
  moderate: '🤔',
  difficult: '😓',
  expert: '🔬',
};

const costColors = {
  free: 'bg-green-100 text-green-800',
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  enterprise: 'bg-red-100 text-red-800',
};

export function ActionRecommendationsDashboard({ className }: ActionRecommendationsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Get user location for personalized recommendations
  const { location, enableLocation, isLoading: locationLoading, error: locationHookError } = useLocationIntelligence();
  const lat = location?.latitude || 40.7128; // Default to NYC
  const lng = location?.longitude || -74.0060;

  // Request location on mount if not already available
  React.useEffect(() => {
    if (!location && !locationRequested && !locationLoading) {
      setLocationRequested(true);
      enableLocation().catch((err: any) => {
        setLocationError(err?.message || 'Location access denied');
      });
    }
  }, [location, locationRequested, locationLoading, enableLocation]);

  // Hooks for data
  const {
    immediate,
    shortTerm,
    longTerm,
    emergency,
    profile,
    loading: recommendationsLoading,
    error: recommendationsError,
  } = usePersonalizedRecommendations(lat, lng, {
    budget: 'medium',
    timeAvailable: 'moderate',
    expertise: 'beginner',
  });

  const {
    markAsCompleted,
    markAsInProgress,
    markAsPlanned,
    getActionStatus,
    getProgressStats,
  } = useActionProgress();

  const { categories } = useActionCategories();
  const { achievements, getEarnedAchievements } = useActionAchievements();

  const progressStats = getProgressStats();
  const earnedAchievements = getEarnedAchievements();

  const ActionCard = ({ action, showDetails = false }: { action: any; showDetails?: boolean }) => {
    const status = getActionStatus(action.id);
    
    return (
      <Card className={`transition-all hover:shadow-md ${status === 'completed' ? 'bg-green-50 border-green-200' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                <span className="break-words">{action.title}</span>
                {status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                {status === 'in-progress' && <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />}
              </CardTitle>
              <CardDescription className="mt-1 text-sm">{action.description}</CardDescription>
            </div>
            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${priorityColors[action.priority as keyof typeof priorityColors] || priorityColors.medium}`} />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className={`text-xs ${urgencyColors[action.urgency as keyof typeof urgencyColors] || urgencyColors.immediate}`}>
              {action.urgency.replace('-', ' ')}
            </Badge>
            <Badge variant="outline" className={`text-xs ${costColors[action.cost.range as keyof typeof costColors] || costColors.medium}`}>
              {action.cost.range} cost
            </Badge>
            <Badge variant="outline" className="text-xs">
              {difficultyIcons[action.difficulty as keyof typeof difficultyIcons] || difficultyIcons.easy} {action.difficulty}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Impact Indicators */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Environmental</div>
              <div className="text-base font-semibold text-green-600">{action.impact.environmental}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Economic</div>
              <div className="text-base font-semibold text-blue-600">{action.impact.economic}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Social</div>
              <div className="text-base font-semibold text-purple-600">{action.impact.social}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Overall</div>
              <div className="text-base font-semibold">{action.impact.overall}%</div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-4">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              Key Benefits
            </h4>
            <ul className="space-y-1">
              {action.benefits.slice(0, 3).map((benefit: string, index: number) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cost Estimate */}
          {action.cost.estimate && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">Cost Estimate</span>
              </div>
              <div className="text-sm">
                ${action.cost.estimate.min.toLocaleString()} - ${action.cost.estimate.max.toLocaleString()} {action.cost.estimate.currency}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status === 'not-started' && (
              <>
                <Button
                  size="sm"
                  onClick={() => markAsInProgress(action.id)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Action
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsPlanned(action.id)}
                >
                  Plan Later
                </Button>
              </>
            )}
            {status === 'in-progress' && (
              <>
                <Button
                  size="sm"
                  onClick={() => markAsCompleted(action.id)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAction(action.id)}
                >
                  View Steps
                </Button>
              </>
            )}
            {status === 'planned' && (
              <Button
                size="sm"
                onClick={() => markAsInProgress(action.id)}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Now
              </Button>
            )}
            {status === 'completed' && (
              <Button size="sm" variant="outline" disabled className="flex-1">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmergencyPlanCard = ({ plan }: { plan: any }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          {plan.title}
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <Badge variant="outline" className={`w-fit ${plan.severity === 'disaster' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
          {plan.severity}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trigger Conditions */}
          <div>
            <h4 className="font-medium mb-2">Trigger Conditions</h4>
            <ul className="space-y-1">
              {plan.triggerConditions.slice(0, 3).map((condition: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 mt-0.5 text-orange-500 flex-shrink-0" />
                  {condition}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Contacts */}
          <div>
            <h4 className="font-medium mb-2">Emergency Contacts</h4>
            <div className="space-y-1">
              {plan.communication.contacts.slice(0, 2).map((contact: any, index: number) => (
                <div key={index} className="text-sm flex justify-between">
                  <span>{contact.name}</span>
                  <span className="font-mono">{contact.number}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setSelectedPlan(plan);
              setShowPlanDialog(true);
            }}
          >
            View Full Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (recommendationsLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (recommendationsError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading recommendations: {recommendationsError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Action Recommendations</h1>
        <p className="text-muted-foreground mt-2">
          Personalized climate actions and emergency preparedness for your location
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progressStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{progressStats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progressStats.planned}</div>
              <div className="text-sm text-muted-foreground">Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{earnedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
          </div>
          
          {progressStats.total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Completion Rate</span>
                <span>{Math.round(progressStats.completionRate)}%</span>
              </div>
              <Progress value={progressStats.completionRate} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="immediate">Immediate</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Location Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Your Location Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!location && (
                <div className="text-center py-6">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Enable location access to get personalized climate recommendations for your area
                  </p>
                  <Button onClick={enableLocation} disabled={locationLoading}>
                    {locationLoading ? 'Requesting...' : 'Enable Location Access'}
                  </Button>
                  {locationError && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{locationError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              {profile && location && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-sm text-muted-foreground">
                      {profile.location.address}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Key Risks</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.risks.map((risk) => (
                        <Badge key={risk} variant="outline" className="text-xs">
                          {risk.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Constraints</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Budget: {profile.constraints.budget}</div>
                      <div>Time: {profile.constraints.time}</div>
                      <div>Expertise: {profile.constraints.expertise}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Immediate Actions ({immediate.length})
                </CardTitle>
                <CardDescription>High-priority actions you can start today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {immediate.slice(0, 3).map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground">{action.urgency}</div>
                      </div>
                      <Badge variant="outline" className={costColors[action.cost.range]}>
                        {action.cost.range}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setSelectedTab('immediate')}
                >
                  View All Immediate Actions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>Your climate action milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {earnedAchievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                  {earnedAchievements.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      Complete your first action to earn achievements!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="immediate" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Immediate Actions</h2>
            <p className="text-muted-foreground">
              High-priority actions you can start implementing today for immediate climate impact.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {immediate.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
          
          {immediate.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No immediate actions found for your location.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Short-term & Long-term Planning</h2>
            <p className="text-muted-foreground">
              Strategic actions for building long-term climate resilience and sustainability.
            </p>
          </div>

          <div className="space-y-8">
            {/* Short-term Actions */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Short-term Actions (Next 1-6 months)</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {shortTerm.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Long-term Actions */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Long-term Actions (6+ months)</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {longTerm.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Emergency Preparedness</h2>
            <p className="text-muted-foreground">
              Essential emergency plans and preparedness strategies for climate-related disasters.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {emergency.map((plan) => (
              <EmergencyPlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          {emergency.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No specific emergency plans found for your location.</p>
                <p className="text-muted-foreground mt-2">General emergency preparedness recommendations will be added soon.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Emergency Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              {selectedPlan?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6 mt-4">
              {/* Trigger Conditions */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Trigger Conditions
                </h3>
                <ul className="space-y-2">
                  {selectedPlan.triggerConditions.map((condition: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2 pl-4">
                      <span className="text-orange-500">•</span>
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Emergency Phases */}
              <div>
                <h3 className="font-semibold mb-3">Emergency Response Phases</h3>
                {selectedPlan.phases.map((phase: any, phaseIndex: number) => (
                  <div key={phaseIndex} className="mb-4">
                    <h4 className="font-medium text-sm uppercase text-primary mb-2">
                      {phase.phase} Phase
                    </h4>
                    <div className="space-y-2">
                      {phase.actions.map((action: any, actionIndex: number) => (
                        <div key={actionIndex} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                          {action.critical && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />}
                          <div className="flex-1">
                            <div className="font-medium">{action.action}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Timeline: {action.timeframe} • Responsible: {action.responsible}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Emergency Contacts */}
              <div>
                <h3 className="font-semibold mb-2">Emergency Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPlan.communication.contacts.map((contact: any, index: number) => (
                    <div key={index} className="flex justify-between p-2 bg-muted/50 rounded text-sm">
                      <span className="font-medium">{contact.name}</span>
                      <span className="font-mono text-primary">{contact.number}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Resources */}
              <div>
                <h3 className="font-semibold mb-2">Essential Resources</h3>
                <div className="space-y-2">
                  {selectedPlan.resources.filter((r: any) => r.priority === 'essential').slice(0, 5).map((resource: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm p-2 border rounded">
                      <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                      <div className="flex-1">
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-xs text-muted-foreground">{resource.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}