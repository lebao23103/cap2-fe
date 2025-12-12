import { useState, useEffect } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { Play, Pause, Square, Volume2, VolumeX, CloudRain, Zap, Maximize2, Minimize2, GripHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAudioSynth } from '@/hooks/useAudioSynth'
import { useToast } from '@/components/ui/use-toast'

interface FocusTapeDeckProps {
    theme: 'light' | 'dark' | 'sepia'
}

export function FocusTapeDeck({ theme }: FocusTapeDeckProps) {
    const { isPlaying, volume, type, toggle, setVolume, setType } = useAudioSynth()
    const { toast } = useToast()
    const dragControls = useDragControls()

    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)

    // Slot Machine State
    const [mode, setMode] = useState<'timer' | 'slots'>('timer')
    const [slots, setSlots] = useState([7, 7, 7])
    const [isSpinning, setIsSpinning] = useState(false)
    const [jackpot, setJackpot] = useState(false)

    // THEME STYLES - STRICT SYNC & CONTRAST
    const styles = {
        light: {
            chassis: 'bg-white',
            border: 'border-black',
            text: 'text-black',
            header: 'bg-black text-white',
            accent: 'bg-[#FF5D5D]', // Neo-Brutal Red
            cardBg: 'bg-slate-50',
            displayBg: 'bg-white',
            buttonHover: 'hover:bg-gray-100',
            shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
            shadowQm: 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        },
        dark: {
            chassis: 'bg-[#16213e]', // Matches BookReader CardBg
            border: 'border-gray-500',
            text: 'text-gray-100',
            header: 'bg-[#0f0f23] text-white', // Matches BookReader NavBg
            accent: 'bg-[#e94560]', // Pinkish Red
            cardBg: 'bg-[#1a1a2e]', // Matches BookReader Bg
            displayBg: 'bg-[#0f0f23]', // Darker than chassis
            buttonHover: 'hover:bg-white/10',
            shadow: 'shadow-[4px_4px_0px_0px_#000000]',
            shadowQm: 'shadow-[2px_2px_0px_0px_#000000]',
        },
        sepia: {
            chassis: 'bg-[#fdf5e6]', // Matches BookReader CardBg
            border: 'border-[#8b7355]',
            text: 'text-[#5c4033]', // Coffee Brown
            header: 'bg-[#8b7355] text-[#fdf5e6]',
            accent: 'bg-[#d2691e]', // Chocolate
            cardBg: 'bg-[#f4e4c1]', // Matches BookReader Bg
            displayBg: 'bg-[#fdf5e6]',
            buttonHover: 'hover:bg-[#8b7355]/10',
            shadow: 'shadow-[4px_4px_0px_0px_#5c4033]',
            shadowQm: 'shadow-[2px_2px_0px_0px_#5c4033]',
        }
    }
    const s = styles[theme] || styles.light

    // Format Time 25:00
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0 && isTimerRunning) {
            handleTimerComplete()
        }
        return () => clearInterval(interval)
    }, [isTimerRunning, timeLeft])

    const handleTimerComplete = () => {
        setIsTimerRunning(false)
        setTimeLeft(25 * 60)

        // XP Reward logic
        const savedPet = localStorage.getItem('knowly_pet')
        if (savedPet) {
            const pet = JSON.parse(savedPet)
            pet.xp += 500
            pet.happiness = 100
            localStorage.setItem('knowly_pet', JSON.stringify(pet))
        }

        toast({
            title: "TAPE FINISHED! 📼",
            description: "Mission Complete. +500 XP!",
            className: "bg-green-400 border-4 border-black font-mono font-bold"
        })
    }

    const toggleTimer = () => {
        const newState = !isTimerRunning
        setIsTimerRunning(newState)

        // Logic: Sync Audio with Timer
        if (newState) {
            if (!isPlaying) toggle() // Start audio if not playing
        } else {
            if (isPlaying) toggle() // Stop audio if playing
        }
    }

    // SLOT MACHINE LOGIC
    const spinSlots = () => {
        if (isSpinning) return
        setIsSpinning(true)
        setJackpot(false)

        // Instant audio feedback could be added here if we had a sound effect

        let spins = 0
        const maxSpins = 20
        const interval = setInterval(() => {
            setSlots([
                Math.floor(Math.random() * 9) + 1,
                Math.floor(Math.random() * 9) + 1,
                Math.floor(Math.random() * 9) + 1
            ])
            spins++
            if (spins > maxSpins) {
                clearInterval(interval)
                setIsSpinning(false)

                // Cheat: 10% chance to force 777 for explicit "Deluxe" fun
                // Or if user is really lucky
                const isLucky = Math.random() > 0.85

                if (isLucky) {
                    setSlots([7, 7, 7])
                    setJackpot(true)
                    toast({
                        title: "JACKPOT! 🎰",
                        description: "TRIPLE 7 DELUXE! +1000 XP (Fake)",
                        className: "bg-yellow-400 border-4 border-black font-black"
                    })
                } else {
                    const s1 = Math.floor(Math.random() * 9) + 1
                    const s2 = Math.floor(Math.random() * 9) + 1
                    const s3 = Math.floor(Math.random() * 9) + 1
                    setSlots([s1, s2, s3])
                    if (s1 === s2 && s2 === s3) {
                        setJackpot(true)
                        toast({ title: "WINNER!", description: "Nice Spin!", className: "bg-yellow-400 border-4 border-black" })
                    }
                }
            }
        }, 80)
    }

    const reelVariants = {
        playing: { rotate: 360, transition: { repeat: Infinity, duration: 3, ease: "linear" as const } },
        paused: { rotate: 0 }
    }

    // Minimized State - Smart Mini-Player
    if (isMinimized) {
        return (
            <motion.div
                drag
                dragMomentum={false}
                className="fixed top-28 left-8 z-50 pointer-events-auto"
            >
                <div className={`${s.cardBg} border-2 ${s.border} ${s.shadow} p-2.5 rounded-xl flex items-center gap-3 cursor-grab active:cursor-grabbing`}>

                    {/* Status & Time Group */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full border border-black ${isTimerRunning ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                        <span className={`font-mono font-bold text-sm ${s.text} min-w-[42px]`}>{formatTime(timeLeft)}</span>
                    </div>

                    {/* Divider */}
                    <div className="h-5 w-[1.5px] bg-black/10" />

                    {/* Controls */}
                    <div className="flex items-center gap-1.5">
                        <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 rounded-lg hover:bg-black/5 ${s.text}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleTimer();
                            }}
                        >
                            {isTimerRunning ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 rounded-lg hover:bg-black/5 ${s.text}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggle();
                            }}
                        >
                            {isPlaying ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 opacity-50" />}
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="h-5 w-[1.5px] bg-black/10" />

                    {/* Expand */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className={`h-7 w-7 hover:${s.text} hover:opacity-80 border border-transparent hover:${s.border} rounded-lg transition-all`}
                        onClick={() => setIsMinimized(false)}
                    >
                        <Maximize2 className={`h-3.5 w-3.5 ${s.text}`} />
                    </Button>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            drag
            dragListener={false} // Disable default drag listener (fixes conflict with internal controls)
            dragControls={dragControls} // Use explicit drag controls
            dragMomentum={false}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-28 left-8 z-50 hidden lg:block"
        >
            {/* CHASSIS */}
            <div className={`w-60 ${s.chassis} border-2 ${s.border} rounded-xl ${s.shadow} overflow-hidden font-mono text-sm transition-colors duration-300`}>

                {/* DRAG HANDLE / HEADER */}
                <motion.div
                    className={`${s.header} p-1.5 px-2 flex justify-between items-center cursor-grab active:cursor-grabbing border-b-2 border-black/10`}
                    onPointerDown={(e) => dragControls.start(e)} // Start dragging ONLY from here
                >
                    <div className="flex items-center gap-2">
                        <GripHorizontal className="w-3 h-3 opacity-50" />
                        <span className="font-bold italic tracking-wider text-[9px] uppercase">Focus Deck</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* MODE TOGGLE */}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 hover:bg-white/20 rounded-full text-[10px] text-current"
                            onClick={() => setMode(mode === 'timer' ? 'slots' : 'timer')}
                            onPointerDown={(e) => e.stopPropagation()}
                            title="Toggle Mode"
                        >
                            {mode === 'timer' ? '🎰' : '⏱️'}
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 hover:bg-white/20 rounded-full text-current"
                            onClick={() => setIsMinimized(true)}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <Minimize2 className="h-3 w-3" />
                        </Button>
                    </div>
                </motion.div>

                {/* BODY - NOT Draggable */}
                <div
                    className="p-2 space-y-2"
                >

                    {/* VISUALIZER / SLOT WINDOW */}
                    <div className={`${s.displayBg} border-2 ${s.border} rounded-lg p-1 shadow-sm relative overflow-hidden h-12 flex items-center justify-center`}>
                        <div className="absolute inset-0 bg-[radial-gradient(#00000011_1px,transparent_1px)] [background-size:4px_4px] opacity-30 pointer-events-none" />

                        {mode === 'timer' ? (
                            <div className="flex items-center justify-between w-full px-3">
                                <motion.div
                                    variants={reelVariants}
                                    animate={isPlaying || isTimerRunning ? "playing" : "paused"}
                                    className={`w-6 h-6 border-2 ${s.border} rounded-full border-dashed bg-gray-100/50 z-10 shrink-0`}
                                />
                                <span className={`text-xl font-black ${s.text} bg-black/5 px-3 rounded tracking-widest block leading-none z-10`}>
                                    {formatTime(timeLeft)}
                                </span>
                                <motion.div
                                    variants={reelVariants}
                                    animate={isPlaying || isTimerRunning ? "playing" : "paused"}
                                    className={`w-6 h-6 border-2 ${s.border} rounded-full border-dashed bg-gray-100/50 z-10 shrink-0`}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full z-10 cursor-pointer" onClick={spinSlots}>
                                <div className="flex gap-1.5 mb-0.5">
                                    {slots.map((num, i) => (
                                        <div key={i} className={`w-6 h-6 border-2 ${s.border} ${s.cardBg} flex items-center justify-center text-sm font-black ${jackpot ? 'text-yellow-500 animate-bounce' : s.text}`}>
                                            {num}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[8px] font-bold opacity-70 uppercase tracking-widest">{isSpinning ? "..." : jackpot ? "WIN!" : "SPIN"}</span>
                            </div>
                        )}
                    </div>

                    {/* MAIN CONTROLS */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            className={`h-9 border-2 ${s.border} ${s.shadowQm} active:translate-y-[1px] active:shadow-none transition-all text-xs rounded-xl
                                ${isTimerRunning ? `${s.accent} text-white hover:opacity-90` : `${s.cardBg} ${s.buttonHover} ${s.text}`}
                            `}
                            onClick={toggleTimer}
                        >
                            {isTimerRunning ? <Pause className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                            <span className="font-bold">{isTimerRunning ? "PAUSE" : "START"}</span>
                        </Button>

                        <Button
                            className={`h-9 ${s.cardBg} ${s.text} border-2 ${s.border} ${s.shadowQm} active:translate-y-[1px] active:shadow-none transition-all ${s.buttonHover} text-xs rounded-xl`}
                            onClick={() => {
                                setIsTimerRunning(false)
                                setTimeLeft(25 * 60)
                            }}
                        >
                            <Square className="mr-1 h-3 w-3" />
                            <span className="font-bold">RESET</span>
                        </Button>
                    </div>

                    {/* AUDIO MIXER */}
                    <div className="bg-black/5 rounded-xl p-2 border border-black/5">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex gap-1 bg-white/50 p-0.5 rounded-lg border border-black/5">
                                <Button
                                    size="sm"
                                    className={`h-6 px-2 text-[9px] rounded-md transition-all ${type === 'rain' ? `${s.header} shadow-sm` : `bg-transparent ${s.text} ${s.buttonHover}`}`}
                                    onClick={() => setType('rain')}
                                >
                                    <CloudRain className="w-3 h-3 mr-1" /> Rain
                                </Button>
                                <Button
                                    size="sm"
                                    className={`h-6 px-2 text-[9px] rounded-md transition-all ${type === 'brown' ? `${s.header} shadow-sm` : `bg-transparent ${s.text} ${s.buttonHover}`}`}
                                    onClick={() => setType('brown')}
                                >
                                    <Zap className="w-3 h-3 mr-1" /> Thunder
                                </Button>
                            </div>
                            <Button size="icon" variant="ghost" className={`h-6 w-6 rounded-full ${s.text} ${s.buttonHover}`} onClick={toggle}>
                                {isPlaying ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3 opacity-50" />}
                            </Button>
                        </div>

                        <div className="px-1 pt-1">
                            <Slider
                                value={[volume]}
                                max={1}
                                step={0.01}
                                onValueChange={(val) => setVolume(val[0])}
                                className="cursor-pointer py-1"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    )
}
