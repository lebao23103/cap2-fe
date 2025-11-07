import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { BookOpen, KeyRound } from 'lucide-react'
import { motion } from 'framer-motion'
import { FormInput, SubmitButton } from '../components/auth'
import { useErrorAnnouncement, useSuccessAnnouncement } from '../hooks/useAnnounce'

export default function Login() {
  const navigate = useNavigate()
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
      // TODO: Implement login API call
      console.log('Login attempt:', { email, password })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate success
      setIsSuccess(true)
      
      // Redirect after success animation
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
      
    } catch (error) {
      setGeneralError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="w-full max-w-md relative z-10"
      >
        {/* Hero Quote */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block text-center mb-8 px-4"
        >
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-lg">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">
            "Books are a uniquely portable magic."
          </p>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">— Stephen King</p>
        </motion.div>

        <Card className="w-full border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8 border-b border-border/30">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg"
            >
              <KeyRound className="h-8 w-8 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              Sign in to continue your literary journey
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
                  <span className="text-sm font-medium">
                    Password <span className="text-destructive">*</span>
                  </span>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    tabIndex={isLoading || isSuccess ? -1 : 0}
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormInput
                  label=""
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
              
              {/* Submit button with loading and success states */}
              <div className="pt-2">
                <SubmitButton
                  loading={isLoading}
                  success={isSuccess}
                  loadingText="Signing you in..."
                  successText="Success! Redirecting..."
                  className="h-12 text-base shadow-lg hover:shadow-xl"
                >
                  Sign In
                </SubmitButton>
              </div>
            </form>
            
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-center text-sm text-gray-600 dark:text-muted-foreground">
                New to our platform?{' '}
                <Link 
                  to="/register" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}