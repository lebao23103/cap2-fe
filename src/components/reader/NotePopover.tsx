import { X, Edit, Trash2, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface BookNote {
    id: string
    text: string
    note: string
    page: number
    timestamp: string
    color?: 'yellow' | 'blue' | 'green' | 'pink'
    isPublic?: boolean
}

interface NotePopoverProps {
    note: BookNote | null
    position: { x: number; y: number } | null
    onClose: () => void
    onEdit: (note: BookNote) => void
    onDelete: (id: string) => void
    onShare: (id: string) => void
}

const COLOR_STYLES = {
    yellow: {
        bg: 'from-amber-50/95 via-amber-50/90 to-amber-100/95 dark:from-amber-950/95 dark:via-amber-950/90 dark:to-amber-900/95',
        border: 'border-l-amber-500',
        iconBg: 'bg-amber-100 dark:bg-amber-900/50',
        iconColor: 'text-amber-600 dark:text-amber-400',
    },
    blue: {
        bg: 'from-blue-50/95 via-blue-50/90 to-blue-100/95 dark:from-blue-950/95 dark:via-blue-950/90 dark:to-blue-900/95',
        border: 'border-l-blue-500',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    green: {
        bg: 'from-green-50/95 via-green-50/90 to-green-100/95 dark:from-green-950/95 dark:via-green-950/90 dark:to-green-900/95',
        border: 'border-l-green-500',
        iconBg: 'bg-green-100 dark:bg-green-900/50',
        iconColor: 'text-green-600 dark:text-green-400',
    },
    pink: {
        bg: 'from-pink-50/95 via-pink-50/90 to-pink-100/95 dark:from-pink-950/95 dark:via-pink-950/90 dark:to-pink-900/95',
        border: 'border-l-pink-500',
        iconBg: 'bg-pink-100 dark:bg-pink-900/50',
        iconColor: 'text-pink-600 dark:text-pink-400',
    },
}

/**
 * NotePopover Component
 * 
 * Displays note content as a floating popover when user clicks on a highlight.
 * Positioned absolutely at the click coordinates.
 * Similar to Word/Google Docs comment bubbles.
 */
export default function NotePopover({
    note,
    position,
    onClose,
    onEdit,
    onDelete,
    onShare,
}: NotePopoverProps) {
    if (!note || !position) return null

    const style = COLOR_STYLES[note.color || 'yellow']

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed z-50"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    maxWidth: '320px',
                    minWidth: '280px',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Arrow pointing to highlight */}
                <div className="absolute -top-2 left-4 w-4 h-4 rotate-45 bg-gradient-to-br from-background to-background border-l border-t border-border/50" />

                {/* Popover content */}
                <div className={`relative rounded-xl border-l-4 ${style.border} bg-gradient-to-br ${style.bg} backdrop-blur-xl shadow-2xl border border-border/50 overflow-hidden`}>
                    {/* Header */}
                    <div className="flex items-start justify-between p-4 pb-3 border-b border-border/30">
                        <div className="flex items-center gap-2 flex-1">
                            <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
                                <div className={`w-2 h-2 rounded-full ${style.iconColor.replace('text-', 'bg-')}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-muted-foreground">
                                    Page {note.page}
                                    {note.isPublic && (
                                        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px]">
                                            <Share2 className="h-2.5 w-2.5" />
                                            Public
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 -mt-1 -mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={onClose}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {/* Highlighted text */}
                    <div className="px-4 pt-3 pb-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Highlighted Text</p>
                        <p className="text-sm font-semibold text-foreground leading-snug">
                            "{note.text}"
                        </p>
                    </div>

                    {/* Note content */}
                    <div className="px-4 pb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Your Note</p>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                            {note.note}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 px-3 py-2 bg-background/30 border-t border-border/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs hover:bg-blue-50 dark:hover:bg-blue-950/30 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => onEdit(note)}
                        >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 text-xs transition-colors ${note.isPublic
                                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300'
                                : 'hover:bg-green-50 dark:hover:bg-green-950/30 text-muted-foreground hover:text-green-600 dark:hover:text-green-400'
                                }`}
                            onClick={() => onShare(note.id)}
                        >
                            <Share2 className="h-3 w-3 mr-1" />
                            {note.isPublic ? 'Private' : 'Share'}
                        </Button>
                        <div className="flex-1" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600"
                            onClick={() => onDelete(note.id)}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                        </Button>
                    </div>

                    {/* Timestamp footer */}
                    <div className="px-4 py-1.5 bg-background/20 border-t border-border/20">
                        <p className="text-[10px] text-muted-foreground/70">
                            {new Date(note.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
