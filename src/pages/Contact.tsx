import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Link } from "react-router-dom"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  Globe,
  Twitter,
  Facebook,
  Instagram,
  CheckCircle2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AnimatedBackground } from "@/components/AnimatedBackground"

// Zod validation schema
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
})

type ContactFormData = z.infer<typeof contactSchema>

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  })

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // TODO: Implement contact form API call
      console.log('Form submitted:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success message
      setIsSuccess(true)
      
      // Reset form after showing success
      setTimeout(() => {
        reset()
        setIsSuccess(false)
      }, 3000)
      
    } catch (error) {
      setSubmitError('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AnimatedBackground variant="particles" />

      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-20">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div {...fadeInUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              💬 Get In Touch
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              We'd Love to Hear
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                From You
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Have questions about our academic platform? Need help with collaborative features? 
              Want to share feedback about your learning experience? We're here to support your educational journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="relative w-full py-20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div {...fadeInUp} className="h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <MessageSquare className="h-6 w-6 mr-2 text-indigo-600" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Success Message */}
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
                        role="alert"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Message sent successfully! We'll get back to you soon.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                      role="alert"
                    >
                      <p className="text-sm text-destructive font-medium">{submitError}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col" aria-label="Contact form" noValidate>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name <span className="text-destructive" aria-label="required">*</span></Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="Your full name"
                          disabled={isSubmitting || isSuccess}
                          aria-required="true"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                          autoComplete="name"
                          className={errors.name && touchedFields.name ? 'border-destructive' : ''}
                        />
                        {errors.name && touchedFields.name && (
                          <p id="name-error" className="text-sm text-destructive" role="alert">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-destructive" aria-label="required">*</span></Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="your.email@example.com"
                          disabled={isSubmitting || isSuccess}
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                          autoComplete="email"
                          className={errors.email && touchedFields.email ? 'border-destructive' : ''}
                        />
                        {errors.email && touchedFields.email && (
                          <p id="email-error" className="text-sm text-destructive" role="alert">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject <span className="text-destructive" aria-label="required">*</span></Label>
                      <Input
                        id="subject"
                        {...register('subject')}
                        placeholder="What's this about?"
                        disabled={isSubmitting || isSuccess}
                        aria-required="true"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        className={errors.subject && touchedFields.subject ? 'border-destructive' : ''}
                      />
                      {errors.subject && touchedFields.subject && (
                        <p id="subject-error" className="text-sm text-destructive" role="alert">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 flex-1 flex flex-col">
                      <Label htmlFor="message">Message <span className="text-destructive" aria-label="required">*</span></Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        placeholder="Tell us more about your question, feedback, or how we can help..."
                        className={`flex-1 min-h-[120px] resize-none ${errors.message && touchedFields.message ? 'border-destructive' : ''}`}
                        disabled={isSubmitting || isSuccess}
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && touchedFields.message && (
                        <p id="message-error" className="text-sm text-destructive" role="alert">
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full mt-auto" 
                      size="lg" 
                      disabled={isSubmitting || isSuccess}
                      aria-label={isSubmitting ? 'Sending message' : 'Send message'}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            aria-hidden="true"
                          />
                          Sending...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
                          Sent!
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div {...fadeInUp} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Get in Touch</CardTitle>
                  <CardDescription className="text-center">
                    Prefer to reach out directly? Here are all the ways you can contact us.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {[
                      {
                        icon: Mail,
                        title: "Email Us",
                        description: "Drop us an email anytime",
                        contact: "support@knowly.com",
                        color: "text-blue-600"
                      },
                      {
                        icon: Phone,
                        title: "Call Us",
                        description: "Speak with our team",
                        contact: "+1 (555) 123-4567",
                        color: "text-green-600"
                      },
                      {
                        icon: MapPin,
                        title: "Visit Us",
                        description: "Come say hello",
                        contact: "123 Knowledge Street, Learning City, LC 12345",
                        color: "text-red-600"
                      },
                      {
                        icon: Clock,
                        title: "Business Hours",
                        description: "When we're available",
                        contact: "Mon-Fri: 9AM-6PM EST",
                        color: "text-purple-600"
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center text-center space-y-2">
                        <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${item.color}`}>
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.description}</p>
                          <p className="text-gray-900 dark:text-white font-medium">{item.contact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Follow Us</CardTitle>
                  <CardDescription>
                    Stay connected with Knowly on social media.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {[
                      { icon: Instagram, label: "Instagram", color: "hover:text-pink-500", link: "https://instagram.com/knowly" },
                      { icon: Facebook, label: "Facebook", color: "hover:text-blue-600", link: "https://facebook.com/knowly" },
                      { icon: Twitter, label: "Twitter", color: "hover:text-blue-500", link: "https://twitter.com/knowly" }
                    ].map((social, index) => (
              <Button key={index} variant="outline" size="lg" className={`flex-1 ${social.color}`} asChild>
                        <a 
                          href={social.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          aria-label={`Follow us on ${social.label} (opens in new tab)`}
                        >
                          <social.icon className="h-5 w-5 mr-2" aria-hidden="true" />
                          {social.label}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Common Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Can't find what you're looking for? Check out our FAQ page for quick answers.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/faq">
                <MessageSquare className="h-5 w-5 mr-2" />
                View FAQ
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Office Hours & Response Times */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Response Times
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We pride ourselves on quick responses to all inquiries.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "General Inquiries",
                time: "Within 24 hours",
                description: "Questions about features, pricing, or general information.",
                icon: Mail
              },
              {
                title: "Technical Support",
                time: "Within 12 hours",
                description: "Issues with your account, bugs, or technical problems.",
                icon: Users
              },
              {
                title: "Partnerships",
                time: "Within 48 hours",
                description: "Business partnerships, integrations, or collaboration opportunities.",
                icon: Globe
              }
            ].map((item, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <Badge variant="secondary" className="mx-auto w-fit">{item.time}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  )
}
