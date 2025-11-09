import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Mail, ArrowLeft, Quote, KeyRound, CheckCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { ModernButton } from '../components/ui/modern'

// Zod validation schema
const resetPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    
    try {
      // TODO: Implement reset password API call
      console.log('Reset password request for:', data.email)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmittedEmail(data.email)
      setIsEmailSent(true)
    } catch (error) {
      console.error('Reset password failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = () => {
    const email = getValues('email')
    if (email) {
      onSubmit({ email })
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
        {/* Modern Quote */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-lg">
              <Quote className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">
            "Memory is the diary that we all carry about with us."
          </p>
          <p className="text-sm text-muted-foreground">— Oscar Wilde</p>
        </motion.div>

        <Card className="w-full border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8 border-b border-border/30">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br shadow-lg"
              style={{
                backgroundColor: isEmailSent ? 'rgba(34, 197, 94, 0.1)' : 'var(--primary-rgb, rgba(59, 130, 246, 0.1))',
                borderColor: isEmailSent ? 'rgba(34, 197, 94, 0.2)' : 'var(--primary-rgb, rgba(59, 130, 246, 0.2))'
              }}
            >
              {isEmailSent ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <KeyRound className="h-10 w-10 text-primary" />
              )}
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isEmailSent ? 'Check Your Email' : 'Reset Password'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEmailSent 
                ? 'We have sent password reset instructions to your email address'
                : 'Enter your email address and we will send you a link to reset your password'
              }
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-6">
            {isEmailSent ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-green-500/10 blur-2xl rounded-full" />
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/15 to-green-500/5 border border-green-500/20 shadow-lg">
                      <Mail className="h-10 w-10 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Password reset instructions have been sent to:
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {submittedEmail}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-5 rounded-xl border border-border/50 shadow-sm">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="font-semibold">Didn't receive the email?</strong><br/>
                      Check your spam folder or wait a few minutes. The email might take some time to arrive.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <ModernButton
                    onClick={handleResendEmail}
                    variant="secondary"
                    icon={Mail}
                    className="w-full h-11"
                  >
                    Resend Email
                  </ModernButton>
                  
                  <Link to="/login">
                    <ModernButton 
                      variant="ghost"
                      icon={ArrowLeft}
                      className="w-full h-11"
                    >
                      Back to Login
                    </ModernButton>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@example.com"
                    {...register('email')}
                    className={`bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 h-12 rounded-xl transition-all ${
                      errors.email && touchedFields.email ? 'border-destructive' : ''
                    }`}
                    disabled={isLoading}
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : 'email-hint'}
                  />
                  {errors.email && touchedFields.email ? (
                    <p id="email-error" className="text-xs text-destructive" role="alert">
                      {errors.email.message}
                    </p>
                  ) : (
                    <p id="email-hint" className="text-xs text-muted-foreground">
                      Enter the email address associated with your account
                    </p>
                  )}
                </div>
                
                <div className="pt-2">
                  <ModernButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Sparkles}
                    isLoading={isLoading}
                    className="w-full h-13 text-base shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? 'Sending instructions...' : 'Send Reset Link'}
                  </ModernButton>
                </div>
              </form>
            )}
            
            {!isEmailSent && (
              <div className="mt-8 pt-6 border-t border-border/30">
                <p className="text-center text-sm text-muted-foreground mb-3">
                  Remember your password?
                </p>
                <Link to="/login">
                  <ModernButton 
                    variant="ghost"
                    icon={ArrowLeft}
                    className="w-full"
                  >
                    Back to Login
                  </ModernButton>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
