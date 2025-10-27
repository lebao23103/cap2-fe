import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fadeInUp } from '@/lib/animations'
import { 
  BookOpen, 
  Heart, 
  Star, 
  Filter, 
  Search, 
  Grid3x3, 
  List,
  Eye,
  ChevronDown,
  Play,
  Clock,
  CheckCircle,
  Award,
  BookmarkCheck,
  StickyNote,
  Target
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  id: string
  title: string
  author: string
  coverImage: string
  rating: number
  readCount: number
  description: string
  genre: string
  year: number
  language: string
  ageGroup: string
  pages: number
  isUserCreated?: boolean
  readingProgress?: number
  isFavorite?: boolean
  lastReadDate?: string
  notes?: number
  hasQuiz?: boolean
  quizCompleted?: boolean
  readingTime?: string
}

// Enhanced mock book data with reading features
const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    coverImage: "/api/placeholder/300/400",
    rating: 4.5,
    readCount: 12420,
    description: "Between life and death there is a library, and within that library, the shelves go on forever.",
    genre: "Fiction",
    year: 2020,
    language: "English",
    ageGroup: "Adult",
    pages: 288,
    readingProgress: 75,
    isFavorite: true,
    lastReadDate: "2024-10-01",
    notes: 5,
    hasQuiz: true,
    quizCompleted: false,
    readingTime: "4h 30m"
  },
  {
    id: "2",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverImage: "/api/placeholder/300/400",
    rating: 4.8,
    readCount: 18750,
    description: "A lone astronaut must save humanity from an extinction-level threat.",
    genre: "Sci-Fi",
    year: 2021,
    language: "English",
    ageGroup: "Adult",
    pages: 496,
    readingProgress: 0,
    isFavorite: false,
    notes: 0,
    hasQuiz: true,
    quizCompleted: false,
    readingTime: "7h 15m"
  },
  {
    id: "3",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    coverImage: "/api/placeholder/300/400",
    rating: 4.2,
    readCount: 9800,
    description: "A thrilling coming-of-age story about an Artificial Friend.",
    genre: "Literary Fiction",
    year: 2021,
    language: "English",
    ageGroup: "Young Adult",
    pages: 320,
    readingProgress: 100,
    isFavorite: true,
    lastReadDate: "2024-09-28",
    notes: 8,
    hasQuiz: true,
    quizCompleted: true,
    readingTime: "5h 20m"
  },
  {
    id: "4",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    coverImage: "/api/placeholder/300/400",
    rating: 4.7,
    readCount: 25600,
    description: "Aging Hollywood icon finally tells her story of fame and fortune.",
    genre: "Romance",
    year: 2017,
    language: "English",
    ageGroup: "Adult",
    pages: 400,
    readingProgress: 45,
    isFavorite: false,
    lastReadDate: "2024-09-30",
    notes: 3,
    hasQuiz: true,
    quizCompleted: false,
    readingTime: "6h 10m"
  },
  {
    id: "5",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "/api/placeholder/300/400",
    rating: 4.6,
    readCount: 31200,
    description: "An easy & proven way to build good habits & break bad ones.",
    genre: "Self-Help",
    year: 2018,
    language: "English",
    ageGroup: "Adult",
    pages: 320,
    readingProgress: 100,
    isFavorite: true,
    lastReadDate: "2024-09-25",
    notes: 12,
    hasQuiz: true,
    quizCompleted: true,
    readingTime: "5h 45m"
  },
  {
    id: "6",
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    coverImage: "/api/placeholder/300/400",
    rating: 4.3,
    readCount: 14500,
    description: "Four unlikely friends meet weekly to investigate cold cases.",
    genre: "Mystery",
    year: 2020,
    language: "English",
    ageGroup: "Adult",
    pages: 368,
    readingProgress: 20,
    isFavorite: false,
    lastReadDate: "2024-10-02",
    notes: 1,
    hasQuiz: true,
    quizCompleted: false,
    readingTime: "6h 30m"
  }
]

// Filter options
const genres = [
  "All", 
  "Fiction", 
  "Sci-Fi", 
  "Romance", 
  "Mystery", 
  "Fantasy", 
  "Thriller", 
  "Biography", 
  "Self-Help", 
  "Literary Fiction"
]
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
  genre: string
  statusFilter: string
  searchTerm: string
}

export default function ReadNEx() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterState>({
    genre: "All",
    statusFilter: "All",
    searchTerm: ""
  })

  // Filter books based on current filters
  const filteredBooks = useMemo(() => {
    return mockBooks.filter(book => {
      const matchesGenre = filters.genre === "All" || book.genre === filters.genre
      
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
      
      return matchesGenre && matchesStatus && matchesSearch
    })
  }, [filters])

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const toggleFavorite = (bookId: string) => {
    // In a real app, this would update the database
    console.log(`Toggle favorite for book ${bookId}`)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
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

  const getStatusBadge = (book: Book) => {
    if (book.readingProgress === 100) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>
    } else if (book.readingProgress! > 0) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Reading</Badge>
    } else {
      return <Badge variant="outline">Not Started</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Distinctive Design */}
        <motion.div {...fadeInUp} className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-primary" />
            <h1 className="font-sans text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="text-foreground">Read</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">NEx</span>
            </h1>
            <div className="h-px w-16 bg-primary" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your reading library with interactive learning and comprehension exercises
          </p>
        </motion.div>

        {/* Reading Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground">
                {mockBooks.filter(b => b.readingProgress! > 0 && b.readingProgress! < 100).length}
              </div>
              <div className="text-sm text-muted-foreground">Currently Reading</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-foreground">
                {mockBooks.filter(b => b.readingProgress === 100).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-foreground">
                {mockBooks.filter(b => b.isFavorite).length}
              </div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-foreground">
                {mockBooks.filter(b => b.quizCompleted).length}
              </div>
              <div className="text-sm text-muted-foreground">Quizzes Completed</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-card rounded-lg p-6 shadow-md border-0">
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Genre Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Genre
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.genre}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Select Genre</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {genres.map((genre) => (
                      <DropdownMenuItem
                        key={genre}
                        onClick={() => handleFilterChange('genre', genre)}
                      >
                        {genre}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4" />
                  Reading Status
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.statusFilter}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusFilters.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleFilterChange('statusFilter', status)}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* View Mode & Results Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Grid3x3 className="h-4 w-4" />
                  View Mode
                </label>
                <div className="flex items-center justify-between">
                  <div className="flex rounded-lg border border-input overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-none"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge variant="outline" className="text-sm ml-2">
                    {filteredBooks.length} books
                  </Badge>
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
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105 border-0 shadow-lg rounded-xl">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      
                      {/* Reading Progress Overlay */}
                      {book.readingProgress! > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2">
                          <div className="text-xs mb-1">{book.readingProgress}% Complete</div>
                          {renderProgressBar(book.readingProgress!)}
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex flex-col gap-2">
                          <Button size="sm" asChild className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg font-medium">
                            <Link to={`/book/${book.id}/read`}>
                              <Play className="h-4 w-4 mr-2" />
                              {book.readingProgress! > 0 ? 'Continue' : 'Start Reading'}
                            </Link>
                          </Button>
                          {book.hasQuiz && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-purple-100 text-foreground hover:bg-purple-200 border-purple-200 hover:border-purple-300 font-medium"
                              asChild
                            >
                              <Link to={`/book/${book.id}/quiz`}>
                                <Target className="h-4 w-4 mr-2" />
                                {book.quizCompleted ? 'Retake Quiz' : 'Take Quiz'}
                              </Link>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleFavorite(book.id)}
                            className="bg-rose-100 text-foreground hover:bg-rose-200 border-rose-200 hover:border-rose-300 font-medium"
                          >
                            <Heart className={`h-4 w-4 mr-2 ${book.isFavorite ? 'fill-current text-red-600' : ''}`} />
                            {book.isFavorite ? 'Favorited' : 'Add to Favorites'}
                          </Button>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          {book.genre}
                        </Badge>
                        {getStatusBadge(book)}
                      </div>

                      {/* Quiz & Notes Indicators */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {book.hasQuiz && (
                          <Badge className={`text-xs ${book.quizCompleted ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'}`}>
                            {book.quizCompleted ? <Award className="h-3 w-3" /> : <Target className="h-3 w-3" />}
                          </Badge>
                        )}
                        {book.notes! > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            <StickyNote className="h-3 w-3 mr-1" />
                            {book.notes}
                          </Badge>
                        )}
                        {book.isFavorite && (
                          <Badge className="bg-red-600 text-white text-xs">
                            <Heart className="h-3 w-3 fill-current" />
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {book.author}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {renderStars(book.rating)}
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {book.readingTime}
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {book.readCount.toLocaleString()}
                          </div>
                        </div>
                        {book.lastReadDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Last read: {new Date(book.lastReadDate).toLocaleDateString()}
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
              <div className="text-center py-8 text-muted-foreground">
                List view implementation - Coming soon!
              </div>
            </div>
          )}
        </motion.div>

        {/* No Results */}
        {filteredBooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No books found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters to find more books.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}