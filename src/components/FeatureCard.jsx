import React from 'react';
import { ArrowRightIcon } from './Icons';

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  badge,
  badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200",
  iconBg = "from-indigo-600 to-indigo-500",
  supportedFormats,
  buttonText = "Open Detector",
  onOpen
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Header with Icon & Badge */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className={`w-13 h-13 p-3.5 rounded-xl bg-gradient-to-tr ${iconBg} text-white shadow-md transition-transform group-hover:scale-105 duration-300 flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-5">
          {description}
        </p>

        {/* Supported Formats */}
        {supportedFormats && (
          <div className="mb-6 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-2">
              Supported Formats
            </span>
            <div className="flex flex-wrap gap-1.5">
              {supportedFormats.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button to open respective page */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpen}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-medium text-sm group-hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <span>{buttonText}</span>
          <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
