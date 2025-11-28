import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fadeInUp, stagger } from '@/lib/animations'
import {
  BookOpen,
  Feather,
  BookMarked,
  Coffee,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ArrowRight
} from 'lucide-react'

export default function Home() {

  // Sample book data for featured books
  const featuredBooks = [
    {
      id: "1",
      title: "The Midnight Library",
      author: "Matt Haig",
      coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
      rating: 4.5,
      description: "Between life and death there is a library, and within that library, the shelves go on forever."
    },
    {
      id: "2",
      title: "Project Hail Mary",
      author: "Andy Weir",
      coverImage: "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=800",
      rating: 4.8,
      description: "A lone astronaut must save humanity from an extinction-level threat."
    },
    {
      id: "3",
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800",
      rating: 4.2,
      description: "A thrilling coming-of-age story about an Artificial Friend and her quest to save the family she loves."
    },
    {
      id: "4",
      title: "The Seven Husbands",
      author: "Taylor Jenkins Reid",
      coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
      rating: 4.7,
      description: "Aging Hollywood icon finally tells her story of fame, fortune, and scandalous relationships."
    }
  ]

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Professor of Literature",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      content: "Knowly has revolutionized how my students engage with academic texts. The collaborative note-sharing feature creates a truly interactive learning environment.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Graduate Student",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      content: "The exercise system helps me test my comprehension after each reading session. It's like having a personal tutor that guides my learning journey.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Research Assistant",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      content: "The knowledge sharing community is incredible. I can see how other researchers have annotated the same texts I'm studying.",
      rating: 5
    }
  ]

  return (
    <div className='relative min-h-screen bg-background overflow-hidden'>
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/5 blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-[100px] animate-pulse-slow delay-2000" />
      </div>

      {/* Hero Section */}
      <section className='relative w-full py-24 sm:py-32 lg:py-40'>
        <div className='container mx-auto px-4 relative z-10'>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-primary/20 bg-primary/5 text-primary backdrop-blur-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Reimagining Academic Reading
              </Badge>

              <h1 className='font-sans text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]'>
                Unlock the Power of <br />
                <span className='bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent animate-gradient-x'>
                  Shared Knowledge
                </span>
              </h1>

              <p className='text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed'>
                Join a vibrant community of scholars and learners. Annotate, collaborate, and master your subjects with our intelligent interactive platform.
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 duration-300">
                  <Link to='/readnex' className='flex items-center'>
                    Start Reading <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-primary/20 text-foreground hover:bg-primary/10 hover:text-primary transition-all hover:scale-105 duration-300 backdrop-blur-sm bg-background/50">
                  <Link to='/noteshare' className='flex items-center'>
                    <Sparkles className="mr-2 h-5 w-5" /> NoteShare
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-muted-foreground/60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">15k+ Users</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-semibold">25k+ Books</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 relative w-full max-w-xl lg:max-w-none"
            >
              <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse-slow" />
                <img
                  src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200"
                  alt="Digital Library Interface"
                  className="w-full h-full object-cover rounded-2xl opacity-90 hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Elements */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-xl"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                      <BookMarked className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Reading Progress</p>
                      <p className="text-xs text-white/60">The Midnight Library</p>
                    </div>
                    <span className="ml-auto font-bold text-green-400">78%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full w-[78%]" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to <span className="text-primary">excel</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines powerful tools to enhance your reading and learning experience.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Coffee,
                title: 'Immersive Reading',
                description: 'Distraction-free environment with customizable themes and fonts.',
                color: 'text-amber-500',
                bg: 'bg-amber-500/10'
              },
              {
                icon: Feather,
                title: 'Smart Annotations',
                description: 'Highlight, take notes, and share insights with your peers instantly.',
                color: 'text-purple-500',
                bg: 'bg-purple-500/10'
              },
              {
                icon: Sparkles,
                title: 'AI-Powered Quizzes',
                description: 'Test your knowledge with automatically generated quizzes from any book.',
                color: 'text-blue-500',
                bg: 'bg-blue-500/10'
              }
            ].map((feature, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full border-0 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="relative w-full py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <motion.div {...fadeInUp}>
              <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5">
                <TrendingUp className="mr-2 h-3 w-3" /> Trending
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Featured Books
              </h2>
            </motion.div>
            <Button variant="ghost" className="hidden sm:flex group" asChild>
              <Link to="/readnex">
                View All <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <motion.div key={book.id} {...fadeInUp}>
                <Card className="h-full border-0 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden rounded-2xl">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <Button className="w-full bg-white text-black hover:bg-white/90 font-semibold" asChild>
                        <Link to={`/book/${book.id}`}>View Details</Link>
                      </Button>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {book.rating}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium mb-3">{book.author}</p>
                    <p className="text-sm text-muted-foreground/80 line-clamp-2">
                      {book.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/readnex">View All Books</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='relative w-full py-24 bg-muted/30'>
        <div className='container mx-auto px-4'>
          <motion.div {...fadeInUp} className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
              Community Voices
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              See how Knowly is transforming the learning experience for students and educators.
            </p>
          </motion.div>

          <motion.div {...stagger} className='grid md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full p-8 border-0 bg-card/50 backdrop-blur-sm shadow-lg rounded-2xl relative">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                      />
                      <div>
                        <p className="font-bold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='relative w-full py-24'>
        <div className='container mx-auto px-4 max-w-5xl'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />

              <div className="relative z-10 p-12 md:p-20 text-center text-white">
                <h2 className='font-sans text-3xl md:text-5xl font-bold mb-6'>
                  Ready to start your journey?
                </h2>
                <p className='text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto'>
                  Join thousands of learners today and experience the future of academic reading and collaboration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="h-14 px-8 text-lg bg-white text-primary hover:bg-white/90 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105" asChild>
                    <Link to='/register'>
                      Get Started for Free
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-white text-white hover:bg-white/20 hover:text-white rounded-full transition-all hover:scale-105 bg-transparent" asChild>
                    <Link to='/about'>
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}