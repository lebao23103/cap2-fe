import { useState, useCallback } from 'react'

export interface ChapterInfo {
    title: string
    pageNumber: number
}

export const usePdfChapter = () => {
    const [chapters, setChapters] = useState<ChapterInfo[]>([])
    const [currentChapter, setCurrentChapter] = useState<string>('')

    const extractChapters = useCallback(async (pdfDocument: any) => {
        if (!pdfDocument) return

        try {
            const outline = await pdfDocument.getOutline()
            if (!outline) {
                setChapters([])
                return
            }

            const flatChapters: ChapterInfo[] = []

            const processItems = async (items: any[]) => {
                for (const item of items) {
                    let pageNumber = 0
                    if (typeof item.dest === 'string') {
                        const pageIndex = await pdfDocument.getPageIndex(item.dest)
                        pageNumber = pageIndex + 1
                    } else if (Array.isArray(item.dest)) {
                        // item.dest[0] is often a Ref object { num: x, gen: y }
                        const ref = item.dest[0]
                        const pageIndex = await pdfDocument.getPageIndex(ref)
                        pageNumber = pageIndex + 1
                    }

                    if (pageNumber > 0) {
                        flatChapters.push({ title: item.title, pageNumber })
                    }

                    if (item.items && item.items.length > 0) {
                        await processItems(item.items)
                    }
                }
            }

            await processItems(outline)
            // Sort by page number to be safe
            flatChapters.sort((a, b) => a.pageNumber - b.pageNumber)

            setChapters(flatChapters)
        } catch (e) {
            console.error("Error loading chapters", e)
        }
    }, [])

    const updateCurrentChapter = useCallback((page: number) => {
        if (chapters.length === 0) return

        // Find the last chapter that has pageNumber <= page
        // e.g. Ch1: pg1, Ch2: pg10. Current pg 5 -> Ch1.
        let active = chapters[0]
        for (const ch of chapters) {
            if (ch.pageNumber <= page) {
                active = ch
            } else {
                break
            }
        }
        setCurrentChapter(active.title)
    }, [chapters])

    return { extractChapters, chapters, currentChapter, updateCurrentChapter }
}
