import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fadeInUp, stagger } from '@/lib/animations'
import {
  BookOpen,
  Feather,
  Scroll,
  BookMarked,
  Coffee,
  Star,
  Quote,
  Users,
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Home() {
  interface Book {
    id: number;
    title: string;
    author: string | null;
    pdf_file: string;
    pages: number | null;
    cover_image: string | null;
    reviews: any[]; // hoặc bạn có thể định nghĩa riêng nếu reviews có cấu trúc cụ thể
    average_rating: number;
  }
  const [data, setData] = useState<Book[]>([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/books/")
      .then(res => {
        console.log(res.data)
        setData(res.data)
      })
      .catch(err => {
        console.log(err)
      })
  }, [])
  // Sample book data for featured books



  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Professor of Literature",
      avatar: "/api/placeholder/64/64",
      content: "Knowly has revolutionized how my students engage with academic texts. The collaborative note-sharing feature creates a truly interactive learning environment.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Graduate Student",
      avatar: "/api/placeholder/64/64",
      content: "The exercise system helps me test my comprehension after each reading session. It's like having a personal tutor that guides my learning journey.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Research Assistant",
      avatar: "/api/placeholder/64/64",
      content: "The knowledge sharing community is incredible. I can see how other researchers have annotated the same texts I'm studying.",
      rating: 5
    }
  ]

  return (
    <div className='relative min-h-screen overflow-hidden bg-background'>
      {/* Hero Section */}
      <section className='relative py-24 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-6xl mx-auto text-center relative'>
          <motion.div {...fadeInUp}>
            <Badge variant="secondary" className="mb-4 px-3 py-1 rounded-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Modern Learning Platform
            </Badge>

            <h1 className='font-sans text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight'>
              Knowly - Knowledge Sharing Platform
              <span className='block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mt-3 leading-tight'>
                for Academic Reading and Exercises
              </span>
            </h1>

            <p className='text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed text-left sm:text-center'>
              Join a vibrant community of learners and educators sharing knowledge through collaborative note-taking, an intelligent chatbot system, and interactive academic exercises.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'>
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-8 py-6 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 transition-transform duration-300">
                <Link to='/readnex' className='flex items-center'>
                  <span>Read & Exercise</span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-medium rounded-lg hover:scale-105 transition-transform duration-300">
                <Link to='/create' className='flex items-center'>
                  <span>Create your book</span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-medium rounded-lg hover:scale-105 transition-transform duration-300">
                <Link to='/noteshare' className='flex items-center'>
                  <span>NoteShare</span>
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'
            >
              {[
                { label: 'Academic Books', value: '25,000', icon: BookOpen },
                { label: 'Students', value: '15,000', icon: Users },
                { label: 'Study Notes', value: '5,200', icon: BookMarked },
                { label: 'Since', value: '2025', icon: Scroll }
              ].map((stat, index) => (
                <motion.div key={index} whileHover={{ y: -5 }} className="bg-card rounded-xl p-6 shadow-md border">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className='font-sans text-2xl font-bold text-foreground mb-1'>
                    {stat.value}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending Now
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Academic Resources
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Curated educational content for deeper learning
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map(book => (
              <motion.div key={book.id} {...fadeInUp}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group border-0 shadow-lg rounded-xl">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                    <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
                         <img
                      src={"book.cover_image"}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    </div>

                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary">concac</Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-white">{book.average_rating}</span>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2 mb-4 text-sm">
                      sách như loz
                    </CardDescription>
                    <Button size="sm" className="w-full" asChild>
                      <Link to={`/book/${book.id}`} className="flex items-center justify-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>Read More</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className='py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <motion.div {...fadeInUp} className='text-center mb-16'>
            <h2 className='font-sans text-3xl md:text-4xl font-bold text-foreground mb-4'>
              Our Services
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-12'>
              A curated experience for the modern learner
            </p>
          </motion.div>

          <motion.div {...stagger} className='grid md:grid-cols-3 gap-8'>
            {[
              {
                icon: Coffee,
                title: 'ReadNEx Hub',
                description: 'Interactive reading platform with exercises and comprehension assessments',
                link: '/readnex'
              },
              {
                icon: Feather,
                title: 'Knowledge Creation',
                description: 'Upload and share academic content to contribute to our learning community',
                link: '/create'
              },
              {
                icon: Sparkles,
                title: 'NoteShare Community',
                description: 'Collaborate with peers through shared annotations and academic discussions',
                link: '/noteshare'
              }
            ].map((service, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Link to={service.link}>
                  <Card className="h-full p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg rounded-xl">
                    <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-muted-foreground">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='relative py-16 px-4 sm:px-6 lg:px-8 bg-muted/50'>
        <div className='max-w-7xl mx-auto'>
          <motion.div {...fadeInUp} className='text-center mb-16'>
            <h2 className='font-sans text-3xl md:text-4xl font-bold text-foreground mb-4'>
              What Our Academic Community Says
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              "Knowledge shared is knowledge multiplied"
            </p>
          </motion.div>

          <motion.div {...stagger} className='grid md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full relative p-6 border-0 shadow-lg rounded-xl">
                  <CardContent className="p-0">
                    <Quote className="h-8 w-8 text-primary mb-4" />
                    <p className='text-muted-foreground mb-6 italic text-lg leading-relaxed'>
                      "{testimonial.content}"
                    </p>
                    <div className='border-t border-border pt-6'>
                      <div className='flex items-center'>
                        <Avatar className='h-12 w-12 mr-4'>
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback className='bg-primary/10 text-primary'>
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium text-foreground'>
                            {testimonial.name}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          <motion.div {...fadeInUp} className="text-center">
            <Card className="p-12 border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="p-0 mb-6">
                <CardTitle className='font-sans text-3xl md:text-4xl font-bold text-foreground mb-4'>
                  Join the Knowledge Revolution
                </CardTitle>
                <CardDescription className='text-lg text-muted-foreground mb-8 max-w-2xl mx-auto'>
                  Connect with learners worldwide and transform how you engage with academic content
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className='flex flex-col gap-4 items-center'>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-8 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <Link to='/register' className="flex items-center">
                      Join Knowly
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <p className='text-sm text-muted-foreground'>
                    Free to join • Academic focus • Collaborative learning
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}