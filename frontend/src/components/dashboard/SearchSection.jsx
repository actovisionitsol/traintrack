import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

export default function SearchSection({
    searchMode,
    setSearchMode,
    trainNo,
    handleTrainInput,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion,
    date,
    setDate,
    searchLocoNo,
    setSearchLocoNo,
    loading,
    error,
    setError,
    fetchTrainDetails,
    fetchLocoDirect,
    onResetTrain,
    onResetLoco
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 relative z-20">

            {/* TABS HEADER */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 rounded-t-2xl">
                <button
                    onClick={() => { setSearchMode('train'); setError(null); }}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${searchMode === 'train' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Search By Train Number
                </button>
                <button
                    onClick={() => { setSearchMode('loco'); setError(null); }}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${searchMode === 'loco' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Search Loco
                </button>
            </div>

            {/* TAB CONTENT: TRAIN SEARCH */}
            {searchMode === 'train' && (
                <form onSubmit={fetchTrainDetails} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2 sm:col-span-1 relative">
                            <label className="text-xs font-bold text-slate-500 uppercase">Train No</label>
                            <input
                                value={trainNo}
                                onChange={handleTrainInput}
                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="11448"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-lg"
                                inputMode="numeric"
                                autoComplete="off"
                            />
                            {/* Suggestions Dropdown */}
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                                    >
                                        {suggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => selectSuggestion(s)}
                                                className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                                            >
                                                <div className="font-bold text-slate-800 font-mono">{s.number}</div>
                                                <div className="text-xs text-slate-500 truncate">{s.name}</div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                        </div>
                    </div>
                    {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2"><Info className="w-4 h-4" /> {error}</div>}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2">{loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Fetch Data"}</button>
                        <button type="button" onClick={onResetTrain} className="px-4 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-slate-600">Reset</button>
                    </div>
                </form>
            )}

            {/* TAB CONTENT: LOCO SEARCH */}
            {searchMode === 'loco' && (
                <form onSubmit={fetchLocoDirect} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Locomotive Number</label>
                        <input value={searchLocoNo} onChange={(e) => setSearchLocoNo(e.target.value)} placeholder="37928" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-lg" inputMode="numeric" />
                    </div>
                    {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2"><Info className="w-4 h-4" /> {error}</div>}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2">{loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Find Loco"}</button>
                        <button type="button" onClick={onResetLoco} className="px-4 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-slate-600">Reset</button>
                    </div>
                </form>
            )}

        </div>
    );
}
