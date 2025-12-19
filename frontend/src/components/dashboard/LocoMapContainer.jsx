import React from "react";
import TrainMap from "../TrainMap";
import { MapPin } from "lucide-react";

export default function LocoMapContainer({ locoData }) {
    return (
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
    );
}
