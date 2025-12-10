import React from 'react';
import { motion } from 'framer-motion';
import { TrainFront, Info } from 'lucide-react';

export default function CoachComposition({ composition }) {
    if (!composition || !composition.cgs_prs_ids || composition.cgs_prs_ids.length === 0) {
        return null;
    }

    const { cgs_prs_ids, trainNo } = composition;

    // Helper to determine coach color/style based on type
    const getCoachStyle = (code) => {
        const c = code.toUpperCase();

        // Engine
        if (c === 'ENG' || c === 'LOCO') return { bg: 'bg-orange-500', text: 'text-white', label: 'Loco' };

        // SLR / Guard
        if (c === 'LPR' || c === 'SLRD' || c === 'SLR' || c === 'EOG') return { bg: 'bg-red-500', text: 'text-white', label: 'SLR' };

        // AC Coaches (A, B, H, C, M)
        if (c.startsWith('A') || c.startsWith('B') || c.startsWith('H') || c.startsWith('C') || c.startsWith('M')) {
            return { bg: 'bg-blue-400', text: 'text-white', label: 'AC' };
        }

        // Sleeper (S)
        if (c.startsWith('S') && !c.startsWith('SL')) { // Avoid matching SLRD as Sleeper if logic overlaps, though SLRD handled above
            return { bg: 'bg-emerald-600', text: 'text-white', label: 'Sleeper' };
        }

        // General / Others
        if (c === 'GEN' || c === 'GS' || c === 'UR') return { bg: 'bg-emerald-500', text: 'text-white', label: 'General' };

        // Pantry
        if (c === 'PC') return { bg: 'bg-green-600', text: 'text-white', label: 'Pantry' };

        // Default
        return { bg: 'bg-slate-400', text: 'text-white', label: 'Other' };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6"
        >
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrainFront className="w-5 h-5 text-slate-500" />
                    <h3 className="font-bold text-slate-700">Coach Composition</h3>
                </div>
                <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2 py-1 rounded border border-slate-300">
                    Total: {cgs_prs_ids.length}
                </span>
            </div>

            <div className="p-6 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max pb-4">
                    {/* Always show Engine first if not in list, but usually it is or we just prepend a visual one if needed. 
                        The API seems to return 'LPR' at ends, maybe 'ENG' is not always there? 
                        The screenshot shows 'Eng' at the start. Let's trust the API list but if 'Eng' isn't there, maybe we shouldn't force it unless we know.
                        However, the screenshot shows a distinct 'Eng' box. 
                        Let's just map the array provided.
                    */}
                    <div className="flex flex-col items-center gap-1">
                        <div className={`w-12 h-10 flex items-center justify-center rounded-md shadow-sm font-bold text-xs bg-white border-2 border-slate-300 text-slate-700`}>
                            Eng
                        </div>
                    </div>

                    {cgs_prs_ids.map((coach, idx) => {
                        const style = getCoachStyle(coach);
                        return (
                            <div key={idx} className="flex flex-col items-center gap-1">
                                <div
                                    className={`w-10 h-10 flex items-center justify-center rounded-md shadow-sm font-bold text-xs ${style.bg} ${style.text}`}
                                    title={style.label}
                                >
                                    {coach}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Loco</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400"></span> AC</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> SLR</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Sleeper</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> General</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600"></span> Pantry</div>
                </div>
            </div>
        </motion.div>
    );
}
