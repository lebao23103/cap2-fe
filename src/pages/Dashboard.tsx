import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { BookCard, type BookData } from '../components/ui/book-card'
import { useToast } from '../components/ui/use-toast'
import { 
  BookOpen, 
  Heart, 
  MessageCircle,
  Target,
  StickyNote,
  Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import userService from '../lib/api/user'
import booksService from '../lib/api/books'
import notesService from '../lib/api/notes'

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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-foreground">
            Welcome back, {user?.first_name || 'there'}! <span role="img" aria-label="waving hand">👋</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
            Discover your next favorite book with AI-powered recommendations
          </p>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">{stats.booksRead}</div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">Books Read</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">{stats.dayStreak}</div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">{stats.favoritesCount}</div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <StickyNote className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">{stats.notesCount}</div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">Notes Made</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="outline" 
            className="min-h-16 sm:min-h-20 flex flex-col gap-1 sm:gap-2 items-center justify-center text-sm sm:text-base"
            onClick={() => navigate('/reading-history')}
          >
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-foreground" />
            Continue Reading
          </Button>
          <Button 
            variant="outline" 
            className="min-h-16 sm:min-h-20 flex flex-col gap-1 sm:gap-2 items-center justify-center text-sm sm:text-base"
            onClick={() => navigate('/favorites')}
          >
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-foreground" />
            My Favorites
          </Button>
          <Button 
            variant="outline" 
            className="min-h-16 sm:min-h-20 flex flex-col gap-1 sm:gap-2 items-center justify-center text-sm sm:text-base"
            onClick={() => navigate('/chatbot')}
          >
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-foreground" />
            Chat with AI
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recommendations */}
          <div className="lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-foreground">Recommended for You</h2>
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recommendations available yet</p>
              ) : (
                recommendations.map((book) => (
                  <BookCard key={book.id} book={book} size="md" />
                ))
              )}
            </div>
            <div className="flex justify-center mt-6">
              <Button className="max-w-xs" variant="outline">
                View More Recommendations
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Reading History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-foreground">Continue Reading</CardTitle>
                <CardDescription className="text-gray-600 dark:text-muted-foreground">Your recent books</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-foreground">My Favorites</CardTitle>
                <CardDescription className="text-gray-600 dark:text-muted-foreground">Your saved books</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {favorites.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">No favorites yet</p>
                ) : (
                  favorites.map((book) => (
                    <BookCard key={book.id} book={book} size="sm" />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  )
}
