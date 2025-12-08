import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Globe,
  Grid3X3,
  Users,
  Package,
  Wifi,
  Sparkles,
} from 'lucide-react'

interface FeatureTourProps {
  onClose: () => void
}

export function FeatureTour({ onClose }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const features = [
    {
      icon: Sparkles,
      title: 'Welcome to the Enhanced Portal!',
      description: 'Your municipal portal has been upgraded with powerful new features to serve you better.',
      highlights: [
        'Multilingual support in 5 languages',
        'Unified service dashboard',
        'Community participation tools',
        'Procurement transparency',
        'Offline sync for rural areas',
      ],
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Access the portal in your preferred language. We support English, isiZulu, isiXhosa, Sesotho, and Afrikaans.',
      highlights: [
        'Click the globe icon (🌐) in the header',
        'Select your preferred language',
        'Interface updates immediately',
        'Your choice is remembered',
      ],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Grid3X3,
      title: 'Unified Service Portal',
      description: 'Everything you need in one place - bills, issues, participation, and more.',
      highlights: [
        'Quick stats dashboard',
        'Fast access to all services',
        'Recent activity timeline',
        'Mobile-friendly design',
      ],
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Users,
      title: 'E-Participation Tools',
      description: 'Have your say! Join discussions, vote on polls, and submit feedback directly to your municipality.',
      highlights: [
        'Community forums and discussions',
        'Vote on municipal priorities',
        'Submit feedback with ratings',
        'Track official responses',
      ],
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Package,
      title: 'Procurement Transparency',
      description: 'Full transparency on tenders, suppliers, and contracts for accountable governance.',
      highlights: [
        'View active tenders with deadlines',
        'Browse registered suppliers',
        'Track contract progress',
        'Download tender documents',
      ],
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Wifi,
      title: 'Offline Sync',
      description: 'No internet? No problem! Continue working offline and sync when connection returns.',
      highlights: [
        'Automatic offline detection',
        'Queue actions locally',
        'Auto-sync when online',
        'Perfect for rural areas',
      ],
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ]

  const currentFeature = features[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === features.length - 1

  const handleNext = () => {
    if (!isLast) {
      setCurrentStep(currentStep + 1)
    } else {
      localStorage.setItem('feature_tour_completed', 'true')
      onClose()
    }
  }

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('feature_tour_completed', 'true')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${currentFeature.bgColor} rounded-lg flex items-center justify-center`}>
                <currentFeature.icon className={`w-6 h-6 ${currentFeature.color}`} />
              </div>
              <div>
                <CardTitle>{currentFeature.title}</CardTitle>
                <CardDescription className="mt-1">
                  Step {currentStep + 1} of {features.length}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          <p className="text-gray-700">{currentFeature.description}</p>

          {/* Highlights */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Key Features:</h4>
            <ul className="space-y-2">
              {currentFeature.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className={`w-5 h-5 ${currentFeature.bgColor} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${currentFeature.color.replace('text-', 'bg-')} rounded-full`} />
                  </div>
                  <span className="text-sm text-gray-600">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? `${currentFeature.color.replace('text-', 'bg-')} w-8`
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirst}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button variant="ghost" onClick={handleSkip}>
              Skip Tour
            </Button>

            <Button onClick={handleNext}>
              {isLast ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function useFeatureTour() {
  const [showTour, setShowTour] = useState(false)

  const checkAndShowTour = () => {
    const tourCompleted = localStorage.getItem('feature_tour_completed')
    if (!tourCompleted) {
      setShowTour(true)
    }
  }

  const resetTour = () => {
    localStorage.removeItem('feature_tour_completed')
    setShowTour(true)
  }

  const closeTour = () => {
    setShowTour(false)
  }

  return { showTour, checkAndShowTour, resetTour, closeTour }
}
