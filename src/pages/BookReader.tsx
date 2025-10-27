import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Bookmark, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  StickyNote,
  Highlighter,
  Volume2,
  Play,
  Pause,
  ArrowLeft,
  Target,
  Eye,
  Clock,
  Star
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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

interface BookNote {
  id: string
  text: string
  note: string
  page: number
  timestamp: string
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
      timestamp: "2024-10-01T10:30:00"
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
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setIsBookmarked(bookData.bookmarks.includes(currentPage))
  }, [currentPage, bookData.bookmarks])

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentPage < bookData.totalPages) {
      setCurrentPage(prev => prev + 1)
      updateReadingProgress(currentPage + 1)
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
      const note: BookNote = {
        id: Date.now().toString(),
        text: selectedText,
        note: newNote,
        page: currentPage,
        timestamp: new Date().toISOString()
      }
      
      setBookData(prev => ({
        ...prev,
        notes: [...prev.notes, note]
      }))
      
      setShowNoteDialog(false)
      setSelectedText("")
      setNewNote("")
    }
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
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-ink-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-parchment-100 dark:bg-ink-900 border-b border-parchment-200 dark:border-ink-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/readnex')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold text-ink-900 dark:text-parchment-100">
                {bookData.title}
              </h1>
              <p className="text-sm text-ink-600 dark:text-parchment-400">
                by {bookData.author}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBookmark}
              className={isBookmarked ? 'text-amber-600' : ''}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={bookData.isFavorite ? 'text-red-600' : ''}
            >
              <Heart className={`h-4 w-4 ${bookData.isFavorite ? 'fill-current' : ''}`} />
            </Button>
            
            {bookData.hasQuiz && (
              <Button variant="outline" size="sm" onClick={goToQuiz}>
                <Target className="h-4 w-4 mr-2" />
                Take Quiz
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Reading Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFontSize(14)}>
                  Small Font
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFontSize(16)}>
                  Medium Font
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFontSize(18)}>
                  Large Font
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-600 dark:text-parchment-400">
              Page {currentPage} of {bookData.totalPages}
            </span>
            <Progress value={bookData.readingProgress} className="flex-1" />
            <span className="text-sm text-ink-600 dark:text-parchment-400">
              {bookData.readingProgress}%
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg max-w-none text-justify leading-relaxed"
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                  onMouseUp={handleTextSelection}
                >
                  {bookData.content[currentPage - 1]}
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {bookData.totalPages}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === bookData.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Book Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{bookData.readingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{bookData.readingProgress}% Complete</span>
                </div>
                {renderStars(bookData.rating)}
              </CardContent>
            </Card>
            
            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <StickyNote className="h-5 w-5" />
                  My Notes ({bookData.notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookData.notes.map((note) => (
                  <div key={note.id} className="border-l-4 border-amber-400 pl-3 py-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      "{note.text}"
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {note.note}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Page {note.page} • {new Date(note.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {bookData.notes.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No notes yet. Select text to add a note.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Bookmarks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Bookmarks ({bookData.bookmarks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bookData.bookmarks.map((page) => (
                    <Button
                      key={page}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setCurrentPage(page)}
                    >
                      Page {page}
                    </Button>
                  ))}
                  {bookData.bookmarks.length === 0 && (
                    <p className="text-sm text-gray-500">No bookmarks yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add your thoughts about the selected text passage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Selected Text:</label>
              <p className="text-sm bg-muted p-3 rounded-md mt-2">
                "{selectedText}"
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Your Note:</label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add your thoughts about this passage..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNoteDialog(false)
                setSelectedText("")
                setNewNote("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveNote} disabled={!newNote.trim()}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}