import { useState, useEffect } from 'react'
import { AuthPage } from './components/AuthPage'
import { CitizenDashboard } from './components/CitizenDashboard'
import { AdminPanel } from './components/AdminPanel'
import { TransparencyPortal } from './components/TransparencyPortal'
import { Button } from './components/ui/button'
import { api } from './utils/api'
import { createClient } from './utils/supabase/client'
import { Building2, LogOut, BarChart3, Home, Settings } from 'lucide-react'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin' | 'transparency'>('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token)
        const profile = await api.getUserProfile()
        setUser(profile.profile)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAuthSuccess = async () => {
    setIsAuthenticated(true)
    const profile = await api.getUserProfile()
    setUser(profile.profile)
  }
  
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('access_token')
    setIsAuthenticated(false)
    setUser(null)
    setCurrentView('dashboard')
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }
  
  const isAdmin = user && ['admin', 'billing_officer', 'auditor', 'supervisor'].includes(user.role)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg">Municipal Portal</h1>
                <p className="text-xs text-gray-500">South African Citizen Services</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              {isAdmin ? 'Overview' : 'My Dashboard'}
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  currentView === 'admin'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Admin Panel
              </button>
            )}
            
            <button
              onClick={() => setCurrentView('transparency')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'transparency'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Transparency
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          isAdmin ? <AdminPanel user={user} /> : <CitizenDashboard user={user} />
        )}
        
        {currentView === 'admin' && isAdmin && (
          <AdminPanel user={user} />
        )}
        
        {currentView === 'transparency' && (
          <TransparencyPortal />
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              South African Municipal Portal • Secure, Transparent, Citizen-Focused
            </p>
            <p className="text-xs text-gray-500">
              This is a prototype. For production use, ensure compliance with POPIA and data security regulations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
