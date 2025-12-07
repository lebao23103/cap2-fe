import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import BookCard, { type BookData } from '../components/ui/book-card'
import { useToast } from '../components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
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
  TrendingUp,
  ArrowRight,
  Clock,
  Mail,
  Edit3,
  Save,
  User,
  Lock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import userService from '../lib/api/user'
import booksService from '../lib/api/books'
import notesService from '../lib/api/notes'
import { getCoverImageUrl } from '../lib/utils/mediaUtils'
import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '@/lib/animations'

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [recommendations, setRecommendations] = useState<BookData[]>([])
  const [favorites, setFavorites] = useState<BookData[]>([])
  const [readingHistory, setReadingHistory] = useState<BookData[]>([])

  // Stats - only what backend supports
  const [stats, setStats] = useState({
    booksRead: 0,
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

      // Fetch all dashboard data in parallel
      const [booksData, favoritesData, historyData, notesStats] = await Promise.all([
        booksService.getApprovedBooks().catch(() => []),
        userService.getFavorites().catch(() => []),
        userService.getReadingHistory().catch(() => []),
        notesService.getUserNotesStatistics().catch(() => ({ total_notes: 0 }))
      ])

      // Transform books for recommendations (show first 3 approved books with null checks)
      const transformedRecommendations: BookData[] = booksData
        .filter((book: any) => book && book.id && book.title)
        .slice(0, 3)
        .map((book: any) => ({
          id: book.id.toString(),
          title: book.title,
          author: book.author || 'Unknown Author',
          cover: getCoverImageUrl(book.cover_image),
          rating: book.rating || 0,
          genre: book.subject ? [book.subject] : ['General']
        }))

      // Transform favorites (with null checks)
      const transformedFavorites: BookData[] = favoritesData
        .filter((fav: any) => fav && fav.book && fav.book.id)
        .slice(0, 2)
        .map((fav: any) => ({
          id: fav.book.id.toString(),
          title: fav.book.title,
          author: fav.book.author || 'Unknown Author',
          cover: getCoverImageUrl(fav.book.cover_image),
          rating: fav.book.rating || 0,
          genre: fav.book.subject ? [fav.book.subject] : ['General']
        }))

      // Transform reading history (flat structure from serializer)
      // Deduplicate history by book_id to handle potential legacy duplicates
      const uniqueHistory = new Map();
      historyData.forEach((item: any) => {
        if (item && item.book_id && !uniqueHistory.has(item.book_id)) {
          uniqueHistory.set(item.book_id, item);
        }
      });

      const transformedHistory: BookData[] = Array.from(uniqueHistory.values())
        .slice(0, 3)
        .map((item: any) => ({
          id: item.book_id.toString(),
          title: item.book_title,
          author: item.book_author || 'Unknown Author',
          cover: getCoverImageUrl(item.book_cover),
          rating: 0, // Not in flat history
          genre: ['General'],
          readingProgress: item.page_number ? Math.round((item.page_number / (item.book_pages || 100)) * 100) : 0,
          page_number: item.page_number
        }))

      // Calculate stats from actual data
      const completedBooks = historyData.filter((item: any) => item && item.status === 'completed').length

      setRecommendations(transformedRecommendations)
      setFavorites(transformedFavorites)
      setReadingHistory(transformedHistory)
      setStats({
        booksRead: completedBooks,
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

      // Refresh user data in context
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
            className="space-y-8"
          >
            {/* Welcome Header Card */}
            <motion.div variants={fadeInUp}>
              <Card className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-gradient-to-r from-primary via-yellow-300 to-primary rounded-none overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-black dark:ring-white rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white">
                      <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined} />
                      <AvatarFallback className="text-3xl font-black bg-white text-black rounded-none">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Welcome Text */}
                    <div className="flex-1 text-center sm:text-left">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-black mb-2">
                        Welcome back, {user?.first_name}! 👋
                      </h1>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-black/80 font-bold">
                        <Mail className="h-4 w-4" />
                        <span className="font-mono">{user?.email}</span>
                      </div>
                    </div>

                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 px-4 bg-white dark:bg-zinc-900 border-4 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-all font-bold uppercase"
                        >
                          <Edit3 className="h-5 w-5 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] border-4 border-black dark:border-white rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900 text-black dark:text-white">
                        <DialogHeader className="border-b-4 border-black dark:border-white pb-4">
                          <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2">
                            <User className="h-6 w-6" />
                            Edit Profile
                          </DialogTitle>
                          <DialogDescription className="font-mono text-gray-600 dark:text-gray-300">
                            Update your profile information below.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="first_name" className="font-bold uppercase">First Name</Label>
                            <Input
                              id="first_name"
                              value={editForm.first_name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                              className="border-2 border-black rounded-none h-12 font-mono"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="last_name" className="font-bold uppercase">Last Name</Label>
                            <Input
                              id="last_name"
                              value={editForm.last_name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                              className="border-2 border-black rounded-none h-12 font-mono"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="email" className="font-bold uppercase">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                              className="border-2 border-black dark:border-white rounded-none h-12 font-mono dark:bg-zinc-800"
                            />
                          </div>
                        </div>
                        <DialogFooter className="border-t-4 border-black dark:border-white pt-4">
                          <Button
                            onClick={handleUpdateProfile}
                            disabled={isUpdating}
                            className="w-full bg-primary text-black border-4 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-black hover:text-white transition-all font-bold uppercase h-12"
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

                    {/* Change Password Dialog */}
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 px-4 bg-white dark:bg-zinc-900 border-4 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-all font-bold uppercase"
                        >
                          <Lock className="h-5 w-5 mr-2" />
                          Security
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] border-4 border-black dark:border-white rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900 text-black dark:text-white">
                        <DialogHeader className="border-b-4 border-black dark:border-white pb-4">
                          <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2">
                            <Lock className="h-6 w-6" />
                            Change Password
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="old_pass" className="font-bold uppercase">Current Password</Label>
                            <Input type="password" id="old_pass" value={passwordForm.old_password} onChange={e => setPasswordForm(p => ({ ...p, old_password: e.target.value }))} className="border-2 border-black rounded-none h-12 font-mono" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new_pass" className="font-bold uppercase">New Password</Label>
                            <Input type="password" id="new_pass" value={passwordForm.new_password} onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))} className="border-2 border-black rounded-none h-12 font-mono" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="confirm_pass" className="font-bold uppercase">Confirm Password</Label>
                            <Input type="password" id="confirm_pass" value={passwordForm.confirm_password} onChange={e => setPasswordForm(p => ({ ...p, confirm_password: e.target.value }))} className="border-2 border-black rounded-none h-12 font-mono" />
                          </div>
                        </div>
                        <DialogFooter className="border-t-4 border-black dark:border-white pt-4">
                          <Button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full bg-black text-white dark:bg-white dark:text-black border-4 border-transparent hover:border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase h-12">
                            {isChangingPassword ? "Updating..." : "Update Password"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { label: 'Books Read', value: stats.booksRead, icon: BookOpen, bg: 'bg-blue-400' },
                { label: 'Favorites', value: stats.favoritesCount, icon: Heart, bg: 'bg-red-400' },
                { label: 'Notes Made', value: stats.notesCount, icon: StickyNote, bg: 'bg-yellow-400' }
              ].map((stat, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="border-4 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-none hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 group">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`p-4 border-4 border-black dark:border-white ${stat.bg} text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] group-hover:rotate-6 transition-transform`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-3xl font-black text-black dark:text-white font-mono">{stat.value}</div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wide">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-8 flex flex-col gap-3 items-center justify-center bg-white dark:bg-zinc-800 border-4 border-black dark:border-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:bg-blue-400 hover:text-black hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] transition-all group uppercase font-black"
                onClick={() => navigate('/reading-history')}
              >
                <div className="p-3 bg-blue-100 border-2 border-black dark:border-white group-hover:bg-white transition-colors">
                  <BookOpen className="h-8 w-8 text-black" />
                </div>
                <span className="text-lg text-black dark:text-white group-hover:text-black">Continue Reading</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-8 flex flex-col gap-3 items-center justify-center bg-white dark:bg-zinc-800 border-4 border-black dark:border-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:bg-red-400 hover:text-black hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] transition-all group uppercase font-black"
                onClick={() => navigate('/favorites')}
              >
                <div className="p-3 bg-red-100 border-2 border-black dark:border-white group-hover:bg-white transition-colors">
                  <Heart className="h-8 w-8 text-black" />
                </div>
                <span className="text-lg text-black dark:text-white group-hover:text-black">My Favorites</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-8 flex flex-col gap-3 items-center justify-center bg-white dark:bg-zinc-800 border-4 border-black dark:border-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:bg-yellow-400 hover:text-black hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] transition-all group uppercase font-black"
                onClick={() => navigate('/my-notes')}
              >
                <div className="p-3 bg-yellow-100 border-2 border-black dark:border-white group-hover:bg-white transition-colors">
                  <StickyNote className="h-8 w-8 text-black" />
                </div>
                <span className="text-lg text-black dark:text-white group-hover:text-black">My Notes</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-8 flex flex-col gap-3 items-center justify-center bg-white dark:bg-zinc-800 border-4 border-black dark:border-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:bg-green-400 hover:text-black hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] transition-all group uppercase font-black"
                onClick={() => navigate('/chatbot')}
              >
                <div className="p-3 bg-green-100 border-2 border-black dark:border-white group-hover:bg-white transition-colors">
                  <MessageCircle className="h-8 w-8 text-black" />
                </div>
                <span className="text-lg text-black dark:text-white group-hover:text-black">Chat with AI</span>
              </Button>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recommendations */}
              <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2 uppercase">
                    <span className="bg-black text-white px-2 py-1 inline-flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Recommended for You
                    </span>
                  </h2>
                  <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-black hover:bg-primary/20 font-bold uppercase border-2 border-transparent hover:border-black" onClick={() => navigate('/readnex')}>
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {recommendations.length === 0 ? (
                    <Card className="bg-white dark:bg-zinc-800 border-4 border-dashed border-black dark:border-white rounded-none">
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-700 border-2 border-black dark:border-white flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                          <BookOpen className="h-8 w-8 text-black dark:text-white" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-bold uppercase">No recommendations available yet.</p>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mt-2">Start reading to get personalized suggestions!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    recommendations.map((book) => (
                      <BookCard key={book.id} book={book} size="md" />
                    ))
                  )}
                </div>
              </motion.div>

              {/* Sidebar */}
              <motion.div variants={fadeInUp} className="space-y-6">
                {/* Reading History */}
                <Card className="bg-white dark:bg-zinc-800 border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-none">
                  <CardHeader className="pb-3 border-b-4 border-black dark:border-white bg-blue-100 dark:bg-blue-900">
                    <CardTitle className="text-lg font-black flex items-center gap-2 uppercase dark:text-white">
                      <Clock className="h-5 w-5 text-black dark:text-white" />
                      Continue Reading
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {readingHistory.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 border-2 border-black dark:border-white flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                          <BookOpen className="h-6 w-6 text-black dark:text-white" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-bold">No reading history yet</p>
                      </div>
                    ) : (
                      readingHistory.map((book) => (
                        <BookCard key={book.id} book={book} size="sm" />
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Favorites */}
                <Card className="bg-white dark:bg-zinc-800 border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-none">
                  <CardHeader className="pb-3 border-b-4 border-black dark:border-white bg-red-100 dark:bg-red-900">
                    <CardTitle className="text-lg font-black flex items-center gap-2 uppercase dark:text-white">
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                      My Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {favorites.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900 border-2 border-black dark:border-white flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                          <Heart className="h-6 w-6 text-red-500" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-bold">No favorites yet</p>
                      </div>
                    ) : (
                      favorites.map((book) => (
                        <BookCard key={book.id} book={book} size="sm" />
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
