import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { SAStatCard, SAServiceLevel, SAPOPIACompliance, SADepartmentBadge } from './GovernmentKit'
import { GovernmentKitShowcase } from './GovernmentKitShowcase'
import { SetupGuide } from './SetupGuide'
import { GoogleMapsSetup } from './GoogleMapsSetup'
import { Users, FileText, TrendingUp, MapPin, Shield, Palette } from 'lucide-react'

interface AdminDashboardEnhancedProps {
  user: any
}

export function AdminDashboardEnhanced({ user }: AdminDashboardEnhancedProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}
          </p>
        </div>
        <SADepartmentBadge name="Municipal Administration" />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="setup">
            <MapPin className="w-4 h-4 mr-2" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="components">
            <Palette className="w-4 h-4 mr-2" />
            Gov Kit
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="guide">
            <FileText className="w-4 h-4 mr-2" />
            Guide
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SAStatCard
              title="Active Citizens"
              value="12,458"
              icon={Users}
              trend={{ value: "12%", isPositive: true }}
              description="Registered users this month"
            />
            <SAStatCard
              title="Service Requests"
              value="1,234"
              icon={FileText}
              trend={{ value: "8%", isPositive: false }}
              description="Total issues reported"
            />
            <SAStatCard
              title="Revenue Collected"
              value="R 2.4M"
              icon={TrendingUp}
              trend={{ value: "15%", isPositive: true }}
              description="Municipal services revenue"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Quality Metrics</CardTitle>
                <CardDescription>Current performance across departments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SAServiceLevel
                  level="excellent"
                  description="Water supply services - 99.8% uptime"
                />
                <SAServiceLevel
                  level="good"
                  description="Waste collection - On schedule"
                />
                <SAServiceLevel
                  level="fair"
                  description="Road maintenance - Moderate backlog"
                />
                <SAServiceLevel
                  level="poor"
                  description="Electricity supply - Requires improvement"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>POPIA Compliance Status</CardTitle>
                <CardDescription>Data protection compliance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Personal Data Processing</span>
                  <SAPOPIACompliance isCompliant={true} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Retention Policy</span>
                  <SAPOPIACompliance isCompliant={true} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Security Measures</span>
                  <SAPOPIACompliance isCompliant={true} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Third-party Sharing</span>
                  <SAPOPIACompliance isCompliant={false} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <GoogleMapsSetup />
          
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current configuration and health checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Database Connection</p>
                  <p className="text-xs text-gray-500">Supabase PostgreSQL</p>
                </div>
                <span className="text-green-600 text-sm font-medium">✓ Connected</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Authentication</p>
                  <p className="text-xs text-gray-500">Supabase Auth with JWT</p>
                </div>
                <span className="text-green-600 text-sm font-medium">✓ Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Google Maps API</p>
                  <p className="text-xs text-gray-500">Geolocation services</p>
                </div>
                <span className="text-orange-600 text-sm font-medium">⚠ Setup Required</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Audit Logging</p>
                  <p className="text-xs text-gray-500">Immutable event tracking</p>
                </div>
                <span className="text-green-600 text-sm font-medium">✓ Enabled</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components">
          <GovernmentKitShowcase />
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card className="border-sa-green border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-sa-green" />
                POPIA Compliance Framework
              </CardTitle>
              <CardDescription>
                Protection of Personal Information Act compliance status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Data Protection Principles</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="text-sm font-medium">Accountability</p>
                      <p className="text-xs text-gray-600">All data processing activities are logged and auditable</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="text-sm font-medium">Processing Limitation</p>
                      <p className="text-xs text-gray-600">Data collected only for legitimate municipal purposes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="text-sm font-medium">Purpose Specification</p>
                      <p className="text-xs text-gray-600">Clear purpose defined for all data collection</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="text-sm font-medium">Further Processing Limitation</p>
                      <p className="text-xs text-gray-600">Data not used for purposes incompatible with original</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="text-sm font-medium">Information Quality</p>
                      <p className="text-xs text-gray-600">Users can update and correct their information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="text-sm font-medium">Openness</p>
                      <p className="text-xs text-gray-600">Privacy policy available and data practices transparent</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="text-sm font-medium">Security Safeguards</p>
                      <p className="text-xs text-gray-600">Encryption, access control, and secure storage implemented</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="text-sm font-medium">Data Subject Participation</p>
                      <p className="text-xs text-gray-600">Citizens can access and request deletion of their data</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">Information Officer</h4>
                <p className="text-xs text-gray-700">
                  As required by POPIA, an Information Officer should be appointed to oversee compliance. 
                  Contact details must be made available to all data subjects.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guide Tab */}
        <TabsContent value="guide">
          <SetupGuide />
        </TabsContent>
      </Tabs>
    </div>
  )
}
