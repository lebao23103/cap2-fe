import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod validation schema
const profileSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  bio: z.string()
    .max(200, 'Bio must be less than 200 characters')
    .optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>
import {
  // User,
  Mail,
  // Calendar,
  BookOpen,
  Clock,
  Award,
  Target,
  TrendingUp,
  Edit,
  Camera,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/modern/StatCard';
import { ProfileHeaderSkeleton, StatCardSkeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  total?: number;
}

interface Activity {
  id: string;
  type: 'read' | 'review' | 'quiz' | 'note';
  title: string;
  description: string;
  timestamp: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    email: '',
  });

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  // Mock data - replace with API calls
  const [stats] = useState({
    booksRead: 24,
    readingTime: '127h 30m',
    quizzesCompleted: 18,
    averageScore: 85,
    currentStreak: 7,
    longestStreak: 21,
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Book',
      description: 'Complete your first book',
      icon: '📚',
      earned: true,
    },
    {
      id: '2',
      title: 'Speed Reader',
      description: 'Read 10 books in a month',
      icon: '⚡',
      earned: true,
    },
    {
      id: '3',
      title: 'Perfect Score',
      description: 'Score 100% on a quiz',
      icon: '🎯',
      earned: true,
    },
    {
      id: '4',
      title: 'Knowledge Seeker',
      description: 'Read 50 books',
      icon: '🔍',
      earned: false,
      progress: 24,
      total: 50,
    },
    {
      id: '5',
      title: 'Quiz Master',
      description: 'Complete 100 quizzes',
      icon: '🏆',
      earned: false,
      progress: 18,
      total: 100,
    },
    {
      id: '6',
      title: 'Consistent Reader',
      description: 'Maintain a 30-day streak',
      icon: '🔥',
      earned: false,
      progress: 7,
      total: 30,
    },
  ]);

  const [recentActivity] = useState<Activity[]>([
    {
      id: '1',
      type: 'read',
      title: 'Finished reading "The Great Gatsby"',
      description: 'Completed in 4 days',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      type: 'quiz',
      title: 'Scored 92% on "1984" quiz',
      description: 'New personal best!',
      timestamp: '1 day ago',
    },
    {
      id: '3',
      type: 'note',
      title: 'Added 3 notes to "To Kill a Mockingbird"',
      description: 'Chapter 5-7',
      timestamp: '2 days ago',
    },
    {
      id: '4',
      type: 'review',
      title: 'Reviewed "Pride and Prejudice"',
      description: 'Rated 5 stars',
      timestamp: '3 days ago',
    },
  ]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      // TODO: Connect to API
      // const profileData = await userService.getProfile();

      // Mock data for now
      if (user) {
        setFormData({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          bio: 'Passionate reader and lifelong learner. Love exploring classic literature and contemporary fiction.',
          email: user.email || '',
        });
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      // TODO: Connect to API
      // await userService.updateProfile(data);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setFormData({ ...formData, ...data });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        bio: 'Passionate reader and lifelong learner. Love exploring classic literature and contemporary fiction.',
        email: user.email || '',
      });
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'read':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <Target className="h-4 w-4" />;
      case 'note':
        return <Edit className="h-4 w-4" />;
      case 'review':
        return <Award className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-7xl">
          <ProfileHeaderSkeleton className="mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8 font-mono">
      <div className="container mx-auto max-w-7xl">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white mb-6 sm:mb-8 overflow-hidden rounded-none">
            {/* Cover Photo */}
            <div className="h-24 sm:h-32 bg-primary relative border-b-2 border-black">
              {!isEditing && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none border-2 border-black bg-white text-black hover:bg-gray-100"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative -mt-12 sm:-mt-16 md:-mt-20">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 ring-4 ring-black rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined} />
                    <AvatarFallback className="text-2xl font-bold bg-yellow-400 text-black rounded-none">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-gray-100"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4 w-full">
                  {isEditing ? (
                    // Edit Mode
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="font-bold uppercase">First Name</Label>
                          <Input
                            id="firstName"
                            {...register('firstName')}
                            value={formData.firstName}
                            onChange={(e) => {
                              setFormData({ ...formData, firstName: e.target.value });
                              setValue('firstName', e.target.value);
                              trigger('firstName');
                            }}
                            autoComplete="given-name"
                            disabled={isSaving}
                            className={`rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 ${errors.firstName ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors.firstName}
                          />
                          {errors.firstName && (
                            <p className="text-sm text-red-500 font-bold" role="alert">
                              {errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="font-bold uppercase">Last Name</Label>
                          <Input
                            id="lastName"
                            {...register('lastName')}
                            value={formData.lastName}
                            onChange={(e) => {
                              setFormData({ ...formData, lastName: e.target.value });
                              setValue('lastName', e.target.value);
                              trigger('lastName');
                            }}
                            autoComplete="family-name"
                            disabled={isSaving}
                            className={`rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 ${errors.lastName ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors.lastName}
                          />
                          {errors.lastName && (
                            <p className="text-sm text-red-500 font-bold" role="alert">
                              {errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="font-bold uppercase">Bio</Label>
                        <Textarea
                          id="bio"
                          {...register('bio')}
                          value={formData.bio}
                          onChange={(e) => {
                            setFormData({ ...formData, bio: e.target.value });
                            setValue('bio', e.target.value);
                            trigger('bio');
                          }}
                          rows={3}
                          maxLength={200}
                          disabled={isSaving}
                          className={`rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 ${errors.bio ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors.bio}
                          aria-describedby={errors.bio ? 'bio-error' : 'bio-hint'}
                        />
                        {errors.bio ? (
                          <p id="bio-error" className="text-sm text-red-500 font-bold" role="alert">
                            {errors.bio.message}
                          </p>
                        ) : (
                          <p id="bio-hint" className="text-xs text-gray-500 font-bold">
                            {formData.bio.length}/200 characters
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={isSaving} className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-primary text-black hover:bg-primary/90 uppercase font-bold hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all" aria-label={isSaving ? 'Saving profile changes' : 'Save profile changes'}>
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving} className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-gray-100 uppercase font-bold hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all" aria-label="Cancel editing">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    // View Mode
                    <>
                      <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase">
                          {formData.firstName} {formData.lastName}
                        </h1>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-bold mt-1 font-mono">
                          <Mail className="h-4 w-4" />
                          {formData.email}
                        </div>
                      </div>
                      <p className="text-gray-600 font-mono border-l-4 border-primary pl-4 italic">{formData.bio}</p>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm" className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-gray-100 uppercase font-bold hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share Profile
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <StatCard
            icon={BookOpen}
            label="Books Read"
            value={stats.booksRead.toString()}
            variant="primary"
          />
          <StatCard
            icon={Clock}
            label="Reading Time"
            value={stats.readingTime}
            variant="success"
          />
          <StatCard
            icon={Target}
            label="Quizzes"
            value={stats.quizzesCompleted.toString()}
            variant="warning"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Score"
            value={`${stats.averageScore}%`}
            variant="info"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Achievements & Activity */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <CardHeader className="border-b-2 border-black bg-gray-50">
                  <CardTitle className="flex items-center gap-2 uppercase font-bold">
                    <Award className="h-5 w-5 text-black" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 border-2 transition-all rounded-none ${achievement.earned
                            ? 'bg-yellow-100 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-gray-100 border-gray-300 opacity-60 grayscale'
                          }`}
                      >
                        <div className="text-center space-y-2">
                          <div className="text-3xl">{achievement.icon}</div>
                          <h4 className="font-bold text-sm uppercase">{achievement.title}</h4>
                          <p className="text-xs text-gray-600 font-mono">
                            {achievement.description}
                          </p>
                          {!achievement.earned && achievement.progress && achievement.total && (
                            <div className="space-y-1">
                              <Progress
                                value={(achievement.progress / achievement.total) * 100}
                                className="h-2 border border-black rounded-none [&>div]:bg-black"
                              />
                              <p className="text-xs text-gray-600 font-bold">
                                {achievement.progress}/{achievement.total}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <CardHeader className="border-b-2 border-black bg-gray-50">
                  <CardTitle className="flex items-center gap-2 uppercase font-bold">
                    <TrendingUp className="h-5 w-5 text-black" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        <div className="p-2 border-2 border-black bg-primary text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm uppercase">{activity.title}</h4>
                          <p className="text-xs text-gray-600 mt-1 font-mono">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-bold uppercase">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6 lg:space-y-8">
            {/* Reading Streak */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <CardHeader className="border-b-2 border-black bg-gray-50">
                  <CardTitle className="flex items-center gap-2 text-lg uppercase font-bold">
                    🔥 Reading Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="text-center">
                    <div className="text-4xl font-black text-black mb-2 font-display">
                      {stats.currentStreak}
                    </div>
                    <p className="text-sm text-gray-600 font-bold uppercase">Days in a row</p>
                  </div>
                  <div className="p-4 border-2 border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600 font-bold uppercase">
                        Longest Streak
                      </span>
                      <Badge variant="secondary" className="bg-white text-black border-2 border-black rounded-none">{stats.longestStreak} days</Badge>
                    </div>
                    <Progress value={(stats.currentStreak / stats.longestStreak) * 100} className="h-3 border border-black rounded-none [&>div]:bg-black" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <CardHeader className="border-b-2 border-black bg-gray-50">
                  <CardTitle className="text-lg uppercase font-bold">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-6">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-none border-2 border-transparent hover:border-black hover:bg-black hover:text-white uppercase font-bold transition-all"
                    onClick={() => (window.location.href = '/favorites')}
                    aria-label="View my favorites"
                  >
                    My Favorites
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-none border-2 border-transparent hover:border-black hover:bg-black hover:text-white uppercase font-bold transition-all"
                    onClick={() => (window.location.href = '/reading-history')}
                    aria-label="View reading history"
                  >
                    Reading History
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-none border-2 border-transparent hover:border-black hover:bg-black hover:text-white uppercase font-bold transition-all"
                    onClick={() => (window.location.href = '/settings')}
                    aria-label="Open account settings"
                  >
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
