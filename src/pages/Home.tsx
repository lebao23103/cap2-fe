import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    <div className='relative min-h-screen bg-background overflow-hidden font-mono'>
      {/* Background Grid */}
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

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
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase font-bold">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Reimagining Academic Reading
              </Badge>

              <h1 className='font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1] uppercase'>
                Unlock the Power of <br />
                <span className='bg-primary text-black px-2'>
                  Shared Knowledge
                </span>
              </h1>

              <p className='text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-mono'>
                Join a vibrant community of scholars and learners. Annotate, collaborate, and master your subjects with our intelligent interactive platform.
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                <Button size="lg" className="h-14 px-8 text-lg bg-black text-white hover:bg-primary hover:text-black border-2 border-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-primary rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase font-bold">
                  <Link to='/readnex' className='flex items-center'>
                    Start Reading <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase font-bold">
                  <Link to='/noteshare' className='flex items-center'>
                    <Sparkles className="mr-2 h-5 w-5" /> NoteShare
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-black dark:text-white font-bold uppercase">
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
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 relative w-full max-w-xl lg:max-w-none"
            >
              <NoteInteractionDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative w-full py-20 bg-primary border-y-4 border-black dark:border-white">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 uppercase font-display">
              Everything you need to <span className="bg-white px-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">excel</span>
            </h2>
            <p className="text-lg text-black font-mono max-w-2xl mx-auto font-bold">
              Our platform combines powerful tools to enhance your reading and learning experience.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-3 gap-8">
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
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 rounded-none group">
                  <CardHeader>
                    <div className={`w-14 h-14 border-2 border-black dark:border-white ${feature.bg} ${feature.color} flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl font-bold uppercase dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 font-mono leading-relaxed">
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
              <Badge variant="outline" className="mb-4 text-black dark:text-white border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none uppercase font-bold">
                <TrendingUp className="mr-2 h-3 w-3" /> Trending
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground uppercase font-display">
                Featured Books
              </h2>
            </motion.div>
            <Button variant="ghost" className="hidden sm:flex group border-2 border-black rounded-none hover:bg-black hover:text-white font-bold uppercase" asChild>
              <Link to="/readnex">
                View All <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : featuredBooks.length === 0 ? (
            <Card className="bg-white border-4 border-dashed border-black rounded-none">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-600 font-bold uppercase">No books available yet.</p>
                <p className="text-gray-500 font-mono text-sm mt-2">Check back soon for new additions!</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <motion.div key={book.id} {...fadeInUp}>
                  <Card className="h-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all duration-500 group overflow-hidden rounded-none">
                    <div className="relative aspect-[2/3] overflow-hidden border-b-2 border-black dark:border-white">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover transition-all duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Cover'
                        }}
                      />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 border-2 border-black dark:border-white m-2">
                        <Button className="w-full bg-white text-black hover:bg-black hover:text-white font-bold border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase" asChild>
                          <Link to={`/book/${book.id}`}>View Details</Link>
                        </Button>
                      </div>
                      <div className="absolute top-3 right-3 bg-yellow-400 text-black border-2 border-black dark:border-white text-xs font-bold px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-1">
                        <Star className="h-3 w-3 fill-black text-black" />
                        {book.rating.toFixed(1)}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-1 group-hover:underline decoration-2 underline-offset-2 uppercase dark:text-white">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-mono mb-3 uppercase">{book.author}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-mono">
                        {book.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" className="w-full border-2 border-black rounded-none uppercase font-bold" asChild>
              <Link to="/readnex">View All Books</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='relative w-full py-24 bg-secondary border-y-4 border-black dark:border-white'>
        <div className='container mx-auto px-4'>
          <motion.div {...fadeInUp} className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-4 uppercase font-display'>
              Community Voices
            </h2>
            <p className='text-lg text-white/90 max-w-2xl mx-auto font-mono font-bold'>
              See how Knowly is transforming the learning experience for students and educators.
            </p>
          </motion.div>

          <motion.div {...stagger} className='grid md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full p-8 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none relative">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-none border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                      />
                      <div>
                        <p className="font-bold text-foreground uppercase dark:text-white">{testimonial.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-black text-black dark:text-white dark:fill-white" />
                      ))}
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic font-mono border-l-4 border-black dark:border-white pl-4">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Marquee Section */}
      <section className="relative w-full py-16 bg-white dark:bg-zinc-900 border-b-4 border-black dark:border-white overflow-hidden">
        <div className="container mx-auto px-4 mb-10">
          <motion.div {...fadeInUp} className="text-center">
            <Badge variant="outline" className="mb-4 text-black border-2 border-black dark:border-white bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none uppercase font-bold">
              <Sparkles className="mr-2 h-3 w-3" /> Tech Stack
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase font-display">
              Built With Modern Technologies
            </h2>
          </motion.div>
        </div>

        {/* Marquee Container */}
        <div className="relative py-12">
          {/* Scrolling Track */}
          <div className="marquee-wrapper flex">
            <div className="marquee-track flex shrink-0 items-center py-6">
              {techStack.map((tech, index) => (
                <div
                  key={index}
                  className={`tech-card flex flex-col items-center gap-4 mx-6 px-10 py-8 ${tech.bg} border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] cursor-pointer group text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
                >
                  <img
                    src={tech.logo}
                    alt={tech.name}
                    className="h-16 w-16 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 drop-shadow-md"
                  />
                  <span className="font-black text-xl uppercase tracking-tighter">{tech.name}</span>
                </div>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="marquee-track flex shrink-0 items-center py-6" aria-hidden="true">
              {techStack.map((tech, index) => (
                <div
                  key={`dup-${index}`}
                  className={`tech-card flex flex-col items-center gap-4 mx-6 px-10 py-8 ${tech.bg} border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] cursor-pointer group text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
                >
                  <img
                    src={tech.logo}
                    alt={tech.name}
                    className="h-16 w-16 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 drop-shadow-md"
                  />
                  <span className="font-black text-xl uppercase tracking-tighter">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Improved CSS Animation */}
        <style>{`
          .marquee-wrapper {
            overflow: hidden;
            width: 100%;
          }
          
          .marquee-track {
            animation: scroll 40s linear infinite;
            will-change: transform;
          }
          
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
          
          .marquee-wrapper:hover .marquee-track {
            animation-play-state: paused;
          }
          
          .tech-card {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            z-index: 10;
          }
          
          .tech-card:hover {
            transform: translateY(-8px) scale(1.05) rotate(0deg) !important;
            box-shadow: 12px 12px 0px 0px rgba(0,0,0,1) !important;
            z-index: 30;
          }

          /* Dark mode specific hover shadow override */
          :global(.dark) .tech-card:hover {
             box-shadow: 12px 12px 0px 0px rgba(255,255,255,1) !important;
          }
        `}</style>
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
            <div className="relative border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

              <div className="relative z-10 p-12 md:p-20 text-center text-black dark:text-white">
                <h2 className='font-display text-3xl md:text-5xl font-bold mb-6 uppercase'>
                  Ready to start your journey?
                </h2>
                <p className='text-lg md:text-xl text-gray-800 dark:text-gray-300 mb-10 max-w-2xl mx-auto font-mono'>
                  Join thousands of learners today and experience the future of academic reading and collaboration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="h-14 px-8 text-lg bg-black text-white hover:bg-primary hover:text-black border-2 border-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-primary dark:hover:text-black font-bold rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] uppercase transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]" asChild>
                    <Link to='/register'>
                      Get Started for Free
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] uppercase font-bold" asChild>
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