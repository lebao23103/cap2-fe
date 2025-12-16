
import { useState, useRef } from 'react'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { DashboardNoteCard } from './DashboardNoteCard'
import { Button } from '@/components/ui/button'

interface BookNotesGroupProps {
    bookTitle: string
    notes: any[]
    navigate: any
    onTogglePublic: (note: any) => Promise<void>
    coverImage?: string // Optional cover image URL
}

export function BookNotesGroup({ bookTitle, notes, navigate, onTogglePublic, coverImage }: BookNotesGroupProps) {
    const [visibleCount, setVisibleCount] = useState(6)
    const groupRef = useRef<HTMLDivElement>(null)

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6)
    }

    const handleShowLess = () => {
        setVisibleCount(6)
        if (groupRef.current) {
            const yOffset = -100;
            const element = groupRef.current;
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }

    const visibleNotes = notes.slice(0, visibleCount)
    const hasMore = visibleCount < notes.length
    const canShowLess = visibleCount > 6

    return (
        <AccordionItem value={bookTitle} ref={groupRef} className="border-2 border-border rounded-xl px-4 bg-card shadow-sm mb-4">
            <AccordionTrigger className="hover:no-underline py-4 group">
                <div className="flex items-center gap-4 text-left w-full">
                    {/* Cover Image or Fallback Icon */}
                    <div className="h-12 w-8 bg-muted rounded border-2 border-border overflow-hidden flex-shrink-0 relative shadow-sm group-hover:shadow-md transition-all">
                        {coverImage ? (
                            <img src={coverImage} alt={bookTitle} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-black uppercase text-lg truncate pr-2">{bookTitle}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
                    </div>

                    <span className="bg-black text-white dark:bg-white dark:text-black rounded-full px-2.5 py-1 text-xs font-bold mr-2">
                        {notes.length}
                    </span>
                </div>
            </AccordionTrigger>

            <AccordionContent className="pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleNotes.map((note: any) => (
                        <DashboardNoteCard
                            key={note.id}
                            note={note}
                            navigate={navigate}
                            onTogglePublic={() => onTogglePublic(note)}
                        />
                    ))}
                </div>

                {/* Load More / Show Less Actions */}
                <div className="mt-8 flex justify-center gap-4">
                    {hasMore && (
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            className="border-2 border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                            Load More Notes ({notes.length - visibleCount} hidden) <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    {!hasMore && canShowLess && (
                        <Button
                            variant="ghost"
                            onClick={handleShowLess}
                            className="font-bold uppercase text-muted-foreground hover:text-foreground"
                        >
                            Show Less <ChevronUp className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}
