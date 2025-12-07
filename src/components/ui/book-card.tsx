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
    badge: 'text-[10px] px-1.5 py-0',
    cardShadow: 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    hoverShadow: 'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    imageOffset: 'translate-y-0.5 translate-x-0.5'
  },
  md: {
    container: 'p-4',
    cover: 'w-16 h-24',
    title: 'text-base',
    author: 'text-sm',
    rating: 'w-3.5 h-3.5',
    badge: 'text-xs',
    cardShadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    hoverShadow: 'hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    imageOffset: 'translate-y-1 translate-x-1'
  },
  lg: {
    container: 'p-6',
    cover: 'w-24 h-36',
    title: 'text-lg',
    author: 'text-base',
    rating: 'w-4 h-4',
    badge: 'text-sm',
    cardShadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
    hoverShadow: 'hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]',
    imageOffset: 'translate-y-1.5 translate-x-1.5'
  }
}

export default function BookCard({ book, size = 'md', className, onClick }: BookCardProps) {
  const variant = sizeVariants[size]

  const Content = (
    <Card
      className={cn(
        "group transition-all duration-300 cursor-pointer overflow-hidden border-2 border-black",
        "bg-white hover:bg-white",
        "hover:-translate-y-1 hover:-translate-x-1",
        variant.cardShadow,
        variant.hoverShadow,
        "active:translate-y-0 active:translate-x-0 active:shadow-none",
        "rounded-none",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn(variant.container, "relative z-10")}>
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
            <div className={cn("absolute inset-0 bg-black", variant.imageOffset)} />
            <img
              src={book.cover}
              alt={book.title}
              loading="lazy"
              className={cn(
                variant.cover,
                "object-cover border-2 border-black relative z-10 bg-white"
              )}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className={cn(
              "font-bold line-clamp-2 mb-1 text-black group-hover:underline decoration-2 underline-offset-2 uppercase",
              variant.title
            )}>
              {book.title}
            </h3>
            <p className={cn(
              "text-gray-600 line-clamp-1 font-mono uppercase",
              variant.author
            )}>
              {book.author}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Star className={cn(
                "fill-black text-black",
                variant.rating
              )} />
              <span className="text-xs font-bold text-black font-mono">
                {book.rating.toFixed(1)}
              </span>
            </div>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {book.genre.slice(0, 2).map((g) => (
                <Badge
                  key={g}
                  variant="secondary"
                  className={cn(
                    "bg-white text-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:translate-x-[-1px] transition-transform",
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
