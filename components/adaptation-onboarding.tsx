/**
 * Climate Adaptation Onboarding Flow
 * Interactive questionnaire to gather user information for personalized plan
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import type { UserProfile } from "@/lib/adaptation-advisor";

interface OnboardingFlowProps {
  location: {
    city: string;
    lat: number;
    lon: number;
  };
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, title: "Property", icon: Home },
  { id: 2, title: "Household", icon: Users },
  { id: 3, title: "Budget", icon: DollarSign },
  { id: 4, title: "Concerns", icon: AlertTriangle },
  { id: 5, title: "Current Actions", icon: CheckCircle2 },
];

export function AdaptationOnboarding({ location, onComplete, onCancel }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    location,
    propertyType: undefined,
    ownership: undefined,
    householdSize: 2,
    budget: undefined,
    primaryConcerns: [],
    existingMeasures: [],
    preferredActions: [],
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit
      onComplete(formData as UserProfile);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.propertyType && formData.ownership;
      case 2:
        return formData.householdSize && formData.householdSize > 0;
      case 3:
        return formData.budget;
      case 4:
        return formData.primaryConcerns && formData.primaryConcerns.length > 0;
      case 5:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Create Your Climate Adaptation Plan
              </CardTitle>
              <CardDescription>
                Answer a few questions to get personalized recommendations
              </CardDescription>
            </div>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-6">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex flex-col items-center ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-green-600 dark:bg-green-400 text-white"
                          : "bg-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mb-4 ${
                        isCompleted ? "bg-green-600 dark:bg-green-400" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Property Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Tell us about your property</h3>
                    <Label className="text-base mb-3 block">What type of property do you have?</Label>
                    <RadioGroup
                      value={formData.propertyType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, propertyType: value as any })
                      }
                    >
                      {[
                        { value: "house", label: "Single-family house", desc: "Standalone home with yard" },
                        { value: "apartment", label: "Apartment", desc: "Unit in multi-family building" },
                        { value: "condo", label: "Condominium", desc: "Owned unit with shared amenities" },
                        { value: "mobile-home", label: "Mobile home", desc: "Manufactured housing" },
                        { value: "other", label: "Other", desc: "Different type of dwelling" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
                          onClick={() => setFormData({ ...formData, propertyType: option.value as any })}
                        >
                          <RadioGroupItem value={option.value} id={option.value} />
                          <div>
                            <Label htmlFor={option.value} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base mb-3 block">Do you own or rent?</Label>
                    <RadioGroup
                      value={formData.ownership}
                      onValueChange={(value) =>
                        setFormData({ ...formData, ownership: value as any })
                      }
                    >
                      {[
                        { value: "own", label: "Own", desc: "More flexibility for major upgrades" },
                        { value: "rent", label: "Rent", desc: "Focus on portable solutions" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
                          onClick={() => setFormData({ ...formData, ownership: option.value as any })}
                        >
                          <RadioGroupItem value={option.value} id={`own-${option.value}`} />
                          <div>
                            <Label htmlFor={`own-${option.value}`} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 2: Household Size */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your household</h3>
                    <Label htmlFor="household-size" className="text-base mb-3 block">
                      How many people live in your home?
                    </Label>
                    <Input
                      id="household-size"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.householdSize}
                      onChange={(e) =>
                        setFormData({ ...formData, householdSize: parseInt(e.target.value) || 1 })
                      }
                      className="max-w-xs text-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      This helps us calculate water and energy usage
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Budget */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Investment capacity</h3>
                    <Label className="text-base mb-3 block">
                      What's your budget for climate adaptation measures?
                    </Label>
                    <RadioGroup
                      value={formData.budget}
                      onValueChange={(value) =>
                        setFormData({ ...formData, budget: value as any })
                      }
                    >
                      {[
                        { value: "low", label: "Budget-Friendly", desc: "Up to $500 - Focus on low-cost DIY solutions", range: "<$500" },
                        { value: "medium", label: "Moderate", desc: "$500-$5,000 - Mix of DIY and professional work", range: "$500-$5K" },
                        { value: "high", label: "Comprehensive", desc: "$5,000+ - Major upgrades and installations", range: "$5K+" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
                          onClick={() => setFormData({ ...formData, budget: option.value as any })}
                        >
                          <RadioGroupItem value={option.value} id={`budget-${option.value}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`budget-${option.value}`} className="font-medium cursor-pointer">
                                {option.label}
                              </Label>
                              <span className="text-sm font-mono text-muted-foreground">{option.range}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 4: Primary Concerns */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What concerns you most?</h3>
                    <Label className="text-base mb-3 block">
                      Select all climate risks that worry you (choose at least one)
                    </Label>
                    <div className="space-y-3">
                      {[
                        { id: "heat", label: "Extreme Heat", desc: "High temperatures, cooling costs" },
                        { id: "water-shortage", label: "Water Shortage", desc: "Drought, water restrictions" },
                        { id: "floods", label: "Flooding", desc: "Heavy rain, storm surge, sea level rise" },
                        { id: "wildfires", label: "Wildfires", desc: "Fire risk, smoke, air quality" },
                        { id: "storms", label: "Severe Storms", desc: "Hurricanes, tornadoes, high winds" },
                        { id: "energy-costs", label: "Rising Energy Costs", desc: "Utility bills, grid reliability" },
                        { id: "air-quality", label: "Air Quality", desc: "Pollution, allergens, health impacts" },
                      ].map((concern) => {
                        const isChecked = formData.primaryConcerns?.includes(concern.id);
                        return (
                          <div
                            key={concern.id}
                            className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
                            onClick={() => {
                              const current = formData.primaryConcerns || [];
                              const updated = isChecked
                                ? current.filter((c) => c !== concern.id)
                                : [...current, concern.id];
                              setFormData({ ...formData, primaryConcerns: updated });
                            }}
                          >
                            <Checkbox
                              id={concern.id}
                              checked={isChecked}
                              onCheckedChange={() => {}}
                            />
                            <div className="flex-1">
                              <Label htmlFor={concern.id} className="font-medium cursor-pointer">
                                {concern.label}
                              </Label>
                              <p className="text-sm text-muted-foreground">{concern.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Existing Measures */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What have you already done?</h3>
                    <Label className="text-base mb-3 block">
                      Select any climate adaptation measures you've already implemented (optional)
                    </Label>
                    <div className="space-y-3">
                      {[
                        "LED lighting",
                        "Programmable thermostat",
                        "Weather stripping",
                        "Insulation upgrade",
                        "Low-flow fixtures",
                        "Drought-resistant landscaping",
                        "Rain barrels",
                        "Solar panels",
                        "Backup generator",
                        "Flood barriers",
                        "None yet",
                      ].map((measure) => {
                        const isChecked = formData.existingMeasures?.includes(measure);
                        return (
                          <div
                            key={measure}
                            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                            onClick={() => {
                              const current = formData.existingMeasures || [];
                              const updated = isChecked
                                ? current.filter((m) => m !== measure)
                                : [...current, measure];
                              setFormData({ ...formData, existingMeasures: updated });
                            }}
                          >
                            <Checkbox
                              id={`measure-${measure}`}
                              checked={isChecked}
                              onCheckedChange={() => {}}
                            />
                            <Label
                              htmlFor={`measure-${measure}`}
                              className="font-medium cursor-pointer flex-1"
                            >
                              {measure}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStep === STEPS.length ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate My Plan
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
