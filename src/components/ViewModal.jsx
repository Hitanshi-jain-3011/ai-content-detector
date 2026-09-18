import React from 'react';
import { XIcon, ShieldCheckIcon, AlertCircleIcon, CheckCircleIcon, CpuIcon } from './Icons';

export default function ViewModal({ item, onClose }) {
  if (!item) return null;

  const aiProbability = item.ai_probability ?? item.aiProbability ?? 0;
  const humanProbability = item.human_probability ?? (100 - aiProbability);
  const wordCount = item.word_count ?? item.details?.wordCount ?? 0;
  const sentenceCount = item.sentence_count ?? item.details?.sentenceCount ?? 0;
  const avgSentenceLength = item.average_sentence_length ?? item.details?.average_sentence_length ?? 0;
  const vocabDiversity = item.vocabulary_diversity ?? item.details?.vocabulary_diversity ?? 0;
  const repetitionScore = item.repetition_score ?? item.details?.repetition_score ?? 0;
  const createdAt = item.created_at ? new Date(item.created_at).toLocaleString() : item.date || 'Unknown';
  const type = item.analysis_type ? item.analysis_type.toUpperCase() : (item.type || 'TEXT');
  const previewText = item.text_preview || item.preview || item.filename || 'No preview available';

  const isHighRisk = aiProbability >= 70;
  const isModerate = aiProbability >= 40 && aiProbability < 70;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/75">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800">
              {type}
            </span>
            <h3 className="text-base font-bold text-slate-800">
              Analysis Record #{item.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Main Probabilities Highlight */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                Detection Probabilities
              </span>
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-[11px] text-slate-600 block">AI Likelihood</span>
                  <span className={`text-2xl font-black font-mono ${
                    isHighRisk ? 'text-rose-600' : isModerate ? 'text-amber-600' : 'text-indigo-600'
                  }`}>
                    {aiProbability}%
                  </span>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  <span className="text-[11px] text-slate-600 block">Human Likelihood</span>
                  <span className="text-2xl font-black font-mono text-emerald-600">
                    {humanProbability}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 sm:text-right">
              <span className="block text-[11px] font-semibold text-slate-600 uppercase">Analysis Date</span>
              <span className="font-medium text-slate-700">{createdAt}</span>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isHighRisk 
                    ? 'bg-rose-100 text-rose-700' 
                    : isModerate 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isHighRisk ? 'High AI Content' : isModerate ? 'Mixed Patterns' : 'Likely Human'}
                </span>
              </div>
            </div>
          </div>

          {/* Target Text Snippet / Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Saved Content Preview
            </label>
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono break-words leading-relaxed max-h-32 overflow-y-auto">
              {previewText}
            </div>
          </div>

          {/* Complete Saved Structural Metrics */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Saved Linguistic Metrics
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <span className="text-slate-600 block">Word Count</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{wordCount}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <span className="text-slate-600 block">Sentence Count</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{sentenceCount}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <span className="text-slate-600 block">Avg. Sentence Length</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{avgSentenceLength}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <span className="text-slate-600 block">Vocabulary Diversity</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{vocabDiversity} ({Math.round(vocabDiversity * 100)}%)</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 col-span-2 sm:col-span-1">
                <span className="text-slate-600 block">Repetition Score</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{repetitionScore} ({Math.round(repetitionScore * 100)}%)</span>
              </div>
            </div>
          </div>

          {/* Prototype disclaimer */}
          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
            <AlertCircleIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              This record was saved in your local SQLite database without persisting the complete submitted text to maintain privacy.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
