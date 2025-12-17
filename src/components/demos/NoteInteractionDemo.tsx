import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

// --- ICONS (Inline to match existing pattern, styled via classes) ---
const ChevronLeft = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg>)
const ChevronRight = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6" /></svg>)
const Settings = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>)
const Bookmark = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>)
const Heart = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>)
const StickyNote = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" /><path d="M15 3v6h6" /></svg>)
const Edit = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>)

const Globe = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>)
const Trash2 = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>)
const X = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>)
const CursorIcon = (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} style={{ ...props.style, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
        <path fill="white" stroke="black" strokeWidth="1.5" d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    </svg>
)

export default function NoteInteractionDemo() {
    const [step, setStep] = useState(0)
    const [selectedColor, setSelectedColor] = useState('yellow')
    const [notes, setNotes] = useState<any[]>([])

    // Logic: 0:Idle -> 1:Cursor -> 2:Select -> 3:Done -> 4:Dialog -> 5:Type -> 6:Color -> 7:Save -> 8:Sidebar -> 9:Away -> 10:Back -> 11:Click -> 12:Popover -> 13:Lock -> 14:Click -> 15:Toast -> 16:End
    useEffect(() => {
        let mounted = true
        const sequence = async () => {
            while (mounted) {
                setStep(0); setSelectedColor('yellow'); setNotes([]); await wait(1500)
                setStep(1); await wait(600)
                setStep(2); await wait(1500)
                // Dialog opens
                setStep(3); await wait(400)
                setStep(4); await wait(500)
                // Interaction
                setStep(5); await wait(1500)
                setStep(6); await wait(600)
                setSelectedColor('pink'); await wait(600)
                // Save
                setStep(7); await wait(600)
                // Result
                setNotes([{
                    id: 1,
                    text: "Between life and death there is a library",
                    note: "The concept of parallel lives is fascinating...",
                    color: "pink",
                    isPublic: false,
                    timestamp: new Date().toISOString()
                }])
                setStep(8); await wait(2000)
                // View highlight
                setStep(9); await wait(800)
                setStep(10); await wait(800)
                setStep(11); await wait(300)
                setStep(12); await wait(1000)
                // Share
                setStep(13); await wait(800)
                setStep(14); await wait(200)
                setNotes(prev => prev.map(n => ({ ...n, isPublic: true })))
                setStep(15); await wait(3000)
                setStep(16); await wait(2000)
            }
        }
        sequence()
        return () => { mounted = false }
    }, [])

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

    // Helpers
    const highlightColor =
        step >= 8 ? (selectedColor === 'pink' ? 'bg-pink-300/50 dark:bg-pink-500/30' : 'bg-yellow-300/50 dark:bg-yellow-500/30') :
            step >= 2 ? 'bg-yellow-200/50 dark:bg-yellow-400/30' : ''

    const getCursorPosition = () => {
        switch (step) {
            case 0: return { x: 200, y: 20 }
            case 1: return { x: 0, y: 12 }
            case 2: return { x: 310, y: 12 }
            case 3: return { x: 310, y: 12 }
            case 4: return { x: 180, y: 180 }
            case 5: return { x: 180, y: 220 }
            case 6: return { x: 290, y: 140 }
            case 7: return { x: 340, y: 290 }
            case 8: return { x: 320, y: 290 }
            case 9: return { x: 400, y: 50 }
            case 10: return { x: 150, y: 12 }
            case 11: return { x: 150, y: 12 }
            case 12: return { x: 150, y: 80 }
            case 13: return { x: 360, y: 320 }
            case 14: return { x: 360, y: 320 }
            case 15: return { x: 360, y: 320 }
            default: return { x: 200, y: 20 }
        }
    }

    const cursorPos = getCursorPosition()

    return (
        <div className="relative w-full max-w-5xl mx-auto h-[700px] flex flex-col font-mono text-sm overflow-hidden neo-box bg-background text-foreground">

            {/* --- HEADER --- */}
            <div className="h-14 border-b-2 border-border flex items-center justify-between px-4 bg-background z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-lg border-transparent hover:opacity-70"><ChevronLeft className="h-5 w-5" /></Button>
                    <div className="h-6 w-0.5 bg-foreground" />
                    <div>
                        <h1 className="text-sm font-bold uppercase line-clamp-1 text-foreground">Midnight Library</h1>
                        <p className="text-xs text-muted-foreground font-bold uppercase">Matt Haig</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-lg border-transparent hover:opacity-70"><Bookmark className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-lg border-transparent hover:opacity-70"><Heart className="h-4 w-4" /></Button>
                    <div className="h-6 w-0.5 bg-foreground mx-1" />
                    <Button variant="ghost" size="icon" className="rounded-lg border-transparent hover:opacity-70"><Settings className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* --- MAIN READING AREA --- */}
                <div className="flex-1 bg-muted/20 relative flex justify-center items-start overflow-hidden pt-8">

                    {/* PDF Page Container */}
                    <div className="relative inline-block neo-box bg-card p-12 w-[600px] min-h-[800px]">
                        <div className="font-serif text-lg leading-loose text-card-foreground">
                            <p className="mb-6 opacity-50">"Somewhere out beyond the edge of the universe there is a library that contains an infinite number of books..."</p>

                            {/* SYNC CONTAINER */}
                            <span className="relative inline-block mx-1">
                                <span className="relative z-10 transition-colors">Between life and death there is a library</span>

                                {/* Highlight */}
                                <motion.span
                                    className={`absolute inset-0 -z-0 ${highlightColor}`}
                                    initial={{ width: "0%" }}
                                    animate={{ width: step >= 2 ? "100%" : "0%" }}
                                    transition={{ duration: step === 2 ? 1.5 : 0, ease: "linear" }}
                                />

                                {/* Cursor */}
                                <motion.div
                                    className="absolute pointer-events-none z-[200]"
                                    style={{ top: 0, left: 0 }}
                                    animate={{
                                        x: cursorPos.x,
                                        y: cursorPos.y,
                                        opacity: step === 0 ? 0 : 1
                                    }}
                                    transition={{
                                        duration: step === 2 ? 1.5 : 0.5,
                                        ease: step === 2 ? "linear" : "easeInOut"
                                    }}
                                >
                                    <CursorIcon className="w-6 h-6" />
                                </motion.div>

                                {/* POPOVER */}
                                {/* POPOVER */}
                                <AnimatePresence>
                                    {step >= 12 && notes[0] && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-[100] w-80 text-left"
                                        >

                                            {/* Popover content */}
                                            <div className="relative rounded-xl border-2 border-black bg-white shadow-neo overflow-hidden z-20 border-l-[6px] border-l-amber-400 font-sans">
                                                {/* Header */}
                                                <div className="flex items-start justify-between p-3 pb-2 border-b-2 border-black">
                                                    <div className="flex items-center gap-1.5 flex-1">
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 border-2 border-black text-black uppercase">
                                                            Page 42
                                                        </span>
                                                        {notes[0].isPublic && (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 border-2 border-green-500 bg-green-500/10 text-green-600">
                                                                <Globe className="h-3 w-3" />
                                                                <span className="text-[10px] font-bold uppercase">Public</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 -mt-1 -mr-1 transition-colors hover:bg-gray-100 text-black"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Content */}
                                                <div className="p-3">
                                                    <div className="mb-3">
                                                        <span className="text-[10px] uppercase font-bold opacity-50 block mb-1 text-slate-900">Highlighted Text</span>
                                                        <p className="font-sans text-xs font-medium leading-relaxed italic border-l-2 pl-2 text-slate-900 border-amber-400">
                                                            "{notes[0].text}"
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold opacity-50 block mb-1 text-slate-900">Your Note</span>
                                                        <div className="text-xs font-sans leading-relaxed min-h-[40px] max-h-[120px] overflow-y-auto text-slate-900">
                                                            {notes[0].note}
                                                        </div>
                                                    </div>

                                                    <div className="text-[10px] uppercase font-bold opacity-40 mt-3 pt-2 border-t-2 border-black text-slate-900">
                                                        {new Date(notes[0].timestamp).toLocaleString()}
                                                    </div>
                                                </div>

                                                {/* Footer Actions */}
                                                <div className="p-2 flex gap-2 border-t-2 border-black bg-transparent">
                                                    <button
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 border-2 border-black text-slate-900 hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 border-2 border-black text-slate-900 hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                    >
                                                        {notes[0].isPublic ? (
                                                            <>
                                                                <X className="h-3 w-3" />
                                                                <span>Private</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Globe className="h-3 w-3" />
                                                                <span>Public</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        className="flex items-center justify-center p-1.5 border-2 border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all font-bold uppercase shadow-[2px_2px_0px_0px_rgba(254,202,202,1)]"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Arrow pointing up to highlight - Rendered AFTER content to sit on top */}
                                            <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 rotate-45 border-l-2 border-t-2 z-40 bg-white border-black" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </span>

                            <p className="mt-6 opacity-50">, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived."</p>
                        </div>
                        {/* Page Number */}
                        <div className="absolute bottom-4 right-8 font-mono font-bold text-xs text-muted-foreground">42</div>
                    </div>

                    {/* DIALOG OVERLAY */}
                    <AnimatePresence>
                        {step >= 4 && step <= 7 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-[30%] bg-card neo-box z-50 w-96 rounded-xl p-0"
                            >
                                <div className="p-4 border-b-2 border-border bg-pink-100 dark:bg-pink-900/50">
                                    <div className="flex items-center gap-2 font-bold uppercase text-foreground">
                                        <Edit className="h-4 w-4" /> New Note
                                    </div>
                                    <div className="mt-2 text-xs font-mono bg-background border-2 border-border shadow-neo-sm p-2 italic text-muted-foreground">
                                        "Between life and death there is a library"
                                    </div>
                                </div>
                                <div className="p-4 bg-background">
                                    <div className="flex gap-2 mb-4 justify-center">
                                        {['yellow', 'blue', 'green', 'pink'].map(c => (
                                            <div key={c} className={`w-6 h-6 border-2 transition-all ${c === (selectedColor || 'yellow') ? 'border-foreground scale-110 shadow-sm' : 'border-transparent'} ${c === 'yellow' ? 'bg-amber-400' : c === 'blue' ? 'bg-blue-400' : c === 'green' ? 'bg-green-400' : 'bg-pink-400'}`} />
                                        ))}
                                    </div>
                                    <div className="border-2 border-border min-h-[80px] p-2 text-sm font-mono mb-4 bg-transparent text-foreground">
                                        {step === 4 && <span className="animate-pulse">|</span>}
                                        {step >= 5 && "The concept of parallel lives is fascinating..."}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" className="rounded-lg border-2 border-transparent hover:bg-muted font-bold uppercase text-foreground">Cancel</Button>
                                        <Button size="sm" className="rounded-lg border-2 border-foreground shadow-neo-sm bg-amber-400 text-black hover:bg-amber-500 font-bold uppercase">Save Note</Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* --- SIDEBAR --- */}
                <div className="w-80 bg-background border-l-2 border-border flex flex-col z-20">
                    <div className="p-3 border-b-2 border-border flex justify-between items-center">
                        <h2 className="font-bold uppercase text-sm text-foreground">Reading Companion</h2>
                        <Button variant="ghost" size="sm" className="h-6 uppercase text-[10px] font-bold text-muted-foreground"><ChevronRight className="h-3 w-3 mr-1" />Hide</Button>
                    </div>

                    {/* Progress Card */}
                    <div className="p-4 bg-muted/20">
                        <div className="bg-card neo-box mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]">
                            <div className="p-3 border-b-2 border-border flex justify-between items-center bg-muted/30">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground">Progress</span>
                                <span className="text-xs font-bold font-mono text-foreground">12%</span>
                            </div>
                            <div className="p-2 grid grid-cols-2 text-center divide-x-2 divide-border">
                                <div>
                                    <div className="font-mono font-bold text-sm text-foreground">4h 30m</div>
                                    <div className="text-[10px] uppercase text-muted-foreground">Time</div>
                                </div>
                                <div>
                                    <div className="font-mono font-bold text-sm text-foreground">4.5</div>
                                    <div className="text-[10px] uppercase text-muted-foreground">Rating</div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Card */}
                        <div className="bg-card neo-box flex flex-col h-96 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]">
                            <div className="p-2 border-b-2 border-border bg-muted/30 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <StickyNote className="h-3 w-3 text-foreground" />
                                    <span className="font-bold uppercase text-xs text-foreground">My Notes</span>
                                    <span className="text-[10px] border-2 border-border px-1 bg-background text-foreground">{notes.length}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground"><Edit className="h-3 w-3" /></Button>
                            </div>

                            {/* Tabs */}
                            <div className="bg-card border-b-2 border-border p-1 grid grid-cols-3 gap-1">
                                <button className="text-[10px] font-bold uppercase py-1 border-2 border-foreground bg-foreground text-background shadow-neo-sm">All</button>
                                <button className="text-[10px] font-bold uppercase py-1 border-2 border-transparent text-muted-foreground">Private</button>
                                <button className="text-[10px] font-bold uppercase py-1 border-2 border-transparent text-muted-foreground">Shared</button>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-hidden p-0 relative">
                                <AnimatePresence>
                                    {notes.map(note => (
                                        <motion.div
                                            key={note.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-3 border-l-[6px] border-b border-border/20 cursor-pointer hover:bg-muted/10 bg-pink-50 dark:bg-pink-900/30 border-l-pink-400`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-bold border border-border px-1 bg-background text-foreground">PAGE 42</span>
                                                    <span className={`text-[10px] font-bold border px-1 ${note.isPublic ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-gray-400 text-gray-500 dark:text-gray-400'}`}>
                                                        {note.isPublic ? 'SHARED' : 'PRIVATE'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="font-bold font-mono text-xs line-clamp-1 text-foreground">"{note.text}"</div>
                                            <div className="text-[10px] text-muted-foreground font-mono mt-1">{note.note}</div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {notes.length === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                                        <StickyNote className="h-8 w-8 mb-2 text-muted-foreground" />
                                        <span className="font-bold text-xs text-muted-foreground">No notes yet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* TOAST */}
            <AnimatePresence>
                {
                    step >= 15 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card border-none z-[100]"
                        >
                            <div className="neo-box px-4 py-3 bg-card flex items-center gap-3">
                                <Globe className="h-5 w-5 text-blue-500" />
                                <div>
                                    <div className="font-bold uppercase text-xs text-foreground">Note Shared Publicly</div>
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

        </div >
    )
}
