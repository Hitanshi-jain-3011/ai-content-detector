import React from 'react';
import FeatureCard from '../components/FeatureCard';
import { 
  FileTextIcon, 
  FileUpIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  CpuIcon 
} from '../components/Icons';

export default function HomePage({ setActivePage }) {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-6 pb-2 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
          <SparklesIcon className="w-4 h-4 text-indigo-600" />
          <span>Next-Generation AI Content Analysis</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight mb-4">
          Detect AI-Generated Content in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Seconds</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Scan text passages and uploaded documents to inspect authenticity and calculate synthetic generation probabilities.
        </p>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Text Detector */}
          <FeatureCard
            title="Text Detector"
            description="Paste essays, blog posts, articles, or code to analyze syntax patterns, perplexity, and stylistic uniformity."
            icon={FileTextIcon}
            iconBg="from-indigo-600 to-indigo-500"
            badge="Direct Input"
            badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200"
            supportedFormats={['Plain Text', 'Markdown', 'Pasted Copy']}
            buttonText="Open Text Detector"
            onOpen={() => setActivePage('text')}
          />

          {/* Card 2: File Detector */}
          <FeatureCard
            title="File Detector"
            description="Upload research papers, corporate reports, or resumes to inspect comprehensive document-level signals."
            icon={FileUpIcon}
            iconBg="from-blue-600 to-cyan-500"
            badge="Document Scan"
            badgeColor="bg-blue-50 text-blue-700 border-blue-200"
            supportedFormats={['.PDF', '.DOCX', '.TXT']}
            buttonText="Open File Detector"
            onOpen={() => setActivePage('files')}
          />
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="max-w-5xl mx-auto px-4 pt-4">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold">Multi-Modal Detection Architecture</h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Prepared for integration with modern language models, forensic document parsers, and visual anomaly detection pipelines.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/10">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
              <span>Safe & Private</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/10">
              <CpuIcon className="w-4 h-4 text-indigo-400" />
              <span>Instant UI</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
