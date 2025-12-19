import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Hash, Zap, Navigation, Monitor } from "lucide-react";

export default function TrainResultCard({ data, locoData, mapLoading, onLocateMap }) {
    if (!data) return null;

    return (
        <motion.div
            className="relative rounded-2xl shadow-2xl text-white overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.01 }}
        >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700" />

            {/* Animated mesh pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`
                }} />
            </div>

            {/* Glowing orbs */}
            <motion.div
                className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-white/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
                className="absolute bottom-[-30%] left-[-10%] w-[300px] h-[300px] bg-purple-400/20 rounded-full blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 5, repeat: Infinity }}
            />

            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                initial={{ x: '-200%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            />

            {/* Card content */}
            <div className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-8">
                    <div className="flex-1">
                        <motion.div
                            className="flex items-center gap-2 mb-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Sparkles className="w-4 h-4 text-indigo-200" />
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Assigned Train</p>
                        </motion.div>
                        <motion.div
                            className="flex flex-col sm:flex-row sm:items-baseline gap-3 mb-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-5xl font-black font-mono tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">{data.trainNo}</h1>
                            <h2 className="text-lg sm:text-xl font-semibold text-white/90 uppercase tracking-tight line-clamp-1">{data.trainName}</h2>
                        </motion.div>
                        <motion.div
                            className="flex items-center gap-4 text-sm text-indigo-200 font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span>Owning Railway: <span className="text-white font-semibold">{data.trainOwningRly || data.owning_rly || "N/A"}</span></span>
                            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse"></span>
                            <span>Category: <span className="text-white font-semibold">{data.trainType || "N/A"}</span></span>
                        </motion.div>
                    </div>
                    <motion.div
                        className="text-left md:text-right shrink-0"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">Loco ID</p>
                        <motion.div
                            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 shadow-lg"
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.25)' }}
                            transition={{ duration: 0.2 }}
                        >
                            <Hash className="w-5 h-5 text-indigo-100" />
                            <span className="text-2xl font-mono font-black tracking-wide">{data.loco_no || 'N/A'}</span>
                        </motion.div>
                        <div className="mt-3 flex items-center md:justify-end gap-3 text-sm text-indigo-100/90 font-medium">
                            <motion.div
                                className="flex items-center gap-1 bg-yellow-400/20 px-2 py-1 rounded-full"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Zap className="w-3 h-3 text-yellow-300" fill="currentColor" />
                                <span>{data.type || "N/A"}</span>
                            </motion.div>
                            <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                            <div className="flex items-center gap-1">
                                <span className="text-indigo-300 text-xs uppercase">Shed</span>
                                <span className="uppercase font-semibold">{data.base_shed || "N/A"}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Action Button */}
                {!locoData && (
                    <motion.button
                        onClick={() => onLocateMap(data.loco_no)}
                        disabled={mapLoading || !data.loco_no}
                        className="w-full bg-white text-indigo-600 hover:bg-indigo-50 py-4 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 transition-all group disabled:opacity-70"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {mapLoading ? (
                            <motion.span
                                className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                        ) : (
                            <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                        )}
                        {mapLoading ? "Acquiring Satellite Lock..." : "Locate on Map"}
                    </motion.button>
                )}
                {locoData && (
                    <motion.div
                        className="w-full bg-white/15 backdrop-blur text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/20"
                        animate={{ boxShadow: ['0 0 20px rgba(255,255,255,0.1)', '0 0 40px rgba(255,255,255,0.2)', '0 0 20px rgba(255,255,255,0.1)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Monitor className="w-5 h-5" />
                        </motion.div>
                        Live Telemetry Active
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
