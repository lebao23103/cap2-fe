import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fadeInUp, stagger } from '@/lib/animations'
import {
  BookOpen, 
  Heart, 
  Star, 
  Filter, 
  Search, 
  Grid3x3, 
  List,
  Eye,
  StickyNote,
  ChevronDown,
  Users,
  MessageCircle,
  ThumbsUp,
  Share2,
  Calendar,
  User,
  BookmarkCheck,
  Feather,
  Quote
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

// Shared Note interface
interface SharedNote {
  id: string
  bookTitle: string
  bookAuthor: string
  bookCover: string
  noteText: string
  userNote: string
  userName: string
  userAvatar: string
  sharedDate: string
  likes: number
  comments: number
  bookId: string
  page: number
  isLiked: boolean
}

// User Created Book interface
interface UserBook {
  id: string
  title: string
  author: string
  coverImage: string
  description: string
  genre: string
  year: number
  downloads: number
  rating: number
  reviewCount: number
  createdDate: string
  tags: string[]
}

// Mock shared notes data
const mockSharedNotes: SharedNote[] = [
  {
    id: "1",
    bookTitle: "The Midnight Library",
    bookAuthor: "Matt Haig",
    bookCover: "/api/placeholder/150/200",
    noteText: "Between life and death there is a library, and within that library, the shelves go on forever.",
    userNote: "This quote really resonated with me. It makes me think about all the different paths our lives could take and how every choice creates a new story.",
    userName: "Sarah Chen",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=SC",
    sharedDate: "2024-10-02",
    likes: 24,
    comments: 8,
    bookId: "1",
    page: 15,
    isLiked: false
  },
  {
    id: "2",
    bookTitle: "Atomic Habits",
    bookAuthor: "James Clear",
    bookCover: "/api/placeholder/150/200",
    noteText: "You do not rise to the level of your goals. You fall to the level of your systems.",
    userNote: "This completely changed how I think about goal setting. It's not about motivation, it's about building systems that work even when you don't feel motivated.",
    userName: "Alex Rivera",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=AR",
    sharedDate: "2024-10-01",
    likes: 42,
    comments: 15,
    bookId: "5",
    page: 23,
    isLiked: true
  },
  {
    id: "3",
    bookTitle: "Project Hail Mary",
    bookAuthor: "Andy Weir",
    bookCover: "/api/placeholder/150/200",
    noteText: "I'm pretty sure I'm screwed. That's my considered opinion. Screwed.",
    userNote: "Andy Weir's humor in the face of impossible odds is what makes this book so engaging. Even in the darkest moments, there's hope and humor.",
    userName: "Emily Watson",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=EW",
    sharedDate: "2024-09-30",
    likes: 18,
    comments: 6,
    bookId: "2",
    page: 1,
    isLiked: false
  }
]

// Mock user created books data
const mockUserBooks: UserBook[] = [
  {
    id: "13",
    title: "My Digital Adventure",
    author: "Tech User",
    coverImage: "/api/placeholder/300/400",
    description: "A user-created story about digital adventures and coding journeys in the modern world.",
    genre: "Tech Fiction",
    year: 2024,
    downloads: 125,
    rating: 4.0,
    reviewCount: 23,
    createdDate: "2024-09-25",
    tags: ["Technology", "Adventure", "Programming"]
  },
  {
    id: "14",
    title: "Cooking Adventures",
    author: "Home Chef",
    coverImage: "/api/placeholder/300/400",
    description: "A personal collection of cooking experiments and family recipes passed down through generations.",
    genre: "Culinary Memoir",
    year: 2024,
    downloads: 89,
    rating: 4.2,
    reviewCount: 18,
    createdDate: "2024-09-20",
    tags: ["Cooking", "Family", "Memoir"]
  },
  {
    id: "15",
    title: "Community Stories Collection",
    author: "Book Club Members",
    coverImage: "/api/placeholder/300/400",
    description: "A collaborative collection of short stories written by community members exploring various themes.",
    genre: "Member Create",
    year: 2024,
    downloads: 156,
    rating: 4.1,
    reviewCount: 31,
    createdDate: "2024-09-15",
    tags: ["Community", "Collaboration", "Short Stories"]
  },
  {
    id: "16",
    title: "Poetry from the Heart",
    author: "Local Poet",
    coverImage: "/api/placeholder/300/400",
    description: "An inspiring collection of poems about love, loss, hope, and the beauty of everyday moments.",
    genre: "Poetry",
    year: 2024,
    downloads: 67,
    rating: 4.4,
    reviewCount: 12,
    createdDate: "2024-09-10",
    tags: ["Poetry", "Emotions", "Life"]
  }
]

const filterOptions = ["All", "Most Liked", "Recent", "My Notes"]
const sortOptions = ["Latest", "Most Popular", "Highest Rated", "Most Downloaded"]

interface FilterState {
  noteFilter: string
  bookSort: string
  searchTerm: string
}

export default function NoteShare() {
  const [activeTab, setActiveTab] = useState('notes')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [filters, setFilters] = useState<FilterState>({
    noteFilter: "All",
    bookSort: "Latest",
    searchTerm: ""
  })

  // Filter and sort data
  const filteredNotes = useMemo(() => {
    let filtered = mockSharedNotes.filter(note => 
      note.bookTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      note.userName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      note.userNote.toLowerCase().includes(filters.searchTerm.toLowerCase())
    )

    if (filters.noteFilter === "Most Liked") {
      filtered = filtered.filter(note => note.likes >= 20)
    } else if (filters.noteFilter === "Recent") {
      filtered = filtered.filter(note => 
        new Date(note.sharedDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
    }

    return filtered.sort((a, b) => {
      if (filters.noteFilter === "Most Liked") {
        return b.likes - a.likes
      }
      return new Date(b.sharedDate).getTime() - new Date(a.sharedDate).getTime()
    })
  }, [filters])

  const filteredBooks = useMemo(() => {
    const filtered = mockUserBooks.filter(book => 
      book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => {
      switch (filters.bookSort) {
        case "Most Popular":
          return b.downloads - a.downloads
        case "Highest Rated":
          return b.rating - a.rating
        case "Most Downloaded":
          return b.downloads - a.downloads
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      }
    })
  }, [filters])

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const toggleLike = (noteId: string) => {
    // In a real app, this would update the database
    console.log(`Toggle like for note ${noteId}`)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-primary" />
            <h1 className="font-sans text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="text-foreground">Note</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Share</span>
            </h1>
            <div className="h-px w-16 bg-primary" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A community space for sharing book insights and discovering user-created content
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <StickyNote className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold text-foreground">
                {mockSharedNotes.length}
              </div>
              <div className="text-sm text-muted-foreground">Shared Notes</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Feather className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-foreground">
                {mockUserBooks.length}
              </div>
              <div className="text-sm text-muted-foreground">User Books</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-foreground">
                {new Set([...mockSharedNotes.map(n => n.userName), ...mockUserBooks.map(b => b.author)]).size}
              </div>
              <div className="text-sm text-muted-foreground">Contributors</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-foreground">
                {mockSharedNotes.reduce((sum, note) => sum + note.likes, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Likes</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes, books, or users..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <Quote className="h-4 w-4" />
                Shared Notes ({filteredNotes.length})
              </TabsTrigger>
              <TabsTrigger value="books" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                User Books ({filteredBooks.length})
              </TabsTrigger>
            </TabsList>

            {/* Shared Notes Tab */}
            <TabsContent value="notes">
              {/* Filter Controls */}
              <div className="mb-6 flex flex-wrap gap-4 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {filters.noteFilter}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter Notes</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {filterOptions.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleFilterChange('noteFilter', option)}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Badge variant="outline" className="text-sm">
                  {filteredNotes.length} notes
                </Badge>
              </div>

              {/* Notes List */}
              <div className="space-y-6">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          {/* Book Cover */}
                          <div className="flex-shrink-0">
                            <img
                              src={note.bookCover}
                              alt={note.bookTitle}
                              className="w-20 h-28 object-cover rounded-md"
                            />
                          </div>

                          {/* Note Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <Link 
                                  to={`/book/${note.bookId}/read`}
                                  className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                                >
                                  {note.bookTitle}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                  by {note.bookAuthor} • Page {note.page}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(note.sharedDate).toLocaleDateString()}
                              </div>
                            </div>

                            {/* Quoted Text */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 mb-4">
                              <p className="text-foreground italic">
                                "{note.noteText}"
                              </p>
                            </div>

                            {/* User Note */}
                            <p className="text-muted-foreground mb-4">
                              {note.userNote}
                            </p>

                            {/* User Info and Actions */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src={note.userAvatar}
                                  alt={note.userName}
                                  className="w-8 h-8 rounded-full"
                                />
                                <span className="text-sm font-medium text-foreground">
                                  {note.userName}
                                </span>
                              </div>

                              <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleLike(note.id)}
                                  className={note.isLiked ? "text-red-600" : ""}
                                >
                                  <ThumbsUp className={`h-4 w-4 mr-1 ${note.isLiked ? 'fill-current' : ''}`} />
                                  {note.likes}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  {note.comments}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* User Books Tab */}
            <TabsContent value="books">
              {/* Sort Controls */}
              <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Sort: {filters.bookSort}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Sort Books</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleFilterChange('bookSort', option)}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {filteredBooks.length} books
                  </Badge>
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
                </div>
              </div>

              {/* Books Display */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 group border-0 shadow-lg rounded-xl">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-emerald-600 text-white text-xs">
                              ✍️ User Created
                            </Badge>
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Button size="sm" asChild className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg">
                              <Link to={`/book/${book.id}/read`}>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Read Now
                              </Link>
                            </Button>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {book.author}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(book.rating)}
                            <span className="text-xs text-muted-foreground">({book.reviewCount})</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {book.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{book.downloads} downloads</span>
                            <span>{new Date(book.createdDate).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            <div className="flex-shrink-0 w-24 h-32">
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-semibold text-foreground">
                                    {book.title}
                                  </h3>
                                  <p className="text-muted-foreground">
                                    by {book.author}
                                  </p>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                  ✍️ User Created
                                </Badge>
                              </div>
                              
                              <p className="text-muted-foreground mb-3 line-clamp-2">
                                {book.description}
                              </p>
                              
                              <div className="flex items-center gap-4 mb-3">
                                {renderStars(book.rating)}
                                <span className="text-sm text-muted-foreground">
                                  {book.reviewCount} reviews
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {book.downloads} downloads
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {book.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <Button size="sm" asChild className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg">
                                  <Link to={`/book/${book.id}/read`}>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Read Now
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}