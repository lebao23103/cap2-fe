import { X, Edit, Trash2, Globe, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'


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
    position: { x: number; y: number; arrowOffset?: number } | null
    onClose: () => void
    onEdit: (note: BookNote) => void
    onDelete: (id: string) => void
    onShare: (id: string) => void
    readOnly?: boolean
    theme?: 'light' | 'dark' | 'sepia'
}

const COLOR_STYLES = {
    yellow: {
        border: 'border-l-amber-400',
        badge: 'bg-amber-400 text-black',
        icon: 'text-amber-600 dark:text-amber-400',
    },
    blue: {
        border: 'border-l-blue-400',
        badge: 'bg-blue-400 text-black',
        icon: 'text-blue-600 dark:text-blue-400',
    },
    green: {
        border: 'border-l-green-400',
        badge: 'bg-green-400 text-black',
        icon: 'text-green-600 dark:text-green-400',
    },
    pink: {
        border: 'border-l-pink-400',
        badge: 'bg-pink-400 text-black',
        icon: 'text-pink-600 dark:text-pink-400',
    },
}

const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

/**
 * NotePopover Component
 * 
 * Displays note content as a floating popover when user clicks on a highlight.
 * Positioned absolutely at the click coordinates relative to the scrolling container.
 */
export default function NotePopover({
    note,
    position,
    onClose,
    onEdit,
    onDelete,
    onShare,
    readOnly = false,
    theme = 'light'
}: NotePopoverProps) {
    if (!note || !position) return null

    const style = COLOR_STYLES[note.color || 'yellow']

    const themeStyles = {
        light: {
            bg: 'bg-white',
            text: 'text-slate-900',
            border: 'border-black',
            shadow: 'shadow-neo',
            muted: 'text-slate-500',
            headerBorder: 'border-black',
            actionBg: 'bg-transparent',
            btn: 'border-black text-black hover:bg-black hover:text-white hover:shadow-none'
        },
        dark: {
            bg: 'bg-[#16213e]',
            text: 'text-gray-100',
            border: 'border-gray-500',
            shadow: 'shadow-neo', // Neo shadow adapts to white in dark mode
            muted: 'text-gray-400',
            headerBorder: 'border-gray-500',
            actionBg: 'bg-transparent',
            btn: 'border-gray-400 text-gray-100 hover:bg-gray-100 hover:text-gray-900 hover:shadow-none'
        },
        sepia: {
            bg: 'bg-[#f4e4c1]',
            text: 'text-[#5c4033]',
            border: 'border-[#8b7355]',
            shadow: 'shadow-[4px_4px_0px_0px_rgba(92,64,51,0.3)]',
            muted: 'text-[#5c4033]/70',
            headerBorder: 'border-[#8b7355]/30',
            actionBg: 'bg-transparent',
            btn: 'border-[#8b7355] text-[#5c4033] hover:bg-[#8b7355] hover:text-[#f4e4c1] hover:shadow-none'
        }
    }

    const currentTheme = themeStyles[theme]

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute z-[100] pointer-events-auto font-sans popover-content"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    maxWidth: '300px',
                    minWidth: '260px',
                }}
            >
                {/* Popover content */}
                <div className={`relative rounded-xl border-2 border-l-[6px] overflow-hidden z-20 ${currentTheme.bg} ${currentTheme.border} ${currentTheme.shadow} ${style.border}`}>
                    {/* Header */}
                    <div className={`flex items-start justify-between p-3 pb-2 border-b-2 ${currentTheme.headerBorder}`}>
                        <div className="flex items-center gap-1.5 flex-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 border-2 ${currentTheme.btn} uppercase`}>
                                Page {note.page}
                            </span>
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 border-2 ${note.isPublic ? 'border-green-500 bg-green-500/10 text-green-600' : 'border-gray-400 bg-gray-400/10 text-gray-500'}`}>
                                {note.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                <span className="text-[10px] font-bold uppercase">{note.isPublic ? 'Public' : 'Private'}</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose() }}
                            className={`p-1 hover:bg-black/5 rounded-lg transition-colors ${currentTheme.muted}`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                        <div className="mb-3">
                            <span className={`text-[10px] uppercase font-bold opacity-50 block mb-1 ${currentTheme.text}`}>Highlighted Text</span>
                            <p className={`font-sans text-xs font-medium leading-relaxed italic border-l-2 pl-2 ${currentTheme.text} ${note.color === 'yellow' ? 'border-amber-400' : note.color === 'blue' ? 'border-blue-400' : note.color === 'green' ? 'border-green-400' : 'border-pink-400'}`}>
                                "{truncateText(note.text, 80)}"
                            </p>
                        </div>

                        <div>
                            <span className={`text-[10px] uppercase font-bold opacity-50 block mb-1 ${currentTheme.text}`}>Your Note</span>
                            <div className={`font-sans text-sm whitespace-pre-wrap min-h-[40px] max-h-[120px] overflow-y-auto ${currentTheme.text}`}>
                                {note.note}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    {!readOnly && (
                        <div className={`p-2 border-t-2 ${currentTheme.headerBorder} ${currentTheme.actionBg} flex items-center justify-between gap-2`}>
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(note) }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase border-2 transition-all ${currentTheme.btn}`}
                                >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onShare(note.id) }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase border-2 transition-all ${currentTheme.btn}`}
                                >
                                    <Globe className="h-3 w-3" />
                                    {note.isPublic ? 'Private' : 'Public'}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
                                    className={`flex-none flex items-center justify-center p-1.5 border-2 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-500 transition-all`}
                                    title="Delete Note"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Timestamp footer */}
                    <div className={`px-3 py-1 border-t-2 ${currentTheme.actionBg} ${currentTheme.headerBorder}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${currentTheme.muted}`}>
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

                {/* Arrow pointing up to highlight - Rendered AFTER content to sit on top */}
                <div
                    className={`absolute -top-2 w-4 h-4 rotate-45 border-l-2 border-t-2 z-40 ${currentTheme.bg} ${currentTheme.border}`}
                    style={{
                        // @ts-ignore
                        left: position.arrowOffset !== undefined ? `${position.arrowOffset}px` : '50%',
                        transform: position.arrowOffset !== undefined ? 'translateX(-50%) rotate(45deg)' : 'translateX(-50%) rotate(45deg)' // Centered on the offset point
                    }}
                />
            </motion.div>
        </AnimatePresence>
    )
}
