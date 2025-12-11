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
      const transformedHistory: ReadingSession[] = historyData.map((item: ReadingHistoryItem) => {
        const totalPages = item.book_pages || 100; // Default to 100 if missing to avoid division by zero
        const progress = Math.min(Math.round((item.page_number / totalPages) * 100), 100);

        return {
          id: item.id,
          bookId: item.book_id,
          bookTitle: item.book_title,
          author: item.book_author,
          cover: item.book_cover || 'https://via.placeholder.com/120x160',
          startDate: item.created_at || item.updated_at, // Use created_at if available, else updated_at
          lastReadDate: item.updated_at || item.read_at,
          progress: progress,
          status: progress === 100 ? 'completed' : 'reading', // Infer status
          notes: '' // Notes not in history item yet
        };
      })

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
    <Card className="hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-200 border-2 border-border rounded-xl shadow-neo bg-card">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative w-16 h-20 shrink-0 border-2 border-border shadow-neo-sm">
            <img
              src={session.cover}
              alt={session.bookTitle}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-foreground uppercase line-clamp-1">{session.bookTitle}</h3>
                <p className="text-muted-foreground font-mono">{session.author}</p>
              </div>
              <Badge
                className={`${getStatusColor(session.status)} text-white rounded-md border-2 border-border font-bold uppercase shadow-neo-sm`}
              >
                {getStatusText(session.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1 font-bold font-mono text-foreground">
                  <span>Progress</span>
                  <span>{session.progress}%</span>
                </div>
                <Progress value={session.progress} className="h-4 border-2 border-border rounded-lg bg-card [&>div]:bg-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Started: {new Date(session.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last read: {new Date(session.lastReadDate).toLocaleDateString()}</span>
                </div>
              </div>

              {session.notes && (
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-border text-xs italic text-muted-foreground font-serif">
                  "{session.notes}"
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
    currentlyReading: readingHistory.filter(s => s.status === 'reading').length,
    averageProgress: readingHistory.length > 0
      ? Math.round(readingHistory.reduce((sum, s) => sum + s.progress, 0) / readingHistory.length)
      : 0
  }

  return (
    <div className="min-h-screen bg-background font-mono relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Header */}
      <header className="border-b-4 border-border bg-card relative z-10">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-transparent hover:text-primary font-bold uppercase transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4 text-foreground" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary border-2 border-border shadow-neo-sm">
                <BookOpen className="h-4 w-4 text-black" />
                <span className="font-black text-black uppercase">Reading History</span>
              </div>
            </div>
            <div className="text-sm font-bold font-mono text-foreground bg-card border-2 border-border px-3 py-1 shadow-neo-sm">
              {filteredHistory.length} books
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-4 border-border shadow-neo-lg rounded-xl bg-card">
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 text-foreground mx-auto mb-2" />
                  <div className="text-3xl font-black text-foreground">{stats.totalBooks}</div>
                  <div className="text-xs font-bold uppercase text-muted-foreground">Total Books</div>
                </CardContent>
              </Card>
              <Card className="border-4 border-border shadow-neo-lg rounded-xl bg-card">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-green-600 dark:text-green-500 mx-auto mb-2" />
                  <div className="text-3xl font-black text-green-600 dark:text-green-500">{stats.completedBooks}</div>
                  <div className="text-xs font-bold uppercase text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card className="border-4 border-border shadow-neo-lg rounded-xl bg-card">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-500 mx-auto mb-2" />
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-500">{stats.currentlyReading}</div>
                  <div className="text-xs font-bold uppercase text-muted-foreground">Reading</div>
                </CardContent>
              </Card>
              <Card className="border-4 border-border shadow-neo-lg rounded-xl bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black text-primary mx-auto mb-2">📊</div>
                  <div className="text-3xl font-black text-primary">{stats.averageProgress}%</div>
                  <div className="text-xs font-bold uppercase text-muted-foreground">Avg Progress</div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: 'All Books', count: readingHistory.length },
                { key: 'reading', label: 'Reading', count: readingHistory.filter(s => s.status === 'reading').length },
                { key: 'completed', label: 'Done', count: readingHistory.filter(s => s.status === 'completed').length },
                { key: 'paused', label: 'Paused', count: readingHistory.filter(s => s.status === 'paused').length }
              ].map(({ key, label, count }) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'outline'}
                  onClick={() => setFilter(key as 'all' | 'reading' | 'completed' | 'paused')}
                  className={`flex items-center gap-2 border-2 border-border rounded-lg font-bold uppercase transition-all shadow-neo hover:translate-y-[-1px] active:translate-y-0 active:shadow-none ${filter === key
                    ? 'bg-foreground text-background'
                    : 'bg-card text-foreground hover:bg-foreground hover:text-background'
                    }`}
                >
                  {label}
                  <Badge variant="secondary" className="ml-1 rounded-md border border-current bg-transparent text-current">
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

