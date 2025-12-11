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
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
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
    <div className="min-h-screen bg-background font-mono relative selection:bg-primary selection:text-black">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-20 border-b-4 border-border bg-card z-10">
        <div className="container mx-auto max-w-4xl text-center px-4">
          <motion.div {...fadeInUp}>
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-bold uppercase border-2 border-border rounded-md bg-primary text-black shadow-neo">
              💬 Get In Touch
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-black dark:text-white mb-6 uppercase tracking-tighter">
              We'd Love to Hear
              <span className="block text-primary drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                From You
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Have questions about our academic platform? Need help with collaborative features?
              Want to share feedback about your learning experience? We're here to support your educational journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="relative w-full py-20 z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div {...fadeInUp} className="h-full">
              <Card className="h-full flex flex-col rounded-xl border-4 border-border shadow-neo-lg bg-card">
                <CardHeader className="border-b-4 border-border bg-muted/50 rounded-t-xl">
                  <CardTitle className="text-2xl font-black uppercase flex items-center text-black dark:text-white">
                    <MessageSquare className="h-6 w-6 mr-3 text-black dark:text-white" strokeWidth={2.5} />
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-black dark:text-gray-300">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-6">
                  {/* Success Message */}
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 bg-green-500 text-white border-4 border-border shadow-neo flex items-center gap-3 font-bold"
                        role="alert"
                      >
                        <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
                        <p>
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
                      className="mb-4 p-4 bg-red-500 text-white border-4 border-border shadow-neo font-bold"
                      role="alert"
                    >
                      <p>{submitError}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col" aria-label="Contact form" noValidate>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-bold uppercase text-black dark:text-white">Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="Your full name"
                          disabled={isSubmitting || isSuccess}
                          aria-required="true"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                          autoComplete="name"
                          className={`rounded-lg border-2 border-border bg-card text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:shadow-neo transition-all ${errors.name && touchedFields.name ? 'border-destructive bg-destructive/10' : ''}`}
                        />
                        {errors.name && touchedFields.name && (
                          <p id="name-error" className="text-sm font-bold text-red-500" role="alert">
                            {errors.name?.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-bold uppercase text-black dark:text-white">Email <span className="text-red-500">*</span></Label>
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
                          className={`rounded-lg border-2 border-border bg-card text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:shadow-neo transition-all ${errors.email && touchedFields.email ? 'border-destructive bg-destructive/10' : ''}`}
                        />
                        {errors.email && touchedFields.email && (
                          <p id="email-error" className="text-sm font-bold text-red-500" role="alert">
                            {errors.email?.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="font-bold uppercase text-black dark:text-white">Subject <span className="text-red-500">*</span></Label>
                      <Input
                        id="subject"
                        {...register('subject')}
                        placeholder="What's this about?"
                        disabled={isSubmitting || isSuccess}
                        aria-required="true"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        className={`rounded-lg border-2 border-border bg-card text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:shadow-neo transition-all ${errors.subject && touchedFields.subject ? 'border-destructive bg-destructive/10' : ''}`}
                      />
                      {errors.subject && touchedFields.subject && (
                        <p id="subject-error" className="text-sm font-bold text-red-500" role="alert">
                          {errors.subject?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 flex-1 flex flex-col">
                      <Label htmlFor="message" className="font-bold uppercase text-black dark:text-white">Message <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        placeholder="Tell us more about your question, feedback, or how we can help..."
                        className={`flex-1 min-h-[120px] resize-none rounded-lg border-2 border-border bg-card text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:shadow-neo transition-all ${errors.message && touchedFields.message ? 'border-destructive bg-destructive/10' : ''}`}
                        disabled={isSubmitting || isSuccess}
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && touchedFields.message && (
                        <p id="message-error" className="text-sm font-bold text-red-500" role="alert">
                          {errors.message?.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full mt-auto h-14 text-lg font-black uppercase bg-foreground text-background border-4 border-border rounded-xl shadow-neo hover:translate-y-[-4px] hover:shadow-neo-lg hover:bg-foreground transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-neo"
                      size="lg"
                      disabled={isSubmitting || isSuccess}
                      aria-label={isSubmitting ? 'Sending message' : 'Send message'}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            className="h-5 w-5 mr-3 border-4 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            aria-hidden="true"
                          />
                          Sending...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-3" aria-hidden="true" />
                          Sent!
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-3" aria-hidden="true" />
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
              <Card className="rounded-xl border-4 border-border shadow-neo-lg bg-card">
                <CardHeader className="border-b-4 border-border bg-muted/50 rounded-t-xl">
                  <CardTitle className="text-2xl font-black uppercase text-center text-black dark:text-white">Get in Touch</CardTitle>
                  <CardDescription className="text-center text-base font-medium text-black dark:text-gray-300">
                    Prefer to reach out directly? Here are all the ways you can contact us.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-6">
                    {[
                      {
                        icon: Mail,
                        title: "Email Us",
                        description: "Drop us an email anytime",
                        contact: "support@knowly.com",
                      },
                      {
                        icon: Phone,
                        title: "Call Us",
                        description: "Speak with our team",
                        contact: "+1 (555) 123-4567",
                      },
                      {
                        icon: MapPin,
                        title: "Visit Us",
                        description: "Come say hello",
                        contact: "123 Knowledge Street, Learning City, LC 12345",
                      },
                      {
                        icon: Clock,
                        title: "Business Hours",
                        description: "When we're available",
                        contact: "Mon-Fri: 9AM-6PM EST",
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center text-center space-y-2">
                        <div className="p-3 bg-card border-2 border-border shadow-neo">
                          <item.icon className="h-6 w-6 text-black dark:text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-black dark:text-white">{item.title}</h3>
                          <p className="text-sm font-bold text-gray-500 mb-1">{item.description}</p>
                          <p className="text-black dark:text-white font-bold font-mono">{item.contact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="rounded-xl border-4 border-border shadow-neo-lg bg-card">
                <CardHeader className="border-b-4 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 rounded-t-xl">
                  <CardTitle className="text-xl font-black uppercase text-black dark:text-white">Follow Us</CardTitle>
                  <CardDescription className="text-base font-medium text-black dark:text-gray-300">
                    Stay connected with Knowly on social media.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {[
                      { icon: Instagram, label: "Instagram", link: "https://instagram.com/knowly" },
                      { icon: Facebook, label: "Facebook", link: "https://facebook.com/knowly" },
                      { icon: Twitter, label: "Twitter", link: "https://twitter.com/knowly" }
                    ].map((social, index) => (
                      <Button key={index} variant="outline" size="lg" className="flex-1 rounded-lg border-2 border-border shadow-neo hover:translate-y-[-2px] hover:shadow-neo-hover hover:bg-card text-foreground transition-all font-bold uppercase" asChild>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-zinc-800 border-t-4 border-black dark:border-white z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-6 uppercase">
              Common Questions
            </h2>
            <p className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-8">
              Can't find what you're looking for? Check out our FAQ page for quick answers.
            </p>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-black uppercase bg-card text-foreground border-4 border-border rounded-xl shadow-neo hover:translate-y-[-4px] hover:shadow-neo-lg hover:bg-card transition-all" asChild>
              <Link to="/faq">
                <MessageSquare className="h-5 w-5 mr-2" />
                View FAQ
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Office Hours & Response Times */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card border-t-4 border-border z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-6 uppercase">
              Response Times
            </h2>
            <p className="text-xl font-bold text-gray-600 dark:text-gray-300">
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
                <Card className="h-full text-center rounded-xl border-4 border-border shadow-neo-lg hover:translate-y-[-4px] hover:shadow-neo-xl transition-all bg-card">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-card border-4 border-border shadow-neo w-16 h-16 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-black dark:text-white" strokeWidth={2.5} />
                    </div>
                    <CardTitle className="text-xl font-black uppercase text-black dark:text-white">{item.title}</CardTitle>
                    <Badge variant="secondary" className="mx-auto w-fit rounded-md border-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-bold">{item.time}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base font-medium text-black dark:text-gray-300">
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
