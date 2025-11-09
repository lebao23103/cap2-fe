import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Eye, EyeOff, BookOpen, Sparkles, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { ModernButton } from '../components/ui/modern'

export default function Register() {
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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    // TODO: Implement registration API call
    console.log('Registration attempt:', formData)
    
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
          <p className="text-xl font-semibold text-foreground mb-2">
            "A reader lives a thousand lives before he dies."
          </p>
          <p className="text-sm text-muted-foreground">— George R.R. Martin</p>
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
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Create Your Account
            </h2>
            <p className="text-sm text-muted-foreground">
              Join our community of readers and start your journey
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 h-11 rounded-xl transition-all"
                    required
                  />
                  {errors.firstName && <p className="text-xs text-destructive font-medium">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 h-11 rounded-xl transition-all"
                    required
                  />
                  {errors.lastName && <p className="text-xs text-destructive font-medium">{errors.lastName}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 h-11 rounded-xl transition-all"
                  required
                />
                {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 pr-12 h-11 rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 pr-12 h-11 rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive font-medium">{errors.confirmPassword}</p>}
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
                  {isLoading ? 'Creating your account...' : 'Create Account'}
                </ModernButton>
              </div>
            </form>
            
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-center text-sm text-muted-foreground">
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