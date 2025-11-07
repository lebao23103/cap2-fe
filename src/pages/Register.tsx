import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { BookOpen, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { FormInput, SubmitButton, PasswordStrengthIndicator, usePasswordStrength } from '../components/auth'
import { useErrorAnnouncement, useSuccessAnnouncement } from '../hooks/useAnnounce'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [generalError, setGeneralError] = useState('')

  // Password strength check
  const passwordStrength = usePasswordStrength(formData.password)

  // Accessibility: Announce errors and success
  useErrorAnnouncement(generalError)
  useSuccessAnnouncement(isSuccess, 'Registration successful! Redirecting...')

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    setGeneralError('')
    
    // Real-time validation if field has been touched
    if (touched[field]) {
      validateField(field, value)
    }
  }

  const handleBlur = (field: string) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field as keyof typeof formData])
  }

  const validateField = (field: string, value: string) => {
    let error = ''

    switch (field) {
      case 'firstName':
        if (!value.trim()) error = 'First name is required'
        break
      case 'lastName':
        if (!value.trim()) error = 'Last name is required'
        break
      case 'email':
        if (!value) {
          error = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address'
        }
        break
      case 'password':
        if (!value) {
          error = 'Password is required'
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters'
        } else if (passwordStrength.score < 2) {
          error = 'Please choose a stronger password'
        }
        break
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password'
        } else if (value !== formData.password) {
          error = 'Passwords do not match'
        }
        break
    }

    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }

  const validateForm = () => {
    const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword']
    const results = fields.map(field => validateField(field, formData[field as keyof typeof formData]))
    return results.every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    const allFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword']
    setTouched(Object.fromEntries(allFields.map(f => [f, true])))
    
    if (!validateForm()) return

    setIsLoading(true)
    setGeneralError('')
    
    try {
      // TODO: Implement registration API call
      console.log('Registration attempt:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success
      setIsSuccess(true)
      
      // Redirect after success animation
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
      
    } catch (error) {
      setGeneralError('Registration failed. Please try again.')
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
        className="w-full max-w-lg relative z-10"
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
            "A reader lives a thousand lives before he dies."
          </p>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">— George R.R. Martin</p>
        </motion.div>

        <Card className="w-full border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8 border-b border-border/30">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg"
            >
              <UserPlus className="h-8 w-8 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
              Create Your Account
            </h2>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              Join our community of readers and start your journey
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Registration form" noValidate>
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

              {/* Name fields in grid */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  error={touched.firstName ? errors.firstName : ''}
                  success={touched.firstName && !errors.firstName && formData.firstName.length > 0}
                  disabled={isLoading || isSuccess}
                  required
                  autoComplete="given-name"
                />
                <FormInput
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  error={touched.lastName ? errors.lastName : ''}
                  success={touched.lastName && !errors.lastName && formData.lastName.length > 0}
                  disabled={isLoading || isSuccess}
                  required
                  autoComplete="family-name"
                />
              </div>
              
              {/* Email field */}
              <FormInput
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email ? errors.email : ''}
                success={touched.email && !errors.email && formData.email.length > 0}
                disabled={isLoading || isSuccess}
                required
                autoComplete="email"
              />
              
              {/* Password field with strength indicator */}
              <div>
                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create your password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password ? errors.password : ''}
                  success={touched.password && !errors.password && passwordStrength.score >= 2}
                  showPasswordToggle
                  showPassword={showPassword}
                  onPasswordToggle={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isSuccess}
                  required
                  autoComplete="new-password"
                />
                {/* Password strength indicator */}
                <PasswordStrengthIndicator
                  password={formData.password}
                  show={formData.password.length > 0}
                  className="mt-2"
                />
              </div>
              
              {/* Confirm password field */}
              <FormInput
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword ? errors.confirmPassword : ''}
                success={touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword === formData.password}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || isSuccess}
                required
                autoComplete="new-password"
              />
              
              {/* Submit button with loading and success states */}
              <div className="pt-2">
                <SubmitButton
                  loading={isLoading}
                  success={isSuccess}
                  loadingText="Creating your account..."
                  successText="Success! Redirecting..."
                  className="h-12 text-base shadow-lg hover:shadow-xl"
                >
                  Create Account
                </SubmitButton>
              </div>
            </form>
            
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-center text-sm text-gray-600 dark:text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}