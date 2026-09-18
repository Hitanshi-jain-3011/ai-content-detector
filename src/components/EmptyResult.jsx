import React from 'react';
import { CpuIcon, AlertCircleIcon, ShieldCheckIcon } from './Icons';

export default function EmptyResult({
  title = "Ready for Analysis",
  description = "Your AI detection results and probability breakdown will appear here after clicking Analyze.",
  hint = "Supports text snippets, documents, and image formats."
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-10 text-center">
      {/* Icon */}
      <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4">
        <CpuIcon className="w-7 h-7" />
      </div>

      {/* Heading & description */}
      <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
        {title}
      </h4>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
        {description}
      </p>

      {/* Placeholder Metrics Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
          <span className="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">AI Probability</span>
          <span className="text-slate-600 text-lg font-bold font-mono">-- %</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
          <span className="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">Confidence</span>
          <span className="text-slate-600 text-lg font-bold font-mono">--</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
          <span className="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">Result Tag</span>
          <span className="text-slate-600 text-lg font-bold font-mono">Waiting</span>
        </div>
      </div>

      {/* Subtle hint */}
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
        <AlertCircleIcon className="w-3.5 h-3.5 text-slate-600" />
        <span>{hint}</span>
      </div>
    </div>
  );
}
