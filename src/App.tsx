import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext'
import { Layout } from './components/Layout'
// import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import ReadNEx from './pages/ReadNEx'
import NoteShare from './pages/NoteShare'
import BookReader from './pages/BookReader'
import BookQuiz from './pages/BookQuiz'
import Create from './pages/Create'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import Favorites from './pages/Favorites'
import ReadingHistory from './pages/ReadingHistory'
import AdminDashboard from './pages/AdminDashboard'
import BookDetail from './pages/BookDetail'
// import Profile from './pages/Profile'
// import Settings from './pages/Settings'
// import Privacy from './pages/Privacy'
// import Terms from './pages/Terms'
// import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="knowly-theme">
      <Router>
        <AuthProvider>
          <Layout>
            <div className="min-h-screen font-sans antialiased">
              <a href="#main-content" className="sr-only focus:not-sr-only fixed top-2 left-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg z-50">Skip to content</a>
              <main id="main-content">
              {/* <ErrorBoundary> */}
                <Routes>
                  {/* Public Marketing Pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  {/* <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} /> */}
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
                  {/* <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } /> */}
                  
                  {/* Protected Admin Pages */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 Catch-all Route */}
                  {/* <Route path="*" element={<NotFound />} /> */}
                </Routes>
              {/* </ErrorBoundary> */}
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