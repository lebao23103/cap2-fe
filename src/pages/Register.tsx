import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { BookOpen, UserPlus, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { FormInput, PasswordStrengthIndicator, usePasswordStrength } from '../components/auth'
import { ModernButton } from '../components/ui/modern'
import { useErrorAnnouncement, useSuccessAnnouncement } from '../hooks/useAnnounce'
import { useAuth } from '../contexts/AuthContext'

// Zod validation schema
const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
  const { register: authRegister } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [generalError, setGeneralError] = useState('')

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: hookFormSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  // Watch password for strength indicator
  const password = watch('password', '')
  const passwordStrength = usePasswordStrength(password)

  // Accessibility: Announce errors and success
  useErrorAnnouncement(generalError)
  useSuccessAnnouncement(isSuccess, 'Registration successful! Redirecting...')

  const onSubmit = async (data: RegisterFormData) => {

    setIsLoading(true)
    setGeneralError('')
    
    try {
      // Call AuthContext register (handles tokens, state AND navigation)
      await authRegister({
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        first_name: data.firstName,
        last_name: data.lastName
      })
      
      // Success! (AuthContext handles navigation to dashboard)
      setIsSuccess(true)
      
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.'
      setGeneralError(errorMessage)
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
            <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-5" aria-label="Registration form" noValidate>
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
                  {...register('firstName')}
                  error={touchedFields.firstName ? errors.firstName?.message : ''}
                  success={touchedFields.firstName && !errors.firstName}
                  disabled={isLoading || isSuccess}
                  required
                  autoComplete="given-name"
                />
                <FormInput
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  {...register('lastName')}
                  error={touchedFields.lastName ? errors.lastName?.message : ''}
                  success={touchedFields.lastName && !errors.lastName}
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
                {...register('email')}
                error={touchedFields.email ? errors.email?.message : ''}
                success={touchedFields.email && !errors.email}
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
                  {...register('password')}
                  error={touchedFields.password ? errors.password?.message : ''}
                  success={touchedFields.password && !errors.password && passwordStrength.score >= 2}
                  showPasswordToggle
                  showPassword={showPassword}
                  onPasswordToggle={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isSuccess}
                  required
                  autoComplete="new-password"
                />
                {/* Password strength indicator */}
                <PasswordStrengthIndicator
                  password={password}
                  show={password.length > 0}
                  className="mt-2"
                />
              </div>
              
              {/* Confirm password field */}
              <FormInput
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                {...register('confirmPassword')}
                error={touchedFields.confirmPassword ? errors.confirmPassword?.message : ''}
                success={touchedFields.confirmPassword && !errors.confirmPassword}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || isSuccess}
                required
                autoComplete="new-password"
              />
              
              {/* Submit button with loading and success states */}
              <div className="pt-2">
                <ModernButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={Sparkles}
                  isLoading={isLoading}
                  isSuccess={isSuccess}
                  loadingText="Creating your account..."
                  successText="Success! Redirecting..."
                  className="w-full h-12 text-base shadow-lg hover:shadow-xl"
                >
                  Create Account
                </ModernButton>
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