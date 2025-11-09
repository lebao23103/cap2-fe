import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Heart, 
  Trash2,
  Filter
} from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  cover: string
  rating: number
  genre: string[]
  dateAdded: string
  description: string
}

export default function Favorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Book[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')

  useEffect(() => {
    // TODO: Fetch favorites from API
    const mockFavorites: Book[] = [
      {
        id: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.5,
        genre: ['Classic', 'Fiction'],
        dateAdded: '2024-01-15',
        description: 'A classic American novel about the Jazz Age.'
      },
      {
        id: '2',
        title: 'Dune',
        author: 'Frank Herbert',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.8,
        genre: ['Sci-Fi', 'Adventure'],
        dateAdded: '2024-01-10',
        description: 'Epic science fiction masterpiece.'
      },
      {
        id: '3',
        title: '1984',
        author: 'George Orwell',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.6,
        genre: ['Dystopian', 'Classic'],
        dateAdded: '2024-01-05',
        description: 'A dystopian social science fiction novel.'
      },
      {
        id: '4',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.7,
        genre: ['Classic', 'Drama'],
        dateAdded: '2024-01-01',
        description: 'A gripping tale of racial injustice.'
      }
    ]

    setFavorites(mockFavorites)
    setFilteredFavorites(mockFavorites)
  }, [])

  useEffect(() => {
    let filtered = favorites

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.genre.includes(selectedGenre))
    }

    setFilteredFavorites(filtered)
  }, [searchTerm, selectedGenre, favorites])

  const handleRemoveFavorite = (bookId: string) => {
    setFavorites(prev => prev.filter(book => book.id !== bookId))
    // TODO: API call to remove from favorites
  }

  const allGenres = Array.from(new Set(favorites.flatMap(book => book.genre)))

  const BookCard = ({ book }: { book: Book }) => (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={book.cover}
            alt={`${book.title} by ${book.author} - Book cover`}
            className="w-16 h-20 object-cover rounded-md"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-foreground line-clamp-2">{book.title}</h3>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">{book.author}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600 dark:text-muted-foreground">{book.rating}</span>
            </div>
            <div className="flex gap-1 mt-2">
              {book.genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="secondary" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-2">
              Added: {new Date(book.dateAdded).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFavorite(book.id)}
            className="md:opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Remove ${book.title} from favorites`}
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-500" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4 text-gray-600 dark:text-foreground" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-semibold text-gray-900 dark:text-foreground">My Favorites</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-muted-foreground">
              {filteredFavorites.length} of {favorites.length} books
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search your favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400 dark:text-muted-foreground" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="border rounded px-3 py-2 bg-background text-sm"
              >
                <option value="all">All Genres</option>
                {allGenres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-foreground">
              {searchTerm || selectedGenre !== 'all' ? 'No matching favorites' : 'No favorites yet'}
            </h3>
            <p className="text-gray-600 dark:text-muted-foreground mb-4">
              {searchTerm || selectedGenre !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start adding books to your favorites from the dashboard or book details page.'
              }
            </p>
            {!searchTerm && selectedGenre === 'all' && (
              <Button onClick={() => window.location.href = '/dashboard'}>
                Browse Books
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Statistics */}
        {favorites.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">{favorites.length}</div>
                <div className="text-sm text-gray-600 dark:text-muted-foreground">Total Favorites</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">
                  {allGenres.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-muted-foreground">Different Genres</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">
                  {(favorites.reduce((sum, book) => sum + book.rating, 0) / favorites.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

