import React, { useState } from 'react';
import { X, Calendar, Loader2, TrainFront, MapPin, Ticket, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SeatAvailabilityModal({ isOpen, onClose, authFetch }) {
    const [trainNo, setTrainNo] = useState("");
    const [src, setSrc] = useState("");
    const [dst, setDst] = useState("");
    const [date, setDate] = useState("");
    const [classCode, setClassCode] = useState("SL");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeField, setActiveField] = useState(null); // 'src' or 'dst'

    async function handleCheckAvailability(e) {
        e.preventDefault();
        // Validation
        if (!trainNo || !src || !dst || !date || !classCode) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            // Check if date needs formatting (yyyy-mm-dd -> dd-mm-yyyy)
            let formattedDate = date;
            if (date.includes('-')) {
                const parts = date.split('-');
                if (parts[0].length === 4) {
                    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }

            const url = `/api/seat-availability?trainNo=${encodeURIComponent(trainNo)}&src=${encodeURIComponent(src)}&dst=${encodeURIComponent(dst)}&classes=${encodeURIComponent(classCode)}&date=${encodeURIComponent(formattedDate)}`;
            const res = await authFetch(url);
            const json = await res.json();

            if (json.errorMessage) {
                throw new Error(json.errorMessage);
            }

            // Basic validation of response content
            if (!json.trainName && !json.avlDayList) {
                throw new Error("No availability data found or invalid response.");
            }

            setData(json);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to fetch seat availability.");
        } finally {
            setLoading(false);
        }
    }

    const formatTimestamp = (ts) => {
        if (!ts) return "";
        // Assuming ts is like "2025-12-16T17:06:46.935" or object
        if (typeof ts === 'object' && ts.year) {
            return `${ts.day}/${ts.month}/${ts.year} ${ts.hour}:${ts.minute}`;
        }
        return ts;
    }

    // --- AUTOCOMPLETE LOGIC ---

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

    function handleInput(e, field) {
        const val = e.target.value;
        if (field === 'src') setSrc(val.toUpperCase());
        else setDst(val.toUpperCase());

        setActiveField(field);
        fetchSuggestions(val);
    }

    function selectSuggestion(s) {
        if (activeField === 'src') setSrc(s.code);
        else setDst(s.code);

        setSuggestions([]);
        setShowSuggestions(false);
        setActiveField(null);
    }

    // Helper to render suggestions dropdown
    const renderSuggestions = () => {
        if (!showSuggestions || suggestions.length === 0) return null;
        return (
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto z-50 text-left"
            >
                {suggestions.map((s, idx) => (
                    <div
                        key={idx}
                        onClick={() => selectSuggestion(s)}
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                    >
                        <div className="font-bold text-slate-800 font-mono text-sm">{s.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{s.code}</div>
                    </div>
                ))}
            </motion.div>
        );
    };

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
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shadow-md z-10">
                            <div className="flex items-center gap-3 text-white">
                                <Ticket className="w-6 h-6 text-indigo-400" />
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight">Seat Availability</h2>
                                    <p className="text-xs text-slate-400">Check availability for your train journey</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><TrainFront size={12} /> Train No</label>
                                    <input
                                        value={trainNo}
                                        onChange={(e) => setTrainNo(e.target.value)}
                                        placeholder="12345"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 font-mono"
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12} /> Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                    />
                                </div>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin size={12} /> From (Code)</label>
                                    <input
                                        value={src}
                                        onChange={(e) => handleInput(e, 'src')}
                                        onFocus={() => { setActiveField('src'); if (suggestions.length > 0) setShowSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder="e.g. SDAH"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 uppercase"
                                    />
                                    {activeField === 'src' && renderSuggestions()}
                                </div>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin size={12} /> To (Code)</label>
                                    <input
                                        value={dst}
                                        onChange={(e) => handleInput(e, 'dst')}
                                        onFocus={() => { setActiveField('dst'); if (suggestions.length > 0) setShowSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder="e.g. BKN"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 uppercase"
                                    />
                                    {activeField === 'dst' && renderSuggestions()}
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Ticket size={12} /> Class</label>
                                    <select
                                        value={classCode}
                                        onChange={(e) => setClassCode(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
                                    >
                                        {['1A', '2A', '3A', 'SL', '2S', 'CC', 'EC'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2 mt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Check Availability"}
                                    </button>
                                </div>
                            </form>

                            {/* Results Area */}
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm flex items-start gap-3 mb-6">
                                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </motion.div>
                                )}

                                {data && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                        <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 border-b border-indigo-100 pb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800">{data.trainName || "Train Name Unavailable"}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                        <span className="font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{data.trainNo}</span>
                                                        <span>•</span>
                                                        <span className="font-medium text-slate-700">{data.fetched_class}</span>
                                                        <span>•</span>
                                                        <span>{data.quota === "GN" ? "General Quota" : data.quota}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 text-lg font-bold text-slate-700 justify-end">
                                                        <span>{data.from}</span>
                                                        <ArrowRight className="w-4 h-4 text-slate-400" />
                                                        <span>{data.to}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1">Generated: {formatTimestamp(data.generatedTimeStamp)}</div>
                                                </div>
                                            </div>

                                            {/* Availability List */}
                                            {data.avlDayList && data.avlDayList.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {data.avlDayList.map((item, idx) => (
                                                        <div key={idx} className={`p-3 rounded-lg border ${item.availablityStatus && item.availablityStatus.includes('AVL') || item.availablityStatus.includes('AVAILABLE') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-700'}`}>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-sm font-bold">{item.availablityDate}</span>
                                                            </div>
                                                            <div className={`text-sm font-bold ${item.availablityStatus && (item.availablityStatus.includes('WL') || item.availablityStatus.includes('REGRET')) ? 'text-red-600' : 'text-green-600'}`}>
                                                                {item.availablityStatus}
                                                            </div>
                                                            {item.reason && <div className="text-xs text-slate-400 mt-1">{item.reason}</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-slate-500">No availability data for the selected criteria.</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
