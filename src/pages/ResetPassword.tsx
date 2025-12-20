import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent } from '../components/ui/card'
import { Mail, ArrowLeft, Check, Sparkles, Lock, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { ModernButton } from '../components/ui/modern'
import axios from 'axios'

// --- Schemas ---

const requestSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
})

const verifySchema = z.object({
  code: z.string().min(1, 'Confirmation code is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RequestFormData = z.infer<typeof requestSchema>
type VerifyFormData = z.infer<typeof verifySchema>

// --- Components ---

// 1. Request Form (Enter Email)
function RequestResetForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  })

  // API URL
  const API_BASE_URL = 'http://localhost:8000';

  const onSubmit = async (data: RequestFormData) => {
    setIsLoading(true)
    setApiError(null)
    try {
      await axios.post(`${API_BASE_URL}/api/forgot-password/`, { email: data.email })
      onSuccess(data.email)
    } catch (error: any) {
      console.error('Reset password failed:', error)
      setApiError(error.response?.data?.error || 'Failed to send reset link.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-black text-foreground uppercase tracking-wide">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your.name@example.com"
          autoComplete="email"
          {...register('email')}
          className={`h-12 bg-background text-foreground border-2 border-border font-bold font-mono focus:ring-0 focus:shadow-neo transition-all placeholder:text-muted-foreground ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-xs font-bold text-destructive flex items-center gap-1 mt-1">
            <Sparkles className="h-3 w-3" />
            {errors.email.message}
          </p>
        )}
      </div>

      {apiError && (
        <div className="bg-destructive/10 border-2 border-destructive p-3 shadow-neo">
          <p className="text-xs font-bold text-destructive font-mono text-center">{apiError}</p>
        </div>
      )}

      <div className="pt-2">
        <ModernButton
          type="submit"
          isLoading={isLoading}
          className="w-full h-14 text-base"
          variant="primary"
          icon={Sparkles}
          size="lg"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </ModernButton>
      </div>

      <div className="mt-8 pt-6 border-t-2 border-border">
        <Link to="/login" className="block w-full">
          <ModernButton variant="ghost" className="w-full h-12" icon={ArrowLeft}>
            Back to Login
          </ModernButton>
        </Link>
      </div>
    </form>
  )
}

// 2. Verify Form (Enter Code & New Password)
function VerifyResetForm({ email, onResend }: { email: string, onResend: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  })

  const API_BASE_URL = 'http://localhost:8000';

  const onSubmit = async (data: VerifyFormData) => {
    setIsLoading(true)
    setApiError(null)
    try {
      await axios.post(`${API_BASE_URL}/api/reset-password/`, {
        email,
        confirmation_code: data.code,
        new_password: data.newPassword,
      })
      // Should probably show a success message before redirecting, but for now redirect to login
      navigate('/login') // Or show a success state in parent
    } catch (error: any) {
      console.error('Verification failed:', error)
      setApiError(error.response?.data?.error || 'Failed to reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Context */}
      <div className="text-center space-y-2">
        <p className="text-sm font-bold text-muted-foreground font-mono">Code sent to:</p>
        <div className="bg-yellow-100 border-2 border-border py-2 px-4 shadow-neo inline-block w-full">
          <p className="text-lg font-black text-foreground font-mono truncate">{email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-black text-foreground uppercase tracking-wide">Confirmation Code</Label>
          <Input
            id="code"
            placeholder="Enter code"
            {...register('code')}
            className={`h-12 bg-background text-foreground border-2 border-border font-bold font-mono focus:shadow-neo ${errors.code ? 'border-destructive' : ''}`}
          />
          {errors.code && <p className="text-xs font-bold text-destructive mt-1">{errors.code.message}</p>}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-black text-foreground uppercase tracking-wide">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('newPassword')}
              className={`h-12 bg-background text-foreground border-2 border-border font-bold font-mono focus:shadow-neo pr-10 ${errors.newPassword ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && <p className="text-xs font-bold text-destructive mt-1">{errors.newPassword.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-black text-foreground uppercase tracking-wide">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={`h-12 bg-background text-foreground border-2 border-border font-bold font-mono focus:shadow-neo pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs font-bold text-destructive mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {apiError && (
          <div className="bg-destructive/10 border-2 border-destructive p-3 shadow-neo">
            <p className="text-xs font-bold text-destructive font-mono text-center">{apiError}</p>
          </div>
        )}

        <ModernButton
          type="submit"
          isLoading={isLoading}
          className="w-full h-14 text-base"
          variant="primary"
          icon={Check}
          size="lg"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </ModernButton>
      </form>

      {/* Info Box & Resend */}
      <div className="space-y-3 pt-2">
        <div className="bg-muted border-2 border-border p-3 shadow-neo">
          <p className="text-center text-xs font-bold text-foreground font-mono leading-relaxed">
            Didn't receive the code? Check spam folder.
          </p>
        </div>
        <ModernButton onClick={onResend} className="w-full h-10" variant="secondary" icon={Mail}>
          Resend Email
        </ModernButton>
      </div>
    </div>
  )
}

// --- Main Page Component ---

export default function ResetPassword() {
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [email, setEmail] = useState('')

  const handleRequestSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail)
    setStep('verify')
  }

  const handleResend = async () => {
    // Ideally duplicate the API call here or pass reuse logic, for simplicity we just log or re-trigger
    console.log("Resending to", email)
    // To truly resend, we need the logic here.
    // For now, let's keep it simple: The user can click "Resend" which triggers...
    // simpler: Move the resend logic into the component or just let them go back?
    // Let's implement a quick resend here:
    try {
      await axios.post(`http://localhost:8000/api/forgot-password/`, { email })
      alert("Code resent!")
    } catch (e) {
      alert("Failed to resend.")
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="w-full border-2 border-border shadow-neo-lg bg-card rounded-xl overflow-hidden">
          <div className="text-center pt-8 pb-6 border-b-2 border-border px-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary border-2 border-border flex items-center justify-center shadow-neo">
                {step === 'verify' ? <Lock className="w-10 h-10 text-primary-foreground stroke-[3]" /> : <Mail className="w-10 h-10 text-primary-foreground stroke-[3]" />}
              </div>
            </div>

            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4 font-display">
              {step === 'verify' ? 'Verify Code' : 'Reset Password'}
            </h2>

            <p className="text-sm font-bold text-muted-foreground font-mono max-w-[280px] mx-auto leading-relaxed">
              {step === 'verify'
                ? 'Enter the code sent to your email and set a new password.'
                : 'Enter your email address and we will send you a link to reset your password'
              }
            </p>
          </div>

          <CardContent className="p-6">
            {step === 'request' ? (
              <RequestResetForm onSuccess={handleRequestSuccess} />
            ) : (
              <VerifyResetForm email={email} onResend={handleResend} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
