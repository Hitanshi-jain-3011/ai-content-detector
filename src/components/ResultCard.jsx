import React from 'react';
import { 
  SparklesIcon, 
  ShieldCheckIcon, 
  AlertCircleIcon, 
  CheckCircleIcon,
  CpuIcon,
  FileTextIcon
} from './Icons';

export default function ResultCard({ result }) {
  if (!result) return null;

  const { ai_probability, human_probability, details, filename } = result;

  // Determine risk category & colors
  const isHighAi = ai_probability >= 70;
  const isMixed = ai_probability >= 40 && ai_probability < 70;

  // SVG Circular Gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const aiStrokeDashoffset = circumference - (ai_probability / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-7 animate-in fade-in-50 duration-300">
      {/* Header with Title & Verdict Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <SparklesIcon className="w-4 h-4" />
            <span>{filename ? 'Document Analysis Results' : 'Detection Results'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {filename ? filename : 'Content Authenticity Assessment'}
          </h2>
          {filename && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-mono">
              <FileTextIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Analyzed File: {filename}</span>
            </div>
          )}
        </div>

        {/* Verdict Badge */}
        <div>
          {isHighAi ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
              <AlertCircleIcon className="w-4 h-4 text-rose-600" />
              High AI Probability
            </span>
          ) : isMixed ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
              <AlertCircleIcon className="w-4 h-4 text-amber-600" />
              Mixed AI & Human Patterns
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
              Likely Human Written
            </span>
          )}
        </div>
      </div>

      {/* Main Probability Scores & Visual Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Visual Donut Chart */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50/75 rounded-2xl border border-slate-100">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle (Human track) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-emerald-400"
                strokeWidth="10"
                fill="transparent"
              />
              {/* AI circle segment */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={isHighAi ? "stroke-rose-500" : isMixed ? "stroke-amber-500" : "stroke-indigo-500"}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={aiStrokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black font-mono leading-none ${
                isHighAi ? 'text-rose-600' : isMixed ? 'text-amber-600' : 'text-indigo-600'
              }`}>
                {ai_probability}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">AI Score</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-2">Distribution Ratio</span>
        </div>

        {/* Dual Percentage Cards & Comparison Bar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* AI Probability Card */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isHighAi 
                ? 'bg-rose-50/60 border-rose-200' 
                : isMixed 
                ? 'bg-amber-50/60 border-amber-200' 
                : 'bg-indigo-50/60 border-indigo-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Probability</span>
                <CpuIcon className={`w-4 h-4 ${isHighAi ? 'text-rose-500' : isMixed ? 'text-amber-500' : 'text-indigo-500'}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl sm:text-4xl font-black font-mono ${
                  isHighAi ? 'text-rose-600' : isMixed ? 'text-amber-600' : 'text-indigo-600'
                }`}>
                  {ai_probability}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isHighAi ? 'Dominant synthetic patterns detected' : isMixed ? 'Moderate LLM markers observed' : 'Low presence of AI patterns'}
              </p>
            </div>

            {/* Human Probability Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Human Probability</span>
                <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600">
                  {human_probability}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {human_probability > 60 ? 'Organic natural variations detected' : 'Under-represented human signals'}
              </p>
            </div>
          </div>

          {/* Visual Stacked Progress Bar Chart */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold text-slate-500 px-1">
              <span className="text-indigo-600 font-bold">AI: {ai_probability}%</span>
              <span className="text-emerald-600 font-bold">Human: {human_probability}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${ai_probability}%` }}
                className={`h-full transition-all duration-700 ease-out ${
                  isHighAi ? 'bg-gradient-to-r from-rose-500 to-rose-400' : isMixed ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-500'
                }`}
                title={`AI Probability: ${ai_probability}%`}
              />
              <div
                style={{ width: `${human_probability}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700 ease-out"
                title={`Human Probability: ${human_probability}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Structural Metrics Breakdown Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Linguistic Metrics Analysis
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Word Count */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Word Count
            </span>
            <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
              {details.word_count}
            </span>
            <span className="text-[10px] text-slate-500">Total analyzed words</span>
          </div>

          {/* 2. Sentence Count */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sentence Count
            </span>
            <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
              {details.sentence_count}
            </span>
            <span className="text-[10px] text-slate-500">Detected sentences</span>
          </div>

          {/* 3. Average Sentence Length */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Avg. Sentence Len
            </span>
            <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
              {details.average_sentence_length}
            </span>
            <span className="text-[10px] text-slate-500">Words per sentence</span>
          </div>

          {/* 4. Vocabulary Diversity */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Vocab Diversity
            </span>
            <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
              {details.vocabulary_diversity}
            </span>
            <span className="text-[10px] text-slate-500">
              Type-Token Ratio ({Math.round(details.vocabulary_diversity * 100)}%)
            </span>
          </div>

          {/* 5. Repetition Score */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Repetition Score
            </span>
            <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
              {details.repetition_score}
            </span>
            <span className="text-[10px] text-slate-500">
              Pattern rate ({Math.round(details.repetition_score * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer / Estimation Note */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
        <AlertCircleIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] sm:text-xs">
          <strong>Prototype Estimation:</strong> This result is calculated by extracting rule-based surface linguistic metrics (sentence uniformity, vocabulary variance, and repetition markers). It serves as a statistical likelihood indicator rather than definitive proof of AI origin.
        </p>
      </div>
    </div>
  );
}
