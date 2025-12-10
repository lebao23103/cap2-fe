import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  BookOpen,
  Share2,
  ArrowLeft,
  Globe,
  Book,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import type { Book as BookType, Review } from '@/lib/api/books';
import booksService from '@/lib/api/books';
import userService from '@/lib/api/user';
import { useToast } from '@/components/ui/use-toast';
import { BookDetailSkeleton, BooksErrorState } from '@/components/books';
import { useAnnounce } from '@/hooks/useAnnounce';
import { getCoverImageUrl } from '@/lib/utils/mediaUtils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const announce = useAnnounce();

  const [book, setBook] = useState<BookType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritingState, setFavoritingState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [sharingState, setSharingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Review form state
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      loadBookData();
    }
  }, [id]);

  const loadBookData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from API
      const [bookData, reviewsData] = await Promise.all([
        booksService.getBookById(Number(id)),
        booksService.getBookReviews(Number(id)).catch(() => [])
      ]);

      setBook(bookData);
      setReviews(reviewsData);

      // Check if book is favorited
      try {
        const favorites = await userService.getFavorites();
        const isFav = favorites.some((fav: any) => fav.book.id === Number(id));
        setIsFavorited(isFav);
      } catch (err) {
        console.log('Could not load favorite status');
      }
    } catch (err) {
      console.error('Error loading book:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load book details';
      setError(errorMessage);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadBookData();
  };

  const handleStartReading = () => {
    navigate(`/book/${id}/read`);
  };

  const handleTakeQuiz = () => {
    navigate(`/book/${id}/quiz`);
  };

  const handleToggleFavorite = async () => {
    try {
      setFavoritingState('loading');
      const newFavoritedState = !isFavorited;

      // Call real API
      if (newFavoritedState) {
        await userService.addToFavorites(Number(id));
      } else {
        await userService.removeFromFavorites(Number(id));
      }

      setIsFavorited(newFavoritedState);
      setFavoritingState('success');

      const message = newFavoritedState ? 'Added to favorites' : 'Removed from favorites';
      announce(message, 'polite');

      toast({
        title: message,
        description: newFavoritedState
          ? 'Book added to your favorites'
          : 'Book removed from your favorites',
      });

      // Reset state after animation
      setTimeout(() => setFavoritingState('idle'), 2000);
    } catch (error) {
      setFavoritingState('idle');
      announce('Failed to update favorites', 'assertive');
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      setSharingState('loading');
      await navigator.clipboard.writeText(window.location.href);

      setSharingState('success');
      announce('Link copied to clipboard', 'polite');

      toast({
        title: 'Link copied!',
        description: 'Book link copied to clipboard',
      });

      setTimeout(() => setSharingState('idle'), 2000);
    } catch (error) {
      setSharingState('error');
      announce('Failed to copy link', 'assertive');

      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });

      setTimeout(() => setSharingState('idle'), 2000);
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating) {
      announce('Please select a rating before submitting', 'assertive');
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting',
        variant: 'destructive',
      });
      return;
    }

    if (userReview.length < 50) {
      announce('Review must be at least 50 characters', 'assertive');
      toast({
        title: 'Review too short',
        description: 'Please write at least 50 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingReview(true);
      announce('Submitting review', 'polite');

      // Submit review via API
      await booksService.addReview(Number(id), {
        rating: userRating,
        comment: userReview,
      });

      announce('Review submitted successfully', 'polite');

      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback',
      });

      setUserRating(0);
      setUserReview('');

      loadBookData(); // Reload to show new review
    } catch (error) {
      announce('Failed to submit review', 'assertive');

      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStarRating = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setUserRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          >
            <Star
              className={`h-5 w-5 transition-colors ${star <= (interactive ? hoveredRating || userRating : rating)
                ? 'fill-black text-black dark:fill-white dark:text-white'
                : 'text-gray-300 dark:text-gray-600'
                }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const calculateRatingDistribution = () => {
    // Calculate real distribution from reviews
    const distribution = [5, 4, 3, 2, 1].map(stars => {
      const count = reviews.filter(review => review.rating === stars).length;
      const percentage = reviews.length > 0
        ? Math.round((count / reviews.length) * 100)
        : 0;
      return { stars, count, percentage };
    });

    return distribution;
  };

  if (loading) {
    return <BookDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden font-mono">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto py-8 max-w-5xl relative z-10">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/readnex')}
              className="border-2 border-black dark:border-white rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-zinc-900 dark:text-white uppercase font-bold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
          </div>
          <BooksErrorState error={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center font-mono">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto py-16 text-center relative z-10">
          <h1 className="text-3xl font-bold mb-4 text-foreground uppercase font-display">Book Not Found</h1>
          <p className="text-muted-foreground mb-8 font-mono">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/readnex')} className="border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase font-bold">Back to Library</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="container mx-auto py-6 sm:py-8 md:py-12 max-w-6xl relative z-10 px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-start mb-6 sm:mb-8"
        >
          <Button
            variant="ghost"
            className="group hover:bg-transparent hover:text-primary transition-all font-bold uppercase text-black dark:text-white"
            onClick={() => navigate('/readnex')}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Library
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12"
        >
          {/* Book Cover - Left Side */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-black dark:bg-white translate-x-2 translate-y-2"></div>
              <div className="relative aspect-[3/4] border-2 border-black dark:border-white bg-white dark:bg-zinc-800 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <img
                  src={getCoverImageUrl(book.cover_image)}
                  alt={`${book.title} by ${book.author} - Book cover`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-primary text-black border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all uppercase font-bold"
                onClick={handleStartReading}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Start Reading
              </Button>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                  onClick={handleToggleFavorite}
                  disabled={favoritingState === 'loading'}
                >
                  <AnimatePresence mode="wait">
                    {favoritingState === 'loading' ? (
                      <motion.div
                        key="loading"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        exit={{ scale: 0 }}
                        className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"
                      />
                    ) : (
                      <Heart
                        className={`h-5 w-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-black dark:text-white'}`}
                      />
                    )}
                  </AnimatePresence>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                  onClick={handleShare}
                  disabled={sharingState === 'loading'}
                >
                  <AnimatePresence mode="wait">
                    {sharingState === 'loading' ? (
                      <motion.div
                        key="loading"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        exit={{ scale: 0 }}
                        className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"
                      />
                    ) : (
                      <Share2 className="h-5 w-5 text-black dark:text-white" />
                    )}
                  </AnimatePresence>
                </Button>
              </div>

              <Button
                className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all font-bold uppercase"
                onClick={handleTakeQuiz}
              >
                Take Quiz
              </Button>
            </div>
          </div>

          {/* Book Info - Right Side */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {book.subject && (
                  <Badge variant="secondary" className="bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] px-3 py-1 uppercase font-bold">
                    {book.subject}
                  </Badge>
                )}
                <Badge variant="outline" className="text-black dark:text-white border-2 border-black dark:border-white rounded-none bg-white dark:bg-zinc-800 uppercase font-bold">
                  {book.language || 'English'}
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-foreground leading-tight tracking-tight uppercase font-display">
                {book.title}
              </h1>

              <div className="flex items-center gap-2 text-lg text-muted-foreground mb-6 font-mono">
                <User className="h-5 w-5 text-black dark:text-white" />
                <span className="font-bold text-black dark:text-white uppercase">{book.author}</span>
              </div>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-6 p-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-black text-black dark:fill-white dark:text-white" />
                    <span className="text-xl font-bold text-black dark:text-white font-mono">{(book.rating || 0).toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                    ({book.reviews_count?.toLocaleString() || 0} reviews)
                  </span>
                </div>

                <div className="w-px h-8 bg-black dark:bg-white hidden sm:block" />

                <div className="flex items-center gap-2 text-sm text-black dark:text-white font-bold font-mono">
                  <Book className="h-4 w-4" />
                  <span>{book.pages || 'N/A'} Pages</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 uppercase font-display">
                <BookOpen className="h-5 w-5 text-black dark:text-white" />
                About this book
              </h2>
              <p className="text-lg text-gray-800 dark:text-gray-300 leading-relaxed font-mono border-l-4 border-black dark:border-white pl-4">
                {book.description}
              </p>
            </div>

            {/* Additional Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 border-2 border-black dark:border-white bg-blue-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase">Language</p>
                    <p className="font-bold text-black dark:text-white font-mono">{book.language || 'English'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Rating Distribution & Write Review */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 uppercase text-black dark:text-white">
                  <Star className="h-5 w-5 text-black dark:text-white fill-black dark:fill-white" />
                  Rating Distribution
                </h3>
                <div className="space-y-3">
                  {calculateRatingDistribution().map((dist) => (
                    <div key={dist.stars} className="flex items-center gap-3 font-mono">
                      <span className="text-sm font-bold w-3 text-black dark:text-white">{dist.stars}</span>
                      <Progress value={dist.percentage} className="h-2 bg-gray-200 dark:bg-zinc-700 border border-black dark:border-white rounded-none [&>div]:bg-black dark:[&>div]:bg-white" />
                      <span className="text-xs text-gray-600 dark:text-gray-300 w-10 text-right">
                        {dist.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold uppercase text-black dark:text-white">Write a Review</h3>
                <div>
                  <label className="text-sm font-bold mb-2 block text-black dark:text-white uppercase">Your Rating</label>
                  <div className="flex justify-center p-4 bg-gray-50 dark:bg-zinc-900 border-2 border-black dark:border-white">
                    {renderStarRating(userRating, true)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block text-black dark:text-white uppercase">Your Review</label>
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    rows={4}
                    className="resize-none bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-none focus:ring-0 focus:border-black dark:focus:border-white font-mono text-black dark:text-white"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 text-right font-mono">
                    {userReview.length} / 50 min chars
                  </p>
                </div>
                <Button
                  className="w-full bg-black dark:bg-white hover:bg-primary hover:text-black text-white dark:text-black border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase font-bold transition-all"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !userRating || userReview.length < 50}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Reviews List */}
          <div className="lg:col-span-8">
            <h3 className="text-2xl font-bold mb-6 text-foreground uppercase font-display">
              Reviews <span className="text-gray-600 dark:text-gray-400 text-lg font-normal font-mono">({reviews.length})</span>
            </h3>

            {reviews.length === 0 ? (
              <Card className="border-2 border-dashed border-black dark:border-white bg-transparent rounded-none">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 border-2 border-black dark:border-white flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <Star className="h-8 w-8 text-black dark:text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-black dark:text-white mb-2 uppercase">No reviews yet</h4>
                  <p className="text-gray-600 dark:text-gray-400 font-mono">
                    Be the first to share your thoughts on this book!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 border-2 border-black dark:border-white rounded-none">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.email || 'anonymous'}`} />
                            <AvatarFallback className="rounded-none bg-primary text-black font-bold">{review.user?.first_name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-black dark:text-white uppercase">
                                  {review.user?.first_name || 'Unknown'} {review.user?.last_name || 'User'}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                  {new Date(review.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex">{renderStarRating(review.rating)}</div>
                            </div>
                            <p className="text-gray-800 dark:text-gray-300 leading-relaxed mb-4 font-mono">
                              {review.comment}
                            </p>

                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
