import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BookCard, type BookData } from '../components/ui/book-card'
import { useToast } from '../components/ui/use-toast'
import {
  BookOpen,
  Heart,
  MessageCircle,
  Target,
  StickyNote,
  Loader2,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import userService from '../lib/api/user'
import booksService from '../lib/api/books'
import notesService from '../lib/api/notes'
import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '@/lib/animations'

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [recommendations, setRecommendations] = useState<BookData[]>([])
  const [favorites, setFavorites] = useState<BookData[]>([])
  const [readingHistory, setReadingHistory] = useState<BookData[]>([])

  // Stats
  const [stats, setStats] = useState({
    booksRead: 0,
    dayStreak: 0,
    favoritesCount: 0,
    notesCount: 0
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch all dashboard data in parallel
      const [booksData, favoritesData, historyData, notesStats] = await Promise.all([
        booksService.getApprovedBooks().catch(() => []),
        userService.getFavorites().catch(() => []),
        userService.getReadingHistory().catch(() => []),
        notesService.getUserNotesStatistics().catch(() => ({ total_notes: 0 }))
      ])

      // Transform books for recommendations (show first 3 approved books with null checks)
      const transformedRecommendations: BookData[] = booksData
        .filter((book: any) => book && book.id && book.title)
        .slice(0, 3)
        .map((book: any) => ({
          id: book.id.toString(),
          title: book.title,
          author: book.author || 'Unknown Author',
          cover: book.cover_image || 'https://via.placeholder.com/150x200',
          rating: book.rating || 0,
          genre: book.subject ? [book.subject] : ['General']
        }))

      // Transform favorites (with null checks)
      const transformedFavorites: BookData[] = favoritesData
        .filter((fav: any) => fav && fav.book && fav.book.id)
        .slice(0, 2)
        .map((fav: any) => ({
          id: fav.book.id.toString(),
          title: fav.book.title,
          author: fav.book.author || 'Unknown Author',
          cover: fav.book.cover_image || 'https://via.placeholder.com/150x200',
          rating: fav.book.rating || 0,
          genre: fav.book.subject ? [fav.book.subject] : ['General']
        }))

      // Transform reading history (with null checks)
      const transformedHistory: BookData[] = historyData
        .filter((item: any) => item && item.book && item.book.id)
        .slice(0, 2)
        .map((item: any) => ({
          id: item.book.id.toString(),
          title: item.book.title,
          author: item.book.author || 'Unknown Author',
          cover: item.book.cover_image || 'https://via.placeholder.com/150x200',
          rating: item.book.rating || 0,
          genre: item.book.subject ? [item.book.subject] : ['General']
        }))

      // Calculate stats (with null checks)
      const completedBooks = historyData.filter((item: any) => item && item.status === 'completed').length

      setRecommendations(transformedRecommendations)
      setFavorites(transformedFavorites)
      setReadingHistory(transformedHistory)
      setStats({
        booksRead: completedBooks,
        dayStreak: 0, // Backend doesn't track streak yet
        favoritesCount: favoritesData.length,
        notesCount: notesStats.total_notes || 0
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      <main className="container mx-auto py-8 sm:py-12 relative z-10 px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.first_name || 'Scholar'}</span>! <span role="img" aria-label="waving hand" className="animate-pulse inline-block">👋</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your personal knowledge hub is ready. Continue where you left off or discover something new.
          </p>
        </motion.div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Books Read', value: stats.booksRead, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Day Streak', value: stats.dayStreak, icon: Target, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Favorites', value: stats.favoritesCount, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                { label: 'Notes Made', value: stats.notesCount, icon: StickyNote, color: 'text-amber-500', bg: 'bg-amber-500/10' }
              ].map((stat, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2 items-center justify-center bg-card/50 backdrop-blur-sm border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => navigate('/reading-history')}
              >
                <BookOpen className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-semibold text-foreground group-hover:text-primary">Continue Reading</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2 items-center justify-center bg-card/50 backdrop-blur-sm border-dashed border-2 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group"
                onClick={() => navigate('/favorites')}
              >
                <Heart className="h-6 w-6 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                <span className="font-semibold text-foreground group-hover:text-rose-500">My Favorites</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2 items-center justify-center bg-card/50 backdrop-blur-sm border-dashed border-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                onClick={() => navigate('/chatbot')}
              >
                <MessageCircle className="h-6 w-6 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                <span className="font-semibold text-foreground group-hover:text-blue-500">Chat with AI</span>
              </Button>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recommendations */}
              <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recommended for You
                  </h2>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => navigate('/readnex')}>
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {recommendations.length === 0 ? (
                    <Card className="bg-card/30 border-dashed">
                      <CardContent className="p-8 text-center text-muted-foreground">
                        No recommendations available yet. Start reading to get personalized suggestions!
                      </CardContent>
                    </Card>
                  ) : (
                    recommendations.map((book) => (
                      <BookCard key={book.id} book={book} size="md" />
                    ))
                  )}
                </div>
              </motion.div>

              {/* Sidebar */}
              <motion.div variants={fadeInUp} className="space-y-6">
                {/* Reading History */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Continue Reading
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {readingHistory.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">No reading history yet</p>
                    ) : (
                      readingHistory.map((book) => (
                        <BookCard key={book.id} book={book} size="sm" />
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Favorites */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500" />
                      My Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {favorites.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">No favorites yet</p>
                    ) : (
                      favorites.map((book) => (
                        <BookCard key={book.id} book={book} size="sm" />
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
