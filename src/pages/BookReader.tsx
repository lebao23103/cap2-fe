import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Document, Page, pdfjs } from 'react-pdf'
import '@/styles/pdf-viewer.css'
import '@/styles/pdf-layers.css'
import booksService from '@/lib/api/books'
import userService from '@/lib/api/user'
import { useToast } from '@/components/ui/use-toast'
import NoteHighlightOverlay from '@/components/reader/NoteHighlightOverlay'
import NotePopover from '@/components/reader/NotePopover'
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Bookmark,
  Share2,
  Sun,
  Moon,
  Clock,
  StickyNote,
  Edit,
  Trash2,
  Star,
  Target,
  ArrowLeft,
  Palette,
  Heart,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Configure PDF.js worker - Use local worker from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

// Suppress PDF.js warnings about missing stylesheets and layers
if (typeof console !== 'undefined') {
  const originalWarn = console.warn
  console.warn = function (...args) {
    const message = args[0]?.toString?.() || ''
    // Suppress TextLayer, AnnotationLayer, and style warnings
    if (
      message.includes('TextLayer') ||
      message.includes('AnnotationLayer') ||
      message.includes('styles not found')
    ) {
      return // Suppress these warnings
    }
    originalWarn.apply(console, args)
  }
}

interface BookNote {
  id: string
  text: string
  note: string
  page: number
  timestamp: string
  color?: 'yellow' | 'blue' | 'green' | 'pink'
  isPublic?: boolean
}

interface BookData {
  id: string
  title: string
  author: string
  content: string[]
  totalPages: number
  currentPage: number
  readingProgress: number
  notes: BookNote[]
  bookmarks: number[]
  isFavorite: boolean
  hasQuiz: boolean
  readingTime: string
  rating: number
}

export default function BookReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const pageContainerRef = useRef<HTMLDivElement>(null)

  // Real data from API
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [notes, setNotes] = useState<BookNote[]>([])
  const [numPages, setNumPages] = useState<number | null>(null)

  // UI state
  const [currentPage, setCurrentPage] = useState(1)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [newNote, setNewNote] = useState("")
  const [fontSize, setFontSize] = useState(16)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'blue' | 'green' | 'pink'>('yellow')
  const [editingNote, setEditingNote] = useState<BookNote | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light')
  const [pageDirection, setPageDirection] = useState<'forward' | 'backward'>('forward')
  const [isFavorite, setIsFavorite] = useState(false)

  // New state for highlight overlay and popover
  const [selectedNote, setSelectedNote] = useState<BookNote | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)


  // Memoize options to prevent re-renders
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), [])

  // Load book data from API
  useEffect(() => {
    if (id) {
      loadBookData()
    }
  }, [id])

  const loadBookData = async () => {
    try {
      setLoading(true)

      // Fetch book details, PDF URL, notes, and favorite status
      const [bookDetails, pdfContent, bookNotes, favorites] = await Promise.all([
        booksService.getBookById(Number(id)),
        booksService.getBookContent(Number(id)),
        fetch(`http://127.0.0.1:8000/api/books/${id}/notes/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }).then(res => res.json()).catch(() => []),
        userService.getFavorites().catch(() => [])
      ])

      // Transform to BookData format
      const transformedBook: BookData = {
        id: bookDetails.id.toString(),
        title: bookDetails.title,
        author: bookDetails.author,
        content: [], // Will use PDF instead
        totalPages: numPages || 10, // Will be updated when PDF loads
        currentPage: 1,
        readingProgress: 0,
        notes: [],
        bookmarks: [],
        isFavorite: favorites.some((fav: any) => fav.book.id === Number(id)),
        hasQuiz: true,
        readingTime: '4h 30m',
        rating: bookDetails.rating || 0
      }

      setBookData(transformedBook)
      console.log('PDF Content Response:', pdfContent)

      // Set PDF URL if available
      if (pdfContent && pdfContent.pdf_url) {
        console.log('PDF URL:', pdfContent.pdf_url)
        setPdfUrl(pdfContent.pdf_url)
      } else {
        console.warn('No PDF URL found in response:', pdfContent)
        toast({
          title: 'PDF Not Available',
          description: 'This book does not have a PDF file yet.',
          variant: 'default'
        })
      }

      setNotes(bookNotes.map((note: any) => ({
        id: note.id.toString(),
        text: note.selected_text,
        note: note.note_content,
        page: note.page_number || 1,
        timestamp: note.created_at,
        color: note.color === '#FFEB3B' ? 'yellow' : note.color === '#2196F3' ? 'blue' : note.color === '#4CAF50' ? 'green' : 'pink',
        isPublic: note.is_public
      })))
      setIsFavorite(favorites.some((fav: any) => fav.book.id === Number(id)))

      // Track reading history
      await fetch(`http://127.0.0.1:8000/api/reading-history/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ book_id: Number(id) })
      }).catch(() => { })

    } catch (error) {
      console.error('Error loading book:', error)
      toast({
        title: 'Error',
        description: 'Failed to load book',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bookData) {
      setIsBookmarked(bookData.bookmarks?.includes(currentPage) || false)
    }
  }, [currentPage, bookData])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (!bookData) return // Guard clause

      switch (e.key) {
        case 'ArrowLeft':
          if (currentPage > 1) {
            setPageDirection('backward')
            handlePageChange('prev')
          }
          break
        case 'ArrowRight':
          if (currentPage < bookData.totalPages) {
            setPageDirection('forward')
            handlePageChange('next')
          }
          break
        case 'b':
        case 'B':
          toggleBookmark()
          break
        case '+':
        case '=':
          setFontSize(prev => Math.min(prev + 2, 24))
          break
        case '-':
        case '_':
          setFontSize(prev => Math.max(prev - 2, 12))
          break
        case 'Escape':
          if (showNoteDialog) setShowNoteDialog(false)
          if (showReviewDialog) setShowReviewDialog(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, bookData, showNoteDialog, showReviewDialog])

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (!bookData) return // Guard clause

    // Clear any text selection when changing pages
    window.getSelection()?.removeAllRanges()

    if (direction === 'next' && currentPage < bookData.totalPages) {
      setPageDirection('forward')
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      updateReadingProgress(nextPage)

      // Show review dialog when reaching the last page for the first time
      if (nextPage === bookData.totalPages && !hasSubmittedReview) {
        setTimeout(() => setShowReviewDialog(true), 500)
      }
    } else if (direction === 'prev' && currentPage > 1) {
      setPageDirection('backward')
      setCurrentPage(prev => prev - 1)
    }
  }

  const updateReadingProgress = (page: number) => {
    if (!bookData) return // Guard clause

    const progress = Math.round((page / bookData.totalPages) * 100)
    setBookData(prev => prev ? {
      ...prev,
      currentPage: page,
      readingProgress: progress
    } : null)
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || !selection.toString().trim()) return

    const selectedText = selection.toString().trim()
    if (selectedText.length === 0) return

    // Check if selection is within PDF content area
    const anchorNode = selection.anchorNode
    if (!anchorNode) return

    // Check if the selection is inside .pdf-page-content or .textLayer
    const pdfContainer = (anchorNode.nodeType === Node.TEXT_NODE
      ? anchorNode.parentElement
      : anchorNode as Element
    )?.closest('.pdf-page-content, .textLayer, .react-pdf__Page')

    // Only trigger note dialog if selection is within PDF
    if (pdfContainer) {
      setSelectedText(selectedText)
      setShowNoteDialog(true)
    }
  }

  // Add mouseup listener scoped to document for PDF text selection
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Ignore clicks inside the dialog or popover to prevent re-triggering selection
      if (
        (e.target as Element).closest('[role="dialog"]') ||
        (e.target as Element).closest('.popover-content')
      ) {
        return
      }

      // Small delay to ensure selection is complete
      setTimeout(() => {
        handleTextSelection()
      }, 100)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  const saveNote = async () => {
    if (selectedText && newNote) {
      try {
        const colorHex = highlightColor === 'yellow' ? '#FFEB3B' :
          highlightColor === 'blue' ? '#2196F3' :
            highlightColor === 'green' ? '#4CAF50' : '#E91E63'

        if (editingNote) {
          // Update existing note
          const response = await fetch(`http://127.0.0.1:8000/api/books/${id}/notes/${editingNote.id}/update/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
              note_content: newNote,
              color: colorHex
            })
          })

          if (response.ok) {
            await loadBookData()
            toast({ title: 'Note updated!', description: 'Your note has been updated' })
          }
          setEditingNote(null)
        } else {
          // Create new note
          const response = await fetch(`http://127.0.0.1:8000/api/books/${id}/notes/create/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
              selected_text: selectedText,
              note_content: newNote,
              page_number: currentPage,
              color: colorHex,
              is_public: false,
              position_start: 0,
              position_end: selectedText.length
            })
          })

          if (response.ok) {
            await loadBookData()
            toast({ title: 'Note saved!', description: 'Your note has been saved' })
          }
        }

        setShowNoteDialog(false)
        setSelectedText("")
        setNewNote("")
        setHighlightColor('yellow')
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to save note', variant: 'destructive' })
      }
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/books/${id}/notes/${noteId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId))
        toast({ title: 'Note deleted', description: 'Your note has been removed' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete note', variant: 'destructive' })
    }
  }

  const editNote = (note: BookNote) => {
    setEditingNote(note)
    setSelectedText(note.text)
    setNewNote(note.note)
    setHighlightColor(note.color || 'yellow')
    setShowNoteDialog(true)
  }

  const shareNote = async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId)
      if (!note) return

      const response = await fetch(`http://127.0.0.1:8000/api/books/${id}/notes/${noteId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          is_public: !note.isPublic
        })
      })

      if (response.ok) {
        setNotes(prev => prev.map(n =>
          n.id === noteId ? { ...n, isPublic: !n.isPublic } : n
        ))
        toast({ title: note.isPublic ? 'Note made private' : 'Note shared publicly' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update note', variant: 'destructive' })
    }
  }

  const submitReview = async () => {
    if (userRating > 0 && reviewText.trim()) {
      try {
        await booksService.addReview(Number(id), {
          rating: userRating,
          comment: reviewText
        })

        setHasSubmittedReview(true)
        setShowReviewDialog(false)

        toast({
          title: 'Review submitted!',
          description: `Thank you for your ${userRating} star review!`
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to submit review',
          variant: 'destructive'
        })
      }
    }
  }

  const getThemeStyles = () => {
    const themes = {
      light: { bg: 'bg-[#F8FAFC]', text: 'text-slate-900', cardBg: 'bg-white' },
      dark: { bg: 'bg-slate-950', text: 'text-slate-100', cardBg: 'bg-slate-900' },
      sepia: { bg: 'bg-[#F4ECD8]', text: 'text-[#433422]', cardBg: 'bg-[#FDF6E3]' }
    }
    return themes[theme]
  }

  const toggleBookmark = () => {
    if (!bookData) return // Guard clause

    setBookData(prev => prev ? ({
      ...prev,
      bookmarks: isBookmarked
        ? (prev.bookmarks || []).filter(page => page !== currentPage)
        : [...(prev.bookmarks || []), currentPage]
    }) : null)
    setIsBookmarked(!isBookmarked)
  }

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await userService.removeFromFavorites(Number(id))
      } else {
        await userService.addToFavorites(Number(id))
      }

      setIsFavorite(!isFavorite)
      if (bookData) {
        setBookData(prev => prev ? ({ ...prev, isFavorite: !isFavorite }) : null)
      }

      toast({
        title: isFavorite ? 'Removed from favorites' : 'Added to favorites'
      })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update favorites', variant: 'destructive' })
    }
  }

  const goToQuiz = () => {
    navigate(`/book/${id}/quiz`)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(rating)
          const isHalfFilled = star === Math.ceil(rating) && rating % 1 !== 0

          return (
            <div key={star} className="relative">
              <Star
                className={`h-4 w-4 transition-colors ${isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalfFilled
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : 'fill-muted text-muted-foreground/20'
                  }`}
              />
            </div>
          )
        })}
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <h2 className="text-xl font-medium mb-2">Preparing your book...</h2>
        </div>
      </div>
    )
  }

  // Error state - no book data
  if (!bookData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h2 className="text-2xl font-bold mb-4">Book not found</h2>
          <p className="text-muted-foreground mb-8">The book you're looking for doesn't exist or you don't have access to it.</p>
          <Button
            onClick={() => navigate('/readnex')}
            className="rounded-full px-8"
          >
            Back to Library
          </Button>
        </div>
      </div>
    )
  }

  const themeStyles = getThemeStyles()

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeStyles.bg} ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header - Minimalist & Floating */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 px-4 py-3 pointer-events-none"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto bg-background/80 backdrop-blur-md border border-border/40 shadow-sm rounded-full px-6 py-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted hover:text-foreground"
              onClick={() => navigate('/readnex')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="hidden md:block h-6 w-px bg-border/50" />
            <div className="hidden md:block">
              <h1 className="text-sm font-semibold text-foreground line-clamp-1 max-w-[200px] lg:max-w-[400px]">
                {bookData?.title}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {bookData?.author}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {bookData?.hasQuiz && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToQuiz}
                className="rounded-full hover:bg-muted hover:text-foreground text-purple-600 dark:text-purple-400"
                title="Take Quiz"
              >
                <Target className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBookmark}
              className={`rounded-full transition-all ${isBookmarked ? 'text-amber-500 bg-amber-500/10' : 'hover:bg-muted hover:text-foreground'}`}
              title="Bookmark Page"
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={`rounded-full transition-all ${isFavorite ? 'text-rose-500 bg-rose-500/10' : 'hover:bg-muted hover:text-foreground'}`}
              title="Add to Favorites"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>

            <div className="h-6 w-px bg-border/50 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted hover:text-foreground">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 shadow-xl backdrop-blur-xl bg-background/95">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 hover:bg-muted hover:text-foreground'}`}
                  >
                    <Sun className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 hover:bg-muted hover:text-foreground'}`}
                  >
                    <Moon className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('sepia')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${theme === 'sepia' ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 hover:bg-muted hover:text-foreground'}`}
                  >
                    <Palette className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Sepia</span>
                  </button>
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Font Size</DropdownMenuLabel>
                <div className="px-2 pb-2 flex items-center justify-between">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setFontSize(Math.max(12, fontSize - 2))}>
                    <span className="text-xs">A-</span>
                  </Button>
                  <span className="text-sm font-medium w-12 text-center">{fontSize}px</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setFontSize(Math.min(24, fontSize + 2))}>
                    <span className="text-sm">A+</span>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto max-w-7xl px-4 pb-8">
        <div className={`grid grid-cols-1 gap-6 lg:gap-8 transition-all duration-500 ${sidebarOpen ? "xl:grid-cols-12" : "xl:grid-cols-1"}`}>
          {/* Main Content - Reading Area */}
          <div className={`transition-all duration-500 ${sidebarOpen ? "xl:col-span-8" : "xl:col-span-12"}`}>
            {/* Floating Toggle Button (when sidebar closed) */}
            <AnimatePresence>
              {!sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  className="fixed right-8 top-24 z-40"
                >
                  <Button
                    onClick={() => setSidebarOpen(true)}
                    className="h-12 px-6 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    <span className="font-semibold">Notes</span>
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
                      {notes.length}
                    </Badge>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${themeStyles.cardBg} border border-border/20`}>
              {/* PDF Viewer with react-pdf */}
              {pdfUrl ? (
                <div className="min-h-[80vh] flex flex-col relative">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0, x: pageDirection === 'forward' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: pageDirection === 'forward' ? -20 : 20 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex-1 flex justify-center p-4 md:p-8 overflow-auto"
                      style={{
                        backgroundColor: theme === 'sepia' ? '#F4ECD8' : theme === 'dark' ? '#0f172a' : '#F1F5F9'
                      }}
                    >
                      <Document
                        file={pdfUrl}
                        onLoadSuccess={({ numPages }) => {
                          setNumPages(numPages)
                          if (bookData) {
                            setBookData({ ...bookData, totalPages: numPages })
                          }
                        }}
                        onLoadError={(error) => {
                          console.error('PDF load error:', error)
                          toast({
                            title: 'PDF Loading Error',
                            description: 'Failed to load PDF. Please try again.',
                            variant: 'destructive'
                          })
                        }}
                        loading={
                          <div className="flex items-center justify-center h-full min-h-[600px]">
                            <div className="animate-pulse flex flex-col items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-muted"></div>
                              <div className="h-4 w-32 rounded bg-muted"></div>
                            </div>
                          </div>
                        }
                        options={pdfOptions}
                      >
                        {/* Wrap Page with relative positioning for overlays */}
                        <div
                          ref={pageContainerRef}
                          className="relative inline-block shadow-2xl rounded-sm overflow-hidden"
                        >
                          <Page
                            pageNumber={currentPage}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="pdf-page-content"
                            width={undefined}
                            height={undefined}
                            scale={1.0}
                          />

                          {/* Highlight Overlay on top of PDF */}
                          <NoteHighlightOverlay
                            notes={notes.filter(n => n.page === currentPage)}
                            currentPage={currentPage}
                            containerRef={pageContainerRef}
                            onHighlightClick={(note, position) => {
                              setSelectedNote(note)
                              if (position) {
                                // If we have a rect, center the popover below it
                                if (position.rect) {
                                  setPopoverPosition({
                                    x: position.rect.left + position.rect.width / 2,
                                    y: position.rect.bottom + 10 // 10px spacing
                                  })
                                } else {
                                  setPopoverPosition(position)
                                }
                              } else {
                                const pageElement = document.querySelector('.pdf-page-content')
                                if (pageElement) {
                                  const rect = pageElement.getBoundingClientRect()
                                  setPopoverPosition({
                                    x: rect.left + rect.width / 2,
                                    y: rect.top + 100
                                  })
                                }
                              }
                            }}
                          />
                        </div>
                      </Document>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Bar */}
                  <div className={`px-6 py-4 border-t border-border/10 flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90'} backdrop-blur-sm absolute bottom-0 left-0 right-0 z-20`}>
                    <Button
                      variant="ghost"
                      onClick={() => handlePageChange('prev')}
                      disabled={currentPage === 1}
                      className="hover:bg-muted hover:text-foreground"
                    >
                      <ChevronLeft className="h-5 w-5 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Page {currentPage} of {bookData?.totalPages || 0}
                      </span>
                      <div className="w-32 md:w-48 hidden sm:block">
                        <Progress value={bookData?.readingProgress || 0} className="h-1.5" />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => handlePageChange('next')}
                      disabled={currentPage === (bookData?.totalPages || 0)}
                      className="hover:bg-muted hover:text-foreground"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[60vh] flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">PDF Not Available</h3>
                    <p className="text-muted-foreground mb-6">
                      The PDF file for "{bookData?.title}" has not been uploaded yet.
                    </p>
                    <Button onClick={() => navigate('/readnex')}>
                      Back to Library
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Reading Tools & Notes (Collapsible) */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="xl:col-span-4 space-y-6 h-fit sticky top-24"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold">Reading Companion</h2>
                  <Button
                    onClick={() => setSidebarOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-muted"
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Hide
                  </Button>
                </div>

                {/* Book Info */}
                <Card className="border-border/40 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 bg-muted/30 border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progress</span>
                        <span className="text-sm font-bold text-primary">{bookData?.readingProgress || 0}%</span>
                      </div>
                      <Progress value={bookData?.readingProgress || 0} className="h-2 mt-2" />
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-border/40">
                      <div className="p-4 text-center">
                        <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-sm font-bold">{bookData?.readingTime || '0m'}</div>
                        <div className="text-xs text-muted-foreground">Reading Time</div>
                      </div>
                      <div className="p-4 text-center">
                        <div className="flex justify-center mb-1">
                          {renderStars(bookData?.rating || 0)}
                        </div>
                        <div className="text-sm font-bold">{bookData?.rating || 0}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="border-border/40 shadow-sm flex flex-col max-h-[calc(100vh-300px)]">
                  <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StickyNote className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">My Notes</h3>
                        <Badge variant="secondary" className="text-xs">{notes.length}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => {
                          setSelectedText("Add a note...")
                          setShowNoteDialog(true)
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        New
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                    {notes.length > 0 ? (
                      <div className="divide-y divide-border/40">
                        {notes.map((note) => {
                          const colorStyles = {
                            yellow: 'border-l-amber-400 bg-amber-50/50 dark:bg-amber-900/10',
                            blue: 'border-l-blue-400 bg-blue-50/50 dark:bg-blue-900/10',
                            green: 'border-l-green-400 bg-green-50/50 dark:bg-green-900/10',
                            pink: 'border-l-pink-400 bg-pink-50/50 dark:bg-pink-900/10',
                          }
                          const style = colorStyles[note.color || 'yellow']

                          return (
                            <div
                              key={note.id}
                              className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4 group relative ${style}`}
                              onClick={() => setCurrentPage(note.page)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded border border-border/50">
                                  Page {note.page}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 bg-background/90 rounded-md shadow-sm border border-border/50 p-0.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:text-primary"
                                    title="Edit"
                                    onClick={(e) => { e.stopPropagation(); editNote(note) }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:text-blue-500"
                                    title="Share"
                                    onClick={(e) => { e.stopPropagation(); shareNote(note.id) }}
                                  >
                                    <Share2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:text-destructive"
                                    title="Delete"
                                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm font-medium line-clamp-2 mb-1">"{note.text}"</p>
                              <p className="text-xs text-muted-foreground line-clamp-3">{note.note}</p>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <StickyNote className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No notes yet</p>
                        <p className="text-xs mt-1">Select text to add a note</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bookmarks */}
                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-amber-500" />
                      <h3 className="font-semibold">Bookmarks</h3>
                      <Badge variant="secondary" className="text-xs">{bookData?.bookmarks?.length || 0}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="grid grid-cols-4 gap-2">
                      {(bookData?.bookmarks || []).map((page) => (
                        <Button
                          key={page}
                          variant="outline"
                          size="sm"
                          className="h-9 w-full"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      {(bookData?.bookmarks?.length || 0) === 0 && (
                        <div className="col-span-4 py-4 text-center text-xs text-muted-foreground">
                          No bookmarks
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Note Popover */}
      <NotePopover
        note={selectedNote}
        position={popoverPosition}
        onClose={() => {
          setSelectedNote(null)
          setPopoverPosition(null)
        }}
        onEdit={(note) => {
          editNote(note)
          setSelectedNote(null)
          setPopoverPosition(null)
        }}
        onDelete={(id) => {
          deleteNote(id)
          setSelectedNote(null)
          setPopoverPosition(null)
        }}
        onShare={(id) => {
          shareNote(id)
        }}
      />

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={(open) => {
        setShowNoteDialog(open)
        if (!open) {
          setSelectedText("")
          setNewNote("")
          setEditingNote(null)
          setHighlightColor('yellow')
          window.getSelection()?.removeAllRanges()
        }
      }}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl overflow-hidden p-0 gap-0 border-0 shadow-2xl">
          <div className={`p-6 ${highlightColor === 'yellow' ? 'bg-amber-100 dark:bg-amber-900/30' :
            highlightColor === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
              highlightColor === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                'bg-pink-100 dark:bg-pink-900/30'
            } transition-colors duration-300`}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                {editingNote ? <Edit className="h-5 w-5" /> : <StickyNote className="h-5 w-5" />}
                {editingNote ? 'Edit Note' : 'New Note'}
              </DialogTitle>
              <DialogDescription className="text-foreground/70">
                Page {currentPage}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-3 bg-background/50 backdrop-blur-sm rounded-xl border border-black/5 text-sm font-medium italic">
              "{selectedText}"
            </div>
          </div>

          <div className="p-6 bg-background">
            <div className="flex gap-3 mb-4 justify-center">
              {(['yellow', 'blue', 'green', 'pink'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => setHighlightColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${highlightColor === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                    } ${color === 'yellow' ? 'bg-amber-400' :
                      color === 'blue' ? 'bg-blue-400' :
                        color === 'green' ? 'bg-green-400' :
                          'bg-pink-400'
                    }`}
                />
              ))}
            </div>

            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type your note here..."
              className="min-h-[150px] resize-none border-border/50 focus:border-primary rounded-xl text-base p-4"
            />
          </div>

          <DialogFooter className="p-4 bg-muted/30 border-t border-border/50">
            <Button variant="ghost" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button onClick={saveNote} disabled={!newNote.trim()}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Finished!</DialogTitle>
            <DialogDescription className="text-center">
              You've completed "{bookData?.title}". How was it?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-2 my-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setUserRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star className={`h-10 w-10 ${star <= (hoveredRating || userRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'
                  }`} />
              </button>
            ))}
          </div>

          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write a brief review..."
            className="mb-4"
          />

          <DialogFooter>
            <Button onClick={submitReview} className="w-full" disabled={userRating === 0}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
