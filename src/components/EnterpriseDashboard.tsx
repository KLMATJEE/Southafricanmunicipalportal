import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { AdvancedMapViewer } from './AdvancedMapViewer';
import { WorkflowEngine } from './WorkflowEngine';
import { NotificationService } from './NotificationService';
import { ReportGenerator } from './ReportGenerator';
import { ExternalIntegrations } from './ExternalIntegrations';
import { 
  Map, 
  GitBranch, 
  Bell, 
  BarChart3, 
  Link, 
  TrendingUp,
  FileText,
  Users,
  CheckCircle
} from 'lucide-react';

interface EnterpriseDashboardProps {
  user: any;
}

export function EnterpriseDashboard({ user }: EnterpriseDashboardProps) {
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState(0);

  // Sample workflow for demo
  const sampleWorkflow = {
    id: 'workflow_demo_001',
    type: 'license_application',
    title: 'Business License Application - ABC Trading',
    description: 'New business license for retail operation in Ward 12',
    initiatedBy: 'John Citizen',
    initiatedAt: '2025-11-01T10:00:00Z',
    currentStep: 0,
    status: 'in_review' as const,
    steps: [
      {
        id: 'step1',
        name: 'Initial Review',
        description: 'Verify application completeness and required documents',
        assignedRole: user.role,
        status: 'in_progress' as const,
        requiredDocuments: ['ID Document', 'Proof of Address', 'Business Plan'],
        deadline: '2025-11-10T17:00:00Z'
      },
      {
        id: 'step2',
        name: 'Compliance Check',
        description: 'Verify regulatory and zoning compliance',
        assignedRole: 'compliance_officer',
        status: 'pending' as const,
        deadline: '2025-11-15T17:00:00Z'
      },
      {
        id: 'step3',
        name: 'Final Approval',
        description: 'Manager sign-off and license issuance',
        assignedRole: 'manager',
        status: 'pending' as const,
        deadline: '2025-11-20T17:00:00Z'
      }
    ],
    documents: [
      {
        id: 'doc1',
        name: 'ID_Document.pdf',
        type: 'identification',
        uploadedAt: '2025-11-01T09:30:00Z',
        uploadedBy: 'John Citizen',
        size: 245000,
        status: 'pending_review' as const
      },
      {
        id: 'doc2',
        name: 'Proof_of_Address.pdf',
        type: 'address',
        uploadedAt: '2025-11-01T09:35:00Z',
        uploadedBy: 'John Citizen',
        size: 180000,
        status: 'pending_review' as const
      }
    ],
    comments: [
      {
        id: 'comment1',
        userId: 'user123',
        userName: 'John Citizen',
        text: 'All required documents have been uploaded. Please review at your earliest convenience.',
        timestamp: '2025-11-01T10:00:00Z'
      }
    ]
  };

  const handleWorkflowAction = async (action: string, data: any) => {
    console.log('Workflow action:', action, data);
    // In production, this would call the API
    alert(`Workflow ${action} completed. This would be saved to the database in production.`);
  };

  const stats = [
    {
      title: 'Active Workflows',
      value: '12',
      change: '+3 this week',
      icon: GitBranch,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Actions',
      value: '5',
      change: 'Requires attention',
      icon: Bell,
      color: 'text-orange-600'
    },
    {
      title: 'Reports Generated',
      value: '28',
      change: '+8 this month',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'Integrations Active',
      value: '6',
      change: 'All operational',
      icon: CheckCircle,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl mb-2">Enterprise Management</h2>
        <p className="text-gray-600">
          Advanced GIS, workflow automation, reporting, and integrations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{stat.title}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.change}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="gis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="gis">
            <Map className="w-4 h-4 mr-2" />
            GIS
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <GitBranch className="w-4 h-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Link className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Information System</CardTitle>
              <CardDescription>
                Interactive maps with infrastructure, sanitation, water, and service layers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedMapViewer
                center={[-26.2041, 28.0473]}
                zoom={12}
                enableAnalytics={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
              <CardDescription>
                Multi-step approval processes with role-based access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Badge variant="outline" className="mb-2">Demo Workflow</Badge>
                <p className="text-sm text-gray-600">
                  This is a sample workflow demonstrating the approval process. 
                  In production, workflows are created through the system and assigned automatically.
                </p>
              </div>
              
              <WorkflowEngine
                workflow={sampleWorkflow}
                userRole={user.role}
                userId={user.id}
                onAction={handleWorkflowAction}
                readOnly={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationService
            userId={user.id}
            onNotificationClick={(notification) => {
              console.log('Notification clicked:', notification);
            }}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportGenerator userRole={user.role} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <ExternalIntegrations
            onSave={async (integrations) => {
              console.log('Saving integrations:', integrations);
              // In production, save to server
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="p-4 border rounded hover:bg-gray-50 text-left">
              <GitBranch className="w-5 h-5 mb-2 text-blue-600" />
              <div className="text-sm">Create Workflow</div>
            </button>
            <button className="p-4 border rounded hover:bg-gray-50 text-left">
              <BarChart3 className="w-5 h-5 mb-2 text-green-600" />
              <div className="text-sm">Generate Report</div>
            </button>
            <button className="p-4 border rounded hover:bg-gray-50 text-left">
              <Map className="w-5 h-5 mb-2 text-purple-600" />
              <div className="text-sm">View GIS Data</div>
            </button>
            <button className="p-4 border rounded hover:bg-gray-50 text-left">
              <Link className="w-5 h-5 mb-2 text-orange-600" />
              <div className="text-sm">Manage Integrations</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
