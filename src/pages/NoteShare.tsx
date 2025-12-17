import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Filter,
  Search,
  StickyNote,
  ChevronDown,
  Users,
  Eye,
  MessageSquare,
  Heart,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CommentInline } from '@/components/CommentInline'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { fadeInUp, stagger } from '@/lib/animations'
import booksService from '@/lib/api/books'
import notesService from '@/lib/api/notes'
import { useToast } from '@/components/ui/use-toast'

// Updated Shared Note interface based on actual BE data
interface SharedNote {
  id: string
  bookTitle: string
  bookAuthor: string
  bookCover: string
  noteText: string
  userNote: string
  userName: string
  userAvatar: string // Generated helper
  sharedDate: string
  bookId: string
  page: number
  color: string
  isUserBook: boolean
  helpful_count: number
  awful_count: number
  status: string
  user_vote?: 'helpful' | 'awful' | null
}

const filterOptions = ["All", "Recent", "System Books", "User Books"]

interface FilterState {
  noteFilter: string
  searchTerm: string
}

export default function NoteShare() {
  const navigate = useNavigate()
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    noteFilter: "All",
    searchTerm: ""
  })

  // Comment Sheet State
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null)

  const { toast } = useToast()

  const fetchNotes = async () => {
    try {
      setLoading(true)
      console.log("Fetching books...")

      const [allBooks, userBookRecords] = await Promise.all([
        booksService.getApprovedBooks(),
        booksService.getApprovedUserBooks()
      ])

      const userBookTitles = new Set(userBookRecords.map(ub => ub.title))

      console.log("Total Books:", allBooks.length)

      const allNotesProms = allBooks.map(async (book) => {
        try {
          const isUserBook = userBookTitles.has(book.title)
          const data = await notesService.getPublicNotes(book.id)
          if (!data || !Array.isArray(data.public_notes)) return []

          return data.public_notes.map((n) => ({
            id: n.id ? n.id.toString() : Math.random().toString(),
            bookTitle: book.title || "Unknown Book",
            bookAuthor: book.author || "Unknown Author",
            bookCover: book.cover_image
              ? (book.cover_image.startsWith('http') ? book.cover_image : book.cover_image)
              : "/placeholder.svg",
            noteText: n.selected_text || "",
            userNote: n.note_content || "",
            userName: n.user_name || "Anonymous",
            userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.user_name || 'user'}`,
            sharedDate: n.created_at || new Date().toISOString(),
            bookId: book.id.toString(),
            page: n.page_number || 1,
            color: n.color || '#FFEB3B',
            isUserBook: isUserBook,
            helpful_count: n.helpful_count || 0,
            awful_count: n.awful_count || 0,
            status: n.status || 'visible'
          }))
        } catch (e) {
          console.error(`Failed to fetch notes for book ${book.id}`, e)
          return []
        }
      })

      const results = await Promise.all(allNotesProms)
      const flatNotes = results.flat()
      console.log("Total shared notes fetched:", flatNotes.length)

      flatNotes.sort((a, b) => new Date(b.sharedDate).getTime() - new Date(a.sharedDate).getTime())

      setSharedNotes(flatNotes)
    } catch (error) {
      console.error("Error fetching shared notes:", error)
      toast({
        title: "Error",
        description: "Failed to load community notes. Please ensure you are logged in.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  // Filter Data
  const filteredNotes = useMemo(() => {
    let filtered = sharedNotes.filter(note =>
      note.bookTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      note.userName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      note.userNote.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      note.noteText.toLowerCase().includes(filters.searchTerm.toLowerCase())
    )

    if (filters.noteFilter === "Recent") {
      filtered = filtered.filter(note =>
        new Date(note.sharedDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
    } else if (filters.noteFilter === "System Books") {
      filtered = filtered.filter(note => !note.isUserBook)
    } else if (filters.noteFilter === "User Books") {
      filtered = filtered.filter(note => note.isUserBook)
    }

    return filtered
  }, [filters, sharedNotes])


  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const handleVote = async (noteId: string, type: 'helpful' | 'awful') => {
    // 1. Optimistic Update
    setSharedNotes(prev => prev.map(note => {
      if (note.id !== noteId) return note;
      return note; // Optimistic update logic if needed
    }));

    try {
      const result = await notesService.voteNote(Number(noteId), type);

      // 2. Update with actual server data
      setSharedNotes(prev => prev.map(note => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          helpful_count: result.helpful_count,
          awful_count: result.awful_count,
          status: result.status
        };
      }).filter(n => n.status === 'visible')); // Remove if status becomes hidden

      toast({ title: type === 'helpful' ? "Marked as Helpful!" : "Reported as Awful", description: type === 'helpful' ? "Thanks for your feedback!" : "Notes with high report count will be reviewed." });

    } catch (error) {
      console.error("Vote failed", error);
      toast({ title: "Action Failed", variant: "destructive" });
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-background overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Ambient Motion Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-32 h-32 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-full opacity-20"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-20 w-24 h-24 border-4 border-primary/20 bg-primary/5 rotate-45"
        />
        <motion.div
          animate={{
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/3 w-16 h-16 bg-blue-400/10 rounded-full blur-md"
        />
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 0.8, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-10 -right-10 w-96 h-96 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-full opacity-10"
        />
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
            <div className="h-1 w-16 bg-black dark:bg-white" />
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight uppercase text-foreground">
              <span className="bg-primary text-black px-2 border-2 border-border shadow-neo">NoteShare</span>
            </h1>
            <div className="h-1 w-16 bg-black dark:bg-white" />
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-1.5 border-2 border-border bg-amber-300 rounded-full shadow-neo-sm">
              <StickyNote className="h-4 w-4 text-black" />
              <span className="text-xs font-black uppercase text-black">{sharedNotes.length} Shared Notes</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 border-2 border-border bg-blue-300 rounded-full shadow-neo-sm">
              <Users className="h-4 w-4 text-black" />
              <span className="text-xs font-black uppercase text-black">{new Set([...sharedNotes.map(n => n.userName)]).size} Contributors</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Filter Controls & Search */}
            <div className="mb-8 bg-card p-4 rounded-xl border-2 border-black dark:border-white shadow-neo space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search ideas, books, or people..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors font-sans font-bold"
                  />
                  {filters.searchTerm && (
                    <button
                      onClick={() => handleFilterChange('searchTerm', '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black px-1 rounded transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-xs hidden sm:inline text-muted-foreground">Filter:</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9 gap-2 bg-background border-2 border-border rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all font-bold uppercase text-foreground text-xs">
                          <Filter className="h-3.5 w-3.5" />
                          {filters.noteFilter}
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 border-2 border-border bg-card rounded-xl shadow-neo">
                        <DropdownMenuLabel className="font-bold uppercase border-b-2 border-border text-xs">Filter Notes</DropdownMenuLabel>
                        {filterOptions.map((option) => (
                          <DropdownMenuItem
                            key={option}
                            onClick={() => handleFilterChange('noteFilter', option)}
                            className="font-bold cursor-pointer text-xs hover:bg-black hover:text-white focus:bg-black focus:text-white dark:hover:bg-white dark:hover:text-black dark:focus:bg-white dark:focus:text-black rounded-md"
                          >
                            {option}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Badge variant="secondary" className="bg-primary text-black border-2 border-border rounded-md font-bold uppercase px-2 py-1 shadow-sm text-xs whitespace-nowrap">
                    {filteredNotes.length} Found
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content Grid (Masonry) */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
              >
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      navigate={navigate}
                      onVote={handleVote}
                      isCommentsOpen={activeNoteId === Number(note.id)}
                      onToggleComments={() => {
                        if (activeNoteId === Number(note.id)) {
                          setActiveNoteId(null)
                        } else {
                          setActiveNoteId(Number(note.id))
                        }
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 border-2 border-dashed border-border rounded-xl col-span-full">
                    <p className="text-lg text-muted-foreground font-mono">No notes found matching your search.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  )
}

function NoteCard({
  note,
  navigate,
  onVote,
  isCommentsOpen,
  onToggleComments
}: {
  note: SharedNote,
  navigate: any,
  onVote: (id: string, type: 'helpful' | 'awful') => void,
  isCommentsOpen: boolean,
  onToggleComments: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false)

  // Spotlight State
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  // Tilt State
  const [rotation, setRotation] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    // Spotlight calculation
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setOpacity(1)

    // Tilt calculation (Max tilt 5 degrees)
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -5 // Invert Y
    const rotateY = ((x - centerX) / centerX) * 5

    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setOpacity(0)
    setRotation({ x: 0, y: 0 })
  }

  // Vibrant Neo-Brutalist Colors
  const glowColors = ['#CCFF00', '#00FFFF', '#FF00FF', '#FFDD00']
  // Deterministic color based on note ID to keep it consistent
  const glowColor = useMemo(() => {
    const total = note.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return glowColors[total % glowColors.length]
  }, [note.id])

  return (
    <motion.div
      variants={fadeInUp}
      className="break-inside-avoid perspective-1000" // perspective for 3D
      style={{ perspective: '1000px' }}
    >
      <motion.div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30, mass: 0.5 }}
        className="relative rounded-xl p-0 transition-shadow duration-300 h-full group transform-gpu"
        style={{
          '--spotlight-color': glowColor,
        } as React.CSSProperties}
      >
        {/* OUTER GLOW BACKLIGHT - The "Sáng quanh viền" effect */}
        <div
          className="absolute -inset-2 opacity-0 transition-opacity duration-300 rounded-xl z-0"
          style={{
            opacity,
            // A blurred, larger radial gradient that sits BEHIND the card
            background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, var(--spotlight-color), transparent 60%)`,
            // Blur it to make it look like light spilling out
            filter: 'blur(15px)',
          }}
        />

        {/* MAIN CARD CONTENT - Solid, sits on top */}
        <div className="relative z-10 bg-card border-2 border-black dark:border-white p-5 h-full flex flex-col justify-between shadow-neo hover:shadow-neo-lg transition-all rounded-xl overflow-hidden group">

          {/* Header: User Info */}
          <div className="p-4 border-b-2 border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <img src={note.userAvatar} className="w-8 h-8 rounded-lg border-2 border-white shadow-sm" alt={note.userName} />
              <div>
                <p className="text-xs font-black uppercase text-foreground truncate max-w-[120px]">{note.userName}</p>
                <p className="text-[10px] text-muted-foreground font-mono font-bold">{new Date(note.sharedDate).toLocaleDateString()}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] font-black font-mono border border-border bg-white dark:bg-zinc-900 text-black dark:text-white px-2 py-0.5 rounded shadow-sm">
              PG. {note.page}
            </Badge>
          </div>

          {/* Body: Note Content */}
          <div className="p-5 flex-1">
            {/* Quote Block */}
            <div className={`relative bg-amber-50 dark:bg-amber-900/20 border-l-4 border-primary pl-4 pr-3 py-3 mb-4 rounded-r-lg group-hover:border-black dark:group-hover:border-amber-400 transition-colors`}>
              <p className={`font-serif text-sm italic text-foreground/90 leading-relaxed ${!isQuoteExpanded ? 'line-clamp-4' : 'max-h-60 overflow-y-auto pr-1 custom-scrollbar'}`}>
                "{note.noteText}"
              </p>
              {note.noteText.length > 200 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsQuoteExpanded(!isQuoteExpanded)
                  }}
                  className="text-[10px] font-black uppercase mt-1 text-muted-foreground hover:text-foreground transition-colors opacity-70 hover:opacity-100"
                >
                  [{isQuoteExpanded ? 'Collapse' : 'Expand Context'}]
                </button>
              )}
            </div>

            {/* User Comment */}
            <div className="mb-4">
              <p className={`text-sm font-bold text-foreground leading-relaxed ${!isExpanded ? 'line-clamp-4' : 'max-h-60 overflow-y-auto pr-1 custom-scrollbar'}`}>
                {note.userNote}
              </p>
              {note.userNote.length > 150 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                  className="text-[10px] font-black uppercase mt-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>SHOW LESS <ChevronDown className="h-3 w-3 rotate-180" /></>
                  ) : (
                    <>READ MORE <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              )}
            </div>

            {/* Book Context (Mini) */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-zinc-700">
              <img
                src={note.bookCover}
                alt={note.bookTitle}
                className="w-10 h-14 object-cover border border-border rounded shadow-sm group-hover:scale-105 transition-transform"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=Cover' }}
              />
              <div className="flex-1 overflow-hidden">
                <h4 className="text-xs font-black uppercase truncate text-muted-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/book/${note.bookId}/read`)}>
                  {note.bookTitle}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate">by {note.bookAuthor}</p>
              </div>
            </div>
          </div>
          {/* Footer: User Actions usually found in community apps */}
          <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-200 dark:border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 min-w-[3rem] px-2 gap-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors ${note.user_vote === 'helpful' ? 'text-red-500 bg-red-50' : 'text-muted-foreground'}`}
                onClick={(e) => { e.stopPropagation(); onVote(note.id, 'helpful'); }}
              >
                <Heart className={`h-4 w-4 ${note.user_vote === 'helpful' ? 'fill-current' : ''}`} />
                <span className="font-bold font-mono text-xs">{note.helpful_count > 0 ? note.helpful_count : ''}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors ${isCommentsOpen ? 'bg-blue-50 text-blue-500' : 'text-muted-foreground'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComments();
                }}
                title="Discuss"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all rounded-full border border-transparent hover:border-black dark:hover:border-white"
                onClick={() => navigate(`/book/${note.bookId}/read`, { state: { page: note.page, previewMode: true, previewNote: note } })}
              >
                <Eye className="h-3 w-3 mr-1.5" />
                View Context
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 font-medium">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer gap-2"
                    onClick={(e) => { e.stopPropagation(); onVote(note.id, 'awful'); }}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Report Note</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Inline Comments */}
          <CommentInline noteId={Number(note.id)} isOpen={isCommentsOpen} />

        </div>
      </motion.div>
    </motion.div>
  )
}
