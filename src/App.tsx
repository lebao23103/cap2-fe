import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'

// Lazy load all pages except Home for better performance
// Secondary Pages
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Feature Pages
const ReadNEx = lazy(() => import('./pages/ReadNEx'))
const NoteShare = lazy(() => import('./pages/NoteShare'))
const Create = lazy(() => import('./pages/Create'))
const BookDetail = lazy(() => import('./pages/BookDetail'))
const BookReader = lazy(() => import('./pages/BookReader'))
const BookQuiz = lazy(() => import('./pages/BookQuiz'))

// Auth Pages
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

// User Dashboard Pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MyNotes = lazy(() => import('./pages/MyNotes'))
const Chatbot = lazy(() => import('./pages/Chatbot'))
const Favorites = lazy(() => import('./pages/Favorites'))
const ReadingHistory = lazy(() => import('./pages/ReadingHistory'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

import './App.css'
import ScrollToTop from './components/ScrollToTop'

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

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
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Marketing Pages - Home is Eager */}
                      <Route path="/" element={<Home />} />

                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />

                      <Route path="/readnex" element={<ReadNEx />} />
                      <Route path="/noteshare" element={<NoteShare />} />
                      <Route path="/book/:id" element={<BookDetail />} />
                      <Route path="/book/:id/read" element={<BookReader />} />
                      <Route path="/book/:id/quiz" element={<BookQuiz />} />
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
                      {/* Redirect /profile to /dashboard */}
                      <Route path="/profile" element={<Navigate to="/dashboard" replace />} />

                      {/* Protected Admin Pages */}
                      <Route path="/admin" element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } />

                      {/* 404 Catch-all Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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