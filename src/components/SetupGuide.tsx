import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { CheckCircle, MapPin, Key, Database, Shield, ExternalLink } from 'lucide-react'

export function SetupGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-sa-green border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-sa-green" />
            <CardTitle>South African Municipal Portal - Setup Guide</CardTitle>
          </div>
          <CardDescription>
            Complete configuration guide for your municipal services portal
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="maps" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="maps">
            <MapPin className="w-4 h-4 mr-2" />
            Maps Setup
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="w-4 h-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Google Maps Setup */}
        <TabsContent value="maps">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Google Maps API Configuration</CardTitle>
                  <CardDescription>Required for geolocation and issue reporting</CardDescription>
                </div>
                <Badge className="bg-sa-gold text-black">Required</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Key className="w-4 h-4" />
                <AlertDescription>
                  The Maps integration enables citizens to precisely report service issues with geolocation data.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sa-green text-white text-sm">1</span>
                    Create Google Cloud Project
                  </h3>
                  <ol className="ml-8 space-y-2 text-sm text-gray-700">
                    <li>• Visit <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-sa-green hover:underline">Google Cloud Console <ExternalLink className="w-3 h-3 inline" /></a></li>
                    <li>• Create a new project: "SA Municipal Portal"</li>
                    <li>• Enable billing for the project</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sa-green text-white text-sm">2</span>
                    Enable Required APIs
                  </h3>
                  <ol className="ml-8 space-y-2 text-sm text-gray-700">
                    <li>• Navigate to "APIs & Services" → "Library"</li>
                    <li>• Search and enable: <strong>Maps JavaScript API</strong></li>
                    <li>• Search and enable: <strong>Geocoding API</strong></li>
                    <li>• Search and enable: <strong>Places API</strong></li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sa-green text-white text-sm">3</span>
                    Create API Key
                  </h3>
                  <ol className="ml-8 space-y-2 text-sm text-gray-700">
                    <li>• Go to "APIs & Services" → "Credentials"</li>
                    <li>• Click "Create Credentials" → "API Key"</li>
                    <li>• Copy your API key</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sa-green text-white text-sm">4</span>
                    Restrict API Key (Important!)
                  </h3>
                  <div className="ml-8 space-y-3">
                    <p className="text-sm text-gray-700">For production security:</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-800 mb-2">Application Restrictions:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Add your domain: <code className="bg-red-100 px-1 rounded">yourdomain.gov.za/*</code></li>
                        <li>• For development: <code className="bg-red-100 px-1 rounded">localhost:*</code></li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 mb-2">API Restrictions:</p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>✓ Maps JavaScript API</li>
                        <li>✓ Geocoding API</li>
                        <li>✓ Places API</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sa-green text-white text-sm">5</span>
                    Update Your Code
                  </h3>
                  <div className="ml-8">
                    <p className="text-sm text-gray-700 mb-2">Open <code className="bg-gray-100 px-2 py-1 rounded">/components/MapPicker.tsx</code></p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`// Find this line (around line 31):
const apiKey = 'GOOGLE_MAPS_API_KEY'

// Replace with your actual API key:
const apiKey = 'AIzaSyC...your-actual-key-here'`}
                    </pre>
                    <p className="text-xs text-orange-600 mt-2">
                      ⚠️ For production: Store API key in environment variables, not in code!
                    </p>
                  </div>
                </div>

                <div className="bg-sa-green/5 border border-sa-green/20 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-sa-green" />
                    Verification
                  </h4>
                  <p className="text-sm text-gray-700">
                    After completing setup, navigate to the "Service Requests" tab and click "Report Issue". 
                    You should see a map with a location picker.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  <strong>Cost Information:</strong> Google Maps offers $200/month free credit. 
                  Typical municipal portal usage should stay within free tier.
                  <a href="https://cloud.google.com/maps-platform/pricing" target="_blank" rel="noopener noreferrer" className="ml-2 text-sa-green hover:underline">
                    View pricing <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Setup */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>Supabase PostgreSQL setup and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription>
                  <strong>Database is Pre-configured!</strong> Your Supabase PostgreSQL database is already set up and running.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Available Tables:</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <code>kv_store_4c8674b4</code> - Key-value storage for all data
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Current Data Structure:</p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`- users:*           → User profiles and authentication
- bills:*           → Billing information
- payments:*        → Payment records
- issues:*          → Service requests
- audit_logs:*      → System audit trail
- transaction_fees:*→ Fee tracking`}
                </pre>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  The KV store is flexible and suitable for prototyping. For production, consider migrating to structured tables with proper indexing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Setup */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
              <CardDescription>POPIA compliance and security best practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-sa-green" />
                    POPIA Compliance Checklist
                  </h3>
                  <div className="ml-7 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Data Minimization</p>
                        <p className="text-xs text-gray-600">Only collect necessary personal information</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Audit Logging</p>
                        <p className="text-xs text-gray-600">All actions are logged immutably</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Encryption</p>
                        <p className="text-xs text-gray-600">Data encrypted in transit and at rest</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Access Control</p>
                        <p className="text-xs text-gray-600">Role-based permissions enforced</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-red-800 mb-2">Production Requirements</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Implement proper SSL/TLS certificates</li>
                    <li>• Enable two-factor authentication (2FA)</li>
                    <li>• Set up regular database backups</li>
                    <li>• Configure rate limiting and DDoS protection</li>
                    <li>• Perform security audit before launch</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-green-800 mb-2">Current Security Features</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ JWT-based authentication</li>
                    <li>✓ Session management</li>
                    <li>✓ Password hashing (bcrypt)</li>
                    <li>✓ Immutable audit logs</li>
                    <li>✓ Role-based access control (RBAC)</li>
                    <li>✓ SQL injection protection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Key className="w-5 h-5 text-sa-green" />
              <div>
                <p className="text-sm font-medium">Google Cloud Console</p>
                <p className="text-xs text-gray-500">Manage API keys</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>

            <a
              href="https://developers.google.com/maps/documentation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-5 h-5 text-sa-green" />
              <div>
                <p className="text-sm font-medium">Maps Documentation</p>
                <p className="text-xs text-gray-500">API references</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>

            <a
              href="https://supabase.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Database className="w-5 h-5 text-sa-green" />
              <div>
                <p className="text-sm font-medium">Supabase Docs</p>
                <p className="text-xs text-gray-500">Database & Auth</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>

            <a
              href="https://popia.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 text-sa-green" />
              <div>
                <p className="text-sm font-medium">POPIA Information</p>
                <p className="text-xs text-gray-500">Data protection law</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
