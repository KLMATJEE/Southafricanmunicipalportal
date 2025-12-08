import { Alert, AlertDescription } from './ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ExternalLink, Key } from 'lucide-react'

export function GoogleMapsSetup() {
  return (
    <Card className="border-sa-gold">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-sa-gold" />
          <CardTitle>Google Maps API Setup Required</CardTitle>
        </div>
        <CardDescription>
          To enable geolocation features for issue reporting, you need to configure Google Maps API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-2 text-sm">
              <li>Visit the Google Cloud Console and create a project</li>
              <li>Enable the Maps JavaScript API and Places API</li>
              <li>Create an API key with appropriate restrictions</li>
              <li>Replace 'GOOGLE_MAPS_API_KEY' in MapPicker.tsx with your actual API key</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="bg-sa-green/5 border border-sa-green/20 rounded-lg p-4">
          <p className="text-sm mb-2">
            <strong>Recommended API restrictions:</strong>
          </p>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Maps JavaScript API</li>
            <li>• Places API</li>
            <li>• Geocoding API</li>
          </ul>
        </div>

        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-sa-green hover:text-sa-green/80 underline"
        >
          <ExternalLink className="w-4 h-4" />
          Open Google Cloud Console
        </a>

        <p className="text-xs text-gray-500">
          <strong>Note:</strong> For production use, store the API key securely as an environment variable and restrict it by domain/IP.
        </p>
      </CardContent>
    </Card>
  )
}
