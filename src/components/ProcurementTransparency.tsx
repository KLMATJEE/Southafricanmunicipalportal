import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import {
  FileText,
  Building2,
  Award,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Download,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { api } from '../utils/api'
import { Language, getTranslation } from '../utils/translations'

interface ProcurementTransparencyProps {
  language: Language
}

export function ProcurementTransparency({ language }: ProcurementTransparencyProps) {
  const [tenders, setTenders] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const t = (key: string) => getTranslation(language, key)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tendersData, suppliersData, contractsData] = await Promise.all([
        api.getTenders(),
        api.getSuppliers(),
        api.getContracts(),
      ])
      setTenders(tendersData.tenders || [])
      setSuppliers(suppliersData.suppliers || [])
      setContracts(contractsData.contracts || [])
    } catch (error) {
      console.error('Error loading procurement data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.number?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || tender.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const activeTenders = tenders.filter((t) => t.status === 'active').length
  const totalValue = tenders.reduce((sum, t) => sum + (t.estimatedValue || 0), 0)
  const averageSupplierRating =
    suppliers.length > 0
      ? suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length
      : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2">{t('procurement')} Transparency</h1>
        <p className="text-gray-600">Public access to tenders, suppliers, and contracts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('activeTenders')}</p>
                <p className="text-2xl mt-1">{activeTenders}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total {t('value')}</p>
                <p className="text-2xl mt-1">R{(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('suppliers')}</p>
                <p className="text-2xl mt-1">{suppliers.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl mt-1">{averageSupplierRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={`${t('search')} ${t('tenders').toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="awarded">Awarded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="tenders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tenders">{t('tenders')}</TabsTrigger>
          <TabsTrigger value="suppliers">{t('suppliers')}</TabsTrigger>
          <TabsTrigger value="contracts">{t('contracts')}</TabsTrigger>
        </TabsList>

        {/* Tenders Tab */}
        <TabsContent value="tenders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('activeTenders')}</CardTitle>
              <CardDescription>Open procurement opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTenders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tenders found matching your criteria
                  </div>
                ) : (
                  filteredTenders.map((tender) => {
                    const daysLeft = Math.ceil(
                      (new Date(tender.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )
                    const isUrgent = daysLeft <= 7 && daysLeft > 0

                    return (
                      <div key={tender.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-sm">{tender.title}</h3>
                              <Badge
                                variant={
                                  tender.status === 'active'
                                    ? 'default'
                                    : tender.status === 'awarded'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {tender.status}
                              </Badge>
                              {isUrgent && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              {t('tenderNumber')}: {tender.number}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">{tender.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm">{tender.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Estimated {t('value')}</p>
                            <p className="text-sm">R{tender.estimatedValue?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('deadline')}</p>
                            <p className="text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(tender.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Days Left</p>
                            <p className={`text-sm ${isUrgent ? 'text-red-600' : ''}`}>
                              {daysLeft > 0 ? daysLeft : 'Closed'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download Documents
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('view')} Details
                          </Button>
                          {tender.status === 'active' && (
                            <Button size="sm" className="ml-auto">
                              Submit Bid
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('suppliers')} Directory</CardTitle>
              <CardDescription>Registered suppliers and their performance ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No suppliers registered
                  </div>
                ) : (
                  suppliers.map((supplier) => (
                    <div key={supplier.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-sm mb-1">{supplier.name}</h3>
                            <p className="text-xs text-gray-500 mb-2">
                              Reg: {supplier.registrationNumber}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(supplier.rating || 0)
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm">{supplier.rating?.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                          {supplier.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Specialization</p>
                          <p className="text-sm">{supplier.specialization}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Completed Projects</p>
                          <p className="text-sm">{supplier.completedProjects || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Success Rate</p>
                          <p className="text-sm">{supplier.successRate || 0}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">BBBEE Level</p>
                          <p className="text-sm">Level {supplier.bbbeeLevel || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Performance Score</p>
                          <Progress value={(supplier.rating || 0) * 20} className="h-2" />
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Contract History
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('contracts')}</CardTitle>
              <CardDescription>Active and completed contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No contracts to display
                  </div>
                ) : (
                  contracts.map((contract) => {
                    const progress = contract.totalValue
                      ? (contract.paidAmount / contract.totalValue) * 100
                      : 0

                    return (
                      <div key={contract.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-sm">{contract.title}</h3>
                              <Badge
                                variant={
                                  contract.status === 'active'
                                    ? 'default'
                                    : contract.status === 'completed'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {contract.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              Contract: {contract.contractNumber} • Supplier: {contract.supplierName}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="text-sm">{new Date(contract.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">End Date</p>
                            <p className="text-sm">{new Date(contract.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total {t('value')}</p>
                            <p className="text-sm">R{contract.totalValue?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Paid Amount</p>
                            <p className="text-sm">R{contract.paidAmount?.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Contract Progress</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {contract.milestones && contract.milestones.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Milestones</p>
                            <div className="space-y-2">
                              {contract.milestones.map((milestone: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  {milestone.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-gray-400" />
                                  )}
                                  <span className={milestone.completed ? 'text-gray-600' : ''}>
                                    {milestone.name}
                                  </span>
                                  {!milestone.completed && milestone.dueDate && (
                                    <span className="text-xs text-gray-500 ml-auto">
                                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download Contract
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
