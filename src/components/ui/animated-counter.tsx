import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function AnimatedCounter({
    value,
    direction = "up",
    className,
    decimalPlaces = 0,
}: {
    value: number;
    direction?: "up" | "down";
    className?: string;
    decimalPlaces?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "down" ? value : 0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "0px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = latest.toFixed(decimalPlaces);
            }
        });

        // Force initial update
        if (ref.current) {
            ref.current.textContent = springValue.get().toFixed(decimalPlaces);
        }

        return () => unsubscribe();
    }, [springValue, decimalPlaces]);

    return <span className={className} ref={ref}>{direction === "down" ? value.toFixed(decimalPlaces) : "0"}</span>;
}
