import { useState, useEffect, useMemo } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover'
// Helper for relative time
function timeAgo(dateString: string | null): string {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

// Helper to getting display name (Effective Username)
function getDisplayName(user: { username: string; first_name?: string; last_name?: string; full_name?: string | null }): string {
  // If specific full_name property exists (logs), use it
  if (user.full_name) return user.full_name

  // Construct from first/last
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim()
  }

  // Fallback to formatted username (handle)
  return formatUsername(user.username)
}

// Helper to remove email domain for fallback
function formatUsername(username: string): string {
  if (username.includes('@')) {
    return username.split('@')[0]
  }
  return username
}

import { useToast } from '../components/ui/use-toast'
import {
  Users,
  BookOpen,
  Star,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Activity,
  FileText,
  UserPlus,
  Loader2,
  RefreshCw,
  Shield,
  TrendingUp,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  Flag, // NEW
  CheckSquare, // NEW
  Info // NEW
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import notesService from '../lib/api/notes' // NEW
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  // CartesianGrid, // Unused
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { Search, Download } from 'lucide-react' // NEW
import adminService, {
  type ReportStatistics,
  type AdminUser,
  type AdminBook,
  type PendingUserBook
} from '../lib/api/admin'
import { getCoverImageUrl } from '../lib/utils/mediaUtils'
import QuizManagerDialog from '@/components/QuizManagerDialog'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}



export default function AdminDashboard() {
  const { toast } = useToast()
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const { user: currentUser } = useAuth()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<ReportStatistics | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [books, setBooks] = useState<AdminBook[]>([])
  const [pendingBooks, setPendingBooks] = useState<PendingUserBook[]>([])
  const [dailyStats, setDailyStats] = useState<any[]>([]) // NEW
  const [systemLogs, setSystemLogs] = useState<any[]>([]) // NEW
  const [activeTab, setActiveTab] = useState('overview')

  const [searchTerm, setSearchTerm] = useState('') // NEW: Search State

  // Moderation state
  const [flaggedNotes, setFlaggedNotes] = useState<any[]>([])
  const [loadingFlagged, setLoadingFlagged] = useState(false)

  // Dialog state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [newUserForm, setNewUserForm] = useState({ username: '', email: '', password: '' })
  const [editUserForm, setEditUserForm] = useState({ username: '', email: '', password: '', is_staff: false })



  // Quiz Manager state
  const [isQuizManagerOpen, setIsQuizManagerOpen] = useState(false)
  const [quizBook, setQuizBook] = useState<{ id: number; title: string } | null>(null)

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Widget Dialog States
  const [isSecurityOpen, setIsSecurityOpen] = useState(false)
  const [isContributorsOpen, setIsContributorsOpen] = useState(false)

  // --- Pagination & Sorting State ---
  const ITEMS_PER_PAGE = 10
  const [userPage, setUserPage] = useState(1)
  const [bookPage, setBookPage] = useState(1)

  type SortConfig = { key: string; direction: 'asc' | 'desc' } | null
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  // Generic function to sort and paginate
  const getSortedAndPaginatedData = (data: any[], page: number) => {
    let sortedData = [...data]

    if (sortConfig) {
      sortedData.sort((a, b) => {
        // Handle nested properties (e.g., user.username) if needed, simple implementation for now
        const aValue = sortConfig.key.includes('.')
          ? sortConfig.key.split('.').reduce((o, i) => (o as any)?.[i], a)
          : a[sortConfig.key]
        const bValue = sortConfig.key.includes('.')
          ? sortConfig.key.split('.').reduce((o, i) => (o as any)?.[i], b)
          : b[sortConfig.key]

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return {
      data: sortedData.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / ITEMS_PER_PAGE)
    }
  }

  useEffect(() => {
    loadDashboardData()

    // Real-time polling every 10 seconds
    const interval = setInterval(() => {
      loadDashboardData(true)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Fetch flagged notes when tab is active
  useEffect(() => {
    if (activeTab === 'moderation') {
      fetchFlaggedNotes()
    }
  }, [activeTab])


  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)

      const [statsData, usersData, booksData, pendingData, dailyData, activityData] = await Promise.all([
        adminService.getReportStatistics().catch(() => null),
        adminService.listUsers().catch(() => []),
        adminService.listBooks().catch(() => []),
        adminService.listPendingUserBooks().catch(() => []),
        adminService.getDailyStats().catch(() => []),
        adminService.getSystemActivity().catch(() => []) // NEW
      ])

      setStats(statsData)
      setUsers(usersData)
      setBooks(booksData)
      setPendingBooks(pendingData)
      setDailyStats(dailyData)
      setSystemLogs(activityData) // NEW
    } catch (error) {
      console.error('Error loading admin data:', error)
      if (!silent) {
        toast({
          title: 'Error',
          description: 'Failed to load admin dashboard data',
          variant: 'destructive'
        })
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  // Create Book Form State
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false)
  const [newBookForm, setNewBookForm] = useState<{
    title: string;
    author: string;
    pages: string;
    cover_image: File | null;
    pdf_file: File | null;
  }>({
    title: '',
    author: '',
    pages: '',
    cover_image: null,
    pdf_file: null
  })

  // Edit Book Form State (Enhanced)
  const [isEditBookOpen, setIsEditBookOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<AdminBook | null>(null)
  const [editBookForm, setEditBookForm] = useState<{
    title: string;
    author: string;
    pages: number;
    cover_image: File | null;
    pdf_file: File | null;
  }>({
    title: '',
    author: '',
    pages: 0,
    cover_image: null,
    pdf_file: null
  })

  // Computed Data for Charts


  const topAuthorsData = useMemo(() => {
    const authorCounts = books.reduce((acc, book) => {
      acc[book.author] = (acc[book.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(authorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [books]);

  const recentUsers = useMemo(() => {
    return [...users].sort((a, b) => b.id - a.id).slice(0, 5);
  }, [users]);



  const securityStats = useMemo(() => {
    const adminCount = users.filter(u => u.is_staff).length;

    // Check for spam: users with > 3 pending books
    const userPendingCounts = pendingBooks.reduce((acc, book) => {
      const uid = book.user?.id || 0;
      acc[uid] = (acc[uid] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const potentialSpammers = Object.values(userPendingCounts).filter(count => count > 3).length;

    return {
      adminCount,
      potentialSpammers,
      status: potentialSpammers > 0 ? 'Attention' : 'Secure'
    };
  }, [users, pendingBooks]);

  // User actions
  const handleCreateUser = async () => {
    try {
      setActionLoading('createUser')
      await adminService.createUser(newUserForm)
      toast({ title: 'Success', description: 'User created successfully!' })
      setIsCreateUserOpen(false)
      setNewUserForm({ username: '', email: '', password: '' })
      loadDashboardData()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    try {
      setActionLoading('updateUser')
      await adminService.updateUser(selectedUser.id, editUserForm)
      toast({ title: 'Success', description: 'User updated successfully!' })
      setIsEditUserOpen(false)
      setSelectedUser(null)
      loadDashboardData()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    confirm({
      title: 'Delete User',
      description: 'Are you sure you want to delete this user? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setActionLoading(`deleteUser-${userId}`)
          await adminService.deleteUser(userId)
          toast({ title: 'Success', description: 'User deleted successfully!' })
          loadDashboardData()
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' })
        } finally {
          setActionLoading(null)
        }
      }
    })
  }

  // Book actions
  // Book actions
  const handleCreateBook = async () => {
    if (!newBookForm.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" })
      return
    }
    setActionLoading('createBook')
    try {
      const formData = new FormData()
      formData.append('title', newBookForm.title)
      formData.append('author', newBookForm.author)
      formData.append('pages', newBookForm.pages)
      if (newBookForm.cover_image) formData.append('cover_image', newBookForm.cover_image)
      if (newBookForm.pdf_file) formData.append('pdf_file', newBookForm.pdf_file)

      await adminService.createBook(formData)
      toast({ title: "Success", description: "Book published successfully", className: "border-2 border-black" })
      setIsCreateBookOpen(false)
      setNewBookForm({ title: '', author: '', pages: '', cover_image: null, pdf_file: null })
      loadDashboardData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to create book", variant: "destructive" })
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateBook = async () => {
    if (!selectedBook) return
    setActionLoading('updateBook')
    try {
      const formData = new FormData()
      formData.append('title', editBookForm.title)
      formData.append('author', editBookForm.author)
      formData.append('pages', editBookForm.pages.toString())
      if (editBookForm.cover_image) formData.append('cover_image', editBookForm.cover_image)
      if (editBookForm.pdf_file) formData.append('pdf_file', editBookForm.pdf_file)

      await adminService.updateBook(selectedBook.id, formData)
      toast({ title: "Success", description: "Book updated successfully", className: "border-2 border-black" })
      setIsEditBookOpen(false)
      setEditBookForm({ title: '', author: '', pages: 0, cover_image: null, pdf_file: null })
      loadDashboardData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update book", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const openEditBook = (book: AdminBook) => {
    setSelectedBook(book)
    setEditBookForm({
      title: book.title,
      author: book.author,
      pages: book.pages || 0,
      cover_image: null,
      pdf_file: null
    })
    setIsEditBookOpen(true)
  }

  const openQuizManager = (book: AdminBook) => {
    setQuizBook({ id: book.id, title: book.title })
    setIsQuizManagerOpen(true)
  }

  const handleDeleteBook = async (bookId: number) => {
    confirm({
      title: 'Delete Book',
      description: 'Are you sure you want to delete this book? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setActionLoading(`deleteBook-${bookId}`)
          await adminService.deleteBook(bookId)
          toast({ title: 'Success', description: 'Book deleted successfully!' })
          loadDashboardData()
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to delete book', variant: 'destructive' })
        } finally {
          setActionLoading(null)
        }
      }
    })
  }

  // UserBook moderation

  const fetchFlaggedNotes = async () => {
    setLoadingFlagged(true)
    try {
      const data = await notesService.getFlaggedNotes()
      setFlaggedNotes(data)
    } catch (error) {
      console.error("Failed to fetch flagged notes", error)
    } finally {
      setLoadingFlagged(false)
    }
  }

  const handleModerateNote = async (noteId: number, action: 'restore' | 'delete') => {
    try {
      await notesService.moderateNote(noteId, action)
      toast({
        title: action === 'restore' ? "Note Restored" : "Note Deleted",
        description: action === 'restore' ? "The note is now visible again." : "The note has been permanently removed.",
        variant: action === 'delete' ? 'destructive' : 'default'
      })
      fetchFlaggedNotes()
    } catch (e) {
      toast({ title: "Action Failed", variant: "destructive" })
    }
  }

  const handleApproveBook = async (userBookId: number) => {
    try {
      setActionLoading(`approveBook-${userBookId}`)
      await adminService.approveUserBook(userBookId)
      toast({ title: 'Success', description: 'Book approved and published!' })
      loadDashboardData()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve book', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectBook = async (bookId: number) => {
    confirm({
      title: 'Reject Book',
      description: 'Are you sure you want to reject and delete this book? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Reject & Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setActionLoading(`rejectBook-${bookId}`)
          await adminService.rejectUserBook(bookId)
          toast({ title: 'Success', description: 'Book rejected and deleted!' })
          loadDashboardData()
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to reject book', variant: 'destructive' })
        } finally {
          setActionLoading(null)
        }
      }
    })
  }

  const openEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    setEditUserForm({ username: user.username, email: user.email, password: '', is_staff: user.is_staff })
    setIsEditUserOpen(true)
  }

  // Filtered Data (memoized to avoid recalculation) - MUST be before early return
  const filteredUsers = useMemo(() => users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ), [users, searchTerm])

  const filteredBooks = useMemo(() => books.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  ), [books, searchTerm])

  // Memoized paginated data (avoids calling getSortedAndPaginatedData multiple times in JSX)
  const paginatedUsers = useMemo(() =>
    getSortedAndPaginatedData(filteredUsers, userPage),
    [filteredUsers, userPage, sortConfig]
  )

  const paginatedBooks = useMemo(() =>
    getSortedAndPaginatedData(filteredBooks, bookPage),
    [filteredBooks, bookPage, sortConfig]
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // Helper: Export to CSV
  const handleExportCSV = (data: any[], filename: string) => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-mono selection:bg-primary selection:text-black">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <main className="container mx-auto py-8 sm:py-12 relative z-10 px-4">
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <Shield className="h-8 w-8 text-black" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase text-black dark:text-white">Admin Panel</h1>
                <p className="text-gray-600 dark:text-gray-300 font-bold">Manage users, books, and content</p>
              </div>
            </div>
            <Button
              onClick={() => loadDashboardData()}
              className="bg-white dark:bg-zinc-800 text-black dark:text-white border-4 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black transition-all font-bold uppercase"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div {...fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats?.total_users || 0, icon: Users, bg: 'bg-blue-400' },
            { label: 'Total Books', value: stats?.total_books || 0, icon: BookOpen, bg: 'bg-green-400' },
            { label: 'Total Reviews', value: stats?.total_reviews || 0, icon: Star, bg: 'bg-yellow-400' },
            { label: 'Pending Approvals', value: pendingBooks.length, icon: FileText, bg: 'bg-red-400' }
          ].map((stat, index) => (
            <Card key={index} className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-xl hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 border-4 border-black dark:border-white ${stat.bg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]`}>
                  <stat.icon className="h-6 w-6 text-black" />
                </div>
                <div>
                  <div className="text-3xl font-black text-black dark:text-white">{stat.value}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto p-0 bg-transparent gap-2">
            {[
              { value: 'overview', label: 'Overview', icon: BarChart3 },
              { value: 'users', label: 'Users', icon: Users },
              { value: 'books', label: 'Books', icon: BookOpen },
              { value: 'pending', label: 'Pending', icon: FileText },
              { value: 'moderation', label: 'Moderation', icon: Flag } // NEW
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] font-bold uppercase transition-all"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-6">

              {/* ROW 1: Priority Queue (2/3) + Security Monitor (1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Pending Approvals Queue */}
                <Card className="lg:col-span-2 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl overflow-hidden">
                  <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-red-100 dark:bg-red-900/30 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                      <FileText className="h-4 w-4" />
                      Pending Approvals Queue
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('pending')} className="text-xs font-bold uppercase hover:bg-red-200 dark:hover:bg-red-900/50">
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {pendingBooks.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 dark:bg-zinc-800 border-b-2 border-black dark:border-white">
                            <tr>
                              <th className="p-3 font-black uppercase text-[10px] text-gray-500">Book</th>
                              <th className="p-3 font-black uppercase text-[10px] text-gray-500">User</th>
                              <th className="p-3 font-black uppercase text-[10px] text-gray-500">Date</th>
                              <th className="p-3 font-black uppercase text-[10px] text-gray-500 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingBooks.slice(0, 5).map((book) => (
                              <tr key={book.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                <td className="p-3 font-bold truncate max-w-[150px]">{book.title}</td>
                                <td className="p-3 text-xs">{book.user?.username}</td>
                                <td className="p-3 text-xs font-mono">{new Date(book.created_at).toLocaleDateString()}</td>
                                <td className="p-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    {book.pdf_file && (
                                      <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-100" onClick={() => window.open(book.pdf_file || '', '_blank')}>
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleApproveBook(book.id)}>
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleRejectBook(book.id)}>
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                        <CheckCircle className="h-10 w-10 mb-2 opacity-20 text-green-500" />
                        <p className="font-bold uppercase opacity-50 text-xs">All caught up!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Security Monitor */}
                <Card
                  className="lg:col-span-1 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => setIsSecurityOpen(true)}
                >
                  <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-blue-100 dark:bg-blue-900/30">
                    <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                      <Shield className="h-4 w-4" />
                      Security Monitor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 border-2 border-black rounded-lg bg-gray-50">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-500">System Status</p>
                        <p className={`font-black text-lg ${securityStats.status === 'Secure' ? 'text-green-600' : 'text-red-600'}`}>{securityStats.status}</p>
                      </div>
                      <Shield className={`h-8 w-8 ${securityStats.status === 'Secure' ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 text-center border-2 border-black rounded-lg">
                        <p className="text-[10px] font-bold uppercase text-gray-500">Admins</p>
                        <p className="font-black text-xl">{securityStats.adminCount}</p>
                      </div>
                      <div className="p-2 text-center border-2 border-black rounded-lg">
                        <p className="text-[10px] font-bold uppercase text-gray-500">Alerts</p>
                        <p className="font-black text-xl text-red-500">{securityStats.potentialSpammers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ROW 2: Trend Watch (1/3) + Traffic Peaks (1/3) + Top Authors (1/3) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Trend Watch (Top Book) */}
                <Card className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl flex flex-col">
                  <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-yellow-100 dark:bg-yellow-900/30">
                    <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                      <TrendingUp className="h-4 w-4" />
                      Trend Watch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex-1 flex flex-col justify-center">
                    {stats?.most_read_book ? (
                      <div className="text-center space-y-2">
                        <Badge className="bg-black text-white hover:bg-gray-800 text-[10px] mb-2 pointer-events-none">MOST READ</Badge>
                        <h3 className="font-black text-lg leading-tight uppercase line-clamp-2">{stats.most_read_book.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">by {stats.most_read_book.author}</p>
                        <div className="pt-2">
                          <span className="text-3xl font-black">{stats.most_read_book.read_count}</span>
                          <span className="text-xs font-bold uppercase text-gray-500 ml-1">Reads</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 font-bold uppercase text-xs">No Data Available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Daily Growth Trend (Replaces Traffic Peaks) */}
                <Card className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl">
                  <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-green-100 dark:bg-green-900/30">
                    <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                      <TrendingUp className="h-4 w-4" />
                      Daily Growth
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white">
                            <Info className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                          <h4 className="font-black uppercase text-xs mb-2 border-b-2 border-gray-100 dark:border-zinc-800 pb-1">Chart Details</h4>
                          <ul className="space-y-2 text-xs font-mono">
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#8884d8] mt-1 shrink-0" />
                              <div>
                                <span className="font-bold">New Users:</span>
                                <p className="text-gray-500">Signups per day.</p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#82ca9d] mt-1 shrink-0" />
                              <div>
                                <span className="font-bold">Activity:</span>
                                <p className="text-gray-500">Total actions (Reviews + Books + Notes).</p>
                              </div>
                            </li>
                          </ul>
                        </PopoverContent>
                      </Popover>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={dailyStats}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(val) => val.slice(5)} interval={1} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '2px solid black' }} />
                        <Area type="monotone" dataKey="new_users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} name="New Users" />
                        <Area type="monotone" dataKey="interactions" stroke="#82ca9d" fillOpacity={1} fill="url(#colorInteractions)" strokeWidth={2} name="Activity" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p className="text-center text-[10px] font-bold text-gray-500 uppercase mt-2">14-Day Performance</p>
                  </CardContent>
                </Card>

                {/* Top Authors */}
                <Card
                  className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => setIsContributorsOpen(true)}
                >
                  <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-indigo-100 dark:bg-indigo-900/30">
                    <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                      <Star className="h-4 w-4" />
                      Top Contributors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart layout="vertical" data={topAuthorsData} margin={{ left: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '2px solid black' }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} stroke="#000" strokeWidth={2} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

              </div>

              {/* ROW 3: New Members (1/3) + Activity Logs (2/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Users */}
                <Card className="lg:col-span-1 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl">
                  <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-purple-100 dark:bg-purple-900/30">
                    <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                      <UserPlus className="h-4 w-4" />
                      New Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {recentUsers.map(user => {
                        return (
                          <div key={user.id} className="p-3 flex items-center gap-3 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-purple-200 border-2 border-black flex items-center justify-center font-black text-sm relative">
                              {getDisplayName(user).charAt(0).toUpperCase()}
                              {/* Online Status Dot */}
                              {/* Online Status Dot */}
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="flex flex-col">
                                <span className="text-sm font-black truncate">{getDisplayName(user)}</span>
                                <span className="text-[10px] text-gray-500 truncate font-mono">{user.email}</span>
                              </div>
                            </div>
                            {user.is_staff ? (
                              <Badge className="bg-black text-white text-[10px]">ADMIN</Badge>
                            ) : (
                              <Badge className="bg-white border-2 border-black text-black text-[10px] hover:bg-gray-100">MEMBER</Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* System Live Logs (Aggregated) */}
                <Card className="col-span-1 lg:col-span-2 border-4 border-black dark:border-white bg-black text-white shadow-[4px_4px_0px_0px_rgba(128,128,128,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl overflow-hidden flex flex-col">
                  <CardHeader className="py-3 px-4 border-b-2 border-zinc-800 flex flex-row items-center justify-between bg-zinc-900">
                    <CardTitle className="flex items-center gap-2 font-mono text-sm uppercase text-green-400">
                      <Activity className="h-4 w-4" />
                      {'>'} System_Live_Logs
                      <span className="animate-pulse">_</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-green-400 border-green-400 text-[10px] font-mono uppercase bg-transparent">
                      Real-time
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 h-[300px] overflow-y-auto custom-scrollbar bg-black text-green-400 font-mono text-xs p-4">
                    {systemLogs.length > 0 ? (
                      <div className="space-y-1">
                        {systemLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-4 border-b border-green-900/30 pb-1 mb-1">
                            <span className="opacity-50 min-w-[140px]">{new Date(log.timestamp).toLocaleString()}</span>
                            <div className="flex-1">
                              {log.type === 'user_join' && (
                                <span>
                                  <span className="text-white font-bold hover:underline cursor-help" title={log.user}>{getDisplayName({ ...log, username: log.user })}</span>
                                  <span className="ml-1">joined the party ðŸŽ‰</span>
                                </span>
                              )}
                              {log.type === 'book_submit' && (
                                <span>
                                  <span className="text-white font-bold hover:underline cursor-help" title={log.user}>{getDisplayName({ ...log, username: log.user })}</span>
                                  <span className="ml-1">submitted <span className="text-yellow-400">"{log.details.title}"</span></span>
                                </span>
                              )}
                              {log.type === 'review' && (
                                <span>
                                  <span className="text-white font-bold hover:underline cursor-help" title={log.user}>{getDisplayName({ ...log, username: log.user })}</span>
                                  <span className="ml-1">reviewed <span className="text-blue-400">"{log.details.book}"</span> ({log.details.rating}â˜…)</span>
                                </span>
                              )}
                              {log.type === 'flag' && (
                                <span>
                                  <span className="text-red-500 font-bold">ALERT:</span>
                                  <span className="text-white font-bold hover:underline cursor-help ml-1" title={log.user}>{getDisplayName({ ...log, username: log.user })}</span>
                                  <span className="ml-1">reported a note in <span className="text-red-400">"{log.details.book}"</span></span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-gray-400 h-full">
                        <Activity className="h-8 w-8 mb-2 opacity-20" />
                        <p className="font-bold uppercase opacity-50 text-xs">Waiting for activity...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

            </div>
          </TabsContent>


          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-xl overflow-hidden">
              <CardHeader className="border-b-4 border-black dark:border-white bg-blue-100 dark:bg-blue-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-black uppercase text-black dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription className="font-mono text-gray-600 dark:text-gray-300">
                    {filteredUsers.length} active users
                  </CardDescription>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                  <div className="relative flex-1 sm:w-auto">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-black dark:text-gray-300" />
                    <Input
                      placeholder="SEARCH USERS..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setUserPage(1); }} // Reset page on search
                      className="pl-9 h-10 w-full sm:w-[250px] border-2 border-black dark:border-white bg-white dark:bg-zinc-800 font-bold uppercase placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
                    />
                  </div>
                  <Button size="sm" variant="outline" className="h-10 border-2 border-black dark:border-white font-black uppercase bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all" onClick={() => handleExportCSV(users, 'users_export')}>
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                  <Button
                    onClick={() => setIsCreateUserOpen(true)}
                    className="w-full sm:w-auto bg-primary text-black border-4 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    New User
                  </Button>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-zinc-800 border-b-4 border-black dark:border-white">
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white w-[80px]">Avatar</th>
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('id')}>
                        ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? 'â†‘' : 'â†“')}
                      </th>
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('username')}>
                        User Info {sortConfig?.key === 'username' && (sortConfig.direction === 'asc' ? 'â†‘' : 'â†“')}
                      </th>
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white hidden sm:table-cell cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('email')}>
                        Contact {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? 'â†‘' : 'â†“')}
                      </th>
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white w-[100px] cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('is_staff')}>
                        Role {sortConfig?.key === 'is_staff' && (sortConfig.direction === 'asc' ? 'â†‘' : 'â†“')}
                      </th>
                      <th className="p-4 font-black uppercase text-sm text-right w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">No users found.</td>
                      </tr>
                    ) : (
                      paginatedUsers.data.map((user) => (
                        <tr key={user.id} className="border-b-2 border-gray-100 dark:border-zinc-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors group">
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800">
                            <div className="relative">
                              <div className="w-10 h-10 bg-blue-200 dark:bg-blue-900 border-2 border-black dark:border-white flex items-center justify-center font-black text-lg text-black dark:text-white rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                                {getDisplayName(user)[0]?.toUpperCase()}
                              </div>
                              {/* Online Status Indicator */}
                              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`} title={user.is_online ? 'Online' : 'Offline'} />
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold border-r-2 border-gray-100 dark:border-zinc-800 text-gray-500">#{user.id}</td>
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-bold text-black dark:text-white">{getDisplayName(user)}</div>
                                <div className="text-xs text-gray-400 font-mono">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800 hidden sm:table-cell">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-mono truncate max-w-[200px]">{user.email}</span>
                              <span className="text-[10px] text-gray-500 font-bold uppercase">Last Seen: {timeAgo(user.last_login)}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Joined: {timeAgo(user.date_joined)}</span>
                            </div>
                          </td>
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800">
                            <Badge className={`${user.is_staff ? 'bg-black text-white' : 'bg-white text-black'} border-2 border-black dark:border-white rounded-md font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] text-[10px]`}>
                              {user.is_staff ? 'ADMIN' : 'MEMBER'}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditUser(user)}
                                className="h-8 w-8 p-0 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={actionLoading === `deleteUser-${user.id}`}
                                className="h-8 w-8 p-0 border-2 border-black dark:border-white rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 bg-white dark:bg-zinc-800 text-red-600"
                              >
                                {actionLoading === `deleteUser-${user.id}` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* User Pagination */}
              {paginatedUsers.totalPages > 1 && (
                <div className="p-4 border-t-4 border-black dark:border-white flex items-center justify-between bg-gray-50 dark:bg-zinc-900/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="border-2 border-black dark:border-white font-bold uppercase disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <span className="font-mono font-bold text-xs uppercase">
                    Page {userPage} of {paginatedUsers.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserPage(p => Math.min(paginatedUsers.totalPages, p + 1))}
                    disabled={userPage === paginatedUsers.totalPages}
                    className="border-2 border-black dark:border-white font-bold uppercase disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-6">
            <Card className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-xl overflow-hidden">
              <CardHeader className="border-b-4 border-black dark:border-white bg-green-100 dark:bg-green-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-black uppercase text-black dark:text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Book Inventory
                  </CardTitle>
                  <CardDescription className="font-mono text-gray-600 dark:text-gray-300">
                    {books.length} books published
                  </CardDescription>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                  <div className="relative flex-1 sm:w-auto">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-black dark:text-gray-300" />
                    <Input
                      placeholder="SEARCH BOOKS..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setBookPage(1); }} // Reset page on search
                      className="pl-9 h-10 w-full sm:w-[250px] border-2 border-black dark:border-white bg-white dark:bg-zinc-800 font-bold uppercase placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
                    />
                  </div>
                  <Button size="sm" variant="outline" className="h-10 border-2 border-black dark:border-white font-black uppercase bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all" onClick={() => handleExportCSV(books, 'books_export')}>
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                  <Button
                    onClick={() => setIsCreateBookOpen(true)}
                    className="w-full sm:w-auto bg-green-400 text-black border-4 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-zinc-800 border-b-4 border-black dark:border-white">
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white w-[60px]">Cover</th>
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('title')}>
                        Title & Author {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? 'â†‘' : 'â†“')}
                      </th>
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white hidden sm:table-cell cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('pages')}>
                        Details {sortConfig?.key === 'pages' && (sortConfig.direction === 'asc' ? 'â†‘' : 'â†“')}
                      </th>
                      <th className="p-4 font-black uppercase text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBooks.data.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 font-mono">No books found.</td>
                      </tr>
                    ) : (
                      paginatedBooks.data.map((book) => (
                        <tr key={book.id} className="border-b-2 border-gray-100 dark:border-zinc-800 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors group">
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800">
                            <div className="w-20 h-28 bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] rounded-sm overflow-hidden">
                              {book.cover_image ? (
                                <img src={getCoverImageUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800">
                            <h3 className="font-bold text-black dark:text-white line-clamp-1">{book.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-mono line-clamp-1">by {book.author}</p>
                          </td>
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800 hidden sm:table-cell">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 border border-black dark:border-white text-xs font-bold font-mono">
                              {book.pages || '?'} pgs
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {book.pdf_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(book.pdf_url!, '_blank')}
                                  className="h-8 w-8 p-0 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-blue-50"
                                  title="View PDF"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openQuizManager(book)}
                                className="h-8 w-8 p-0 border-2 border-black dark:border-white rounded-lg bg-blue-100 dark:bg-blue-900/30 text-black dark:text-white hover:bg-blue-200"
                                title="Manage Quiz"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditBook(book)}
                                className="h-8 w-8 p-0 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBook(book.id)}
                                disabled={actionLoading === `deleteBook-${book.id}`}
                                className="h-8 w-8 p-0 border-2 border-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 bg-white dark:bg-zinc-800 text-red-600"
                              >
                                {actionLoading === `deleteBook-${book.id}` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Book Pagination */}
              {paginatedBooks.totalPages > 1 && (
                <div className="p-4 border-t-4 border-black dark:border-white flex items-center justify-between bg-gray-50 dark:bg-zinc-900/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookPage(p => Math.max(1, p - 1))}
                    disabled={bookPage === 1}
                    className="border-2 border-black dark:border-white font-bold uppercase disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <span className="font-mono font-bold text-xs uppercase">
                    Page {bookPage} of {paginatedBooks.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookPage(p => Math.min(paginatedBooks.totalPages, p + 1))}
                    disabled={bookPage === paginatedBooks.totalPages}
                    className="border-2 border-black dark:border-white font-bold uppercase disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-xl overflow-hidden">
              <CardHeader className="border-b-4 border-black dark:border-white bg-red-100 dark:bg-red-900/30">
                <CardTitle className="font-black uppercase flex items-center gap-2 text-black dark:text-white">
                  <Activity className="h-5 w-5" />
                  Pending Book Approvals ({pendingBooks.length})
                </CardTitle>
                <CardDescription className="font-mono text-gray-600 dark:text-gray-300">
                  Review and approve user-submitted books
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {pendingBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <CheckCircle className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-mono text-lg font-bold">All caught up!</p>
                    <p className="text-sm">No pending books to review.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pendingBooks.map((book) => (
                      <div key={book.id} className="p-4 border-4 border-black dark:border-white bg-white dark:bg-zinc-800 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex gap-4 w-full">
                            <div className="w-20 h-28 bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                              {book.cover_image ? (
                                <img src={getCoverImageUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-lg text-black dark:text-white line-clamp-1">{book.title}</h3>
                              <p className="text-gray-600 dark:text-gray-300 font-bold">by {book.author}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 font-mono bg-gray-50 dark:bg-zinc-900/50 p-2 rounded border border-black/10 dark:border-white/10">
                                {book.description || "No description provided."}
                              </p>
                              <div className="mt-2 text-xs text-gray-500 font-mono flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Submitted by: <span className="font-bold text-black dark:text-white">{book.user?.email || 'Unknown'}</span>
                                <span className="text-gray-300">|</span>
                                <span>{new Date(book.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                            {book.pdf_file && (
                              <Button
                                variant="outline"
                                onClick={() => window.open(book.pdf_file || '', '_blank')}
                                className="flex-1 sm:flex-none border-4 border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:translate-y-[-1px] font-bold uppercase transition-all text-xs sm:text-sm"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View File
                              </Button>
                            )}
                            <Button
                              onClick={() => handleApproveBook(book.id)}
                              disabled={actionLoading === `approveBook-${book.id}`}
                              className="flex-1 sm:flex-none bg-green-400 text-black border-4 border-black dark:border-white rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-green-500 hover:translate-y-[-1px] transition-all font-bold uppercase text-xs sm:text-sm"
                            >
                              {actionLoading === `approveBook-${book.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleRejectBook(book.id)}
                              disabled={actionLoading === `rejectBook-${book.id}`}
                              className="flex-1 sm:flex-none border-4 border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:translate-y-[-1px] font-bold uppercase transition-all text-xs sm:text-sm"
                            >
                              {actionLoading === `rejectBook-${book.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-xl overflow-hidden">
              <CardHeader className="border-b-4 border-black dark:border-white bg-red-800 text-white">
                <CardTitle className="font-black uppercase flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Content Moderation Queue ({flaggedNotes.length})
                </CardTitle>
                <CardDescription className="font-mono text-gray-200">
                  Review flagged and hidden notes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loadingFlagged ? (
                  <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>
                ) : flaggedNotes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">No flagged content!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {flaggedNotes.map((note) => (
                      <div key={note.id} className="border-4 border-black dark:border-white p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start bg-white dark:bg-zinc-800 shadow-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={note.status === 'hidden' ? 'destructive' : 'outline'} className="uppercase font-black tracking-wider">
                              {note.status}
                            </Badge>
                            <span className="text-xs font-bold text-gray-500">Reported {note.awful_count} times</span>
                            <span className="text-xs font-mono text-gray-400">| User: {note.user}</span>
                          </div>
                          <p className="font-serif italic text-lg mb-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border-l-4 border-yellow-400">
                            "{note.content}"
                          </p>
                          <p className="text-xs text-gray-400 font-mono">Book: {note.book_title} | Date: {new Date(note.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold border-2 border-transparent"
                            onClick={() => handleModerateNote(note.id, 'restore')}
                          >
                            <CheckSquare className="h-4 w-4 mr-2" /> RESTORE
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="font-bold border-2 border-transparent"
                            onClick={() => handleModerateNote(note.id, 'delete')}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> DELETE
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="border-4 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900 text-black dark:text-white">
          <DialogHeader className="border-b-4 border-black dark:border-white pb-4">
            <DialogTitle className="font-black uppercase flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User
            </DialogTitle>
            <DialogDescription className="font-mono text-gray-600 dark:text-gray-300">Add a new user to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username" className="font-bold uppercase text-black dark:text-white">Username</Label>
                <Input
                  id="username"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white"
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold uppercase text-black dark:text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white"
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-bold uppercase text-black dark:text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <DialogFooter className="border-t-4 border-black dark:border-white pt-4">
              <Button
                type="submit"
                disabled={actionLoading === 'createUser'}
                className="w-full bg-primary text-black border-4 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase h-12"
              >
                {actionLoading === 'createUser' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="border-4 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900 text-black dark:text-white">
          <DialogHeader className="border-b-4 border-black dark:border-white pb-4">
            <DialogTitle className="font-black uppercase flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User
            </DialogTitle>
            <DialogDescription className="font-mono text-gray-600 dark:text-gray-300">Update user information</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username" className="font-bold uppercase text-black dark:text-white">Username</Label>
                <Input
                  id="edit-username"
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white"
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email" className="font-bold uppercase text-black dark:text-white">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white"
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password" className="font-bold uppercase text-black dark:text-white">New Password (leave empty to keep)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_staff"
                  checked={editUserForm.is_staff}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, is_staff: e.target.checked }))}
                  className="h-5 w-5 border-2 border-black rounded-md"
                />
                <Label htmlFor="is_staff" className="font-bold uppercase text-black dark:text-white cursor-pointer">
                  Grant Admin Access
                </Label>
              </div>
            </div>
            <DialogFooter className="border-t-4 border-black dark:border-white pt-4">
              <Button
                type="submit"
                disabled={actionLoading === 'updateUser'}
                className="w-full bg-primary text-black border-4 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase h-12"
              >
                {actionLoading === 'updateUser' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>



      {/* Create Book Dialog */}
      < Dialog open={isCreateBookOpen} onOpenChange={setIsCreateBookOpen} >
        <DialogContent className="border-4 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900 text-black dark:text-white sm:max-w-[900px]">
          <DialogHeader className="border-b-4 border-black dark:border-white pb-4">
            <DialogTitle className="font-black uppercase flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Book
            </DialogTitle>
            <DialogDescription className="font-mono text-gray-600 dark:text-gray-300">
              Upload a new book to the library
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateBook(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              {/* Left Column: Book Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5" />
                  <h3 className="font-black uppercase text-lg">Book Details</h3>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-title" className="font-bold uppercase text-black dark:text-white">Title</Label>
                  <Input id="new-title" value={newBookForm.title} onChange={(e) => setNewBookForm(prev => ({ ...prev, title: e.target.value }))} className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="Enter book title..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-author" className="font-bold uppercase text-black dark:text-white">Author</Label>
                  <Input id="new-author" value={newBookForm.author} onChange={(e) => setNewBookForm(prev => ({ ...prev, author: e.target.value }))} className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="Enter author name..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-pages" className="font-bold uppercase text-black dark:text-white">Pages</Label>
                  <Input id="new-pages" type="number" value={newBookForm.pages} onChange={(e) => setNewBookForm(prev => ({ ...prev, pages: e.target.value }))} className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="0" />
                </div>
              </div>

              {/* Right Column: Key Assets */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-5 w-5" />
                  <h3 className="font-black uppercase text-lg">Assets</h3>
                </div>

                {/* Cover Image Uploader */}
                <div className="grid gap-2">
                  <Label className="font-bold uppercase text-black dark:text-white">Cover Image</Label>
                  <div
                    className="relative w-full h-64 border-4 border-dashed border-black dark:border-white bg-gray-50 dark:bg-zinc-800/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors overflow-hidden group"
                    onClick={() => document.getElementById('new-cover-input')?.click()}
                  >
                    {newBookForm.cover_image ? (
                      <>
                        <img src={URL.createObjectURL(newBookForm.cover_image)} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-full border-2 border-white shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewBookForm(prev => ({ ...prev, cover_image: null }));
                              // Reset input value if needed (though state null handles it, input value persist is issue if re-adding same file, but simple clear is enough for UX)
                              const input = document.getElementById('new-cover-input') as HTMLInputElement;
                              if (input) input.value = '';
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <ImageIcon className="h-10 w-10 opacity-50" />
                        <span className="font-mono text-sm font-bold">Click to upload cover</span>
                      </div>
                    )}
                    {/* Hover Overlay */}
                    {!newBookForm.cover_image && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <input
                      id="new-cover-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setNewBookForm(prev => ({ ...prev, cover_image: e.target.files?.[0] || null }))}
                    />
                  </div>
                </div>

                {/* PDF Uploader */}
                <div className="grid gap-2">
                  <Label className="font-bold uppercase text-black dark:text-white">Content (PDF)</Label>
                  <div
                    className={`h-16 border-2 border-black dark:border-white rounded-lg flex items-center px-4 gap-3 cursor-pointer transition-colors relative group ${newBookForm.pdf_file ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-zinc-800 hover:bg-gray-50'}`}
                    onClick={() => document.getElementById('new-pdf-input')?.click()}
                  >
                    <FileText className="h-5 w-5 shrink-0" />
                    <div className="flex-1 w-0 mr-10">
                      <p className="font-bold text-sm truncate">{newBookForm.pdf_file ? newBookForm.pdf_file.name : 'No PDF selected'}</p>
                      <p className="text-xs text-gray-500 font-mono italic truncate">{newBookForm.pdf_file ? `${(newBookForm.pdf_file.size / 1024 / 1024).toFixed(2)} MB` : 'Click to upload PDF document'}</p>
                    </div>
                    {/* Upload Icon (Default) or Remove Button (If file selected) */}
                    {newBookForm.pdf_file ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-full shadow-sm absolute right-4 z-10 opacity-100 hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewBookForm(prev => ({ ...prev, pdf_file: null }));
                          const input = document.getElementById('new-pdf-input') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Upload className="h-4 w-4 shrink-0 text-gray-400 absolute right-4" />
                    )}

                    <input
                      id="new-pdf-input"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setNewBookForm(prev => ({ ...prev, pdf_file: e.target.files?.[0] || null }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t-4 border-black dark:border-white pt-4">
              <Button type="submit" disabled={actionLoading === 'createBook'} className="w-full bg-green-400 text-black border-4 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase h-12">
                {actionLoading === 'createBook' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Publish Book'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog >

      {/* Edit Book Dialog */}
      < Dialog open={isEditBookOpen} onOpenChange={setIsEditBookOpen} >
        <DialogContent className="border-4 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900 text-black dark:text-white sm:max-w-[900px]">
          <DialogHeader className="border-b-4 border-black dark:border-white pb-4">
            <DialogTitle className="font-black uppercase flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Book
            </DialogTitle>
            <DialogDescription className="font-mono text-gray-600 dark:text-gray-300">Update book details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            {/* Left Column: Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5" />
                <h3 className="font-black uppercase text-lg">Details</h3>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-book-title" className="font-bold uppercase text-black dark:text-white">Title</Label>
                <Input
                  id="edit-book-title"
                  value={editBookForm.title}
                  onChange={(e) => setEditBookForm(prev => ({ ...prev, title: e.target.value }))}
                  className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-book-author" className="font-bold uppercase text-black dark:text-white">Author</Label>
                <Input
                  id="edit-book-author"
                  value={editBookForm.author}
                  onChange={(e) => setEditBookForm(prev => ({ ...prev, author: e.target.value }))}
                  className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-book-pages" className="font-bold uppercase text-black dark:text-white">Pages</Label>
                <Input
                  id="edit-book-pages"
                  type="number"
                  value={editBookForm.pages}
                  onChange={(e) => setEditBookForm(prev => ({ ...prev, pages: parseInt(e.target.value) || 0 }))}
                  className="border-2 border-black dark:border-white rounded-lg h-12 bg-white dark:bg-zinc-800 text-black dark:text-white"
                />
              </div>
            </div>

            {/* Right Column: Assets */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5" />
                <h3 className="font-black uppercase text-lg">Assets</h3>
              </div>

              {/* Cover Image Uploader */}
              <div className="grid gap-2">
                <Label className="font-bold uppercase text-black dark:text-white">Cover Image</Label>
                <div
                  className="relative w-full h-64 border-4 border-dashed border-black dark:border-white bg-gray-50 dark:bg-zinc-800/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors overflow-hidden group"
                  onClick={() => document.getElementById('edit-cover-input')?.click()}
                >
                  {editBookForm.cover_image ? (
                    <>
                      <img src={URL.createObjectURL(editBookForm.cover_image)} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 z-10">
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 rounded-full border-2 border-white shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditBookForm(prev => ({ ...prev, cover_image: null }));
                            const input = document.getElementById('edit-cover-input') as HTMLInputElement;
                            if (input) input.value = '';
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : selectedBook?.cover_image ? (
                    <>
                      <img src={getCoverImageUrl(selectedBook.cover_image)} alt="Current Cover" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 z-10">
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 rounded-full border-2 border-white shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <ImageIcon className="h-10 w-10 opacity-50" />
                      <span className="font-mono text-sm font-bold">Click to upload cover</span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  {!editBookForm.cover_image && !selectedBook?.cover_image && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <input
                    id="edit-cover-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setEditBookForm(prev => ({ ...prev, cover_image: e.target.files?.[0] || null }))}
                  />
                </div>
              </div>

              {/* PDF Uploader */}
              <div className="grid gap-2">
                <Label className="font-bold uppercase text-black dark:text-white">Content (PDF)</Label>
                <div
                  className={`h-16 border-2 border-black dark:border-white rounded-lg flex items-center px-4 gap-3 cursor-pointer transition-colors relative group ${editBookForm.pdf_file ? 'bg-green-100 dark:bg-green-900/30' : selectedBook?.pdf_url ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-zinc-800 hover:bg-gray-50'}`}
                  onClick={() => document.getElementById('edit-pdf-input')?.click()}
                >
                  <FileText className="h-5 w-5 shrink-0" />
                  <div className="flex-1 w-0 mr-10">
                    <p className="font-bold text-sm truncate">{editBookForm.pdf_file ? editBookForm.pdf_file.name : (selectedBook?.pdf_url ? decodeURIComponent(selectedBook.pdf_url.split('/').pop() || 'Existing PDF') : 'No PDF selected')}</p>
                    <p className="text-xs text-gray-500 font-mono italic truncate">{editBookForm.pdf_file ? `${(editBookForm.pdf_file.size / 1024 / 1024).toFixed(2)} MB` : (selectedBook?.pdf_url ? 'Click to replace existing PDF' : 'Click to upload PDF document')}</p>
                  </div>
                  {/* Upload Icon (Default) or Remove Button (If file selected) */}
                  {editBookForm.pdf_file ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full shadow-sm absolute right-4 z-10 opacity-100 hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditBookForm(prev => ({ ...prev, pdf_file: null }));
                        const input = document.getElementById('edit-pdf-input') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Upload className="h-4 w-4 shrink-0 text-gray-400 absolute right-4" />
                  )}

                  <input
                    id="edit-pdf-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setEditBookForm(prev => ({ ...prev, pdf_file: e.target.files?.[0] || null }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t-4 border-black dark:border-white pt-4">
            <Button
              onClick={handleUpdateBook}
              disabled={actionLoading === 'updateBook'}
              className="w-full bg-primary text-black border-4 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase h-12"
            >
              {actionLoading === 'updateBook' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
      {/* Quiz Manager Dialog */}
      < QuizManagerDialog
        bookId={quizBook?.id || null
        }
        bookTitle={quizBook?.title || ''}
        open={isQuizManagerOpen}
        onOpenChange={setIsQuizManagerOpen}
      />

      {/* Security Monitor Dialog */}
      <Dialog open={isSecurityOpen} onOpenChange={setIsSecurityOpen}>
        <DialogContent className="max-w-2xl border-4 border-black dark:border-white bg-white dark:bg-zinc-900 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black uppercase text-2xl">
              <Shield className="h-6 w-6 text-blue-600" />
              Security Details
            </DialogTitle>
            <DialogDescription>
              Detailed view of system administrators and potential security alerts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <h3 className="font-bold uppercase text-sm border-b-2 border-black pb-1">Administrators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {users.filter(u => u.is_staff).map(admin => (
                  <div key={admin.id} className="p-2 border border-gray-200 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs font-bold">A</div>
                      <span className="text-sm font-bold">{admin.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${admin.is_superuser ? 'text-purple-600' : 'text-gray-500'}`}>
                        {admin.is_superuser ? 'Superuser' : 'Staff'}
                      </span>
                      {/* HIERARCHY RULE: 
                           Backend enforces "Root Admin" protection (403 Forbidden). 
                           Frontend optimistically shows "Revoke" for Superusers. 
                       */}
                      {currentUser?.is_superuser && currentUser?.email !== admin.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] uppercase border-black hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                          onClick={() => {
                            setIsSecurityOpen(false);
                            setSelectedUser(admin);
                            setEditUserForm({
                              username: admin.username,
                              email: admin.email,
                              password: '',
                              is_staff: admin.is_staff
                            });
                            setIsEditUserOpen(true);
                          }}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold uppercase text-sm border-b-2 border-black pb-1 text-red-600">Pending Limit Alerts</h3>
              {Object.entries(pendingBooks.reduce((acc, book) => {
                const uid = book.user?.id || 0;
                if (!acc[uid]) acc[uid] = { user: book.user, count: 0 };
                acc[uid].count++;
                return acc;
              }, {} as Record<number, { user: any, count: number }>))
                .filter(([_, data]) => data.count > 3)
                .map(([uid, data]) => (
                  <div key={uid} className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-500">
                    <div>
                      <p className="font-bold text-sm">{data.user?.username || 'Unknown'}</p>
                      <p className="text-xs text-red-600 font-bold">{data.count} Pending Submissions</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setIsSecurityOpen(false);
                        const userToEdit = users.find(u => u.id === Number(uid));
                        if (userToEdit) {
                          setSelectedUser(userToEdit);
                          setEditUserForm({
                            username: userToEdit.username,
                            email: userToEdit.email,
                            password: '',
                            is_staff: userToEdit.is_staff
                          });
                          setIsEditUserOpen(true);
                        }
                      }}
                      className="h-8 text-xs uppercase font-bold"
                    >
                      Manage User
                    </Button>
                  </div>
                ))}
              {Object.values(pendingBooks.reduce((acc, book) => {
                const uid = book.user?.id || 0;
                acc[uid] = (acc[uid] || 0) + 1;
                return acc;
              }, {} as Record<number, number>)).every(c => c <= 3) && (
                  <p className="text-sm text-gray-500 italic">No alerts detected. System is secure.</p>
                )}
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Top Contributors Dialog */}
      <Dialog open={isContributorsOpen} onOpenChange={setIsContributorsOpen}>
        <DialogContent className="max-w-2xl border-4 border-black dark:border-white bg-white dark:bg-zinc-900 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black uppercase text-2xl">
              <Star className="h-6 w-6 text-yellow-500" />
              Contributor Details
            </DialogTitle>
            <DialogDescription>
              Breakdown of top authors and their library contributions.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            {topAuthorsData.map((author, idx) => (
              <div key={idx} className="border-2 border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-lg">{author.name}</h3>
                  <Badge className="bg-yellow-400 text-black border border-black">{author.count} Books</Badge>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">Recent Contributions</p>
                  <ul className="space-y-1">
                    {books.filter(b => b.author === author.name).slice(0, 3).map(book => (
                      <li key={book.id} className="text-sm truncate flex items-center gap-2">
                        <BookOpen className="h-3 w-3 text-gray-400" />
                        {book.title}
                      </li>
                    ))}
                    {books.filter(b => b.author === author.name).length > 3 && (
                      <li className="text-xs text-gray-400 italic font-bold pl-5">
                        + {books.filter(b => b.author === author.name).length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog for Delete/Reject actions */}
      <ConfirmDialog />
    </div >
  )
}

