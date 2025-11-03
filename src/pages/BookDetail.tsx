import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Heart,
  BookOpen,
  Share2,
  ThumbsUp,
  Flag,
  Target,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import booksService, { type Book, type Review } from '@/lib/api/books';
import { useToast } from '@/components/ui/use-toast';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  
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
      
      // TODO: Connect to real API
      // const bookData = await booksService.getBookById(Number(id));
      // const reviewsData = await booksService.getBookReviews(Number(id));
      // setBook(bookData);
      // setReviews(reviewsData);

      // Mock data for now
      const mockBook: Book = {
        id: Number(id),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Classic, Fiction, Romance',
        language: 'English',
        description: 'A classic novel set in the Jazz Age that explores themes of wealth, love, and the American Dream. The story follows the mysterious millionaire Jay Gatsby and his obsession with Daisy Buchanan.',
        cover_image: `https://picsum.photos/seed/${id}/400/600`,
        rating: 4.5,
        reviews_count: 2847,
        created_at: '2024-01-15T10:00:00Z',
      };

      const mockReviews: Review[] = [
        {
          id: 1,
          user: {
            id: 1,
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah@example.com',
          },
          book: Number(id),
          rating: 5,
          comment: 'An absolute masterpiece! Fitzgerald\'s prose is beautiful and the story is timeless. The characters are complex and the themes are still relevant today.',
          created_at: '2024-12-15T14:30:00Z',
        },
        {
          id: 2,
          user: {
            id: 2,
            first_name: 'Michael',
            last_name: 'Chen',
            email: 'michael@example.com',
          },
          book: Number(id),
          rating: 4,
          comment: 'Great read, though the pacing felt slow at times. The symbolism and writing style make up for it. Highly recommend for anyone interested in American literature.',
          created_at: '2024-12-10T09:15:00Z',
        },
      ];

      const mockRelatedBooks: Book[] = [
        {
          id: 2,
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          genre: 'Classic, Fiction',
          description: 'A gripping tale of racial injustice and childhood innocence.',
          cover_image: 'https://picsum.photos/seed/2/300/450',
          rating: 4.8,
          reviews_count: 3521,
        },
        {
          id: 3,
          title: '1984',
          author: 'George Orwell',
          genre: 'Dystopian, Science Fiction',
          description: 'A haunting vision of a totalitarian future.',
          cover_image: 'https://picsum.photos/seed/3/300/450',
          rating: 4.6,
          reviews_count: 4123,
        },
        {
          id: 4,
          title: 'Pride and Prejudice',
          author: 'Jane Austen',
          genre: 'Classic, Romance',
          description: 'A timeless romance exploring love and social class.',
          cover_image: 'https://picsum.photos/seed/4/300/450',
          rating: 4.7,
          reviews_count: 2918,
        },
      ];

      setBook(mockBook);
      setReviews(mockReviews);
      setRelatedBooks(mockRelatedBooks);
    } catch (error) {
      console.error('Error loading book:', error);
      toast({
        title: 'Error',
        description: 'Failed to load book details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartReading = () => {
    navigate(`/book/${id}/read`);
  };

  const handleTakeQuiz = () => {
    navigate(`/book/${id}/quiz`);
  };

  const handleToggleFavorite = () => {
    // TODO: Connect to favorites API
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorited
        ? 'Book removed from your favorites'
        : 'Book added to your favorites',
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Book link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting',
        variant: 'destructive',
      });
      return;
    }

    if (userReview.length < 50) {
      toast({
        title: 'Review too short',
        description: 'Please write at least 50 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingReview(true);
      // TODO: Connect to real API
      // await booksService.addReview(Number(id), {
      //   rating: userRating,
      //   comment: userReview,
      // });

      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback',
      });

      setUserRating(0);
      setUserReview('');
      loadBookData(); // Reload to show new review
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMarkHelpful = (reviewId: number) => {
    // TODO: Connect to API
    toast({
      title: 'Marked as helpful',
      description: 'Thank you for your feedback',
    });
  };

  const handleReportReview = (reviewId: number) => {
    // TODO: Connect to API
    toast({
      title: 'Review reported',
      description: 'We will review this content',
    });
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
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= (interactive ? hoveredRating || userRating : rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const calculateRatingDistribution = () => {
    // TODO: Get real data from API
    return [
      { stars: 5, count: 1520, percentage: 53 },
      { stars: 4, count: 856, percentage: 30 },
      { stars: 3, count: 285, percentage: 10 },
      { stars: 2, count: 142, percentage: 5 },
      { stars: 1, count: 44, percentage: 2 },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-muted h-[500px] rounded-lg" />
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-muted h-10 w-3/4 rounded-lg" />
              <div className="bg-muted h-6 w-1/2 rounded-lg" />
              <div className="bg-muted h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Book Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The book you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/readnex')}>Back to Library</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
        {/* Back Button */}
        <div className="flex justify-start mb-6">
          <Button
            variant="outline"
            className="bg-white dark:bg-card !text-gray-900 dark:!text-foreground border-gray-300 dark:border-border hover:bg-gray-100 dark:hover:bg-muted transition-colors shadow-sm"
            onClick={() => navigate('/readnex')}
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-gray-900 dark:text-foreground" />
            <span className="text-gray-900 dark:text-foreground">Back to Library</span>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Book Cover - Left Side */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-border/50 overflow-hidden sticky top-4 transition-shadow hover:shadow-md">
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="p-4 space-y-2">
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm hover:shadow"
                  onClick={handleStartReading}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Reading
                </Button>
                <div className="flex gap-2">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="flex-1 hover:bg-muted/50 transition-colors"
                    onClick={handleToggleFavorite}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-foreground'}`}
                    />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="flex-1 hover:bg-muted/50 transition-colors"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 text-gray-600 dark:text-foreground" />
                  </Button>
                </div>
                <Button 
                  size="default" 
                  variant="outline" 
                  className="w-full hover:bg-muted/50 transition-colors !text-gray-900 dark:!text-foreground"
                  onClick={handleTakeQuiz}
                >
                  Take Quiz
                </Button>
              </div>
            </div>
          </div>

          {/* Book Info - Right Side */}
          <div className="lg:col-span-8 space-y-4">
            {/* Title and Author */}
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-foreground">
                {book.title}
              </h1>
              <p className="text-base text-gray-600 dark:text-muted-foreground mb-3">
                by {book.author}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {renderStarRating(book.rating)}
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-foreground">
                  {book.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-600 dark:text-muted-foreground">
                  {book.reviews_count?.toLocaleString()} reviews
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {book.genre?.split(',').map((genre, i) => (
                  <Badge 
                    key={i} 
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70 transition-colors cursor-default"
                  >
                    {genre.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-card rounded-lg p-5 shadow-sm border border-border/50 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-foreground">About this book</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Book Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase">Language</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{book.language || 'English'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase">Published</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-foreground">
                  {new Date(book.created_at || '').getFullYear()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase">Author</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">{book.author}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase">Status</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-500">Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution & Reviews Section */}
        <div className="space-y-6">
          {/* Rating Distribution */}
          <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm border border-border/50 transition-shadow hover:shadow-md">
            <div className="p-0">
              <div className="flex items-center gap-2 mb-5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-foreground">Rating Distribution</h2>
              </div>
              <div className="space-y-2.5">
                {calculateRatingDistribution().map((dist) => (
                  <div key={dist.stars} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-foreground w-8 flex items-center gap-1">
                      {dist.stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </span>
                    <Progress value={dist.percentage} className="flex-1 h-2" />
                    <span className="text-xs text-gray-600 dark:text-muted-foreground w-24 text-right">
                      {dist.count} ({dist.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Write Review */}
          <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm border border-border/50 transition-shadow hover:shadow-md">
            <h2 className="text-base font-semibold text-gray-900 dark:text-foreground mb-5">Write a Review</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-foreground mb-2 block">Your Rating</label>
                <div className="flex items-center gap-1">
                  {renderStarRating(userRating, true)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-foreground mb-2 block">Your Review</label>
                <Textarea
                  placeholder="Share your thoughts about the book..."
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1.5">
                  {userReview.length} / 150 characters
                </p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm hover:shadow"
                onClick={handleSubmitReview} 
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm border border-border/50 transition-shadow hover:shadow-md">
            <h2 className="text-base font-semibold text-gray-900 dark:text-foreground mb-5">Reviews ({reviews.length})</h2>
            <div className="space-y-5">
              {reviews.map((review, index) => (
                <div key={review.id}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.email}`} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {review.user.first_name[0]}{review.user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 dark:text-foreground truncate">
                            {review.user.first_name} {review.user.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {renderStarRating(review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-foreground leading-relaxed mb-2">
                        {review.comment}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 hover:bg-muted/50 transition-colors"
                          onClick={() => handleMarkHelpful(review.id)}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Helpful
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 hover:bg-muted/50 transition-colors"
                          onClick={() => handleReportReview(review.id)}
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < reviews.length - 1 && (
                    <div className="border-t border-border/30 my-5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
