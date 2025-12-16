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
    onHighlightClick?: (note: BookNote, position: { x: number, y: number, rect?: DOMRect }) => void
    containerRef?: React.RefObject<HTMLDivElement | null>
    highlightStyle?: 'classic' | 'box' | 'glow'
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
    highlightStyle = 'classic'
}: NoteHighlightOverlayProps) {
    const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([])
    const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null)

    /**
     * Calculate highlight rectangles from notes
     * Uses PDF.js textLayer to map character positions to DOM coordinates
     */
    const calculateHighlights = useCallback(async () => {
        // ... (calculation logic unchanged) 
        console.log('Calculating highlights for page:', currentPage, 'Notes:', notes.length)
        if (!notes.length) {
            setHighlightRects([])
            return
        }

        const textLayer = document.querySelector(`.react-pdf__Page[data-page-number="${currentPage}"] .react-pdf__Page__textContent`) ||
            document.querySelector('.react-pdf__Page__textContent')

        if (!textLayer) return

        const rects: HighlightRect[] = []
        const referenceRect = containerRef?.current?.getBoundingClientRect() || textLayer.getBoundingClientRect()

        for (const note of notes) {
            if (!note.text) continue

            try {

                const textSpans = Array.from(textLayer.querySelectorAll('span'))

                // HIGHLIGHT V2: Use precise positions if available
                if (typeof note.position_start === 'number' &&
                    typeof note.position_end === 'number' &&
                    note.position_end > note.position_start) {

                    let currentPos = 0
                    const referenceRect = containerRef?.current?.getBoundingClientRect() || textLayer.getBoundingClientRect()

                    for (let i = 0; i < textSpans.length; i++) {
                        const span = textSpans[i]
                        const text = span.textContent || ''
                        const spanStart = currentPos
                        const spanEnd = currentPos + text.length

                        // Check if span overlaps with note range
                        if (spanEnd > note.position_start && spanStart < note.position_end) {
                            // Calculate local offsets for this span
                            const startOffset = Math.max(0, note.position_start - spanStart)
                            const endOffset = Math.min(text.length, note.position_end - spanStart)

                            if (startOffset < endOffset) {
                                try {
                                    const range = document.createRange()
                                    const textNode = span.firstChild

                                    if (textNode) {
                                        range.setStart(textNode, startOffset)
                                        range.setEnd(textNode, endOffset)
                                        const clientRects = range.getClientRects()

                                        for (let j = 0; j < clientRects.length; j++) {
                                            const r = clientRects[j]
                                            rects.push({
                                                x: r.left - referenceRect.left,
                                                y: r.top - referenceRect.top,
                                                width: r.width,
                                                height: r.height,
                                                noteId: note.id,
                                                color: HIGHLIGHT_COLORS[note.color || 'yellow'],
                                            })
                                        }
                                    } else {
                                        // Fallback for empty spans or spans without text node?
                                        // Usually shouldn't happen if text.length > 0
                                    }
                                } catch (e) {
                                    console.warn("Error highlighting span", e)
                                }
                            }
                        }

                        currentPos += text.length
                        if (currentPos >= note.position_end) break
                    }
                    continue // Skip legacy logic
                }

                // LEGACY LOGIC: Clean text matching
                const visibleSpans: { span: HTMLElement, text: string }[] = []
                const cleanIndexMap: { spanIndex: number, offset: number }[] = []
                let fullCleanText = ''

                textSpans.forEach((span) => {
                    const rect = span.getBoundingClientRect()
                    if (rect.width === 0 || rect.height === 0) return

                    const text = span.textContent || ''
                    if (!text) return

                    visibleSpans.push({ span: span as HTMLElement, text: text })

                    for (let i = 0; i < text.length; i++) {
                        const char = text[i]
                        if (/\S/.test(char)) {
                            cleanIndexMap.push({ spanIndex: visibleSpans.length - 1, offset: i })
                            fullCleanText += char.toLowerCase()
                        }
                    }
                })

                const cleanNoteText = note.text.replace(/\s+/g, '').toLowerCase()
                const matchIndex = fullCleanText.indexOf(cleanNoteText)

                if (matchIndex !== -1) {
                    const matchEndIndex = matchIndex + cleanNoteText.length
                    const startMap = cleanIndexMap[matchIndex]
                    const endMap = cleanIndexMap[matchEndIndex - 1]

                    if (startMap && endMap) {
                        const startSpanIndex = startMap.spanIndex
                        const endSpanIndex = endMap.spanIndex

                        for (let i = startSpanIndex; i <= endSpanIndex; i++) {
                            const spanData = visibleSpans[i]
                            const span = spanData.span

                            let startOffset = 0
                            let endOffset = spanData.text.length

                            if (i === startSpanIndex) startOffset = startMap.offset
                            if (i === endSpanIndex) endOffset = endMap.offset + 1

                            try {
                                const range = document.createRange()
                                const textNode = span.firstChild
                                if (!textNode) {
                                    rects.push({
                                        ...span.getBoundingClientRect(),
                                        x: span.getBoundingClientRect().left - referenceRect.left,
                                        y: span.getBoundingClientRect().top - referenceRect.top,
                                        noteId: note.id,
                                        color: HIGHLIGHT_COLORS[note.color || 'yellow']
                                    } as HighlightRect)
                                    continue
                                }

                                const safeStart = Math.min(startOffset, textNode.textContent?.length || 0)
                                const safeEnd = Math.min(endOffset, textNode.textContent?.length || 0)

                                if (safeStart < safeEnd) {
                                    range.setStart(textNode, safeStart)
                                    range.setEnd(textNode, safeEnd)
                                    const clientRects = range.getClientRects()
                                    for (let j = 0; j < clientRects.length; j++) {
                                        const r = clientRects[j]
                                        rects.push({
                                            x: r.left - referenceRect.left,
                                            y: r.top - referenceRect.top,
                                            width: r.width,
                                            height: r.height,
                                            noteId: note.id,
                                            color: HIGHLIGHT_COLORS[note.color || 'yellow'],
                                        })
                                    }
                                }
                            } catch (e) {
                                console.error(e)
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }
        setHighlightRects(rects)
    }, [notes, currentPage, containerRef])

    // Recalculate highlights when notes change or page loads
    useEffect(() => {
        let attempts = 0
        const maxAttempts = 10
        const checkAndCalculate = () => {
            const textLayer = document.querySelector(`.react-pdf__Page[data-page-number="${currentPage}"] .react-pdf__Page__textContent`) ||
                document.querySelector('.react-pdf__Page__textContent')

            if (textLayer && textLayer.children.length > 0) {
                calculateHighlights()
            } else if (attempts < maxAttempts) {
                attempts++
                setTimeout(checkAndCalculate, 200)
            }
        }
        const timer = setTimeout(checkAndCalculate, 300)
        return () => clearTimeout(timer)
    }, [calculateHighlights, currentPage])

    // Handle click on highlight
    const handleHighlightClick = (noteId: string, e: React.MouseEvent) => {
        const note = notes.find(n => n.id === noteId)
        if (note && onHighlightClick) {
            const target = e.currentTarget as Element
            const rect = target.getBoundingClientRect()
            onHighlightClick(note, { x: e.clientX, y: e.clientY, rect })
        }
    }

    if (!highlightRects.length) {
        return null
    }

    return (
        <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                <AnimatePresence>
                    {highlightRects.map((rect, i) => {
                        const isHovered = hoveredNoteId === rect.noteId

                        if (highlightStyle === 'box') {
                            return (
                                <motion.rect
                                    key={`${rect.noteId}-${i}`}
                                    x={rect.x - 2}
                                    y={rect.y - 1} // Slightly offset to encompass text
                                    width={rect.width + 4}
                                    height={rect.height + 2}
                                    fill="transparent"
                                    stroke={rect.color}
                                    strokeWidth={2}
                                    strokeDasharray="4 2"
                                    opacity={isHovered ? 1 : 0.7}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isHovered ? 1 : 0.7 }}
                                    exit={{ opacity: 0 }}
                                    className="cursor-pointer transition-opacity"
                                    style={{ pointerEvents: 'auto' }}
                                    onClick={(e) => { e.stopPropagation(); handleHighlightClick(rect.noteId, e) }}
                                    onMouseEnter={() => setHoveredNoteId(rect.noteId)}
                                    onMouseLeave={() => setHoveredNoteId(null)}
                                />
                            )
                        } else if (highlightStyle === 'glow') {
                            return (
                                <motion.rect
                                    key={`${rect.noteId}-${i}`}
                                    x={rect.x}
                                    y={rect.y + rect.height - 2}
                                    width={rect.width}
                                    height={2}
                                    fill={rect.color}
                                    opacity={isHovered ? 1 : 0.8}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isHovered ? 1 : 0.8 }}
                                    exit={{ opacity: 0 }}
                                    className="cursor-pointer transition-opacity"
                                    style={{
                                        pointerEvents: 'auto',
                                        filter: `drop-shadow(0 0 4px ${rect.color}) drop-shadow(0 0 8px ${rect.color})` // Neon glow effect
                                    }}
                                    onClick={(e) => { e.stopPropagation(); handleHighlightClick(rect.noteId, e) }}
                                    onMouseEnter={() => setHoveredNoteId(rect.noteId)}
                                    onMouseLeave={() => setHoveredNoteId(null)}
                                />
                            )
                        }

                        // Classic Style
                        return (
                            <motion.rect
                                key={`${rect.noteId}-${i}`}
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
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // @ts-ignore
                                    handleHighlightClick(rect.noteId, e)
                                }}
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
