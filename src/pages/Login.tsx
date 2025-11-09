import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Eye, EyeOff, BookOpen, KeyRound, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { ModernButton } from '../components/ui/modern'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: Implement login API call
    console.log('Login attempt:', { email, password })
    
    setIsLoading(false)
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
          <p className="text-xl font-semibold text-foreground mb-2">
            "Books are a uniquely portable magic."
          </p>
          <p className="text-sm text-muted-foreground">— Stephen King</p>
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
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your literary journey
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 h-11 rounded-xl transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Password
                  </Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 pr-12 h-11 rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <ModernButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={Sparkles}
                  isLoading={isLoading}
                  className="w-full h-12 text-base shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Signing you in...' : 'Sign In'}
                </ModernButton>
              </div>
            </form>
            
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-center text-sm text-muted-foreground">
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