import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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
import { fadeInUp, stagger } from '@/lib/animations'

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
    bookCover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    noteText: "Between life and death there is a library, and within that library, the shelves go on forever.",
    userNote: "This quote really resonated with me. It makes me think about all the different paths our lives could take and how every choice creates a new story.",
    userName: "Sarah Chen",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
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
    bookCover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
    noteText: "You do not rise to the level of your goals. You fall to the level of your systems.",
    userNote: "This completely changed how I think about goal setting. It's not about motivation, it's about building systems that work even when you don't feel motivated.",
    userName: "Alex Rivera",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
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
    bookCover: "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=800",
    noteText: "I'm pretty sure I'm screwed. That's my considered opinion. Screwed.",
    userNote: "Andy Weir's humor in the face of impossible odds is what makes this book so engaging. Even in the darkest moments, there's hope and humor.",
    userName: "Emily Watson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
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
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
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
    coverImage: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800",
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
    coverImage: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&q=80&w=800",
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
    coverImage: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=800",
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
            {/* Arrow pointing to highlight */}
            <div className="absolute -top-2 left-4 w-4 h-4 rotate-45 bg-gradient-to-br from-background to-background border-l border-t border-border/50" />

            <Card className="border-0 shadow-none bg-gradient-to-br from-amber-50/40 via-background to-background dark:from-amber-950/20 dark:via-background dark:to-background">
              <div className="border-l-4 border-l-amber-500 dark:border-l-amber-600">
                <CardContent className="p-0">
                  {/* Header with color dot icon and close button */}
                  <div className="flex items-start justify-between p-4 pb-3 border-b border-border/30">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Color indicator icon */}
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                        <div className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Page {note.page}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 -mt-1 -mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setShowNotePopover(false)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Highlighted Text Section */}
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Highlighted Text</p>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      "{note.noteText}"
                    </p>
                  </div>

                  {/* Note Content Section */}
                  {note.userNote && (
                    <div className="px-4 pb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Note</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {note.userNote}
                      </p>
                    </div>
                  )}

                  {/* Engagement Actions */}
                  <div className="flex items-center gap-1 px-3 py-2 bg-background/30 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(note.id)
                      }}
                      className={`h-7 text-xs transition-colors ${note.isLiked
                        ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                        : 'text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400'
                        }`}
                    >
                      <ThumbsUp className={`h-3 w-3 mr-1 ${note.isLiked ? 'fill-current' : ''}`} />
                      {note.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs hover:bg-blue-50 dark:hover:bg-blue-950/30 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {note.comments}
                    </Button>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyQuoteToClipboard(note.noteText)
                      }}
                      className="h-7 text-xs hover:bg-background/80 transition-colors"
                    >
                      {copiedQuote ? (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Timestamp footer */}
                  <div className="px-4 py-1.5 bg-background/20 border-t border-border/20">
                    <p className="text-[10px] text-muted-foreground/70">
                      {new Date(note.sharedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
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
            className={`h-3 w-3 ${star <= rating
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
    <div className="relative w-full min-h-screen bg-background overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      <div className="container mx-auto py-8 relative z-10 px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
            <h1 className="font-sans text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent animate-gradient-x">NoteShare</span>
            </h1>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A community space for sharing book insights and discovering user-created content
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="p-3 rounded-xl bg-amber-500/10 w-fit mx-auto mb-2">
                  <StickyNote className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {mockSharedNotes.length}
                </div>
                <div className="text-sm text-muted-foreground">Shared Notes</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="p-3 rounded-xl bg-green-500/10 w-fit mx-auto mb-2">
                  <Feather className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {mockUserBooks.length}
                </div>
                <div className="text-sm text-muted-foreground">User Books</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="p-3 rounded-xl bg-blue-500/10 w-fit mx-auto mb-2">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {new Set([...mockSharedNotes.map(n => n.userName), ...mockUserBooks.map(b => b.author)]).size}
                </div>
                <div className="text-sm text-muted-foreground">Contributors</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="p-3 rounded-xl bg-rose-500/10 w-fit mx-auto mb-2">
                  <ThumbsUp className="h-6 w-6 text-rose-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {mockSharedNotes.reduce((sum, note) => sum + note.likes, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes, books, or users..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base border-0 rounded-full bg-card/50 backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all duration-200"
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
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-muted/30 backdrop-blur-sm p-1 rounded-xl">
              <TabsTrigger value="notes" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
                <Quote className="h-4 w-4 mr-2" />
                Shared Notes ({filteredNotes.length})
              </TabsTrigger>
              <TabsTrigger value="books" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
                <BookOpen className="h-4 w-4 mr-2" />
                User Books ({filteredBooks.length})
              </TabsTrigger>
            </TabsList>

            {/* Shared Notes Tab */}
            <TabsContent value="notes">
              {/* Filter Controls */}
              <div className="mb-6 flex flex-wrap gap-3 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-card/50 backdrop-blur-sm border-border/50">
                      <Filter className="h-4 w-4" />
                      {filters.noteFilter}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
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

                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {filteredNotes.length} notes found
                </Badge>
              </div>

              {/* Notes List */}
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                {filteredNotes.map((note) => (
                  <motion.div key={note.id} variants={fadeInUp}>
                    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden group">
                      <CardContent className="p-6">
                        {/* Header: Book Info & Date */}
                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/50">
                          <div className="flex items-center gap-4">
                            <img
                              src={note.bookCover}
                              alt={note.bookTitle}
                              className="w-16 h-24 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                            />
                            <div>
                              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {note.bookTitle}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                by {note.bookAuthor} • Page {note.page}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(note.sharedDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Quoted Text */}
                        <div className="bg-amber-50/50 dark:bg-amber-950/30 border-l-4 border-amber-400 p-4 mb-4 rounded-r-lg">
                          <p className="text-base text-foreground/90 italic leading-relaxed font-serif">
                            "{note.noteText}"
                          </p>
                        </div>

                        {/* User Note */}
                        <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                          {note.userNote}
                        </p>

                        {/* Footer: User Info and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <img
                              src={note.userAvatar}
                              alt={note.userName}
                              className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                            />
                            <span className="text-sm font-semibold text-foreground">
                              {note.userName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLike(note.id)
                              }}
                              className={`h-9 px-3 hover:bg-rose-500/10 ${note.isLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}
                            >
                              <ThumbsUp className={`h-4 w-4 mr-1.5 ${note.isLiked ? 'fill-current' : ''}`} />
                              <span>{note.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500">
                              <MessageCircle className="h-4 w-4 mr-1.5" />
                              <span>{note.comments}</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleNoteClick(note)}
                              className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* User Books Tab */}
            <TabsContent value="books">
              {/* Sort Controls */}
              <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 bg-card/50 backdrop-blur-sm border-border/50">
                        <Filter className="h-4 w-4" />
                        Sort: {filters.bookSort}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
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

                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {filteredBooks.length} books found
                  </Badge>
                </div>

                <div className="flex rounded-lg border border-border/50 overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none px-3 h-9"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none px-3 h-9"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Books Display */}
              {viewMode === 'grid' ? (
                <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => (
                    <motion.div key={book.id} variants={fadeInUp}>
                      <Card className="h-full border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group rounded-xl hover:-translate-y-1 overflow-hidden">
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-black/60 backdrop-blur-md text-white border-0">
                              User Created
                            </Badge>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <Button className="w-full bg-white text-black hover:bg-white/90 font-semibold">
                              View Details
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium mb-3">by {book.author}</p>

                          <div className="flex items-center gap-2 mb-3">
                            {renderStars(book.rating)}
                            <span className="text-xs text-muted-foreground">({book.reviewCount})</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {book.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                            <span>{new Date(book.createdDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {book.downloads}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
                  {filteredBooks.map((book) => (
                    <motion.div key={book.id} variants={fadeInUp}>
                      <Card className="border-0 shadow-md bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-32 md:w-40 aspect-[2/3] sm:aspect-auto relative overflow-hidden">
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <CardContent className="flex-1 p-5">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
                                  {book.title}
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium">by {book.author}</p>
                              </div>
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                {book.genre}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {book.description}
                            </p>

                            <div className="flex items-center gap-4 mb-4">
                              {renderStars(book.rating)}
                              <div className="h-4 w-px bg-border" />
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="h-4 w-4" /> {book.downloads} downloads
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                              <div className="flex gap-2">
                                {book.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Note Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">
            {selectedNote && (
              <>
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {selectedNote.bookTitle}
                    </DialogTitle>
                    <DialogDescription>
                      by {selectedNote.bookAuthor}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-7">
                      Page {previewPage}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-muted/10">
                  <div className="max-w-2xl mx-auto bg-card shadow-sm border border-border/50 p-8 md:p-12 rounded-xl min-h-full">
                    {mockBookContent[selectedNote.bookId]?.map((paragraph, index) => (
                      <p key={index} className="mb-6 text-lg leading-relaxed text-foreground/90 font-serif">
                        {renderHighlightedText(paragraph, selectedNote)}
                      </p>
                    )) || (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                          <p>Book content preview not available</p>
                        </div>
                      )}
                  </div>
                </div>

                <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => handlePreviewPageChange('prev')}
                    disabled={previewPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous Page
                  </Button>
                  <span className="text-sm text-muted-foreground font-medium">
                    Reading Mode
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePreviewPageChange('next')}
                    disabled={!mockBookContent[selectedNote.bookId] || previewPage >= Math.ceil(mockBookContent[selectedNote.bookId].length / 1)}
                  >
                    Next Page <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
