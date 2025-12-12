import { useEffect, useRef, useState, useCallback } from 'react';

type AudioType = 'rain' | 'white' | 'brown';

interface AudioSynthControls {
    isPlaying: boolean;
    volume: number;
    type: AudioType;
    toggle: () => void;
    setVolume: (val: number) => void;
    setType: (type: AudioType) => void;
}

export function useAudioSynth(): AudioSynthControls {
    // Global context ref (created once)
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Nodes
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const filterNodeRef = useRef<BiquadFilterNode | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolumeState] = useState(0.2);
    const [type, setTypeState] = useState<AudioType>('rain');

    // Initialize Audio Context (lazy)
    const initAudio = () => {
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        return audioCtxRef.current;
    };

    // --- NOISE GENERATION ALGORITHMS ---

    const createPinkNoise = (ctx: AudioContext) => {
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }
        return buffer;
    };

    const createBrownNoise = (ctx: AudioContext) => {
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
        return buffer;
    };

    const createWhiteNoise = (ctx: AudioContext) => {
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };

    const play = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        if (sourceNodeRef.current) sourceNodeRef.current.stop();

        const sourceNode = ctx.createBufferSource();
        if (type === 'rain') sourceNode.buffer = createPinkNoise(ctx);
        else if (type === 'brown') sourceNode.buffer = createBrownNoise(ctx);
        else sourceNode.buffer = createWhiteNoise(ctx);
        sourceNode.loop = true;

        // Filter
        const filterNode = ctx.createBiquadFilter();
        filterNode.type = 'lowpass';
        // Adjust freqs: Rain smoother (600), Thunder deeper (200)
        filterNode.frequency.value = type === 'rain' ? 600 : type === 'brown' ? 200 : 800;
        filterNodeRef.current = filterNode;

        // Gain
        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;
        gainNodeRef.current = gainNode;

        // Stereo Panner (Auto-Pan for 3D feel)
        const pannerNode = ctx.createStereoPanner();

        // LFO for Panner (Slow drift)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow cycle (10s)
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.3; // Slight movement

        lfo.connect(lfoGain);
        lfoGain.connect(pannerNode.pan);
        lfo.start();

        // Connect Chain: Source -> Filter -> Gain -> Panner -> Destination
        sourceNode.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(ctx.destination);

        sourceNode.start();
        sourceNodeRef.current = sourceNode;
        setIsPlaying(true);
    }, [type, volume]);

    const stop = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const toggle = () => {
        if (isPlaying) stop();
        else play();
    };

    // Live Volume Update
    const setVolume = (val: number) => {
        setVolumeState(val);
        if (gainNodeRef.current) {
            // Smooth transition
            gainNodeRef.current.gain.setTargetAtTime(val, audioCtxRef.current?.currentTime || 0, 0.1);
        }
    };

    // Switch Type (Requires restart if playing)
    const setType = (newType: AudioType) => {
        setTypeState(newType);
        // Effect hook below will handle restart
    };

    // Auto-restart if playing and type changes
    useEffect(() => {
        if (isPlaying) {
            play();
        }
    }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

    // Cleanup
    useEffect(() => {
        return () => stop();
    }, []);

    return { isPlaying, volume, type, toggle, setVolume, setType };
}
