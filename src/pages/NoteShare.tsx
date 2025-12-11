
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  Search,
  StickyNote,
  ChevronDown,
  Users,
  Copy,
  Check,
  Eye
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
}

interface GroupedNotes {
  bookId: string
  bookTitle: string
  bookAuthor: string
  bookCover: string
  notes: SharedNote[]
  lastUpdate: string
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
              ? (book.cover_image.startsWith('http') ? book.cover_image : `http://127.0.0.1:8000${book.cover_image}`)
              : "/placeholder.svg",
            noteText: n.selected_text || "",
            userNote: n.note_content || "",
            userName: n.user_name || "Anonymous",
            userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.user_name || 'user'}`,
            sharedDate: n.created_at || new Date().toISOString(),
            bookId: book.id.toString(),
            page: n.page_number || 1,
            color: n.color || '#FFEB3B',
            isUserBook: isUserBook
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

  // Filter and Group Data
  const groupedData = useMemo(() => {
    // 1. First Filter the Flat Notes
    let filtered = sharedNotes.filter(note =>
      note.bookTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      note.userName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      note.userNote.toLowerCase().includes(filters.searchTerm.toLowerCase())
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

    // 2. Group by Book ID (or Title if ID missing)
    const groups: Record<string, GroupedNotes> = {}

    filtered.forEach(note => {
      const key = note.bookId
      if (!groups[key]) {
        groups[key] = {
          bookId: note.bookId,
          bookTitle: note.bookTitle,
          bookAuthor: note.bookAuthor,
          bookCover: note.bookCover,
          notes: [],
          lastUpdate: note.sharedDate
        }
      }
      groups[key].notes.push(note)
      // Update lastUpdate if this note is newer
      if (new Date(note.sharedDate) > new Date(groups[key].lastUpdate)) {
        groups[key].lastUpdate = note.sharedDate
      }
    })

    // 3. Return as Array, sorted by most recently updated book
    return Object.values(groups).sort((a, b) =>
      new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
    )

  }, [filters, sharedNotes])


  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  return (
    <div className="relative w-full min-h-screen bg-background overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

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
          <div className="max-w-5xl mx-auto">
            {/* Filter Controls & Search */}
            <div className="mb-8 bg-card p-4 rounded-xl border-2 border-black dark:border-white shadow-neo space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search notes, books, or users..."
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
                    {sharedNotes.filter(n => n.bookTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) || n.noteText.toLowerCase().includes(filters.searchTerm.toLowerCase())).length} Notes Found
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 gap-6"
              >
                {groupedData.length > 0 ? (
                  groupedData.map((group) => (
                    <BookGroupItem key={group.bookId} group={group} navigate={navigate} />
                  ))
                ) : (
                  <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
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

function BookGroupItem({ group, navigate }: { group: GroupedNotes, navigate: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null)

  const copyQuoteToClipboard = (text: string, noteId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedQuote(noteId)
      setTimeout(() => setCopiedQuote(null), 2000)
    })
  }

  return (
    <motion.div variants={fadeInUp}>
      <Card className={`border-2 border-border bg-card rounded-xl transition-all duration-300 overflow-hidden ${isOpen ? 'shadow-neo-lg' : 'shadow-neo hover:shadow-neo-hover'}`}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 flex flex-col sm:flex-row gap-6 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {/* Book Cover */}
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <img
              src={group.bookCover}
              alt={group.bookTitle}
              className="w-24 h-36 object-cover border-2 border-border shadow-neo-sm rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=Cover'
              }}
            />
            <div className="absolute -top-2 -right-2 bg-primary text-black border-2 border-black w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-sm z-10">
              {group.notes.length}
            </div>
          </div>

          {/* Book Info Header */}
          <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
            <h3 className="text-xl md:text-2xl font-bold font-display uppercase mb-2 line-clamp-2">
              {group.bookTitle}
            </h3>
            <p className="text-sm font-mono text-muted-foreground mb-4 uppercase">
              By {group.bookAuthor}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-4 mt-auto">
              <div className="flex -space-x-3">
                {group.notes.slice(0, 4).map((note, i) => (
                  <img
                    key={i}
                    src={note.userAvatar}
                    className="w-8 h-8 rounded-full border-2 border-background"
                    alt={note.userName}
                  />
                ))}
                {group.notes.length > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-gray-200 flex items-center justify-center text-xs font-bold">
                    +{group.notes.length - 4}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase">
                {new Set(group.notes.map(n => n.userName)).size} Contributors
              </span>
            </div>
          </div>

          {/* Expand Icon */}
          <div className="flex items-center justify-center sm:items-start shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full border-2 border-transparent hover:border-border transition-all ${isOpen ? 'bg-black text-white dark:bg-white dark:text-black rotate-180' : ''}`}
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="border-t-2 border-border bg-muted/30 p-4 sm:p-6 space-y-6">
                {group.notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card border-2 border-border rounded-xl p-5 shadow-neo-sm relative group hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <img src={note.userAvatar} className="w-10 h-10 rounded-xl border-2 border-border shadow-sm" alt={note.userName} />
                        <div>
                          <p className="text-sm font-black uppercase text-foreground">{note.userName}</p>
                          <p className="text-xs text-muted-foreground font-mono font-bold mt-0.5">{new Date(note.sharedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs font-black font-mono border-2 border-border bg-white dark:bg-zinc-800 text-black dark:text-white px-2.5 py-1 rounded-md shadow-sm">
                        PG. {note.page}
                      </Badge>
                    </div>

                    <div className="relative bg-amber-50 dark:bg-amber-900/20 border-l-[6px] border-primary pl-5 pr-4 py-4 mb-5 rounded-r-xl shadow-sm">
                      <p className="font-serif text-lg italic text-foreground/90 leading-relaxed">
                        "{note.noteText}"
                      </p>
                    </div>

                    <div className="mb-6 pl-1">
                      <p className="text-base font-bold text-foreground leading-relaxed">
                        {note.userNote}
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 text-xs font-bold border-2 border-transparent hover:border-border hover:bg-transparent rounded-lg"
                        onClick={() => copyQuoteToClipboard(note.noteText, note.id)}
                      >
                        {copiedQuote === note.id ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copiedQuote === note.id ? "COPIED" : "COPY QUOTE"}
                      </Button>
                      <Button
                        size="sm"
                        className="h-9 px-4 text-xs font-bold bg-primary text-black hover:bg-primary/80 border-2 border-black rounded-lg shadow-neo-sm hover:translate-y-[-2px] hover:shadow-neo transition-all"
                        onClick={() => navigate(`/book/${note.bookId}/read`, { state: { page: note.page, previewMode: true, previewNote: note } })}
                      >
                        <Eye className="h-4 w-4 mr-2" /> VIEW IN BOOK
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
