import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  BookOpen, 
  Clock,
  Target
} from 'lucide-react'

interface ReadingSession {
  id: string
  bookId: string
  bookTitle: string
  author: string
  cover: string
  startDate: string
  lastReadDate: string
  progress: number // percentage
  pagesRead: number
  totalPages: number
  status: 'reading' | 'completed' | 'paused'
  rating?: number
}

export default function ReadingHistory() {
  const navigate = useNavigate()
  const [readingHistory, setReadingHistory] = useState<ReadingSession[]>([])
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed' | 'paused'>('all')

  useEffect(() => {
    // TODO: Fetch reading history from API
    const mockHistory: ReadingSession[] = [
      {
        id: '1',
        bookId: '1',
        bookTitle: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        cover: 'https://via.placeholder.com/120x160',
        startDate: '2024-01-15',
        lastReadDate: '2024-01-20',
        progress: 75,
        pagesRead: 135,
        totalPages: 180,
        status: 'reading',
        rating: 4
      },
      {
        id: '2',
        bookId: '2',
        bookTitle: 'Dune',
        author: 'Frank Herbert',
        cover: 'https://via.placeholder.com/120x160',
        startDate: '2024-01-10',
        lastReadDate: '2024-01-18',
        progress: 100,
        pagesRead: 688,
        totalPages: 688,
        status: 'completed',
        rating: 5
      },
      {
        id: '3',
        bookId: '3',
        bookTitle: '1984',
        author: 'George Orwell',
        cover: 'https://via.placeholder.com/120x160',
        startDate: '2024-01-05',
        lastReadDate: '2024-01-12',
        progress: 45,
        pagesRead: 148,
        totalPages: 328,
        status: 'paused'
      },
      {
        id: '4',
        bookId: '4',
        bookTitle: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        cover: 'https://via.placeholder.com/120x160',
        startDate: '2024-01-01',
        lastReadDate: '2024-01-08',
        progress: 100,
        pagesRead: 376,
        totalPages: 376,
        status: 'completed',
        rating: 5
      }
    ]

    setReadingHistory(mockHistory)
  }, [])

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
                <p className="text-xs text-muted-foreground mt-1">
                  {session.pagesRead} of {session.totalPages} pages
                </p>
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

              {session.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{session.rating}/5</span>
                </div>
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
    totalPagesRead: readingHistory.reduce((sum, s) => sum + s.pagesRead, 0),
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
              <div className="text-2xl font-bold text-primary mx-auto mb-2">📖</div>
              <div className="text-2xl font-bold text-primary">{stats.totalPagesRead.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Pages Read</div>
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
      </main>
    </div>
  )
}

