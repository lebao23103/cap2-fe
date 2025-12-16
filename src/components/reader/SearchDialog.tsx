import React, { useState } from 'react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { SearchResult } from '@/hooks/usePdfSearch'

interface SearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSearch: (query: string) => void
    results: SearchResult[]
    isSearching: boolean
    onResultClick: (page: number, text: string) => void
}

export default function SearchDialog({
    open,
    onOpenChange,
    onSearch,
    results,
    isSearching,
    onResultClick
}: SearchDialogProps) {
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(query)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-2 border-black dark:border-gray-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <DialogHeader className="p-4 border-b-2 border-black dark:border-gray-700 bg-slate-50 dark:bg-slate-800">
                    <DialogTitle className="uppercase font-black tracking-wider flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search in Book
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Enter keywords to search within the PDF document.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 border-b-2 border-black dark:border-gray-700 bg-white dark:bg-slate-900">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter text to find..."
                            className="bg-transparent border-2 border-black dark:border-gray-600 focus-visible:ring-0 font-mono"
                        />
                        <Button
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className="border-2 border-black bg-yellow-400 text-black hover:bg-yellow-500 font-bold uppercase"
                        >
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
                        </Button>
                    </form>
                </div>

                <ScrollArea className="flex-1 p-4 bg-slate-100 dark:bg-slate-950">
                    <div className="flex flex-col gap-3">
                        {results.length === 0 && !isSearching && query && (
                            <div className="text-center py-10 opacity-50 font-mono text-sm">
                                No matches found.
                            </div>
                        )}

                        {results.map((res, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    onResultClick(res.page, res.matchText)
                                    onOpenChange(false)
                                }}
                                className="bg-white dark:bg-slate-800 border-2 border-transparent hover:border-black dark:hover:border-slate-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all p-3 rounded-lg cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold uppercase bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                        Page {res.page}
                                    </span>
                                </div>
                                <p className="text-sm font-mono text-slate-600 dark:text-slate-400 leading-snug">
                                    {res.contextBefore}
                                    <span className="bg-yellow-200 dark:bg-yellow-900/50 text-black dark:text-yellow-100 font-bold px-0.5 rounded">
                                        {res.matchText}
                                    </span>
                                    {res.contextAfter}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
