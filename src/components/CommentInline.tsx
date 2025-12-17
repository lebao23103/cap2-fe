import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Trash2, Loader2, MessageSquare } from "lucide-react"
import type { Comment } from "@/lib/api/comments"
import commentsService from "@/lib/api/comments"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from 'date-fns'

interface CommentInlineProps {
    noteId: number
    isOpen: boolean
}

export function CommentInline({ noteId, isOpen }: CommentInlineProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const { toast } = useToast()
    const listRef = useRef<HTMLDivElement>(null)

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
                // Scroll to bottom on initial load if needed, but usually we want to see latest at bottom?
                // Actually chat usually starts at bottom.
                // Let's scroll to bottom on initial load too.
                setTimeout(() => {
                    if (listRef.current) {
                        listRef.current.scrollTop = listRef.current.scrollHeight
                    }
                }, 100)
            } else {
                setComments(prev => [...prev, ...data.results])
            }

            setHasMore(!!data.next)
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setComments([])
            } else {
                console.error(error)
                // toast({ title: "Failed to load comments", variant: "destructive" })
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

            // Scroll to bottom properly using scrollTop
            setTimeout(() => {
                if (listRef.current) {
                    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
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

    if (!isOpen) return null

    return (
        <div className="border-t-2 border-dashed border-gray-100 dark:border-zinc-800 mt-4 pt-4 animate-in slide-in-from-top-2 duration-300 origin-top">

            {/* Header / Meta */}
            <div className="flex items-center justify-between mb-4 px-1">
                <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" />
                    Discussion ({comments.length})
                </h4>
                {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </div>

            {/* Comments List */}
            <div
                ref={listRef}
                className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700"
            >
                {hasMore && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-[10px] font-bold uppercase text-muted-foreground h-6"
                        onClick={handleLoadMore}
                        disabled={loading}
                    >
                        Load Previous
                    </Button>
                )}

                {comments.length === 0 && !loading ? (
                    <div className="text-center py-6 opacity-40">
                        <p className="text-xs font-medium">No comments yet</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="group flex gap-2">
                            <Avatar className="h-6 w-6 mt-0.5 shrink-0 border border-border">
                                <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${comment.user_name}`} />
                                <AvatarFallback className="text-[9px]">{comment.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className="text-[11px] font-bold truncate text-foreground">{comment.user_name}</span>
                                    <span className="text-[9px] text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                                </div>

                                <div className="text-xs text-foreground/90 leading-relaxed bg-slate-50 dark:bg-zinc-900 px-3 py-2 rounded-lg rounded-tl-sm relative group-hover:bg-slate-100 dark:group-hover:bg-zinc-800 transition-colors">
                                    {comment.content}

                                    {comment.is_owner && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="mt-4 flex gap-2 items-end">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment..."
                    className="min-h-[36px] max-h-24 py-2 px-3 text-xs resize-none rounded-xl border-border focus-visible:ring-1 bg-transparent"
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || submitting}
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-xl bg-black text-white dark:bg-white dark:text-black"
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
