import { useState } from 'react'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { X, MapPin, Palette, FileText } from 'lucide-react'

export function QuickStartBanner() {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('quickstart_dismissed') === 'true'
  })

  const handleDismiss = () => {
    localStorage.setItem('quickstart_dismissed', 'true')
    setIsDismissed(true)
  }

  if (isDismissed) return null

  return (
    <div className="bg-gradient-to-r from-sa-green to-sa-blue p-6 rounded-lg text-white relative overflow-hidden mb-6">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-white hover:bg-white/20"
        onClick={handleDismiss}
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="max-w-4xl">
        <h2 className="text-2xl mb-2">Welcome to the SA Municipal Portal! 🇿🇦</h2>
        <p className="text-white/90 mb-4">
          Your portal is ready with government branding and secure features. Here's what's new:
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-sa-gold" />
              <h3 className="font-medium">Maps Integration</h3>
            </div>
            <p className="text-sm text-white/80">
              Report issues with precise geolocation using Google Maps
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-sa-gold" />
              <h3 className="font-medium">Government Kit</h3>
            </div>
            <p className="text-sm text-white/80">
              Official SA branding and POPIA compliance components
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-sa-gold" />
              <h3 className="font-medium">Setup Guide</h3>
            </div>
            <p className="text-sm text-white/80">
              Complete documentation and examples included
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              // This would navigate to the setup guide in the actual app
              alert('Navigate to Admin Panel > Guide tab to view setup instructions')
            }}
            className="inline-flex items-center gap-2 bg-sa-gold text-black px-4 py-2 rounded-lg font-medium hover:bg-sa-gold/90 transition-colors"
          >
            View Setup Guide
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              alert('Navigate to Admin Panel > Gov Kit tab to see all components')
            }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors"
          >
            Explore Components
          </a>
        </div>

        <p className="text-xs text-white/70 mt-4">
          ⚠️ Google Maps API key required for geolocation features. See setup guide for instructions.
        </p>
      </div>
    </div>
  )
}
