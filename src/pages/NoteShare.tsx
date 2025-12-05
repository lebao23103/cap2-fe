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
            <mark className="bg-amber-200/40 hover:bg-amber-300/50 px-1 py-0.5 rounded-none cursor-pointer transition-all duration-200">
              {note.noteText}
            </mark>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none" align="start">
            {/* Arrow pointing to highlight */}
            <div className="absolute -top-2 left-4 w-4 h-4 rotate-45 bg-white border-l-2 border-t-2 border-black" />

            <Card className="border-0 shadow-none bg-white rounded-none">
              <div className="border-l-4 border-l-black">
                <CardContent className="p-0">
                  {/* Header with color dot icon and close button */}
                  <div className="flex items-start justify-between p-4 pb-3 border-b-2 border-black">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Color indicator icon */}
                      <div className="p-1.5 border-2 border-black bg-amber-100">
                        <div className="w-2 h-2 bg-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-black uppercase">
                          Page {note.page}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 -mt-1 -mr-1 hover:bg-black hover:text-white transition-colors rounded-none"
                      onClick={() => setShowNotePopover(false)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Highlighted Text Section */}
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-xs font-bold text-black uppercase mb-1">Highlighted Text</p>
                    <p className="text-sm font-bold text-black leading-snug font-serif italic">
                      "{note.noteText}"
                    </p>
                  </div>

                  {/* Note Content Section */}
                  {note.userNote && (
                    <div className="px-4 pb-3">
                      <p className="text-xs font-bold text-black uppercase mb-1">Note</p>
                      <p className="text-sm text-black leading-relaxed font-mono">
                        {note.userNote}
                      </p>
                    </div>
                  )}

                  {/* Engagement Actions */}
                  <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-t-2 border-black">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(note.id)
                      }}
                      className={`h-7 text-xs transition-colors rounded-none border-2 border-transparent hover:border-black ${note.isLiked
                        ? 'text-black bg-red-100 border-black'
                        : 'text-gray-600 hover:bg-white'
                        }`}
                    >
                      <ThumbsUp className={`h-3 w-3 mr-1 ${note.isLiked ? 'fill-current' : ''}`} />
                      {note.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs hover:bg-white text-gray-600 hover:text-black transition-colors rounded-none border-2 border-transparent hover:border-black"
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
                      className="h-7 text-xs hover:bg-white hover:text-black rounded-none border-2 border-transparent hover:border-black transition-colors"
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
                  <div className="px-4 py-1.5 bg-gray-100 border-t-2 border-black">
                    <p className="text-[10px] text-gray-600 font-mono uppercase">
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
              ? 'fill-black text-black'
              : 'text-gray-300'
              }`}
          />
        ))}
        <span className="ml-1 text-xs text-black font-bold">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen bg-background overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="container mx-auto py-8 relative z-10 px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-1 w-16 bg-black dark:bg-white" />
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight uppercase text-foreground">
              <span className="bg-primary text-black px-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">NoteShare</span>
            </h1>
            <div className="h-1 w-16 bg-black dark:bg-white" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono">
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
            <Card className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="p-3 border-2 border-black dark:border-white bg-amber-400 w-fit mx-auto mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <StickyNote className="h-6 w-6 text-black" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white font-display">
                  {mockSharedNotes.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">Shared Notes</div>
              </CardContent>
            </Card>
          </motion.div>


          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="p-3 border-2 border-black dark:border-white bg-green-400 w-fit mx-auto mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <Feather className="h-6 w-6 text-black" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white font-display">
                  {mockUserBooks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">User Books</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="p-3 border-2 border-black dark:border-white bg-blue-400 w-fit mx-auto mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <Users className="h-6 w-6 text-black" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white font-display">
                  {new Set([...mockSharedNotes.map(n => n.userName), ...mockUserBooks.map(b => b.author)]).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">Contributors</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="p-3 border-2 border-black dark:border-white bg-red-400 w-fit mx-auto mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <ThumbsUp className="h-6 w-6 text-black" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white font-display">
                  {mockSharedNotes.reduce((sum, note) => sum + note.likes, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">Total Likes</div>
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search notes, books, or users..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base border-2 border-black dark:border-white rounded-none bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] text-black dark:text-white placeholder:text-gray-500 font-mono"
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
            <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-transparent gap-4 p-0">
              <TabsTrigger
                value="notes"
                className="border-2 border-black dark:border-white bg-white dark:bg-zinc-900 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase h-full text-black dark:text-gray-300"
              >
                <Quote className="h-4 w-4 mr-2" />
                Shared Notes ({filteredNotes.length})
              </TabsTrigger>
              <TabsTrigger
                value="books"
                className="border-2 border-black dark:border-white bg-white dark:bg-zinc-900 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase h-full text-black dark:text-gray-300"
              >
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
                    <Button variant="outline" className="gap-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase text-black dark:text-white">
                      <Filter className="h-4 w-4" />
                      {filters.noteFilter}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <DropdownMenuLabel className="font-bold uppercase border-b-2 border-black dark:border-white dark:text-white">Filter Notes</DropdownMenuLabel>
                    {filterOptions.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleFilterChange('noteFilter', option)}
                        className="font-mono cursor-pointer hover:bg-primary hover:text-black focus:bg-primary focus:text-black rounded-none dark:text-white dark:focus:text-black"
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Badge variant="secondary" className="bg-primary text-black border-2 border-black rounded-none font-bold uppercase px-3 py-1.5">
                  {filteredNotes.length} notes found
                </Badge>
              </div>

              {/* Notes List */}
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                {filteredNotes.map((note) => (
                  <motion.div key={note.id} variants={fadeInUp}>
                    <Card className="border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-none hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 group">
                      <CardContent className="p-6">
                        {/* Header: Book Info & Date */}
                        <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-black dark:border-white">
                          <div className="flex items-center gap-4">
                            <img
                              src={note.bookCover}
                              alt={note.bookTitle}
                              className="w-16 h-24 object-cover border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                            />
                            <div>
                              <h3 className="text-lg font-bold text-black dark:text-white mb-1 uppercase font-display">
                                {note.bookTitle}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                                by {note.bookAuthor} • Page {note.page}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-black font-bold uppercase bg-gray-100 border-2 border-black px-2 py-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(note.sharedDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Quoted Text */}
                        <div className="bg-amber-100 border-l-4 border-black p-4 mb-4">
                          <p className="text-base text-black italic leading-relaxed font-serif">
                            "{note.noteText}"
                          </p>
                        </div>

                        {/* User Note */}
                        <p className="text-base text-gray-800 dark:text-gray-200 mb-6 leading-relaxed font-mono">
                          {note.userNote}
                        </p>

                        {/* Footer: User Info and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t-2 border-black">
                          <div className="flex items-center gap-3">
                            <img
                              src={note.userAvatar}
                              alt={note.userName}
                              className="w-8 h-8 rounded-none border-2 border-black dark:border-white"
                            />
                            <span className="text-sm font-bold text-black dark:text-white uppercase">
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
                              className={`h-9 px-3 border-2 border-transparent hover:border-black rounded-none ${note.isLiked ? "text-red-500 bg-red-50 border-black" : "text-gray-600 hover:bg-white"}`}
                            >
                              <ThumbsUp className={`h-4 w-4 mr-1.5 ${note.isLiked ? 'fill-current' : ''}`} />
                              <span>{note.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 px-3 border-2 border-transparent hover:border-black rounded-none text-gray-600 hover:bg-white">
                              <MessageCircle className="h-4 w-4 mr-1.5" />
                              <span>{note.comments}</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleNoteClick(note)}
                              className="h-9 bg-black text-white hover:bg-primary hover:text-black border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase font-bold transition-all"
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
                      <Button variant="outline" className="gap-2 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase">
                        <Filter className="h-4 w-4" />
                        Sort: {filters.bookSort}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <DropdownMenuLabel className="font-bold uppercase border-b-2 border-black">Sort Books</DropdownMenuLabel>
                      {sortOptions.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => handleFilterChange('bookSort', option)}
                          className="font-mono cursor-pointer hover:bg-primary hover:text-black focus:bg-primary focus:text-black rounded-none"
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Badge variant="secondary" className="bg-primary text-black border-2 border-black rounded-none font-bold uppercase px-3 py-1.5">
                    {filteredBooks.length} books found
                  </Badge>
                </div>

                <div className="flex border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-none px-3 h-9 ${viewMode === 'grid' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <div className="w-0.5 bg-black"></div>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-none px-3 h-9 ${viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
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
                      <Card className="h-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-none hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group overflow-hidden">
                        <div className="relative aspect-[2/3] overflow-hidden border-b-2 border-black">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-black text-white border-2 border-white rounded-none font-bold uppercase text-xs shadow-md">
                              User Created
                            </Badge>
                          </div>
                          <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 border-2 border-black m-2">
                            <Button className="w-full bg-white text-black hover:bg-black hover:text-white font-bold border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
                              View Details
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg text-black line-clamp-1 mb-1 uppercase font-display">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 font-mono mb-2 uppercase">{book.author}</p>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-black">
                            {renderStars(book.rating)}
                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 border-2 border-black">
                              {book.downloads} DLs
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
                      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                        <div className="flex flex-col sm:flex-row">
                          <div className="w-full sm:w-32 h-48 sm:h-auto relative border-b-2 sm:border-b-0 sm:border-r-2 border-black">
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-xl font-bold text-black uppercase font-display">{book.title}</h3>
                                  <Badge className="bg-black text-white border-2 border-black rounded-none font-bold uppercase text-xs">
                                    {book.genre}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 font-mono mb-3 uppercase">by {book.author}</p>
                                <p className="text-gray-800 line-clamp-2 mb-4 font-mono">{book.description}</p>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-black">
                                <div className="flex items-center gap-4">
                                  {renderStars(book.rating)}
                                  <span className="text-sm font-bold text-gray-600">({book.reviewCount} reviews)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold bg-gray-100 px-2 py-1 border-2 border-black">
                                    {book.downloads} Downloads
                                  </span>
                                  <Button size="sm" className="bg-black text-white hover:bg-primary hover:text-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase font-bold">
                                    Details
                                  </Button>
                                </div>
                              </div>
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
      </div>
    </div>
  )
}
