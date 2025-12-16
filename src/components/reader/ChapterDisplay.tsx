
import { useState, memo, useCallback, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, List } from 'lucide-react'
import type { ChapterInfo } from '@/hooks/usePdfChapter'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChapterDisplayProps {
    chapter: ChapterInfo | null
    outline: ChapterInfo[]
    themeStyles: any
    onNavigate: (page: number) => void
}

// Helper to recursively check if any descendant is active
const checkActiveDescendant = (item: ChapterInfo, activePage: number): boolean => {
    if (!item.children || item.children.length === 0) return false
    return item.children.some(child =>
        child.pageNumber === activePage || checkActiveDescendant(child, activePage)
    )
}

const ChapterItem = memo(({
    item,
    level = 0,
    activePage,
    onNavigate
}: {
    item: ChapterInfo,
    level?: number,
    activePage: number,
    onNavigate: (p: number) => void
}) => {
    const isActive = activePage === item.pageNumber
    const hasActiveChild = useMemo(() => checkActiveDescendant(item, activePage), [item, activePage])

    const [expanded, setExpanded] = useState(false)
    const hasChildren = item.children && item.children.length > 0

    // Auto-expand if ancestor of active page
    useEffect(() => {
        if (hasActiveChild) {
            setExpanded(true)
        }
    }, [hasActiveChild])

    const handleNavigate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onNavigate(item.pageNumber)
    }, [item.pageNumber, onNavigate])

    const toggleExpand = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setExpanded(prev => !prev)
    }, [])

    return (
        <div className="flex flex-col">
            <div
                className={`
                    flex items-center gap-2 py-2 px-3 border-b border-black/10 dark:border-white/10
                    hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors
                    ${isActive ? 'bg-primary/20 dark:bg-primary/20 text-primary-foreground font-black' : ''}
                    ${!isActive && hasActiveChild ? 'bg-primary/5 dark:bg-primary/10 font-bold' : ''}
                `}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={handleNavigate}
            >
                {hasChildren ? (
                    <button
                        onClick={toggleExpand}
                        className="p-1 hover:bg-black/10 rounded transition-colors"
                    >
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                ) : (
                    <span className="w-6" /> // spacer
                )}

                <span className={`text-sm truncate ${isActive ? 'font-bold' : ''}`}>
                    {item.title}
                </span>

                <span className="ml-auto text-xs opacity-50 font-mono">
                    {item.pageNumber}
                </span>
            </div>

            <AnimatePresence initial={false}>
                {expanded && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        {item.children?.map((child, idx) => (
                            <ChapterItem
                                key={idx}
                                item={child}
                                level={level + 1}
                                activePage={activePage}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
})

export default function ChapterDisplay({ chapter, outline, themeStyles, onNavigate }: ChapterDisplayProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className={`hidden sm:flex items-center gap-2 flex-1 max-w-[300px] overflow-hidden border-2 ${themeStyles.border} rounded-lg h-9 px-3 relative bg-clip-padding cursor-pointer hover:bg-black/5 transition-all active:scale-[0.98] select-none`}
            >
                <List className={`h-4 w-4 shrink-0 ${themeStyles.text}`} />

                <div className="flex-1 overflow-hidden whitespace-nowrap relative flex items-center">
                    <div className={`
                        inline-block 
                        ${(chapter?.title?.length || 0) > 30 ? 'animate-marquee pl-[100%]' : ''}
                        text-xs font-bold uppercase tracking-wide ${themeStyles.text}
                    `}>
                        {chapter?.title || "Table of Contents"}
                    </div>
                </div>

                <style>{`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-100%); }
                    }
                    .animate-marquee {
                        animation: marquee 10s linear infinite;
                    }
                `}</style>
            </div>

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9998] will-change-opacity"
                            />

                            {/* Slide Up Panel */}
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.8 }}
                                className={`fixed bottom-0 left-0 right-0 h-[60vh] z-[9999] border-t-4 border-black dark:border-white bg-background shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col will-change-transform`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b-2 border-black/10 dark:border-white/10 bg-muted/50">
                                    <h3 className="font-black uppercase tracking-widest text-lg flex items-center gap-2">
                                        <List className="h-5 w-5" />
                                        Table of Contents
                                    </h3>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-black/10 rounded-lg font-bold transition-colors"
                                    >
                                        CLOSE
                                    </button>
                                </div>

                                {/* Content */}
                                <ScrollArea className="flex-1 p-0">
                                    {outline.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                            <p>No chapters found in this PDF.</p>
                                        </div>
                                    ) : (
                                        <div className="pb-10">
                                            {outline.map((item, idx) => (
                                                <ChapterItem
                                                    key={idx}
                                                    item={item}
                                                    activePage={chapter?.pageNumber || 0}
                                                    onNavigate={(p) => {
                                                        onNavigate(p)
                                                        setIsOpen(false)
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}
