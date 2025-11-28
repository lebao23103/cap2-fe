import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { FormInput } from '../components/auth'
import { ModernButton } from '../components/ui/modern'
import { useErrorAnnouncement, useSuccessAnnouncement } from '../hooks/useAnnounce'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')

  // Accessibility: Announce errors and success
  useErrorAnnouncement(generalError)
  useSuccessAnnouncement(isSuccess, 'Login successful! Redirecting...')

  // Real-time email validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  // Real-time password validation
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required')
      return false
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setGeneralError('') // Clear general error on input
    // Only validate if user has already interacted with the field
    if (email || value) {
      validateEmail(value)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setGeneralError('') // Clear general error on input
    // Only validate if user has already interacted with the field
    if (password || value) {
      validatePassword(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setIsLoading(true)
    setGeneralError('')

    try {
      // Call AuthContext login (handles tokens AND state)
      await login(email, password)

      // Success! (AuthContext handles navigation)
      setIsSuccess(true)

    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Invalid email or password. Please try again.'
      setGeneralError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 px-4">
        {/* Left Side - Hero Content (Hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col max-w-lg"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Knowly
            </h1>
          </div>

          <h2 className="text-4xl font-bold text-foreground mb-6 leading-tight">
            Welcome back to your <br />
            <span className="text-primary">Knowledge Hub</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            "Books are a uniquely portable magic." <br />
            <span className="text-sm font-medium text-foreground/80">— Stephen King</span>
          </p>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Join <span className="font-bold text-foreground">15k+</span> learners today
            </p>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="w-full border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Sign In
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign in form">
                {/* General error message */}
                {generalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    role="alert"
                  >
                    <p className="text-sm text-destructive font-medium">{generalError}</p>
                  </motion.div>
                )}

                {/* Email field with validation */}
                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="your.name@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  error={emailError}
                  success={!emailError && email.length > 0}
                  disabled={isLoading || isSuccess}
                  required
                  autoComplete="email"
                />

                {/* Password field with toggle */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors ml-auto"
                      tabIndex={isLoading || isSuccess ? -1 : 0}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormInput
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => validatePassword(password)}
                    error={passwordError}
                    success={!passwordError && password.length >= 6}
                    showPasswordToggle
                    showPassword={showPassword}
                    onPasswordToggle={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isSuccess}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="pt-2">
                  <ModernButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Sparkles}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    loadingText="Signing you in..."
                    successText="Success! Redirecting..."
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-primary/25"
                  >
                    Sign In
                  </ModernButton>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-border/50 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Don't have an account yet?
                </p>
                <Button
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                  asChild
                >
                  <Link to="/register">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
