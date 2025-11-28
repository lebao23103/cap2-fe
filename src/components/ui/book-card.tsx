import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export interface BookData {
  id: string
  title: string
  author: string
  cover: string
  rating: number
  genre: string[]
}

export interface BookCardProps {
  book: BookData
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

const sizeVariants = {
  sm: {
    container: 'p-3',
    cover: 'w-12 h-16',
    title: 'text-sm',
    author: 'text-xs',
    rating: 'w-3 h-3',
    badge: 'text-[10px] px-1.5 py-0'
  },
  md: {
    container: 'p-4',
    cover: 'w-16 h-24',
    title: 'text-base',
    author: 'text-sm',
    rating: 'w-3.5 h-3.5',
    badge: 'text-xs'
  },
  lg: {
    container: 'p-6',
    cover: 'w-24 h-36',
    title: 'text-lg',
    author: 'text-base',
    rating: 'w-4 h-4',
    badge: 'text-sm'
  }
}

export function BookCard({ book, size = 'md', className, onClick }: BookCardProps) {
  const variant = sizeVariants[size]

  const Content = (
    <Card
      className={cn(
        "group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-border/50",
        "bg-card/50 backdrop-blur-sm hover:bg-card/80",
        "hover:-translate-y-1 hover:border-primary/20",
        "active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn(variant.container, "relative z-10")}>
        <div className="flex gap-4">
          <div className="flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-primary/10 rounded-md blur-sm transform translate-y-2 translate-x-2" />
            <img
              src={book.cover}
              alt={book.title}
              loading="lazy"
              className={cn(
                variant.cover,
                "object-cover rounded-md shadow-md relative z-10"
              )}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className={cn(
              "font-bold line-clamp-2 mb-1 text-foreground group-hover:text-primary transition-colors",
              variant.title
            )}>
              {book.title}
            </h3>
            <p className={cn(
              "text-muted-foreground line-clamp-1 font-medium",
              variant.author
            )}>
              {book.author}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Star className={cn(
                "fill-amber-400 text-amber-400",
                variant.rating
              )} />
              <span className="text-xs font-semibold text-foreground">
                {book.rating.toFixed(1)}
              </span>
            </div>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {book.genre.slice(0, 2).map((g) => (
                <Badge
                  key={g}
                  variant="secondary"
                  className={cn(
                    "bg-primary/5 text-primary hover:bg-primary/10 border-0 transition-colors",
                    variant.badge
                  )}
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (onClick) {
    return Content
  }

  return (
    <Link to={`/book/${book.id}`} className="block h-full">
      {Content}
    </Link>
  )
}
