import React, { useState } from 'react';
import EmptyResult from '../components/EmptyResult';
import ResultCard from '../components/ResultCard';
import { analyzeText } from '../services/api';
import { 
  FileTextIcon, 
  TrashIcon, 
  SparklesIcon, 
  LoaderIcon, 
  AlertCircleIcon 
} from '../components/Icons';

export default function TextDetectorPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Calculate live word count
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  // Calculate live character count
  const charCount = text.length;

  // Clear button handler
  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  // Analyze button handler (calls FastAPI backend)
  const handleAnalyze = async () => {
    // 1. Check that text is not empty
    if (!text.trim()) {
      setError('Text cannot be empty. Please enter or paste text to analyze.');
      setResult(null);
      return;
    }

    // 2. Clear previous errors and activate loading state
    setError(null);
    setLoading(true);

    try {
      // 3. Send text to the FastAPI backend and receive response
      const data = await analyzeText(text);
      setResult(data);
    } catch (err) {
      // 4. Handle API errors clearly
      setError(err.message || 'An error occurred while communicating with the backend.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
          <FileTextIcon className="w-4 h-4" />
          <span>Text Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          AI Text Detector
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Paste your writing, essay, article, or documentation below to scan for AI-generated patterns.
        </p>
      </div>

      {/* Main Text Input Box Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="relative">
          <textarea
            rows={9}
            value={text}
            disabled={loading}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste or write your text here (minimum 10 words required for statistical analysis)..."
            className="w-full rounded-xl border border-slate-200 p-4 text-slate-800 text-sm sm:text-base placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none resize-y disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Counter & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Word Count & Character Count */}
          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 font-medium w-full sm:w-auto justify-start">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
              <span className="text-slate-400">Words:</span>
              <span className="font-bold text-slate-800 font-mono">{wordCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
              <span className="text-slate-400">Characters:</span>
              <span className="font-bold text-slate-800 font-mono">{charCount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              disabled={text.length === 0 || loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs sm:text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Clear</span>
            </button>

            {/* Analyze Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={text.trim().length === 0 || loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <LoaderIcon className="w-4 h-4" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  <span>Analyze Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium animate-in fade-in duration-200">
            <AlertCircleIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Analysis Notice:</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Analysis Output
        </h3>

        {/* Loading Indicator Card */}
        {loading && (
          <div className="bg-white rounded-2xl border border-indigo-100 p-8 text-center shadow-sm animate-pulse">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
              <LoaderIcon className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">
              Extracting Linguistic & Statistical Patterns...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Evaluating sentence burstiness, vocabulary diversity, and recurrence markers via FastAPI backend.
            </p>
          </div>
        )}

        {/* Active Analysis Result */}
        {!loading && result && (
          <ResultCard result={result} />
        )}

        {/* Empty Result Placeholder */}
        {!loading && !result && (
          <EmptyResult
            title="No text analyzed yet"
            description="Enter your text in the box above and click 'Analyze Text' to calculate perplexity, burstiness, and overall AI likelihood."
            hint="FastAPI endpoint /api/analyze/text is connected and ready."
          />
        )}
      </div>
    </div>
  );
}
