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
  Target
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
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
            className={`h-3.5 w-3.5 ${star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
              }`}
          />
        ))}
        <span className="ml-1 text-xs font-medium text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  const renderProgressBar = (progress: number) => {
    return (
      <div className="w-full bg-white/20 rounded-full h-1.5 backdrop-blur-sm overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-300 to-amber-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen bg-background py-8 sm:py-12 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="container mx-auto relative z-10 px-4 sm:px-6">

        {/* Header with Distinctive Design */}
        <motion.div {...fadeInUp} className="mb-10 sm:mb-12 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
            <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-primary/50" />
            <h1 className="font-sans text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-foreground">Read</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">NEx</span>
            </h1>
            <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your personal library for interactive learning and comprehension mastery
          </p>
        </motion.div>

        {/* Reading Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            {
              icon: BookOpen,
              label: 'Reading',
              value: books.filter(b => b.readingProgress! > 0 && b.readingProgress! < 100).length,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10'
            },
            {
              icon: CheckCircle,
              label: 'Completed',
              value: books.filter(b => b.readingProgress === 100).length,
              color: 'text-green-500',
              bg: 'bg-green-500/10'
            },
            {
              icon: Heart,
              label: 'Favorites',
              value: books.filter(b => b.isFavorite).length,
              color: 'text-rose-500',
              bg: 'bg-rose-500/10'
            },
            {
              icon: Grid3x3,
              label: 'Total Books',
              value: books.length,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10'
            }
          ].map((stat, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className={`p-3 rounded-full ${stat.bg} mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 sticky top-20 z-30"
        >
          <div className="glass dark:glass-dark rounded-2xl p-4 shadow-xl border border-white/20 dark:border-white/10 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row gap-4">

              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by title, author, or subject..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
                />
              </div>

              {/* Filters Row */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 px-4 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 transition-all min-w-[140px] justify-between"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                        {filters.statusFilter}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-xl border-border/50 bg-popover/95 backdrop-blur-xl" align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusFilters.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleFilterChange('statusFilter', status)}
                        className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-lg my-0.5"
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle */}
                <div className="flex bg-background/50 rounded-xl p-1 border border-border/50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBooks.map((book, index) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                        className="group relative"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/20 to-secondary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                        <Card className="h-full border-0 bg-card/80 dark:bg-card/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl relative z-10 flex flex-col hover:-translate-y-1">

                          {/* Cover Image Area */}
                          <Link to={`/book/${book.id}`} className="relative aspect-[2/3] overflow-hidden block">
                            <img
                              src={getCoverImageUrl(book.coverImage)}
                              alt={book.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                            {/* Top Badges */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                              {book.quizCompleted && (
                                <Badge className="bg-emerald-500/90 backdrop-blur-md text-white border-0 shadow-lg">
                                  <Award className="h-3 w-3 mr-1" /> Complete
                                </Badge>
                              )}
                              {book.isFavorite && (
                                <div className="p-1.5 rounded-full bg-rose-500/90 backdrop-blur-md text-white shadow-lg">
                                  <Heart className="h-3.5 w-3.5 fill-current" />
                                </div>
                              )}
                            </div>

                            {/* Reading Progress Bar (Overlay) */}
                            {book.readingProgress! > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                <div className="flex justify-between text-[10px] font-medium text-white/90 mb-1.5 uppercase tracking-wider">
                                  <span>Progress</span>
                                  <span>{book.readingProgress}%</span>
                                </div>
                                {renderProgressBar(book.readingProgress!)}
                              </div>
                            )}

                            {/* Hover Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4">
                              <Button
                                size="lg"
                                className="w-full max-w-[160px] bg-white text-black hover:bg-white/90 font-semibold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  navigate(`/book/${book.id}/read`)
                                }}
                              >
                                <Play className="h-4 w-4 mr-2 fill-current" />
                                {book.readingProgress! > 0 ? 'Resume' : 'Read'}
                              </Button>

                              <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                                {book.hasQuiz && (
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="rounded-full h-10 w-10 bg-white/20 hover:bg-white/40 text-white border-0 backdrop-blur-md"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      navigate(`/book/${book.id}/quiz`)
                                    }}
                                    title="Take Quiz"
                                  >
                                    <Target className="h-5 w-5" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="rounded-full h-10 w-10 bg-white/20 hover:bg-white/40 text-white border-0 backdrop-blur-md"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleFavorite(book.id)
                                  }}
                                  title={book.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                  <Heart className={`h-5 w-5 ${book.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                                </Button>
                              </div>
                            </div>
                          </Link>

                          {/* Content Area */}
                          <div className="p-4 flex flex-col flex-1">
                            <Link to={`/book/${book.id}`} className="block mb-1">
                              <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {book.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground font-medium mb-3">
                              {book.author}
                            </p>

                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
                              {renderStars(book.rating)}

                              <div className="flex items-center gap-2">
                                {book.subject && (
                                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 border-0">
                                    {book.subject}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // List view implementation
                  <div className="space-y-4">
                    {filteredBooks.map((book, index) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="group overflow-hidden border-0 bg-card/50 hover:bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex flex-col sm:flex-row gap-4 p-4">
                            <div className="relative w-full sm:w-24 md:w-32 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={getCoverImageUrl(book.coverImage)}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
                                      {book.title}
                                    </h3>
                                    <p className="text-muted-foreground font-medium mb-2">{book.author}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    {book.quizCompleted && (
                                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-500/5">
                                        Quiz Done
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-2xl">
                                  {book.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {renderStars(book.rating)}
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" /> {book.readingTime || '2h 15m'}
                                  </span>
                                  {book.subject && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="secondary" className="text-xs">{book.subject}</Badge>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                <Button size="sm" onClick={() => navigate(`/book/${book.id}/read`)}>
                                  <Play className="h-3.5 w-3.5 mr-2" /> Read
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => navigate(`/book/${book.id}`)}>
                                  Details
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => toggleFavorite(book.id)}>
                                  <Heart className={`h-4 w-4 ${book.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
        </motion.div>
      </div>
    </div>
  )
}
