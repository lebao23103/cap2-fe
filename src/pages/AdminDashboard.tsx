import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import {
  ArrowLeft,
  Users,
  BookOpen,
  Star,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  joinDate: string
  lastActive: string
  booksRead: number
  reviewsCount: number
}

interface Book {
  id: string
  title: string
  author: string
  status: 'approved' | 'pending' | 'rejected'
  submittedBy: string
  submitDate: string
  genre: string
  rating: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalReviews: 0,
    pendingApprovals: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // TODO: Fetch admin dashboard data from API
    const mockStats = {
      totalUsers: 1247,
      totalBooks: 89,
      totalReviews: 3421,
      pendingApprovals: 12
    }

    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        joinDate: '2024-01-15',
        lastActive: '2024-01-20',
        booksRead: 15,
        reviewsCount: 8
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        joinDate: '2024-01-10',
        lastActive: '2024-01-20',
        booksRead: 23,
        reviewsCount: 15
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'user',
        joinDate: '2024-01-05',
        lastActive: '2024-01-18',
        booksRead: 7,
        reviewsCount: 3
      }
    ]

    const mockBooks: Book[] = [
      {
        id: '1',
        title: 'My Amazing Story',
        author: 'John Doe',
        status: 'pending',
        submittedBy: 'john@example.com',
        submitDate: '2024-01-20',
        genre: 'Fiction',
        rating: 0
      },
      {
        id: '2',
        title: 'Science Adventures',
        author: 'Jane Smith',
        status: 'approved',
        submittedBy: 'jane@example.com',
        submitDate: '2024-01-19',
        genre: 'Science Fiction',
        rating: 4.2
      },
      {
        id: '3',
        title: 'Mystery Tales',
        author: 'Bob Johnson',
        status: 'rejected',
        submittedBy: 'bob@example.com',
        submitDate: '2024-01-18',
        genre: 'Mystery',
        rating: 0
      }
    ]

    setStats(mockStats)
    setUsers(mockUsers)
    setBooks(mockBooks)
  }, [])

  // TODO: Implement when backend is ready
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUserAction = (userId: string, action: 'approve' | 'reject' | 'delete') => {
    // TODO: API call to perform user action
    console.log(`${action} user ${userId}`)
  }

  const handleBookAction = (bookId: string, action: 'approve' | 'reject' | 'delete') => {
    // TODO: API call to perform book action
    console.log(`${action} book ${bookId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'rejected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved'
      case 'pending': return 'Pending'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-semibold">Admin Dashboard</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Administrator
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-4">
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                  <p className="text-2xl font-bold">{stats.totalBooks}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-4">
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">+5 new this week</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-4">
                <Progress value={85} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">+8% from last week</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-4">
                <Progress value={30} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Charts placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    User Roles Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Pie chart would go here</p>
                      <p className="text-sm">Showing user role distribution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Rating Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Bar chart would go here</p>
                      <p className="text-sm">Showing book rating distribution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Joined: {new Date(user.joinDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Books: {user.booksRead}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Reviews: {user.reviewsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Management</CardTitle>
                <CardDescription>Review and approve user-submitted books</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {books.map((book) => (
                    <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-sm text-muted-foreground">by {book.author}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Submitted: {new Date(book.submitDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Genre: {book.genre}
                            </span>
                            {book.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">{book.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(book.status)} text-white`}>
                          {getStatusText(book.status)}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {book.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookAction(book.id, 'approve')}
                            >
                              <UserCheck className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookAction(book.id, 'reject')}
                            >
                              <UserX className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'New user registered', time: '2 minutes ago', type: 'user' },
                      { action: 'Book approved', time: '5 minutes ago', type: 'book' },
                      { action: 'New review posted', time: '10 minutes ago', type: 'review' },
                      { action: 'User updated profile', time: '15 minutes ago', type: 'user' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Server Load</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Database Usage</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Used</span>
                        <span>23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
