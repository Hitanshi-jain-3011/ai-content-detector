import React from 'react';
import { SparklesIcon, ShieldCheckIcon } from './Icons';

export default function Footer({ setActivePage }) {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <SparklesIcon className="w-3.5 h-3.5" />
            </div>
            <span>AI Content Detector</span>
            <span className="text-slate-600 text-xs ml-2 font-normal hidden sm:inline">| Frontend Prototype</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <button onClick={() => setActivePage('text')} className="hover:text-indigo-600 transition-colors">Text</button>
            <button onClick={() => setActivePage('files')} className="hover:text-indigo-600 transition-colors">Files</button>
            <button onClick={() => setActivePage('history')} className="hover:text-indigo-600 transition-colors">History</button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
            <span>Client-side UI Demo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
