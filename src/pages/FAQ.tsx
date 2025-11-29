import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Link } from "react-router-dom"
import {
  BookOpen,
  HelpCircle,
  MessageSquare,
  TrendingUp,
  Shield,
  Users,
  Zap,
  ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"

export default function FAQ() {
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

  const faqCategories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      questions: [
        {
          question: "What is Knowly?",
          answer: "Knowly is a Knowledge Sharing Platform for Academic Reading and Exercises that helps you discover books, share insights, and engage in educational activities through intelligent recommendations, note-taking, and community-driven learning experiences."
        },
        {
          question: "How do I get started with Knowly?",
          answer: "Getting started is easy! Simply click the 'Get Started' button, create your free account, and tell us about your reading preferences. Our AI will immediately begin suggesting books tailored to your interests. You can also start chatting with our AI assistant right away for personalized recommendations."
        },
        {
          question: "Do I need to pay to use Knowly?",
          answer: "Knowly offers a generous free tier that includes basic AI recommendations, reading history tracking, and access to our community features. We also offer premium plans with advanced features like unlimited AI conversations, priority support, and exclusive early access to new features."
        }
      ]
    },
    {
      title: "Academic Features",
      icon: Zap,
      questions: [
        {
          question: "How does the knowledge sharing platform work?",
          answer: "Our platform uses AI to analyze academic content and facilitate collaborative learning. Students can annotate texts, share insights, create study notes, and engage in comprehension exercises. The AI helps connect related concepts and suggests relevant academic materials based on your learning patterns."
        },
        {
          question: "Can I collaborate with other students and educators?",
          answer: "Absolutely! Knowly is built for collaboration. You can share annotations, participate in academic discussions, view how others have interpreted the same texts, and contribute to community knowledge. Our NoteShare feature allows you to learn from peer insights and expert commentary."
        },
        {
          question: "What types of exercises are available?",
          answer: "We offer various interactive exercises including comprehension quizzes, critical thinking prompts, annotation challenges, and collaborative analysis tasks. These exercises are designed to deepen understanding and enhance retention of academic material."
        }
      ]
    },
    {
      title: "Reading & Exercises",
      icon: MessageSquare,
      questions: [
        {
          question: "What features are included in the free plan?",
          answer: "The free plan includes: access to academic reading materials, basic note-taking features, community discussions, reading progress tracking, and basic comprehension exercises. It's perfect for students who want to enhance their learning experience without any commitment."
        },
        {
          question: "How do I track my learning progress?",
          answer: "Knowly offers comprehensive learning analytics. You can track reading completion, exercise scores, note-taking activity, and collaboration contributions. Set learning goals and monitor your academic progress with detailed insights and performance metrics."
        },
        {
          question: "Can I create and share study materials?",
          answer: "Yes! You can create study notes, annotations, and educational content through our Create feature. Share your materials with the community and contribute to collaborative learning. Your shared content helps other learners while building your academic reputation."
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      questions: [
        {
          question: "How do you protect my academic data?",
          answer: "We take your privacy seriously. Your academic data, notes, and learning analytics are encrypted and stored securely. We never sell your educational information to third parties. You maintain ownership of your created content and can control sharing permissions."
        },
        {
          question: "What data do you collect for educational purposes?",
          answer: "We collect information about your reading activities, exercise performance, note-taking patterns, and collaboration interactions. This data is used solely to enhance your learning experience and provide personalized educational insights. We do not track your activities outside our platform."
        },
        {
          question: "Can I export my academic work and data?",
          answer: "Yes, you have complete control over your academic content. You can export your notes, annotations, exercise results, and learning analytics at any time. You can also delete specific data or your entire account while retaining copies of your work."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background font-mono selection:bg-primary selection:text-black">

      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-20 border-b-4 border-black bg-white dark:bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center px-4">
          <motion.div {...fadeInUp}>
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-bold uppercase border-2 border-black rounded-none bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              ❓ Frequently Asked Questions
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-black dark:text-white mb-6 uppercase tracking-tighter">
              Got Questions?
              <span className="block text-primary drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                We've Got Answers
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Find quick answers to common questions about Knowly, our academic features,
              collaborative tools, and how to maximize your learning experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="relative w-full py-20 bg-dots-pattern">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div {...stagger} className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div key={categoryIndex} {...fadeInUp}>
                <Card className="overflow-hidden rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-zinc-900">
                  <CardHeader className="bg-black text-white border-b-4 border-black p-6">
                    <CardTitle className="text-2xl font-black uppercase flex items-center gap-3">
                      <div className="p-2 bg-white text-black border-2 border-white">
                        <category.icon className="h-6 w-6" strokeWidth={2.5} />
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`} className="border-b-2 border-black last:border-0">
                          <AccordionTrigger className="px-6 py-5 text-left hover:bg-primary/20 hover:no-underline data-[state=open]:bg-primary data-[state=open]:text-black transition-all">
                            <span className="font-bold text-lg uppercase">
                              {faq.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 py-4 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 border-t-2 border-black">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="relative w-full py-20 border-t-4 border-black bg-primary">
        <div className="container mx-auto max-w-4xl text-center px-4">
          <motion.div {...fadeInUp}>
            <div className="mx-auto mb-8 p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-24 h-24 flex items-center justify-center">
              <HelpCircle className="h-12 w-12 text-black" strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-black mb-6 uppercase">
              Still Need Help?
            </h2>
            <p className="text-xl font-bold text-black/80 mb-10 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our friendly support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="h-16 px-8 text-lg font-black uppercase bg-black text-white border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all" asChild>
                <Link to="/contact">
                  <MessageSquare className="h-6 w-6 mr-3" />
                  Contact Support
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-8 text-lg font-black uppercase bg-white text-black border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-white transition-all" asChild>
                <Link to="/">
                  Browse Help Center
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-900 border-t-4 border-black">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-6 uppercase">
              Quick Tips to Get Started
            </h2>
            <p className="text-xl font-bold text-gray-600 dark:text-gray-300">
              Make the most of Knowly with these helpful tips.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Set Learning Goals",
                description: "Define your academic objectives and track progress through our comprehensive analytics dashboard.",
                icon: Users
              },
              {
                title: "Engage with Content",
                description: "Take notes, highlight key passages, and complete exercises to deepen your understanding.",
                icon: MessageSquare
              },
              {
                title: "Collaborate with Peers",
                description: "Share insights, participate in discussions, and learn from other students' perspectives.",
                icon: Zap
              },
              {
                title: "Create Study Materials",
                description: "Upload your own content and contribute to the academic community knowledge base.",
                icon: BookOpen
              },
              {
                title: "Join Study Groups",
                description: "Connect with classmates and form collaborative learning communities around shared interests.",
                icon: Users
              },
              {
                title: "Monitor Your Progress",
                description: "Review your learning analytics and adjust your study strategies for optimal results.",
                icon: TrendingUp
              }
            ].map((tip, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all bg-white dark:bg-zinc-900">
                  <CardHeader className="text-center border-b-4 border-black bg-gray-50 dark:bg-zinc-800">
                    <div className="mx-auto mb-4 p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-20 h-20 flex items-center justify-center">
                      <tip.icon className="h-8 w-8 text-black" strokeWidth={2.5} />
                    </div>
                    <CardTitle className="text-xl font-black uppercase">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardDescription className="text-center text-base font-medium text-black dark:text-gray-300">
                      {tip.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white border-t-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp} className="border-4 border-white p-12 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)]">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl mb-10 font-bold opacity-90">
              Join thousands of students and educators who have revolutionized their academic reading with Knowly.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="h-16 px-10 text-lg font-black uppercase bg-primary text-black border-4 border-white rounded-none shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] hover:bg-primary transition-all" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-6 w-6" strokeWidth={3} />
                </Link>
              </Button>
              <div className="flex items-center text-sm font-bold uppercase tracking-wider opacity-75 border-2 border-white px-4 py-2">
                No credit card required
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

