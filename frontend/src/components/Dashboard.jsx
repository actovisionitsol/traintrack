import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

// Sub-components
import BackgroundElements from "./dashboard/BackgroundElements";
import DashboardHeader from "./dashboard/DashboardHeader";
import SearchSection from "./dashboard/SearchSection";
import LocoMapContainer from "./dashboard/LocoMapContainer";
import TrainResultCard from "./dashboard/TrainResultCard";
import SpottingHistory from "./dashboard/SpottingHistory";
import LiveStatusCard from "./dashboard/LiveStatusCard";
import TechSpecsGrid from "./dashboard/TechSpecsGrid";

import CoachComposition from "./CoachComposition";
import DelayAnalysisModal from "./DelayAnalysisModal";
import SeatAvailabilityModal from "./SeatAvailabilityModal";
import LiveStationModal from "./LiveStationModal";

export default function Dashboard({ user, token, onLogout }) {
    // Tabs State: 'train' or 'loco'
    const [searchMode, setSearchMode] = useState('train');

    // Input States
    const [trainNo, setTrainNo] = useState("");
    const [date, setDate] = useState("");
    const [searchLocoNo, setSearchLocoNo] = useState("");

    // Data States
    const [loading, setLoading] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const [data, setData] = useState(null);
    const [locoData, setLocoData] = useState(null);
    const [coachData, setCoachData] = useState(null);
    const [liveStatusData, setLiveStatusData] = useState(null);
    const [error, setError] = useState(null);

    const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
    const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
    const [isLiveStationModalOpen, setIsLiveStationModalOpen] = useState(false);

    // Suggestion State
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Auth Fetch Helper
    async function authFetch(url) {
        const res = await fetch(`${url}`, {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30 text-slate-900 pb-20 font-sans relative overflow-hidden">
            <BackgroundElements />

            <DashboardHeader
                user={user}
                onLogout={onLogout}
                onOpenDelayModal={() => setIsDelayModalOpen(true)}
                onOpenSeatModal={() => setIsSeatModalOpen(true)}
                onOpenLiveStationModal={() => setIsLiveStationModalOpen(true)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT COLUMN --- */}
                <div className="lg:col-span-5 space-y-6">
                    <SearchSection
                        searchMode={searchMode}
                        setSearchMode={setSearchMode}
                        trainNo={trainNo}
                        handleTrainInput={handleTrainInput}
                        suggestions={suggestions}
                        showSuggestions={showSuggestions}
                        setShowSuggestions={setShowSuggestions}
                        selectSuggestion={selectSuggestion}
                        date={date}
                        setDate={setDate}
                        searchLocoNo={searchLocoNo}
                        setSearchLocoNo={setSearchLocoNo}
                        loading={loading}
                        error={error}
                        setError={setError}
                        fetchTrainDetails={fetchTrainDetails}
                        fetchLocoDirect={fetchLocoDirect}
                        onResetTrain={() => { setTrainNo(""); setDate(""); setData(null); setLocoData(null); setCoachData(null); setLiveStatusData(null); }}
                        onResetLoco={() => { setSearchLocoNo(""); setData(null); setLocoData(null); setCoachData(null); setLiveStatusData(null); }}
                    />

                    <LocoMapContainer locoData={locoData} />
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

                                <TrainResultCard
                                    data={data}
                                    locoData={locoData}
                                    mapLoading={mapLoading}
                                    onLocateMap={fetchLocoPositionMap}
                                />

                                <SpottingHistory spottings={data.spottings} />

                                {coachData && <CoachComposition composition={coachData} />}

                                <LiveStatusCard liveStatusData={liveStatusData} />

                                <TechSpecsGrid locoData={locoData} />

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <DelayAnalysisModal
                isOpen={isDelayModalOpen}
                onClose={() => setIsDelayModalOpen(false)}
                authFetch={authFetch}
            />

            <SeatAvailabilityModal
                isOpen={isSeatModalOpen}
                onClose={() => setIsSeatModalOpen(false)}
                authFetch={authFetch}
            />

            <LiveStationModal
                isOpen={isLiveStationModalOpen}
                onClose={() => setIsLiveStationModalOpen(false)}
                authFetch={authFetch}
            />
        </div>
    );
}
