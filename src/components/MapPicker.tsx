import { useState, useEffect, useCallback } from 'react'
import { MapPin, Navigation, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number }
}

export function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  )
  const [address, setAddress] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [error, setError] = useState<string>('')
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  // Load Google Maps script
  useEffect(() => {
    const apiKey = 'GOOGLE_MAPS_API_KEY'
    
    if (window.google && window.google.maps) {
      setIsScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => setError('Failed to load Google Maps')
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isScriptLoaded || map) return

    const mapElement = document.getElementById('map-container')
    if (!mapElement) return

    // Default to Pretoria, South Africa
    const defaultCenter = currentLocation || { lat: -25.7479, lng: 28.2293 }

    const newMap = new google.maps.Map(mapElement, {
      center: defaultCenter,
      zoom: 14,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    })

    const newMarker = new google.maps.Marker({
      map: newMap,
      position: defaultCenter,
      draggable: true,
      title: 'Issue Location',
    })

    // Add click listener to map
    newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const position = { lat: e.latLng.lat(), lng: e.latLng.lng() }
        newMarker.setPosition(e.latLng)
        setCurrentLocation(position)
        reverseGeocode(position)
      }
    })

    // Add drag listener to marker
    newMarker.addListener('dragend', () => {
      const position = newMarker.getPosition()
      if (position) {
        const loc = { lat: position.lat(), lng: position.lng() }
        setCurrentLocation(loc)
        reverseGeocode(loc)
      }
    })

    setMap(newMap)
    setMarker(newMarker)

    if (currentLocation) {
      reverseGeocode(currentLocation)
    }
  }, [isScriptLoaded])

  const reverseGeocode = useCallback((location: { lat: number; lng: number }) => {
    if (!window.google) return

    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const addr = results[0].formatted_address
        setAddress(addr)
        onLocationSelect({ ...location, address: addr })
      } else {
        setAddress(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`)
        onLocationSelect({ ...location, address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` })
      }
    })
  }, [onLocationSelect])

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCurrentLocation(location)
        
        if (map) {
          map.setCenter(location)
          map.setZoom(16)
        }
        
        if (marker) {
          marker.setPosition(location)
        }
        
        reverseGeocode(location)
        setIsLoadingLocation(false)
      },
      (error) => {
        setError('Unable to retrieve your location. Please select manually on the map.')
        setIsLoadingLocation(false)
        console.error('Geolocation error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  if (!isScriptLoaded) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="flex-1"
        >
          {isLoadingLocation ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          Use My Location
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div 
        id="map-container" 
        className="w-full h-64 rounded-lg border border-gray-300"
        style={{ minHeight: '256px' }}
      />

      {currentLocation && address && (
        <div className="flex items-start gap-2 p-3 bg-sa-green/5 border border-sa-green/20 rounded-lg">
          <MapPin className="w-4 h-4 text-sa-green mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Selected Location:</p>
            <p className="text-sm break-words">{address}</p>
            <p className="text-xs text-gray-400 mt-1">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        💡 Click on the map or drag the marker to select the exact issue location
      </p>
    </div>
  )
}
