
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
    <div className="min-h-screen bg-background font-mono relative selection:bg-primary selection:text-black">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-20 border-b-4 border-black dark:border-white bg-white dark:bg-zinc-800 z-10">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div {...fadeInUp}>
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-bold uppercase border-2 border-black dark:border-white rounded-md bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              📖 Our Story
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-6 uppercase">
              Revolutionizing the
              <span className="bg-black text-white px-2 dark:bg-white dark:text-black mx-2 inline-block transform -rotate-1">
                Reading Experience
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-300 mb-8 max-w-3xl mx-auto font-bold font-mono">
              Born from a passion for education and knowledge sharing, Knowly combines
              cutting-edge technology with collaborative learning to transform academic reading experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative w-full py-20 z-10">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6 uppercase bg-card border-4 border-border inline-block px-8 py-4 shadow-neo-lg rounded-xl">
              Our Mission
            </h2>
            <p className="text-xl text-foreground max-w-3xl mx-auto font-bold bg-primary/20 p-6 border-2 border-border rounded-xl">
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
                color: "bg-blue-200"
              },
              {
                icon: Lightbulb,
                title: "Foster Collaboration",
                description: "Create opportunities for knowledge sharing through interactive annotations, community discussions, and peer learning.",
                color: "bg-purple-200"
              },
              {
                icon: Heart,
                title: "Transform Education",
                description: "Bridge the gap between traditional reading and modern learning through technology-enhanced academic experiences.",
                color: "bg-red-200"
              }
            ].map((item, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full text-center border-4 border-border shadow-neo-lg hover:translate-y-[-4px] hover:shadow-neo-hover transition-all duration-200 rounded-xl bg-card">
                  <CardHeader>
                    <div className={`mx-auto mb-4 p-4 ${item.color} border-4 border-border w-20 h-20 flex items-center justify-center shadow-neo rounded-xl`}>
                      <item.icon className="h-10 w-10 text-black" strokeWidth={2.5} />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase text-black dark:text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base font-bold text-gray-700 dark:text-gray-300">
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
      <section className="relative w-full py-20 bg-gray-50 dark:bg-zinc-800 border-y-4 border-border z-10">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-6 uppercase">
              Our Journey
            </h2>
            <p className="text-xl font-bold text-gray-600 dark:text-gray-300">
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
                  <Card className="border-4 border-border shadow-neo-lg hover:translate-y-[-4px] hover:shadow-neo-hover transition-all rounded-xl bg-card">
                    <CardHeader>
                      <div className="flex items-center mb-2">
                        <Badge variant="outline" className="mr-3 rounded-md border-2 border-border bg-primary text-black font-bold">{item.year}</Badge>
                        <item.icon className="h-5 w-5 text-foreground" />
                      </div>
                      <CardTitle className="text-xl font-black uppercase text-black dark:text-white">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base font-bold text-gray-600 dark:text-gray-300">
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
      <section className="relative w-full py-20 z-10">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-6 uppercase">
              Meet the Team
            </h2>
            <p className="text-xl font-bold text-gray-600 dark:text-gray-300">
              The passionate people behind Knowly's mission to transform academic learning.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Tran Vu Gia Bao",
                role: "CEO & Co-Founder",
                bio: "Former librarian and tech entrepreneur with a passion for connecting readers with books.",
                avatar: "/api/placeholder/150/150"
              },
              {
                name: "Tran Trong Bang",
                role: "CTO & Co-Founder",
                bio: "AI researcher and engineer dedicated to building technology that enhances human experiences.",
                avatar: "/api/placeholder/150/150"
              },
              {
                name: "Nguyen Vu Gia Bao",
                role: "Head of Product",
                bio: "Product designer focused on creating intuitive and delightful user experiences for readers.",
                avatar: "/api/placeholder/150/150"
              },
              {
                name: "Nguyen Duc Tan",
                role: "Lead Engineer",
                bio: "Full-stack developer who loves books and believes technology should make reading more accessible.",
                avatar: "/api/placeholder/150/150"
              }
            ].map((member, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full text-center border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl bg-white dark:bg-zinc-900">
                  <CardHeader>
                    <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-black dark:border-white">
                      <AvatarImage src={member.avatar} alt={`${member.name} profile picture`} />
                      <AvatarFallback className="text-lg bg-primary text-black font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl font-black uppercase text-black dark:text-white">{member.name}</CardTitle>
                    <Badge variant="secondary" className="bg-gray-200 dark:bg-zinc-700 text-black dark:text-white rounded-md border border-black dark:border-white">{member.role}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm font-bold text-gray-600 dark:text-gray-300">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-zinc-800 border-t-4 border-black dark:border-white z-10">
        <div className="container mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-6 uppercase">
              Our Values
            </h2>
            <p className="text-xl font-bold text-gray-600 dark:text-gray-300">
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
                <Card className="h-full border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl bg-white dark:bg-zinc-900">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-white dark:bg-zinc-800 border-4 border-black dark:border-white w-16 h-16 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                      <value.icon className="h-8 w-8 text-black dark:text-white" strokeWidth={2.5} />
                    </div>
                    <CardTitle className="text-xl font-black uppercase text-black dark:text-white">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base font-bold text-gray-600 dark:text-gray-300">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t-4 border-black dark:border-white bg-primary z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp} className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase text-black dark:text-white">
              Join Our Mission
            </h2>
            <p className="text-xl mb-8 font-bold text-gray-700 dark:text-gray-300">
              Be part of the future of reading. Join thousands of readers who are already
              experiencing the Knowly difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PremiumButton variant="aurora" size="xl" asChild className="h-16 px-8 text-lg font-black uppercase bg-black text-white dark:bg-white dark:text-black border-4 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
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

