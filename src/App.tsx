import { useState, useEffect } from 'react'
import { AuthPage } from './components/AuthPage'
import { CitizenDashboard } from './components/CitizenDashboard'
import { AdminPanel } from './components/AdminPanel'
import { TransparencyPortal } from './components/TransparencyPortal'
import { UnifiedServicePortal } from './components/UnifiedServicePortal'
import { EParticipationTools } from './components/EParticipationTools'
import { ProcurementTransparency } from './components/ProcurementTransparency'
import { EnterpriseDashboard } from './components/EnterpriseDashboard'
import { GovernmentHeader } from './components/GovernmentHeader'
import { LanguageSelector } from './components/LanguageSelector'
import { OfflineSyncIndicator } from './components/OfflineSyncIndicator'
import { FeatureTour, useFeatureTour } from './components/FeatureTour'
import { Button } from './components/ui/button'
import { api } from './utils/api'
import { createClient } from './utils/supabase/client'
import { Language, getTranslation } from './utils/translations'
import { CacheManager } from './utils/offlineSync'
import { Building2, LogOut, BarChart3, Home, Settings, Grid3X3, Users, Package, HelpCircle, Briefcase } from 'lucide-react'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [currentView, setCurrentView] = useState<'unified' | 'dashboard' | 'admin' | 'transparency' | 'participation' | 'procurement' | 'enterprise'>('unified')
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguage] = useState<Language>('en')
  const [bills, setBills] = useState<any[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const { showTour, checkAndShowTour, resetTour, closeTour } = useFeatureTour()
  
  useEffect(() => {
    checkAuth()
    
    // Initialize offline cache (non-blocking)
    CacheManager.cacheResources().catch(err => {
      console.warn('Cache initialization failed (non-critical):', err)
    })
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred_language') as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
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
    loadUserData()
    // Show feature tour for new users after a short delay
    setTimeout(checkAndShowTour, 1000)
  }
  
  const loadUserData = async () => {
    try {
      const [billsData, issuesData, notificationsData] = await Promise.all([
        api.getBills().catch(() => ({ bills: [] })),
        api.getIssues().catch(() => ({ issues: [] })),
        api.getNotifications().catch(() => ({ notifications: [] })),
      ])
      setBills(billsData.bills || [])
      setIssues(issuesData.issues || [])
      setNotifications(notificationsData.notifications || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('preferred_language', lang)
  }
  
  const handleNavigate = (section: string) => {
    setCurrentView(section as any)
  }
  
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('access_token')
    setIsAuthenticated(false)
    setUser(null)
    setBills([])
    setIssues([])
    setNotifications([])
    setCurrentView('unified')
  }
  
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData()
      // Reload data every 30 seconds
      const interval = setInterval(loadUserData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])
  
  const t = (key: string) => getTranslation(language, key)
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }
  
  const isAdmin = user && ['admin', 'billing_officer', 'auditor', 'supervisor'].includes(user.role)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Government Header */}
      <GovernmentHeader />
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sa-green rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg">Municipal Portal</h1>
                <p className="text-xs text-gray-500">South African Citizen Services</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={resetTour} title="Show feature tour">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
              <div className="text-right mr-4 hidden sm:block">
                <p className="text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('signOut')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setCurrentView('unified')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'unified'
                  ? 'border-sa-green text-sa-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Grid3X3 className="w-4 h-4 inline mr-2" />
              {t('services')}
            </button>
            
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'border-sa-green text-sa-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              {t('dashboard')}
            </button>
            
            <button
              onClick={() => setCurrentView('participation')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'participation'
                  ? 'border-sa-green text-sa-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              {t('participation')}
            </button>
            
            <button
              onClick={() => setCurrentView('procurement')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'procurement'
                  ? 'border-sa-green text-sa-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              {t('procurement')}
            </button>
            
            {isAdmin && (
              <>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    currentView === 'admin'
                      ? 'border-sa-green text-sa-green'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  {t('admin')}
                </button>
                
                <button
                  onClick={() => setCurrentView('enterprise')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    currentView === 'enterprise'
                      ? 'border-sa-green text-sa-green'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Enterprise
                </button>
              </>
            )}
            
            <button
              onClick={() => setCurrentView('transparency')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === 'transparency'
                  ? 'border-sa-green text-sa-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              {t('transparency')}
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'unified' && (
          <UnifiedServicePortal
            user={user}
            bills={bills}
            issues={issues}
            notifications={notifications}
            language={language}
            onNavigate={handleNavigate}
          />
        )}
        
        {currentView === 'dashboard' && (
          isAdmin ? <AdminPanel user={user} /> : <CitizenDashboard user={user} />
        )}
        
        {currentView === 'participation' && (
          <EParticipationTools user={user} language={language} />
        )}
        
        {currentView === 'procurement' && (
          <ProcurementTransparency language={language} />
        )}
        
        {currentView === 'admin' && isAdmin && (
          <AdminPanel user={user} />
        )}
        
        {currentView === 'enterprise' && isAdmin && (
          <EnterpriseDashboard user={user} />
        )}
        
        {currentView === 'transparency' && (
          <TransparencyPortal />
        )}
      </main>
      
      {/* Offline Sync Indicator */}
      <OfflineSyncIndicator />
      
      {/* Feature Tour */}
      {showTour && <FeatureTour onClose={closeTour} />}
      
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
