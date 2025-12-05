import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { useToast } from '../components/ui/use-toast'
import {
  ArrowLeft,
  Search,
  Star,
  Heart,
  Trash2,
  Filter,
  Loader2
} from 'lucide-react'
import userService, { type Favorite } from '../lib/api/user'

interface Book {
  id: number
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
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<Book[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setIsLoading(true)
      const favoritesData = await userService.getFavorites()

      // Transform API data to match component interface
      const transformedFavorites: Book[] = favoritesData.map((fav: Favorite) => ({
        id: fav.book.id,
        title: fav.book.title,
        author: fav.book.author,
        cover: fav.book.cover_image || 'https://via.placeholder.com/150x200',
        rating: fav.book.rating,
        genre: fav.book.subject ? [fav.book.subject] : ['General'],
        dateAdded: fav.added_at,
        description: fav.book.description || ''
      }))

      setFavorites(transformedFavorites)
      setFilteredFavorites(transformedFavorites)
    } catch (error) {
      console.error('Error loading favorites:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your favorites',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleRemoveFavorite = async (bookId: number) => {
    try {
      await userService.removeFromFavorites(bookId)
      setFavorites(prev => prev.filter(book => book.id !== bookId))
      toast({
        title: 'Success',
        description: 'Book removed from favorites'
      })
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove book from favorites',
        variant: 'destructive'
      })
    }
  }

  const allGenres = Array.from(new Set(favorites.flatMap(book => book.genre)))

  const BookCard = ({ book }: { book: Book }) => (
    <Card className="group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-16 h-20 shrink-0 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <img
              src={book.cover}
              alt={`${book.title} by ${book.author} - Book cover`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-black dark:text-white line-clamp-2 uppercase">{book.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{book.author}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-black text-black dark:fill-white dark:text-white" />
              <span className="text-xs font-bold text-black dark:text-white">{book.rating}</span>
            </div>
            <div className="flex gap-1 mt-2">
              {book.genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="secondary" className="text-[10px] rounded-none border border-black dark:border-white bg-primary/20 text-black dark:text-white font-bold uppercase">
                  {g}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono">
              Added: {new Date(book.dateAdded).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFavorite(book.id)}
            className="md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/40 rounded-none h-8 w-8 p-0"
            aria-label={`Remove ${book.title} from favorites`}
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background font-mono relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Header */}
      <header className="border-b-4 border-black dark:border-white bg-white dark:bg-zinc-800 relative z-10">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-transparent hover:text-primary font-bold uppercase transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4 text-black dark:text-white" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <Heart className="h-4 w-4 text-black fill-black" />
                <span className="font-black text-black uppercase">My Favorites</span>
              </div>
            </div>
            <div className="text-sm font-bold font-mono text-black dark:text-white bg-white dark:bg-zinc-900 border-2 border-black dark:border-white px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              {filteredFavorites.length} of {favorites.length} books
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 relative z-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white h-4 w-4 transition-colors" />
                  <Input
                    placeholder="SEARCH YOUR FAVORITES..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg font-bold border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none transition-all placeholder:text-gray-400 bg-white dark:bg-zinc-900 text-black dark:text-white uppercase"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black dark:text-white pointer-events-none z-10" />
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="pl-9 pr-8 h-12 border-2 border-black dark:border-white rounded-none bg-white dark:bg-zinc-900 text-black dark:text-white font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] cursor-pointer focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all appearance-none min-w-[180px]"
                    >
                      <option value="all">Check All Genres</option>
                      {allGenres.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
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
                <Card className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-zinc-900">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-black text-black dark:text-white mb-2">{favorites.length}</div>
                    <div className="text-sm font-bold uppercase text-gray-600 dark:text-gray-400">Total Favorites</div>
                  </CardContent>
                </Card>
                <Card className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-zinc-900">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-black text-black dark:text-white mb-2">
                      {allGenres.length}
                    </div>
                    <div className="text-sm font-bold uppercase text-gray-600 dark:text-gray-400">Different Genres</div>
                  </CardContent>
                </Card>
                <Card className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-zinc-900">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="h-8 w-8 fill-black text-black dark:fill-white dark:text-white" />
                      <span className="text-4xl font-black text-black dark:text-white">{(favorites.reduce((sum, book) => sum + book.rating, 0) / favorites.length).toFixed(1)}</span>
                    </div>
                    <div className="text-sm font-bold uppercase text-gray-600 dark:text-gray-400">Average Rating</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

