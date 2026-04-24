import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, MapPin, Tag, SortDesc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedSearch = ({ filters, onFilterChange, districts = [], roles = [], statuses = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const searchTimeoutRef = useRef(null);

  const defaultStatuses = statuses.length > 0 ? statuses : [
    { id: 'all', label: 'All Protocols' },
    { id: 'pending', label: 'Pending' },
    { id: 'under_review', label: 'In Review' },
    { id: 'approved', label: 'Authorized' },
    { id: 'bank_selected', label: 'Bank Sync' },
    { id: 'completed', label: 'Finalized' },
    { id: 'rejected', label: 'Rejected' }
  ];

  const handleSearchChange = (val) => {
    setLocalSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      onFilterChange({ ...filters, search: val, page: 1 });
    }, 500);
  };

  const handleFilterToggle = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFilterChange({
      status: 'all',
      district: 'all',
      search: '',
      sortBy: 'newest',
      page: 1,
      limit: 100
    });
  };

  return (
    <div className="w-full mb-12">
      <div className="relative group">
        {/* Main Search Bar */}
        <div className={`relative flex items-center transition-all duration-500 bg-white border border-slate-100 rounded-[2.5rem] p-2 shadow-sm group-hover:shadow-xl group-hover:border-blue-100 ${isExpanded ? 'ring-4 ring-blue-600/5 border-blue-200' : ''}`}>
          <div className="pl-6 text-slate-300 group-hover:text-blue-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by Identity, Protocol ID, or Location..."
            className="flex-1 px-4 py-4 bg-transparent outline-none font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <div className="flex items-center gap-2 pr-2">
            {localSearch && (
              <button 
                onClick={() => handleSearchChange('')}
                className="p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            )}
            <div className="w-px h-8 bg-slate-100 mx-2" />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              <Filter size={14} />
              Advanced Filters
              <ChevronDown size={14} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 10, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="absolute top-full left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border border-slate-100 rounded-[3rem] p-10 shadow-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Status Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Tag size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Lifecycle Status</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {defaultStatuses.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleFilterToggle('status', s.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filters.status === s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* District Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <MapPin size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Geospatial Origin</span>
                  </div>
                  <div className="relative">
                    <select
                      value={filters.district || 'all'}
                      onChange={(e) => handleFilterToggle('district', e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-transparent focus:border-blue-200 rounded-2xl font-black text-xs uppercase tracking-widest appearance-none outline-none transition-all"
                    >
                      <option value="all">All Regions</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  </div>
                </div>

                {/* Sort Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <SortDesc size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Data Sequencing</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'newest', label: 'Chronological' },
                      { id: 'oldest', label: 'Historical' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleFilterToggle('sortBy', s.id)}
                        className={`px-4 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${filters.sortBy === s.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Live Syncing Registry Intelligence...
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
                >
                  Clear All Parameters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Chips */}
      <div className="flex flex-wrap gap-3 mt-6">
        {(filters.status !== 'all' || filters.district !== 'all' || filters.search) && (
          <AnimatePresence>
            {filters.search && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-widest">Query: {filters.search}</span>
                <button onClick={() => handleSearchChange('')} className="hover:text-blue-800"><X size={12} /></button>
              </motion.div>
            )}
            {filters.status !== 'all' && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-widest">Status: {filters.status}</span>
                <button onClick={() => handleFilterToggle('status', 'all')} className="hover:text-emerald-800"><X size={12} /></button>
              </motion.div>
            )}
            {filters.district !== 'all' && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full border border-purple-100 shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-widest">Region: {filters.district}</span>
                <button onClick={() => handleFilterToggle('district', 'all')} className="hover:text-purple-800"><X size={12} /></button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
