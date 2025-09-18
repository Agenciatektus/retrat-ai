"use client"

import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Camera, Sparkles, Download, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Retrat.ai',
      description: 'Transform your photos into professional editorial portraits',
      icon: <Sparkles className="w-8 h-8 text-accent-gold" />,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-accent-gold-muted rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-accent-gold" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Professional AI Portraits
            </h3>
            <p className="text-foreground-muted">
              Upload your photos and style references to create stunning editorial-quality portraits
              with our advanced AI technology.
            </p>
          </div>
          <div className="bg-surface-glass rounded-lg p-4 border border-border-glass">
            <p className="text-sm text-foreground-muted">
              🎉 You start with <span className="text-accent-gold font-medium">5 free generations</span> every week!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      description: 'Simple 3-step process to create amazing portraits',
      icon: <Camera className="w-8 h-8 text-accent-gold" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-4 p-4 bg-surface-glass rounded-lg border border-border-glass">
              <div className="w-8 h-8 bg-accent-gold text-background rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Upload Your Photos</h4>
                <p className="text-sm text-foreground-muted">
                  Add 1-5 personal photos to a project
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-surface-glass rounded-lg border border-border-glass">
              <div className="w-8 h-8 bg-accent-gold text-background rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Choose Style Reference</h4>
                <p className="text-sm text-foreground-muted">
                  Upload an image that shows the style you want
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-surface-glass rounded-lg border border-border-glass">
              <div className="w-8 h-8 bg-accent-gold text-background rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">AI Magic</h4>
                <p className="text-sm text-foreground-muted">
                  Our DiretorVisual agent creates professional portraits
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'You\'re All Set!',
      description: 'Ready to create your first professional portrait',
      icon: <Download className="w-8 h-8 text-accent-gold" />,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-success" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Ready to Create!
            </h3>
            <p className="text-foreground-muted">
              You're all set to start creating amazing portraits. Click below to create your first project.
            </p>
          </div>
          <div className="bg-surface-glass rounded-lg p-4 border border-border-glass">
            <p className="text-sm text-foreground-muted mb-2">
              💡 <strong>Pro Tip:</strong> For best results, use:
            </p>
            <ul className="text-xs text-foreground-muted space-y-1 text-left">
              <li>• Clear, well-lit photos of yourself</li>
              <li>• High-quality style references from Pinterest or editorial shoots</li>
              <li>• Multiple angles for better AI understanding</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground-muted">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-foreground-muted">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <motion.div
              className="bg-accent-gold h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    index <= currentStep
                      ? 'bg-accent-gold text-background'
                      : 'bg-surface border border-border text-foreground-muted'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 transition-colors ${
                      index < currentStep ? 'bg-accent-gold' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card variant="glass" padding="xl" className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  {currentStepData.icon}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {currentStepData.title}
                </CardTitle>
                <p className="text-foreground-muted">
                  {currentStepData.description}
                </p>
              </CardHeader>
              <CardContent>
                {currentStepData.content}
              </CardContent>
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isFirstStep}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            rightIcon={isLastStep ? undefined : <ArrowRight className="w-4 h-4" />}
          >
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
