import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    badge: 'text-xs'
  },
  md: {
    container: 'p-4',
    cover: 'w-16 h-20',
    title: 'text-sm',
    author: 'text-sm',
    rating: 'w-3 h-3',
    badge: 'text-xs'
  },
  lg: {
    container: 'p-6',
    cover: 'w-24 h-32',
    title: 'text-base',
    author: 'text-sm',
    rating: 'w-4 h-4',
    badge: 'text-sm'
  }
}

export function BookCard({ book, size = 'md', className, onClick }: BookCardProps) {
  const variant = sizeVariants[size]

  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all duration-200 cursor-pointer",
        onClick && "hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={variant.container}>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <img 
              src={book.cover} 
              alt={book.title} 
              loading="lazy"
              className={cn(
                variant.cover,
                "object-cover rounded-md aspect-[2/3]"
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold line-clamp-2 mb-1",
              variant.title
            )}>
              {book.title}
            </h3>
            <p className={cn(
              "text-muted-foreground line-clamp-1",
              variant.author
            )}>
              {book.author}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Star className={cn(
                "fill-yellow-400 text-yellow-400",
                variant.rating
              )} />
              <span className="text-xs text-muted-foreground">
                {book.rating}
              </span>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {book.genre.slice(0, 2).map((g) => (
                <Badge 
                  key={g} 
                  variant="secondary" 
                  className={variant.badge}
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
}
