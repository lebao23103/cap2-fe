import React, { useEffect, useState } from 'react'

interface TransientHighlightOverlayProps {
    page: number
    text: string
    activePage: number
    containerRef: React.RefObject<HTMLDivElement | null>
}

export default function TransientHighlightOverlay({
    page,
    text,
    activePage,
    containerRef
}: TransientHighlightOverlayProps) {
    const [rects, setRects] = useState<DOMRect[]>([])

    useEffect(() => {
        if (page !== activePage || !text || !containerRef.current) {
            setRects([])
            return
        }

        const container = containerRef.current
        const textLayer = container.querySelector('.react-pdf__Page__textContent') || container
        if (!textLayer) return

        // Simple text finder (similar to legacy highlight)
        // We don't have position for search results usually (unless we stored it).
        // Search API gives context but not exact offset usually unless we calculated it.
        // For search finding, iterating spans for text match is standard.

        const findRects = () => {
            const foundRects: DOMRect[] = []
            const spans = Array.from(textLayer.querySelectorAll('span'))

            // MAP STRATEGY: 
            // 1. Flatten all text into a "normalized" string (no spaces, everything lower case)
            // 2. Keep a parallel array mapping each char in the normalized string back to {node, index}

            let normalizedPageText = ''
            const charMap: { node: Node, index: number }[] = []

            const normalizeChar = (char: string) => {
                // Handle smart quotes and other common mismatches
                const c = char.toLowerCase()
                if (c === '’' || c === '‘') return '\''
                if (c === '“' || c === '”') return '"'
                return c
            }

            spans.forEach(span => {
                // Iterate deep because some PDF renderers nest bdi/dir tags
                const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT)
                let textNode: Node | null

                while ((textNode = walker.nextNode())) {
                    const content = textNode.textContent || ''
                    for (let i = 0; i < content.length; i++) {
                        const char = content[i]
                        // Skip whitespace in our "searchable" string
                        if (!/\s/.test(char)) {
                            normalizedPageText += normalizeChar(char)
                            charMap.push({ node: textNode, index: i })
                        }
                    }
                }
            })

            // Prepare Query
            const normalizedQuery = text.split('').map(normalizeChar).filter(c => !/\s/.test(c)).join('')

            if (normalizedQuery.length === 0) return

            let searchPos = 0
            let matchIndex = normalizedPageText.indexOf(normalizedQuery, searchPos)

            // Limit to first match for "blink" effect to avoid visual chaos if common word
            // Or allow all? User said "nháy highlight" when clicking result. 
            // Usually specific result -> specific highlight. 
            // But we don't have exact position passed in, just the text. 
            // For long paragraphs, unique match is likely. For "the", it will find all.
            // Let's limiting to ALL is fine, but maybe cap it if too many?

            while (matchIndex !== -1) {
                const startMap = charMap[matchIndex]
                const endMap = charMap[matchIndex + normalizedQuery.length - 1]

                if (startMap && endMap) {
                    try {
                        const range = document.createRange()
                        range.setStart(startMap.node, startMap.index)
                        range.setEnd(endMap.node, endMap.index + 1) // +1 to include last char

                        const clientRects = range.getClientRects()
                        for (let i = 0; i < clientRects.length; i++) {
                            foundRects.push(clientRects[i])
                        }
                    } catch (e) {
                        console.warn("Highlight range error", e)
                    }
                }

                // Find next
                searchPos = matchIndex + 1
                matchIndex = normalizedPageText.indexOf(normalizedQuery, searchPos)
            }

            setRects(foundRects)
        }

        // Delay slightly for text layer render
        const timer = setTimeout(findRects, 500)
        return () => clearTimeout(timer)
    }, [page, text, activePage, containerRef])

    if (rects.length === 0) return null

    // Reference rect for absolute positioning
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return null

    return (
        <div className="absolute inset-0 pointer-events-none z-20">
            {rects.map((r, i) => (
                <div
                    key={i}
                    className="absolute bg-primary/50 animate-blink-3"
                    style={{
                        top: r.top - containerRect.top,
                        left: r.left - containerRect.left,
                        width: r.width,
                        height: r.height,
                    }}
                />
            ))}
            <style>{`
                @keyframes blink3 {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
                .animate-blink-3 {
                    animation: blink3 1s ease-in-out 3;
                }
            `}</style>
        </div>
    )
}
