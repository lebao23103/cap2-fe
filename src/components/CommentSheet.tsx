import { useState, useEffect, useRef } from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Trash2, Loader2, MessageSquare } from "lucide-react"
import type { Comment } from "@/lib/api/comments"
import commentsService from "@/lib/api/comments"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from 'date-fns'

interface CommentSheetProps {
    noteId: number | null
    isOpen: boolean
    onClose: () => void
    noteContent?: string // To show context
}

export function CommentSheet({ noteId, isOpen, onClose, noteContent }: CommentSheetProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const { toast } = useToast()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Reset state when opening a new note
    useEffect(() => {
        if (isOpen && noteId) {
            setComments([])
            setPage(1)
            fetchComments(1, true)
        }
    }, [isOpen, noteId])

    const fetchComments = async (pageNum: number, reset = false) => {
        if (!noteId) return
        try {
            setLoading(true)
            const data = await commentsService.getComments(noteId, pageNum)

            if (reset) {
                setComments(data.results)
            } else {
                setComments(prev => [...prev, ...data.results])
            }

            setHasMore(!!data.next)
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setComments([])
            } else {
                console.error(error)
                toast({ title: "Failed to load comments", variant: "destructive" })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLoadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchComments(nextPage)
    }

    const handleSubmit = async () => {
        if (!noteId || !newComment.trim()) return

        try {
            setSubmitting(true)
            const created = await commentsService.addComment(noteId, newComment)

            // Add to list immediately (at the bottom)
            setComments(prev => [...prev, { ...created, is_owner: true }]) // Optimistically set owner
            setNewComment('')

            // Scroll to bottom
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollIntoView({ behavior: 'smooth' })
                }
            }, 100)

        } catch (error) {
            toast({ title: "Failed to post comment", variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (commentId: number) => {
        try {
            await commentsService.deleteComment(commentId)
            setComments(prev => prev.filter(c => c.id !== commentId))
            toast({ title: "Comment deleted" })
        } catch (error) {
            toast({ title: "Failed to delete", variant: "destructive" })
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:w-[500px] border-l-0 sm:border-l border-zinc-200 dark:border-zinc-800 p-0 flex flex-col bg-white dark:bg-zinc-950 shadow-2xl">
                {/* Modern Header */}
                <SheetHeader className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="font-display font-bold text-lg flex items-center gap-2">
                            Discussion
                            <span className="text-xs font-mono font-normal text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                {comments.length}
                            </span>
                        </SheetTitle>
                    </div>

                    {noteContent && (
                        <div className="mt-3 relative pl-4 border-l-2 border-primary/50">
                            <p className="font-serif italic text-sm text-foreground/70 line-clamp-2">
                                "{noteContent}"
                            </p>
                        </div>
                    )}
                </SheetHeader>

                {/* Chat Area */}
                <ScrollArea className="flex-1 px-4 sm:px-6 bg-slate-50/50 dark:bg-black/20">
                    <div className="py-6 space-y-6 min-h-full">
                        {hasMore && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs font-bold uppercase text-muted-foreground hover:bg-muted mb-4"
                                onClick={handleLoadMore}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : "Load older comments"}
                            </Button>
                        )}

                        {comments.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-center opacity-40">
                                <MessageSquare className="h-12 w-12 mb-3 stroke-[1.5]" />
                                <p className="font-medium text-sm">No thoughts yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Be the first to share your perspective</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className={`group flex gap-3 ${comment.is_owner ? 'flex-row-reverse' : ''}`}
                                >
                                    <Avatar className="h-8 w-8 border border-white dark:border-zinc-800 shadow-sm mt-0.5 shrink-0">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${comment.user_name}`} />
                                        <AvatarFallback className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800">
                                            {comment.user_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className={`flex flex-col max-w-[85%] ${comment.is_owner ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-end gap-2 mb-1 px-1">
                                            <span className="font-bold text-[11px] text-zinc-700 dark:text-zinc-300">
                                                {comment.user_name}
                                            </span>
                                            <span className="text-[10px] text-zinc-400">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </span>
                                        </div>

                                        <div className={`
                                            relative px-4 py-2.5 text-sm leading-relaxed shadow-sm
                                            ${comment.is_owner
                                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black rounded-2xl rounded-tr-sm'
                                                : 'bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-tl-sm'}
                                        `}>
                                            <p>{comment.content}</p>

                                            {comment.is_owner && (
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Modern Input Area */}
                <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="relative flex items-end gap-2 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl focus-within:ring-2 focus-within:ring-black/5 dark:focus-within:ring-white/10 transition-all shadow-sm">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a thoughtful comment..."
                            className="min-h-[44px] max-h-32 w-full resize-none border-0 bg-transparent py-3 px-4 focus-visible:ring-0 placeholder:text-zinc-400"
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={!newComment.trim() || submitting}
                            size="icon"
                            className="h-10 w-10 shrink-0 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 mb-0.5 mr-0.5 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {submitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5 ml-0.5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground mt-2 text-right">
                        Enter to send <span className="opacity-50 mx-1">|</span> Shift+Enter for new line
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
}
