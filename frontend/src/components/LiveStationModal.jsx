import React, { useState, useEffect } from 'react';
import { X, Loader2, Monitor, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveStationModal({ isOpen, onClose, authFetch }) {
    const [stationCode, setStationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Clock timer for the board
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    async function handleFetch(e) {
        e?.preventDefault();
        if (!stationCode || stationCode.length < 2) {
            setError("Please enter a valid station code (e.g., HWH).");
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await authFetch(`/api/live-station?stationCode=${encodeURIComponent(stationCode.toUpperCase())}`);
            const json = await res.json();

            if (json.success && json.data) {
                setData(json.data);
            } else {
                throw new Error("Station not found or no data available.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to fetch live station data.");
        } finally {
            setLoading(false);
        }
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // --- AUTOCOMPLETE LOGIC ---
    async function fetchSuggestions(query) {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const res = await authFetch(`/api/stations?query=${encodeURIComponent(query)}`);
            const json = await res.json();
            if (json.success && json.results) {
                setSuggestions(json.results);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            console.error("Failed to fetch suggestions", err);
        }
    }

    function handleInput(e) {
        const val = e.target.value;
        setStationCode(val);
        fetchSuggestions(val);
    }

    function selectSuggestion(s) {
        setStationCode(s.code);
        setSuggestions([]);
        setShowSuggestions(false);
    }

    // Close suggestions on click outside (optional, but good UX. For now rely on selection)

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4 sm:px-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content - Styled like a Digital Board */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-black rounded-xl border-4 border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Digital Header */}
                        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-red-500 font-mono font-bold text-xl tracking-widest animate-pulse">
                                    ● LIVE
                                </div>
                                <div className="h-6 w-[2px] bg-slate-700"></div>
                                <div className="text-yellow-400 font-mono text-lg">
                                    INDIAN RAILWAYS
                                </div>
                            </div>
                            <div className="text-cyan-400 font-mono text-xl font-bold">
                                {formatTime(currentTime)}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search Bar (Dark Theme) */}
                        <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex flex-col sm:flex-row gap-3 relative z-50">
                            <form onSubmit={handleFetch} className="flex-1 flex gap-3 relative">
                                <div className="flex-1 relative">
                                    <input
                                        value={stationCode}
                                        onChange={handleInput}
                                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder="ENTER STATION NAME OR CODE"
                                        className="w-full bg-black border border-slate-700 text-green-400 font-mono text-lg px-4 py-2 rounded focus:outline-none focus:border-green-500 placeholder-slate-700 uppercase"
                                    />
                                    {/* Suggestions Dropdown */}
                                    <AnimatePresence>
                                        {showSuggestions && suggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded shadow-xl overflow-hidden max-h-60 overflow-y-auto z-50"
                                            >
                                                {suggestions.map((s, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => selectSuggestion(s)}
                                                        className="px-4 py-2 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 transition-colors"
                                                    >
                                                        <div className="font-bold text-green-400 font-mono text-sm">{s.name}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{s.code}</div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono font-bold px-6 py-2 rounded border border-slate-700 transition-colors disabled:opacity-50 h-full"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "DISPLAY"}
                                </button>
                            </form>
                        </div>

                        {/* LED BOARD DISPLAY */}
                        <div className="flex-1 overflow-auto bg-black p-1">
                            {error && (
                                <div className="text-red-500 font-mono text-center p-8 text-xl border border-red-900 bg-red-900/10 m-4">
                                    ⚠ ERROR: {error}
                                </div>
                            )}

                            {!data && !loading && !error && (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-800 font-mono text-2xl gap-4">
                                    <Monitor className="w-16 h-16 opacity-20" />
                                    <div>WAITING FOR SIGNAL...</div>
                                </div>
                            )}

                            {data && (
                                <div>
                                    {/* Station Header */}
                                    <div className="text-center py-2 mb-2 border-b border-slate-800">
                                        <h2 className="text-yellow-400 font-mono text-2xl font-bold tracking-wider">
                                            {data.station.name} ({data.station.code})
                                        </h2>

                                    </div>

                                    {/* Table */}
                                    <div className="w-full">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-1 text-slate-400 font-mono text-sm border-b border-slate-800 pb-2 mb-2 px-2 sticky top-0 bg-black z-10">
                                            <div className="col-span-2">Train No.</div>
                                            <div className="col-span-4">Train Name</div>
                                            <div className="col-span-2 text-center">Sch / Exp</div>
                                            <div className="col-span-2 text-center">Status</div>
                                            <div className="col-span-1 text-center">A/D</div>
                                            <div className="col-span-1 text-center">PF</div>
                                        </div>

                                        {/* Table Rows */}
                                        <div className="space-y-1 px-2 pb-4">
                                            {data.trains.map((train, idx) => {
                                                const isDep = train.status.hasDeparted || (!train.status.hasArrived && train.schedule.departure);
                                                const scheduled = train.schedule.departure || train.schedule.arrival;
                                                const expected = train.live.expectedDeparture || train.live.expectedArrival;

                                                // Determine Display Status (A vs D)
                                                // Priority: Departure if schedule exists, else Arrival
                                                const isDeparture = !!train.schedule.departure;
                                                const displayStatus = isDeparture ? 'D' : 'A';

                                                // Determine Delay String
                                                // Assuming API returns "arrivalDelayDisplay" for arrival and "departureDelayDisplay" for departure
                                                // But user prompt specifically listed "arrivalDelayDisplay" under departing train section.
                                                // We will check both. If departure exists, prefer departure delay unless it's null/empty, then fall back or check logic.
                                                // Actually, looking at json:
                                                // Departure: "live": { "expectedDeparture": "10:17", "arrivalDelayDisplay": "On Time", "departureDelayDisplay": "On Time" }
                                                // Arrival: "live": { "expectedArrival": "10:17", "arrivalDelayDisplay": "00:12" }

                                                let delayStr = "On Time";
                                                if (isDeparture) {
                                                    delayStr = train.live.departureDelayDisplay || train.live.arrivalDelayDisplay || "On Time";
                                                } else {
                                                    delayStr = train.live.arrivalDelayDisplay || "On Time";
                                                }

                                                // Cancelled Logic
                                                let isCancelled = train.status.isCancelled || train.status.isArrivalCancelled || train.status.isDepartureCancelled;
                                                let statusColor = "text-green-400";

                                                if (isCancelled) {
                                                    delayStr = "CANCELLED";
                                                    statusColor = "text-red-500 flash";
                                                } else if (delayStr === "Rescheduled") {
                                                    delayStr = "RESCHED";
                                                    statusColor = "text-yellow-400";
                                                } else if (delayStr !== "On Time" && delayStr !== "RT" && delayStr !== "Right Time") {
                                                    statusColor = "text-red-400";
                                                }

                                                // Colors
                                                const trainNoColor = "text-fuchsia-500";
                                                const trainNameColor = train.train.type === "SUB" ? "text-yellow-400" : "text-green-400";

                                                return (
                                                    <div key={idx} className="grid grid-cols-12 gap-1 font-mono text-lg items-center border-b border-white/5 py-1">
                                                        <div className={`col-span-2 ${trainNoColor} font-bold`}>{train.train.number}</div>
                                                        <div className={`col-span-4 ${trainNameColor} truncate uppercase`} title={train.train.name}>
                                                            {train.train.name}
                                                        </div>
                                                        <div className="col-span-2 text-center text-white">
                                                            {scheduled} {expected && expected !== scheduled && <span className="text-yellow-300">/ {expected}</span>}
                                                        </div>
                                                        <div className={`col-span-2 text-center ${statusColor} truncate text-sm`}>
                                                            {delayStr}
                                                        </div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <span className={`px-2 rounded-sm text-black font-bold text-sm ${displayStatus === 'A' ? 'bg-green-500' : 'bg-orange-500'}`}>
                                                                {displayStatus}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-1 text-center text-white font-bold">
                                                            {train.platform || "-"}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
