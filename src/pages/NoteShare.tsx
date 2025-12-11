
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Filter,
  Search,
  StickyNote,
  ChevronDown,
  Users,
  Calendar,
  Copy,
  Check,
  Eye
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
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

const filterOptions = ["All", "Recent", "System Books", "User Books"]

interface FilterState {
  noteFilter: string
  searchTerm: string
}


export default function NoteShare() {
  const navigate = useNavigate()
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([])
  const [loading, setLoading] = useState(true)

  const [copiedQuote, setCopiedQuote] = useState(false)

  const [filters, setFilters] = useState({
    noteFilter: "All",
    searchTerm: ""
  })
  const { toast } = useToast()

  const fetchNotes = async () => {
    try {
      setLoading(true)
      console.log("Fetching books...")

      // 1. Fetch ALL books (contains both System and Approved User books)
      // and Fetch Approved User Book records (to identify which ones are user books)
      const [allBooks, userBookRecords] = await Promise.all([
        booksService.getApprovedBooks(),
        booksService.getApprovedUserBooks()
      ])

      // 2. Create a Set of titles from UserBook records for matching
      // Since BE doesn't link them by ID, we use Title matching as the heuristic
      const userBookTitles = new Set(userBookRecords.map(ub => ub.title))

      console.log("Total Books:", allBooks.length)
      console.log("User Book Records:", userBookRecords.length)

      // 3. Process all books, flagging them as User Books if their title exists in userBookRecords
      const allNotesProms = allBooks.map(async (book) => {
        try {
          const isUserBook = userBookTitles.has(book.title)

          // Fetch notes using the actual Book ID
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

      // Sort by date desc initially
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


  // Filter and sort data
  const filteredNotes = useMemo(() => {
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

    return filtered.sort((a, b) => {
      // Only date sort available now
      return new Date(b.sharedDate).getTime() - new Date(a.sharedDate).getTime()
    })
  }, [filters, sharedNotes])

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const handleBookClick = (bookTitle: string) => {
    setFilters(prev => ({ ...prev, searchTerm: bookTitle }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyQuoteToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedQuote(true)
      setTimeout(() => setCopiedQuote(false), 2000)
    })
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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono">
            A community space for sharing book insights and discovering user-created content
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-black dark:border-white shadow-neo bg-card rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="p-4 border-2 border-black dark:border-white bg-amber-400 w-fit mx-auto mb-4 shadow-neo-sm rounded-xl">
                  <StickyNote className="h-8 w-8 text-black" />
                </div>
                <div className="text-4xl font-bold text-black dark:text-white font-display mb-1">
                  {sharedNotes.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase tracking-widest">Shared Notes</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-black dark:border-white shadow-neo bg-white dark:bg-zinc-800 rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="p-4 border-2 border-black dark:border-white bg-blue-400 w-fit mx-auto mb-4 shadow-neo-sm rounded-xl">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <div className="text-4xl font-bold text-black dark:text-white font-display mb-1">
                  {new Set([...sharedNotes.map(n => n.userName)]).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase tracking-widest">Contributors</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto">
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
                    className="w-full pl-9 pr-4 py-2 text-sm border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono"
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
                            className="font-mono cursor-pointer text-xs hover:bg-black hover:text-white focus:bg-black focus:text-white dark:hover:bg-white dark:hover:text-black dark:focus:bg-white dark:focus:text-black rounded-md"
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

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent"></div>
              </div>
            ) : (
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <motion.div key={note.id} variants={fadeInUp}>
                      <Card className="border-2 border-border shadow-neo-lg bg-card rounded-xl hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-hover transition-all duration-300 group">
                        <CardContent className="p-6">
                          {/* Header: Book Info & Date */}
                          <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-border">
                            <div className="flex items-center gap-4 group/book">
                              <div
                                onClick={() => handleBookClick(note.bookTitle)}
                                className="relative cursor-pointer hover:scale-105 transition-transform"
                              >
                                <img
                                  src={note.bookCover}
                                  alt={note.bookTitle}
                                  className="w-16 h-24 object-cover border-2 border-border shadow-neo rounded-md"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=Cover'
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/book:bg-black/10 rounded-md transition-colors" />
                              </div>

                              <div>
                                <h3
                                  onClick={() => handleBookClick(note.bookTitle)}
                                  className="text-lg font-bold text-black dark:text-white mb-1 uppercase font-display cursor-pointer hover:text-primary transition-colors hover:underline decoration-2 underline-offset-2"
                                >
                                  {note.bookTitle}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                                  by {note.bookAuthor} • Page {note.page}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-black font-bold uppercase bg-gray-100 border-2 border-border px-2 py-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(note.sharedDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Quoted Text */}
                          <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-border p-4 mb-4">
                            <p className="text-base text-black dark:text-gray-100 italic leading-relaxed font-serif">
                              "{note.noteText}"
                            </p>
                          </div>

                          {/* User Note */}
                          <p className="text-base text-gray-800 dark:text-gray-200 mb-6 leading-relaxed font-mono">
                            {note.userNote}
                          </p>

                          {/* Footer: User Info and Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t-2 border-border">
                            <div className="flex items-center gap-3">
                              <img
                                src={note.userAvatar}
                                alt={note.userName}
                                className="w-8 h-8 rounded-lg border-2 border-border"
                              />
                              <span className="text-sm font-bold text-black dark:text-white uppercase">
                                {note.userName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/book/${note.bookId}/read`, {
                                  state: {
                                    page: note.page,
                                    previewMode: true,
                                    previewNote: note
                                  }
                                })}
                                className="h-9 px-3 text-xs border-2 border-border hover:bg-foreground hover:text-background rounded-lg transition-all hidden sm:flex"
                              >
                                <Eye className="h-3.5 w-3.5 mr-2" />
                                Preview
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyQuoteToClipboard(note.noteText)
                                }}
                                className="h-9 px-3 text-xs hover:bg-foreground hover:text-background rounded-lg border-2 border-transparent hover:border-border transition-all"
                              >
                                {copiedQuote ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1 text-green-600" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy Quote
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
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
