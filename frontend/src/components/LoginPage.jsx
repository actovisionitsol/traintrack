import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrainFront, User, Lock, Info, ChevronRight, Eye, EyeOff, Train, MapPin, Ticket, Clock } from "lucide-react";

// Floating particle component
function FloatingParticle({ delay, duration, size, left, icon: Icon }) {
    return (
        <motion.div
            className="absolute text-white/10"
            style={{ left: `${left}%`, bottom: -50 }}
            initial={{ y: 0, opacity: 0, rotate: 0 }}
            animate={{
                y: -800,
                opacity: [0, 0.6, 0.6, 0],
                rotate: 360
            }}
            transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: "linear"
            }}
        >
            <Icon size={size} />
        </motion.div>
    );
}

// Railway track line animation
function RailwayTrack({ top, delay }) {
    return (
        <motion.div
            className="absolute h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
            style={{ top: `${top}%`, left: 0, right: 0 }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, delay: delay, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

// Glowing orb
function GlowingOrb({ size, color, top, left, delay }) {
    return (
        <motion.div
            className={`absolute rounded-full ${color} blur-[60px]`}
            style={{ width: size, height: size, top: `${top}%`, left: `${left}%` }}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, delay: delay, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Generate random particles
    const particles = useMemo(() => {
        const icons = [Train, MapPin, Ticket, Clock, TrainFront];
        return Array.from({ length: 15 }, (_, i) => ({
            id: i,
            delay: Math.random() * 10,
            duration: 12 + Math.random() * 8,
            size: 16 + Math.random() * 24,
            left: Math.random() * 100,
            icon: icons[Math.floor(Math.random() * icons.length)]
        }));
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.ok) {
                onLogin(data.username, data.accessToken);
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Server unreachable");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Animated background orbs */}
            <GlowingOrb size="500px" color="bg-indigo-600" top={-10} left={-10} delay={0} />
            <GlowingOrb size="400px" color="bg-blue-600" top={60} left={70} delay={1.5} />
            <GlowingOrb size="300px" color="bg-purple-600" top={30} left={50} delay={3} />

            {/* Railway track lines */}
            <RailwayTrack top={20} delay={0} />
            <RailwayTrack top={40} delay={1} />
            <RailwayTrack top={60} delay={2} />
            <RailwayTrack top={80} delay={3} />

            {/* Floating particles */}
            {particles.map(p => (
                <FloatingParticle key={p.id} {...p} />
            ))}

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Main login card */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-8 m-4"
            >
                <motion.div
                    className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
                    whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Card shine effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                        initial={{ x: "-200%" }}
                        animate={{ x: "200%" }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                    />

                    <div className="flex flex-col items-center mb-8 relative">
                        <motion.div
                            className="bg-gradient-to-br from-indigo-600 to-blue-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/40 mb-4"
                            animate={{
                                boxShadow: [
                                    "0 10px 40px -10px rgba(99, 102, 241, 0.4)",
                                    "0 20px 50px -10px rgba(99, 102, 241, 0.6)",
                                    "0 10px 40px -10px rgba(99, 102, 241, 0.4)"
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                            <TrainFront className="w-10 h-10 text-white" />
                        </motion.div>
                        <motion.h1
                            className="text-3xl font-bold text-white tracking-tight"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Trackloco
                        </motion.h1>
                        <motion.p
                            className="text-slate-400 text-sm mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Railway Intelligence System
                        </motion.p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative">
                        <motion.div
                            className="space-y-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="text-xs font-semibold text-slate-400 uppercase ml-1 tracking-wider">Username</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3.5 pl-11 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all group-hover:border-slate-600"
                                    placeholder="Enter ID"
                                />
                                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-4 transition-colors group-focus-within:text-indigo-400" />
                            </div>
                        </motion.div>

                        <motion.div
                            className="space-y-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="text-xs font-semibold text-slate-400 uppercase ml-1 tracking-wider">Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3.5 pl-11 pr-11 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all group-hover:border-slate-600"
                                    placeholder="••••••••"
                                />
                                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-4 transition-colors group-focus-within:text-indigo-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-4 text-slate-500 hover:text-indigo-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-center gap-3"
                            >
                                <Info className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <span className="text-sm text-red-200">{error}</span>
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-[length:200%_100%] hover:bg-right text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-500 flex items-center justify-center gap-2 group disabled:opacity-50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <motion.span
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            ) : (
                                <>
                                    Authenticate
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Bottom decorative line */}
                    <motion.div
                        className="mt-6 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}
