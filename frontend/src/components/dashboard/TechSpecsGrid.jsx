import React from "react";
import { motion } from "framer-motion";
import { Settings, Zap, TrainFront, Layers, Activity, Map as MapIcon, Locate, Info, Calendar, Hash } from "lucide-react";
import SpecRow from "../SpecRow";

export default function TechSpecsGrid({ locoData }) {
    if (!locoData || !locoData.specs) return null;

    return (
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
    );
}
