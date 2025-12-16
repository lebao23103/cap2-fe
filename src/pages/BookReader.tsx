import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Document, Page, pdfjs } from 'react-pdf'
import '@/styles/pdf-viewer.css'
import '@/styles/pdf-layers.css'
import booksService from '@/lib/api/books'
import userService from '@/lib/api/user'
import authService from '@/lib/api/auth'
import { useToast } from '@/components/ui/use-toast'
import NoteHighlightOverlay from '@/components/reader/NoteHighlightOverlay'
import NotePopover from '@/components/reader/NotePopover'
import SearchDialog from '@/components/reader/SearchDialog'
import ChapterDisplay from '@/components/reader/ChapterDisplay'
import TransientHighlightOverlay from '@/components/reader/TransientHighlightOverlay'
import { usePdfSearch } from '@/hooks/usePdfSearch'
import { usePdfChapter } from '@/hooks/usePdfChapter'
import { FocusTapeDeck } from '@/components/FocusTapeDeck'
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Settings,
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
  Eye,
  EyeOff,
  Globe,
  Lock,
  Copy,
  Highlighter,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  position_start?: number
  position_end?: number
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
  userRating?: number
}

export default function BookReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const pageContainerRef = useRef<HTMLDivElement>(null)

  // Real data from API
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [notes, setNotes] = useState<BookNote[]>([])
  const [numPages, setNumPages] = useState<number>(0)
  const [pdfDocument, setPdfDocument] = useState<any>(null)

  // UI state
  const [currentPage, setCurrentPage] = useState(location.state?.page || 1)
  const isReadOnly = location.state?.previewMode || false
  const previewNote = location.state?.previewNote || null

  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [newNote, setNewNote] = useState("")
  const [fontSize, setFontSize] = useState(20)

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
  const [showNavbar, setShowNavbar] = useState(true)
  const [showHighlights, setShowHighlights] = useState(true)

  // New state for highlight overlay and popover
  const [selectedNote, setSelectedNote] = useState<BookNote | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number; arrowOffset?: number } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [highlightStyle, setHighlightStyle] = useState<'classic' | 'box' | 'glow'>('classic')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)

  // Search State
  const [showSearch, setShowSearch] = useState(false)
  const [tempHighlight, setTempHighlight] = useState<{ page: number, text: string } | null>(null)
  const { searchPdf, results, isSearching, clearResults } = usePdfSearch()

  // Chapter State
  const { extractChapters, currentChapter, updateCurrentChapter, outline } = usePdfChapter()


  // Handle click outside to close popover
  useEffect(() => {
    const handleOutsideClick = () => {
      setSelectedNote(null)
      setPopoverPosition(null)
    }

    if (selectedNote) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [selectedNote])


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

      // Fetch book details, PDF URL, notes, favorite status, AND history, AND reviews, AND current user
      const [bookDetails, pdfContent, bookNotes, favorites, history, reviews, currentUser] = await Promise.all([
        booksService.getBookById(Number(id)),
        booksService.getBookContent(Number(id)),
        // Only fetch my notes if NOT in read-only mode, or if we want to show them alongside preview note?
        // User requested "just view" the shared note. So maybe don't fetch my notes?
        // But context implies just viewing. Let's fetch my notes but disable editing them.
        fetch(`/api/books/${id}/notes/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }).then(res => res.json()).catch(() => []),
        userService.getFavorites().catch(() => []),
        fetch(`/api/reading-history/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }).then(res => res.json()).catch(() => []),
        booksService.getBookReviews(Number(id)).catch(() => []),
        Promise.resolve(authService.getCurrentUser())
      ])

      // Determine user rating
      let userRating = 0
      if (currentUser && Array.isArray(reviews)) {
        const myReview = reviews.find((r: any) => {
          // Handle both object user and ID user
          const reviewUserId = typeof r.user === 'object' ? r.user.id : r.user
          return reviewUserId === currentUser.id
        })
        if (myReview) {
          userRating = myReview.rating
          setUserRating(userRating) // Update local input state too
          setReviewText(myReview.comment || '') // Update local input state
          setHasSubmittedReview(true)
        }
      }

      // Transform to BookData format
      const transformedBook: BookData = {
        id: bookDetails.id.toString(),
        title: bookDetails.title,
        author: bookDetails.author,
        content: [], // Will use PDF instead
        totalPages: numPages || bookDetails.pages || 10, // Prefer API pages if PDF not loaded
        currentPage: location.state?.page || (() => {
          const bookHistory = Array.isArray(history) ? history.filter((h: any) => h.book_id === Number(id)) : []
          const maxPage = bookHistory.length > 0 ? Math.max(...bookHistory.map((h: any) => h.page_number)) : 1

          // Sync UI state
          if (!location.state?.page) {
            setCurrentPage(maxPage)
          }

          return maxPage
        })(),

        readingProgress: (() => {
          const total = bookDetails.pages || numPages || 10
          // Use the same logic as currentPage to ensure sync
          const bookHistory = Array.isArray(history) ? history.filter((h: any) => h.book_id === Number(id)) : []
          const maxPage = bookHistory.length > 0 ? Math.max(...bookHistory.map((h: any) => h.page_number)) : 1
          const startPage = !location.state?.page ? maxPage : location.state.page

          const rawProgress = (startPage / total) * 100
          return Math.min(100, Math.round(rawProgress))
        })(),

        notes: [],
        bookmarks: [],
        isFavorite: favorites.some((fav: any) => fav.id === Number(id)),
        hasQuiz: true,
        readingTime: (() => {
          const totalMinutes = (bookDetails.pages || 0) * 1.5
          const hours = Math.floor(totalMinutes / 60)
          const minutes = Math.floor(totalMinutes % 60)
          return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        })(),
        rating: bookDetails.rating || 0,
        userRating: userRating > 0 ? userRating : undefined
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

      let allNotes = bookNotes.map((note: any) => ({
        id: note.id.toString(),
        text: note.selected_text,
        note: note.note_content,
        page: note.page_number || 1,
        timestamp: note.created_at,
        color: note.color === '#FFEB3B' ? 'yellow' : note.color === '#2196F3' ? 'blue' : note.color === '#4CAF50' ? 'green' : 'pink',
        isPublic: note.is_public,
        position_start: note.position_start,
        position_end: note.position_end
      }))

      // Inject preview note if exists
      if (previewNote) {
        const mappedPreviewNote: BookNote = {
          id: previewNote.id,
          text: previewNote.text || previewNote.noteText, // Handle different property names
          note: previewNote.note || previewNote.userNote,
          page: previewNote.page,
          timestamp: previewNote.timestamp || previewNote.sharedDate,
          color: previewNote.color === '#FFEB3B' ? 'yellow' : previewNote.color === '#2196F3' ? 'blue' : previewNote.color === '#4CAF50' ? 'green' : 'pink', // Simple mapping, could be robust
          isPublic: true
        }
        // Add to beginning of list so it renders on top? or end?
        if (!allNotes.some((n: any) => n.id === mappedPreviewNote.id)) {
          allNotes = [mappedPreviewNote, ...allNotes]
        }
      }

      setNotes(allNotes)
      setIsFavorite(favorites.some((fav: any) => fav.id === Number(id)))

      // Track reading history
      await fetch(`/api/reading-history/add/`, {
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

  // ... (existing code) ...

  // This is a placeholder for where the Book Info card would be rendered in the JSX.
  // The actual placement would be within the component's return statement.
  // Assuming themeStyles and renderStars are defined elsewhere in the component.
  // For the purpose of this edit, we're placing it here as per the instruction's context.
  {/* Book Info - Compact Redesign */ }
  {/* This JSX block would typically be inside the component's `return` statement */ }
  {/* and integrated with other UI elements, likely within a sidebar or main content area. */ }
  {/* For this edit, it's placed here as a direct replacement based on the provided snippet. */ }
  {/* <Card className={`shrink-0 border-2 ${themeStyles.border} shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden rounded-xl ${themeStyles.cardBg}`}>
    <CardContent className="p-0">
      <div className={`px-3 py-2 border-b ${themeStyles.border} ${themeStyles.navBg}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.text} opacity-70`}>Progress</span>
          <span className={`text-xs font-bold font-mono ${themeStyles.text}`}>{bookData?.readingProgress || 0}%</span>
        </div>
        <Progress value={bookData?.readingProgress || 0} className={`h-2 border ${themeStyles.border} rounded-full [&>div]:bg-primary`} />
      </div>
      
      <div className={`grid grid-cols-2 divide-x ${theme === 'dark' ? 'divide-gray-600' : theme === 'sepia' ? 'divide-[#8b7355]' : 'divide-black'}`}>
        <div className="p-2 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Clock className={`h-3.5 w-3.5 ${themeStyles.text} opacity-70`} />
            <span className={`text-xs font-bold font-mono ${themeStyles.text}`}>{bookData?.readingTime || '0m'}</span>
          </div>
          <span className={`text-[9px] uppercase font-bold tracking-tight ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-[#8b7355]' : 'text-gray-500'}`}>Reading Time</span>
        </div>
        
        <div className="p-2 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            {renderStars(bookData?.rating || 0)}
            <span className={`ml-1 text-xs font-bold font-mono ${themeStyles.text}`}>{bookData?.rating || 0}</span>
          </div>
          <span className={`text-[9px] uppercase font-bold tracking-tight ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-[#8b7355]' : 'text-gray-500'}`}>Rating</span>
        </div>
      </div>
    </CardContent>
  </Card> */}

  useEffect(() => {
    if (bookData) {
      setIsFavorite(bookData.isFavorite || false)
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

        case '+':
        case '=':
          setFontSize(prev => Math.min(prev + 2, 24))
          break
        case '-':
        case '_':
          setFontSize(prev => Math.max(prev - 2, 18))
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
      updateCurrentChapter(nextPage)

      // Show review dialog when reaching the last page for the first time
      if (nextPage === bookData.totalPages && !hasSubmittedReview) {
        setTimeout(() => setShowReviewDialog(true), 500)
      }
    } else if (direction === 'prev' && currentPage > 1) {
      setPageDirection('backward')
      setCurrentPage((prev: number) => prev - 1)
      updateCurrentChapter(currentPage - 1)
    }
  }

  const updateReadingProgress = async (page: number) => {
    if (!bookData) return

    const progress = Math.round((page / bookData.totalPages) * 100)

    // Update local state
    setBookData(prev => prev ? {
      ...prev,
      currentPage: page,
      readingProgress: progress
    } : null)

    // Update backend
    try {
      await fetch(`/api/reading-history/${id}/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ page_number: page })
      })
    } catch (error) {
      console.error('Failed to save progress', error)
    }
  }


  const handleChapterNavigate = useCallback((page: number) => {
    setCurrentPage(page)
    updateReadingProgress(page)
    updateCurrentChapter(page)
  }, [updateCurrentChapter])

  const handleTextSelection = () => {
    if (isReadOnly) return // Disable selection in read-only mode

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) return

    // Smart Selection: Expand to nearest word boundaries if partial word is selected
    // and if we are not crossing block boundaries significantly
    try {
      const range = selection.getRangeAt(0)
      const text = range.toString()

      // Only expand if length is reasonable (avoid expanding giant selections unexpectedly)
      if (text.length > 0 && text.length < 200) {
        // Attempt to expand start
        let startContainer = range.startContainer
        let startOffset = range.startOffset

        // If we are in a text node, verify if we split a word
        if (startContainer.nodeType === Node.TEXT_NODE && startContainer.textContent) {
          const content = startContainer.textContent
          // Regex for word char including unicode letters
          const isWordChar = (char: string) => /^\w$/.test(char) || /^[\u00C0-\u00FF]$/.test(char)

          if (startOffset > 0 &&
            isWordChar(content[startOffset - 1]) &&
            isWordChar(content[startOffset])) {

            // Walk backwards to find word start
            let newStart = startOffset
            while (newStart > 0 && isWordChar(content[newStart - 1])) {
              newStart--
            }
            range.setStart(startContainer, newStart)
          }
        }

        // Attempt to expand end
        let endContainer = range.endContainer
        let endOffset = range.endOffset

        if (endContainer.nodeType === Node.TEXT_NODE && endContainer.textContent) {
          const content = endContainer.textContent
          const isWordChar = (char: string) => /^\w$/.test(char) || /^[\u00C0-\u00FF]$/.test(char)

          // If current char is word char and prev char was word char
          // endOffset points to the char *after* the selection
          if (endOffset < content.length &&
            isWordChar(content[endOffset]) &&
            isWordChar(content[endOffset - 1])) {

            // Walk forwards to find word end
            let newEnd = endOffset
            while (newEnd < content.length && isWordChar(content[newEnd])) {
              newEnd++
            }
            range.setEnd(endContainer, newEnd)
          }
        }

        // Update selection to match our new range
        selection.removeAllRanges()
        selection.addRange(range)
      }
    } catch (e) {
      console.warn("Smart selection failed", e)
    }

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
      // Calculate absolute offsets
      try {
        const textLayer = pdfContainer.querySelector('.react-pdf__Page__textContent') || pdfContainer
        if (textLayer) {
          const spans = Array.from(textLayer.querySelectorAll('span'))
          const range = selection.getRangeAt(0)

          const getOffset = (node: Node, offset: number) => {
            let currentOffset = 0
            for (const span of spans) {
              if (span === node || span.contains(node)) {
                return currentOffset + offset
              }
              currentOffset += span.textContent?.length || 0
            }
            return 0
          }

          const start = getOffset(range.startContainer, range.startOffset)
          const end = getOffset(range.endContainer, range.endOffset)

          setSelectionRange({ start, end })
        }
      } catch (e) {
        console.warn("Failed to calculate offset", e)
        setSelectionRange(null)
      }

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
          const response = await fetch(`/api/books/${id}/notes/${editingNote.id}/update/`, {
            method: 'PATCH',
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
          // Check for overlaps with existing notes
          const currentStart = selectionRange?.start || 0
          const currentEnd = selectionRange?.end || 0

          if (currentStart < currentEnd) {
            const hasOverlap = notes.some(note => {
              // Skip check if note doesn't have valid positions or is on a different page (though notes list is likely refined, double check)
              // The `notes` state currently contains ALL notes for the book based on loadBookData logic? 
              // Let's verify loadBookData. It fetches all notes for the book.
              if (note.page !== currentPage) return false

              // 1. POSITION-BASED CHECK (If both have valid positions)
              if (typeof note.position_start === 'number' && typeof note.position_end === 'number') {
                const overlapStart = Math.max(currentStart, note.position_start)
                const overlapEnd = Math.min(currentEnd, note.position_end)

                if (overlapStart < overlapEnd) return true
              }

              // 2. TEXT-BASED FALLBACK CHECK
              const cleanSelection = selectedText.trim().toLowerCase().replace(/\s+/g, '')
              const cleanNote = note.text.trim().toLowerCase().replace(/\s+/g, '')

              if (cleanSelection.length > 5 && cleanNote.length > 5) {
                if (cleanSelection.includes(cleanNote) || cleanNote.includes(cleanSelection)) {
                  // Block only if positions look invalid (0 or missing)
                  if ((!note.position_start && !note.position_end) ||
                    (selectionRange?.start === 0 && selectionRange?.end === 0)) {
                    return true
                  }
                }
              }
              return false
            })

            if (hasOverlap) {
              toast({
                title: 'Overlap Detected',
                description: 'You have already highlighted this text area.',
                variant: 'destructive'
              })
              return // Stop execution
            }
          }

          // Create new note
          const response = await fetch(`/api/books/${id}/notes/create/`, {
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
              position_start: selectionRange?.start || 0,
              position_end: selectionRange?.end || 0
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
    if (isReadOnly) return
    try {
      const response = await fetch(`/api/books/${id}/notes/${noteId}/delete/`, {
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

  const editNote = async (note: BookNote) => {
    if (isReadOnly) return
    setEditingNote(note)
    setSelectedText(note.text)
    setNewNote(note.note)
    setHighlightColor(note.color || 'yellow')
    setShowNoteDialog(true)

    // Fetch fresh details to ensure full content (in case list view was truncated)
    try {
      const response = await fetch(`/api/books/${id}/notes/${note.id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setNewNote(data.note_content)
        setSelectedText(data.selected_text)
      }
    } catch (error) {
      console.error("Failed to fetch fresh note details", error)
    }
  }

  const shareNote = async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId)
      if (!note) return

      const response = await fetch(`/api/books/${id}/notes/${noteId}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          is_public: !note.isPublic
        })
      })

      if (response.ok) {
        const updatedIsPublic = !note.isPublic

        setNotes(prev => prev.map(n =>
          n.id === noteId ? { ...n, isPublic: updatedIsPublic } : n
        ))

        // Update selectedNote to reflect change while keeping popover open
        setSelectedNote(prev => {
          if (prev && prev.id === noteId) {
            return { ...prev, isPublic: updatedIsPublic }
          }
          return prev
        })



        toast({ title: !updatedIsPublic ? 'Note made private' : 'Note shared publicly' })
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

        // Update local state to reflect new rating
        if (bookData) {
          setBookData({
            ...bookData,
            userRating: userRating
          })
        }

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
      light: {
        bg: 'bg-[#F8FAFC]',
        text: 'text-slate-900',
        cardBg: 'bg-white',
        navBg: 'bg-white',
        border: 'border-black',
        inputBg: 'bg-white',
        inputText: 'text-black'
      },
      dark: {
        bg: 'bg-[#1a1a2e]',
        text: 'text-gray-100',
        cardBg: 'bg-[#16213e]',
        navBg: 'bg-[#0f0f23]',
        border: 'border-gray-600',
        inputBg: 'bg-[#1a1a2e]',
        inputText: 'text-gray-100'
      },
      sepia: {
        bg: 'bg-[#f4e4c1]',
        text: 'text-[#5c4033]',
        cardBg: 'bg-[#fdf5e6]',
        navBg: 'bg-[#f5e6d3]',
        border: 'border-[#8b7355]',
        inputBg: 'bg-[#fdf5e6]',
        inputText: 'text-[#5c4033]'
      }
    }
    return themes[theme]
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
                  ? 'fill-black text-black'
                  : isHalfFilled
                    ? 'fill-black/50 text-black'
                    : 'fill-muted text-gray-300'
                  }`}
              />
            </div>
          )
        })}
      </div>
    )
  }

  // Helper to render note list
  const renderNotesList = (notesList: BookNote[]) => {
    if (notesList.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <StickyNote className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-mono">No notes found</p>
        </div>
      )
    }

    return (
      <div className="divide-y-2 divide-black">
        {notesList.map((note) => {
          const colorStyles = {
            yellow: theme === 'dark' ? 'border-l-yellow-500 bg-yellow-900/20' : theme === 'sepia' ? 'border-l-amber-600 bg-amber-100' : 'border-l-amber-400 bg-amber-50',
            blue: theme === 'dark' ? 'border-l-blue-500 bg-blue-900/20' : theme === 'sepia' ? 'border-l-blue-400 bg-blue-100' : 'border-l-blue-400 bg-blue-50',
            green: theme === 'dark' ? 'border-l-green-500 bg-green-900/20' : theme === 'sepia' ? 'border-l-green-600 bg-green-100' : 'border-l-green-400 bg-green-50',
            pink: theme === 'dark' ? 'border-l-pink-500 bg-pink-900/20' : theme === 'sepia' ? 'border-l-pink-400 bg-pink-100' : 'border-l-pink-400 bg-pink-50',
          }
          const style = colorStyles[note.color || 'yellow']

          return (
            <div
              key={note.id}
              className={`p-3 transition-colors cursor-pointer border-l-[6px] group relative ${style} ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              onClick={() => setCurrentPage(note.page)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.5 border-2 rounded-lg uppercase ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : theme === 'sepia' ? 'bg-[#fdf5e6] text-[#5c4033] border-[#8b7355]' : 'bg-white text-black border-black'}`}>
                    Page {note.page}
                  </span>
                  <Badge variant="outline" className={`text-[10px] h-5 px-1 rounded-lg border-2 bg-transparent ${note.isPublic ? 'border-blue-500 text-blue-600' : 'border-gray-400 text-gray-500'}`}>
                    {note.isPublic ? 'SHARED' : 'PRIVATE'}
                  </Badge>
                </div>

                <div className={`flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] border-2 ${themeStyles.border} p-0.5 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : theme === 'sepia' ? 'bg-[#fdf5e6]' : 'bg-white'}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 rounded-lg ${themeStyles.text} hover:bg-primary hover:text-black`}
                    title="Edit"
                    onClick={(e) => { e.stopPropagation(); editNote(note) }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 hover:bg-blue-400 hover:text-black rounded-lg ${themeStyles.text}`}
                    title={note.isPublic ? "Make Private" : "Make Public"}
                    onClick={(e) => { e.stopPropagation(); shareNote(note.id) }}
                  >
                    {note.isPublic ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 hover:bg-red-400 hover:text-black rounded-lg ${themeStyles.text}`}
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className={`text-sm font-bold line-clamp-2 mb-1 font-mono ${themeStyles.text}`}>"{note.text}"</p>
              <p className={`text-xs line-clamp-3 font-mono ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-[#5c4033]/80' : 'text-gray-600'}`}>{note.note}</p>
            </div>
          )
        })}
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-mono">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-bold mb-2 uppercase">Preparing your book...</h2>
        </div>
      </div>
    )
  }

  // Error state - no book data
  if (!bookData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-mono">
        <div className="text-center max-w-md px-6">
          <h2 className="text-2xl font-bold mb-4 uppercase">Book not found</h2>
          <p className="text-gray-600 mb-8 font-mono">The book you're looking for doesn't exist or you don't have access to it.</p>
          <Button
            onClick={() => navigate('/readnex')}
            className="rounded-lg px-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase font-bold"
          >
            Back to Library
          </Button>
        </div>
      </div>
    )
  }

  const themeStyles = getThemeStyles()



  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeStyles.bg} ${theme === 'dark' ? 'dark' : ''} font-mono`}>
      <FocusTapeDeck theme={theme} />
      {/* Floating Restore Button (when navbar is hidden) */}
      <AnimatePresence>
        {!showNavbar && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-4 z-50 pointer-events-auto"
          >
            <Button
              onClick={() => setShowNavbar(true)}
              className="rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-background text-foreground border-2 border-black hover:bg-accent transition-all h-10 w-10 p-0 flex items-center justify-center"
              title="Show Menu"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Minimalist & Floating */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: showNavbar ? 0 : -200 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-none"
      >
        <div className={`max-w-6xl mx-auto flex items-center justify-between pointer-events-auto ${themeStyles.navBg} border-2 ${themeStyles.border} shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] px-6 py-2 rounded-xl`}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-lg border border-transparent hover:opacity-70 transition-all ${themeStyles.text}`}
              onClick={() => navigate('/readnex')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className={`hidden md:block h-6 w-0.5 ${theme === 'dark' ? 'bg-gray-600' : theme === 'sepia' ? 'bg-[#8b7355]' : 'bg-black'}`} />
            <div className="hidden md:block">
              <h1 className={`text-sm font-bold line-clamp-1 max-w-[200px] lg:max-w-[400px] uppercase ${themeStyles.text}`}>
                {bookData?.title}
              </h1>
              <p className={`text-xs font-bold font-mono uppercase ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-[#8b7355]' : 'text-gray-600'}`}>
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
                className={`rounded-lg border border-transparent transition-all ${themeStyles.text} hover:opacity-70`}
                title="Take Quiz"
              >
                <Target className="h-4 w-4" />
              </Button>
            )}

            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setShowSearch(true); clearResults() }}
              className={`rounded-lg border border-transparent transition-all ${themeStyles.text} hover:opacity-70`}
              title="Search Book"
            >
              <Search className="h-4 w-4" />
            </Button>



            {/* Highlight Toggle - Modern & Theme Aware */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHighlights(!showHighlights)}
              className={`rounded-lg transition-all duration-300 border ${showHighlights
                ? theme === 'dark'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                  : theme === 'sepia'
                    ? 'bg-[#e6c200]/20 text-[#5c4033] border-[#8b7355]/30'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                : `${themeStyles.text} opacity-40 hover:opacity-100 border-transparent`
                }`}
              title={showHighlights ? "Hide Highlights" : "Show Highlights"}
            >
              <Highlighter className={`h-4 w-4 ${showHighlights ? 'fill-current' : ''}`} />
            </Button>

            {/* Favorite Button - Premium & Theme Aware */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={`rounded-lg transition-all duration-300 border ${isFavorite
                ? theme === 'dark'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                  : theme === 'sepia'
                    ? 'bg-[#dba39a]/30 text-[#8a4b3e] border-[#bc8f85]/50'
                    : 'bg-rose-100 text-rose-600 border-rose-200'
                : `${themeStyles.text} hover:opacity-70 border-transparent`
                }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>

            <div className={`h-6 w-0.5 mx-1 ${theme === 'dark' ? 'bg-gray-600' : theme === 'sepia' ? 'bg-[#8b7355]' : 'bg-black'}`} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`rounded-lg border border-transparent transition-all ${themeStyles.text} hover:opacity-70`}>
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-56 rounded-xl border-2 ${themeStyles.border} shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] ${themeStyles.cardBg}`}>
                <DropdownMenuLabel className={`text-xs uppercase tracking-wider font-bold border-b-2 ${themeStyles.border} pb-2 mb-2 ${themeStyles.text}`}>Appearance</DropdownMenuLabel>
                <div className="p-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-1 p-2 border-2 transition-all rounded-lg ${theme === 'light' ? 'border-primary bg-primary text-black' : `${themeStyles.border} hover:opacity-70 ${themeStyles.text}`}`}
                  >
                    <Sun className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-1 p-2 border-2 transition-all rounded-lg ${theme === 'dark' ? 'border-primary bg-primary text-black' : `${themeStyles.border} hover:opacity-70 ${themeStyles.text}`}`}
                  >
                    <Moon className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('sepia')}
                    className={`flex flex-col items-center gap-1 p-2 border-2 transition-all rounded-lg ${theme === 'sepia' ? 'border-primary bg-primary text-black' : `${themeStyles.border} hover:opacity-70 ${themeStyles.text}`}`}
                  >
                    <Palette className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase">Sepia</span>
                  </button>
                </div>

                <DropdownMenuSeparator className={`h-0.5 my-2 ${theme === 'dark' ? 'bg-gray-600' : theme === 'sepia' ? 'bg-[#8b7355]' : 'bg-black'}`} />
                <DropdownMenuLabel className={`text-xs uppercase tracking-wider font-bold ${themeStyles.text}`}>Highlight Style</DropdownMenuLabel>
                <div className="p-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setHighlightStyle('classic')}
                    className={`flex flex-col items-center gap-1 p-2 border-2 transition-all rounded-lg ${highlightStyle === 'classic' ? 'border-primary bg-primary text-black' : `${themeStyles.border} hover:opacity-70 ${themeStyles.text}`}`}
                  >
                    <div className="h-4 w-4 bg-yellow-400/50 border border-current" />
                    <span className="text-[10px] font-bold uppercase">Classic</span>
                  </button>
                  <button
                    onClick={() => setHighlightStyle('box')}
                    className={`flex flex-col items-center gap-1 p-2 border-2 transition-all rounded-lg ${highlightStyle === 'box' ? 'border-primary bg-primary text-black' : `${themeStyles.border} hover:opacity-70 ${themeStyles.text}`}`}
                  >
                    <div className="h-4 w-4 border-2 border-dashed border-current" />
                    <span className="text-[10px] font-bold uppercase">Box</span>
                  </button>
                  <button
                    onClick={() => setHighlightStyle('glow')}
                    className={`flex flex-col items-center gap-1 p-2 border-2 transition-all rounded-lg ${highlightStyle === 'glow' ? 'border-primary bg-primary text-black' : `${themeStyles.border} hover:opacity-70 ${themeStyles.text}`}`}
                  >
                    <div className="h-4 w-4 bg-yellow-400/50 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                    <span className="text-[10px] font-bold uppercase">Glow</span>
                  </button>
                </div>

                <DropdownMenuSeparator className={`h-0.5 my-2 ${theme === 'dark' ? 'bg-gray-600' : theme === 'sepia' ? 'bg-[#8b7355]' : 'bg-black'}`} />
                <DropdownMenuLabel className={`text-xs uppercase tracking-wider font-bold ${themeStyles.text}`}>Font Size</DropdownMenuLabel>
                <div className="px-2 pb-2 flex items-center justify-between">
                  <Button variant="outline" size="icon" className={`h-8 w-8 rounded-lg border-2 ${themeStyles.border} ${themeStyles.text} hover:bg-primary hover:text-black bg-transparent`} onClick={() => setFontSize(Math.max(18, fontSize - 2))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className={`text-sm font-bold ${themeStyles.text}`}>{fontSize}px</span>
                  <Button variant="outline" size="icon" className={`h-8 w-8 rounded-lg border-2 ${themeStyles.border} ${themeStyles.text} hover:bg-primary hover:text-black bg-transparent`} onClick={() => setFontSize(Math.min(24, fontSize + 2))}>
                    <span className="text-sm font-bold">A+</span>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNavbar(false)}
              className={`rounded-lg border border-transparent transition-all ${themeStyles.text} hover:opacity-70`}
              title="Hide Navbar"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className={`w-full max-w-[100vw] mx-auto px-2 pb-2 transition-all duration-300 ${showNavbar ? 'pt-20' : 'pt-2'}`}>
        <div className={`grid grid-cols-1 gap-4 lg:gap-6 transition-all duration-500 ${sidebarOpen ? "xl:grid-cols-12" : "xl:grid-cols-1"}`}>
          {/* Main Content - Reading Area */}
          <div className={`transition-all duration-500 ${sidebarOpen ? "xl:col-span-9" : "xl:col-span-12"}`}>
            {/* Floating Toggle Button (when sidebar closed) */}
            <AnimatePresence>
              {!sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  className={`fixed right-8 z-40 transition-all duration-300 ${showNavbar ? 'top-24' : 'top-4'}`}
                >
                  <Button
                    onClick={() => setSidebarOpen(true)}
                    className="h-12 px-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-primary text-black border-2 border-black hover:bg-primary/90 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase font-bold"
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    <span className="font-bold">Notes</span>
                    <Badge variant="secondary" className="ml-2 bg-white text-black border-2 border-black rounded-lg">
                      {notes.length}
                    </Badge>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`relative border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ${themeStyles.cardBg}`}>
              {/* PDF Viewer with react-pdf */}
              {pdfUrl ? (
                <div className={`flex flex-col relative transition-all duration-300 ${showNavbar ? 'h-[calc(100vh-6rem)]' : 'h-[calc(100vh-2rem)]'}`}>
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={(pdf) => {
                      setNumPages(pdf.numPages)
                      setPdfDocument(pdf) // Capture PDF object
                      extractChapters(pdf) // Get TOC
                      if (bookData) {
                        setBookData({ ...bookData, totalPages: pdf.numPages })
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
                          <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                          <div className="h-4 w-32 bg-gray-200 border border-black"></div>
                        </div>
                      </div>
                    }
                    options={pdfOptions}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: pageDirection === 'forward' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: pageDirection === 'forward' ? -20 : 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex-1 flex justify-center items-start p-4 md:p-8 overflow-auto"
                        style={{
                          backgroundColor: theme === 'sepia' ? '#F4ECD8' : theme === 'dark' ? '#0f172a' : '#F1F5F9'
                        }}
                      >
                        {/* Wrap Page with relative positioning for overlays */}
                        <div
                          ref={pageContainerRef}
                          className="relative inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black mb-4"
                        >
                          <Page
                            pageNumber={currentPage}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="pdf-page-content"
                            width={undefined}
                            height={undefined}
                            scale={fontSize / 16}
                          />

                          {/* Highlight Overlay on top of PDF */}
                          <NoteHighlightOverlay
                            key={`${currentPage}-${fontSize}`}
                            highlightStyle={highlightStyle}
                            notes={showHighlights ? notes.filter(n => n.page === currentPage) : []}
                            currentPage={currentPage}
                            containerRef={pageContainerRef}
                            onHighlightClick={(note, position) => {
                              setSelectedNote(note)
                              const container = pageContainerRef.current

                              if (position && container) {
                                // If we have a rect, center the popover below it
                                if (position.rect) {
                                  const containerRect = container.getBoundingClientRect()
                                  const POP_WIDTH = 300 // Max width of popover
                                  const CONTAINER_PADDING = 16

                                  // Calculate relative X of click/target
                                  const targetX = position.x - containerRect.left + container.scrollLeft

                                  // Calculate ideal left position (centered on target)
                                  const idealLeft = targetX - POP_WIDTH / 2

                                  // Clamp left position within container bounds
                                  // 0 is left edge, container.scrollWidth is right edge
                                  const maxLeft = container.scrollWidth - POP_WIDTH - CONTAINER_PADDING
                                  const minLeft = CONTAINER_PADDING
                                  const clampedLeft = Math.max(minLeft, Math.min(idealLeft, maxLeft))

                                  // Calculate arrow offset relative to the popover's left edge
                                  // The arrow should point to 'targetX'
                                  // offset = targetX - clampedLeft
                                  const arrowOffset = targetX - clampedLeft

                                  setPopoverPosition({
                                    x: clampedLeft,
                                    y: position.rect.bottom - (containerRect.top + 2) + 10 + container.scrollTop,
                                    arrowOffset: arrowOffset
                                  })
                                } else {
                                  setPopoverPosition(position)
                                }
                              } else {
                                const pageElement = document.querySelector('.pdf-page-content')
                                if (pageElement) {
                                  // Fallback logic
                                  setPopoverPosition({
                                    x: 100,
                                    y: 100
                                  })
                                }
                              }
                            }}
                          />

                          {/* Temporary Blinking Highlight */}
                          <TransientHighlightOverlay
                            page={currentPage}
                            text={tempHighlight && tempHighlight.page === currentPage ? tempHighlight.text : ''}
                            activePage={currentPage}
                            containerRef={pageContainerRef}
                          />

                          {/* Note Popover - Moved internal so it scrolls with page */}
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
                            readOnly={isReadOnly}
                            theme={theme}
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </Document>

                  {/* Navigation Bar */}
                  <div className={`px-4 pr-20 py-2 border-t-4 ${themeStyles.border} flex items-center justify-between ${themeStyles.navBg} absolute bottom-0 left-0 right-0 z-20 shadow-neo-sm h-14 gap-2 sm:gap-4`}>
                    <Button
                      variant="ghost"
                      onClick={() => handlePageChange('prev')}
                      disabled={currentPage === 1}
                      className={`h-9 px-3 rounded-lg border-2 ${themeStyles.border} uppercase font-bold text-xs sm:text-sm ${themeStyles.text} hover:bg-black/5 hover:translate-y-[1px] transition-all disabled:opacity-30`}
                    >
                      <ChevronLeft className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Prev</span>
                    </Button>

                    <div className="flex items-center gap-2 sm:gap-6 flex-1 justify-center max-w-2xl px-2">
                      {/* Page Counter Compact */}
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${themeStyles.border} ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]`}>
                        <span className={`text-[10px] sm:text-xs font-bold uppercase ${themeStyles.text} opacity-60`}>Pg</span>
                        <input
                          type="number"
                          min={1}
                          max={bookData?.totalPages || 1}
                          value={currentPage}
                          onChange={(e) => {
                            const page = parseInt(e.target.value)
                            if (!isNaN(page) && page >= 1 && page <= (bookData?.totalPages || 1)) {
                              setPageDirection(page > currentPage ? 'forward' : 'backward')
                              setCurrentPage(page)
                              updateReadingProgress(page)
                            }
                            updateCurrentChapter(page)
                          }}
                          className={`w-12 text-center font-black text-sm sm:text-base bg-transparent focus:outline-none ${themeStyles.text} p-0 appearance-none m-0 leading-none h-5`}
                          style={{ lineHeight: '100%' }}
                        />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase ${themeStyles.text} opacity-60`}>/ {bookData?.totalPages || 0}</span>
                      </div>

                      <ChapterDisplay
                        chapter={currentChapter}
                        outline={outline}
                        themeStyles={themeStyles}
                        onNavigate={handleChapterNavigate}
                      />
                    </div>


                    <Button
                      variant="ghost"
                      onClick={() => handlePageChange('next')}
                      disabled={currentPage === (bookData?.totalPages || 0)}
                      className={`h-9 px-3 rounded-lg border-2 ${themeStyles.border} uppercase font-bold text-xs sm:text-sm ${themeStyles.text} hover:bg-black/5 hover:translate-y-[1px] transition-all disabled:opacity-30`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[80vh] relative flex items-center justify-center overflow-hidden bg-[#F0F0F0]">
                  {/* Background Collage */}
                  <div
                    className="absolute inset-0 z-0 opacity-40 grayscale contrast-125"
                    style={{
                      backgroundImage: 'url(/book_collage_bg.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  {/* Quirky Card */}
                  <div className="relative z-10 max-w-lg w-full p-8 bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 transition-transform hover:rotate-0 duration-300">
                    <div className="absolute -top-6 -right-6 bg-yellow-400 border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-12">
                      <span className="font-black text-xl uppercase px-2">404 Error</span>
                    </div>

                    <div className="border-b-4 border-black pb-4 mb-6">
                      <h3 className="text-4xl font-black uppercase leading-none tracking-tighter">
                        Ghost <br /> Writer?
                      </h3>
                    </div>

                    <div className="space-y-4 mb-8 font-mono font-bold text-lg">
                      <p>
                        The pages you seek have defied existence.
                      </p>
                      <p className="text-sm bg-black text-white inline-block px-2 py-1 transform -rotate-1">
                        STATUS: NOT_UPLOADED
                      </p>
                      <p className="text-gray-600 text-base">
                        "{bookData?.title}" is basically a concept art right now.
                      </p>
                    </div>

                    <Button
                      onClick={() => navigate('/readnex')}
                      className="w-full h-14 text-lg rounded-xl bg-white text-black border-4 border-black hover:bg-black hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase font-black tracking-widest"
                    >
                      Escape to Library
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
                className={`xl:col-span-3 flex flex-col gap-4 sticky transition-all duration-300 ${showNavbar ? 'top-24 h-[calc(100vh-7rem)]' : 'top-4 h-[calc(100vh-2rem)]'}`}
              >
                <div className="flex items-center justify-between mb-0 shrink-0">
                  <h2 className={`text-lg font-bold uppercase pb-1 ${themeStyles.text} border-b-2 ${themeStyles.border}`}>Reading Companion</h2>
                  <Button
                    onClick={() => setSidebarOpen(false)}
                    variant="ghost"
                    size="sm"
                    className={`rounded-lg border border-transparent uppercase font-bold ${themeStyles.text} hover:opacity-70`}
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Hide
                  </Button>
                </div>

                {/* Book Info - Compact Redesign */}
                <Card className={`shrink-0 border-2 ${themeStyles.border} shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden rounded-xl ${themeStyles.cardBg}`}>
                  <CardContent className="p-0">
                    <div className={`px-3 py-2 border-b ${themeStyles.border} ${themeStyles.navBg}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.text} opacity-70`}>Progress</span>
                        <span className={`text-xs font-bold font-mono ${themeStyles.text}`}>{bookData?.readingProgress || 0}%</span>
                      </div>
                      <Progress value={bookData?.readingProgress || 0} className={`h-2 border ${themeStyles.border} rounded-full [&>div]:bg-primary`} />
                    </div>

                    <div className={`grid grid-cols-2 divide-x ${theme === 'dark' ? 'divide-gray-600' : theme === 'sepia' ? 'divide-[#8b7355]' : 'divide-black'}`}>
                      <div className="p-2 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Clock className={`h-3.5 w-3.5 ${themeStyles.text} opacity-70`} />
                          <span className={`text-xs font-bold font-mono ${themeStyles.text}`}>{bookData?.readingTime || '0m'}</span>
                        </div>
                        <span className={`text-[9px] uppercase font-bold tracking-tight ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-[#8b7355]' : 'text-gray-500'}`}>Reading Time</span>
                      </div>

                      <div className="p-2 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 mb-0.5">
                          {renderStars(bookData?.userRating || bookData?.rating || 0)}
                          <span className={`ml-1 text-xs font-bold font-mono ${themeStyles.text}`}>{bookData?.userRating || bookData?.rating || 0}</span>
                        </div>
                        <span className={`text-[9px] uppercase font-bold tracking-tight ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-[#8b7355]' : 'text-gray-500'}`}>Rating</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>



                {/* Notes */}
                <Card className={`flex-1 min-h-0 border-2 ${themeStyles.border} shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] flex flex-col rounded-xl ${themeStyles.cardBg}`}>
                  <CardHeader className={`p-2 border-b-2 ${themeStyles.border} ${themeStyles.navBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StickyNote className={`h-4 w-4 ${themeStyles.text}`} />
                        <h3 className={`font-bold uppercase ${themeStyles.text}`}>My Notes</h3>
                        <Badge variant="secondary" className={`text-xs ${themeStyles.inputBg} ${themeStyles.inputText} border-2 ${themeStyles.border} rounded-lg`}>{notes.length}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 text-xs rounded-lg border border-transparent uppercase font-bold ${themeStyles.text} hover:opacity-70`}
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
                  <CardContent className="p-0 overflow-hidden flex-1 flex flex-col min-h-0">
                    <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                      <div className={`p-2 border-b-2 ${themeStyles.border} ${themeStyles.navBg} flex-shrink-0`}>
                        <TabsList className={`w-full grid grid-cols-3 gap-1 h-auto bg-transparent p-0`}>
                          <TabsTrigger
                            value="all"
                            className={`
                              rounded-lg border-2 font-bold uppercase text-[10px] md:text-xs py-1 transition-all
                              data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                              ${theme === 'dark'
                                ? 'border-gray-600 data-[state=active]:bg-white data-[state=active]:text-black text-gray-400 hover:text-white'
                                : theme === 'sepia'
                                  ? 'border-[#8b7355] data-[state=active]:bg-[#5c4033] data-[state=active]:text-[#fdf5e6] text-[#8b7355] hover:bg-[#8b7355]/10'
                                  : 'border-black data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 hover:bg-black/5'
                              }
                            `}
                          >
                            All
                          </TabsTrigger>
                          <TabsTrigger
                            value="private"
                            className={`
                              rounded-lg border-2 font-bold uppercase text-[10px] md:text-xs py-1 transition-all
                              data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                              ${theme === 'dark'
                                ? 'border-gray-600 data-[state=active]:bg-white data-[state=active]:text-black text-gray-400 hover:text-white'
                                : theme === 'sepia'
                                  ? 'border-[#8b7355] data-[state=active]:bg-[#5c4033] data-[state=active]:text-[#fdf5e6] text-[#8b7355] hover:bg-[#8b7355]/10'
                                  : 'border-black data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 hover:bg-black/5'
                              }
                            `}
                          >
                            Private
                          </TabsTrigger>
                          <TabsTrigger
                            value="shared"
                            className={`
                              rounded-lg border-2 font-bold uppercase text-[10px] md:text-xs py-1 transition-all
                              data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                              ${theme === 'dark'
                                ? 'border-gray-600 data-[state=active]:bg-white data-[state=active]:text-black text-gray-400 hover:text-white'
                                : theme === 'sepia'
                                  ? 'border-[#8b7355] data-[state=active]:bg-[#5c4033] data-[state=active]:text-[#fdf5e6] text-[#8b7355] hover:bg-[#8b7355]/10'
                                  : 'border-black data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 hover:bg-black/5'
                              }
                            `}
                          >
                            Shared
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="flex-1 min-h-0 bg-transparent flex flex-col w-full overflow-hidden">
                        <TabsContent value="all" className="flex-1 overflow-y-auto overflow-x-hidden m-0 !mt-0 outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent" style={{ marginTop: 0 }}>
                          {renderNotesList(notes)}
                        </TabsContent>
                        <TabsContent value="private" className="flex-1 overflow-y-auto overflow-x-hidden m-0 !mt-0 outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent" style={{ marginTop: 0 }}>
                          {renderNotesList(notes.filter(n => !n.isPublic))}
                        </TabsContent>
                        <TabsContent value="shared" className="flex-1 overflow-y-auto overflow-x-hidden m-0 !mt-0 outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent" style={{ marginTop: 0 }}>
                          {renderNotesList(notes.filter(n => n.isPublic))}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>


              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-20 xl:hidden"></div>
        </div>
      </div>

      <SearchDialog
        open={showSearch}
        onOpenChange={setShowSearch}
        onSearch={(q) => searchPdf(pdfDocument, q)}
        results={results}
        isSearching={isSearching}
        onResultClick={(page, text) => {
          setCurrentPage(page)
          // Set temporary highlight
          setTempHighlight({ page, text })
          // Clear after 4s (3 blinks * 1s + buffer)
          setTimeout(() => setTempHighlight(null), 4000)
        }}
      />


      {/* Note Dialog */}
      < Dialog open={showNoteDialog} onOpenChange={(open) => {
        setShowNoteDialog(open)
        if (!open) {
          setSelectedText("")
          setNewNote("")
          setEditingNote(null)
          setHighlightColor('yellow')
          window.getSelection()?.removeAllRanges()
        }
      }}>
        <DialogContent className="sm:max-w-[500px] rounded-xl overflow-hidden p-0 gap-0 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className={`p-6 border-b-2 ${themeStyles.border} transition-colors duration-300 ${theme === 'dark'
            ? (highlightColor === 'yellow' ? 'bg-yellow-900/30' : highlightColor === 'blue' ? 'bg-blue-900/30' : highlightColor === 'green' ? 'bg-green-900/30' : 'bg-pink-900/30')
            : (highlightColor === 'yellow' ? 'bg-amber-100' : highlightColor === 'blue' ? 'bg-blue-100' : highlightColor === 'green' ? 'bg-green-100' : 'bg-pink-100')
            }`}>
            <DialogHeader>
              <DialogTitle className={`text-lg font-bold flex items-center gap-2 uppercase ${themeStyles.text}`}>
                {editingNote ? <Edit className="h-5 w-5" /> : <StickyNote className="h-5 w-5" />}
                {editingNote ? 'Edit Note' : 'New Note'}
              </DialogTitle>
              <DialogDescription className={`${themeStyles.text} font-mono font-bold`}>
                Page {currentPage}
              </DialogDescription>
            </DialogHeader>
            <div className={`mt-4 p-3 border-2 ${themeStyles.border} text-sm font-medium italic font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-48 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : theme === 'sepia' ? 'bg-[#fdf5e6] text-[#5c4033]' : 'bg-white text-black'}`}>
              "{selectedText}"
            </div>
          </div>

          <div className={`p-6 ${themeStyles.cardBg}`}>
            <div className="flex gap-3 mb-4 justify-center">
              {(['yellow', 'blue', 'green', 'pink'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => setHighlightColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${highlightColor === color ? 'border-black scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-transparent hover:border-black hover:scale-105'
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
              className={`min-h-[150px] resize-none border-2 bg-transparent focus:ring-0 rounded-lg text-base p-4 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${themeStyles.border} ${themeStyles.text} focus:border-primary`}
            />
          </div>

          <DialogFooter className={`p-4 border-t-2 ${themeStyles.border} ${themeStyles.navBg} flex sm:justify-between items-center gap-2`}>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowNoteDialog(false)} className={`rounded-lg border-2 border-transparent uppercase font-bold ${themeStyles.text} hover:opacity-70`}>Cancel</Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(selectedText)
                  toast({ title: "Copied!", description: "Text copied to clipboard" })
                  setShowNoteDialog(false)
                }}
                className={`rounded-lg border-2 ${themeStyles.border} uppercase font-bold ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/10`}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Text
              </Button>
            </div>
            <Button onClick={saveNote} disabled={!newNote.trim()} className="rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all uppercase font-bold bg-primary text-black hover:bg-primary/90">Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Review Dialog */}
      < Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog} >
        <DialogContent className="sm:max-w-[500px] rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl uppercase font-bold">Finished!</DialogTitle>
            <DialogDescription className="text-center font-mono text-black">
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
                <Star className={`h-10 w-10 ${star <= (hoveredRating || userRating) ? 'fill-black text-black' : 'text-gray-300'
                  }`} />
              </button>
            ))}
          </div>

          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write a brief review..."
            className="mb-4 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono focus:ring-0"
          />

          <DialogFooter>
            <Button onClick={submitReview} className="w-full rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase font-bold bg-black text-white hover:bg-gray-800" disabled={userRating === 0}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  )
}
