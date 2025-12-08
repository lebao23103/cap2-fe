import { useRef, memo } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, Play, Star, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getCoverImageUrl } from '@/lib/utils/mediaUtils'
import type { BookCardProps } from './BookGridCard'

const BookListCard = memo(({ book, onToggleFavorite, index }: BookCardProps) => {
    const navigate = useNavigate()
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

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: Math.min(index * 0.05, 0.5) }}
        >
            <Card className="group overflow-hidden border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 rounded-none">
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                    <div className="relative w-full sm:w-24 md:w-32 aspect-[2/3] border-2 border-black dark:border-white overflow-hidden flex-shrink-0">
                        <img
                            src={getCoverImageUrl(book.coverImage)}
                            alt={book.title}
                            className="w-full h-full object-cover transition-all duration-500"
                            loading="lazy"
                        />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-xl text-black dark:text-white uppercase mb-1 group-hover:underline decoration-2 underline-offset-2">
                                        {book.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 font-mono mb-2 uppercase">{book.author}</p>
                                </div>
                            </div>
                            {book.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 max-w-2xl font-mono">
                                    {book.description}
                                </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-black dark:text-white font-bold">
                                {renderStars(book.rating)}
                                {book.pages && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 uppercase">
                                            <BookOpen className="h-3.5 w-3.5" /> {book.pages} PAGES
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            <Button size="sm" onClick={() => navigate(`/book/${book.id}/read`)} className="bg-black text-white hover:bg-primary hover:text-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase font-bold">
                                <Play className="h-3.5 w-3.5 mr-2" /> {book.hasReadingHistory ? 'Resume' : 'Read'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/book/${book.id}`)} className="bg-white text-black border-2 border-black hover:bg-gray-100 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase font-bold dark:bg-zinc-900 dark:text-white dark:border-white dark:hover:bg-zinc-700">
                                Details
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => onToggleFavorite(book.id)} className="border-2 border-black dark:border-white rounded-none hover:bg-pink-400">
                                <Heart className={`h-4 w-4 ${book.isFavorite ? 'fill-black text-black' : 'dark:text-white'}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
})

BookListCard.displayName = 'BookListCard'

export default BookListCard
