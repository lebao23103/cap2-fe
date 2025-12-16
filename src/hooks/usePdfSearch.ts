import { useState, useCallback } from 'react'


export interface SearchResult {
    page: number
    matchText: string
    contextBefore: string
    contextAfter: string
}

export const usePdfSearch = () => {
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [progress, setProgress] = useState(0)

    const searchPdf = useCallback(async (pdfDocument: any, query: string) => {
        if (!pdfDocument || !query || query.length < 3) {
            setResults([])
            return
        }

        setIsSearching(true)
        setProgress(0)
        setResults([])

        const found: SearchResult[] = []
        const numPages = pdfDocument.numPages


        try {
            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDocument.getPage(i)
                const textContent = await page.getTextContent()

                // 1. Get original text with spaces for readable context
                const originalText = textContent.items.map((item: any) => item.str).join(' ')

                // 2. Build normalized text and index map
                let normalizedText = ''
                const textMap: number[] = [] // Maps normalized index -> originalText index

                const normalizeChar = (char: string) => {
                    const c = char.toLowerCase()
                    if (c === '’' || c === '‘') return '\''
                    if (c === '“' || c === '”') return '"'
                    return c
                }

                for (let j = 0; j < originalText.length; j++) {
                    const char = originalText[j]
                    // Skip whitespace, allow all other chars
                    if (!/\s/.test(char)) {
                        normalizedText += normalizeChar(char)
                        textMap.push(j)
                    }
                }

                // 3. Prepare normalized query
                const normalizedQuery = query.split('').map(normalizeChar).filter(c => !/\s/.test(c)).join('')

                if (normalizedQuery.length === 0) continue

                let searchPos = 0
                let matchIndex = normalizedText.indexOf(normalizedQuery, searchPos)

                while (matchIndex !== -1) {
                    // Found strict match in normalized text
                    // Map back to original text for context
                    const startIndex = matchIndex
                    const endIndex = matchIndex + normalizedQuery.length - 1

                    if (startIndex < textMap.length && endIndex < textMap.length) {
                        const origStart = textMap[startIndex]
                        const origEnd = textMap[endIndex] + 1 // +1 to include char

                        const contextStart = Math.max(0, origStart - 30)
                        const contextEnd = Math.min(originalText.length, origEnd + 30)

                        found.push({
                            page: i,
                            matchText: originalText.substring(origStart, origEnd),
                            contextBefore: (contextStart > 0 ? "..." : "") + originalText.substring(contextStart, origStart),
                            contextAfter: originalText.substring(origEnd, contextEnd) + (contextEnd < originalText.length ? "..." : "")
                        })
                    }

                    // Advance
                    searchPos = matchIndex + 1
                    matchIndex = normalizedText.indexOf(normalizedQuery, searchPos)
                }

                setProgress(Math.round((i / numPages) * 100))
            }
        } catch (e) {
            console.error("Search error:", e)
        } finally {
            setResults(found)
            setIsSearching(false)
            setProgress(100)
        }
    }, [])

    return { searchPdf, results, isSearching, progress, clearResults: () => setResults([]) }
}
