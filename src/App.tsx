import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore'
import { AppLayout } from '@/components/layout'
import {
  AuthPage,
  HomePage,
  ProfilePage,
  BusinessProfilePage,
  WalletPage,
  NotificationsPage,
  ExplorePage,
} from '@/pages'
import { AboutPage } from '@/pages/AboutPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfileDemoPage } from '@/pages/ProfileDemoPage'
import { LegacyFounderImport } from '@/pages/admin/LegacyFounderImport'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminMDPManagement } from '@/pages/admin/AdminMDPManagement'
import { MBManagement } from '@/pages/admin/MBManagement'
import { BluetoothMDPRegister } from '@/pages/mdp/BluetoothMDPRegister'
import { MyTeamPage } from '@/pages/MyTeamPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthStore((state) => state.isLoading)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  // Show loading while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)' }}
          >
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <p className="text-gray-500">Loading MegaVX...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

// App Routes
function AppRoutes() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/terms" element={<PublicPlaceholder title="Terms & Conditions" />} />
      <Route path="/privacy" element={<PublicPlaceholder title="Privacy Policy" />} />
      <Route path="/help" element={<PublicPlaceholder title="Help Center" />} />

      {/* Demo/Dev routes (public for testing) */}
      <Route path="/demo" element={<ProfileDemoPage />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/messages" element={<PlaceholderPage title="Messages" description="Send and receive messages with your connections" />} />
        <Route path="/groups" element={<PlaceholderPage title="Groups" description="Join communities and connect with like-minded people" />} />
        <Route path="/pages" element={<PlaceholderPage title="Pages" description="Create and manage your business pages" />} />
        <Route path="/marketplace" element={<PlaceholderPage title="Marketplace" description="Buy and sell with MegaBucks" />} />
        <Route path="/jobs" element={<PlaceholderPage title="Jobs" description="Find opportunities and post job listings" />} />
        <Route path="/games" element={<PlaceholderPage title="Games" description="Play games and earn MegaBucks" />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/business" element={<BusinessProfilePage />} />
        <Route path="/my-team" element={<MyTeamPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/import-founders" element={<LegacyFounderImport />} />
        <Route path="/admin/mdp" element={<AdminMDPManagement />} />
        <Route path="/admin/megabucks" element={<MBManagement />} />

        {/* MDP routes */}
        <Route path="/mdp/register" element={<BluetoothMDPRegister />} />

        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pro" element={<PlaceholderPage title="Go Pro" description="Unlock premium features and boost your earnings" />} />
        <Route path="/hashtag/:tag" element={<PlaceholderPage title="Hashtag" description="Browse posts with this hashtag" />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Placeholder for pages coming soon
function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      {description && (
        <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>
      )}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
        style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
      >
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: '#6366f1' }}
        />
        <span className="text-sm font-medium">Coming Soon</span>
      </div>
    </div>
  )
}

// Public placeholder with dark theme
function PublicPlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="text-center px-6">
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#f5f5f5' }}>{title}</h1>
        <p className="mb-8" style={{ color: '#888888' }}>This page is coming soon.</p>
        <a
          href="/about"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
          style={{ background: 'linear-gradient(to right, #d4af37, #c9a227)', color: '#0a0a0a' }}
        >
          ← Back to About
        </a>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
