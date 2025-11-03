import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  Link,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  CreditCard,
  Database,
  Shield,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export interface Integration {
  id: string;
  name: string;
  type: 'payment' | 'compliance' | 'verification' | 'reporting';
  status: 'active' | 'inactive' | 'error' | 'pending';
  enabled: boolean;
  config: {
    [key: string]: any;
  };
  lastSync?: string;
  syncStatus?: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

interface ExternalIntegrationsProps {
  onSave?: (integrations: Integration[]) => void;
}

export function ExternalIntegrations({ onSave }: ExternalIntegrationsProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'payfast',
      name: 'PayFast',
      type: 'payment',
      status: 'inactive',
      enabled: false,
      config: {
        merchantId: '',
        merchantKey: '',
        passphrase: '',
        testMode: true
      }
    },
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'payment',
      status: 'inactive',
      enabled: false,
      config: {
        publicKey: '',
        secretKey: '',
        webhookSecret: ''
      }
    },
    {
      id: 'mfma',
      name: 'MFMA Compliance Database',
      type: 'compliance',
      status: 'inactive',
      enabled: false,
      config: {
        apiEndpoint: '',
        apiKey: '',
        municipalCode: ''
      }
    },
    {
      id: 'paia',
      name: 'PAIA (Promotion of Access to Information Act)',
      type: 'compliance',
      status: 'inactive',
      enabled: false,
      config: {
        registrationNumber: '',
        complianceOfficer: ''
      }
    },
    {
      id: 'national_treasury',
      name: 'National Treasury Portal',
      type: 'reporting',
      status: 'inactive',
      enabled: false,
      config: {
        organizationId: '',
        apiKey: ''
      }
    },
    {
      id: 'sars',
      name: 'SARS eFiling Integration',
      type: 'compliance',
      status: 'inactive',
      enabled: false,
      config: {
        taxReference: '',
        certificateFile: ''
      }
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-5 h-5" />;
      case 'compliance':
        return <Shield className="w-5 h-5" />;
      case 'verification':
        return <CheckCircle className="w-5 h-5" />;
      case 'reporting':
        return <FileText className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? { ...int, enabled: !int.enabled }
          : int
      )
    );
  };

  const updateConfig = (integrationId: string, configKey: string, value: any) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? {
              ...int,
              config: { ...int.config, [configKey]: value }
            }
          : int
      )
    );
  };

  const testConnection = async (integration: Integration) => {
    setTestingConnection(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? { ...int, status: 'active', syncStatus: 'success' }
            : int
        )
      );
      
      alert(`Connection to ${integration.name} successful!`);
    } catch (error) {
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? { ...int, status: 'error', syncStatus: 'error', errorMessage: 'Connection failed' }
            : int
        )
      );
      
      alert(`Connection to ${integration.name} failed. Please check your credentials.`);
    } finally {
      setTestingConnection(false);
    }
  };

  const syncIntegration = async (integration: Integration) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integration.id
          ? { ...int, syncStatus: 'pending' }
          : int
      )
    );

    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? {
                ...int,
                syncStatus: 'success',
                lastSync: new Date().toISOString()
              }
            : int
        )
      );
    } catch (error) {
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? { ...int, syncStatus: 'error' }
            : int
        )
      );
    }
  };

  const saveIntegrations = async () => {
    setIsSaving(true);
    try {
      // Save to server
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave?.(integrations);
      alert('Integration settings saved successfully');
    } catch (error) {
      alert('Failed to save integration settings');
    } finally {
      setIsSaving(false);
    }
  };

  const groupedIntegrations = integrations.reduce((acc, int) => {
    if (!acc[int.type]) acc[int.type] = [];
    acc[int.type].push(int);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            External Integrations
          </CardTitle>
          <CardDescription>
            Connect to payment gateways, compliance databases, and external systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              All API keys and credentials are encrypted at rest. Never share your credentials with anyone.
              Changes to integrations are logged in the audit trail.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="payment" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="reporting">Reporting</TabsTrigger>
            </TabsList>

            {Object.entries(groupedIntegrations).map(([type, integrationsInType]) => (
              <TabsContent key={type} value={type} className="space-y-4">
                {integrationsInType.map(integration => (
                  <Card key={integration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(integration.type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{integration.name}</span>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                            </div>
                            <div className="text-xs text-gray-500">
                              {integration.status === 'active' ? 'Connected' : 'Not configured'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={integration.enabled}
                            onCheckedChange={() => toggleIntegration(integration.id)}
                          />
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedIntegration(integration)}
                              >
                                <Settings className="w-3 h-3 mr-1" />
                                Configure
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{integration.name} Configuration</DialogTitle>
                                <DialogDescription>
                                  Configure connection settings and credentials
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                {Object.entries(integration.config).map(([key, value]) => (
                                  <div key={key} className="space-y-2">
                                    <Label className="text-sm">
                                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </Label>
                                    <Input
                                      type={key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') ? 'password' : 'text'}
                                      value={value}
                                      onChange={(e) => updateConfig(integration.id, key, e.target.value)}
                                      placeholder={`Enter ${key}`}
                                    />
                                  </div>
                                ))}

                                <Separator />

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => testConnection(integration)}
                                    disabled={testingConnection}
                                    variant="outline"
                                    className="flex-1"
                                  >
                                    {testingConnection ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Testing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Test Connection
                                      </>
                                    )}
                                  </Button>

                                  <Button
                                    onClick={saveIntegrations}
                                    disabled={isSaving}
                                    className="flex-1"
                                  >
                                    Save Configuration
                                  </Button>
                                </div>

                                {integration.errorMessage && (
                                  <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                      {integration.errorMessage}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {integration.enabled && integration.status === 'active' && (
                        <div className="space-y-2 text-sm">
                          <Separator />
                          <div className="flex items-center justify-between pt-2">
                            <div className="text-xs text-gray-500">
                              Last sync: {integration.lastSync
                                ? new Date(integration.lastSync).toLocaleString('en-ZA')
                                : 'Never'}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => syncIntegration(integration)}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Sync Now
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {integrationsInType.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No {type} integrations available
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Integration Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Integration Status</CardTitle>
          <CardDescription>Overview of all connected systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl mb-1">
                {integrations.filter(i => i.status === 'active').length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl mb-1">
                {integrations.filter(i => i.enabled).length}
              </div>
              <div className="text-xs text-gray-600">Enabled</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl mb-1">
                {integrations.filter(i => i.status === 'error').length}
              </div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl mb-1">
                {integrations.length}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
