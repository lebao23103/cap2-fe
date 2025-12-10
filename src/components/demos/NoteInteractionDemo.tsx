import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

// --- INLINE ICONS (Matching BookReader imports) ---
const ChevronLeft = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg>)
const ChevronRight = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6" /></svg>)
const Settings = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>)
const Bookmark = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>)
const Heart = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>)
const StickyNote = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" /><path d="M15 3v6h6" /></svg>)
const Edit = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>)
const Lock = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>)
const Globe = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>)
const Trash2 = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>)
const X = (props: any) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>)
const CursorIcon = (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={props.className} style={{ ...props.style, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
        <path fill="white" stroke="black" strokeWidth="1.5" d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    </svg>
)

export default function NoteInteractionDemo() {
    const [step, setStep] = useState(0)
    const [selectedColor, setSelectedColor] = useState('yellow')
    const [notes, setNotes] = useState<any[]>([])

    // LOGIC
    // 0: Idle
    // 1: Cursor to text
    // 2: Selecting (Sync)
    // 3: Select Done
    // 4: DIALOG OPENS (No context menu)
    // 5: Typing Simulate
    // 6: Pick Color
    // 7: Save
    // 8: Dialog Close -> Sidebar Note Appears
    // 9: Cursor Away
    // 10: Cursor Back to Highlight
    // 11: Click Highlight
    // 12: Popover Appears
    // 13: Cursor to Lock Icon (Share)
    // 14: Click Lock
    // 15: Icon Transforms (Globe) + Toast
    // 16: End

    useEffect(() => {
        let mounted = true
        const sequence = async () => {
            while (mounted) {
                setStep(0); setSelectedColor('yellow'); setNotes([]); await wait(1500)

                // Select
                setStep(1); await wait(600)
                setStep(2); await wait(1500)

                // DIALOG OPENS IMMEDIATELY
                setStep(3); await wait(400)
                setStep(4); await wait(500)

                // Type & Color
                setStep(5); await wait(1500)
                setStep(6); await wait(600)
                setSelectedColor('pink'); await wait(600)

                // Save
                setStep(7); await wait(600)

                // RESULT: Note in Sidebar + Highlight
                setNotes([{
                    id: 1,
                    text: "Between life and death there is a library",
                    note: "The concept of parallel lives is fascinating...",
                    color: "pink",
                    isPublic: false,
                    timestamp: new Date().toISOString()
                }])
                setStep(8); await wait(2000)

                // View Highlight
                setStep(9); await wait(800)
                setStep(10); await wait(800)
                setStep(11); await wait(300)
                setStep(12); await wait(1000)

                // Share Flow
                setStep(13); await wait(800) // Move to lock
                setStep(14); await wait(200) // Click

                // Update Note State
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

    // Cursor coordinates - absolute pixel positions relative to the text element
    // These are tuned for the specific layout
    const getCursorPosition = () => {
        switch (step) {
            case 0: return { x: 200, y: 20 }  // Center idle
            case 1: return { x: 0, y: 12 }     // Start of text
            case 2: return { x: 310, y: 12 }   // End of text (selection animation)
            case 3: return { x: 310, y: 12 }   // End of selection
            case 4: return { x: 180, y: 180 }  // Move to dialog
            case 5: return { x: 180, y: 220 }  // Typing area
            case 6: return { x: 230, y: 120 }  // Color picker (pink)
            case 7: return { x: 320, y: 290 }  // Save button
            case 8: return { x: 320, y: 290 }  // After save
            case 9: return { x: 400, y: 50 }   // Move away
            case 10: return { x: 150, y: 12 }  // Back to highlight
            case 11: return { x: 150, y: 12 }  // Click highlight
            case 12: return { x: 150, y: 80 }  // Popover visible
            case 13: return { x: 300, y: 260 } // Move to Public/Private button in popover action bar
            case 14: return { x: 300, y: 260 } // Click Public
            case 15: return { x: 300, y: 260 } // After click
            default: return { x: 200, y: 20 }
        }
    }

    const cursorPos = getCursorPosition()

    return (
        <div className="relative w-full max-w-5xl mx-auto h-[700px] border-4 border-black dark:border-white bg-white dark:bg-zinc-900 flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] font-mono text-sm overflow-hidden">

            {/* --- HEADER (Replicating BookReader) --- */}
            <div className="h-14 border-b-2 border-black dark:border-white flex items-center justify-between px-4 bg-white dark:bg-zinc-900 z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-none border-transparent hover:opacity-70 dark:text-white"><ChevronLeft className="h-5 w-5" /></Button>
                    <div className="h-6 w-0.5 bg-black dark:bg-white" />
                    <div>
                        <h1 className="text-sm font-bold uppercase line-clamp-1 dark:text-white">Midnight Library</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">Matt Haig</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-none border-transparent hover:opacity-70 dark:text-white"><Bookmark className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-none border-transparent hover:opacity-70 dark:text-white"><Heart className="h-4 w-4" /></Button>
                    <div className="h-6 w-0.5 bg-black dark:bg-white mx-1" />
                    <Button variant="ghost" size="icon" className="rounded-none border-transparent hover:opacity-70 dark:text-white"><Settings className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* --- MAIN READING AREA --- */}
                <div className="flex-1 bg-[#F1F5F9] dark:bg-zinc-950 relative flex justify-center items-start overflow-hidden pt-8">

                    {/* PDF Page Container */}
                    <div className="relative inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] border-2 border-black dark:border-gray-600 bg-white dark:bg-zinc-800 p-12 w-[600px] min-h-[800px]">
                        <div className="font-serif text-lg leading-loose text-gray-900 dark:text-gray-100">
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

                                {/* Cursor - positioned absolutely within this container */}
                                <motion.div
                                    className="absolute pointer-events-none z-50"
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

                                {/* POPOVER (Simulating NotePopover.tsx style) */}
                                <AnimatePresence>
                                    {step >= 12 && notes[0] && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-40 w-80 text-left"
                                        >
                                            {/* Arrow */}
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-pink-50 dark:bg-pink-900/50 border-l border-t border-pink-500 dark:border-pink-400" />

                                            {/* Card */}
                                            <div className={`relative rounded-xl border-l-4 border-l-pink-500 bg-gradient-to-br from-pink-50/95 via-pink-50/90 to-pink-100/95 dark:from-pink-900/40 dark:via-pink-900/30 dark:to-pink-950/40 backdrop-blur-xl shadow-2xl border border-pink-200 dark:border-pink-700 overflow-hidden`}>

                                                {/* Header */}
                                                <div className="flex items-start justify-between p-4 pb-3 border-b border-pink-200/50 dark:border-pink-700/50">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-800">
                                                            <div className="w-2 h-2 rounded-full bg-pink-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                                Page 42
                                                                {notes[0].isPublic && (
                                                                    <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded text-[10px]">
                                                                        <Globe className="h-2.5 w-2.5" />
                                                                        Public
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/50 dark:hover:bg-white/10 dark:text-gray-300"><X className="h-3.5 w-3.5" /></Button>
                                                </div>

                                                {/* Highlighed Text */}
                                                <div className="px-4 pt-3 pb-2">
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Highlighted Text</p>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">"{notes[0].text}"</p>
                                                </div>

                                                {/* Note Content */}
                                                <div className="px-4 pb-3">
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Your Note</p>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{notes[0].note}</p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 px-3 py-2 bg-white/30 dark:bg-black/20 border-t border-pink-200/50 dark:border-pink-700/50">
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:text-gray-300"><Edit className="h-3 w-3 mr-1" />Edit</Button>
                                                    <Button variant="ghost" size="sm" className={`h-7 text-xs dark:text-gray-300 ${notes[0].isPublic ? 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700' : 'hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600'}`}>
                                                        {notes[0].isPublic ? <><Globe className="h-3 w-3 mr-1" />Private</> : <><Lock className="h-3 w-3 mr-1" />Public</>}
                                                    </Button>
                                                    <div className="flex-1" />
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:text-gray-300"><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                                                </div>

                                                {/* Timestamp */}
                                                <div className="px-4 py-1.5 bg-white/20 dark:bg-black/10 border-t border-pink-200/30 dark:border-pink-700/30">
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Just now</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </span>

                            <p className="mt-6 opacity-50">, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived."</p>
                        </div>
                        {/* Page Number */}
                        <div className="absolute bottom-4 right-8 font-mono font-bold text-xs text-gray-400 dark:text-gray-500">42</div>
                    </div>

                    {/* DIALOG OVERLAY (Replicating DialogContent) */}
                    <AnimatePresence>
                        {step >= 4 && step <= 7 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-[30%] bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] z-50 w-96 rounded-none"
                            >
                                <div className="p-4 border-b-2 border-black dark:border-white bg-pink-100 dark:bg-pink-900/50">
                                    <div className="flex items-center gap-2 font-bold uppercase dark:text-white">
                                        <Edit className="h-4 w-4" /> New Note
                                    </div>
                                    <div className="mt-2 text-xs font-mono bg-white dark:bg-zinc-900 border-2 border-black dark:border-gray-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2 italic dark:text-gray-200">
                                        "Between life and death there is a library"
                                    </div>
                                </div>
                                <div className="p-4 dark:bg-zinc-800">
                                    <div className="flex gap-2 mb-4 justify-center">
                                        {['yellow', 'blue', 'green', 'pink'].map(c => (
                                            <div key={c} className={`w-6 h-6 border-2 transition-all ${c === (selectedColor || 'yellow') ? 'border-black dark:border-white scale-110 shadow-sm' : 'border-transparent'} ${c === 'yellow' ? 'bg-amber-400' : c === 'blue' ? 'bg-blue-400' : c === 'green' ? 'bg-green-400' : 'bg-pink-400'}`} />
                                        ))}
                                    </div>
                                    <div className="border-2 border-black dark:border-gray-600 min-h-[80px] p-2 text-sm font-mono mb-4 bg-transparent dark:text-gray-100">
                                        {step === 4 && <span className="animate-pulse">|</span>}
                                        {step >= 5 && "The concept of parallel lives is fascinating..."}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" className="rounded-none border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 font-bold uppercase dark:text-gray-200">Cancel</Button>
                                        <Button size="sm" className="rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-amber-400 text-black hover:bg-amber-500 font-bold uppercase">Save Note</Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* --- SIDEBAR (Replicating BookReader Sidebar) --- */}
                <div className="w-80 bg-white dark:bg-zinc-900 border-l-2 border-black dark:border-white flex flex-col z-20">
                    <div className="p-3 border-b-2 border-black dark:border-white flex justify-between items-center">
                        <h2 className="font-bold uppercase text-sm dark:text-white">Reading Companion</h2>
                        <Button variant="ghost" size="sm" className="h-6 uppercase text-[10px] font-bold dark:text-gray-300"><ChevronRight className="h-3 w-3 mr-1" />Hide</Button>
                    </div>

                    {/* Progress Card */}
                    <div className="p-4 bg-[#F8FAFC] dark:bg-zinc-950">
                        <div className="bg-white dark:bg-zinc-800 border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] mb-4">
                            <div className="p-3 border-b-2 border-black dark:border-gray-600 flex justify-between items-center bg-gray-50 dark:bg-zinc-700">
                                <span className="text-[10px] font-bold uppercase dark:text-gray-200">Progress</span>
                                <span className="text-xs font-bold font-mono dark:text-white">12%</span>
                            </div>
                            <div className="p-2 grid grid-cols-2 text-center divide-x-2 divide-black dark:divide-gray-600">
                                <div>
                                    <div className="font-mono font-bold text-sm dark:text-white">4h 30m</div>
                                    <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Time</div>
                                </div>
                                <div>
                                    <div className="font-mono font-bold text-sm dark:text-white">4.5</div>
                                    <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Rating</div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Card */}
                        <div className="bg-white dark:bg-zinc-800 border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] flex flex-col h-96">
                            <div className="p-2 border-b-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-zinc-700 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <StickyNote className="h-3 w-3 dark:text-white" />
                                    <span className="font-bold uppercase text-xs dark:text-white">My Notes</span>
                                    <span className="text-[10px] border-2 border-black dark:border-gray-500 px-1 bg-white dark:bg-zinc-900 dark:text-white">{notes.length}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 dark:text-white"><Edit className="h-3 w-3" /></Button>
                            </div>

                            {/* Tabs */}
                            <div className="bg-white dark:bg-zinc-800 border-b-2 border-black dark:border-gray-600 p-1 grid grid-cols-3 gap-1">
                                <button className="text-[10px] font-bold uppercase py-1 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-sm">All</button>
                                <button className="text-[10px] font-bold uppercase py-1 border-2 border-transparent text-gray-400 dark:text-gray-500">Private</button>
                                <button className="text-[10px] font-bold uppercase py-1 border-2 border-transparent text-gray-400 dark:text-gray-500">Shared</button>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-hidden p-0 relative">
                                <AnimatePresence>
                                    {notes.map(note => (
                                        <motion.div
                                            key={note.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-3 border-l-[6px] border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 bg-pink-50 dark:bg-pink-900/30 border-l-pink-400`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-bold border border-black dark:border-gray-500 px-1 bg-white dark:bg-zinc-800 dark:text-white">PAGE 42</span>
                                                    <span className={`text-[10px] font-bold border px-1 ${note.isPublic ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-gray-400 text-gray-500 dark:text-gray-400'}`}>
                                                        {note.isPublic ? 'SHARED' : 'PRIVATE'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="font-bold font-mono text-xs line-clamp-1 dark:text-white">"{note.text}"</div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-1">{note.note}</div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {notes.length === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                                        <StickyNote className="h-8 w-8 mb-2 dark:text-gray-400" />
                                        <span className="font-bold text-xs dark:text-gray-400">No notes yet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOAST (Absolute relative to DEMO CONTAINER) */}
            <AnimatePresence>
                {step >= 15 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] z-[100] flex items-center gap-3"
                    >
                        <Globe className="h-5 w-5 text-blue-500" />
                        <div>
                            <div className="font-bold uppercase text-xs dark:text-white">Note Shared Publicly</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
