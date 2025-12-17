
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, Lock, ArrowRight } from 'lucide-react'

interface DashboardNoteCardProps {
    note: any
    navigate: any
    onTogglePublic: () => void
}

export function DashboardNoteCard({ note, navigate, onTogglePublic }: DashboardNoteCardProps) {
    const [isQuoteExpanded, setIsQuoteExpanded] = useState(false)
    const [isNoteExpanded, setIsNoteExpanded] = useState(false)

    const colorStyles: Record<string, string> = {
        '#FFEB3B': 'border-t-amber-400 dark:border-t-amber-400',
        '#2196F3': 'border-t-blue-400 dark:border-t-blue-400',
        '#4CAF50': 'border-t-green-400 dark:border-t-green-400',
        '#E91E63': 'border-t-pink-400 dark:border-t-pink-400',
    }

    // Fallback to top border color based on note color
    const topBorderClass = colorStyles[note.color] || 'border-t-gray-400'

    return (
        <Card className={`h-full flex flex-col border-2 border-border rounded-xl shadow-neo-sm overflow-hidden bg-card transition-all duration-300 hover:shadow-neo border-t-[6px] ${topBorderClass} group`}>
            {/* Header */}
            <CardHeader className="py-3 px-4 border-b-2 border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                <div className="min-w-0 pr-2">
                    <h4 className="font-black text-sm uppercase truncate font-display tracking-tight" title={note.book_title}>{note.book_title || `Book #${note.book}`}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black text-white dark:bg-white dark:text-black">
                        PG. {note.page_number || 'N/A'}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-lg border-2 border-transparent transition-all ${note.is_public
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-muted-foreground hover:bg-muted hover:border-border'
                        }`}
                    title={note.is_public ? 'Public (Click to Make Private)' : 'Private (Click to Make Public)'}
                    onClick={(e) => {
                        e.stopPropagation()
                        onTogglePublic()
                    }}
                >
                    {note.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1">
                {/* Quoted Text */}
                {note.selected_text && (
                    <div className="relative group/quote">
                        <div className={`
              text-sm italic font-serif leading-relaxed text-foreground/80 
              pl-3 border-l-4 border-primary/50 dark:border-primary/30 
              bg-amber-50/50 dark:bg-amber-900/10 rounded-r-lg p-3
              transition-all duration-200
              ${!isQuoteExpanded ? 'line-clamp-4' : 'max-h-60 overflow-y-auto pr-1'}
            `}>
                            "{note.selected_text}"
                        </div>
                        {note.selected_text.length > 150 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsQuoteExpanded(!isQuoteExpanded) }}
                                className="text-[10px] font-black uppercase mt-1 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                            >
                                [{isQuoteExpanded ? 'Collapse' : 'Expand Context'}]
                            </button>
                        )}
                    </div>
                )}

                {/* User Note Content */}
                <div>
                    <p className={`
            font-mono text-sm font-bold leading-relaxed text-foreground
             ${!isNoteExpanded ? 'line-clamp-4' : 'max-h-60 overflow-y-auto pr-1'}
          `}>
                        {note.note_content}
                    </p>
                    {note.note_content && note.note_content.length > 150 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsNoteExpanded(!isNoteExpanded) }}
                            className="mt-2 text-[10px] font-black uppercase text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            {isNoteExpanded ? 'Show Less' : 'Read More'}
                        </button>
                    )}
                </div>
            </CardContent>

            {/* Footer */}
            <div className="px-4 py-3 bg-muted/20 border-t-2 border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                    {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Just now'}
                </span>
                <Button
                    size="sm"
                    className="h-8 px-4 text-[10px] font-black uppercase bg-black text-white dark:bg-white dark:text-black border-2 border-transparent hover:scale-105 transition-transform shadow-sm"
                    onClick={() => navigate(`/book/${note.book}/read`, { state: { page: note.page_number || 1 } })}
                >
                    Jump <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
            </div>
        </Card>
    )
}
