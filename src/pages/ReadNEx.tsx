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

      const favoriteIds = new Set(
        favoritesData
          .filter((fav: any) => fav?.book?.id)
          .map((fav: any) => fav.book.id)
      )

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
              ? 'fill-primary text-primary'
              : 'text-muted-foreground'
              }`}
          />
        ))}
        <span className="ml-1 text-xs font-bold text-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  const renderProgressBar = (progress: number) => {
    return (
      <div className="w-full bg-white border-2 border-black h-4 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out border-r-2 border-black"
          style={{ width: `${progress}%` }}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen bg-background py-8 sm:py-12 overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="container mx-auto relative z-10 px-4 sm:px-6">

        {/* Header with Distinctive Design */}
        <motion.div {...fadeInUp} className="mb-10 sm:mb-12 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
            <div className="h-2 w-12 sm:w-20 bg-black dark:bg-white" />
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase">
              <span className="text-foreground">Read</span>
              <span className="text-primary bg-black px-2">NEx</span>
            </h1>
            <div className="h-2 w-12 sm:w-20 bg-black dark:bg-white" />
          </div>
          <p className="text-base sm:text-lg text-foreground font-bold max-w-2xl mx-auto leading-relaxed uppercase tracking-wider bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-2 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            Your personal library for interactive learning
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
              color: 'text-black',
              bg: 'bg-blue-400'
            },
            {
              icon: CheckCircle,
              label: 'Completed',
              value: books.filter(b => b.readingProgress === 100).length,
              color: 'text-black',
              bg: 'bg-green-400'
            },
            {
              icon: Heart,
              label: 'Favorites',
              value: books.filter(b => b.isFavorite).length,
              color: 'text-black',
              bg: 'bg-pink-400'
            },
            {
              icon: Grid3x3,
              label: 'Total Books',
              value: books.length,
              color: 'text-black',
              bg: 'bg-purple-400'
            }
          ].map((stat, index) => (
            <Card key={index} className="border-2 border-black dark:border-white bg-white dark:bg-zinc-800 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className={`p-3 border-2 border-black dark:border-white ${stat.bg} mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-black dark:text-white mb-1 font-display">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-black dark:text-gray-300 uppercase tracking-wider">
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
          <div className="bg-primary border-2 border-black dark:border-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <div className="flex flex-col md:flex-row gap-4">

              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="SEARCH BY TITLE, AUTHOR..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white dark:text-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all text-sm placeholder:text-gray-500 font-bold uppercase"
                />
              </div>

              {/* Filters Row */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 px-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all min-w-[140px] justify-between rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-black dark:text-white font-bold uppercase"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <BookmarkCheck className="h-4 w-4" />
                        {filters.statusFilter}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none" align="end">
                    <DropdownMenuLabel className="uppercase font-bold border-b-2 border-black dark:border-white dark:text-white">Filter by Status</DropdownMenuLabel>
                    {statusFilters.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleFilterChange('statusFilter', status)}
                        className="cursor-pointer focus:bg-primary focus:text-black rounded-none my-0.5 font-mono uppercase font-bold hover:bg-primary dark:text-white dark:focus:text-black"
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-all border-2 ${viewMode === 'grid' ? 'bg-primary border-black text-black' : 'border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-all border-2 ${viewMode === 'list' ? 'bg-primary border-black text-black' : 'border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}
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
                        <Card className="h-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 overflow-hidden rounded-none flex flex-col">

                          {/* Cover Image Area */}
                          <Link to={`/book/${book.id}`} className="relative aspect-[3/4] overflow-hidden block border-b-2 border-black">
                            <img
                              src={getCoverImageUrl(book.coverImage)}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />

                            {/* Top Badges */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                              {book.quizCompleted && (
                                <Badge className="bg-green-400 text-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  <Award className="h-3 w-3 mr-1" /> DONE
                                </Badge>
                              )}
                              {book.isFavorite && (
                                <div className="p-1.5 bg-pink-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  <Heart className="h-3.5 w-3.5 fill-current" />
                                </div>
                              )}
                            </div>

                            {/* Reading Progress Bar (Overlay) */}
                            {book.readingProgress! > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t-2 border-black">
                                <div className="flex justify-between text-[10px] font-bold text-black mb-1.5 uppercase tracking-wider">
                                  <span>Progress</span>
                                  <span>{book.readingProgress}%</span>
                                </div>
                                {renderProgressBar(book.readingProgress!)}
                              </div>
                            )}

                            {/* Hover Actions Overlay */}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4 border-2 border-black m-2">
                              <Button
                                size="lg"
                                className="w-full max-w-[160px] bg-white text-black hover:bg-black hover:text-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black rounded-none uppercase"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  navigate(`/book/${book.id}/read`)
                                }}
                              >
                                <Play className="h-4 w-4 mr-2 fill-current" />
                                {book.readingProgress! > 0 ? 'RESUME' : 'READ'}
                              </Button>

                              <div className="flex gap-2">
                                {book.hasQuiz && (
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-10 w-10 bg-white text-black border-2 border-black hover:bg-black hover:text-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                                  className="h-10 w-10 bg-white text-black border-2 border-black hover:bg-black hover:text-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleFavorite(book.id)
                                  }}
                                  title={book.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                  <Heart className={`h-5 w-5 ${book.isFavorite ? 'fill-black text-black' : ''}`} />
                                </Button>
                              </div>
                            </div>
                          </Link>

                          {/* Content Area */}
                          <div className="p-4 flex flex-col flex-1 bg-white dark:bg-zinc-800">
                            <Link to={`/book/${book.id}`} className="block mb-1">
                              <h3 className="font-bold text-lg leading-tight text-black dark:text-white uppercase line-clamp-1 group-hover:underline decoration-2 underline-offset-2">
                                {book.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-mono mb-3 uppercase">
                              {book.author}
                            </p>

                            <div className="mt-auto flex items-center justify-between pt-3 border-t-2 border-black dark:border-white">
                              {renderStars(book.rating)}

                              <div className="flex items-center gap-2">
                                {book.subject && (
                                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-yellow-300 text-black border-2 border-black rounded-none uppercase font-bold">
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
                        <Card className="group overflow-hidden border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 rounded-none">
                          <div className="flex flex-col sm:flex-row gap-4 p-4">
                            <div className="relative w-full sm:w-24 md:w-32 aspect-[2/3] border-2 border-black dark:border-white overflow-hidden flex-shrink-0">
                              <img
                                src={getCoverImageUrl(book.coverImage)}
                                alt={book.title}
                                className="w-full h-full object-cover transition-all duration-500"
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-xl text-black dark:text-white uppercase mb-1 group-hover:underline decoration-2 underline-offset-2">
                                      {book.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 font-mono mb-2 uppercase">{book.author}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    {book.quizCompleted && (
                                      <Badge variant="outline" className="border-2 border-black bg-green-400 text-black rounded-none font-bold uppercase">
                                        Quiz Done
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 max-w-2xl font-mono">
                                  {book.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-black dark:text-white font-bold">
                                  {renderStars(book.rating)}
                                  <span>•</span>
                                  <span className="flex items-center gap-1 uppercase">
                                    <Clock className="h-3.5 w-3.5" /> {book.readingTime || '2h 15m'}
                                  </span>
                                  {book.subject && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="secondary" className="text-xs bg-yellow-300 border-2 border-black rounded-none">{book.subject}</Badge>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                <Button size="sm" onClick={() => navigate(`/book/${book.id}/read`)} className="bg-black text-white hover:bg-primary hover:text-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase font-bold">
                                  <Play className="h-3.5 w-3.5 mr-2" /> Read
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => navigate(`/book/${book.id}`)} className="bg-white text-black border-2 border-black hover:bg-gray-100 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase font-bold dark:bg-zinc-900 dark:text-white dark:border-white dark:hover:bg-zinc-700">
                                  Details
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => toggleFavorite(book.id)} className="border-2 border-black dark:border-white rounded-none hover:bg-pink-400">
                                  <Heart className={`h-4 w-4 ${book.isFavorite ? 'fill-black text-black' : 'dark:text-white'}`} />
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
