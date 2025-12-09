import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import ReadNEx from './pages/ReadNEx'
import NoteShare from './pages/NoteShare'
import Create from './pages/Create'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import MyNotes from './pages/MyNotes'
import Chatbot from './pages/Chatbot'
import Favorites from './pages/Favorites'
import ReadingHistory from './pages/ReadingHistory'
import BookDetail from './pages/BookDetail'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import './App.css'

// Lazy load heavy pages for better performance
const BookReader = lazy(() => import('./pages/BookReader'))
const BookQuiz = lazy(() => import('./pages/BookQuiz'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="knowly-theme">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <AuthProvider>
          <Layout>
            <div className="min-h-screen font-sans antialiased">
              <a href="#main-content" className="sr-only focus:not-sr-only fixed top-2 left-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg z-[60]">Skip to content</a>
              <main id="main-content">
                <ErrorBoundary>
                  <Routes>
                    {/* Public Marketing Pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/readnex" element={<ReadNEx />} />
                    <Route path="/noteshare" element={<NoteShare />} />
                    <Route path="/book/:id" element={<BookDetail />} />
                    <Route path="/book/:id/read" element={
                      <Suspense fallback={<PageLoader />}>
                        <BookReader />
                      </Suspense>
                    } />
                    <Route path="/book/:id/quiz" element={
                      <Suspense fallback={<PageLoader />}>
                        <BookQuiz />
                      </Suspense>
                    } />
                    <Route path="/create" element={<Create />} />

                    {/* Authentication Pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ResetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected User Pages */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/chatbot" element={
                      <ProtectedRoute>
                        <Chatbot />
                      </ProtectedRoute>
                    } />
                    <Route path="/favorites" element={
                      <ProtectedRoute>
                        <Favorites />
                      </ProtectedRoute>
                    } />
                    <Route path="/reading-history" element={
                      <ProtectedRoute>
                        <ReadingHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-notes" element={
                      <ProtectedRoute>
                        <MyNotes />
                      </ProtectedRoute>
                    } />
                    {/* Redirect /profile to /dashboard since Profile is now merged */}
                    <Route path="/profile" element={<Navigate to="/dashboard" replace />} />

                    {/* Protected Admin Pages */}
                    <Route path="/admin" element={
                      <ProtectedRoute requireAdmin={true}>
                        <Suspense fallback={<PageLoader />}>
                          <AdminDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    } />

                    {/* 404 Catch-all Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
              </main>
            </div>
          </Layout>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App