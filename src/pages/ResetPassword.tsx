import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Mail, ArrowLeft, Quote, KeyRound, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: Implement reset password API call
    console.log('Reset password request for:', email)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsEmailSent(true)
    }, 2000)
  }

  const handleResendEmail = () => {
    setIsEmailSent(false)
    handleSubmit(new Event('submit') as any)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
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
          <Quote className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-lg italic text-foreground">
            "Memory is the diary that we all carry about with us."
          </p>
          <p className="text-sm text-muted-foreground mt-1">— Oscar Wilde</p>
        </motion.div>

        <Card className="w-full border-0 shadow-xl bg-card">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {isEmailSent ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <KeyRound className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-3xl text-foreground">
              {isEmailSent ? 'Check Your Email' : 'Reset Password'}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {isEmailSent 
                ? 'We have sent password reset instructions to your email address'
                : 'Enter your email address and we will send you a link to reset your password'
              }
            </p>
          </CardHeader>
          <CardContent>
            {isEmailSent ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Password reset instructions have been sent to:
                    </p>
                    <p className="font-semibold text-foreground">
                      {email}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">
                      <strong>Didn't receive the email?</strong> Check your spam folder or wait a few minutes. 
                      The email might take some time to arrive.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full border-input hover:bg-accent text-foreground"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Email
                  </Button>
                  
                  <Link to="/login">
                    <Button 
                      variant="outline"
                      className="w-full border-input hover:bg-accent text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-input focus:border-primary"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the email address associated with your account
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Sending Instructions...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Mail className="h-5 w-5" />
                        Send Reset Instructions
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            )}
            
            {!isEmailSent && (
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Remember your password?
                </p>
                <Link 
                  to="/login" 
                  className="block text-center mt-2 text-primary hover:text-primary/80 underline underline-offset-4"
                >
                  <ArrowLeft className="h-4 w-4 inline mr-1" />
                  Back to login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}