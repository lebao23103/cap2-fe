import { useState, useEffect, useMemo } from 'react'
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
import {
  Bookmark,
  Heart,
  ChevronLeft,
  ChevronRight,
  Settings,
  StickyNote,
  ArrowLeft,
  Target,
  Eye,
  Clock,
  Star,
  Edit,
  Trash2,
  Share2,
  Highlighter,
  FileText,
  Sun,
  Moon,
  Palette
} from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ModernButton, StatCard, SectionHeader } from '@/components/ui/modern'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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

// Mock data removed - now using real API

export default function BookReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

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
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null)
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
  const [sidebarOpen, setSidebarOpen] = useState(false)  // Start with sidebar closed to show floating button


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

  const getHighlightClass = (color: string) => {
    const colors = {
      yellow: 'bg-amber-200 dark:bg-amber-500/30',
      blue: 'bg-blue-200 dark:bg-blue-500/30',
      green: 'bg-green-200 dark:bg-green-500/30',
      pink: 'bg-pink-200 dark:bg-pink-500/30'
    }
    return colors[color as keyof typeof colors] || colors.yellow
  }

  const getThemeStyles = () => {
    const themes = {
      light: { bg: 'bg-white', text: 'text-gray-900', cardBg: 'from-white via-white to-gray-50' },
      dark: { bg: 'bg-gray-900', text: 'text-gray-100', cardBg: 'from-gray-900 via-gray-900 to-gray-800' },
      sepia: { bg: 'bg-amber-50', text: 'text-amber-950', cardBg: 'from-amber-50 via-amber-50 to-amber-100' }
    }
    return themes[theme]
  }

  // Render text with inline highlights for notes
  const renderTextWithHighlights = (text: string, pageNum: number) => {
    const pageNotes = notes.filter(note => note.page === pageNum)

    if (pageNotes.length === 0) {
      return text
    }

    // Sort notes by text position in content
    const sortedNotes = [...pageNotes].sort((a, b) => {
      const posA = text.indexOf(a.text)
      const posB = text.indexOf(b.text)
      return posA - posB
    })

    const parts: Array<{ text: string, highlighted?: boolean, note?: BookNote }> = []
    let lastIndex = 0

    sortedNotes.forEach(note => {
      const startIndex = text.indexOf(note.text, lastIndex)

      if (startIndex !== -1) {
        // Add text before highlight
        if (startIndex > lastIndex) {
          parts.push({ text: text.slice(lastIndex, startIndex) })
        }

        // Add highlighted text
        parts.push({
          text: note.text,
          highlighted: true,
          note: note
        })

        lastIndex = startIndex + note.text.length
      }
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex) })
    }

    return (
      <>
        {parts.map((part, index) => {
          if (part.highlighted && part.note) {
            const colorStyles = {
              yellow: {
                bg: 'bg-amber-200/50 dark:bg-amber-400/20',
                hover: 'hover:bg-amber-300/60 dark:hover:bg-amber-400/30',
                icon: 'text-amber-700 dark:text-amber-300',
                iconBg: 'bg-amber-600/20 dark:bg-amber-400/25',
                popoverBg: 'from-amber-50/80 via-amber-50/40 to-transparent dark:from-amber-950/30 dark:via-amber-950/15 dark:to-transparent',
                popoverBorder: 'border-l-amber-500'
              },
              blue: {
                bg: 'bg-blue-200/50 dark:bg-blue-400/20',
                hover: 'hover:bg-blue-300/60 dark:hover:bg-blue-400/30',
                icon: 'text-blue-700 dark:text-blue-300',
                iconBg: 'bg-blue-600/20 dark:bg-blue-400/25',
                popoverBg: 'from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-950/30 dark:via-blue-950/15 dark:to-transparent',
                popoverBorder: 'border-l-blue-500'
              },
              green: {
                bg: 'bg-green-200/50 dark:bg-green-400/20',
                hover: 'hover:bg-green-300/60 dark:hover:bg-green-400/30',
                icon: 'text-green-700 dark:text-green-300',
                iconBg: 'bg-green-600/20 dark:bg-green-400/25',
                popoverBg: 'from-green-50/80 via-green-50/40 to-transparent dark:from-green-950/30 dark:via-green-950/15 dark:to-transparent',
                popoverBorder: 'border-l-green-500'
              },
              pink: {
                bg: 'bg-pink-200/50 dark:bg-pink-400/20',
                hover: 'hover:bg-pink-300/60 dark:hover:bg-pink-400/30',
                icon: 'text-pink-700 dark:text-pink-300',
                iconBg: 'bg-pink-600/20 dark:bg-pink-400/25',
                popoverBg: 'from-pink-50/80 via-pink-50/40 to-transparent dark:from-pink-950/30 dark:via-pink-950/15 dark:to-transparent',
                popoverBorder: 'border-l-pink-500'
              }
            }
            const style = colorStyles[part.note.color || 'yellow']

            return (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <mark
                    className={`
                      ${style.bg} ${style.hover}
                      inline px-0.5 mx-px
                      rounded-sm
                      cursor-pointer transition-colors duration-150
                      relative group
                      no-underline border-0
                      text-[inherit] leading-[inherit]
                    `}
                    style={{
                      textDecorationLine: 'none',
                      boxDecorationBreak: 'clone',
                      WebkitBoxDecorationBreak: 'clone',
                      verticalAlign: 'baseline'
                    }}
                  >
                    {part.text}
                  </mark>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-0 overflow-hidden shadow-xl border-0"
                  side="top"
                  align="start"
                  sideOffset={8}
                >
                  <div className={`bg-gradient-to-r ${style.popoverBg} border-l-[3px] ${style.popoverBorder} p-4`}>
                    <div className="flex items-start gap-2 mb-3">
                      <div className={`flex-shrink-0 ${style.iconBg} p-1.5 rounded-lg`}>
                        <StickyNote className={`h-4 w-4 ${style.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Highlighted Text</p>
                        <p className="text-sm font-semibold text-foreground leading-snug">
                          "{part.note.text}"
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Your Note</p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {part.note.note}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="px-2 py-0.5 bg-background/50 rounded-md font-medium">Page {part.note.page}</span>
                        <span>·</span>
                        <span>{new Date(part.note.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      {part.note.isPublic && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-[10px] font-medium">
                          <Share2 className="h-2.5 w-2.5" />
                          Shared
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )
          }
          return <span key={index}>{part.text}</span>
        })}
      </>
    )
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Loading book...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your reading experience</p>
        </div>
      </div>
    )
  }

  // Error state - no book data
  if (!bookData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold mb-4">Book not found</h2>
          <p className="text-muted-foreground mb-6">The book you're looking for doesn't exist or you don't have access to it.</p>
          <ModernButton
            icon={ArrowLeft}
            onClick={() => navigate('/readnex')}
          >
            Back to Library
          </ModernButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
        <div className="p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ModernButton
                icon={ArrowLeft}
                size="sm"
                onClick={() => navigate('/readnex')}
              >
                Library
              </ModernButton>
              <div className="border-l border-border/50 pl-4">
                <h1 className="text-lg font-bold text-foreground line-clamp-1">
                  {bookData?.title}
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  by {bookData?.author}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleBookmark}
                className={`group p-2.5 rounded-lg border transition-all duration-300 ${isBookmarked
                  ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-500 shadow-sm'
                  : 'border-transparent hover:border-amber-500/20 hover:bg-amber-500/5'
                  }`}
              >
                <Bookmark className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={toggleFavorite}
                className={`group p-2.5 rounded-lg border transition-all duration-300 ${isFavorite
                  ? 'border-rose-500/30 bg-gradient-to-br from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-500 shadow-sm'
                  : 'border-transparent hover:border-rose-500/20 hover:bg-rose-500/5'
                  }`}
              >
                <Heart className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              {bookData?.hasQuiz && (
                <ModernButton
                  icon={Target}
                  size="sm"
                  onClick={goToQuiz}
                  className="ml-1 border-purple-500/30 bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-purple-500/5 hover:from-purple-500/25 hover:via-purple-500/20 hover:to-purple-500/10 text-purple-600 dark:text-purple-400"
                >
                  Take Quiz
                </ModernButton>
              )}

              {bookData?.readingProgress === 100 && (
                <ModernButton
                  icon={Star}
                  size="sm"
                  onClick={() => setShowReviewDialog(true)}
                  className="ml-1 border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 hover:from-amber-500/25 hover:via-amber-500/20 hover:to-amber-500/10 text-amber-600 dark:text-amber-400"
                >
                  {hasSubmittedReview ? 'View Review' : 'Write Review'}
                </ModernButton>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group p-2.5 rounded-lg border border-transparent hover:border-border/30 hover:bg-muted/50 transition-all duration-300">
                    <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs uppercase tracking-wider">Reading Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
                    <Sun className="h-4 w-4 mr-2" />
                    <span className={theme === 'light' ? 'font-bold text-primary' : 'font-medium'}>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
                    <Moon className="h-4 w-4 mr-2" />
                    <span className={theme === 'dark' ? 'font-bold text-primary' : 'font-medium'}>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('sepia')} className="cursor-pointer">
                    <Palette className="h-4 w-4 mr-2" />
                    <span className={theme === 'sepia' ? 'font-bold text-primary' : 'font-medium'}>Sepia</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs uppercase tracking-wider">Font Size</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFontSize(14)} className="cursor-pointer">
                    <span className={fontSize === 14 ? 'font-bold text-primary' : 'font-medium'}>Small (14px)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFontSize(16)} className="cursor-pointer">
                    <span className={fontSize === 16 ? 'font-bold text-primary' : 'font-medium'}>Medium (16px)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFontSize(18)} className="cursor-pointer">
                    <span className={fontSize === 18 ? 'font-bold text-primary' : 'font-medium'}>Large (18px)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFontSize(20)} className="cursor-pointer">
                    <span className={fontSize === 20 ? 'font-bold text-primary' : 'font-medium'}>Extra Large (20px)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">
                <span className="text-xs font-bold text-foreground">
                  {currentPage}
                </span>
                <span className="text-xs text-muted-foreground mx-1">/</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {bookData?.totalPages || 0}
                </span>
              </div>
              <div className="flex-1">
                <Progress value={bookData?.readingProgress || 0} className="h-2" />
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <span className="text-xs font-bold text-primary">
                  {bookData?.readingProgress || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl py-6 lg:py-8">
        <div className={`grid grid-cols-1 gap-6 lg:gap-8 transition-all duration-300 ${sidebarOpen ? "xl:grid-cols-12" : "xl:grid-cols-1"}`}>
          {/* Main Content - Reading Area */}
          <div className={`transition-all duration-300 ${sidebarOpen ? "xl:col-span-8" : "xl:col-span-12"}`}>
            {/* Floating Toggle Button (when sidebar closed) */}
            <AnimatePresence>
              {!sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed right-6 top-28 z-[9999]"
                >
                  <Button
                    onClick={() => setSidebarOpen(true)}
                    className="h-11 px-5 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border border-primary-foreground/20"
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-sm">Notes</span>
                    <Badge className="ml-2 bg-primary-foreground/30 text-primary-foreground border-0 text-xs font-semibold">
                      {notes.length}
                    </Badge>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>




            <Card className={`border-0 shadow-2xl bg-gradient-to-br ${getThemeStyles().cardBg} backdrop-blur-sm overflow-hidden transition-colors duration-500`}>
              <CardContent className="p-0">
                {/* Reading Container */}
                <div className="min-h-[calc(100vh-280px)] flex flex-col">
                  {/* PDF Viewer with react-pdf */}
                  {pdfUrl ? (
                    <div className="flex-1 w-full h-full relative">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={currentPage}
                          initial={{
                            opacity: 0,
                            x: pageDirection === 'forward' ? 100 : -100,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: pageDirection === 'forward' ? -100 : 100,
                          }}
                          transition={{
                            duration: 0.3,
                            ease: [0.25, 0.1, 0.25, 1]
                          }}
                          className="flex justify-center p-8"
                          style={{
                            backgroundColor: theme === 'sepia' ? '#f5f1e8' : theme === 'dark' ? '#1a1a1a' : '#ffffff'
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
                              <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
                              </div>
                            }
                            options={pdfOptions}
                          >
                            {/* Wrap Page with relative positioning for overlays */}
                            <div className="relative inline-block w-full flex justify-center">
                              <Page
                                pageNumber={currentPage}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="shadow-2xl pdf-page-content max-w-full"
                                width={undefined}
                                height={undefined}
                                scale={1.0}
                              />

                              {/* Highlight Overlay on top of PDF */}
                              <NoteHighlightOverlay
                                notes={notes.filter(n => n.page === currentPage)}
                                currentPage={currentPage}
                                onHighlightClick={(note) => {
                                  setSelectedNote(note)
                                  // Get click position (approximate center of page)
                                  const pageElement = document.querySelector('.pdf-page-content')
                                  if (pageElement) {
                                    const rect = pageElement.getBoundingClientRect()
                                    setPopoverPosition({
                                      x: rect.left + rect.width / 2,
                                      y: rect.top + 100
                                    })
                                  }
                                }}
                              />
                            </div>
                          </Document>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                      <div className="text-center max-w-md">
                        <div className="relative inline-block mb-6">
                          <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                            <FileText className="h-16 w-16 mx-auto text-primary" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3">PDF Not Available</h3>
                        <p className="text-muted-foreground mb-6">
                          The PDF file for "{bookData?.title}" has not been uploaded yet.
                        </p>
                        <div className="space-y-3">
                          <ModernButton
                            icon={ArrowLeft}
                            onClick={() => navigate('/readnex')}
                            variant="ghost"
                          >
                            Back to Library
                          </ModernButton>
                          <p className="text-xs text-muted-foreground">
                            Please contact the administrator to add this book's PDF file.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Footer */}
                  <div className="px-8 md:px-12 lg:px-16 pb-8 pt-6 border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20">
                    <div className="flex items-center justify-between gap-4" style={{ maxWidth: '65ch', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handlePageChange('prev')}
                        disabled={currentPage === 1}
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
                              {currentPage}
                            </span>
                            <div className="h-4 w-px bg-border/50"></div>
                            <span className="text-sm font-medium text-muted-foreground">
                              {bookData?.totalPages || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handlePageChange('next')}
                        disabled={currentPage === (bookData?.totalPages || 0)}
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

          {/* Sidebar - Reading Tools & Notes (Collapsible) */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="xl:col-span-4 space-y-5"
              >
                <div className="flex justify-end mb-2">
                  <Button
                    onClick={() => setSidebarOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Hide Notes</span>
                  </Button>
                </div>
                {/* Book Info */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-4 border-b border-border/30">
                    <SectionHeader title="Book Details" variant="primary" />
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5">
                    <StatCard
                      icon={Clock}
                      label="Reading Time"
                      value={bookData?.readingTime || '0 min'}
                      variant="primary"
                    />

                    <StatCard
                      icon={Eye}
                      label="Progress"
                      value={`${bookData?.readingProgress || 0}%`}
                      variant="success"
                    >
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                          style={{ width: `${bookData?.readingProgress || 0}%` }}
                        />
                      </div>
                    </StatCard>

                    <div className="group relative overflow-hidden rounded-xl border border-amber-500/10 bg-gradient-to-br from-amber-500/5 via-amber-500/3 to-transparent p-4 hover:border-amber-500/20 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                            <Star className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Rating</p>
                            <div>{renderStars(bookData?.rating || 0)}</div>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-foreground">{bookData?.rating || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-4 border-b border-border/30">
                    <SectionHeader
                      title="My Notes"
                      icon={StickyNote}
                      badge={notes.length}
                      variant="warning"
                      action={
                        <ModernButton
                          icon={FileText}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedText("Add a note...")
                            setShowNoteDialog(true)
                          }}
                          className="hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                        >
                          New
                        </ModernButton>
                      }
                    />
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {notes.map((note) => {
                      const colorStyles = {
                        blue: {
                          border: 'border-l-blue-500',
                          bg: 'bg-gradient-to-r from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-950/30 dark:via-blue-950/15 dark:to-transparent',
                          accent: 'bg-blue-500',
                          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                          iconColor: 'text-blue-600 dark:text-blue-400'
                        },
                        green: {
                          border: 'border-l-green-500',
                          bg: 'bg-gradient-to-r from-green-50/80 via-green-50/40 to-transparent dark:from-green-950/30 dark:via-green-950/15 dark:to-transparent',
                          accent: 'bg-green-500',
                          iconBg: 'bg-green-100 dark:bg-green-900/30',
                          iconColor: 'text-green-600 dark:text-green-400'
                        },
                        pink: {
                          border: 'border-l-pink-500',
                          bg: 'bg-gradient-to-r from-pink-50/80 via-pink-50/40 to-transparent dark:from-pink-950/30 dark:via-pink-950/15 dark:to-transparent',
                          accent: 'bg-pink-500',
                          iconBg: 'bg-pink-100 dark:bg-pink-900/30',
                          iconColor: 'text-pink-600 dark:text-pink-400'
                        },
                        yellow: {
                          border: 'border-l-amber-500',
                          bg: 'bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-transparent dark:from-amber-950/30 dark:via-amber-950/15 dark:to-transparent',
                          accent: 'bg-amber-500',
                          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                          iconColor: 'text-amber-600 dark:text-amber-400'
                        }
                      };

                      const style = colorStyles[note.color as keyof typeof colorStyles] || colorStyles.yellow;

                      return (
                        <div
                          key={note.id}
                          className={`group relative overflow-hidden border-l-[3px] ${style.border} ${style.bg} rounded-lg p-4 transition-all duration-300 hover:shadow-lg cursor-pointer backdrop-blur-sm`}
                          onMouseEnter={() => setHoveredNoteId(note.id)}
                          onMouseLeave={() => setHoveredNoteId(null)}
                          onClick={() => setCurrentPage(note.page)}
                        >
                          {/* Highlighted Text */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`flex-shrink-0 p-2 rounded-lg ${style.iconBg} shadow-sm`}>
                              <StickyNote className={`h-3.5 w-3.5 ${style.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground leading-snug">
                                "{note.text}"
                              </p>
                              {note.isPublic && (
                                <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-[10px] font-medium">
                                  <Share2 className="h-2.5 w-2.5" />
                                  Shared
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Note Content */}
                          <p className="text-xs text-muted-foreground leading-relaxed mb-3 pl-11">
                            {note.note}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between pl-11">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 font-medium">
                              <span className="px-2 py-0.5 bg-background/50 rounded-md">Page {note.page}</span>
                              <span>·</span>
                              <span>{new Date(note.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>

                            {/* Action Buttons - Show on hover */}
                            {hoveredNoteId === note.id && (
                              <div className="flex gap-1 animate-in fade-in duration-200">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-background/80 hover:text-primary transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    editNote(note)
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-background/80 hover:text-green-600 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    shareNote(note.id)
                                  }}
                                >
                                  <Share2 className={`h-3 w-3 ${note.isPublic ? 'text-green-600 dark:text-green-500' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNote(note.id)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {notes.length === 0 && (
                      <div className="text-center py-12">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
                          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                            <StickyNote className="h-10 w-10 mx-auto text-amber-500" />
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-foreground mt-4">
                          No notes yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto">
                          Select text while reading to create your first note
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bookmarks */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-4 border-b border-border/30">
                    <SectionHeader
                      title="Bookmarks"
                      icon={Bookmark}
                      badge={bookData?.bookmarks?.length || 0}
                      variant="warning"
                    />
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="space-y-2">
                      {(bookData?.bookmarks || []).map((page) => (
                        <Button
                          key={page}
                          variant="ghost"
                          size="sm"
                          className="group w-full justify-start text-sm hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-50/50 dark:hover:from-amber-950/20 dark:hover:to-amber-950/10 hover:text-amber-700 dark:hover:text-amber-400 transition-all duration-200"
                          onClick={() => setCurrentPage(page)}
                        >
                          <Bookmark className="h-3 w-3 mr-2 fill-current group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-medium">Page {page}</span>
                        </Button>
                      ))}
                      {(bookData?.bookmarks?.length || 0) === 0 && (
                        <div className="text-center py-12">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                              <Bookmark className="h-10 w-10 mx-auto text-amber-500" />
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-foreground mt-4">
                            No bookmarks yet
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto">
                            Bookmark pages to quickly return to them later
                          </p>
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

      {/* Note Dialog - Enhanced */}
      <Dialog open={showNoteDialog} onOpenChange={(open) => {
        setShowNoteDialog(open)
        if (!open) {
          setSelectedText("")
          setNewNote("")
          setEditingNote(null)
          setHighlightColor('yellow')
          // Clear browser text selection
          window.getSelection()?.removeAllRanges()
        }
      }}>
        <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-amber-500/20" aria-hidden="true">
                  <StickyNote className="h-5 w-5 text-amber-600 dark:text-amber-500" aria-hidden="true" />
                </div>
                {editingNote ? 'Edit Note' : 'Add Note'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingNote ? 'Update your note and highlight color' : 'Add your thoughts about the selected text passage'}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-5">
            {/* Selected Text */}
            <div>
              <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Highlighter className="h-4 w-4 text-amber-600 dark:text-amber-500" aria-hidden="true" />
                Selected Text
              </label>
              <div className={`text-sm p-4 rounded-xl border-2 ${getHighlightClass(highlightColor)} font-medium`}>
                "{selectedText}"
              </div>
            </div>

            {/* Highlight Color Selector */}
            <div>
              <label className="text-sm font-semibold block mb-3">Highlight Color</label>
              <div className="flex gap-3">
                {(['yellow', 'blue', 'green', 'pink'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setHighlightColor(color)}
                    className={`group relative w-12 h-12 rounded-xl border-2 transition-all duration-300 ${highlightColor === color
                      ? 'border-foreground scale-110 shadow-lg ring-4 ring-offset-2 ring-offset-background'
                      : 'border-border hover:scale-105 hover:border-foreground/50'
                      } ${color === 'yellow' ? 'bg-gradient-to-br from-amber-300 to-amber-400 ring-amber-200' :
                        color === 'blue' ? 'bg-gradient-to-br from-blue-300 to-blue-400 ring-blue-200' :
                          color === 'green' ? 'bg-gradient-to-br from-green-300 to-green-400 ring-green-200' :
                            'bg-gradient-to-br from-pink-300 to-pink-400 ring-pink-200'
                      }`}
                    aria-label={`${color} highlight`}
                  >
                    {highlightColor === color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-foreground rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Textarea */}
            <div>
              <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-amber-600 dark:text-amber-500" aria-hidden="true" />
                Your Note
              </label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your insights, questions, or thoughts about this passage..."
                className="min-h-[120px] resize-none rounded-xl"
                rows={5}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {newNote.length} characters
                </p>
                {newNote.length > 500 && (
                  <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                    Consider keeping notes concise
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 p-6 bg-muted/30 border-t border-border/50">
            <ModernButton
              variant="ghost"
              onClick={() => {
                setShowNoteDialog(false)
                setSelectedText("")
                setNewNote("")
                setEditingNote(null)
                setHighlightColor('yellow')
              }}
            >
              Cancel
            </ModernButton>
            <ModernButton
              onClick={saveNote}
              disabled={!newNote.trim()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-md hover:shadow-lg"
              icon={StickyNote}
            >
              {editingNote ? 'Update Note' : 'Save Note'}
            </ModernButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 border-b border-border/50 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="p-1.5 rounded-lg bg-primary/20" aria-hidden="true">
                  <Star className="h-5 w-5 text-primary fill-current" aria-hidden="true" />
                </div>
                You've Finished the Book!
              </DialogTitle>
              <DialogDescription className="text-sm mt-1.5">
                Share your thoughts and rate "{bookData?.title}" to help other readers
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Rating Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">
                  Your Rating
                </label>
                {userRating > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {userRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Star Display */}
              <div className="flex items-center justify-center gap-1 mb-4 p-3 rounded-xl bg-gradient-to-br from-amber-500/5 via-transparent to-transparent border border-border/50">
                {[1, 2, 3, 4, 5].map((star) => {
                  const displayRating = hoveredRating > 0 ? hoveredRating : userRating
                  const baseRating = Math.floor(displayRating)
                  const isFullStar = star <= baseRating
                  const isPartialStar = star === baseRating + 1 && (displayRating % 1 > 0)
                  const partialFill = isPartialStar ? (displayRating % 1) * 100 : 0

                  return (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="group transition-all duration-200 hover:scale-125 focus:scale-125 focus:outline-none relative"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`h-10 w-10 transition-all duration-200 drop-shadow-sm ${isFullStar
                          ? 'fill-amber-400 text-amber-400 group-hover:fill-amber-500 group-hover:text-amber-500'
                          : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700 group-hover:fill-gray-300 dark:group-hover:fill-gray-600'
                          }`}
                      />
                      {isPartialStar && (
                        <div
                          className="absolute inset-0 overflow-hidden pointer-events-none"
                          style={{ clipPath: `inset(0 ${100 - partialFill}% 0 0)` }}
                        >
                          <Star className="h-10 w-10 fill-amber-400 text-amber-400 drop-shadow-sm" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Fine-tune Slider */}
              {userRating > 0 && (
                <div className="space-y-2.5 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Fine-tune your rating
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          const newRating = Math.max(0.5, userRating - 0.1)
                          setUserRating(Math.round(newRating * 10) / 10)
                        }}
                        className="w-6 h-6 rounded-md bg-background hover:bg-muted border border-border/50 flex items-center justify-center transition-colors"
                        aria-label="Decrease rating"
                      >
                        <span className="text-base font-bold">−</span>
                      </button>
                      <button
                        onClick={() => {
                          const newRating = Math.min(5.0, userRating + 0.1)
                          setUserRating(Math.round(newRating * 10) / 10)
                        }}
                        className="w-6 h-6 rounded-md bg-background hover:bg-muted border border-border/50 flex items-center justify-center transition-colors"
                        aria-label="Increase rating"
                      >
                        <span className="text-base font-bold">+</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative pt-0.5">
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.1"
                      value={userRating}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        setUserRating(Math.round(value * 10) / 10)
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all"
                      style={{
                        background: `linear-gradient(to right, 
                          rgb(251, 191, 36) 0%, 
                          rgb(251, 191, 36) ${((userRating - 0.5) / 4.5) * 100}%, 
                          rgb(229, 231, 235) ${((userRating - 0.5) / 4.5) * 100}%, 
                          rgb(229, 231, 235) 100%
                        )`,
                        WebkitAppearance: 'none',
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">0.5</span>
                    <div className="flex gap-3 text-muted-foreground">
                      <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => setUserRating(2.0)}>2.0</span>
                      <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => setUserRating(3.0)}>3.0</span>
                      <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => setUserRating(4.0)}>4.0</span>
                    </div>
                    <span className="text-muted-foreground">5.0</span>
                  </div>

                  {/* Quick Rating Buttons */}
                  <div className="flex gap-1.5 pt-2 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground mr-1 self-center">Quick:</span>
                    {[3.0, 3.5, 4.0, 4.5, 5.0].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setUserRating(rating)}
                        className={`flex-1 px-1.5 py-1 text-[11px] font-semibold rounded-md transition-all ${userRating === rating
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-background hover:bg-muted border border-border/50'
                          }`}
                      >
                        {rating.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {userRating === 0 && (
                <div className="text-center py-2 rounded-xl bg-muted/30 border border-dashed border-border">
                  <p className="text-xs text-muted-foreground">
                    👆 Click on the stars above to rate this book
                  </p>
                </div>
              )}
            </div>

            {/* Review Text Section */}
            <div>
              <label className="text-sm font-semibold flex items-center gap-1.5 mb-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Your Review
              </label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think about this book? Share your insights, favorite moments, or overall impressions..."
                className="min-h-[100px] resize-none rounded-xl text-sm"
                rows={4}
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] text-muted-foreground">
                  {reviewText.length} characters
                </p>
                {reviewText.length < 50 && reviewText.length > 0 && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">
                    Try to write at least 50 characters
                  </p>
                )}
              </div>
            </div>

            {/* Book Info Summary */}
            <div className="rounded-xl bg-muted/50 p-3 border border-border/50">
              <h4 className="font-semibold text-sm mb-1">{bookData?.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">by {bookData?.author}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{bookData?.readingTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{bookData?.totalPages} pages</span>
                </div>
                <div className="flex items-center gap-1">
                  <StickyNote className="h-3 w-3" />
                  <span>{notes.length} notes</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 p-4 bg-muted/30 border-t border-border/50 flex-shrink-0">
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={() => setShowReviewDialog(false)}
            >
              Maybe Later
            </ModernButton>
            <ModernButton
              size="sm"
              onClick={submitReview}
              disabled={userRating === 0 || reviewText.trim().length < 10}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0 shadow-md hover:shadow-lg"
              icon={Star}
            >
              Submit Review
            </ModernButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Popover - Shows when clicking on a highlight */}
      <NotePopover
        note={selectedNote}
        position={popoverPosition}
        onClose={() => {
          setSelectedNote(null)
          setPopoverPosition(null)
        }}
        onEdit={(note) => {
          setSelectedNote(null)
          setPopoverPosition(null)
          editNote(note)
        }}
        onDelete={(noteId) => {
          setSelectedNote(null)
          setPopoverPosition(null)
          deleteNote(noteId)
        }}
        onShare={(noteId) => {
          shareNote(noteId)
        }}
      />
    </div>
  )
}
