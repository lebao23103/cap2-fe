import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookCard } from '@/components/ui/book-card'
import { BookCardsLoadingSkeleton, BooksEmptyState } from '@/components/books'
import {
  Search as SearchIcon,
  Filter,
  X,
  // BookOpen,
  SlidersHorizontal,
  Grid3x3,
  List
} from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  cover: string
  rating: number
  genre: string[]
  year: number
  description: string
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filters
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [showFilters, setShowFilters] = useState(false)

  const genres = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Fantasy', 'Biography', 'History', 'Self-Help']

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const booksPerPage = 12
  const indexOfLastBook = currentPage * booksPerPage
  const indexOfFirstBook = indexOfLastBook - booksPerPage
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook)
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage)

  // Mock data
  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mockBooks: Book[] = [
      {
        id: '1',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.5,
        genre: ['Fiction', 'Fantasy'],
        year: 2020,
        description: 'Between life and death there is a library.'
      },
      {
        id: '2',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.8,
        genre: ['Science Fiction'],
        year: 2021,
        description: 'A lone astronaut must save humanity.'
      },
      {
        id: '3',
        title: 'Atomic Habits',
        author: 'James Clear',
        cover: 'https://via.placeholder.com/150x200',
        rating: 4.7,
        genre: ['Non-Fiction', 'Self-Help'],
        year: 2018,
        description: 'Tiny changes, remarkable results.'
      },
      // Add more mock books as needed
    ]

    setBooks(mockBooks)
    setFilteredBooks(mockBooks)
    setLoading(false)
  }

  // Search and filter logic
  useEffect(() => {
    let results = [...books]

    // Apply search query
    if (searchQuery) {
      results = results.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply genre filter
    if (selectedGenres.length > 0) {
      results = results.filter(book =>
        selectedGenres.some(genre => book.genre.includes(genre))
      )
    }

    // Apply rating filter
    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating)
      results = results.filter(book => book.rating >= minRating)
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating-high':
        results.sort((a, b) => b.rating - a.rating)
        break
      case 'rating-low':
        results.sort((a, b) => a.rating - b.rating)
        break
      case 'title-az':
        results.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title-za':
        results.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'year-new':
        results.sort((a, b) => b.year - a.year)
        break
      case 'year-old':
        results.sort((a, b) => a.year - b.year)
        break
    }

    setFilteredBooks(results)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, selectedGenres, selectedRating, sortBy, books])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery })
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedRating('all')
    setSortBy('relevance')
    setSearchQuery('')
    setSearchParams({})
  }

  const hasActiveFilters = selectedGenres.length > 0 || selectedRating !== 'all' || sortBy !== 'relevance' || searchQuery

  return (
    <div className="min-h-screen bg-background font-mono relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="container mx-auto py-6 sm:py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 p-6 border-4 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 text-black dark:text-white uppercase font-display">
            Discover Books
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            Search and explore our collection of academic resources
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" aria-hidden="true" />
            <Input
              type="search"
              placeholder="SEARCH TITLES, AUTHORS, OR KEYWORDS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-14 text-lg font-bold border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none transition-all placeholder:text-gray-400 bg-white dark:bg-zinc-900 text-black dark:text-white uppercase"
            />
          </div>
        </form>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Toggle Filters Button (Mobile) */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden w-full border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 text-black dark:text-white uppercase font-bold"
          >
            <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
            Filters {hasActiveFilters && `(${selectedGenres.length + (selectedRating !== 'all' ? 1 : 0)})`}
          </Button>

          {/* Desktop Filters */}
          <div className={`flex-1 flex flex-col sm:flex-row gap-4 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px] border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900 text-black dark:text-white font-bold uppercase transition-all">
                <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900">
                <SelectItem value="relevance" className="font-bold uppercase focus:bg-primary focus:text-black">Most Relevant</SelectItem>
                <SelectItem value="rating-high" className="font-bold uppercase focus:bg-primary focus:text-black">Highest Rated</SelectItem>
                <SelectItem value="rating-low" className="font-bold uppercase focus:bg-primary focus:text-black">Lowest Rated</SelectItem>
                <SelectItem value="title-az" className="font-bold uppercase focus:bg-primary focus:text-black">Title (A-Z)</SelectItem>
                <SelectItem value="title-za" className="font-bold uppercase focus:bg-primary focus:text-black">Title (Z-A)</SelectItem>
                <SelectItem value="year-new" className="font-bold uppercase focus:bg-primary focus:text-black">Newest First</SelectItem>
                <SelectItem value="year-old" className="font-bold uppercase focus:bg-primary focus:text-black">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Rating Filter */}
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-full sm:w-[180px] border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900 text-black dark:text-white font-bold uppercase transition-all">
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900">
                <SelectItem value="all" className="font-bold uppercase focus:bg-primary focus:text-black">All Ratings</SelectItem>
                <SelectItem value="4.5" className="font-bold uppercase focus:bg-primary focus:text-black">4.5+ Stars</SelectItem>
                <SelectItem value="4.0" className="font-bold uppercase focus:bg-primary focus:text-black">4.0+ Stars</SelectItem>
                <SelectItem value="3.5" className="font-bold uppercase focus:bg-primary focus:text-black">3.5+ Stars</SelectItem>
                <SelectItem value="3.0" className="font-bold uppercase focus:bg-primary focus:text-black">3.0+ Stars</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all ${viewMode === 'grid' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
              >
                <Grid3x3 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all ${viewMode === 'list' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
              >
                <List className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Genre Filters */}
        <div className={`mb-6 ${showFilters ? 'block' : 'hidden sm:block'}`}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-black uppercase text-black dark:text-white">Genres:</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 font-bold uppercase transition-colors">
                <X className="mr-1 h-3 w-3" aria-hidden="true" />
                Clear all
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                className={`cursor-pointer transition-all rounded-none border-2 border-black dark:border-white px-3 py-1 text-sm font-bold uppercase ${selectedGenres.includes(genre)
                    ? 'bg-primary text-black hover:bg-primary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  }`}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
                {selectedGenres.includes(genre) && (
                  <X className="ml-1 h-3 w-3" aria-hidden="true" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {loading ? (
            <span>Searching...</span>
          ) : (
            <span>
              {filteredBooks.length} {filteredBooks.length === 1 ? 'result' : 'results'}
              {searchQuery && ` for "${searchQuery}"`}
            </span>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <BookCardsLoadingSkeleton count={12} />
          </div>
        ) : filteredBooks.length === 0 ? (
          <BooksEmptyState
            type="no-results"
            searchTerm={searchQuery}
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            {/* Books Grid/List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {currentBooks.map((book) => (
                <BookCard key={book.id} book={book} size={viewMode === 'grid' ? 'md' : 'lg'} />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white disabled:opacity-50"
                >
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 border-2 border-black dark:border-white rounded-none font-bold transition-all ${currentPage === page
                              ? 'bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                              : 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-1px]'
                            }`}
                        >
                          {page}
                        </Button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 font-bold text-black dark:text-white">...</span>
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}


