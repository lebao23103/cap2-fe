import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BookOpen, 
  Star, 
  Filter, 
  Search, 
  Grid3x3, 
  List,
  StickyNote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  MessageCircle,
  ThumbsUp,
  // Share2,
  Calendar,
  Feather,
  Quote,
  Eye,
  X,
  Copy,
  Check
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModernButton } from '@/components/ui/modern'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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
  const [selectedNote, setSelectedNote] = useState<SharedNote | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewPage, setPreviewPage] = useState(1)
  const [copiedQuote, setCopiedQuote] = useState(false)
  const [showNotePopover, setShowNotePopover] = useState(false)
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

  const copyQuoteToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedQuote(true)
      setTimeout(() => setCopiedQuote(false), 2000)
    })
  }

  // Mock book content - In production, fetch from API
  const mockBookContent: { [key: string]: string[] } = {
    "1": [
      "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be different if you had made other choices. Would you have done anything different, if you had the chance to undo your regrets?",
      "Nora Seed finds herself faced with this decision. Faced with the possibility of changing her life for a new one, following a different career, undoing old breakups, realizing her dreams of becoming a glaciologist; she must search within herself as she travels through the Midnight Library to decide what is truly fulfilling in life, and what makes it worth living in the first place.",
      "The Midnight Library is a thought-provoking novel about all the choices that go into a life well lived, from the internationally bestselling author of Reasons to Stay Alive and How To Stop Time."
    ],
    "5": [
      "Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them.",
      "You do not rise to the level of your goals. You fall to the level of your systems. Your goal is your desired outcome. Your system is the collection of daily habits that will get you there.",
      "Every action you take is a vote for the type of person you wish to become. No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity."
    ],
    "2": [
      "I'm pretty sure I'm screwed. That's my considered opinion. Screwed. The scientific term for my situation is: completely and utterly screwed.",
      "My name is Ryland Grace. I'm a... teacher? No, wait. I'm something else now. An astronaut? Memory is a funny thing. It comes back in pieces, fragments, and sometimes not at all.",
      "So here I am, alone in space, with spotty memories and a problem to solve. The good news? I'm a scientist. The bad news? This problem might be unsolvable."
    ]
  }

  const handleNoteClick = (note: SharedNote) => {
    setSelectedNote(note)
    setPreviewPage(note.page)
    setIsPreviewOpen(true)
  }

  const handlePreviewPageChange = (direction: 'next' | 'prev') => {
    if (!selectedNote) return
    const bookContent = mockBookContent[selectedNote.bookId] || []
    const maxPage = Math.ceil(bookContent.length / 1) // Simplified: 1 page per content block
    
    if (direction === 'next' && previewPage < maxPage) {
      setPreviewPage(prev => prev + 1)
    } else if (direction === 'prev' && previewPage > 1) {
      setPreviewPage(prev => prev - 1)
    }
  }

  const renderHighlightedText = (text: string, note: SharedNote | null) => {
    if (!note) return <span>{text}</span>
    
    // Only highlight on the page where the note was created
    const pageIndex = previewPage - 1
    const notePageIndex = Math.ceil(note.page / 5) - 1 // Map actual page to content index
    
    if (pageIndex !== notePageIndex && pageIndex !== 0) {
      return <span>{text}</span>
    }

    const noteTextIndex = text.indexOf(note.noteText)
    if (noteTextIndex === -1) {
      return <span>{text}</span>
    }

    return (
      <>
        <span>{text.substring(0, noteTextIndex)}</span>
        <Popover open={showNotePopover} onOpenChange={setShowNotePopover}>
          <PopoverTrigger asChild>
            <mark className="bg-amber-200/40 dark:bg-amber-400/15 hover:bg-amber-300/50 dark:hover:bg-amber-400/25 px-1 py-0.5 rounded cursor-pointer transition-all duration-200">
              {note.noteText}
            </mark>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 border-0 shadow-2xl" align="start">
            <Card className="border-0 shadow-none bg-gradient-to-br from-amber-50/40 via-background to-background dark:from-amber-950/20 dark:via-background dark:to-background">
              <div className="border-l-4 border-l-amber-500 dark:border-l-amber-600">
                <CardContent className="p-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/30">
                    <img
                      src={note.userAvatar}
                      alt={note.userName}
                      className="w-8 h-8 rounded-full border-2 border-amber-500/30 shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{note.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.sharedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-background/50">
                      Page {note.page}
                    </Badge>
                  </div>

                  {/* Highlighted Quote */}
                  <div className="mb-3 relative group">
                    <div className="flex items-center gap-2 mb-2">
                      <Quote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                        Highlighted
                      </span>
                    </div>
                    <blockquote className="text-lg font-medium text-foreground/90 italic leading-relaxed pl-3 border-l-2 border-amber-400">
                      "{note.noteText}"
                    </blockquote>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyQuoteToClipboard(note.noteText)
                      }}
                      className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 rounded-lg"
                    >
                      {copiedQuote ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {/* Personal Note */}
                  {note.userNote && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <StickyNote className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Note
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed pl-3">
                        {note.userNote}
                      </p>
                    </div>
                  )}

                  {/* Engagement */}
                  <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(note.id)
                      }}
                      className={`h-7 gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 ${note.isLiked ? 'text-rose-600' : 'text-muted-foreground'}`}
                    >
                      <ThumbsUp className={`h-3 w-3 ${note.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs font-semibold">{note.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-muted-foreground"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span className="text-xs font-semibold">{note.comments}</span>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </PopoverContent>
        </Popover>
        <span>{text.substring(noteTextIndex + note.noteText.length)}</span>
      </>
    )
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

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="container mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-6">
            <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-primary" />
            <h1 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">NoteShare</span>
            </h1>
            <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            A community space for sharing book insights and discovering user-created content
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <Card className="border shadow-md bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 w-fit mx-auto mb-1.5 sm:mb-2">
                <StickyNote className="h-5 w-5 sm:h-7 sm:w-7 text-amber-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-foreground">
                {mockSharedNotes.length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Shared Notes</div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-md bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 w-fit mx-auto mb-1.5 sm:mb-2">
                <Feather className="h-5 w-5 sm:h-7 sm:w-7 text-green-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-foreground">
                {mockUserBooks.length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">User Books</div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-md bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 w-fit mx-auto mb-1.5 sm:mb-2">
                <Users className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-foreground">
                {new Set([...mockSharedNotes.map(n => n.userName), ...mockUserBooks.map(b => b.author)]).size}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Contributors</div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-md bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 w-fit mx-auto mb-1.5 sm:mb-2">
                <ThumbsUp className="h-5 w-5 sm:h-7 sm:w-7 text-rose-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-foreground">
                {mockSharedNotes.reduce((sum, note) => sum + note.likes, 0)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Likes</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes, books, or users..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200 shadow-sm"
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
            <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-11 sm:h-12 bg-muted/50 backdrop-blur-sm border shadow-sm rounded-lg sm:rounded-xl">
              <TabsTrigger value="notes" className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-md sm:rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs sm:text-sm">
                <Quote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Shared Notes ({filteredNotes.length})</span>
                <span className="sm:hidden">Notes ({filteredNotes.length})</span>
              </TabsTrigger>
              <TabsTrigger value="books" className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-md sm:rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs sm:text-sm">
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">User Books ({filteredBooks.length})</span>
                <span className="sm:hidden">Books ({filteredBooks.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Shared Notes Tab */}
            <TabsContent value="notes">
              {/* Filter Controls */}
              <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ModernButton variant="secondary" icon={Filter} className="gap-1.5 sm:gap-2 bg-card backdrop-blur-sm border h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
                      <span className="hidden sm:inline">{filters.noteFilter}</span>
                      <span className="sm:hidden">Filter</span>
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </ModernButton>
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

                <Badge className="bg-primary/10 text-primary border-0 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5">
                  {filteredNotes.length} notes
                </Badge>
              </div>

              {/* Notes List */}
              <div className="space-y-4 sm:space-y-5">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="hover:shadow-2xl transition-all duration-300 border shadow-lg bg-card backdrop-blur-sm rounded-xl hover:scale-[1.01] overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        {/* Header: Book Info & Date */}
                        <div className="flex items-start justify-between mb-4 pb-3 border-b">
                          <div className="flex items-center gap-3">
                            <img
                              src={note.bookCover}
                              alt={note.bookTitle}
                              className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded shadow-sm"
                            />
                            <div>
                              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                                {note.bookTitle}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                by {note.bookAuthor} • Page {note.page}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{new Date(note.sharedDate).toLocaleDateString()}</span>
                            <span className="sm:hidden">{new Date(note.sharedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Quoted Text */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-3 sm:p-4 mb-4 rounded-r">
                          <p className="text-sm sm:text-base text-foreground/90 italic leading-relaxed">
                            "{note.noteText}"
                          </p>
                        </div>

                        {/* User Note */}
                        <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                          {note.userNote}
                        </p>

                        {/* Footer: User Info and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <img
                              src={note.userAvatar}
                              alt={note.userName}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-primary/10"
                            />
                            <span className="text-xs sm:text-sm font-medium text-foreground">
                              {note.userName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLike(note.id)
                              }}
                              className={`h-8 px-2.5 sm:px-3 ${note.isLiked ? "text-rose-600" : ""}`}
                            >
                              <ThumbsUp className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 ${note.isLiked ? 'fill-current' : ''}`} />
                              <span className="text-xs sm:text-sm">{note.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2.5 sm:px-3">
                              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              <span className="text-xs sm:text-sm">{note.comments}</span>
                            </Button>
                            <ModernButton
                              variant="primary"
                              size="sm"
                              icon={Eye}
                              onClick={() => handleNoteClick(note)}
                              className="h-8 text-xs sm:text-sm"
                            >
                              <span className="hidden sm:inline">Preview</span>
                              <span className="sm:hidden">View</span>
                            </ModernButton>
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
              <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3 items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <ModernButton variant="secondary" icon={Filter} className="gap-1.5 sm:gap-2 bg-card backdrop-blur-sm border h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
                        <span className="hidden sm:inline">Sort: {filters.bookSort}</span>
                        <span className="sm:hidden">Sort</span>
                        <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </ModernButton>
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

                  <Badge className="bg-primary/10 text-primary border-0 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5">
                    {filteredBooks.length} books
                  </Badge>
                </div>

                <div className="flex rounded-lg border overflow-hidden shadow-sm bg-card">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none px-3 h-9"
                  >
                    <Grid3x3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none px-3 h-9"
                  >
                    <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              {/* Books Display */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {filteredBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 group border shadow-lg bg-card rounded-xl hover:scale-[1.02] overflow-hidden">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] sm:text-xs shadow-lg px-2 py-0.5">
                              ✍️ User Created
                            </Badge>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <Link to={`/book/${book.id}/read`}>
                              <ModernButton size="sm" icon={BookOpen} className="bg-white text-gray-900 hover:bg-white/90 shadow-2xl text-xs sm:text-sm">
                                Read Now
                              </ModernButton>
                            </Link>
                          </div>
                        </div>
                        
                        <CardContent className="p-2.5 sm:p-3">
                          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            by {book.author}
                          </p>
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                            {renderStars(book.rating)}
                            <span className="text-[10px] sm:text-xs text-muted-foreground">({book.reviewCount})</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                            {book.description}
                          </p>
                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                            <span>{book.downloads} downloads</span>
                            <span className="hidden sm:inline">{new Date(book.createdDate).toLocaleDateString()}</span>
                            <span className="sm:hidden">{new Date(book.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 border shadow-lg bg-card rounded-xl hover:scale-[1.01] overflow-hidden">
                        <CardContent className="p-3 sm:p-5">
                          {/* Mobile: Horizontal layout, Desktop: Side by side */}
                          <div className="flex gap-3 sm:gap-5">
                            {/* Book Cover */}
                            <div className="flex-shrink-0 w-16 h-24 sm:w-28 sm:h-36">
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover rounded shadow-sm"
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col">
                              {/* Header */}
                              <div className="mb-2">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className="text-sm sm:text-lg font-semibold text-foreground line-clamp-2">
                                    {book.title}
                                  </h3>
                                  <Badge className="flex-shrink-0 bg-emerald-600/90 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2">
                                    ✍️
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  by {book.author}
                                </p>
                              </div>

                              {/* Description - Hidden on mobile */}
                              <p className="hidden sm:block text-sm text-muted-foreground mb-3 line-clamp-2">
                                {book.description}
                              </p>

                              {/* Stats */}
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 text-xs sm:text-sm">
                                <div className="flex items-center gap-1">
                                  {renderStars(book.rating)}
                                  <span className="text-muted-foreground text-[10px] sm:text-xs">({book.reviewCount})</span>
                                </div>
                                <span className="text-muted-foreground">{book.downloads} downloads</span>
                              </div>

                              {/* Button */}
                              <div className="mt-auto">
                                <Link to={`/book/${book.id}/read`}>
                                  <ModernButton 
                                    size="sm" 
                                    icon={BookOpen} 
                                    className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                                  >
                                    Read Now
                                  </ModernButton>
                                </Link>
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

        {/* Book Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl h-[85vh] p-0 bg-gradient-to-br from-background via-background to-muted/20 border-0 shadow-2xl rounded-3xl overflow-hidden">
            {selectedNote && (
              <div className="flex flex-col h-full">
                {/* Compact Header */}
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-lg p-4">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent truncate mb-1">
                        {selectedNote.bookTitle}
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground truncate">
                        by {selectedNote.bookAuthor}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link to={`/book/${selectedNote.bookId}/read`}>
                        <ModernButton 
                          size="sm" 
                          icon={BookOpen}
                          className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-xl whitespace-nowrap"
                        >
                          Open Reader
                        </ModernButton>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsPreviewOpen(false)}
                        className="rounded-full h-8 w-8 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* User Info - Compact Single Line */}
                  <div className="flex items-center gap-2 text-xs">
                    <img
                      src={selectedNote.userAvatar}
                      alt={selectedNote.userName}
                      className="w-6 h-6 rounded-full border-2 border-primary/20"
                    />
                    <span className="font-semibold text-foreground">{selectedNote.userName}'s note</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {new Date(selectedNote.sharedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Book Content - Scrollable Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-4 pb-8">
                    <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
                      <CardContent className="p-0">
                        {/* Reading Container */}
                        <div className="flex flex-col">
                          {/* Text Content */}
                          <div 
                            className="flex-1 p-6 md:p-8"
                            style={{ 
                              maxWidth: '65ch', 
                              marginLeft: 'auto', 
                              marginRight: 'auto',
                              width: '100%'
                            }}
                          >
                            <div 
                              className="prose prose-lg dark:prose-invert max-w-none leading-relaxed selection:bg-amber-300 selection:text-amber-950 dark:selection:bg-amber-500 dark:selection:text-white transition-all duration-300"
                              style={{ 
                                fontSize: '16px', 
                                lineHeight: '1.85',
                                letterSpacing: '0.015em',
                                textAlign: 'justify',
                                hyphens: 'auto',
                                textRendering: 'optimizeLegibility',
                                WebkitFontSmoothing: 'antialiased',
                                MozOsxFontSmoothing: 'grayscale'
                              } as React.CSSProperties}
                            >
                              {renderHighlightedText(
                                mockBookContent[selectedNote.bookId]?.[previewPage - 1] || 'Content not available',
                                selectedNote
                              )}
                            </div>
                          </div>
                        
                          {/* Navigation Footer */}
                          <div className="px-6 md:px-8 pb-6 pt-4 border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20">
                            <div className="flex items-center justify-between gap-4" style={{ maxWidth: '65ch', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                              <Button 
                                variant="ghost"
                                size="lg"
                                onClick={() => handlePreviewPageChange('prev')}
                                disabled={previewPage === 1}
                                className="group relative overflow-hidden px-5 py-2.5 rounded-xl border border-border/50 hover:border-primary/30 bg-gradient-to-r from-background via-background to-background/95 hover:from-primary/5 hover:via-primary/3 hover:to-transparent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/50 transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <div className="flex items-center gap-2">
                                  <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                                  <span className="hidden sm:inline font-semibold">Previous</span>
                                </div>
                              </Button>
                              
                              <div className="flex items-center gap-2">
                                <div className="relative overflow-hidden px-6 py-3 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl border border-primary/30 shadow-md">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-base font-bold text-primary">
                                      {previewPage}
                                    </span>
                                    <div className="h-4 w-px bg-border/50"></div>
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {mockBookContent[selectedNote.bookId]?.length || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button 
                                variant="ghost"
                                size="lg"
                                onClick={() => handlePreviewPageChange('next')}
                                disabled={previewPage === (mockBookContent[selectedNote.bookId]?.length || 0)}
                                className="group relative overflow-hidden px-5 py-2.5 rounded-xl border border-border/50 hover:border-primary/30 bg-gradient-to-r from-background via-background to-background/95 hover:from-primary/5 hover:via-primary/3 hover:to-transparent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/50 transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="hidden sm:inline font-semibold">Next</span>
                                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}



