import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { useToast } from '../components/ui/use-toast'
import { 
  ArrowLeft, 
  Calendar, 
  BookOpen, 
  Clock,
  Target,
  Loader2
} from 'lucide-react'
import userService, { type ReadingHistoryItem } from '../lib/api/user'

interface ReadingSession {
  id: number
  bookId: number
  bookTitle: string
  author: string
  cover: string
  startDate: string
  lastReadDate: string
  progress: number // percentage
  status: 'reading' | 'completed' | 'paused'
  notes?: string
}

export default function ReadingHistory() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [readingHistory, setReadingHistory] = useState<ReadingSession[]>([])
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed' | 'paused'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReadingHistory()
  }, [])

  const loadReadingHistory = async () => {
    try {
      setIsLoading(true)
      const historyData = await userService.getReadingHistory()
      
      // Transform API data to match component interface
      const transformedHistory: ReadingSession[] = historyData.map((item: ReadingHistoryItem) => ({
        id: item.id,
        bookId: item.book.id,
        bookTitle: item.book.title,
        author: item.book.author,
        cover: item.book.cover_image || 'https://via.placeholder.com/120x160',
        startDate: item.started_at,
        lastReadDate: item.last_read_at || item.started_at,
        progress: item.progress || 0,
        status: item.status,
        notes: item.notes
      }))

      setReadingHistory(transformedHistory)
    } catch (error) {
      console.error('Error loading reading history:', error)
      toast({
        title: 'Error',
        description: 'Failed to load reading history',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredHistory = readingHistory.filter(session => {
    if (filter === 'all') return true
    return session.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reading': return 'Currently Reading'
      case 'completed': return 'Completed'
      case 'paused': return 'Paused'
      default: return status
    }
  }

  const ReadingCard = ({ session }: { session: ReadingSession }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <img
            src={session.cover}
            alt={session.bookTitle}
            className="w-16 h-20 object-cover rounded-md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{session.bookTitle}</h3>
                <p className="text-muted-foreground">{session.author}</p>
              </div>
              <Badge
                className={`${getStatusColor(session.status)} text-white`}
              >
                {getStatusText(session.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{session.progress}%</span>
                </div>
                <Progress value={session.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Started: {new Date(session.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Last read: {new Date(session.lastReadDate).toLocaleDateString()}</span>
                </div>
              </div>

              {session.notes && (
                <p className="text-xs text-muted-foreground italic">
                  Note: {session.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const stats = {
    totalBooks: readingHistory.length,
    completedBooks: readingHistory.filter(s => s.status === 'completed').length,
    currentlyReading: readingHistory.filter(s => s.status === 'reading').length,
    averageProgress: readingHistory.length > 0
      ? Math.round(readingHistory.reduce((sum, s) => sum + s.progress, 0) / readingHistory.length)
      : 0
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4 text-gray-600 dark:text-foreground" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">Reading History</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredHistory.length} books
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.totalBooks}</div>
              <div className="text-sm text-muted-foreground">Total Books</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-500">{stats.completedBooks}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-500">{stats.currentlyReading}</div>
              <div className="text-sm text-muted-foreground">Currently Reading</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mx-auto mb-2">📊</div>
              <div className="text-2xl font-bold text-primary">{stats.averageProgress}%</div>
              <div className="text-sm text-muted-foreground">Avg Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All Books', count: readingHistory.length },
            { key: 'reading', label: 'Currently Reading', count: readingHistory.filter(s => s.status === 'reading').length },
            { key: 'completed', label: 'Completed', count: readingHistory.filter(s => s.status === 'completed').length },
            { key: 'paused', label: 'Paused', count: readingHistory.filter(s => s.status === 'paused').length }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key as 'all' | 'reading' | 'completed' | 'paused')}
              className="flex items-center gap-2"
            >
              {label}
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Reading History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all'
                ? 'Start reading some books to see your history here.'
                : `No books with status "${filter}".`
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => window.location.href = '/dashboard'}>
                Browse Books
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((session) => (
              <ReadingCard key={session.id} session={session} />
            ))}
          </div>
        )}
        </>
        )}
      </main>
    </div>
  )
}

