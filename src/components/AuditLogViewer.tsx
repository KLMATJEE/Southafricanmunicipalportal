import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { api } from '../utils/api'
import { Shield, Search, FileCheck } from 'lucide-react'

export function AuditLogViewer() {
  const [logs, setLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadAuditLogs()
  }, [])
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredLogs(filtered)
    } else {
      setFilteredLogs(logs)
    }
  }, [searchTerm, logs])
  
  const loadAuditLogs = async () => {
    try {
      const data = await api.getAuditLogs()
      setLogs(data.logs || [])
      setFilteredLogs(data.logs || [])
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-100 text-green-700'
    if (action.includes('updated')) return 'bg-blue-100 text-blue-700'
    if (action.includes('deleted')) return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>Immutable log of all system changes</CardDescription>
          </div>
          <Badge variant="outline" className="gap-2">
            <FileCheck className="w-3 h-3" />
            {logs.length} entries
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search logs by action, entity type, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading audit logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No matching logs found' : 'No audit logs yet'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionColor(log.action)}>
                          {log.action.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          on {log.entityType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Entity ID: {log.entityId}
                      </p>
                      <p className="text-sm text-gray-500">
                        User: {log.userId}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer text-blue-600 hover:text-blue-700">
                        View changes
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
