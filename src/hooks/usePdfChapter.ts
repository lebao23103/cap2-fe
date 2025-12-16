import { useState, useCallback } from 'react'

export interface ChapterInfo {
    title: string
    pageNumber: number
    children?: ChapterInfo[]
}

export const usePdfChapter = () => {
    const [chapters, setChapters] = useState<ChapterInfo[]>([]) // Flat list for easy lookup
    const [outline, setOutline] = useState<ChapterInfo[]>([])   // Tree structure for UI
    const [currentChapter, setCurrentChapter] = useState<ChapterInfo | null>(null)

    const extractChapters = useCallback(async (pdfDocument: any) => {
        if (!pdfDocument) return

        try {
            const rawOutline = await pdfDocument.getOutline()
            if (!rawOutline) {
                setChapters([])
                setOutline([])
                return
            }

            const flatChapters: ChapterInfo[] = []

            const processItems = async (items: any[]): Promise<ChapterInfo[]> => {
                const result: ChapterInfo[] = []

                for (const item of items) {
                    let pageNumber = 0
                    try {
                        if (typeof item.dest === 'string') {
                            const pageIndex = await pdfDocument.getPageIndex(item.dest)
                            pageNumber = pageIndex + 1
                        } else if (Array.isArray(item.dest)) {
                            const ref = item.dest[0]
                            const pageIndex = await pdfDocument.getPageIndex(ref)
                            pageNumber = pageIndex + 1
                        }
                    } catch (e) {
                        console.warn("Error resolving page for item", item.title, e)
                    }

                    const node: ChapterInfo = {
                        title: item.title,
                        pageNumber: pageNumber || 0, // 0 if failed
                        children: []
                    }

                    // Only add to result if page is valid (some PDF outlines have broken links)
                    // But sometimes headers have no page (just container). 
                    // If pageNumber is 0, we can still show it but it won't be clickable?

                    if (node.pageNumber > 0) {
                        flatChapters.push(node)
                    }

                    if (item.items && item.items.length > 0) {
                        node.children = await processItems(item.items)
                    }

                    result.push(node)
                }
                return result
            }

            const processedOutline = await processItems(rawOutline)

            // Sort flat chapters for binary search or easy finding
            flatChapters.sort((a, b) => a.pageNumber - b.pageNumber)

            setChapters(flatChapters)
            setOutline(processedOutline)
        } catch (e) {
            console.error("Error loading chapters", e)
        }
    }, [])

    const updateCurrentChapter = useCallback((page: number) => {
        if (chapters.length === 0) return

        // Find the last chapter that has pageNumber <= page
        let active: ChapterInfo | null = null
        for (const ch of chapters) {
            if (ch.pageNumber <= page) {
                active = ch
            } else {
                break
            }
        }
        setCurrentChapter(active)
    }, [chapters])

    return { extractChapters, chapters, outline, currentChapter, updateCurrentChapter }
}
