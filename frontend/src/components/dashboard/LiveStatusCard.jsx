import React from "react";
import { motion } from "framer-motion";
import { Activity, Info, MapPin, Train } from "lucide-react";

export default function LiveStatusCard({ liveStatusData }) {
    if (!liveStatusData || !liveStatusData.trainCurrentPosition) return null;

    return (
        <motion.div
            className="rounded-2xl overflow-hidden mb-6 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Glassmorphic Header with gradient */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />

                <div className="relative p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <motion.div
                                    className="p-2 bg-white/20 backdrop-blur rounded-lg"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Activity className="w-5 h-5" />
                                </motion.div>
                                <h3 className="text-xl font-bold">Live Running Status</h3>
                                <motion.div
                                    className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold"
                                    animate={{ opacity: [1, 0.6, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    LIVE
                                </motion.div>
                            </div>
                            <p className="text-white/80 text-sm">
                                {liveStatusData.trainCurrentPosition["Train Name"]} • {liveStatusData.trainCurrentPosition["Train Hindi Name"]}
                            </p>
                        </motion.div>

                        <motion.div
                            className="text-left md:text-right bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                        >
                            <div className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Current Location</div>
                            <div className="font-bold text-lg">{liveStatusData.trainCurrentPosition["Last Station/Location"]}</div>
                            <motion.div
                                className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-sm font-bold ${liveStatusData.trainCurrentPosition["Last Station/Location Delay"]?.includes('On Time')
                                    ? 'bg-emerald-400/30 text-emerald-100'
                                    : 'bg-red-400/30 text-red-100'
                                    }`}
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${liveStatusData.trainCurrentPosition["Last Station/Location Delay"]?.includes('On Time')
                                    ? 'bg-emerald-300'
                                    : 'bg-red-300'
                                    }`} />
                                {liveStatusData.trainCurrentPosition["Last Station/Location Delay"]?.includes('On Time') ? 'On Time' : liveStatusData.trainCurrentPosition["Last Station/Location Delay"]}
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Status Message */}
                    <motion.div
                        className="mt-4 p-4 bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/20 flex items-start gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Info className="w-5 h-5 mt-0.5 text-cyan-200" />
                        </motion.div>
                        <span className="text-sm font-medium leading-relaxed">{liveStatusData.trainCurrentPosition["Train Status/Last Location"]}</span>
                    </motion.div>
                </div>
            </div>

            {/* ANIMATED TIMELINE */}
            {liveStatusData.etaTable && (
                <div className="bg-white relative">
                    {/* Timeline Header */}
                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <MapPin className="w-4 h-4 text-teal-600" />
                            Station Timeline
                        </div>
                        <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-200">
                            {liveStatusData.etaTable.length} stops
                        </span>
                    </div>

                    <div className="relative py-8 px-0">
                        {/* Animated vertical line - centered at 34px (left-8 + 2px) */}
                        <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-teal-200 via-slate-200 to-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-0 w-full bg-gradient-to-b from-teal-500 to-cyan-500"
                                initial={{ height: '0%' }}
                                animate={{ height: '100%' }}
                                transition={{ duration: 2, ease: 'easeOut' }}
                            />
                        </div>

                        {(() => {
                            // Find the index where train currently is
                            // We consider a station "passed" if it has arrived, OR if it's the source station and has departed
                            let trainPosition = -1;
                            for (let i = 0; i < liveStatusData.etaTable.length; i++) {
                                const row = liveStatusData.etaTable[i];
                                const hasArrived = row["Has Arrived ?"] === "Yes";
                                const hasDeparted = row["Has Departed ?"] === "Yes";
                                const isPassed = hasArrived || (i === 0 && hasDeparted);

                                if (isPassed) {
                                    trainPosition = i;
                                }
                            }
                            const showTrainMarker = trainPosition >= 0 && trainPosition < liveStatusData.etaTable.length - 1;

                            return liveStatusData.etaTable.map((row, idx) => {
                                // const hasArrived = row["Has Arrived ?"] === "Yes";
                                const hasDeparted = row["Has Departed ?"] === "Yes";
                                // For display purposes, we consider it "visited" if arrived, or if it's source and departed
                                const isVisited = (row["Has Arrived ?"] === "Yes") || (idx === 0 && hasDeparted);

                                const isDelayOnTime = row["Delay Arrival"]?.includes("On Time");
                                const hasDelayInfo = row["Delay Arrival"] && row["Delay Arrival"] !== "RT";
                                const isTrainHere = showTrainMarker && idx === trainPosition;

                                return (
                                    <motion.div
                                        key={idx}
                                        className="relative mb-6 last:mb-0"
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx, duration: 0.4 }}
                                    >
                                        {/* Timeline Node - centered at 34px (left-6 + 10px) */}
                                        <motion.div
                                            className={`absolute left-6 top-4 w-5 h-5 rounded-full border-4 border-white z-20 ${isVisited
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                                : 'bg-gradient-to-br from-slate-300 to-slate-400'
                                                }`}
                                            style={{ boxShadow: isVisited ? '0 0 15px rgba(16, 185, 129, 0.5)' : '0 2px 8px rgba(0,0,0,0.1)' }}
                                            whileHover={{ scale: 1.3 }}
                                            animate={isVisited ? {
                                                boxShadow: ['0 0 15px rgba(16, 185, 129, 0.3)', '0 0 25px rgba(16, 185, 129, 0.6)', '0 0 15px rgba(16, 185, 129, 0.3)']
                                            } : {}}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            {isVisited && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-full bg-emerald-400"
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            )}
                                        </motion.div>

                                        {/* Animated Train Marker - centered at 34px (left-[1.125rem] + 16px) */}
                                        {isTrainHere && (
                                            <motion.div
                                                className="absolute left-[1.125rem] z-30"
                                                style={{ top: 'calc(100% + 4px)' }}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                    y: [0, -5, 0]
                                                }}
                                                transition={{
                                                    opacity: { duration: 0.3 },
                                                    scale: { duration: 0.3 },
                                                    y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                                                }}
                                            >
                                                <div className="relative">
                                                    {/* Pulsing glow */}
                                                    <motion.div
                                                        className="absolute inset-0 bg-orange-400 rounded-full blur-md"
                                                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.3, 0.6] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                    {/* Train icon container */}
                                                    <div className="relative w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                                        <Train className="w-4 h-4 text-white" />
                                                    </div>
                                                    {/* "En Route" label */}
                                                    <motion.div
                                                        className="absolute left-10 top-1/2 -translate-y-1/2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-md"
                                                        animate={{ opacity: [1, 0.7, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        🚂 EN ROUTE
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Station Card - pushed right to clear timeline */}
                                        <motion.div
                                            className={`ml-20 mr-4 ${isVisited ? 'opacity-60' : ''}`}
                                            whileHover={{ scale: 1.01, x: 5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className={`p-4 rounded-xl border transition-all duration-300 ${isVisited
                                                ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200 hover:border-emerald-300'
                                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                                                }`}>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-bold text-slate-800 text-lg">{row["Station"]}</h4>
                                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full">
                                                                PF {row["PF"] || "-"}
                                                            </span>
                                                            {isVisited && (
                                                                <motion.span
                                                                    className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1"
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                >
                                                                    ✓ Departed
                                                                </motion.span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-slate-500 mt-0.5">{row["Station Name"]}</div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {/* Time Block */}
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ETA</div>
                                                            <div className="font-mono font-black text-slate-800 text-xl">{row["ETA"]}</div>
                                                            <div className="text-xs text-slate-400 line-through">{row["STA"]}</div>
                                                        </div>

                                                        {/* Status Block */}
                                                        <div className="text-right min-w-[90px]">
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Status</div>
                                                            {hasDelayInfo ? (
                                                                <motion.div
                                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${isDelayOnTime
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : 'bg-red-100 text-red-700'
                                                                        }`}
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${isDelayOnTime ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                                    {row["Delay Arrival"]}
                                                                </motion.div>
                                                            ) : (
                                                                <div className="text-slate-300 text-sm">—</div>
                                                            )}
                                                            <div className="text-xs text-slate-400 mt-0.5 font-mono">{row["Distance"]} km</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })
                        })()}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
