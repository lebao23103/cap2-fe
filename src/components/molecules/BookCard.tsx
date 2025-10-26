import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, BookOpen, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { PremiumButton } from '@/components/ui/premium-button';
import type { Book } from '@/lib/api/books';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact' | 'detailed' | '3d';
  onFavorite?: (bookId: number) => void;
  onReadMore?: (bookId: number) => void;
  isFavorited?: boolean;
  className?: string;
  index?: number;
}

export function BookCard({
  book,
  variant = 'default',
  onFavorite,
  onReadMore,
  isFavorited = false,
  className,
  index = 0
}: BookCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFavoriteAnimating, setIsFavoriteAnimating] = React.useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavoriteAnimating(true);
    onFavorite?.(book.id);
    setTimeout(() => setIsFavoriteAnimating(false), 600);
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.645, 0.045, 0.355, 1]
      }
    }
  };

  const renderDefaultCard = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn("group relative", className)}
    >
      <GlassCard 
        variant="gradient" 
        hover={true}
        className="h-full overflow-hidden"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
          {/* Book Cover with 3D effect */}
          <motion.div
            className="absolute inset-0"
            animate={{
              rotateY: isHovered ? 5 : 0,
              z: isHovered ? 50 : 0,
            }}
            transition={{ duration: 0.4 }}
            style={{ perspective: 1000 }}
          >
            <img
              src={book.cover_image || `https://picsum.photos/seed/${book.id}/300/450`}
              alt={book.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {/* Favorite Button */}
          <motion.button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={isFavoriteAnimating ? {
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, -10, 0],
            } : {}}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-white"
              )}
            />
          </motion.button>

          {/* Rating Badge */}
          {book.rating > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-white">{book.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Title & Author */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {book.genre?.split(',').slice(0, 2).map((genre, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="text-xs bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20"
              >
                {genre.trim()}
              </Badge>
            ))}
          </div>

          {/* Description */}
          {book.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {book.description}
            </p>
          )}

          {/* Action Button */}
          <PremiumButton
            variant="aurora"
            size="sm"
            className="w-full"
            onClick={() => onReadMore?.(book.id)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Read More
          </PremiumButton>
        </div>
      </GlassCard>
    </motion.div>
  );

  const render3DCard = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn("group relative preserve-3d", className)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative h-full"
        whileHover={{
          rotateY: 10,
          rotateX: -5,
          scale: 1.05,
          z: 100,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Book Spine (3D effect) */}
        <div 
          className="absolute -left-4 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-800 to-gray-700"
          style={{ transform: "rotateY(-90deg) translateZ(2rem)" }}
        />
        
        {/* Main Card */}
        <GlassCard 
          variant="aurora" 
          glow={true}
          className="h-full relative overflow-hidden"
        >
          <div className="relative h-64 overflow-hidden">
            <img
              src={book.cover_image || `https://picsum.photos/seed/${book.id}/400/600`}
              alt={book.title}
              className="h-full w-full object-cover"
            />
            
            {/* Holographic Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>

          <div className="p-4 space-y-3">
            <h3 className="font-bold text-xl bg-aurora-gradient bg-clip-text text-transparent">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{book.rating || 0}</span>
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFavorite}
                  className="p-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30"
                >
                  <Heart className={cn(
                    "h-4 w-4",
                    isFavorited ? "fill-red-500 text-red-500" : "text-pink-400"
                  )} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onReadMore?.(book.id)}
                  className="p-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
                >
                  <Eye className="h-4 w-4 text-indigo-400" />
                </motion.button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );

  const renderCompactCard = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      className={cn("group", className)}
    >
      <GlassCard variant="light" className="flex gap-3 p-3">
        <img
          src={book.cover_image || `https://picsum.photos/seed/${book.id}/100/150`}
          alt={book.title}
          className="w-16 h-24 object-cover rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
          <p className="text-xs text-muted-foreground">{book.author}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{book.rating || 0}</span>
            </div>
            {book.reviews_count && (
              <span className="text-xs text-muted-foreground">
                ({book.reviews_count} reviews)
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );

  switch (variant) {
    case '3d':
      return render3DCard();
    case 'compact':
      return renderCompactCard();
    case 'default':
    default:
      return renderDefaultCard();
  }
}