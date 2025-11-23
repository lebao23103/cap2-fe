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
      // First check if we have notes in localStorage
      const localNotes = localStorage.getItem(`book_notes_${id}`);
      if (localNotes) {
        try {
          const parsedNotes = JSON.parse(localNotes);
          setNotes(parsedNotes);
        } catch (e) {
          console.error('Error parsing local notes:', e);
        }
      }
      
      loadBookData();
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
        }).then(res => res.json()).catch(() => {
          // Fallback to localStorage if API fails
          const localNotes = localStorage.getItem(`book_notes_${id}`);
          return localNotes ? JSON.parse(localNotes) : [];
        }),
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

      const transformedNotes = bookNotes.map((note: any) => ({
        id: note.id?.toString() || Date.now().toString(), // Generate ID if not provided
        text: note.selected_text,
        note: note.note_content,
        page: note.page_number || 1,
        timestamp: note.created_at || new Date().toISOString(),
        color: note.color === '#FFEB3B' ? 'yellow' : note.color === '#2196F3' ? 'blue' : note.color === '#4CAF50' ? 'green' : 'pink',
        isPublic: note.is_public
      }));

      setNotes(transformedNotes)
      
      // Save to localStorage as backup
      localStorage.setItem(`book_notes_${id}`, JSON.stringify(transformedNotes));
      
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

        // Get more precise position information
        const selection = window.getSelection()
        let positionStart = 0
        let positionEnd = selectedText.length

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          // We'll store the text content of the start container to help with matching later
          const startContainerText = range.startContainer.textContent || ''
          const endContainerText = range.endContainer.textContent || ''
          
          // Calculate relative positions within the container
          positionStart = range.startOffset
          positionEnd = range.endOffset
        }

        // Create the new note object
        const newNoteObj = {
          id: Date.now().toString(), // Generate a unique ID
          text: selectedText,
          note: newNote,
          page: currentPage,
          timestamp: new Date().toISOString(),
          color: highlightColor,
          isPublic: false,
          position_start: positionStart,
          position_end: positionEnd
        };

        if (editingNote) {
          // Update existing note
          try {
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
            } else {
              throw new Error('Failed to update note on server')
            }
          } catch (error) {
            // Fallback to localStorage
            console.log('Server update failed, saving to localStorage')
            const updatedNotes = notes.map(note => 
              note.id === editingNote.id ? { ...note, note: newNote, color: highlightColor } : note
            );
            setNotes(updatedNotes);
            localStorage.setItem(`book_notes_${id}`, JSON.stringify(updatedNotes));
            toast({ title: 'Note updated!', description: 'Your note has been updated locally' })
          }
          setEditingNote(null)
        } else {
          // Create new note
          try {
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
                position_start: positionStart,
                position_end: positionEnd
              })
            })

            if (response.ok) {
              await loadBookData()
              toast({ title: 'Note saved!', description: 'Your note has been saved' })
            } else {
              throw new Error('Failed to save note to server')
            }
          } catch (error) {
            // Fallback to localStorage
            console.log('Server save failed, saving to localStorage')
            const updatedNotes = [...notes, newNoteObj];
            setNotes(updatedNotes);
            localStorage.setItem(`book_notes_${id}`, JSON.stringify(updatedNotes));
            toast({ title: 'Note saved!', description: 'Your note has been saved locally' })
          }
        }

        setShowNoteDialog(false)
        setSelectedText("")
        setNewNote("")
        setHighlightColor('yellow')
        // Clear browser text selection
        window.getSelection()?.removeAllRanges()
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
        // Update localStorage
        const updatedNotes = notes.filter(n => n.id !== noteId);
        localStorage.setItem(`book_notes_${id}`, JSON.stringify(updatedNotes));
        toast({ title: 'Note deleted', description: 'Your note has been removed' })
      } else {
        throw new Error('Failed to delete note on server')
      }
    } catch (error) {
      // Fallback to localStorage
      console.log('Server delete failed, removing from localStorage')
      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);
      localStorage.setItem(`book_notes_${id}`, JSON.stringify(updatedNotes));
      toast({ title: 'Note deleted', description: 'Your note has been removed locally' })
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
        const updatedNotes = notes.map(n =>
          n.id === noteId ? { ...n, isPublic: !n.isPublic } : n
        );
        setNotes(updatedNotes);
        // Update localStorage
        localStorage.setItem(`book_notes_${id}`, JSON.stringify(updatedNotes));
        toast({ title: note.isPublic ? 'Note made private' : 'Note shared publicly' })
      } else {
        throw new Error('Failed to update note on server')
      }
    } catch (error) {
      // Fallback to localStorage
      console.log('Server update failed, updating localStorage')
      const note = notes.find(n => n.id === noteId)
      if (!note) return
      
      const updatedNotes = notes.map(n =>
        n.id === noteId ? { ...n, isPublic: !n.isPublic } : n
      );
      setNotes(updatedNotes);
      localStorage.setItem(`book_notes_${id}`, JSON.stringify(updatedNotes));
      toast({ title: note.isPublic ? 'Note made private' : 'Note shared publicly', description: 'Updated locally' })
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
                        <span>Page {part.note.page}</span>
                        <span>•</span>
                        <span>{new Date(part.note.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs hover:bg-blue-50 dark:hover:bg-blue-950/30 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (part.note) {
                              editNote(part.note)
                            }
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (part.note) {
                              deleteNote(part.note.id)
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )
          }
          return part.text
        })}
      </>
    )
  }

  const toggleBookmark = async () => {
    if (!bookData) return

    try {
      const isCurrentlyBookmarked = bookData.bookmarks?.includes(currentPage)

      const response = await fetch(`http://127.0.0.1:8000/api/books/${id}/bookmarks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          page_number: currentPage,
          action: isCurrentlyBookmarked ? 'remove' : 'add'
        })
      })

      if (response.ok) {
        const updatedBookmarks = isCurrentlyBookmarked
          ? bookData.bookmarks.filter(page => page !== currentPage)
          : [...(bookData.bookmarks || []), currentPage]

        setBookData(prev => prev ? {
          ...prev,
          bookmarks: updatedBookmarks
        } : null)

        setIsBookmarked(!isCurrentlyBookmarked)

        toast({
          title: isCurrentlyBookmarked ? 'Bookmark removed' : 'Page bookmarked',
          description: isCurrentlyBookmarked
            ? 'This page is no longer bookmarked'
            : 'This page has been bookmarked'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update bookmark',
        variant: 'destructive'
      })
    }
  }

  const toggleFavorite = async () => {
    if (!bookData) return

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/books/${id}/favorite/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const newFavoriteStatus = !isFavorite
        setIsFavorite(newFavoriteStatus)

        toast({
          title: newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites',
          description: newFavoriteStatus
            ? 'This book has been added to your favorites'
            : 'This book has been removed from your favorites'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorite status',
        variant: 'destructive'
      })
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getThemeStyles().bg} ${getThemeStyles().text}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  onClick={() => navigate('/readnex')}
                  variant="ghost"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Library</span>
                </Button>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Settings</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Reading Settings</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setTheme('light')}>
                        <Sun className="h-4 w-4 mr-2" />
                        Light Theme
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('dark')}>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark Theme
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('sepia')}>
                        <Palette className="h-4 w-4 mr-2" />
                        Sepia Theme
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorite}
                    className={isFavorite ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground hover:text-foreground"}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleBookmark}
                    className={isBookmarked ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-foreground"}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{bookData?.title}</h1>
                  <p className="text-muted-foreground">by {bookData?.author}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <span className="font-semibold">{currentPage}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{bookData?.totalPages || 0}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {renderStars(bookData?.rating || 0)}
                  </div>
                </div>
              </div>
            </div>

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
                            </div>
                          </div>

                          {/* Note Content */}
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {note.note}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Page {note.page}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(note.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editNote(note);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(note.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Hover indicator */}
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className={`w-2 h-2 rounded-full ${style.accent}`} />
                          </div>
                        </div>
                      )
                    })}

                    {notes.length === 0 && (
                      <div className="text-center py-8">
                        <div className="inline-block p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
                          <StickyNote className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-semibold mb-1">No notes yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Highlight text in the PDF and add your first note
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Notes Button (when sidebar is closed) */}
          {!sidebarOpen && (
            <AnimatePresence>
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
            </AnimatePresence>
          )}
        </div>

        {/* Note Dialog */}
        <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>
                Highlight some text and add a note to it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground">Selected Text:</p>
                <p className="text-sm text-foreground font-semibold">
                  "{selectedText}"
                </p>
              </div>
              <Textarea
                placeholder="Write your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="resize-none"
              />
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground">Highlight Color:</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHighlightColor('yellow')}
                    className={`w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-500/30 ${highlightColor === 'yellow' ? 'ring-2 ring-amber-500' : ''}`}
                  />
                  <button
                    onClick={() => setHighlightColor('blue')}
                    className={`w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-500/30 ${highlightColor === 'blue' ? 'ring-2 ring-blue-500' : ''}`}
                  />
                  <button
                    onClick={() => setHighlightColor('green')}
                    className={`w-6 h-6 rounded-full bg-green-200 dark:bg-green-500/30 ${highlightColor === 'green' ? 'ring-2 ring-green-500' : ''}`}
                  />
                  <button
                    onClick={() => setHighlightColor('pink')}
                    className={`w-6 h-6 rounded-full bg-pink-200 dark:bg-pink-500/30 ${highlightColor === 'pink' ? 'ring-2 ring-pink-500' : ''}`}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveNote} className="w-full">
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your thoughts about this book.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="relative">
                      <Star
                        className={`h-4 w-4 transition-colors ${hoveredRating >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-muted text-muted-foreground/20'
                          }`}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setUserRating(star)}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-foreground">
                  {userRating > 0 ? `${userRating} stars` : 'Rate this book'}
                </p>
              </div>
              <Textarea
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowReviewDialog(false)}
              >
                Maybe Later
              </Button>
              <Button
                onClick={submitReview}
                disabled={userRating === 0 || reviewText.trim().length < 10}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0 shadow-md hover:shadow-lg"
              >
                Submit Review
              </Button>
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
    </div>
  )
}