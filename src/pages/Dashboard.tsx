import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Star
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Book {
  id: string
  title: string
  author: string
  cover: string
  rating: number
  genre: string[]
}

export default function Dashboard() {
  const [user] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: ''
  })
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [favorites, setFavorites] = useState<Book[]>([])
  const [readingHistory, setReadingHistory] = useState<Book[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    // TODO: Fetch user data and recommendations from API
    const mockBooks: Book[] = [
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

  const BookCard = ({ book }: { book: Book }) => (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img 
            src={book.cover} 
            alt={book.title} 
            loading="lazy"
            width={64}
            height={80}
            className="w-16 h-20 object-cover rounded-md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">{book.rating}</span>
            </div>
            <div className="flex gap-1 mt-2">
              {book.genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="secondary" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name.split(' ')[0]}! <span role="img" aria-label="waving hand">👋</span>
          </h2>
          <p className="text-muted-foreground">
            Discover your next favorite book with AI-powered recommendations
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            variant="outline" 
            className="min-h-20 flex flex-col gap-2 items-center justify-center"
            onClick={() => navigate('/reading-history')}
          >
            <BookOpen className="h-6 w-6" />
            Continue Reading
          </Button>
          <Button 
            variant="outline" 
            className="min-h-20 flex flex-col gap-2 items-center justify-center"
            onClick={() => navigate('/favorites')}
          >
            <Heart className="h-6 w-6" />
            My Favorites
          </Button>
          <Button 
            variant="outline" 
            className="min-h-20 flex flex-col gap-2 items-center justify-center"
            onClick={() => navigate('/chatbot')}
          >
            <MessageCircle className="h-6 w-6" />
            Chat with AI
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommendations */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Recommended for You</h3>
            <div className="space-y-4">
              {recommendations.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              View More Recommendations
            </Button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reading History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Continue Reading</CardTitle>
                <CardDescription>Your recent books</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {readingHistory.map((book) => (
                  <div key={book.id} className="flex gap-3">
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      loading="lazy"
                      width={48}
                      height={64}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{book.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Favorites</CardTitle>
                <CardDescription>Your saved books</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {favorites.map((book) => (
                  <div key={book.id} className="flex gap-3">
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{book.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
