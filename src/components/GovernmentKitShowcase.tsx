import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { 
  SABadge, 
  SAAlert, 
  SAStatCard, 
  SADepartmentBadge, 
  SAServiceLevel,
  SAPOPIACompliance,
  SAUserRoleBadge
} from './GovernmentKit'
import { GovernmentHeader } from './GovernmentHeader'
import { GovernmentBadge } from './GovernmentBadge'
import { Users, FileText, TrendingUp, AlertCircle } from 'lucide-react'

export function GovernmentKitShowcase() {
  return (
    <div className="space-y-8">
      {/* Header Demo */}
      <section>
        <h2 className="text-2xl mb-4">Government Header</h2>
        <Card>
          <CardContent className="p-0">
            <GovernmentHeader />
          </CardContent>
        </Card>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-2xl mb-4">Official Badges</h2>
        <Card>
          <CardHeader>
            <CardTitle>Badge Variants</CardTitle>
            <CardDescription>Standard government badge components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">SA Badge Component</p>
              <div className="flex flex-wrap gap-3">
                <SABadge label="Official" variant="official" />
                <SABadge label="Verified" variant="verified" />
                <SABadge label="Secure" variant="secure" />
                <SABadge label="POPIA Compliant" variant="compliance" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Size Variations</p>
              <div className="flex flex-wrap items-center gap-3">
                <SABadge label="Small" variant="official" size="sm" />
                <SABadge label="Medium" variant="official" size="md" />
                <SABadge label="Large" variant="official" size="lg" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Government Badge (Alternative)</p>
              <div className="flex flex-wrap gap-3">
                <GovernmentBadge label="Official" variant="official" />
                <GovernmentBadge label="Verified" variant="verified" />
                <GovernmentBadge label="Secure" variant="secure" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Department Badges</p>
              <div className="flex flex-wrap gap-3">
                <SADepartmentBadge name="Dept. of Water & Sanitation" />
                <SADepartmentBadge name="Dept. of Energy" />
                <SADepartmentBadge name="Municipal Services" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">User Role Badges</p>
              <div className="flex flex-wrap gap-3">
                <SAUserRoleBadge role="admin" />
                <SAUserRoleBadge role="billing_officer" />
                <SAUserRoleBadge role="auditor" />
                <SAUserRoleBadge role="supervisor" />
                <SAUserRoleBadge role="citizen" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="text-2xl mb-4">Government Alerts</h2>
        <Card>
          <CardHeader>
            <CardTitle>Alert Components</CardTitle>
            <CardDescription>SA-themed alert messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SAAlert
              title="Information Notice"
              description="This service is provided by the South African Government. All data is protected under POPIA regulations."
              variant="info"
            />
            <SAAlert
              title="Service Advisory"
              description="Scheduled maintenance will occur on weekends. Please plan your transactions accordingly."
              variant="warning"
            />
            <SAAlert
              title="Payment Successful"
              description="Your payment has been processed and a digital receipt has been generated."
              variant="success"
            />
          </CardContent>
        </Card>
      </section>

      {/* Statistics Cards */}
      <section>
        <h2 className="text-2xl mb-4">Statistics Cards</h2>
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
            description="Resolved this quarter"
          />
          <SAStatCard
            title="Revenue Collected"
            value="R 2.4M"
            icon={TrendingUp}
            trend={{ value: "15%", isPositive: true }}
            description="Municipal services revenue"
          />
        </div>
      </section>

      {/* Service Levels */}
      <section>
        <h2 className="text-2xl mb-4">Service Level Indicators</h2>
        <Card>
          <CardHeader>
            <CardTitle>Service Quality Metrics</CardTitle>
            <CardDescription>Performance indicators for municipal services</CardDescription>
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
      </section>

      {/* Compliance Indicators */}
      <section>
        <h2 className="text-2xl mb-4">Compliance Indicators</h2>
        <Card>
          <CardHeader>
            <CardTitle>POPIA Compliance Status</CardTitle>
            <CardDescription>Data protection compliance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Personal Data Processing</span>
                <SAPOPIACompliance isCompliant={true} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Retention Policy</span>
                <SAPOPIACompliance isCompliant={true} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Third-party Data Sharing</span>
                <SAPOPIACompliance isCompliant={false} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Color Palette */}
      <section>
        <h2 className="text-2xl mb-4">Official Color Palette</h2>
        <Card>
          <CardHeader>
            <CardTitle>South African Government Colors</CardTitle>
            <CardDescription>Official branding colors used throughout the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-full h-24 bg-sa-green rounded-lg border-2 border-gray-200"></div>
                <div className="text-center">
                  <p className="text-sm font-medium">SA Green</p>
                  <p className="text-xs text-gray-500">#007749</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 bg-sa-gold rounded-lg border-2 border-gray-200"></div>
                <div className="text-center">
                  <p className="text-sm font-medium">SA Gold</p>
                  <p className="text-xs text-gray-500">#FFBC40</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 bg-sa-red rounded-lg border-2 border-gray-200"></div>
                <div className="text-center">
                  <p className="text-sm font-medium">SA Red</p>
                  <p className="text-xs text-gray-500">#DE3831</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 bg-sa-blue rounded-lg border-2 border-gray-200"></div>
                <div className="text-center">
                  <p className="text-sm font-medium">SA Blue</p>
                  <p className="text-xs text-gray-500">#001489</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 bg-sa-black rounded-lg border-2 border-gray-200"></div>
                <div className="text-center">
                  <p className="text-sm font-medium">SA Black</p>
                  <p className="text-xs text-gray-500">#000000</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 bg-sa-white rounded-lg border-2 border-gray-200"></div>
                <div className="text-center">
                  <p className="text-sm font-medium">SA White</p>
                  <p className="text-xs text-gray-500">#FFFFFF</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Usage Guidelines */}
      <section>
        <h2 className="text-2xl mb-4">Usage Guidelines</h2>
        <Card className="border-sa-gold border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-sa-gold" />
              Implementation Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">Import Components</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`import {
  SABadge,
  SAAlert,
  SAStatCard,
  SADepartmentBadge,
  SAServiceLevel,
  SAPOPIACompliance,
  SAUserRoleBadge
} from './components/GovernmentKit'`}
              </pre>
            </div>

            <div>
              <p className="font-medium mb-2">CSS Variables Available</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`--sa-green: #007749
--sa-gold: #FFBC40
--sa-red: #DE3831
--sa-blue: #001489
--sa-black: #000000
--sa-white: #FFFFFF

Usage: bg-sa-green, text-sa-gold, border-sa-blue`}
              </pre>
            </div>

            <div className="bg-sa-green/5 border border-sa-green/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Best Practices</p>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Use official badges for government-endorsed content</li>
                <li>• Display POPIA compliance indicators on data collection forms</li>
                <li>• Include department badges for multi-department portals</li>
                <li>• Use service level indicators for transparency</li>
                <li>• Apply SA colors consistently for brand recognition</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
