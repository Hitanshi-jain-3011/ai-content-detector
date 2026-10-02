import React, { useState, useEffect } from 'react';
import { getAnalyses, deleteAnalysis } from '../services/api';
import ViewModal from '../components/ViewModal';
import { 
  HistoryIcon, 
  EyeIcon, 
  TrashIcon,
  FileTextIcon, 
  FileUpIcon, 
  SearchIcon,
  LoaderIcon,
  AlertCircleIcon
} from '../components/Icons';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch real analyses from SQLite backend
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalyses();
      setHistoryItems(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Delete analysis handler
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete analysis record #${id}?`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteAnalysis(id);
      // Remove from state immediately
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter items based on active tab and search query
  const filteredItems = historyItems.filter((item) => {
    const rawType = (item.analysis_type || 'text').toLowerCase();
    const matchesType =
      filterType === 'All'
        ? true
        : filterType === 'Text'
        ? rawType === 'text'
        : filterType === 'Documents'
        ? rawType === 'pdf' || rawType === 'docx' || rawType === 'file'
        : true;

    const preview = (item.text_preview || '').toLowerCase();
    const filename = (item.filename || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      preview.includes(query) ||
      filename.includes(query) ||
      rawType.includes(query) ||
      item.id.toString().includes(query);

    return matchesType && matchesSearch;
  });

  // Render type badge icon
  const getTypeBadge = (type = 'text') => {
    const normalized = type.toLowerCase();
    if (normalized === 'text') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <FileTextIcon className="w-3.5 h-3.5" />
          Text
        </span>
      );
    } else if (['pdf', 'docx', 'file'].includes(normalized)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <FileUpIcon className="w-3.5 h-3.5" />
          {type.toUpperCase()}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
        {type}
      </span>
    );
  };

  // Render AI Probability Pill
  const getProbabilityBadge = (prob) => {
    if (prob >= 70) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {prob}% (High AI)
        </span>
      );
    } else if (prob >= 40) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {prob}% (Mixed)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {prob}% (Human)
        </span>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>SQLite Audit Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Inspection History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View, inspect, or manage all past AI content scans stored in your local SQLite database.
          </p>
        </div>

        {/* Refresh Button */}
        <div>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition disabled:opacity-50"
            title="Refresh database records"
          >
            <HistoryIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {['All', 'Text', 'Documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search preview or record ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <AlertCircleIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">Database Connection Error</span>
            <p className="text-xs sm:text-sm text-rose-700">{error}</p>
          </div>
          <button
            onClick={fetchHistory}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* History Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Type</th>
                <th className="py-3.5 px-4 sm:px-6">Filename / Text Preview</th>
                <th className="py-3.5 px-4 sm:px-6">AI Probability</th>
                <th className="py-3.5 px-4 sm:px-6">Human Probability</th>
                <th className="py-3.5 px-4 sm:px-6">Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {/* Loading State */}
              {loading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <LoaderIcon className="w-7 h-7 mx-auto text-indigo-600 mb-3" />
                    <p className="text-sm font-semibold text-slate-800">Loading analysis history...</p>
                    <p className="text-xs text-slate-500 mt-0.5">Fetching records from SQLite database</p>
                  </td>
                </tr>
              )}

              {/* Empty State */}
              {!loading && !error && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
                      <HistoryIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No analyses found in database</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchTerm || filterType !== 'All'
                        ? 'No records match your active search or category filters.'
                        : 'Submit text in the Text Detector to run your first analysis and save it to SQLite.'}
                    </p>
                  </td>
                </tr>
              )}

              {/* Populated Data Rows */}
              {!loading && !error && filteredItems.length > 0 && (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/75 transition-colors group"
                  >
                    {/* 1. Type */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      {getTypeBadge(item.analysis_type)}
                    </td>

                    {/* 2. Filename / Text Preview */}
                    <td className="py-4 px-4 sm:px-6 max-w-xs sm:max-w-sm">
                      <div className="font-semibold text-slate-900 truncate">
                        {item.filename || `Text Scan #${item.id}`}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5" title={item.text_preview}>
                        {item.text_preview || 'No preview available'}
                      </div>
                    </td>

                    {/* 3. AI Probability */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      {getProbabilityBadge(item.ai_probability)}
                    </td>

                    {/* 4. Human Probability */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.human_probability}%
                      </span>
                    </td>

                    {/* 5. Date */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                    </td>

                    {/* 6. Actions (View and Delete) */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 text-xs font-semibold transition shadow-sm"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={(e) => handleDelete(item.id, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition disabled:opacity-50"
                          title="Delete record from SQLite database"
                        >
                          {deletingId === item.id ? (
                            <LoaderIcon className="w-3.5 h-3.5 text-rose-600" />
                          ) : (
                            <TrashIcon className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredItems.length} of {historyItems.length} records</span>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            SQLite Connected
          </span>
        </div>
      </div>

      {/* Complete Record View Modal */}
      {selectedItem && (
        <ViewModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
