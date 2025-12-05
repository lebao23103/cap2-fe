import { useState, useEffect } from 'react'
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
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import adminService, {
  type ReportStatistics,
  type RatingStatistics,
  type AdminUser,
  type AdminBook,
  type PendingUserBook
} from '../lib/api/admin'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function AdminDashboard() {
  const { toast } = useToast()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<ReportStatistics | null>(null)
  const [ratingStats, setRatingStats] = useState<RatingStatistics | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [books, setBooks] = useState<AdminBook[]>([])
  const [pendingBooks, setPendingBooks] = useState<PendingUserBook[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // Dialog state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [newUserForm, setNewUserForm] = useState({ username: '', email: '', password: '' })
  const [editUserForm, setEditUserForm] = useState({ username: '', email: '', password: '' })

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      const [statsData, ratingData, usersData, booksData, pendingData] = await Promise.all([
        adminService.getReportStatistics().catch(() => null),
        adminService.getRatingStatistics().catch(() => null),
        adminService.listUsers().catch(() => []),
        adminService.listBooks().catch(() => []),
        adminService.listPendingUserBooks().catch(() => [])
      ])

      setStats(statsData)
      setRatingStats(ratingData)
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
    if (!confirm('Are you sure you want to delete this user?')) return
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

  // Book actions
  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return
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
    if (!confirm('Are you sure you want to reject and delete this book?')) return
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

  const openEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    setEditUserForm({ username: user.username, email: user.email, password: '' })
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
    <div className="min-h-screen bg-background relative overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <main className="container mx-auto py-8 sm:py-12 relative z-10 px-4">
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Shield className="h-8 w-8 text-black" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase">Admin Panel</h1>
                <p className="text-gray-600 font-bold">Manage users, books, and content</p>
              </div>
            </div>
            <Button
              onClick={loadDashboardData}
              className="bg-white text-black border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-primary transition-all font-bold uppercase"
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
            <Card key={index} className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 border-4 border-black ${stat.bg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                  <stat.icon className="h-6 w-6 text-black" />
                </div>
                <div>
                  <div className="text-3xl font-black text-black">{stat.value}</div>
                  <p className="text-sm text-gray-600 font-bold uppercase">{stat.label}</p>
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
                className="flex items-center gap-2 py-3 px-4 border-4 border-black bg-white data-[state=active]:bg-primary data-[state=active]:text-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase transition-all"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rating Distribution */}
              <Card className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <CardHeader className="border-b-4 border-black bg-yellow-100">
                  <CardTitle className="flex items-center gap-2 font-black uppercase">
                    <Star className="h-5 w-5" />
                    Rating Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {ratingStats?.rates ? (
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="font-bold w-4">{rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 h-6 bg-gray-100 border-2 border-black">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: `${((ratingStats.rates[rating] || 0) / Math.max(...Object.values(ratingStats.rates), 1)) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm w-8">{ratingStats.rates[rating] || 0}</span>
                        </div>
                      ))}
                      <div className="pt-4 border-t-2 border-black">
                        <p className="font-bold">Average Rating: <span className="text-xl">{ratingStats.average_rating?.toFixed(1) || '0.0'}</span></p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No rating data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Most Read Book */}
              <Card className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <CardHeader className="border-b-4 border-black bg-green-100">
                  <CardTitle className="flex items-center gap-2 font-black uppercase">
                    <TrendingUp className="h-5 w-5" />
                    Top Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {stats?.most_read_book ? (
                    <div className="p-4 border-2 border-black bg-green-50">
                      <p className="text-sm text-gray-600 font-bold uppercase mb-2">Most Read Book</p>
                      <h3 className="font-black text-lg">{stats.most_read_book.title}</h3>
                      <p className="text-gray-600">by {stats.most_read_book.author}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span className="font-bold">{stats.most_read_book.read_count} reads</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No reading data yet</p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-black bg-blue-50">
                      <p className="text-sm text-gray-600 font-bold uppercase">Total Reads</p>
                      <p className="text-2xl font-black">{stats?.total_reads || 0}</p>
                    </div>
                    <div className="p-4 border-2 border-black bg-purple-50">
                      <p className="text-sm text-gray-600 font-bold uppercase">Avg Rating</p>
                      <p className="text-2xl font-black">{stats?.average_rating?.toFixed(1) || '0.0'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <CardHeader className="border-b-4 border-black bg-blue-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-black uppercase">User Management</CardTitle>
                  <CardDescription className="font-mono">Manage all registered users</CardDescription>
                </div>
                <Button
                  onClick={() => setIsCreateUserOpen(true)}
                  className="bg-primary text-black border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No users found</p>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border-4 border-black bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-200 border-2 border-black flex items-center justify-center font-black text-xl">
                            {user.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold">{user.username}</h3>
                            <p className="text-sm text-gray-600 font-mono">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${user.is_staff ? 'bg-primary' : 'bg-gray-200'} text-black border-2 border-black rounded-none font-bold uppercase`}>
                            {user.is_staff ? 'Admin' : 'User'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditUser(user)}
                            className="border-2 border-black rounded-none"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === `deleteUser-${user.id}`}
                            className="border-2 border-black rounded-none hover:bg-red-100"
                          >
                            {actionLoading === `deleteUser-${user.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-6">
            <Card className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <CardHeader className="border-b-4 border-black bg-green-100">
                <CardTitle className="font-black uppercase">Book Management</CardTitle>
                <CardDescription className="font-mono">Manage all published books</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {books.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No books found</p>
                  ) : (
                    books.map((book) => (
                      <div key={book.id} className="flex items-center justify-between p-4 border-4 border-black bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-green-200 border-2 border-black flex items-center justify-center">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold">{book.title}</h3>
                            <p className="text-sm text-gray-600">by {book.author}</p>
                            <p className="text-xs text-gray-500 font-mono">{book.pages || 'N/A'} pages</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {book.pdf_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(book.pdf_url!, '_blank')}
                              className="border-2 border-black rounded-none"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBook(book.id)}
                            disabled={actionLoading === `deleteBook-${book.id}`}
                            className="border-2 border-black rounded-none hover:bg-red-100"
                          >
                            {actionLoading === `deleteBook-${book.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <CardHeader className="border-b-4 border-black bg-red-100">
                <CardTitle className="font-black uppercase flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Pending Book Approvals ({pendingBooks.length})
                </CardTitle>
                <CardDescription className="font-mono">Review and approve user-submitted books</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {pendingBooks.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                      <p className="text-gray-600 font-bold">No pending approvals!</p>
                      <p className="text-sm text-gray-500">All submissions have been reviewed.</p>
                    </div>
                  ) : (
                    pendingBooks.map((book) => (
                      <div key={book.id} className="p-4 border-4 border-black bg-white">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="w-16 h-20 bg-gray-200 border-2 border-black flex items-center justify-center shrink-0">
                              {book.cover_image ? (
                                <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{book.title}</h3>
                              <p className="text-gray-600">by {book.author}</p>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{book.description}</p>
                              <div className="mt-2 text-xs text-gray-500 font-mono">
                                Submitted by: {book.user?.email || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button
                              onClick={() => handleApproveBook(book.id)}
                              disabled={actionLoading === `approveBook-${book.id}`}
                              className="bg-green-400 text-black border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-green-500 transition-all font-bold uppercase"
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
                              className="border-4 border-black rounded-none hover:bg-red-100 font-bold uppercase"
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <DialogHeader className="border-b-4 border-black pb-4">
            <DialogTitle className="font-black uppercase flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User
            </DialogTitle>
            <DialogDescription className="font-mono">Add a new user to the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="font-bold uppercase">Username</Label>
              <Input
                id="username"
                value={newUserForm.username}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, username: e.target.value }))}
                className="border-2 border-black rounded-none h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold uppercase">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                className="border-2 border-black rounded-none h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-bold uppercase">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                className="border-2 border-black rounded-none h-12"
              />
            </div>
          </div>
          <DialogFooter className="border-t-4 border-black pt-4">
            <Button
              onClick={handleCreateUser}
              disabled={actionLoading === 'createUser'}
              className="w-full bg-primary text-black border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase h-12"
            >
              {actionLoading === 'createUser' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <DialogHeader className="border-b-4 border-black pb-4">
            <DialogTitle className="font-black uppercase flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User
            </DialogTitle>
            <DialogDescription className="font-mono">Update user information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username" className="font-bold uppercase">Username</Label>
              <Input
                id="edit-username"
                value={editUserForm.username}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, username: e.target.value }))}
                className="border-2 border-black rounded-none h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="font-bold uppercase">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                className="border-2 border-black rounded-none h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password" className="font-bold uppercase">New Password (leave empty to keep)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editUserForm.password}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, password: e.target.value }))}
                className="border-2 border-black rounded-none h-12"
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter className="border-t-4 border-black pt-4">
            <Button
              onClick={handleUpdateUser}
              disabled={actionLoading === 'updateUser'}
              className="w-full bg-primary text-black border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase h-12"
            >
              {actionLoading === 'updateUser' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
