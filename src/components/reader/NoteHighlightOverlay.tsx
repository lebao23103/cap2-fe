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
        console.log('Calculating highlights for page:', currentPage, 'Notes:', notes.length)
        if (!notes.length) {
            setHighlightRects([])
            return
        }

        // Find the PDF textLayer element
        // We look for the textLayer specifically within the current page context if possible
        // or fall back to the generic selector but check for visibility/existence
        const textLayer = document.querySelector(`.react-pdf__Page[data-page-number="${currentPage}"] .react-pdf__Page__textContent`) ||
            document.querySelector('.react-pdf__Page__textContent')

        if (!textLayer) {
            console.log('Text layer not found yet')
            // Retry a few times if text layer isn't ready yet
            return
        }
        console.log('Text layer found:', textLayer)

        const rects: HighlightRect[] = []
        // Use the passed container ref or fallback to the textLayer itself as the reference frame
        // If using containerRef, we calculate position relative to that container
        const referenceRect = containerRef?.current?.getBoundingClientRect() || textLayer.getBoundingClientRect()
        console.log('Reference rect:', referenceRect)

        for (const note of notes) {
            if (!note.text) continue
            console.log('Processing note:', note.id, note.text.substring(0, 20) + '...')

            try {
                // Get all text spans in the textLayer
                const textSpans = Array.from(textLayer.querySelectorAll('span'))

                // Robust Text Matching Strategy: Concatenate and Map (Whitespace Agnostic)
                // 1. Filter visible spans and build a full text string
                // 2. Keep a mapping of "clean" character indices (no whitespace) to spans and offsets
                // 3. Find the note text (also cleaned) in the full clean string
                // 4. Map back to spans to get coordinates

                const visibleSpans: { span: HTMLElement, text: string }[] = []

                // Map from clean index to { spanIndex, offsetInSpan }
                const cleanIndexMap: { spanIndex: number, offset: number }[] = []
                let fullCleanText = ''

                textSpans.forEach((span) => {
                    const rect = span.getBoundingClientRect()
                    // Skip invisible spans
                    if (rect.width === 0 || rect.height === 0) return

                    const text = span.textContent || ''
                    if (!text) return

                    visibleSpans.push({
                        span: span as HTMLElement,
                        text: text
                    })

                    // Build clean text and mapping
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i]
                        // If char is not whitespace, add to clean text and map
                        if (/\S/.test(char)) {
                            cleanIndexMap.push({
                                spanIndex: visibleSpans.length - 1,
                                offset: i
                            })
                            fullCleanText += char.toLowerCase()
                        }
                    }
                })

                // Normalize note text (remove all whitespace)
                const cleanNoteText = note.text.replace(/\s+/g, '').toLowerCase()

                // Find matches in clean text
                const matchIndex = fullCleanText.indexOf(cleanNoteText)

                if (matchIndex !== -1) {
                    console.log('Found match at clean index:', matchIndex)
                    const matchEndIndex = matchIndex + cleanNoteText.length

                    // Identify spans involved in the match
                    const startMap = cleanIndexMap[matchIndex]
                    // For end map, we need the index of the last character, which is matchEndIndex - 1
                    // But if matchEndIndex is 0 (empty string), this would be -1.
                    // Assuming cleanNoteText is not empty.
                    const endMap = cleanIndexMap[matchEndIndex - 1]

                    if (startMap && endMap) {
                        const startSpanIndex = startMap.spanIndex
                        const endSpanIndex = endMap.spanIndex

                        // Iterate through spans from start to end
                        for (let i = startSpanIndex; i <= endSpanIndex; i++) {
                            const spanData = visibleSpans[i]
                            const span = spanData.span

                            // Determine start and end offsets for this span
                            let startOffset = 0
                            let endOffset = spanData.text.length

                            // If this is the first span, use the start offset from map
                            if (i === startSpanIndex) {
                                startOffset = startMap.offset
                            }

                            // If this is the last span, use the end offset from map (+1 for exclusive range)
                            if (i === endSpanIndex) {
                                endOffset = endMap.offset + 1
                            }

                            try {
                                const range = document.createRange()
                                const textNode = span.firstChild
                                if (!textNode) {
                                    // Fallback if no text node
                                    rects.push({
                                        ...span.getBoundingClientRect(),
                                        x: span.getBoundingClientRect().left - referenceRect.left,
                                        y: span.getBoundingClientRect().top - referenceRect.top,
                                        noteId: note.id,
                                        color: HIGHLIGHT_COLORS[note.color || 'yellow']
                                    } as HighlightRect)
                                    continue
                                }

                                // Ensure offsets are within bounds
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
                                console.error('Error creating range for span:', e)
                            }
                        }
                    }
                } else {
                    console.log('No match found in full text for note:', note.id)
                }
            } catch (error) {
                console.error('Error calculating highlight for note:', note.id, error)
            }
        }

        console.log('Total rects generated:', rects.length)
        setHighlightRects(rects)
    }, [notes, currentPage, containerRef])

    // Recalculate highlights when notes change or page loads
    useEffect(() => {
        // Wait for textLayer to render
        // We poll a few times to ensure textLayer is ready
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
        console.log('Highlight clicked:', noteId)
        const note = notes.find(n => n.id === noteId)
        if (note && onHighlightClick) {
            // Get the bounding rect of the clicked element (the highlight rect)
            const target = e.currentTarget as Element
            const rect = target.getBoundingClientRect()

            console.log('Calling onHighlightClick with position:', { x: e.clientX, y: e.clientY, rect })
            // Pass the click coordinates directly, plus the rect for better positioning
            onHighlightClick(note, { x: e.clientX, y: e.clientY, rect })
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
                    {highlightRects.map((rect, i) => {
                        const isHovered = hoveredNoteId === rect.noteId

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
