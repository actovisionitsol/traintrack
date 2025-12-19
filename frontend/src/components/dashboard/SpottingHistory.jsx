import React from "react";
import { History } from "lucide-react";

export default function SpottingHistory({ spottings }) {
    if (!spottings || spottings.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    Spotting History
                </h3>
                <span className="text-xs font-medium text-slate-500">{spottings.length} Records</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                        <tr>
                            <th className="px-6 py-3">#</th>
                            <th className="px-6 py-3">Loco No</th>
                            <th className="px-6 py-3">Station</th>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Shed</th>
                            <th className="px-6 py-3">Zone/Div</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {spottings.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{row.spotting_no}</td>
                                <td className="px-6 py-4 font-bold text-indigo-600 font-mono text-base">{row.loco_no}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                        {row.spotting_station}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium whitespace-nowrap">{row.spotting_time}</td>
                                <td className="px-6 py-4 font-bold text-slate-700">{row.type}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                        {row.base_shed}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                    {row.spotting_zone} / {row.spotting_div}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
