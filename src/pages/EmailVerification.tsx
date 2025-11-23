import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Mail, 
  ArrowRight,
  RefreshCcw
} from 'lucide-react'

type VerificationStatus = 'verifying' | 'success' | 'error' | 'expired'

export default function EmailVerification() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [resentSuccess, setResentSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setErrorMessage('No verification token provided')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/auth/verify-email/${verificationToken}`, {
      //   method: 'POST'
      // })
      
      // Simulate success/failure
      const isValid = verificationToken !== 'invalid'
      const isExpired = verificationToken === 'expired'
      
      if (isExpired) {
        setStatus('expired')
        setErrorMessage('Verification link has expired')
      } else if (isValid) {
        setStatus('success')
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      } else {
        setStatus('error')
        setErrorMessage('Invalid verification token')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to verify email. Please try again.')
    }
  }

  const handleResendEmail = async () => {
    setResending(true)
    setResentSuccess(false)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/resend-verification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: userEmail })
      // })
      
      setResentSuccess(true)
    } catch (error) {
      setErrorMessage('Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verifying Your Email</h2>
            <p className="text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          </motion.div>
        )

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-green-500/10 blur-2xl rounded-full" />
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-500" />
                </motion.div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-500">
              Email Verified Successfully!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your email has been verified. Redirecting you to your dashboard...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecting in 3 seconds</span>
            </div>
            <div className="mt-6">
              <Button onClick={() => navigate('/dashboard')} className="gap-2">
                Go to Dashboard Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <Mail className="h-16 w-16 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Link Expired</h2>
            <p className="text-muted-foreground mb-6">
              Your verification link has expired. Please request a new one.
            </p>
            {resentSuccess ? (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 mb-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Verification email sent! Please check your inbox.
                </p>
              </div>
            ) : (
              <Button 
                onClick={handleResendEmail} 
                disabled={resending}
                size="lg"
                className="gap-2"
              >
                {resending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            )}
          </motion.div>
        )

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full" />
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-500">
              Verification Failed
            </h2>
            <p className="text-muted-foreground mb-6">
              {errorMessage || 'We could not verify your email address.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {resentSuccess ? (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✓ Verification email sent! Please check your inbox.
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleResendEmail} 
                  disabled={resending}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  {resending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4" />
                      Resend Email
                    </>
                  )}
                </Button>
              )}
              <Button 
                onClick={() => navigate('/contact')} 
                size="lg"
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        )
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
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
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>
              {status === 'verifying' && 'Confirming your email address'}
              {status === 'success' && 'Your account is now active'}
              {status === 'expired' && 'Request a new verification link'}
              {status === 'error' && 'There was a problem verifying your email'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
            
            {/* Additional Help */}
            {(status === 'error' || status === 'expired') && (
              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Need help?
                </p>
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/faq" 
                    className="text-sm text-primary hover:underline"
                  >
                    Check our FAQ
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-sm text-primary hover:underline"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  Not redirecting?{' '}
                  <Link to="/dashboard" className="text-primary hover:underline font-medium">
                    Click here
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
