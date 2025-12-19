import React from "react";
import { TrainFront, AlertTriangle, Ticket, Monitor, LogOut } from "lucide-react";

export default function DashboardHeader({
    user,
    onLogout,
    onOpenDelayModal,
    onOpenSeatModal,
    onOpenLiveStationModal
}) {
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-[1000] bg-opacity-90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
                        <TrainFront className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Trackloco <span className="text-indigo-600">Site</span></h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Locomotive Telemetry</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Logged in as</span>
                        <span className="text-sm font-semibold text-slate-800">{user}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                    <button
                        onClick={onOpenDelayModal}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm font-semibold"
                    >
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Delay Detector</span>
                    </button>
                    <button
                        onClick={onOpenSeatModal}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm font-semibold"
                    >
                        <Ticket className="w-4 h-4 text-indigo-500" />
                        <span>Seat Availability</span>
                    </button>
                    <button
                        onClick={onOpenLiveStationModal}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm font-semibold"
                    >
                        <Monitor className="w-4 h-4 text-emerald-600" />
                        <span>Live Station</span>
                    </button>
                    <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                        {user.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
}
