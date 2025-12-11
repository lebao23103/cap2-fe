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
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden font-mono">
      {/* Background Grid */}
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

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
            <div className="relative inline-flex items-center justify-center w-16 h-16 border-2 border-border bg-primary shadow-neo">
              <Quote className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <p className="text-lg font-bold text-foreground mb-2 uppercase font-display">
            "Memory is the diary that we all carry about with us."
          </p>
          <p className="text-sm text-muted-foreground font-mono font-bold">— Oscar Wilde</p>
        </motion.div>

        <Card className="w-full border-2 border-border shadow-neo-lg bg-card rounded-xl">
          <CardHeader className="text-center pb-8 pt-8 border-b-2 border-border">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className={`inline-flex items-center justify-center w-20 h-20 mx-auto mb-4 border-2 border-border shadow-neo ${isEmailSent ? 'bg-green-400' : 'bg-blue-400'}`}
            >
              {isEmailSent ? (
                <CheckCircle className="h-10 w-10 text-primary-foreground" />
              ) : (
                <KeyRound className="h-10 w-10 text-primary-foreground" />
              )}
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground mb-2 uppercase font-display">
              {isEmailSent ? 'Check Your Email' : 'Reset Password'}
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
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
                    <div className="relative inline-flex items-center justify-center w-20 h-20 border-2 border-border bg-green-100 shadow-neo">
                      <Mail className="h-10 w-10 text-foreground" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground font-mono">
                      Password reset instructions have been sent to:
                    </p>
                    <p className="text-lg font-bold text-foreground font-mono bg-yellow-100 inline-block px-2 border-2 border-border">
                      {submittedEmail}
                    </p>
                  </div>
                  <div className="bg-muted p-5 border-2 border-border shadow-neo">
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                      <strong className="font-bold text-foreground uppercase">Didn't receive the email?</strong><br />
                      Check your spam folder or wait a few minutes. The email might take some time to arrive.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <ModernButton
                    onClick={handleResendEmail}
                    variant="secondary"
                    icon={Mail}
                    className="w-full h-12"
                  >
                    Resend Email
                  </ModernButton>

                  <Link to="/login">
                    <ModernButton
                      variant="ghost"
                      icon={ArrowLeft}
                      className="w-full h-12"
                    >
                      Back to Login
                    </ModernButton>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-foreground uppercase">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@example.com"
                    {...register('email')}
                    className={`bg-background text-foreground border-2 border-border focus:ring-0 focus:border-foreground focus:shadow-neo h-12 rounded-lg transition-all font-bold ${errors.email && touchedFields.email ? 'border-destructive focus:border-destructive focus:shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]' : ''
                      }`}
                    disabled={isLoading}
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : 'email-hint'}
                  />
                  {errors.email && touchedFields.email ? (
                    <p id="email-error" className="text-xs text-red-500 font-bold flex items-center gap-1" role="alert">
                      <Sparkles className="h-3 w-3" />
                      {errors.email.message}
                    </p>
                  ) : (
                    <p id="email-hint" className="text-xs text-muted-foreground font-mono">
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
                    className="w-full h-14 text-base font-black uppercase tracking-wider bg-neo-yellow text-neo-black border-2 border-neo-yellow hover:bg-neo-yellow/90 hover:shadow-neo-hover"
                  >
                    {isLoading ? 'Sending instructions...' : 'Send Reset Link'}
                  </ModernButton>
                </div>
              </form>
            )}

            {!isEmailSent && (
              <div className="mt-8 pt-6 border-t-2 border-border">
                <p className="text-center text-sm text-muted-foreground mb-3 font-mono">
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
