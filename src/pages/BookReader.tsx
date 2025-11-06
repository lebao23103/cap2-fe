import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  FileText
} from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

// Mock book content
const mockBookData: BookData = {
  id: "1",
  title: "The Midnight Library",
  author: "Matt Haig",
  content: [
    "Between life and death there is a library. In that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices. Would you have done anything different, if you had the chance to undo your regrets?",
    
    "Nora Seed finds herself faced with this decision. Faced with the possibility of changing her life for a new one, following a different career, undoing old breakups, realizing her dreams of becoming a glaciologist; she must search within herself as she travels through the Midnight Library to decide what is truly fulfilling in life, and what makes it worth living in the first place.",
    
    "The Midnight Library is a thought-provoking novel about all the choices that go into a life well lived, from the internationally bestselling author of Reasons to Stay Alive and How To Stop Time. This book will make you think about the infinite possibilities that exist in each moment of our lives.",
    
    "What would have happened if you had taken that job offer? What if you had said yes to that date? What if you had traveled the world instead of staying home? The Midnight Library explores these what-ifs in a magical and profound way.",
    
    "Each book in the library represents a different life path, a different version of yourself. Some lives are better, some worse, but all are meaningful in their own way. The question is: which life will you choose?",
    
    "As Nora explores different possibilities, she learns valuable lessons about regret, hope, and the meaning of a life well-lived. The library becomes a place of healing and self-discovery.",
    
    "The concept of infinite lives and infinite possibilities is both overwhelming and liberating. Every choice creates a new branch in the tree of life, leading to countless variations of who we could become.",
    
    "Through her journey, Nora discovers that happiness isn't about living the perfect life, but about finding meaning and connection in the life you choose to live.",
    
    "The Midnight Library challenges our assumptions about success, happiness, and the paths we take in life. It reminds us that every life has value, regardless of how it compares to others.",
    
    "In the end, the most important choice is not which life to live, but how to live the life you have with intention, gratitude, and love."
  ],
  totalPages: 10,
  currentPage: 1,
  readingProgress: 10,
  notes: [
    {
      id: "1",
      text: "Every book provides a chance to try another life you could have lived",
      note: "This is such a profound concept - the idea that books can show us alternate versions of ourselves",
      page: 1,
      timestamp: "2024-10-01T10:30:00",
      color: "yellow",
      isPublic: false
    },
    {
      id: "2",
      text: "Between life and death there is a library",
      note: "The central metaphor of the book - so powerful!",
      page: 1,
      timestamp: "2024-10-01T11:00:00",
      color: "blue",
      isPublic: true
    }
  ],
  bookmarks: [1, 5],
  isFavorite: true,
  hasQuiz: true,
  readingTime: "4h 30m",
  rating: 4.5
}

export default function BookReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bookData, setBookData] = useState<BookData>(mockBookData)
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

  useEffect(() => {
    setIsBookmarked(bookData.bookmarks.includes(currentPage))
  }, [currentPage, bookData.bookmarks])

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentPage < bookData.totalPages) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      updateReadingProgress(nextPage)
      
      // Show review dialog when reaching the last page for the first time
      if (nextPage === bookData.totalPages && !hasSubmittedReview) {
        setTimeout(() => setShowReviewDialog(true), 500)
      }
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const updateReadingProgress = (page: number) => {
    const progress = Math.round((page / bookData.totalPages) * 100)
    setBookData(prev => ({
      ...prev,
      currentPage: page,
      readingProgress: progress
    }))
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
      setShowNoteDialog(true)
    }
  }

  const saveNote = () => {
    if (selectedText && newNote) {
      if (editingNote) {
        // Update existing note
        setBookData(prev => ({
          ...prev,
          notes: prev.notes.map(n => 
            n.id === editingNote.id 
              ? { ...n, note: newNote, color: highlightColor }
              : n
          )
        }))
        setEditingNote(null)
      } else {
        // Create new note
        const note: BookNote = {
          id: Date.now().toString(),
          text: selectedText,
          note: newNote,
          page: currentPage,
          timestamp: new Date().toISOString(),
          color: highlightColor,
          isPublic: false
        }
        
        setBookData(prev => ({
          ...prev,
          notes: [...prev.notes, note]
        }))
      }
      
      setShowNoteDialog(false)
      setSelectedText("")
      setNewNote("")
      setHighlightColor('yellow')
    }
  }

  const deleteNote = (noteId: string) => {
    setBookData(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== noteId)
    }))
  }

  const editNote = (note: BookNote) => {
    setEditingNote(note)
    setSelectedText(note.text)
    setNewNote(note.note)
    setHighlightColor(note.color || 'yellow')
    setShowNoteDialog(true)
  }

  const shareNote = (noteId: string) => {
    setBookData(prev => ({
      ...prev,
      notes: prev.notes.map(n => 
        n.id === noteId ? { ...n, isPublic: !n.isPublic } : n
      )
    }))
  }

  const submitReview = () => {
    if (userRating > 0 && reviewText.trim()) {
      // Round rating to 1 decimal place
      const roundedRating = Math.round(userRating * 10) / 10
      
      // In a real app, this would send to the backend
      console.log('Review submitted:', {
        bookId: id,
        rating: roundedRating,
        review: reviewText,
        timestamp: new Date().toISOString()
      })
      
      setHasSubmittedReview(true)
      setShowReviewDialog(false)
      
      // Show success message (you can use toast here)
      alert(`Thank you for your ${roundedRating.toFixed(1)} star review!`)
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

  // Render text with inline highlights for notes
  const renderTextWithHighlights = (text: string, pageNum: number) => {
    const pageNotes = bookData.notes.filter(note => note.page === pageNum)
    
    if (pageNotes.length === 0) {
      return text
    }

    // Sort notes by text position in content
    const sortedNotes = [...pageNotes].sort((a, b) => {
      const posA = text.indexOf(a.text)
      const posB = text.indexOf(b.text)
      return posA - posB
    })

    const parts: Array<{text: string, highlighted?: boolean, note?: BookNote}> = []
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
    setBookData(prev => ({
      ...prev,
      bookmarks: isBookmarked 
        ? prev.bookmarks.filter(page => page !== currentPage)
        : [...prev.bookmarks, currentPage]
    }))
    setIsBookmarked(!isBookmarked)
  }

  const toggleFavorite = () => {
    setBookData(prev => ({
      ...prev,
      isFavorite: !prev.isFavorite
    }))
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
                className={`h-4 w-4 transition-colors ${
                  isFilled
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
                  {bookData.title}
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  by {bookData.author}
                </p>
              </div>
            </div>
          
            <div className="flex items-center gap-2">
              <button
                onClick={toggleBookmark}
                className={`group p-2.5 rounded-lg border transition-all duration-300 ${
                  isBookmarked 
                    ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-500 shadow-sm' 
                    : 'border-transparent hover:border-amber-500/20 hover:bg-amber-500/5'
                }`}
              >
                <Bookmark className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={toggleFavorite}
                className={`group p-2.5 rounded-lg border transition-all duration-300 ${
                  bookData.isFavorite 
                    ? 'border-rose-500/30 bg-gradient-to-br from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-500 shadow-sm' 
                    : 'border-transparent hover:border-rose-500/20 hover:bg-rose-500/5'
                }`}
              >
                <Heart className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${bookData.isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              {bookData.hasQuiz && (
                <ModernButton
                  icon={Target}
                  size="sm"
                  onClick={goToQuiz}
                  className="ml-1 border-purple-500/30 bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-purple-500/5 hover:from-purple-500/25 hover:via-purple-500/20 hover:to-purple-500/10 text-purple-600 dark:text-purple-400"
                >
                  Take Quiz
                </ModernButton>
              )}
              
              {bookData.readingProgress === 100 && (
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
                  {bookData.totalPages}
                </span>
              </div>
              <div className="flex-1">
                <Progress value={bookData.readingProgress} className="h-2" />
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <span className="text-xs font-bold text-primary">
                  {bookData.readingProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content - Reading Area */}
          <div className="xl:col-span-8">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                {/* Reading Container */}
                <div className="min-h-[calc(100vh-280px)] flex flex-col">
                  {/* Text Content */}
                  <div 
                    className="flex-1 p-8 md:p-12 lg:p-16"
                    style={{ 
                      maxWidth: '65ch', 
                      marginLeft: 'auto', 
                      marginRight: 'auto',
                      width: '100%'
                    }}
                  >
                    <div 
                      className="prose prose-lg dark:prose-invert max-w-none leading-relaxed selection:bg-amber-300 selection:text-amber-950 dark:selection:bg-amber-500 dark:selection:text-white transition-all duration-300"
                      style={{ 
                        fontSize: `${fontSize}px`, 
                        lineHeight: '1.85',
                        letterSpacing: '0.015em',
                        textAlign: 'justify',
                        hyphens: 'auto',
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                      }}
                      onMouseUp={handleTextSelection}
                    >
                      {renderTextWithHighlights(bookData.content[currentPage - 1], currentPage)}
                    </div>
                  </div>
                
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
                              {bookData.totalPages}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost"
                        size="lg"
                        onClick={() => handlePageChange('next')}
                        disabled={currentPage === bookData.totalPages}
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
          
          {/* Sidebar - Reading Tools & Notes */}
          <div className="xl:col-span-4 space-y-5">
            {/* Book Info */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="pb-4 border-b border-border/30">
                <SectionHeader title="Book Details" variant="primary" />
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <StatCard 
                  icon={Clock} 
                  label="Reading Time" 
                  value={bookData.readingTime}
                  variant="primary"
                />
                
                <StatCard 
                  icon={Eye} 
                  label="Progress" 
                  value={`${bookData.readingProgress}%`}
                  variant="success"
                >
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${bookData.readingProgress}%` }}
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
                        <div>{renderStars(bookData.rating)}</div>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-foreground">{bookData.rating}</span>
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
                  badge={bookData.notes.length}
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
                {bookData.notes.map((note) => {
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
                {bookData.notes.length === 0 && (
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
                  badge={bookData.bookmarks.length}
                  variant="warning"
                />
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-2">
                  {bookData.bookmarks.map((page) => (
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
                  {bookData.bookmarks.length === 0 && (
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
          </div>
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
                    className={`group relative w-12 h-12 rounded-xl border-2 transition-all duration-300 ${
                      highlightColor === color 
                        ? 'border-foreground scale-110 shadow-lg ring-4 ring-offset-2 ring-offset-background' 
                        : 'border-border hover:scale-105 hover:border-foreground/50'
                    } ${
                      color === 'yellow' ? 'bg-gradient-to-br from-amber-300 to-amber-400 ring-amber-200' :
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
                Share your thoughts and rate "{bookData.title}" to help other readers
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
                        className={`h-10 w-10 transition-all duration-200 drop-shadow-sm ${
                          isFullStar
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
                        className={`flex-1 px-1.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                          userRating === rating
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
              <h4 className="font-semibold text-sm mb-1">{bookData.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">by {bookData.author}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{bookData.readingTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{bookData.totalPages} pages</span>
                </div>
                <div className="flex items-center gap-1">
                  <StickyNote className="h-3 w-3" />
                  <span>{bookData.notes.length} notes</span>
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
    </div>
  )
}
