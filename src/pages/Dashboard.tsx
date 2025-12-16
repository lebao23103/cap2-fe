
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import BookCard, { type BookData } from '../components/ui/book-card'
import { useToast } from '../components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import {
  BookOpen,
  Heart,
  MessageCircle,
  StickyNote,
  Loader2,
  ArrowRight,
  Clock,
  Save,
  User,
  Lock,
  Settings,
  Sparkles,
  Zap,
  Play,
  Globe
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import userService from '../lib/api/user'
import booksService from '../lib/api/books'
import notesService from '../lib/api/notes'
import { getCoverImageUrl } from '../lib/utils/mediaUtils'

import { Upload, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '@/lib/animations'

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [recommendations, setRecommendations] = useState<BookData[]>([])
  const [favorites, setFavorites] = useState<BookData[]>([])
  const [readingHistory, setReadingHistory] = useState<BookData[]>([])
  const [userNotes, setUserNotes] = useState<any[]>([])
  const [myUploads, setMyUploads] = useState<(BookData & { status: 'approved' | 'pending' | 'rejected' })[]>([])

  // Dashboard Metrics
  const [stats, setStats] = useState({
    booksRead: 0,
    readingCount: 0,
    favoritesCount: 0,
    notesCount: 0
  })

  const [isLoading, setIsLoading] = useState(true)

  // Profile editing state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })

  // Password Change State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Initialize edit form when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      })
    }
  }, [user])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)


      const [booksData, favoritesData, historyData, notesStats, allUserNotes, myBooksData] = await Promise.all([
        booksService.getApprovedBooks().catch(() => []),
        userService.getFavorites().catch(() => []),
        userService.getReadingHistory().catch(() => []),
        notesService.getUserNotesStatistics().catch(() => ({ total_notes: 0 })),
        notesService.getAllUserNotes().catch(() => []),
        booksService.getMyBooks().catch(() => [])
      ])

      setUserNotes(allUserNotes || [])

      // Process My Uploads (Using new API)
      const transformedMyBooks = myBooksData.map((book: any) => ({
        id: book.id.toString(),
        title: book.title,
        author: book.author || 'Unknown Author',
        cover: getCoverImageUrl(book.cover_image),
        rating: book.rating || 0,
        genre: book.subject ? [book.subject] : ['General'],
        status: (book.is_approved ? 'approved' : 'pending') as 'approved' | 'pending' | 'rejected' // Determine status from is_approved flag
      }))

      setMyUploads(transformedMyBooks)

      const transformedRecommendations: BookData[] = booksData
        .filter((book: any) => book && book.id && book.title)
        .slice(0, 4)
        .map((book: any) => ({
          id: book.id.toString(),
          title: book.title,
          author: book.author || 'Unknown Author',
          cover: getCoverImageUrl(book.cover_image),
          rating: book.rating || 0,
          genre: book.subject ? [book.subject] : ['General']
        }))

      const transformedFavorites: BookData[] = favoritesData
        .filter((book: any) => book && book.id)
        .map((book: any) => ({
          id: book.id.toString(),
          title: book.title,
          author: book.author || 'Unknown Author',
          cover: getCoverImageUrl(book.cover_image),
          rating: book.average_rating || 0,
          genre: book.subject ? [book.subject] : ['General']
        }))

      const uniqueHistory = new Map();
      historyData.forEach((item: any) => {
        if (item && item.book_id && !uniqueHistory.has(item.book_id)) {
          uniqueHistory.set(item.book_id, item);
        }
      });

      const transformedHistory: BookData[] = Array.from(uniqueHistory.values())
        .map((item: any) => ({
          id: item.book_id.toString(),
          title: item.book_title,
          author: item.book_author || 'Unknown Author',
          cover: getCoverImageUrl(item.book_cover),
          rating: 0,
          genre: ['General'],
          readingProgress: item.page_number ? Math.round((item.page_number / (item.book_pages || 100)) * 100) : 0,
          page_number: item.page_number
        }))

      const uniqueHistoryArray = Array.from(uniqueHistory.values());
      const completedBooks = uniqueHistoryArray.filter((item: any) => item && item.status === 'completed').length
      const readingBooks = uniqueHistoryArray.filter((item: any) => item && item.status !== 'completed').length

      setRecommendations(transformedRecommendations)
      setFavorites(transformedFavorites)
      setReadingHistory(transformedHistory)
      setStats({
        booksRead: completedBooks,
        readingCount: readingBooks,
        favoritesCount: favoritesData.length,
        notesCount: notesStats.total_notes || 0
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user?.id) return

    try {
      setIsUpdating(true)
      await userService.updateProfile(user.id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email
      })

      updateUser({
        id: user.id,
        email: editForm.email,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        is_staff: user.is_staff
      })

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully!'
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }
    try {
      setIsChangingPassword(true)
      await userService.changePassword(passwordForm)
      toast({ title: "Success", description: "Password changed successfully." })
      setIsPasswordDialogOpen(false)
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (error) {
      toast({ title: "Error", description: "Failed to change password. Check your current password.", variant: "destructive" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const mostRecentBook = readingHistory.length > 0 ? readingHistory[0] : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <main className="container mx-auto py-8 sm:py-12 relative z-10 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="space-y-8 max-w-6xl mx-auto"
          >
            {/* 1. HERO SECTION & WELCOME */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: User Profile & Quick Stats */}
              <Card className="lg:col-span-2 border-2 border-border shadow-neo-lg bg-card rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="p-6 md:p-8 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <Avatar className="h-24 w-24 ring-2 ring-black dark:ring-white rounded-xl border-2 border-border shadow-neo bg-amber-200">
                      <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined} />
                      <AvatarFallback className="text-3xl font-black bg-amber-200 text-black rounded-xl">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
                        Hello, {user?.first_name}!
                      </h1>
                      <p className="text-muted-foreground font-mono flex items-center gap-2 text-sm font-bold">
                        <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        Ready to optimize your knowledge?
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {/* Compact Stats Badges */}
                        <div className="bg-green-100 dark:bg-green-900/40 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                          <Play className="h-3.5 w-3.5 fill-current" /> {stats.readingCount} Reading
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" /> {stats.booksRead} Read
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/40 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5" /> {stats.favoritesCount} Loved
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                          <StickyNote className="h-3.5 w-3.5" /> {stats.notesCount} Notes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Quick Action Bar */}
                <div className="border-t-2 border-border p-4 bg-muted/20 flex gap-3">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="font-bold uppercase text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                        <Settings className="h-4 w-4 mr-2" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] border-2 border-border rounded-xl shadow-neo-lg bg-card text-foreground p-0 gap-0 overflow-hidden">
                      <DialogHeader className="border-b-4 border-border p-6 bg-muted/20">
                        <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2">
                          <User className="h-6 w-6" />
                          Edit Profile
                        </DialogTitle>
                        <DialogDescription className="font-mono text-muted-foreground">
                          Update your profile information below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 p-6">
                        <div className="grid gap-2">
                          <Label htmlFor="first_name" className="font-bold uppercase">First Name</Label>
                          <Input
                            id="first_name"
                            value={editForm.first_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                            className="border-2 border-black rounded-lg h-12 font-mono"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="last_name" className="font-bold uppercase">Last Name</Label>
                          <Input
                            id="last_name"
                            value={editForm.last_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                            className="border-2 border-black rounded-lg h-12 font-mono"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email" className="font-bold uppercase">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                            className="border-2 border-black dark:border-white rounded-lg h-12 font-mono dark:bg-zinc-800"
                          />
                        </div>
                      </div>
                      <DialogFooter className="border-t-4 border-border p-6 bg-muted/20">
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={isUpdating}
                          className="w-full bg-primary text-black border-4 border-border rounded-lg shadow-neo hover:bg-black hover:text-white transition-all font-bold uppercase h-12"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="font-bold uppercase text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                        <Lock className="h-4 w-4 mr-2" /> Security
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] border-2 border-border rounded-xl shadow-neo-lg bg-card text-foreground p-0 gap-0 overflow-hidden">
                      <DialogHeader className="border-b-2 border-border p-6 bg-muted/20">
                        <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2">
                          <Lock className="h-6 w-6" />
                          Change Password
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 p-6">
                        <div className="grid gap-2">
                          <Label htmlFor="old_pass" className="font-bold uppercase">Current Password</Label>
                          <Input type="password" id="old_pass" value={passwordForm.old_password} onChange={e => setPasswordForm(p => ({ ...p, old_password: e.target.value }))} className="border-2 border-border rounded-lg h-12 font-mono" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new_pass" className="font-bold uppercase">New Password</Label>
                          <Input type="password" id="new_pass" value={passwordForm.new_password} onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))} className="border-2 border-border rounded-lg h-12 font-mono" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirm_pass" className="font-bold uppercase">Confirm Password</Label>
                          <Input type="password" id="confirm_pass" value={passwordForm.confirm_password} onChange={e => setPasswordForm(p => ({ ...p, confirm_password: e.target.value }))} className="border-2 border-border rounded-lg h-12 font-mono" />
                        </div>
                      </div>
                      <DialogFooter className="border-t-2 border-border p-6 bg-muted/20">
                        <Button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full bg-black text-white dark:bg-white dark:text-black border-2 border-transparent hover:border-black rounded-lg shadow-neo-sm hover:shadow-neo transition-all font-bold uppercase h-12">
                          {isChangingPassword ? "Updating..." : "Update Password"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>

              {/* Right: "Jump Back In" Hero */}
              <div className="lg:col-span-1">
                {mostRecentBook ? (
                  <Card className="h-full border-2 border-border shadow-neo bg-primary/20 hover:bg-primary/30 transition-colors rounded-2xl p-6 flex flex-col justify-between group cursor-pointer" onClick={() => navigate(`/book/${mostRecentBook.id}/read`)}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black uppercase text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          Jump Back In
                        </h3>
                        <Button size="icon" className="rounded-full w-12 h-12 bg-lime-400 text-black border-2 border-black shadow-neo-sm group-hover:scale-110 group-hover:shadow-neo transition-all duration-300">
                          <Play className="h-5 w-5 fill-black ml-1" />
                        </Button>
                      </div>
                      <h2 className="text-2xl font-black font-display uppercase line-clamp-2 mb-1 group-hover:underline decoration-2 underline-offset-2">
                        {mostRecentBook.title}
                      </h2>
                      <p className="font-mono text-xs text-muted-foreground uppercase mb-6">PG. {mostRecentBook.page_number || 1}</p>
                    </div>

                    <div>
                      <div className="w-full bg-background/50 h-2 rounded-full overflow-hidden mb-2">
                        <div className="bg-black h-full rounded-full" style={{ width: `${mostRecentBook.readingProgress}%` }} />
                      </div>
                      <p className="text-[10px] font-bold uppercase text-right">{mostRecentBook.readingProgress}% Complete</p>
                    </div>
                  </Card>
                ) : (
                  <Card className="h-full border-2 border-dashed border-border bg-card/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className="p-4 bg-muted rounded-full">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold uppercase">No Active reading</h3>
                      <p className="text-sm text-muted-foreground">Start a book to track progress</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-2 border-black font-bold uppercase hover:bg-black hover:text-white" onClick={() => navigate('/readnex')}>Browse Books</Button>
                  </Card>
                )}
              </div>
            </motion.div>

            {/* 2. TABS: OVERVIEW | LIBRARY | DISCOVER */}
            <motion.div variants={fadeInUp}>
              <Tabs defaultValue="overview" className="w-full space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <TabsList className="h-auto p-1 bg-card border-2 border-border shadow-neo-sm rounded-xl">
                    <TabsTrigger value="overview" className="h-9 px-4 font-bold uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-lg">Overview</TabsTrigger>
                    <TabsTrigger value="library" className="h-9 px-4 font-bold uppercase text-xs data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-all rounded-lg">My Library</TabsTrigger>
                    <TabsTrigger value="notes" className="h-9 px-4 font-bold uppercase text-xs data-[state=active]:bg-amber-400 data-[state=active]:text-black transition-all rounded-lg">My Notes</TabsTrigger>
                    <TabsTrigger value="uploads" className="h-9 px-4 font-bold uppercase text-xs data-[state=active]:bg-purple-400 data-[state=active]:text-black transition-all rounded-lg">My Uploads</TabsTrigger>
                    <TabsTrigger value="discover" className="h-9 px-4 font-bold uppercase text-xs data-[state=active]:bg-blue-400 data-[state=active]:text-black transition-all rounded-lg">Discover</TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-9 text-xs font-bold uppercase border-2 border-transparent hover:border-border" onClick={() => navigate('/chatbot')}><MessageCircle className="h-3.5 w-3.5 mr-2" /> Ask AI</Button>
                  </div>
                </div>

                {/* TAB: OVERVIEW */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Recent History List */}
                    <Card className="col-span-1 lg:col-span-2 border-2 border-border rounded-xl shadow-neo-sm h-fit">
                      <CardHeader className="py-4 border-b-2 border-border bg-muted/20">
                        <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {readingHistory.length > 0 ? (
                          <div className="divide-y-2 divide-border">
                            {readingHistory.slice(0, 3).map((book) => (
                              <div key={book.id} className="p-4 flex items-center gap-4 hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigate(`/book/${book.id}/read`)}>
                                <img src={book.cover} className="w-12 h-16 object-cover border-2 border-border rounded-md shadow-sm" alt={book.title} />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-sm truncate">{book.title}</h4>
                                  <p className="text-xs text-muted-foreground uppercase">{book.author}</p>
                                  <div className="w-24 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-black dark:bg-white rounded-full" style={{ width: `${book.readingProgress}%` }} />
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground text-sm font-bold uppercase">No activity yet</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Favorites Column */}
                    <Card className="border-2 border-border rounded-xl shadow-neo-sm h-fit">
                      <CardHeader className="py-4 border-b-2 border-border bg-red-100/50 dark:bg-red-900/10">
                        <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500 fill-red-500" /> Favorites
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 grid gap-4">
                        {favorites.slice(0, 2).map((book) => (
                          <div key={book.id} className="group relative">
                            <BookCard book={book} size="sm" />
                          </div>
                        ))}
                        {favorites.length === 0 && (
                          <div className="py-8 text-center text-xs font-bold uppercase text-muted-foreground">
                            No favorites added
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="w-full text-xs font-bold uppercase border-2 border-dashed border-border hover:border-solid hover:bg-accent" onClick={() => navigate('/readnex')}>
                          + Add Favorites
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* TAB: LIBRARY */}
                <TabsContent value="library">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {readingHistory.map((book) => (
                      <BookCard key={book.id} book={book} size="md" />
                    ))}
                    {readingHistory.length === 0 && (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl">
                        <p className="font-bold uppercase text-muted-foreground">Your library is empty.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB: MY UPLOADS */}
                <TabsContent value="uploads">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-purple-100 dark:bg-purple-900/10 p-4 border-2 border-purple-400 dark:border-purple-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-400 rounded-lg border-2 border-black text-black">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-sm">My Contributions</h3>
                          <p className="text-xs font-mono text-muted-foreground">Manage books you've uploaded to the community</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-black text-white dark:bg-white dark:text-black font-bold uppercase text-xs rounded-lg shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all" onClick={() => navigate('/create')}>
                        + Upload New
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {myUploads.map((book) => (
                        <div key={book.id} className="relative group">
                          <BookCard book={book} size="md" />
                          <div className="absolute top-2 right-2 z-10">
                            {book.status === 'pending' && (
                              <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-1 rounded-md border-2 border-black shadow-sm flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Pending
                              </span>
                            )}
                            {book.status === 'approved' && (
                              <span className="bg-green-400 text-black text-[10px] font-black uppercase px-2 py-1 rounded-md border-2 border-black shadow-sm flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Live
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {myUploads.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl">
                          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                          <p className="font-bold uppercase text-muted-foreground">No uploads yet.</p>
                          <p className="text-xs text-muted-foreground mt-1">Share your knowledge with the community!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* TAB: MY NOTES */}
                <TabsContent value="notes">

                  <div className="space-y-4">
                    {userNotes.length > 0 ? (
                      <Accordion type="multiple" className="space-y-4">
                        {Object.entries(userNotes.reduce((acc: any, note: any) => {
                          const key = note.book_title || `Book #${note.book}`
                          if (!acc[key]) acc[key] = []
                          acc[key].push(note)
                          return acc
                        }, {})).map(([bookTitle, notes]: [string, any]) => (
                          <AccordionItem key={bookTitle} value={bookTitle} className="border-2 border-border rounded-xl px-4 bg-card shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex items-center gap-3 text-left">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <span className="font-black uppercase text-lg">{bookTitle}</span>
                                <span className="bg-black text-white dark:bg-white dark:text-black rounded-full px-2 py-0.5 text-xs font-bold">
                                  {notes.length}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notes.map((note: any) => (
                                  <DashboardNoteCard
                                    key={note.id}
                                    note={note}
                                    navigate={navigate}
                                    onTogglePublic={async () => {
                                      try {
                                        await notesService.updateNote(note.book, note.id, { is_public: !note.is_public })
                                        setUserNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_public: !n.is_public } : n))
                                        toast({ title: note.is_public ? 'Note made private' : 'Note shared publicly' })
                                      } catch {
                                        toast({ title: 'Error', variant: 'destructive' })
                                      }
                                    }}
                                  />
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl">
                        <StickyNote className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="font-bold uppercase text-muted-foreground">You haven't created any notes yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Start reading and highlight text to create notes.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB: DISCOVER */}
                <TabsContent value="discover">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-yellow-100 dark:bg-yellow-900/10 p-4 border-2 border-yellow-400 dark:border-yellow-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-400 rounded-lg border-2 border-black text-black">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-sm">Personalized Picks</h3>
                          <p className="text-xs font-mono text-muted-foreground">Based on your reading history</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-black text-white dark:bg-white dark:text-black font-bold uppercase text-xs rounded-full px-6 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] hover:shadow-neo-sm transition-all" onClick={() => navigate('/readnex')}>Browse All</Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {recommendations.map((book) => (
                        <BookCard key={book.id} book={book} size="md" />
                      ))}
                    </div>
                  </div>
                </TabsContent>

              </Tabs>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div >
  )
}

function DashboardNoteCard({ note, navigate, onTogglePublic }: { note: any, navigate: any, onTogglePublic: () => void }) {
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false)
  const [isNoteExpanded, setIsNoteExpanded] = useState(false)

  const colorStyles: Record<string, string> = {
    '#FFEB3B': 'border-t-amber-400 dark:border-t-amber-400',
    '#2196F3': 'border-t-blue-400 dark:border-t-blue-400',
    '#4CAF50': 'border-t-green-400 dark:border-t-green-400',
    '#E91E63': 'border-t-pink-400 dark:border-t-pink-400',
  }

  // Fallback to top border color based on note color
  const topBorderClass = colorStyles[note.color] || 'border-t-gray-400'

  return (
    <Card className={`border-2 border-border rounded-xl shadow-neo-sm overflow-hidden bg-card transition-all duration-300 hover:shadow-neo border-t-[6px] ${topBorderClass} group`}>
      {/* Header */}
      <CardHeader className="py-3 px-4 border-b border-border/10 bg-muted/10 flex flex-row items-center justify-between">
        <div className="min-w-0 pr-2">
          <h4 className="font-black text-sm uppercase truncate font-display tracking-tight" title={note.book_title}>{note.book_title || `Book #${note.book}`}</h4>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black text-white dark:bg-white dark:text-black">
            PG. {note.page_number || 'N/A'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-lg border-2 border-transparent transition-all ${note.is_public
            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-muted-foreground hover:bg-muted hover:border-border'
            }`}
          title={note.is_public ? 'Public (Click to Make Private)' : 'Private (Click to Make Public)'}
          onClick={(e) => {
            e.stopPropagation()
            onTogglePublic()
          }}
        >
          {note.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Quoted Text */}
        {note.selected_text && (
          <div className="relative group/quote">
            <div className={`
              text-sm italic font-serif leading-relaxed text-foreground/80 
              pl-3 border-l-4 border-primary/50 dark:border-primary/30 
              bg-amber-50/50 dark:bg-amber-900/10 rounded-r-lg p-3
              transition-all duration-200
              ${!isQuoteExpanded ? 'line-clamp-4' : 'max-h-60 overflow-y-auto custom-scrollbar pr-1'}
            `}>
              "{note.selected_text}"
            </div>
            {note.selected_text.length > 150 && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsQuoteExpanded(!isQuoteExpanded) }}
                className="text-[10px] font-black uppercase mt-1 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                [{isQuoteExpanded ? 'Collapse' : 'Expand Context'}]
              </button>
            )}
          </div>
        )}

        {/* User Note Content */}
        <div>
          <p className={`
            font-mono text-sm font-bold leading-relaxed text-foreground
             ${!isNoteExpanded ? 'line-clamp-4' : 'max-h-60 overflow-y-auto custom-scrollbar pr-1'}
          `}>
            {note.note_content}
          </p>
          {note.note_content && note.note_content.length > 150 && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsNoteExpanded(!isNoteExpanded) }}
              className="mt-2 text-[10px] font-black uppercase text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {isNoteExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <div className="px-4 py-3 bg-muted/5 border-t border-border/10 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
          {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Just now'}
        </span>
        <Button
          size="sm"
          className="h-8 px-4 text-[10px] font-black uppercase bg-black text-white dark:bg-white dark:text-black border-2 border-transparent hover:scale-105 transition-transform shadow-sm"
          onClick={() => navigate(`/book/${note.book}/read`, { state: { page: note.page_number || 1 } })}
        >
          Jump <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </Card>
  )
}
