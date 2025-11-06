
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Link } from "react-router-dom"
import {
  Users,
  Lightbulb,
  Target,
  Heart,
  Award,
  TrendingUp,
  Globe,
  Zap,
  ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"
import { AnimatedBackground } from "@/components/AnimatedBackground"
import { PremiumButton } from "@/components/ui/premium-button"

export default function About() {
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AnimatedBackground variant="mesh" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              📖 Our Story
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Revolutionizing the
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Reading Experience
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Born from a passion for education and knowledge sharing, Knowly combines
              cutting-edge technology with collaborative learning to transform academic reading experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              To revolutionize academic learning through collaborative knowledge sharing,
              interactive reading experiences, and AI-powered educational insights.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Empower Learners",
                description: "Provide students and educators with tools to enhance comprehension, share insights, and engage deeply with academic content.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Lightbulb,
                title: "Foster Collaboration",
                description: "Create opportunities for knowledge sharing through interactive annotations, community discussions, and peer learning.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Heart,
                title: "Transform Education",
                description: "Bridge the gap between traditional reading and modern learning through technology-enhanced academic experiences.",
                color: "from-red-500 to-orange-500"
              }
            ].map((item, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className={`mx-auto mb-4 p-4 bg-gradient-to-r ${item.color} rounded-full w-20 h-20 flex items-center justify-center`}>
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
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

      {/* Timeline Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From idea to reality - here's how Knowly came to life.
            </p>
          </motion.div>

          <motion.div {...stagger} className="space-y-8">
            {[
              {
                year: "8/2025",
                title: "The Beginning",
                description: "Knowly was born from recognizing the need for better academic reading tools that combine individual study with collaborative learning experiences.",
                icon: Lightbulb,
                side: "left"
              },
              {
                year: "9/2025",
                title: "AI Development",
                description: "Our team of educators and engineers began developing the knowledge-sharing platform that would power Knowly's collaborative learning experiences.",
                icon: Zap,
                side: "right"
              },
              {
                year: "10/2025",
                title: "Beta Launch",
                description: "We opened our platform to select educational institutions to test our interactive reading and exercise features with real students and educators.",
                icon: Users,
                side: "left"
              },
              {
                year: "12/2025",
                title: "Full Launch",
                description: "Knowly officially launches to the world, bringing collaborative academic reading and knowledge sharing to learners everywhere. The future of education begins here!",
                icon: Globe,
                side: "right"
              }
            ].map((item, index) => (
              <motion.div key={index} {...fadeInUp} className={`flex items-center ${item.side === 'left' ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-full md:w-1/2 ${item.side === 'left' ? 'pr-8' : 'pl-8'}`}>
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center mb-2">
                        <Badge variant="outline" className="mr-3">{item.year}</Badge>
                        <item.icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Meet the Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The passionate people behind Knowly's mission to transform academic learning.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Alexandra Chen",
                role: "CEO & Co-Founder",
                bio: "Former librarian and tech entrepreneur with a passion for connecting readers with books.",
                avatar: "/api/placeholder/150/150"
              },
              {
                name: "Marcus Rodriguez",
                role: "CTO & Co-Founder",
                bio: "AI researcher and engineer dedicated to building technology that enhances human experiences.",
                avatar: "/api/placeholder/150/150"
              },
              {
                name: "Sarah Kim",
                role: "Head of Product",
                bio: "Product designer focused on creating intuitive and delightful user experiences for readers.",
                avatar: "/api/placeholder/150/150"
              },
              {
                name: "David Thompson",
                role: "Lead Engineer",
                bio: "Full-stack developer who loves books and believes technology should make reading more accessible.",
                avatar: "/api/placeholder/150/150"
              }
            ].map((member, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={member.avatar} alt={`${member.name} profile picture`} />
                      <AvatarFallback className="text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <Badge variant="secondary">{member.role}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {member.bio}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The principles that guide everything we do at Knowly.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Reader-First",
                description: "Every decision we make prioritizes the needs and experiences of our readers."
              },
              {
                icon: Award,
                title: "Excellence",
                description: "We strive for the highest quality in everything we build and every interaction we have."
              },
              {
                icon: Users,
                title: "Community",
                description: "We believe in the power of shared stories and the connections they create between people."
              },
              {
                icon: Lightbulb,
                title: "Innovation",
                description: "We're constantly exploring new ways to enhance the reading experience through technology."
              },
              {
                icon: Globe,
                title: "Accessibility",
                description: "Great books should be accessible to everyone, regardless of background or ability."
              },
              {
                icon: TrendingUp,
                title: "Growth",
                description: "We believe in continuous learning, both for ourselves and for our community of readers."
              }
            ].map((value, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                      <value.icon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Be part of the future of reading. Join thousands of readers who are already
              experiencing the Knowly difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PremiumButton variant="aurora" size="xl" asChild>
                <Link to="/register">
                  Start Reading Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </PremiumButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
