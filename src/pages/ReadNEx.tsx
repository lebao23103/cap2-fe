import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { fadeInUp } from '@/lib/animations'
import { useToast } from '@/components/ui/use-toast'
import booksService from '@/lib/api/books'
import userService from '@/lib/api/user'
import { getCoverImageUrl } from '@/lib/utils/mediaUtils'
import {
  BookOpen,
  Heart,
  Star,
  Search,
  Grid3x3,
  List,
  ChevronDown,
  Play,
  Clock,
  CheckCircle,
  Award,
  BookmarkCheck,
  StickyNote,
  Target,
  MoreVertical
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookCardsLoadingSkeleton, BooksEmptyState, BooksErrorState } from '@/components/books'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Book interface with reading features
interface Book {
  id: number
  title: string
  author: string
  coverImage: string
  rating: number
  readCount?: number
  description: string
  year?: number
  language?: string
  ageGroup?: string
  pages?: number
  isUserCreated?: boolean
  readingProgress?: number
  isFavorite?: boolean
  lastReadDate?: string
  notes?: number
  hasQuiz?: boolean
  quizCompleted?: boolean
  readingTime?: string
  subject?: string
}

// Filter options
const statusFilters = [
  "All",
  "Currently Reading",
  "Completed",
  "Not Started",
  "Favorites",
  "Has Quiz Available",
  "Quiz Completed"
]

interface FilterState {
  statusFilter: string
  searchTerm: string
}

export default function ReadNEx() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterState>({
    statusFilter: "All",
    searchTerm: ""
  })
  const [books, setBooks] = useState<Book[]>([])
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [booksData, favoritesData] = await Promise.all([
        booksService.getApprovedBooks(),
        userService.getFavorites().catch(() => [])
      ])

      // Transform API books to component format
      const transformedBooks: Book[] = booksData.map((book: any) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        coverImage: book.cover_image || '/api/placeholder/300/400',
        rating: book.rating || 0,
        description: book.description || '',
        language: book.language,
        subject: book.subject,
        readingProgress: 0, // Would need to be fetched from reading history
        isFavorite: false, // Will be updated below
        hasQuiz: true // Assume all books have quizzes for now
      }))

      const favoriteIds = new Set(favoritesData.map((fav: any) => fav.book.id))

      // Mark favorites
      transformedBooks.forEach(book => {
        book.isFavorite = favoriteIds.has(book.id)
      })

      setBooks(transformedBooks)
      setFavorites(favoriteIds)
    } catch (error) {
      console.error('Error loading books:', error)
      setError('Failed to load books')
      toast({
        title: 'Error',
        description: 'Failed to load books',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      statusFilter: "All",
      searchTerm: ""
    })
  }

  const handleRetry = () => {
    loadBooks()
  }

  // Filter books based on current filters
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      let matchesStatus = true
      if (filters.statusFilter === "Currently Reading") {
        matchesStatus = book.readingProgress! > 0 && book.readingProgress! < 100
      } else if (filters.statusFilter === "Completed") {
        matchesStatus = book.readingProgress === 100
      } else if (filters.statusFilter === "Not Started") {
        matchesStatus = book.readingProgress === 0
      } else if (filters.statusFilter === "Favorites") {
        matchesStatus = book.isFavorite === true
      } else if (filters.statusFilter === "Has Quiz Available") {
        matchesStatus = book.hasQuiz === true
      } else if (filters.statusFilter === "Quiz Completed") {
        matchesStatus = book.quizCompleted === true
      }

      const matchesSearch = filters.searchTerm === "" ||
        book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(filters.searchTerm.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [filters, books])

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const toggleFavorite = async (bookId: number) => {
    try {
      const isFavorite = favorites.has(bookId)

      if (isFavorite) {
        await userService.removeFromFavorites(bookId)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(bookId)
          return newSet
        })
      } else {
        await userService.addToFavorites(bookId)
        setFavorites(prev => new Set(prev).add(bookId))
      }

      // Update books state
      setBooks(prev => prev.map(book =>
        book.id === bookId ? { ...book, isFavorite: !isFavorite } : book
      ))

      toast({
        title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
        description: isFavorite ? 'Book removed from your favorites' : 'Book added to your favorites'
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive'
      })
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
              }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  const renderProgressBar = (progress: number) => {
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen bg-background py-8">
      <div className="container mx-auto">

        {/* Header with Distinctive Design */}
        <motion.div {...fadeInUp} className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-px w-8 sm:w-16 bg-primary" />
            <h1 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-foreground">Read</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">NEx</span>
            </h1>
            <div className="h-px w-8 sm:w-16 bg-primary" />
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto px-4">
            Your reading library with interactive learning and comprehension exercises
          </p>
        </motion.div>

        {/* Reading Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <Card className="border shadow-md rounded-xl">
            <CardContent className="p-3 sm:p-4 text-center">
              <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 mx-auto mb-1.5 sm:mb-2 text-primary" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-foreground">
                {books.filter(b => b.readingProgress! > 0 && b.readingProgress! < 100).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">Currently Reading</div>
            </CardContent>
          </Card>

          <Card className="border shadow-md rounded-xl">
            <CardContent className="p-3 sm:p-4 text-center">
              <CheckCircle className="h-5 w-5 sm:h-7 sm:w-7 mx-auto mb-1.5 sm:mb-2 text-green-600" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-foreground">
                {books.filter(b => b.readingProgress === 100).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">Completed</div>
            </CardContent>
          </Card>

          <Card className="border shadow-md rounded-xl">
            <CardContent className="p-3 sm:p-4 text-center">
              <Heart className="h-5 w-5 sm:h-7 sm:w-7 mx-auto mb-1.5 sm:mb-2 text-red-600" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-foreground">
                {books.filter(b => b.isFavorite).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">Favorites</div>
            </CardContent>
          </Card>

          <Card className="border shadow-md rounded-xl">
            <CardContent className="p-3 sm:p-4 text-center">
              <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 mx-auto mb-1.5 sm:mb-2 text-blue-600" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-foreground">
                {books.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">Total Books</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="border bg-card backdrop-blur-sm rounded-xl shadow-md">
            <CardContent className="p-3 sm:p-4">

              {/* Search Bar - Compact */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search books by title or author..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">

                {/* Status Filter */}
                <div className="flex-1 w-full space-y-1.5">
                  <label className="text-xs font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                    <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                    Reading Status
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-9 rounded-lg hover:bg-primary/5 hover:border-primary/50 transition-colors text-sm focus:ring-0 focus:ring-offset-0"
                      >
                        <span className="font-medium text-gray-900 dark:text-foreground">{filters.statusFilter}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {statusFilters.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleFilterChange('statusFilter', status)}
                          className="cursor-pointer"
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* View Mode */}
                <div className="flex-1 w-full sm:w-auto space-y-1.5">
                  <label className="text-xs font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                    <Grid3x3 className="h-3.5 w-3.5 text-primary" />
                    View Mode
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-input overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-none px-4 h-9"
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-none px-4 h-9"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary border-0"
                    >
                      {filteredBooks.length} books
                    </Badge>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Books Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Error State */}
          {error ? (
            <BooksErrorState error={error} onRetry={handleRetry} />
          ) : /* Loading State */
            isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <BookCardsLoadingSkeleton count={8} />
              </div>
            ) : /* Empty State */
              filteredBooks.length === 0 ? (
                <BooksEmptyState
                  type="no-results"
                  searchTerm={filters.searchTerm}
                  onClearFilters={handleClearFilters}
                />
              ) : /* Books Grid/List */
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {filteredBooks.map((book, index) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05, // Stagger effect
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                        whileHover={{
                          y: -8,
                          transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
                        }}
                        className="group"
                      >
                        <Card className="h-full border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl">
                          <Link to={`/book/${book.id}`} className="relative aspect-[3/4] overflow-hidden block">
                            <img
                              src={getCoverImageUrl(book.coverImage)}
                              alt={book.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Reading Progress Overlay with Gradient */}
                            {book.readingProgress! > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white p-3">
                                <div className="text-xs font-medium mb-1.5 flex items-center justify-between">
                                  <span>{book.readingProgress}% Complete</span>
                                  <span className="text-white/80">{book.readingProgress === 100 ? '✓' : '→'}</span>
                                </div>
                                {renderProgressBar(book.readingProgress!)}
                              </div>
                            )}

                            {/* Hover Overlay - Elegant with backdrop blur */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4">
                              <Button
                                size="lg"
                                className="bg-white text-gray-900 hover:bg-white/90 shadow-xl font-semibold w-full max-w-[200px]"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  navigate(`/book/${book.id}/read`)
                                }}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {book.readingProgress! > 0 ? 'Continue' : 'Start Reading'}
                              </Button>

                              {/* Secondary Actions Dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md">
                                    <MoreVertical className="h-4 w-4 mr-1" />
                                    More
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="w-48">
                                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {book.hasQuiz && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/book/${book.id}/quiz`)
                                      }}
                                      className="flex items-center cursor-pointer"
                                    >
                                      <Target className="h-4 w-4 mr-2" />
                                      {book.quizCompleted ? 'Retake Quiz' : 'Take Quiz'}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => toggleFavorite(book.id)}>
                                    <Heart className={`h-4 w-4 mr-2 ${book.isFavorite ? 'fill-current text-red-600' : ''}`} />
                                    {book.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Top Right Badge - Consolidated Status/Progress */}
                            <div className="absolute top-3 right-3">
                              {book.quizCompleted ? (
                                <Badge className="bg-emerald-500/90 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1 px-2.5 py-1 shadow-lg border border-white/20">
                                  <Award className="h-3 w-3" />
                                  Complete
                                </Badge>
                              ) : book.hasQuiz && book.readingProgress! >= 80 ? (
                                <Badge className="bg-purple-500/90 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1 px-2.5 py-1 shadow-lg border border-white/20">
                                  <Target className="h-3 w-3" />
                                  Quiz
                                </Badge>
                              ) : book.notes! > 0 ? (
                                <Badge className="bg-blue-500/90 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1 px-2.5 py-1 shadow-lg border border-white/20">
                                  <StickyNote className="h-3 w-3" />
                                  {book.notes}
                                </Badge>
                              ) : book.isFavorite ? (
                                <Badge className="bg-rose-500/90 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1 px-2.5 py-1 shadow-lg border border-white/20">
                                  <Heart className="h-3 w-3 fill-current" />
                                </Badge>
                              ) : null}
                            </div>
                          </Link>

                          <Link to={`/book/${book.id}`}>
                            <CardHeader className="pb-3 pt-4 cursor-pointer">
                              <CardTitle className="text-base font-semibold text-gray-900 dark:text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-1">
                                {book.title}
                              </CardTitle>
                              <CardDescription className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                                {book.author}
                              </CardDescription>
                            </CardHeader>
                          </Link>

                          <CardContent className="pt-0 pb-4">
                            <div className="space-y-3">
                              <div className="flex items-center">
                                {renderStars(book.rating)}
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-muted-foreground">
                                {book.readingTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="font-medium">{book.readingTime}</span>
                                  </div>
                                )}
                                {book.subject && (
                                  <Badge variant="secondary" className="text-xs">
                                    {book.subject}
                                  </Badge>
                                )}
                              </div>
                              {book.lastReadDate && (
                                <div className="text-xs text-gray-500 dark:text-muted-foreground/80 pt-1 border-t border-border/50">
                                  <span className="font-medium">Last read:</span> {new Date(book.lastReadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // List view implementation would go here...
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-600 dark:text-muted-foreground">
                      List view implementation - Coming soon!
                    </div>
                  </div>
                )}
        </motion.div>
      </div>
    </div>
  )
}
