import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { FormInput, PasswordStrengthIndicator, usePasswordStrength } from '../components/auth'
import { ModernButton } from '../components/ui/modern'
import { useErrorAnnouncement, useSuccessAnnouncement } from '../hooks/useAnnounce'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'

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
      // Call AuthContext register (handles navigation)
      await authRegister({
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        first_name: data.firstName,
        last_name: data.lastName
      })

      // Success! AuthContext will redirect to dashboard or login page
      setIsSuccess(true)

    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.'
      setGeneralError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 px-4">
        {/* Left Side - Hero Content (Hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col max-w-lg"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 border-2 border-black dark:border-white bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <BookOpen className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-4xl font-bold text-foreground uppercase tracking-tight font-display">
              Knowly
            </h1>
          </div>

          <h2 className="text-4xl font-bold text-foreground mb-6 leading-tight uppercase font-display">
            Start your journey <br />
            with <span className="bg-primary text-black px-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">Knowly</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-mono">
            "A reader lives a thousand lives before he dies." <br />
            <span className="text-sm font-bold text-foreground">— George R.R. Martin</span>
          </p>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 border-2 border-black dark:border-white bg-white overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Join <span className="font-bold text-foreground">15k+</span> learners today
            </p>
          </div>
        </motion.div>

        {/* Right Side - Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <Card className="w-full border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-none">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="p-3 border-2 border-black dark:border-white bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <BookOpen className="h-6 w-6 text-black" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2 uppercase font-display">
                Create Account
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
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
                    className="p-3 bg-red-100 dark:bg-red-900/30 border-2 border-black dark:border-red-400 text-red-600 dark:text-red-300 font-bold font-mono"
                    role="alert"
                  >
                    <p className="text-sm">{generalError}</p>
                  </motion.div>
                )}

                {/* Name fields in grid */}
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="First Name"
                    type="text"
                    placeholder="Your first name"
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
                    placeholder="Your last name"
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
                  placeholder="yourmail@example.com"
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
                    successText="Account created!"
                    className="w-full h-12 text-base font-bold"
                  >
                    Create Account
                  </ModernButton>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t-2 border-black dark:border-white text-center">
                <p className="text-sm text-muted-foreground mb-4 font-mono">
                  Already have an account?
                </p>
                <Button
                  variant="outline"
                  className="w-full border-2 border-black dark:border-white rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:text-white transition-all uppercase font-bold"
                  asChild
                >
                  <Link to="/login">
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
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