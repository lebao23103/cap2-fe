import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Eye, EyeOff, BookOpen, KeyRound } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg italic text-foreground font-medium">
            "Books are a uniquely portable magic."
          </p>
          <p className="text-sm text-muted-foreground mt-2">— Stephen King</p>
        </motion.div>

        <Card className="w-full border-0 shadow-xl bg-card">
          <CardHeader className="text-center pb-2 pt-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl text-foreground">
              Welcome Back
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your credentials to continue your literary journey
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="space-y-0.5">
                <Label htmlFor="email" className="text-sm text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-input focus:border-primary h-9"
                  required
                />
              </div>
              
              <div className="space-y-0.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm text-foreground">
                    Password
                  </Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-primary hover:text-primary/80 underline underline-offset-2"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-input focus:border-primary pr-10 h-9"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-9 px-2 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="pt-0.5">
                <Button 
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Sign In
                    </span>
                  )}
                </Button>
              </div>
            </form>
            
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-center text-xs text-muted-foreground">
                New to our platform?{' '}
                <Link 
                  to="/register" 
                  className="text-primary hover:text-primary/80 underline underline-offset-4"
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