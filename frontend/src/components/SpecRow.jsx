import React from "react";

export default function SpecRow({ label, value, icon, highlight = false, highlightShed = false }) {
    // Default logic
    let content = value || "--";
    let textClass = "text-slate-900";

    if (highlight) {
        textClass = "text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-bold";
    } else if (highlightShed) {
        // Special Highlight for Base Shed
        content = (
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md border border-indigo-200 font-bold shadow-sm tracking-wide">
                {value || "--"}
            </span>
        );
    }

    return (
        <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">{icon && <div className="text-slate-400">{icon}</div>}<span className="text-sm font-medium text-slate-500">{label}</span></div>
            <div className={`text-sm font-semibold ${!highlightShed ? textClass : ''}`}>{content}</div>
        </div>
    );
}
