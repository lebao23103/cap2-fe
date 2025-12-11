
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Filter,
  Search,
  Grid3x3,
  List,
  StickyNote,
  ChevronDown,
  Users,
  Calendar,
  Feather,
  Quote,
  Copy,
  Check,
  Star,
  Eye
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
}

// User Created Book interface (Keeping as is, or can be fetched if API exists)
// We will adapt the backend 'Book' type to this or just use 'Book' type primarily if possible, 
// but for now let's map it to keep UI consistent.
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

const filterOptions = ["All", "Recent"]
const sortOptions = ["Latest", "Most Popular", "Highest Rated", "Most Downloaded"] // Keep for books

interface FilterState {
  noteFilter: string
  bookSort: string
  searchTerm: string
}

// Mock data removed. We will fetch real data.

export default function NoteShare() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('notes')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([])
  const [userBooks, setUserBooks] = useState<UserBook[]>([])
  const [loading, setLoading] = useState(true)
  const [booksLoading, setBooksLoading] = useState(false)

  const [copiedQuote, setCopiedQuote] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    noteFilter: "All",
    bookSort: "Latest",
    searchTerm: ""
  })
  const { toast } = useToast()

  const fetchNotes = async () => {
    try {
      setLoading(true)
      console.log("Fetching books...")
      // 1. Get all approved books
      const books = await booksService.getApprovedBooks()
      console.log("Books fetched:", books.length)

      // 2. For each book, fetch its public notes
      const allNotesProms = books.map(async (book) => {
        try {
          // Use notesService to fetch public notes
          const data = await notesService.getPublicNotes(book.id)

          if (!data || !Array.isArray(data.public_notes)) {
            console.warn(`Invalid notes format for book ${book.id}`, data)
            return []
          }

          // data.public_notes is the array
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
            color: n.color || '#FFEB3B'
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
    if (activeTab === 'notes') {
      fetchNotes()
    } else if (activeTab === 'books') {
      fetchUserBooks()
    }
  }, [activeTab])

  // Fetch approved user books
  const fetchUserBooks = async () => {
    try {
      setBooksLoading(true)
      const books = await booksService.getApprovedUserBooks()

      // Map backend Book to frontend UserBook interface
      const mappedBooks: UserBook[] = books.map(b => ({
        id: b.id.toString(),
        title: b.title,
        author: b.author,
        coverImage: b.cover_image
          ? (b.cover_image.startsWith('http') ? b.cover_image : `http://127.0.0.1:8000${b.cover_image}`)
          : "/placeholder.svg",
        description: b.description || "",
        genre: b.subject || "Fiction",
        year: b.created_at ? new Date(b.created_at).getFullYear() : new Date().getFullYear(),
        downloads: 0,
        rating: b.rating || 0,
        reviewCount: b.reviews_count || 0,
        createdDate: b.created_at || new Date().toISOString(),
        tags: []
      }))
      setUserBooks(mappedBooks)
    } catch (error) {
      console.error("Failed to fetch user books", error)
    } finally {
      setBooksLoading(false)
    }
  }


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
    }

    return filtered.sort((a, b) => {
      // Only date sort available now
      return new Date(b.sharedDate).getTime() - new Date(a.sharedDate).getTime()
    })
  }, [filters, sharedNotes])

  // Filter books
  const filteredBooks = useMemo(() => {
    let filtered = userBooks.filter(book =>
      book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    )

    // Sort
    if (filters.bookSort === "Latest") {
      filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    } else if (filters.bookSort === "Highest Rated") {
      filtered.sort((a, b) => b.rating - a.rating)
    }

    return filtered
  }, [filters, userBooks])

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
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

        {/* Community Stats */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-border shadow-neo bg-card rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="p-3 border-2 border-border bg-amber-400 w-fit mx-auto mb-2 shadow-neo-sm rounded-xl">
                  <StickyNote className="h-6 w-6 text-black" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white font-display">
                  {sharedNotes.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">Shared Notes</div>
              </CardContent>
            </Card>
          </motion.div>


          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-black dark:border-white shadow-neo bg-white dark:bg-zinc-800 rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="p-3 border-2 border-black dark:border-white bg-green-400 w-fit mx-auto mb-2 shadow-neo-sm rounded-xl">
                  <Feather className="h-6 w-6 text-black" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white font-display">
                  {userBooks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">User Books</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-2 border-black dark:border-white shadow-neo bg-white dark:bg-zinc-800 rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="p-3 border-2 border-black dark:border-white bg-blue-400 w-fit mx-auto mb-2 shadow-neo-sm rounded-xl">
                  <Users className="h-6 w-6 text-black" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white font-display">
                  {new Set([...sharedNotes.map(n => n.userName)]).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">Contributors</div>
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
              className="w-full pl-12 pr-4 py-3 text-base border-2 border-border rounded-lg bg-card shadow-neo focus:outline-none focus:shadow-neo-hover focus:translate-x-[-2px] focus:translate-y-[-2px] text-foreground placeholder:text-muted-foreground font-mono"
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
                className="border-2 border-border bg-card data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg shadow-neo transition-all font-bold uppercase h-full text-foreground"
              >
                <Quote className="h-4 w-4 mr-2" />
                Shared Notes ({filteredNotes.length})
              </TabsTrigger>
              <TabsTrigger
                value="books"
                className="border-2 border-border bg-card data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg shadow-neo transition-all font-bold uppercase h-full text-foreground"
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
                    <Button variant="outline" className="gap-2 bg-card border-2 border-border rounded-lg shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover transition-all font-bold uppercase text-foreground">
                      <Filter className="h-4 w-4" />
                      {filters.noteFilter}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 border-2 border-border bg-card rounded-xl shadow-neo">
                    <DropdownMenuLabel className="font-bold uppercase border-b-2 border-border">Filter Notes</DropdownMenuLabel>
                    {filterOptions.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleFilterChange('noteFilter', option)}
                        className="font-mono cursor-pointer hover:bg-primary hover:text-black focus:bg-primary focus:text-black rounded-md dark:text-white dark:focus:text-black"
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Badge variant="secondary" className="bg-primary text-black border-2 border-border rounded-md font-bold uppercase px-3 py-1.5 shadow-neo-sm">
                  {filteredNotes.length} notes found
                </Badge>
              </div>

              {loading || booksLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent"></div>
                </div>
              ) : (
                <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                  {filteredNotes.map((note) => (
                    <motion.div key={note.id} variants={fadeInUp}>
                      <Card className="border-2 border-border shadow-neo-lg bg-card rounded-xl hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-hover transition-all duration-300 group">
                        <CardContent className="p-6">
                          {/* Header: Book Info & Date */}
                          <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-border">
                            <div className="flex items-center gap-4">
                              <img
                                src={note.bookCover}
                                alt={note.bookTitle}
                                className="w-16 h-24 object-cover border-2 border-border shadow-neo rounded-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=Cover'
                                }}
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
                  ))}
                </motion.div>
              )}
            </TabsContent>

            {/* User Books Tab (Keeping mostly as placeholder for now with mock data) */}
            <TabsContent value="books">
              {/* Sort Controls */}
              <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 bg-card border-2 border-border rounded-lg shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover transition-all font-bold uppercase text-foreground">
                        <Filter className="h-4 w-4" />
                        Sort: {filters.bookSort}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 border-2 border-border bg-card rounded-xl shadow-neo">
                      <DropdownMenuLabel className="font-bold uppercase border-b-2 border-border">Sort Books</DropdownMenuLabel>
                      {sortOptions.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => handleFilterChange('bookSort', option)}
                          className="font-mono cursor-pointer hover:bg-primary hover:text-black focus:bg-primary focus:text-black rounded-md dark:text-white dark:focus:text-black"
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Badge variant="secondary" className="bg-primary text-black border-2 border-border rounded-md font-bold uppercase px-3 py-1.5 shadow-neo-sm">
                    {filteredBooks.length} books found
                  </Badge>
                </div>

                <div className="flex border-2 border-border shadow-neo bg-card rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-l-lg rounded-r-none px-3 h-9 ${viewMode === 'grid' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-white'}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <div className="w-0.5 bg-border"></div>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-r-lg rounded-l-none px-3 h-9 ${viewMode === 'list' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-white'}`}
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
                      <Card className="h-full border-2 border-border shadow-neo-lg bg-card rounded-xl hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-hover transition-all duration-300 group overflow-hidden">
                        <div className="relative aspect-[2/3] overflow-hidden border-b-2 border-border rounded-t-xl">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                          <Badge className="absolute top-2 right-2 bg-white text-black border-2 border-black rounded-md shadow-neo font-bold uppercase text-[10px]">

                            {book.genre}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-1 uppercase font-display text-black dark:text-white">{book.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-mono mb-3">{book.author}</p>
                          <div className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-1 text-black dark:text-white">
                              <Star className="w-3 h-3 fill-black text-black dark:fill-white dark:text-white" />
                              {book.rating.toFixed(1)}
                            </div>
                            <span className="text-gray-500 dark:text-gray-400">{book.downloads} DLs</span>
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
                      <Card className="border-2 border-border shadow-neo bg-card rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover transition-all duration-300">
                        <div className="flex p-4 gap-6">
                          <div className="w-24 shrink-0 border-2 border-border shadow-neo rounded-lg overflow-hidden">
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover aspect-[2/3]" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-bold text-xl uppercase font-display text-black dark:text-white">{book.title}</h3>
                                  <p className="text-muted-foreground font-mono">{book.author}</p>
                                </div>
                                <Badge className="bg-primary text-black hover:bg-primary border-2 border-border rounded-md font-bold uppercase">{book.genre}</Badge>
                              </div>
                              <p className="text-sm line-clamp-2 md:line-clamp-3 mb-4 font-mono text-gray-600 dark:text-gray-300">{book.description}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold border-t-2 border-border pt-3 text-foreground">
                              <span>{book.year}</span>
                              <div className="flex gap-4">
                                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-black text-black dark:fill-white dark:text-white" /> {book.rating}</span>
                                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {book.downloads}</span>
                              </div>
                            </div>
                          </div>
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
