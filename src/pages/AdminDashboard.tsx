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
  PieChart as PieChartIcon,
  Plus,
  Upload,
  Image as ImageIcon,
  X,
  Library
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
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

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

export default function AdminDashboard() {
  const { toast } = useToast()
  const { confirm, ConfirmDialog } = useConfirmDialog()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<ReportStatistics | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [books, setBooks] = useState<AdminBook[]>([])
  const [pendingBooks, setPendingBooks] = useState<PendingUserBook[]>([])
  const [activeTab, setActiveTab] = useState('overview')

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

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      const [statsData, usersData, booksData, pendingData] = await Promise.all([
        adminService.getReportStatistics().catch(() => null),
        adminService.listUsers().catch(() => []),
        adminService.listBooks().catch(() => []),
        adminService.listPendingUserBooks().catch(() => [])
      ])

      setStats(statsData)
      setUsers(usersData)
      setBooks(booksData)
      setPendingBooks(pendingData)
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load admin dashboard data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
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
  const ratingChartData = useMemo(() => {
    if (!stats?.rating_distribution) return []; // Use stats.rating_distribution instead of ratingStats
    return Object.entries(stats.rating_distribution).map(([rating, count]) => ({
      name: `${rating} Stars`,
      count: count
    }));
  }, [stats]);

  const userRolesData = useMemo(() => {
    if (!stats?.user_roles) return [];
    return [
      { name: 'Admin', value: stats.user_roles.admin },
      { name: 'User', value: stats.user_roles.user }
    ];
  }, [stats]);

  const activityData = useMemo(() => {
    // Always generate last 7 days
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const grouped = pendingBooks.reduce((acc, book) => {
      if (!book.created_at) return acc;
      const date = book.created_at.split('T')[0]; // Assumes ISO format
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return days.map(date => ({
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      submissions: grouped[date] || 0
    }));
  }, [pendingBooks]);

  const bookDepthData = useMemo(() => {
    const depth = { 'Quick (<100p)': 0, 'Medium (100-300p)': 0, 'Deep (>300p)': 0 };
    books.forEach(b => {
      const p = b.pages || 0;
      if (p < 100) depth['Quick (<100p)']++;
      else if (p <= 300) depth['Medium (100-300p)']++;
      else depth['Deep (>300p)']++;
    });
    return Object.entries(depth).map(([name, value]) => ({ name, value }));
  }, [books]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
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
              onClick={loadDashboardData}
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
          <TabsList className="grid w-full grid-cols-4 h-auto p-0 bg-transparent gap-2">
            {[
              { value: 'overview', label: 'Overview', icon: BarChart3 },
              { value: 'users', label: 'Users', icon: Users },
              { value: 'books', label: 'Books', icon: BookOpen },
              { value: 'pending', label: 'Pending', icon: FileText }
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* TOP ROW: Activity (2/3) + Top Performer (1/3) */}

              {/* Activity Chart */}
              <Card
                className="lg:col-span-2 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                onClick={() => setActiveTab('pending')}
              >
                <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-blue-100 dark:bg-blue-900/30">
                  <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                    <TrendingUp className="h-4 w-4" />
                    Pending Submissions (7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={180} debounce={50}>
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #000',
                          borderRadius: '8px',
                          boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="submissions" stroke="#8884d8" fillOpacity={1} fill="url(#colorSubmissions)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Performer */}
              <Card className="lg:col-span-1 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl h-full flex flex-col">
                <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-green-100 dark:bg-green-900/30">
                  <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                    <TrendingUp className="h-4 w-4" />
                    Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col gap-3">
                  {stats?.most_read_book ? (
                    <div className="p-3 border-2 border-black dark:border-white bg-green-50 dark:bg-green-900/10 rounded-lg flex-1 flex flex-col justify-center">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-bold uppercase mb-1">Most Read Book</p>
                      <h3 className="font-black text-sm text-black dark:text-white line-clamp-2">{stats.most_read_book.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">by {stats.most_read_book.author}</p>
                      <div className="mt-2 text-right">
                        <Badge className="bg-black text-white text-xs px-2 py-0.5 pointer-events-none">
                          {stats.most_read_book.read_count} reads
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">No reading data yet</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 border-2 border-black dark:border-white bg-blue-50 dark:bg-blue-900/10 rounded-lg text-center">
                      <p className="text-[10px] text-gray-600 dark:text-gray-300 font-bold uppercase mb-0.5">Total Reads</p>
                      <p className="text-xl font-black text-black dark:text-white leading-none">{stats?.total_reads || 0}</p>
                    </div>
                    <div className="p-2 border-2 border-black dark:border-white bg-purple-50 dark:bg-purple-900/10 rounded-lg text-center">
                      <p className="text-[10px] text-gray-600 dark:text-gray-300 font-bold uppercase mb-0.5">Avg Rating</p>
                      <p className="text-xl font-black text-black dark:text-white leading-none">{stats?.average_rating?.toFixed(1) || '0.0'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BOTTOM ROW: User Roles (1/3) + Rating (1/3) + Content Depth (1/3) */}

              {/* User Roles */}
              <Card
                className="lg:col-span-1 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                onClick={() => setActiveTab('users')}
              >
                <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-purple-100 dark:bg-purple-900/30">
                  <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                    <PieChartIcon className="h-4 w-4" />
                    User Roles
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height={150} debounce={50}>
                    <PieChart>
                      <Pie
                        data={userRolesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userRolesData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-3 mt-2 justify-center">
                    {userRolesData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-bold text-xs">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>


              {/* Rating Distribution */}
              <Card
                className="lg:col-span-1 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                onClick={() => setActiveTab('books')}
              >
                <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-yellow-100 dark:bg-yellow-900/30">
                  <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                    <Star className="h-4 w-4" />
                    Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[220px]">
                  {ratingChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180} debounce={50}>
                      <BarChart data={ratingChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 10 }} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #000',
                          borderRadius: '8px',
                          boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                          fontSize: '11px'
                        }} />
                        <Bar dataKey="count" fill="#FFBB28" radius={[0, 4, 4, 0]} barSize={20} stroke="#000" strokeWidth={2} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Star className="h-8 w-8 mb-2 opacity-20" />
                      <p className="font-bold uppercase opacity-50 text-xs">No ratings</p>
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Content Depth */}
              <Card
                className="lg:col-span-1 border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                onClick={() => setActiveTab('books')}
              >
                <CardHeader className="py-3 px-4 border-b-4 border-black dark:border-white bg-orange-100 dark:bg-orange-900/30">
                  <CardTitle className="flex items-center gap-2 font-black uppercase text-black dark:text-white text-base">
                    <Library className="h-4 w-4" />
                    Content Depth
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={180} debounce={50}>
                    <BarChart data={bookDepthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                      <YAxis allowDecimals={false} width={25} tick={{ fontSize: 10 }} />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #000',
                          borderRadius: '8px',
                          boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="value" fill="#fb923c" radius={[4, 4, 0, 0]} stroke="#000" strokeWidth={2} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

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
                    {users.length} total users registered
                  </CardDescription>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                  {/* Search Input could go here if we add state for it */}
                  <Button
                    onClick={() => setIsCreateUserOpen(true)}
                    className="w-full sm:w-auto bg-primary text-black border-4 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-zinc-800 border-b-4 border-black dark:border-white">
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white w-[80px]">Avatar</th>
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white">User Info</th>
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white">Role</th>
                      <th className="p-4 font-black uppercase text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 font-mono">No users found.</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b-2 border-gray-100 dark:border-zinc-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors group">
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800">
                            <div className="w-10 h-10 bg-blue-200 dark:bg-blue-900 border-2 border-black dark:border-white flex items-center justify-center font-black text-lg text-black dark:text-white rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                              {user.username[0]?.toUpperCase()}
                            </div>
                          </td>
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800">
                            <h3 className="font-bold text-black dark:text-white">{user.username}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{user.email}</p>
                          </td>
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800">
                            <Badge className={`${user.is_staff ? 'bg-primary text-black' : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'} border-2 border-black dark:border-white rounded-md font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]`}>
                              {user.is_staff ? 'Admin' : 'Member'}
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
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white">Title & Author</th>
                      <th className="p-4 font-black uppercase text-sm border-r-2 border-black dark:border-white hidden sm:table-cell">Details</th>
                      <th className="p-4 font-black uppercase text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 font-mono">No books found.</td>
                      </tr>
                    ) : (
                      books.map((book) => (
                        <tr key={book.id} className="border-b-2 border-gray-100 dark:border-zinc-800 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors group">
                          <td className="p-4 border-r-2 border-gray-100 dark:border-zinc-800">
                            <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] rounded-sm overflow-hidden">
                              {book.cover_image ? (
                                <img src={getCoverImageUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-gray-400" />
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
      {/* Confirm Dialog for Delete/Reject actions */}
      <ConfirmDialog />
    </div >
  )
}
