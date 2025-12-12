import { useRef, memo } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Play, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getCoverImageUrl } from '@/lib/utils/mediaUtils'

export interface BookCardProps {
    book: {
        id: number
        title: string
        author: string
        coverImage: string
        rating: number
        readCount?: number
        description: string
        pages?: number
        readingProgress?: number
        isFavorite?: boolean
        hasReadingHistory?: boolean
    }
    onToggleFavorite: (id: number) => void
    index: number
}

const BookGridCard = memo(({ book, onToggleFavorite, index }: BookCardProps) => {
    const navigate = useNavigate()

    // Optimization: Only animate when in view
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "100px" })

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                        }`}
                />
            ))}
            <span className="ml-1 text-xs font-bold text-foreground">
                {rating.toFixed(1)}
            </span>
        </div>
    )

    const renderProgressBar = (progress: number) => (
        <div className="w-full bg-background border-2 border-border h-4 overflow-hidden">
            <div
                className="bg-primary h-full transition-all duration-500 ease-out border-r-2 border-border"
                style={{ width: `${progress}%` }}
            />
        </div>
    )

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
                duration: 0.4,
                delay: Math.min(index * 0.05, 0.5), // Cap delay to avoid long waits
                ease: [0.25, 0.1, 0.25, 1]
            }}
            className="group relative"
        >
            <Card className="h-full border-2 border-border bg-card shadow-neo hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-hover transition-all duration-300 overflow-hidden rounded-xl flex flex-col">

                {/* Cover Image Area */}
                <Link to={`/book/${book.id}`} className="relative aspect-[3/4] overflow-hidden block border-b-2 border-border">
                    <img
                        src={getCoverImageUrl(book.coverImage)}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {book.isFavorite && (
                            <div className="p-1.5 bg-pink-400 text-black border-2 border-border shadow-neo-sm">
                                <Heart className="h-3.5 w-3.5 fill-current" />
                            </div>
                        )}
                    </div>

                    {/* Reading Progress Bar (Overlay) */}
                    {book.hasReadingHistory && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-background border-t-2 border-border">
                            <div className="flex justify-between text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                                <span>Progress</span>
                                <span>{book.readingProgress}%</span>
                            </div>
                            {renderProgressBar(book.readingProgress || 0)}
                        </div>
                    )}

                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4">
                        <Button
                            size="lg"
                            className="w-full max-w-[160px] bg-background text-foreground hover:bg-foreground hover:text-background font-bold shadow-neo border-2 border-border rounded-lg uppercase"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                navigate(`/book/${book.id}/read`)
                            }}
                        >
                            <Play className="h-4 w-4 mr-2 fill-current" />
                            {book.hasReadingHistory ? 'RESUME' : 'READ'}
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-10 w-10 bg-background text-foreground border-2 border-border hover:bg-foreground hover:text-background rounded-lg shadow-neo"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onToggleFavorite(book.id)
                                }}
                                title={book.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            >
                                <Heart className={`h-5 w-5 ${book.isFavorite ? 'fill-foreground text-foreground' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </Link>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-1 bg-card">
                    <Link to={`/book/${book.id}`} className="block mb-1">
                        <h3 className="font-bold text-lg leading-tight text-foreground uppercase line-clamp-1 group-hover:underline decoration-2 underline-offset-2">
                            {book.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground font-mono mb-3 uppercase">
                        {book.author}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t-2 border-border">
                        {renderStars(book.rating)}
                    </div>
                </div>
            </Card>
        </motion.div>
    )
})

BookGridCard.displayName = 'BookGridCard'

export default BookGridCard
