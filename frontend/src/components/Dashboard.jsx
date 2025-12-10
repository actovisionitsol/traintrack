import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrainFront, Info, Navigation, Zap, Hash, Settings, Layers, Activity, Locate, Map as MapIcon, Monitor, LogOut, MapPin, Calendar, AlertTriangle
} from "lucide-react";
import TrainMap from "./TrainMap";
import SpecRow from "./SpecRow";
import CoachComposition from "./CoachComposition";
import DelayAnalysisModal from "./DelayAnalysisModal";

export default function Dashboard({ user, token, onLogout }) {
    // Tabs State: 'train' or 'loco'
    const [searchMode, setSearchMode] = useState('train');

    // Input States
    const [trainNo, setTrainNo] = useState("");
    const [date, setDate] = useState("");
    const [searchLocoNo, setSearchLocoNo] = useState(""); // For Tab 2

    // Data States
    const [loading, setLoading] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const [data, setData] = useState(null);
    const [locoData, setLocoData] = useState(null);
    const [coachData, setCoachData] = useState(null);
    const [liveStatusData, setLiveStatusData] = useState(null);
    const [error, setError] = useState(null);
    const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);

    // Suggestion State
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Auth Fetch Helper
    async function authFetch(url) {
        const res = await fetch(`http://localhost:4000${url}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (res.status === 401 || res.status === 403) {
            onLogout();
            throw new Error("Session expired.");
        }
        return res;
    }

    // --- SUGGESTIONS LOGIC ---
    async function fetchSuggestions(query) {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const res = await authFetch(`/api/train-suggestions?query=${encodeURIComponent(query)}`);
            const json = await res.json();
            if (json.ok && json.suggestions) {
                setSuggestions(json.suggestions.slice(0, 10)); // Show top 10
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (err) {
            console.error("Failed to fetch suggestions", err);
        }
    }

    function handleTrainInput(e) {
        const val = e.target.value;
        setTrainNo(val);
        fetchSuggestions(val);
    }

    function selectSuggestion(s) {
        setTrainNo(s.number);
        setSuggestions([]);
        setShowSuggestions(false);
        // Optional: Auto-trigger search if date is present, or just let user click Fetch
    }

    // --- 1. SEARCH BY TRAIN NUMBER ---
    async function fetchTrainDetails(e) {
        e?.preventDefault();
        setError(null);
        setData(null);
        setLocoData(null);
        setCoachData(null);
        setLiveStatusData(null);

        if (!trainNo || !date) {
            setError("Please provide a train number and a date.");
            return;
        }

        setLoading(true);
        try {
            const detailsPromise = authFetch(`/api/train-details?trainNo=${encodeURIComponent(trainNo)}&date=${encodeURIComponent(date)}`);
            const infoPromise = authFetch(`/api/train-info?trainNo=${encodeURIComponent(trainNo)}`);
            const coachPromise = authFetch(`/api/coach-composition?trainNo=${encodeURIComponent(trainNo)}`);

            const [detailsRes, infoRes, coachRes] = await Promise.all([detailsPromise, infoPromise, coachPromise]);
            const detailsJson = await detailsRes.json();
            const infoJson = await infoRes.json();
            const coachJson = await coachRes.json();

            if (!detailsJson.ok && !detailsJson.trainNo) throw new Error("No locomotive data found.");

            setData({
                ...detailsJson,
                trainName: infoJson.ok ? infoJson.trainName : null,
                trainType: infoJson.ok ? infoJson.trainType : null,
                trainOwningRly: infoJson.ok ? infoJson.owningRly : null,
            });
            setCoachData(coachJson);

            // Step 4: Fetch Live Train Status
            try {
                // Format date from YYYY-MM-DD to dd-MMM-yy
                const dateObj = new Date(date);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = dateObj.toLocaleString('default', { month: 'short' });
                const year = String(dateObj.getFullYear()).slice(-2);
                const formattedDate = `${day}-${month}-${year}`;

                const liveRes = await authFetch(`/api/live-status?trainNo=${encodeURIComponent(trainNo)}&startDate=${formattedDate}`);
                const liveJson = await liveRes.json();
                setLiveStatusData(liveJson);
            } catch (ignore) {
                console.log("Live status fetch failed", ignore);
            }

        } catch (err) {
            setError(err.message || "Failed to fetch train details.");
        } finally {
            setLoading(false);
        }
    }

    // --- 2. SEARCH BY LOCO NUMBER ---
    async function fetchLocoDirect(e) {
        e?.preventDefault();
        setError(null);
        setData(null);
        setLocoData(null);
        setCoachData(null);
        setLiveStatusData(null);

        if (!searchLocoNo) {
            setError("Please enter a locomotive number.");
            return;
        }

        setLoading(true);
        try {
            // Step 1: Fetch Loco Position & Specs directly
            const locoRes = await authFetch(`/api/loco-position?locoNo=${encodeURIComponent(searchLocoNo)}`);
            const locoJson = await locoRes.json();

            if (!locoJson.ok) throw new Error("Locomotive not found or API error.");

            setLocoData(locoJson);

            // Step 2: Prepare the "Blue Card" Data
            // If the loco has an assigned train, try to fetch that train's name
            let trainName = null;
            let trainType = null;
            let trainRly = null;

            if (locoJson.specs.train_no && locoJson.specs.train_no !== "N/A") {
                try {
                    const infoRes = await authFetch(`/api/train-info?trainNo=${encodeURIComponent(locoJson.specs.train_no)}`);
                    const infoJson = await infoRes.json();
                    if (infoJson.ok) {
                        trainName = infoJson.trainName;
                        trainType = infoJson.trainType;
                        trainRly = infoJson.owningRly;
                    }
                } catch (ignore) { /* train info fetch is optional */ }
            }

            // Construct a data object to drive the Primary Card
            setData({
                trainNo: locoJson.specs.train_no || "Idle",
                trainName: trainName || (locoJson.specs.train_no ? "Name Unavailable" : "Locomotive Idle"),
                trainType: trainType || locoJson.specs.service || "N/A",
                trainOwningRly: trainRly || locoJson.specs.owning_rly,
                loco_no: locoJson.specs.loco_no,
                type: locoJson.specs.type,
                base_shed: locoJson.specs.base_shed,
                // Add other fields if needed for the card
            });

        } catch (err) {
            setError(err.message || "Failed to track locomotive.");
        } finally {
            setLoading(false);
        }
    }

    // --- 3. MAP BUTTON HANDLER (Only for Train Search flow) ---
    async function fetchLocoPositionMap(locoNo) {
        if (!locoNo) return;
        setMapLoading(true);
        try {
            const res = await authFetch(`/api/loco-position?locoNo=${encodeURIComponent(locoNo)}`);
            const json = await res.json();
            if (json.ok && json.lat) setLocoData(json);
            else alert("Live location not available for this locomotive.");
        } catch (err) {
            if (err.message !== "Session expired.") alert("Could not fetch loco position.");
        } finally {
            setMapLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
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
                            onClick={() => setIsDelayModalOpen(true)}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm font-semibold"
                        >
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span>Delay Detector</span>
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT COLUMN --- */}
                <div className="lg:col-span-5 space-y-6">
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
                                    <button type="button" onClick={() => { setTrainNo(""); setDate(""); setData(null); setLocoData(null); setCoachData(null); setLiveStatusData(null); }} className="px-4 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-slate-600">Reset</button>
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
                                    <button type="button" onClick={() => { setSearchLocoNo(""); setData(null); setLocoData(null); setCoachData(null); setLiveStatusData(null); }} className="px-4 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-slate-600">Reset</button>
                                </div>
                            </form>
                        )}

                    </div>

                    {/* MAP */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[400px] relative z-0">
                        <TrainMap lat={locoData?.lat} lng={locoData?.lng} speed={0} lastUpdated={locoData?.specs?.last_event || "Live"} />
                        {!locoData && (
                            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-slate-400 z-[400]">
                                <MapPin className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm font-medium text-slate-500">Map Inactive</p>
                            </div>
                        )}
                        {locoData && (
                            <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur border border-slate-200 px-3 py-2 rounded-lg shadow-sm text-xs font-mono text-slate-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    {locoData.lat?.toFixed(4)}, {locoData.lng?.toFixed(4)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {!data ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                <Activity className="w-16 h-16 mb-4 text-slate-300" />
                                <p className="text-lg font-medium text-slate-500">System Idle</p>
                                <p className="text-sm">Initiate a search to view telemetry.</p>
                            </motion.div>
                        ) : (
                            <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

                                {/* PRIMARY BLUE CARD */}
                                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-xl text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                                    <div className="p-8 relative z-10">
                                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-8">
                                            <div className="flex-1">
                                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Assigned Train</p>
                                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 mb-2">
                                                    <h1 className="text-5xl font-bold font-mono tracking-tight leading-none">{data.trainNo}</h1>
                                                    <h2 className="text-lg sm:text-xl font-medium text-indigo-100 uppercase tracking-tight line-clamp-1">{data.trainName}</h2>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-indigo-200 font-medium">
                                                    <span>Owning Railway: <span className="text-white">{data.trainOwningRly || data.owning_rly || "N/A"}</span></span>
                                                    <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                                                    <span>Category: <span className="text-white">{data.trainType || "N/A"}</span></span>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right shrink-0">
                                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Loco ID</p>
                                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-inner">
                                                    <Hash className="w-5 h-5 text-indigo-100" />
                                                    <span className="text-2xl font-mono font-bold tracking-wide">{data.loco_no}</span>
                                                </div>
                                                <div className="mt-2 flex items-center md:justify-end gap-3 text-sm text-indigo-100/90 font-medium">
                                                    <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-300" fill="currentColor" /><span>{data.type || "N/A"}</span></div>
                                                    <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                                                    <div className="flex items-center gap-1"><span className="text-indigo-300 text-xs uppercase">Shed</span><span className="uppercase">{data.base_shed || "N/A"}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Only show map button if we aren't already tracking (which we are in loco mode) */}
                                        {!locoData && (
                                            <button onClick={() => fetchLocoPositionMap(data.loco_no)} disabled={mapLoading || !data.loco_no} className="w-full bg-white text-indigo-600 hover:bg-indigo-50 py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all group disabled:opacity-70">
                                                {mapLoading ? <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform" />}
                                                {mapLoading ? "Acquiring Satellite Lock..." : "Locate on Map"}
                                            </button>
                                        )}
                                        {locoData && (
                                            <div className="w-full bg-white/10 text-indigo-50 py-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10">
                                                <Monitor className="w-5 h-5 animate-pulse" /> Live Telemetry Active
                                            </div>
                                        )}
                                    </div>
                                </div>


                                {/* COACH COMPOSITION */}
                                {coachData && <CoachComposition composition={coachData} />}

                                {/* LIVE STATUS CARD */}
                                {liveStatusData && liveStatusData.trainCurrentPosition && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <Activity className="w-5 h-5 text-indigo-600" />
                                                        Live Running Status
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {liveStatusData.trainCurrentPosition["Train Name"]} • {liveStatusData.trainCurrentPosition["Train Hindi Name"]}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Location</div>
                                                    <div className="font-semibold text-slate-700">{liveStatusData.trainCurrentPosition["Last Station/Location"]}</div>
                                                    <div className={`text-sm font-bold ${liveStatusData.trainCurrentPosition["Last Station/Location Delay"]?.includes('On Time') ? 'text-green-600' : 'text-red-600'}`}>
                                                        {liveStatusData.trainCurrentPosition["Last Station/Location Delay"]?.includes('On Time') ? 'On Time' : `Delayed by ${liveStatusData.trainCurrentPosition["Last Station/Location Delay"]}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 p-3 bg-indigo-50 text-indigo-800 rounded-lg text-sm font-medium border border-indigo-100 flex items-start gap-2">
                                                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                                                {liveStatusData.trainCurrentPosition["Train Status/Last Location"]}
                                            </div>
                                        </div>

                                        {/* TIMELINE */}
                                        {liveStatusData.etaTable && (
                                            <div className="relative py-4">
                                                {/* Continuous Animated Line */}
                                                {/* Centered in the w-12 (48px) column. Center is 24px (left-6). */}
                                                <div className="absolute left-6 top-0 bottom-0 w-1.5 bg-slate-200 transform -translate-x-1/2 overflow-hidden rounded-full">
                                                    <div className="absolute inset-0 w-full h-full timeline-line-animated opacity-80"></div>
                                                </div>

                                                {liveStatusData.etaTable.map((row, idx) => {
                                                    const hasArrived = row["Has Arrived ?"] === "Yes";
                                                    const isDelayOnTime = row["Delay Arrival"]?.includes("On Time");
                                                    const hasDelayInfo = row["Delay Arrival"] && row["Delay Arrival"] !== "RT";

                                                    return (
                                                        <div key={idx} className={`flex gap-4 mb-8 last:mb-0 relative z-10 ${hasArrived ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                                                            {/* Left Column: Dot Container */}
                                                            <div className="w-12 flex-shrink-0 flex flex-col items-center pt-5">
                                                                <div
                                                                    className={`w-5 h-5 rounded-full border-4 border-white shadow-md z-10 ${hasArrived ? 'bg-green-600' : 'bg-slate-300'}`}
                                                                ></div>
                                                            </div>

                                                            {/* Right Column: Content Card */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-bold text-slate-800 text-lg">{row["Station"]}</h4>
                                                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-mono rounded border border-slate-200">PF {row["PF"] || "-"}</span>
                                                                            </div>
                                                                            <div className="text-sm text-slate-500">{row["Station Name"]}</div>
                                                                        </div>

                                                                        <div className="flex items-center gap-6">
                                                                            <div className="text-right">
                                                                                <div className="text-xs text-slate-400 uppercase tracking-wider">Arrival</div>
                                                                                <div className="font-mono font-bold text-slate-700 text-lg">{row["ETA"]}</div>
                                                                                <div className="text-xs text-slate-400 strike-through decoration-slate-300">{row["STA"]}</div>
                                                                            </div>

                                                                            <div className="text-right min-w-[80px]">
                                                                                <div className="text-xs text-slate-400 uppercase tracking-wider">Status</div>
                                                                                {hasDelayInfo ? (
                                                                                    <div className={`font-bold text-sm ${isDelayOnTime ? 'text-green-600' : 'text-red-600'}`}>
                                                                                        {row["Delay Arrival"]}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-slate-300 text-sm">-</div>
                                                                                )}
                                                                                <div className="text-xs text-slate-400">{row["Distance"]} km</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {hasArrived && (
                                                                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 text-xs font-medium text-green-600">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                                                                            Train has departed from this station
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TECHNICAL SPECS GRID (UPDATED) */}
                                {locoData && locoData.specs && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2"><Settings className="w-5 h-5 text-slate-500" /><h3 className="font-bold text-slate-700">Technical Specifications</h3></div>
                                            <span className="text-xs font-mono bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200">SIGNAL: STRONG</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                            <div className="p-0">
                                                <SpecRow label="Traction" value={locoData.specs.traction === 'E' ? 'Electric' : 'Diesel'} icon={<Zap size={16} />} />
                                                <SpecRow label="Type" value={locoData.specs.type} icon={<TrainFront size={16} />} />
                                                {/* Base Shed Highlighted */}
                                                <SpecRow label="Base Shed" value={locoData.specs.base_shed} icon={<Layers size={16} />} highlightShed />
                                                <SpecRow label="Owning Rly" value={locoData.specs.owning_rly} icon={<Activity size={16} />} />
                                                <SpecRow label="Zone" value={locoData.specs.zone} icon={<MapIcon size={16} />} />
                                                <SpecRow label="Division" value={locoData.specs.division} icon={<Locate size={16} />} />
                                            </div>
                                            <div className="p-0 border-t md:border-t-0 border-slate-100">
                                                <SpecRow label="Assigned Train" value={locoData.specs.train_no} icon={<Hash size={16} />} />
                                                <SpecRow label="Service" value={locoData.specs.service === 'P' ? 'Passenger' : locoData.specs.service} icon={<Info size={16} />} />
                                                <SpecRow label="Start Date" value={locoData.specs.start_date} icon={<Calendar size={16} />} />
                                                <SpecRow label="Current Status" value={locoData.specs.status} highlight />
                                                <SpecRow label="Last Event" value={locoData.specs.last_event} />
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 text-center border-t border-slate-200"><p className="text-xs text-slate-400">loco_position</p></div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* DELAY ANALYSIS MODAL - Global */}
            <DelayAnalysisModal
                isOpen={isDelayModalOpen}
                onClose={() => setIsDelayModalOpen(false)}
                authFetch={authFetch}
            />
        </div>
    );
}
