

interface ChapterDisplayProps {
    chapter: string
    themeStyles: any
}

export default function ChapterDisplay({ chapter, themeStyles }: ChapterDisplayProps) {
    // If no chapter info, show nothing or placeholder
    if (!chapter) return null

    return (
        <div className={`hidden sm:flex items-center gap-2 flex-1 max-w-[250px] overflow-hidden border-2 ${themeStyles.border} rounded-lg h-9 px-3 relative bg-clip-padding`}>
            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-10 shadow-[inset_10px_0_10px_-5px_var(--bg-overlay),inset_-10px_0_10px_-5px_var(--bg-overlay)]" style={{ '--bg-overlay': 'rgba(255,255,255,0.0)' } as any} />

            <div className="flex-1 overflow-hidden whitespace-nowrap relative flex items-center">
                <div className={`
                    inline-block 
                    ${chapter.length > 25 ? 'animate-marquee pl-[100%]' : ''}
                    text-xs font-bold uppercase tracking-wide ${themeStyles.text}
                 `}>
                    {chapter}
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 10s linear infinite;
                }
             `}</style>
        </div>
    )
}
