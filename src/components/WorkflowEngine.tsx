import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  FileText, 
  User,
  ArrowRight,
  MessageSquare,
  Download,
  Upload,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  assignedRole: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'skipped';
  completedAt?: string;
  completedBy?: string;
  comments?: string;
  requiredDocuments?: string[];
  deadline?: string;
}

export interface WorkflowInstance {
  id: string;
  type: string;
  title: string;
  description: string;
  initiatedBy: string;
  initiatedAt: string;
  currentStep: number;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'archived';
  steps: WorkflowStep[];
  documents: WorkflowDocument[];
  comments: WorkflowComment[];
  metadata?: any;
}

export interface WorkflowDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
  size?: number;
  status: 'pending_review' | 'approved' | 'rejected';
}

export interface WorkflowComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  stepId?: string;
}

interface WorkflowEngineProps {
  workflow: WorkflowInstance;
  userRole: string;
  userId: string;
  onAction: (action: string, data: any) => Promise<void>;
  readOnly?: boolean;
}

export function WorkflowEngine({ workflow, userRole, userId, onAction, readOnly = false }: WorkflowEngineProps) {
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentStep = workflow.steps[workflow.currentStep];
  const canActOnCurrentStep = currentStep && currentStep.assignedRole === userRole && !readOnly;
  const progressPercentage = (workflow.steps.filter(s => s.status === 'completed').length / workflow.steps.length) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'draft': 'secondary',
      'submitted': 'default',
      'in_review': 'default',
      'approved': 'default',
      'rejected': 'destructive',
      'archived': 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleApprove = async () => {
    if (!comment.trim()) {
      alert('Please add a comment before approving');
      return;
    }
    
    setIsProcessing(true);
    try {
      await onAction('approve', { stepId: currentStep.id, comment });
      setComment('');
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setIsProcessing(true);
    try {
      await onAction('reject', { stepId: currentStep.id, comment });
      setComment('');
    } catch (error) {
      console.error('Rejection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!comment.trim()) {
      alert('Please specify what changes are needed');
      return;
    }
    
    setIsProcessing(true);
    try {
      await onAction('request_changes', { stepId: currentStep.id, comment });
      setComment('');
    } catch (error) {
      console.error('Request changes error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {workflow.title}
              </CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
            </div>
            {getStatusBadge(workflow.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Initiated By</div>
              <div className="flex items-center gap-1 mt-1">
                <User className="w-3 h-3" />
                {workflow.initiatedBy}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Initiated At</div>
              <div className="mt-1">
                {new Date(workflow.initiatedAt).toLocaleDateString('en-ZA')}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Current Step</div>
              <div className="mt-1">
                {workflow.currentStep + 1} of {workflow.steps.length}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Progress</div>
              <div className="mt-1">{Math.round(progressPercentage)}%</div>
            </div>
          </div>
          
          <div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>Track the approval process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="relative">
                {index < workflow.steps.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                )}
                
                <div className={`flex gap-4 p-4 rounded-lg border ${
                  index === workflow.currentStep ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}>
                  <div className="flex-shrink-0">
                    {getStatusIcon(step.status)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{step.name}</span>
                          {index === workflow.currentStep && (
                            <Badge variant="outline" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{step.description}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {step.assignedRole}
                      </Badge>
                    </div>

                    {step.deadline && (
                      <div className={`text-xs flex items-center gap-1 ${
                        isOverdue(step.deadline) ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        Deadline: {new Date(step.deadline).toLocaleDateString('en-ZA')}
                        {isOverdue(step.deadline) && ' (Overdue)'}
                      </div>
                    )}

                    {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                      <div className="text-xs text-gray-600">
                        Required: {step.requiredDocuments.join(', ')}
                      </div>
                    )}

                    {step.completedAt && (
                      <div className="text-xs text-gray-500">
                        Completed by {step.completedBy} on {new Date(step.completedAt).toLocaleString('en-ZA')}
                      </div>
                    )}

                    {step.comments && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
                          <MessageSquare className="w-3 h-3" />
                          Comment
                        </div>
                        {step.comments}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {workflow.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Attached files and supporting documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workflow.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm">{doc.name}</div>
                      <div className="text-xs text-gray-500">
                        Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleDateString('en-ZA')}
                        {doc.size && ` • ${(doc.size / 1024).toFixed(1)} KB`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc.status)}
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Comments & Communication</CardTitle>
          <CardDescription>Workflow history and discussions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workflow.comments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-blue-200 pl-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3 h-3" />
                <span className="text-sm">{comment.userName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.timestamp).toLocaleString('en-ZA')}
                </span>
              </div>
              <div className="text-sm text-gray-700">{comment.text}</div>
            </div>
          ))}

          {workflow.comments.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No comments yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Panel */}
      {canActOnCurrentStep && currentStep.status === 'in_progress' && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle>Your Action Required</CardTitle>
            <CardDescription>
              You are assigned to review this step: {currentStep.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm mb-2 block">Add Comment *</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Provide your feedback, decision rationale, or required changes..."
                rows={4}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Your comment is required and will be recorded in the audit trail.
                All actions are logged and immutable.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button 
                onClick={handleApprove}
                disabled={isProcessing || !comment.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              
              <Button 
                onClick={handleRequestChanges}
                disabled={isProcessing || !comment.trim()}
                variant="outline"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
              
              <Button 
                onClick={handleReject}
                disabled={isProcessing || !comment.trim()}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {readOnly && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This workflow is in read-only mode. You do not have permission to make changes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
