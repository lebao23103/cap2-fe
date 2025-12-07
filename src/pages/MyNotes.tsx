import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import notesService, { type BookNote } from '@/lib/api/notes'
import booksService, { type Book } from '@/lib/api/books'
import { useNavigate } from 'react-router-dom'
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
    Search,
    Trash2,
    ExternalLink,
    StickyNote,
    Loader2,
    Grid,
    List
} from 'lucide-react'
import { fadeInUp, stagger } from '@/lib/animations'

interface EnrichedNote extends BookNote {
    bookTitle?: string;
    bookAuthor?: string;
    bookCover?: string;
}

export default function MyNotes() {
    const { toast } = useToast()
    const navigate = useNavigate()

    const [notes, setNotes] = useState<EnrichedNote[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Fetch all notes on mount
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setLoading(true)
                const userNotes = await notesService.getAllUserNotes()

                // We need to fetch book details for these notes to display titles/covers
                // Optimized: Fetch unique books only
                const uniqueBookIds = Array.from(new Set(userNotes.map(n => n.book)))
                const bookDetailsStr = await Promise.all(
                    uniqueBookIds.map(id => booksService.getBookById(id).catch(() => null))
                )

                const bookMap = new Map<number, Book>()
                bookDetailsStr.forEach(b => {
                    if (b) bookMap.set(b.id, b)
                })

                const enriched = userNotes.map(n => {
                    const book = bookMap.get(n.book)
                    return {
                        ...n,
                        bookTitle: book?.title || 'Unknown Book',
                        bookAuthor: book?.author || 'Unknown Author',
                        bookCover: book?.cover_image
                    }
                })

                setNotes(enriched)
            } catch (error) {
                console.error("Failed to fetch notes:", error)
                toast({
                    title: "Error",
                    description: "Failed to load your notes.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        fetchNotes()
    }, [toast])

    const filteredNotes = useMemo(() => {
        return notes.filter(note =>
            note.note_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [notes, searchTerm])

    const handleJumpToNote = (note: EnrichedNote) => {
        navigate(`/book/${note.book}/read`, {
            state: {
                page: note.page_number,
                highlightNote: note
            }
        })
    }

    const handleDeleteNote = async (note: EnrichedNote) => {
        if (!confirm("Are you sure you want to delete this note?")) return

        try {
            await notesService.deleteNote(note.book, note.id)
            setNotes(prev => prev.filter(n => n.id !== note.id))
            toast({
                title: "Deleted",
                description: "Note deleted successfully."
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete note.",
                variant: "destructive"
            })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background font-mono relative">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <main className="container mx-auto py-8 px-4 relative z-10">
                <motion.div {...fadeInUp} className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                            className="mb-2 -ml-2 text-gray-500 hover:text-black hover:bg-transparent font-bold"
                        >
                            ← BACK TO DASHBOARD
                        </Button>
                        <h1 className="text-4xl font-black uppercase text-foreground flex items-center gap-3">
                            <span className="bg-yellow-400 text-black px-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                My Notes
                            </span>
                        </h1>
                        <p className="text-muted-foreground font-bold mt-2">
                            {notes.length} notes across {new Set(notes.map(n => n.book)).size} books
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search content or book..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900"
                            />
                        </div>
                        <div className="flex border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-none ${viewMode === 'grid' ? 'bg-primary text-black' : ''}`}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className={`rounded-none ${viewMode === 'list' ? 'bg-primary text-black' : ''}`}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {filteredNotes.length === 0 ? (
                    <div className="text-center py-20 border-4 border-dashed border-black dark:border-white bg-white dark:bg-zinc-900 opacity-80">
                        <StickyNote className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold uppercase text-foreground">No notes found</h3>
                        <p className="text-muted-foreground">Start reading and select text to add notes!</p>
                    </div>
                ) : (
                    <motion.div
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
                    >
                        {filteredNotes.map((note) => (
                            <motion.div key={note.id} variants={fadeInUp}>
                                <Card className="h-full border-4 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all flex flex-col">
                                    <CardHeader className="pb-2 border-b-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight line-clamp-1" title={note.bookTitle}>
                                                    {note.bookTitle}
                                                </h3>
                                                <p className="text-xs font-mono text-muted-foreground">
                                                    Page {note.page_number || '?'} • {new Date(note.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={`${note.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} border-black dark:border-white rounded-none font-bold text-[10px] uppercase`}>
                                                {note.is_public ? 'Public' : 'Private'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 flex-1 flex flex-col gap-4">
                                        {/* Highlighted Text Context */}
                                        <div className="pl-3 border-l-4 border-primary bg-yellow-50 dark:bg-yellow-900/10 p-2 italic text-sm text-gray-700 dark:text-gray-300 font-serif line-clamp-3">
                                            "{note.note_content}"
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-auto flex justify-end gap-2 pt-2 border-t-2 border-dashed border-gray-200 dark:border-zinc-700">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteNote(note)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none h-8 px-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleJumpToNote(note)}
                                                className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all font-bold uppercase text-xs h-8"
                                            >
                                                View in Book <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    )
}
