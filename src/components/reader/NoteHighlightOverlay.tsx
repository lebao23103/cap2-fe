import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BookNote {
    id: string
    text: string
    note: string
    page: number
    timestamp: string
    color?: 'yellow' | 'blue' | 'green' | 'pink'
    isPublic?: boolean
    position_start?: number
    position_end?: number
}

interface HighlightRect {
    x: number
    y: number
    width: number
    height: number
    noteId: string
    color: string
}

interface NoteHighlightOverlayProps {
    notes: BookNote[]
    currentPage: number
    onHighlightClick?: (note: BookNote) => void
    containerRef?: React.RefObject<HTMLDivElement>
}

// Color mapping from note color to hex with opacity
const HIGHLIGHT_COLORS = {
    yellow: '#FFEB3B',
    blue: '#2196F3',
    green: '#4CAF50',
    pink: '#E91E63',
} as const

/**
 * NoteHighlightOverlay Component
 * 
 * Renders highlight overlays on top of PDF pages using SVG rectangles.
 * Calculates positions from PDF.js textLayer and BookNote position data.
 */
export default function NoteHighlightOverlay({
    notes,
    currentPage,
    onHighlightClick,
    containerRef,
}: NoteHighlightOverlayProps) {
    const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([])
    const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null)

    /**
     * Calculate highlight rectangles from notes
     * Uses PDF.js textLayer to map character positions to DOM coordinates
     */
    const calculateHighlights = useCallback(async () => {
        if (!notes.length) {
            setHighlightRects([])
            return
        }

        // Find the PDF textLayer element
        const textLayer = document.querySelector('.react-pdf__Page__textContent')
        if (!textLayer) {
            console.warn('TextLayer not found, highlights cannot be rendered')
            return
        }

        const rects: HighlightRect[] = []

        for (const note of notes) {
            // For MVP: Simple approach - find text in textLayer
            // In future: Use position_start/end for precise positioning

            if (!note.text) continue

            try {
                // Get all text spans in the textLayer
                const textSpans = Array.from(textLayer.querySelectorAll('span'))

                // Find spans that contain the highlighted text
                let foundText = false
                let startSpan: HTMLElement | null = null
                let endSpan: HTMLElement | null = null
                let startOffset = 0
                let endOffset = 0

                // Simple text matching (can be improved with position_start/end)
                for (let i = 0; i < textSpans.length; i++) {
                    const span = textSpans[i] as HTMLElement
                    const spanText = span.textContent || ''

                    if (!foundText && spanText.includes(note.text.substring(0, 10))) {
                        // Found start of highlighted text
                        foundText = true
                        startSpan = span
                        startOffset = spanText.indexOf(note.text.substring(0, 10))

                        // Check if entire text is within this span
                        if (spanText.includes(note.text)) {
                            endSpan = span
                            endOffset = spanText.indexOf(note.text) + note.text.length
                            break
                        }
                    } else if (foundText && spanText.includes(note.text.slice(-10))) {
                        // Found end of highlighted text
                        endSpan = span
                        endOffset = spanText.indexOf(note.text.slice(-10)) + 10
                        break
                    }
                }

                if (startSpan && endSpan) {
                    // Get bounding rectangles
                    const startRect = startSpan.getBoundingClientRect()
                    const endRect = endSpan.getBoundingClientRect()
                    const containerRect = textLayer.getBoundingClientRect()

                    // Calculate relative position to textLayer
                    const x = startRect.left - containerRect.left
                    const y = startRect.top - containerRect.top
                    const width = endRect.right - startRect.left
                    const height = Math.max(startRect.height, endRect.height)

                    rects.push({
                        x,
                        y,
                        width,
                        height,
                        noteId: note.id,
                        color: HIGHLIGHT_COLORS[note.color || 'yellow'],
                    })
                }
            } catch (error) {
                console.error('Error calculating highlight for note:', note.id, error)
            }
        }

        setHighlightRects(rects)
    }, [notes])

    // Recalculate highlights when notes change or page loads
    useEffect(() => {
        // Wait for textLayer to render
        const timer = setTimeout(() => {
            calculateHighlights()
        }, 300)

        return () => clearTimeout(timer)
    }, [calculateHighlights, currentPage])

    // Handle click on highlight
    const handleHighlightClick = (noteId: string) => {
        const note = notes.find(n => n.id === noteId)
        if (note && onHighlightClick) {
            onHighlightClick(note)
        }
    }

    if (!highlightRects.length) {
        return null
    }

    return (
        <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
            >
                <AnimatePresence>
                    {highlightRects.map((rect) => {
                        const isHovered = hoveredNoteId === rect.noteId

                        return (
                            <motion.rect
                                key={rect.noteId}
                                x={rect.x}
                                y={rect.y}
                                width={rect.width}
                                height={rect.height}
                                fill={rect.color}
                                opacity={isHovered ? 0.5 : 0.3}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isHovered ? 0.5 : 0.3 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="cursor-pointer transition-opacity"
                                style={{
                                    pointerEvents: 'auto',
                                    mixBlendMode: 'multiply',
                                }}
                                onClick={() => handleHighlightClick(rect.noteId)}
                                onMouseEnter={() => setHoveredNoteId(rect.noteId)}
                                onMouseLeave={() => setHoveredNoteId(null)}
                            />
                        )
                    })}
                </AnimatePresence>
            </svg>
        </div>
    )
}
