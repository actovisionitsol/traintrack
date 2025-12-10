import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrainFront, User, Lock, Info, ChevronRight } from "lucide-react";

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:4000/api/login', {
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
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"></div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md p-8 m-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/30 mb-4">
                            <TrainFront className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Trackloco Site</h1>
                        <p className="text-slate-400 text-sm">Restricted Access Terminal</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300 uppercase ml-1">Username</label>
                            <div className="relative">
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Enter ID" />
                                <User className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300 uppercase ml-1">Password</label>
                            <div className="relative">
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="••••••••" />
                                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                            </div>
                        </div>
                        {error && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2"><Info className="w-4 h-4 text-red-400" /><span className="text-sm text-red-200">{error}</span></motion.div>)}
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group">
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Authenticate"}
                            {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
