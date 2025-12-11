import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { useToast } from '@/components/ui/use-toast'
import booksService from '@/lib/api/books'
import userService from '@/lib/api/user'
import {
  BookOpen,
  Heart,
  Search,
  Grid3x3,
  List,
  ChevronDown,
  CheckCircle,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BookCardsLoadingSkeleton,
  BooksEmptyState,
  BooksErrorState,
  BookGridCard,
  BookListCard
} from '@/components/books'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Book interface with reading features
export interface Book {
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
  hasReadingHistory?: boolean
}

// Filter options
const statusFilters = [
  "All",
  "Currently Reading",
  "Completed",
  "Not Started",
  "Favorites",
  "User Books"
]

interface FilterState {
  statusFilter: string
  searchTerm: string
}

const ITEMS_PER_PAGE = 8

export default function ReadNEx() {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterState>({
    statusFilter: "All",
    searchTerm: ""
  })
  const [books, setBooks] = useState<Book[]>([])
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadBooks()
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const loadBooks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [booksData, favoritesData, historyData, userBooksData] = await Promise.all([
        booksService.getApprovedBooks(),
        userService.getFavorites().catch(() => []),
        userService.getReadingHistory().catch(() => []),
        booksService.getApprovedUserBooks().catch(() => [])
      ])

      // Create lookup map for reading history
      const historyMap = new Map(
        historyData.map((h: any) => [h.book_id, h])
      )

      // Create user books title set for matching
      const userBookTitles = new Set(userBooksData.map((ub: any) => ub.title))

      const favoriteIds = new Set(
        favoritesData
          .filter((fav: any) => fav?.id)
          .map((fav: any) => fav.id)
      )

      // Transform API books to component format
      const transformedBooks: Book[] = booksData.map((book: any) => {
        // Find reading history for this book
        const historyItem = historyMap.get(book.id)

        // Calculate progress
        let progress = 0
        if (historyItem && book.pages && book.pages > 0) {
          progress = Math.min(Math.round((historyItem.page_number / book.pages) * 100), 100)
        } else if (historyItem) {
          progress = 0
        }

        return {
          id: book.id,
          title: book.title,
          author: book.author,
          coverImage: book.cover_image || '/api/placeholder/300/400',
          rating: book.average_rating || 0,
          description: '',
          language: undefined,
          readingProgress: progress,
          isFavorite: favoriteIds.has(book.id),
          pages: book.pages,
          hasReadingHistory: !!historyItem,
          isUserCreated: userBookTitles.has(book.title)
        }
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
        matchesStatus = !!book.hasReadingHistory && (book.readingProgress! < 100)
      } else if (filters.statusFilter === "Completed") {
        matchesStatus = book.readingProgress === 100
      } else if (filters.statusFilter === "Not Started") {
        matchesStatus = !book.hasReadingHistory
      } else if (filters.statusFilter === "Favorites") {
        matchesStatus = book.isFavorite === true
      } else if (filters.statusFilter === "User Books") {
        matchesStatus = book.isUserCreated === true
      }

      const matchesSearch = filters.searchTerm === "" ||
        book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(filters.searchTerm.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [filters, books])

  // Pagination Logic
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE)
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredBooks, currentPage])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      // Scroll to top of list
      window.scrollTo({ top: 300, behavior: 'smooth' })
    }
  }

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

  return (
    <div className="relative w-full min-h-screen bg-background py-8 sm:py-12 overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="container mx-auto relative z-10 px-4 sm:px-6">

        {/* Header with Distinctive Design */}
        {/* Header with Distinctive Design */}
        <motion.div {...fadeInUp} className="mb-12 text-center relative z-20">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
            <div className="h-1.5 sm:h-2 w-16 sm:w-32 bg-foreground" />
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase flex items-center gap-1">
              <span className="text-foreground">Read</span>
              <div className="bg-foreground text-primary px-3 pt-1 pb-2 transform -rotate-1 shadow-neo-sm">
                NEx
              </div>
            </h1>
            <div className="h-1.5 sm:h-2 w-16 sm:w-32 bg-foreground" />
          </div>
          <div className="inline-block relative group">
            <div className="absolute inset-0 bg-foreground translate-x-2 translate-y-2" />
            <p className="relative text-sm sm:text-lg text-background font-bold px-6 py-2 uppercase tracking-[0.2em] bg-foreground border-2 border-background">
              Your personal library for interactive learning
            </p>
          </div>
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
              color: 'text-foreground',
              bg: 'bg-blue-400'
            },
            {
              icon: CheckCircle,
              label: 'Completed',
              value: books.filter(b => b.readingProgress === 100).length,
              color: 'text-foreground',
              bg: 'bg-green-400'
            },
            {
              icon: Heart,
              label: 'Favorites',
              value: books.filter(b => b.isFavorite).length,
              color: 'text-foreground',
              bg: 'bg-pink-400'
            },
            {
              icon: Grid3x3,
              label: 'Total Books',
              value: books.length,
              color: 'text-foreground',
              bg: 'bg-purple-400'
            }
          ].map((stat, index) => (
            <Card key={index} className="border-2 border-border bg-card hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-hover transition-all duration-300 shadow-neo rounded-xl">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className={`p-3 border-2 border-border ${stat.bg} mb-3 shadow-neo-sm`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1 font-display">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
          <div className="bg-primary border-2 border-border p-4 shadow-neo-lg">
            <div className="flex flex-col md:flex-row gap-4">

              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  id="search-books"
                  name="search"
                  placeholder="SEARCH BY TITLE, AUTHOR..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border-2 border-border text-foreground focus:outline-none focus:shadow-neo transition-all text-sm placeholder:text-muted-foreground font-bold uppercase"
                />
              </div>

              {/* Filters Row */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 px-4 border-2 border-border bg-background hover:bg-muted transition-all min-w-[140px] justify-between rounded-lg shadow-neo text-foreground font-bold uppercase"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <BookmarkCheck className="h-4 w-4" />
                        {filters.statusFilter}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 border-2 border-border bg-background shadow-neo rounded-xl" align="end">
                    <DropdownMenuLabel className="uppercase font-bold border-b-2 border-border text-foreground">Filter by Status</DropdownMenuLabel>
                    {statusFilters.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleFilterChange('statusFilter', status)}
                        className={`cursor-pointer focus:bg-primary focus:text-primary-foreground rounded-md my-0.5 font-bold uppercase hover:bg-primary hover:text-primary-foreground flex items-center justify-between ${filters.statusFilter === status ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}
                      >
                        <span className="flex items-center">
                          {status}
                        </span>
                        {filters.statusFilter === status && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex bg-background border-2 border-border p-1 shadow-neo">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-all border-2 ${viewMode === 'grid' ? 'bg-primary border-border text-primary-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-all border-2 ${viewMode === 'list' ? 'bg-primary border-border text-primary-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Books Grid/List */}
        <AnimatePresence mode="wait">
          {error ? (
            <BooksErrorState key="error" error={error} onRetry={handleRetry} />
          ) : isLoading ? (
            <div key="loading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <BookCardsLoadingSkeleton count={8} />
            </div>
          ) : filteredBooks.length === 0 ? (
            <BooksEmptyState
              key="empty"
              type="no-results"
              searchTerm={filters.searchTerm}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedBooks.map((book, index) => (
                    <BookGridCard
                      key={book.id}
                      book={book}
                      onToggleFavorite={toggleFavorite}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedBooks.map((book, index) => (
                    <BookListCard
                      key={book.id}
                      book={book}
                      onToggleFavorite={toggleFavorite}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-2 border-border rounded-lg font-bold uppercase disabled:opacity-50 hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Prev
                  </Button>

                  <span className="text-sm font-bold uppercase tracking-wider bg-primary px-3 py-1 border-2 border-border text-primary-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-2 border-border rounded-lg font-bold uppercase disabled:opacity-50 hover:bg-muted"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
