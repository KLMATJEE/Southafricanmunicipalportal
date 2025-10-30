import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { toast } from 'sonner@2.0.3'
import { api } from '../utils/api'
import { Database, CheckCircle2, Loader2 } from 'lucide-react'

export function SampleDataInitializer() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initialized, setInitialized] = useState({
    forums: false,
    polls: false,
    tenders: false,
    suppliers: false,
    contracts: false,
  })

  const initializeSampleData = async () => {
    setIsInitializing(true)
    
    try {
      // Create sample discussions
      await api.createDiscussion({
        title: 'Improving Water Infrastructure in Ward 5',
        content: 'We need better water supply infrastructure in our area. Residents have been experiencing frequent water shortages.',
        category: 'Water',
      })
      await api.createDiscussion({
        title: 'Road Maintenance on Main Street',
        content: 'The potholes on Main Street are getting worse. This is a safety concern for all residents.',
        category: 'Roads',
      })
      setInitialized(prev => ({ ...prev, forums: true }))
      
      // Create sample polls
      await api.createPoll({
        question: 'What should be the municipality\'s top priority for 2026?',
        options: ['Water Infrastructure', 'Road Repairs', 'Public Safety', 'Waste Management'],
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      await api.createPoll({
        question: 'Should the municipality invest in solar energy?',
        options: ['Yes, definitely', 'Yes, but gradually', 'No, not now', 'I need more information'],
        endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
      })
      setInitialized(prev => ({ ...prev, polls: true }))
      
      // Create sample tenders
      await api.createTender({
        number: 'TEND-2025-001',
        title: 'Road Resurfacing Project - District A',
        description: 'Resurfacing of 15km of roads in District A including Main Street, Church Road, and Park Avenue.',
        category: 'Roads & Infrastructure',
        estimatedValue: 2500000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      })
      await api.createTender({
        number: 'TEND-2025-002',
        title: 'Water Pipeline Installation - Ward 5',
        description: 'Installation of new water pipelines to improve water supply to residential areas in Ward 5.',
        category: 'Water & Sanitation',
        estimatedValue: 1800000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      })
      await api.createTender({
        number: 'TEND-2025-003',
        title: 'Solar Panel Installation - Municipal Buildings',
        description: 'Supply and installation of solar panels for municipal buildings to reduce energy costs.',
        category: 'Energy',
        estimatedValue: 950000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      setInitialized(prev => ({ ...prev, tenders: true }))
      
      // Create sample suppliers
      await api.registerSupplier({
        name: 'BuildRight Construction',
        registrationNumber: 'CK2021/123456/23',
        specialization: 'Civil Engineering & Construction',
        rating: 4.5,
        completedProjects: 24,
        successRate: 92,
        bbbeeLevel: 3,
      })
      await api.registerSupplier({
        name: 'WaterTech Solutions',
        registrationNumber: 'CK2020/987654/23',
        specialization: 'Water Infrastructure',
        rating: 4.8,
        completedProjects: 18,
        successRate: 95,
        bbbeeLevel: 2,
      })
      await api.registerSupplier({
        name: 'GreenEnergy SA',
        registrationNumber: 'CK2022/456789/23',
        specialization: 'Renewable Energy',
        rating: 4.2,
        completedProjects: 12,
        successRate: 88,
        bbbeeLevel: 4,
      })
      setInitialized(prev => ({ ...prev, suppliers: true }))
      
      // Create sample contracts
      await api.createContract({
        contractNumber: 'CON-2024-045',
        title: 'Waste Collection Services - District B',
        supplierName: 'CleanCity Services',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
        totalValue: 1200000,
        paidAmount: 300000,
        status: 'active',
        milestones: [
          { name: 'Contract Signing', completed: true, dueDate: null },
          { name: 'Equipment Procurement', completed: true, dueDate: null },
          { name: 'Quarter 1 Services', completed: true, dueDate: null },
          { name: 'Quarter 2 Services', completed: false, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
          { name: 'Quarter 3 Services', completed: false, dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      })
      await api.createContract({
        contractNumber: 'CON-2024-032',
        title: 'Street Light Maintenance',
        supplierName: 'BrightLights Electrical',
        startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000).toISOString(),
        totalValue: 750000,
        paidAmount: 500000,
        status: 'active',
        milestones: [
          { name: 'Initial Assessment', completed: true, dueDate: null },
          { name: 'Phase 1 - District A', completed: true, dueDate: null },
          { name: 'Phase 2 - District B', completed: true, dueDate: null },
          { name: 'Phase 3 - District C', completed: false, dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      })
      setInitialized(prev => ({ ...prev, contracts: true }))
      
      toast.success('Sample data initialized successfully!')
    } catch (error) {
      console.error('Error initializing sample data:', error)
      toast.error('Failed to initialize some sample data. You may need admin permissions.')
    } finally {
      setIsInitializing(false)
    }
  }

  const allInitialized = Object.values(initialized).every(v => v)

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Demo Data Initializer
        </CardTitle>
        <CardDescription>
          Initialize sample data for E-Participation and Procurement features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2 text-sm">
              {initialized.forums ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 rounded-full border-gray-300" />
              )}
              <span>Discussions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {initialized.polls ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 rounded-full border-gray-300" />
              )}
              <span>Polls</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {initialized.tenders ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 rounded-full border-gray-300" />
              )}
              <span>Tenders</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {initialized.suppliers ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 rounded-full border-gray-300" />
              )}
              <span>Suppliers</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {initialized.contracts ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 rounded-full border-gray-300" />
              )}
              <span>Contracts</span>
            </div>
          </div>

          <Button
            onClick={initializeSampleData}
            disabled={isInitializing || allInitialized}
            className="w-full"
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : allInitialized ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Sample Data Initialized
              </>
            ) : (
              'Initialize Sample Data'
            )}
          </Button>

          {allInitialized && (
            <div className="text-xs text-gray-600 bg-white p-3 rounded-lg">
              <p className="mb-2">✅ Sample data created successfully!</p>
              <p>You can now explore:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Community discussions and forums</li>
                <li>Active polls and surveys</li>
                <li>Open tenders and procurement opportunities</li>
                <li>Registered suppliers with ratings</li>
                <li>Active contracts with milestones</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
