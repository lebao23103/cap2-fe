import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { BookCard, type BookData } from '../components/ui/book-card'
import { 
  BookOpen, 
  Heart, 
  MessageCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [user] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: ''
  })
  const [recommendations, setRecommendations] = useState<BookData[]>([])
  const [favorites, setFavorites] = useState<BookData[]>([])
  const [readingHistory, setReadingHistory] = useState<BookData[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    // TODO: Fetch user data and recommendations from API
    const mockBooks: BookData[] = [
      {
        id: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.5,
        genre: ['Classic', 'Fiction']
      },
      {
        id: '2',
        title: 'Dune',
        author: 'Frank Herbert',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.8,
        genre: ['Sci-Fi', 'Adventure']
      },
      {
        id: '3',
        title: '1984',
        author: 'George Orwell',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.6,
        genre: ['Dystopian', 'Classic']
      }
    ]
    
    setRecommendations(mockBooks)
    setFavorites(mockBooks.slice(0, 2))
    setReadingHistory(mockBooks.slice(1, 3))
  }, [])


  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-foreground">
            Welcome back, {user.name.split(' ')[0]}! <span role="img" aria-label="waving hand">👋</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
            Discover your next favorite book with AI-powered recommendations
          </p>
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
              {recommendations.map((book) => (
                <BookCard key={book.id} book={book} size="md" />
              ))}
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
                {readingHistory.map((book) => (
                  <BookCard key={book.id} book={book} size="sm" />
                ))}
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-foreground">My Favorites</CardTitle>
                <CardDescription className="text-gray-600 dark:text-muted-foreground">Your saved books</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {favorites.map((book) => (
                  <BookCard key={book.id} book={book} size="sm" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
