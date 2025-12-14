import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fadeInUp, stagger } from '@/lib/animations'
import booksService from '@/lib/api/books'

import { getCoverImageUrl } from '@/lib/utils/mediaUtils'
import {
  BookOpen,
  Feather,
  Coffee,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import NoteInteractionDemo from '@/components/demos/NoteInteractionDemo'

interface FeaturedBook {
  id: string
  title: string
  author: string
  coverImage: string
  rating: number
  description: string
}

// Tech stack data - only technologies actually used in this project
const techStack = [
  { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', bg: 'bg-sky-100' },
  { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', bg: 'bg-blue-100' },
  { name: 'Vite', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg', bg: 'bg-purple-100' },
  { name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', bg: 'bg-cyan-100' },
  { name: 'Framer Motion', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/framermotion/framermotion-original.svg', bg: 'bg-pink-100' },
  { name: 'Django', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg', bg: 'bg-green-100' },
  { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', bg: 'bg-yellow-100' },
  { name: 'MySQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', bg: 'bg-orange-100' },
]

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<FeaturedBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef(null)

  // Scrollytelling Hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  const techStackX = useTransform(scrollYProgress, [0.6, 0.9], ["10%", "-10%"])


  useEffect(() => {
    loadFeaturedBooks()
  }, [])

  const loadFeaturedBooks = async () => {
    try {
      setIsLoading(true)
      const booksData = await booksService.getApprovedBooks()

      const transformed: FeaturedBook[] = booksData
        .filter((book: any) => book && book.id && book.title)
        .slice(0, 4)
        .map((book: any) => ({
          id: book.id.toString(),
          title: book.title,
          author: book.author || 'Unknown Author',
          coverImage: getCoverImageUrl(book.cover_image),
          rating: book.rating || 0,
          description: book.description || 'Discover this amazing book in our collection.'
        }))

      setFeaturedBooks(transformed)
    } catch (error) {
      console.error('Error loading featured books:', error)
      setFeaturedBooks([])
    } finally {
      setIsLoading(false)
    }
  }



  // Reusable component for reveal animation
  const RevealOnScroll = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div ref={containerRef} className='relative min-h-screen bg-background overflow-hidden font-mono'>
      {/* Background Grid - Parallax */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
        className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0"
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </motion.div>
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
        className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20"
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </motion.div>

      {/* Hero Section */}
      <section className='relative w-full pt-10 pb-24 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-40 min-h-screen flex items-center'>
        <div className='container mx-auto px-4 relative z-10'>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Hero Text */}
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-2 border-border bg-card text-foreground rounded-lg shadow-neo uppercase font-bold inline-flex">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Reimagining Academic Reading
                </Badge>
              </motion.div>

              <h1 className='font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1] uppercase overflow-hidden'>
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  Unlock the Power of
                </motion.span>
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className='bg-primary text-black px-2 mt-2 inline-block'
                >
                  Shared Knowledge
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className='text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-mono'
              >
                Join a vibrant community of scholars and learners. Annotate, collaborate, and master your subjects with our intelligent interactive platform.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'
              >
                <Button size="lg" className="h-14 px-8 text-lg bg-black text-white hover:bg-primary hover:text-black border-2 border-border dark:bg-white dark:text-black dark:hover:bg-primary rounded-lg shadow-neo uppercase font-bold">
                  <Link to='/readnex' className='flex items-center'>
                    Start Reading <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-border bg-card text-foreground hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg shadow-neo uppercase font-bold">
                  <Link to='/noteshare' className='flex items-center'>
                    <Sparkles className="mr-2 h-5 w-5" /> NoteShare
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-black dark:text-white font-bold uppercase"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>15k+ Users</span>
                </div>
                <div className="w-px h-6 bg-black dark:bg-white" />
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>25k+ Books</span>
                </div>
                <div className="w-px h-6 bg-black dark:bg-white" />
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>4.9/5 Rating</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual - Parallax */}
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 0.4], [0, -50]) }}
              className="flex-1 relative w-full max-w-xl lg:max-w-none hidden lg:block"
            >
              <NoteInteractionDemo />
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-black dark:text-white"
        >
          <div className="w-6 h-10 border-2 border-black dark:border-white rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid - Reveal on Scroll */}
      <section className="relative w-full py-32 bg-primary border-y-4 border-black dark:border-white z-20">
        <div className="container mx-auto px-4">
          <RevealOnScroll className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 uppercase font-display">
              Everything you need to <span className="relative inline-block"><span className="absolute inset-0 bg-white translate-x-1.5 translate-y-1.5 border-2 border-black"></span><span className="relative bg-white px-3 border-2 border-black">excel</span></span>
            </h2>
            <p className="text-xl text-black font-mono max-w-2xl mx-auto font-bold opacity-80">
              Our platform combines powerful tools to enhance your reading and learning experience.
            </p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Coffee,
                title: 'Immersive Reading',
                description: 'Distraction-free environment with customizable themes and fonts.',
                color: 'text-black',
                bg: 'bg-amber-400'
              },
              {
                icon: Feather,
                title: 'Smart Annotations',
                description: 'Highlight, take notes, and share insights with your peers instantly.',
                color: 'text-black',
                bg: 'bg-purple-400'
              },
              {
                icon: Sparkles,
                title: 'AI-Powered Quizzes',
                description: 'Test your knowledge with automatically generated quizzes from any book.',
                color: 'text-black',
                bg: 'bg-blue-400'
              }
            ].map((feature, index) => (
              <RevealOnScroll key={index} delay={index * 0.2}>
                <Card className="h-full border-2 border-border bg-card shadow-neo-lg hover:translate-x-[-8px] hover:translate-y-[-8px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 rounded-xl group">
                  <CardHeader>
                    <div className={`w-16 h-16 border-2 border-border ${feature.bg} ${feature.color} flex items-center justify-center mb-6 shadow-neo transform group-hover:rotate-6 transition-transform`}>
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold uppercase dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-gray-600 dark:text-gray-300 font-mono leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section - Horizontal Scroll Effect */}
      <section className="relative w-full py-32 overflow-hidden">
        <div className="container mx-auto px-4 mb-16">
          <div className="flex justify-between items-end">
            <RevealOnScroll>
              <Badge variant="outline" className="mb-4 text-foreground border-2 border-border bg-card shadow-neo rounded-lg uppercase font-bold">
                <TrendingUp className="mr-2 h-3 w-3" /> Trending
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold text-foreground uppercase font-display">
                Featured Books
              </h2>
            </RevealOnScroll>
            <Button variant="ghost" className="hidden sm:flex group border-2 border-border rounded-lg hover:bg-black hover:text-white font-bold uppercase" asChild>
              <Link to="/readnex">
                View All <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : featuredBooks.length === 0 ? (
            <Card className="bg-white border-4 border-dashed border-border rounded-xl">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-600 font-bold uppercase">No books available yet.</p>
                <p className="text-gray-500 font-mono text-sm mt-2">Check back soon for new additions!</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {featuredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  whileHover={{ y: -10 }}
                  className="h-full"
                >
                  <Card className="h-full border-2 border-border bg-card shadow-neo-lg hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 group overflow-hidden rounded-xl">
                    <div className="relative aspect-[2/3] overflow-hidden border-b-2 border-border">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Cover'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <Button className="w-full bg-white text-black hover:bg-primary border-2 border-border rounded-lg shadow-neo uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 font-bold" asChild>
                          <Link to={`/book/${book.id}`}>View Details</Link>
                        </Button>
                      </div>
                      <div className="absolute top-3 right-3 bg-primary text-black border-2 border-border text-xs font-bold px-2.5 py-1 shadow-neo-sm flex items-center gap-1">
                        <Star className="h-3 w-3 fill-black text-black" />
                        {book.rating.toFixed(1)}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl text-foreground line-clamp-1 mb-2 group-hover:underline decoration-4 underline-offset-4 decoration-primary uppercase dark:text-white">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-mono mb-4 uppercase tracking-wider">{book.author}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-mono leading-relaxed">
                        {book.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials Section - NoteShare Style */}
      <section className='relative w-full py-32 bg-secondary border-y-4 border-border overflow-hidden'>
        <div className='container mx-auto px-4'>
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3 sticky top-32">
              <RevealOnScroll>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-1 w-12 bg-white" />
                  <h2 className='text-4xl md:text-5xl font-bold text-white uppercase font-display leading-[1.1]'>
                    Community <br /> Voices
                  </h2>
                </div>
                <p className='text-xl text-white/90 font-mono font-bold mb-8 pl-16 border-l-4 border-white'>
                  See how Knowly is transforming the learning experience.
                </p>
              </RevealOnScroll>
            </div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:w-2/3 columns-1 md:columns-2 gap-6 space-y-6"
            >
              {[
                {
                  name: "Dr. Sarah Chen",
                  role: "Professor of Literature",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                  content: "Knowly has revolutionized how my students engage with academic texts. The collaborative note-sharing feature creates a truly interactive learning environment.",
                  rating: 5,
                  date: "2 days ago",
                  likes: 128
                },
                {
                  name: "Marcus Johnson",
                  role: "Graduate Student",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
                  content: "The exercise system helps me test my comprehension after each reading session. It's like having a personal tutor that guides my learning journey.",
                  rating: 5,
                  date: "5 hours ago",
                  likes: 85
                },
                {
                  name: "Emily Rodriguez",
                  role: "Research Assistant",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
                  content: "The knowledge sharing community is incredible. I can see how other researchers have annotated the same texts I'm studying.",
                  rating: 5,
                  date: "1 week ago",
                  likes: 243
                },
                {
                  name: "David Kim",
                  role: "High School Teacher",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
                  content: "I use this to track my students' reading progress. The analytics are game-changing for identifying who needs extra help.",
                  rating: 4,
                  date: "3 days ago",
                  likes: 56
                }
              ].map((testimonial, index) => (
                <motion.div key={index} variants={fadeInUp} className="break-inside-avoid mb-6">
                  <div className="bg-white dark:bg-zinc-900 border-2 border-border rounded-xl shadow-neo hover:shadow-neo-hover transition-all duration-300 overflow-hidden flex flex-col group">

                    {/* Header */}
                    <div className="p-4 border-b-2 border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <img src={testimonial.avatar} className="w-10 h-10 rounded-lg border-2 border-white shadow-sm bg-white" alt={testimonial.name} />
                        <div>
                          <p className="text-sm font-black uppercase text-foreground truncate">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground font-mono font-bold bg-primary/20 px-1 rounded inline-block">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < testimonial.rating ? "fill-black text-black dark:text-white dark:fill-white" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="relative bg-amber-50 dark:bg-amber-900/10 border-l-4 border-primary pl-4 pr-3 py-3 mb-2 rounded-r-lg">
                        <p className="font-serif text-sm italic text-foreground/90 leading-relaxed">
                          "{testimonial.content}"
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 border-t-2 border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
                      <span>{testimonial.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 hover:text-black dark:hover:text-white cursor-pointer"><TrendingUp className="h-3 w-3" /> {testimonial.likes}</span>
                        <span className="flex items-center gap-1 hover:text-black dark:hover:text-white cursor-pointer text-primary">View Note <ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Parallax Tech Stack */}
      <section className="relative w-full py-24 bg-white dark:bg-zinc-900 border-b-4 border-border overflow-hidden">
        <div className="container mx-auto px-4 mb-12 text-center relative z-10">
          <Badge variant="outline" className="mb-4 text-black border-2 border-border bg-primary shadow-neo rounded-lg uppercase font-bold inline-flex">
            <Sparkles className="mr-2 h-3 w-3" /> Tech Stack
          </Badge>
          <h2 className="text-4xl font-bold text-foreground uppercase font-display">
            Built With Modern Tech
          </h2>
        </div>

        {/* Marquee Container with Parallax X movement */}
        <motion.div
          style={{ x: techStackX }}
          className="flex w-[200%] gap-8 py-10"
        >
          {[...techStack, ...techStack, ...techStack].map((tech, index) => (
            <div
              key={index}
              className={`flex-shrink-0 flex flex-col items-center gap-4 px-10 py-8 ${tech.bg} border-4 border-border shadow-neo-lg cursor-pointer group text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 transform hover:-translate-y-2`}
            >
              <img
                src={tech.logo}
                alt={tech.name}
                className="h-16 w-16 drop-shadow-md"
              />
              <span className="font-black text-xl uppercase tracking-tighter">{tech.name}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section - Scale Up Reveal */}
      <section className='relative w-full py-32 bg-background'>
        <div className='container mx-auto px-4 max-w-5xl'>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <div className="relative border-4 border-border bg-card shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,1)] group hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

              <div className="relative z-10 p-12 md:p-24 text-center text-black dark:text-white">
                <h2 className='font-display text-4xl md:text-6xl font-bold mb-8 uppercase leading-tight'>
                  Ready to start <br /> your journey?
                </h2>
                <p className='text-xl md:text-2xl text-gray-800 dark:text-gray-300 mb-12 max-w-2xl mx-auto font-mono'>
                  Join thousands of learners today and experience the future of academic reading.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button size="lg" className="h-16 px-10 text-xl bg-black text-white hover:bg-primary hover:text-black border-2 border-border dark:bg-white dark:text-black dark:hover:bg-primary dark:hover:text-black font-bold rounded-lg shadow-neo-lg uppercase transition-all" asChild>
                    <Link to='/register'>
                      Get Started for Free
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-16 px-10 text-xl border-2 border-border text-foreground hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg transition-all shadow-neo-lg uppercase font-bold" asChild>
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