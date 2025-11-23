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

console.log('HIGHLIGHT_COLORS:', HIGHLIGHT_COLORS);

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
    console.log('NoteHighlightOverlay rendered with props:', { notes, currentPage });
    
    const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([])
    const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null)
    
    console.log('Highlight rects state:', highlightRects);

    /**
     * Calculate highlight rectangles from notes
     * Uses PDF.js textLayer to map character positions to DOM coordinates
     */
    const calculateHighlights = useCallback(async () => {
        console.log('Calculating highlights for notes:', notes);
        if (!notes.length) {
            setHighlightRects([])
            return
        }

        // Find the PDF textLayer element - try multiple selectors
        let textLayer = document.querySelector('.react-pdf__Page__textContent') as HTMLElement | null;
        console.log('First text layer query result:', textLayer);
        
        if (!textLayer) {
            textLayer = document.querySelector('.textLayer') as HTMLElement | null;
            console.log('Second text layer query result:', textLayer);
        }
        
        if (!textLayer) {
            // Try to find any element with text content
            const possibleLayers = document.querySelectorAll('[class*="text"]') as NodeListOf<HTMLElement>;
            console.log('Possible text layers:', possibleLayers);
            if (possibleLayers.length > 0) {
                textLayer = possibleLayers[0];
                console.log('Using first possible text layer:', textLayer);
            }
        }

        if (!textLayer) {
            // Log all elements to see what's available
            console.log('Document elements for debugging:');
            const allElements = document.querySelectorAll('*');
            const classNames = new Set<string>();
            allElements.forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    el.className.split(' ').forEach(cls => {
                        if (cls) classNames.add(cls);
                    });
                }
            });
            console.log('All class names in document:', Array.from(classNames).sort());
            
            console.warn('TextLayer not found, highlights cannot be rendered')
            return
        }

        const rects: HighlightRect[] = []
        const containerRect = textLayer.getBoundingClientRect()
        console.log('Container rect:', containerRect);

        for (const note of notes) {
            if (!note.text) continue

            try {
                // Get all text spans in the textLayer
                const textSpans = Array.from(textLayer.querySelectorAll('span')) as HTMLElement[]
                console.log('Text spans for note:', note.text, textSpans);
                
                // Normalize the note text for better matching
                const normalizedNoteText = note.text.trim().replace(/\s+/g, ' ')
                console.log('Normalized note text:', normalizedNoteText);
                
                // Try to find the text in spans
                let foundMatch = false
                
                // Simple approach: Look for exact match in all spans
                for (let i = 0; i < textSpans.length; i++) {
                    const span = textSpans[i]
                    const spanText = (span.textContent || '').trim().replace(/\s+/g, ' ')
                    
                    // Check for exact match
                    const exactIndex = spanText.indexOf(normalizedNoteText)
                    if (exactIndex !== -1) {
                        console.log('Found exact match in span:', i, spanText);
                        foundMatch = true
                        
                        // Create a range to get precise positioning
                        const range = document.createRange()
                        try {
                            range.setStart(span.firstChild || span, exactIndex)
                            range.setEnd(span.firstChild || span, exactIndex + normalizedNoteText.length)
                            
                            const clientRects = range.getClientRects()
                            
                            // Create highlight rectangles for each line
                            for (let j = 0; j < clientRects.length; j++) {
                                const rect = clientRects[j]
                                const x = rect.left - containerRect.left
                                const y = rect.top - containerRect.top
                                const width = rect.width
                                const height = rect.height
                                
                                rects.push({
                                    x,
                                    y,
                                    width,
                                    height,
                                    noteId: note.id,
                                    color: HIGHLIGHT_COLORS[note.color || 'yellow'],
                                })
                                console.log('Added highlight rect:', {
                                    x,
                                    y,
                                    width,
                                    height,
                                    noteId: note.id,
                                    color: HIGHLIGHT_COLORS[note.color || 'yellow'],
                                });
                            }
                        } catch (rangeError) {
                            // Fallback to bounding box approach
                            const spanRect = span.getBoundingClientRect()
                            const totalWidth = spanRect.width
                            const charWidth = totalWidth / (spanText.length || 1)
                            const x = spanRect.left - containerRect.left + (exactIndex * charWidth)
                            const y = spanRect.top - containerRect.top
                            const width = normalizedNoteText.length * charWidth
                            const height = spanRect.height
                            
                            rects.push({
                                x,
                                y,
                                width,
                                height,
                                noteId: note.id,
                                color: HIGHLIGHT_COLORS[note.color || 'yellow'],
                            })
                            console.log('Added fallback highlight rect:', {
                                x,
                                y,
                                width,
                                height,
                                noteId: note.id,
                                color: HIGHLIGHT_COLORS[note.color || 'yellow'],
                            });
                        }
                        break
                    }
                }
                
                // If no exact match, try approximate matching
                if (!foundMatch) {
                    console.log('No exact match found, trying approximate matching');
                    for (let i = 0; i < textSpans.length; i++) {
                        const span = textSpans[i]
                        const spanText = span.textContent || ''
                        console.log('Checking span for approximate match:', spanText);
                        
                        // Check for partial match (first few characters)
                        if (spanText.includes(note.text.substring(0, Math.min(10, note.text.length)))) {
                            console.log('Found approximate match in span:', i, spanText);
                            foundMatch = true
                            
                            // Create highlight using bounding box approach
                            const spanRect = span.getBoundingClientRect()
                            const x = spanRect.left - containerRect.left
                            const y = spanRect.top - containerRect.top
                            const width = spanRect.width
                            const height = spanRect.height
                            
                            rects.push({
                                x,
                                y,
                                width,
                                height,
                                noteId: note.id,
                                color: HIGHLIGHT_COLORS[note.color || 'yellow'],
                            })
                            console.log('Added second fallback highlight rect:', {
                                x,
                                y,
                                width,
                                height,
                                noteId: note.id,
                                color: HIGHLIGHT_COLORS[note.color || 'yellow'],
                            });
                            break
                        }
                    }
                }
            } catch (error) {
                console.error('Error calculating highlight for note:', note.id, error)
            }
        }

        console.log('Generated highlight rects:', rects)
        setHighlightRects(rects)
    }, [notes])

    // Recalculate highlights when notes change or page loads
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryCalculateHighlights = () => {
            attempts++;
            const textLayer = document.querySelector('.react-pdf__Page__textContent')
            
            if (textLayer) {
                // Add a small delay to ensure text layer is fully rendered
                setTimeout(() => {
                    calculateHighlights()
                }, 50)
            } else if (attempts < maxAttempts) {
                // Retry every 100ms until text layer is available or max attempts reached
                setTimeout(tryCalculateHighlights, 100)
            } else {
                console.warn('Text layer not found after', maxAttempts, 'attempts')
            }
        }
        
        tryCalculateHighlights()
    }, [calculateHighlights, currentPage])

    // Handle click on highlight
    const handleHighlightClick = (noteId: string) => {
        const note = notes.find(n => n.id === noteId)
        if (note && onHighlightClick) {
            onHighlightClick(note)
        }
    }

    if (!highlightRects.length) {
        console.log('No highlight rects to render');
        return null;
    }
    
    console.log('Rendering highlight rects:', highlightRects);

    return (
        <div
            className="absolute inset-0 pointer-events-none z-50"
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
                                opacity={isHovered ? 0.7 : 0.5} // Increased opacity
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isHovered ? 0.7 : 0.5 }} // Increased opacity
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