import React, { useState } from 'react';
import { X, AlertTriangle, Clock, TrainFront, Calendar, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DelayAnalysisModal({ isOpen, onClose, authFetch }) {
    const [trainNo, setTrainNo] = useState("");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    async function handleAnalyze(e) {
        e.preventDefault();
        if (!trainNo || !date) {
            setError("Please enter both Train Number and Date.");
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            // Ensure date is in dd-mm-yyyy format for the backend/API
            let formattedDate = date;
            if (date.includes('-')) {
                const parts = date.split('-');
                if (parts[0].length === 4) {
                    // YYYY-MM-DD -> DD-MM-YYYY
                    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }

            const res = await authFetch(`/api/delay-analysis?trainNo=${trainNo}&startDate=${encodeURIComponent(formattedDate)}`);
            const json = await res.json();

            if (json.success) {
                if (json.no_delay) {
                    setAnalysis("No Significant Delay");
                } else {
                    setAnalysis(json.analysis);
                }
            } else {
                setError("Unable to fetch delay analysis. Please check the details.");
            }
        } catch (err) {
            setError("Failed to connect to delay analysis service.");
        } finally {
            setLoading(false);
        }
    }

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
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white">
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight">Delay Detector</h2>
                                    <p className="text-xs text-slate-400">Find out why your train is delayed with AI-powered analysis</p>
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
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleAnalyze} className="space-y-4 mb-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Train Number</label>
                                    <input
                                        value={trainNo}
                                        onChange={(e) => setTrainNo(e.target.value)}
                                        placeholder="Enter 5-digit train number (e.g., 12129)"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Date (DD MM YYYY)</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Delay"}
                                </button>
                            </form>

                            {/* Results Area */}
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </motion.div>
                                )}

                                {analysis && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                                        <h3 className="text-indigo-900 font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <Search className="w-4 h-4" /> Delay Analysis
                                        </h3>
                                        <div className="prose prose-sm prose-indigo text-slate-700 leading-relaxed">
                                            <p>{analysis}</p>
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
