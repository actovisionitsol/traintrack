import React, { useMemo } from "react";
import { motion } from "framer-motion";

// Floating particle for background
function FloatingParticle({ delay, duration, size, left }) {
    return (
        <motion.div
            className="absolute rounded-full bg-gradient-to-br from-indigo-400/20 to-blue-400/10"
            style={{ width: size, height: size, left: `${left}%`, top: '100%' }}
            animate={{
                y: [0, -800],
                opacity: [0, 0.6, 0.6, 0],
                scale: [1, 1.2, 0.8]
            }}
            transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    );
}

// Animated gradient orb
function GlowingOrb({ size, color, top, left, delay }) {
    return (
        <motion.div
            className={`absolute rounded-full ${color} blur-[100px] opacity-30`}
            style={{ width: size, height: size, top: `${top}%`, left: `${left}%` }}
            animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 6, delay: delay, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

export default function BackgroundElements() {
    // Generate random particles for background
    const particles = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            id: i,
            delay: Math.random() * 15,
            duration: 15 + Math.random() * 10,
            size: 8 + Math.random() * 16,
            left: Math.random() * 100
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <GlowingOrb size="600px" color="bg-indigo-500" top={-15} left={-10} delay={0} />
            <GlowingOrb size="500px" color="bg-blue-500" top={50} left={70} delay={2} />
            <GlowingOrb size="400px" color="bg-purple-500" top={70} left={20} delay={4} />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Floating particles */}
            {particles.map(p => (
                <FloatingParticle key={p.id} {...p} />
            ))}
        </div>
    );
}
