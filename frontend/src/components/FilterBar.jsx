import React, { useState, useEffect, useRef } from 'react';

const FilterBar = ({ filters, onFilterChange, onReset, districts = [] }) => {
  const [localFilters, setLocalFilters] = useState(filters || {
    status: 'all',
    district: 'all',
    search: '',
    sortBy: 'date_desc',
    limit: 10,
    page: 1
  });
  const [dateError, setDateError] = useState('');
  const [touchedFilters, setTouchedFilters] = useState(new Set());
  const searchTimeoutRef = useRef(null);

  // Synchronize local state with props when filters change externally
  useEffect(() => {
    if (filters) {
      setLocalFilters(filters);
    }
  }, [filters]);

  // Validate date range
  const validateDateRange = (startDate, endDate) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return 'Start date cannot be after end date';
    }
    return '';
  };

  // Debounced search handler
  const handleSearchChange = (value) => {
    setLocalFilters(prev => ({ ...prev, search: value }));
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      onFilterChange({ ...localFilters, search: value });
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...localFilters, [name]: value };
    
    // Validate dates on change
    if (name === 'startDate' || name === 'endDate') {
      const error = validateDateRange(
        name === 'startDate' ? value : updatedFilters.startDate,
        name === 'endDate' ? value : updatedFilters.endDate
      );
      setDateError(error);
    }

    setLocalFilters(updatedFilters);
    setTouchedFilters(prev => new Set([...prev, name]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final validation before submit
    const error = validateDateRange(localFilters.startDate, localFilters.endDate);
    if (error) {
      setDateError(error);
      return;
    }

    onFilterChange(localFilters);
  };

  // Remove individual filter
  const removeFilter = (filterName) => {
    const resetValue = {
      status: 'all',
      district: 'all',
      startDate: '',
      endDate: '',
      search: '',
      sortBy: 'date_desc',
      limit: 10,
      page: 1
    };

    const updatedFilters = { ...localFilters, [filterName]: resetValue[filterName] };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      status: 'all',
      district: 'all',
      startDate: '',
      endDate: '',
      search: '',
      sortBy: 'date_desc',
      limit: 10,
      page: 1
    };
    setLocalFilters(resetFilters);
    setTouchedFilters(new Set());
    setDateError('');
    onFilterChange(resetFilters);
    if (onReset) onReset();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg 
          className="w-5 h-5 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter & Search
      </h3>
      
      <form onSubmit={handleSubmit} role="search" aria-label="Application filter form">
        {/* Search Row */}
        <div className="mb-4">
          <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search-input"
            type="text"
            name="search"
            value={localFilters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by Application ID, Applicant Name, Email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search applications"
            aria-describedby="search-hint"
          />
          <p id="search-hint" className="mt-1 text-xs text-gray-500">
            Search is debounced for better performance
          </p>
        </div>

        {/* Filters Row */}
        <fieldset className="mb-4">
          <legend className="sr-only">Application Filters</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                name="status"
                value={localFilters.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by application status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="bank_selected">Bank Selected</option>
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label htmlFor="district-filter" className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <select
                id="district-filter"
                name="district"
                value={localFilters.district}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by district"
              >
                <option value="all">All Districts</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort-filter"
                name="sortBy"
                value={localFilters.sortBy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Sort applications by"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="cost_desc">Highest Cost</option>
                <option value="cost_asc">Lowest Cost</option>
                <option value="status">By Status</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div>
              <label htmlFor="limit-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Items Per Page
              </label>
              <select
                id="limit-filter"
                name="limit"
                value={localFilters.limit || 10}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Number of items per page"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Date Range Row */}
        <fieldset className="mb-4">
          <legend className="sr-only">Date Range Filter</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                id="start-date"
                type="date"
                name="startDate"
                value={localFilters.startDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dateError && touchedFilters.has('startDate') ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-label="Filter by start date"
                aria-invalid={dateError ? 'true' : 'false'}
                aria-describedby={dateError ? 'date-error' : undefined}
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                id="end-date"
                type="date"
                name="endDate"
                value={localFilters.endDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dateError && touchedFilters.has('endDate') ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-label="Filter by end date"
                aria-invalid={dateError ? 'true' : 'false'}
                aria-describedby={dateError ? 'date-error' : undefined}
              />
            </div>
          </div>
          {dateError && (
            <div id="date-error" className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {dateError}
            </div>
          )}
        </fieldset>

        {/* Active Filters Display */}
        {(localFilters.search || localFilters.status !== 'all' || localFilters.district !== 'all' || localFilters.startDate || localFilters.endDate) && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 font-medium">Active Filters:</span>
              {localFilters.search && (
                <button
                  type="button"
                  onClick={() => removeFilter('search')}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  aria-label={`Remove search filter: ${localFilters.search}`}
                  title="Click to remove filter"
                >
                  Search: {localFilters.search}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {localFilters.status !== 'all' && (
                <button
                  type="button"
                  onClick={() => removeFilter('status')}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  aria-label={`Remove status filter: ${localFilters.status}`}
                  title="Click to remove filter"
                >
                  Status: {localFilters.status}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {localFilters.district !== 'all' && (
                <button
                  type="button"
                  onClick={() => removeFilter('district')}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                  aria-label={`Remove district filter: ${localFilters.district}`}
                  title="Click to remove filter"
                >
                  District: {localFilters.district}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {localFilters.startDate && (
                <button
                  type="button"
                  onClick={() => removeFilter('startDate')}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                  aria-label={`Remove from date filter: ${localFilters.startDate}`}
                  title="Click to remove filter"
                >
                  From: {localFilters.startDate}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {localFilters.endDate && (
                <button
                  type="button"
                  onClick={() => removeFilter('endDate')}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                  aria-label={`Remove to date filter: ${localFilters.endDate}`}
                  title="Click to remove filter"
                >
                  To: {localFilters.endDate}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            aria-label="Reset all filters to default values"
          >
            Reset Filters
          </button>
          <button
            type="submit"
            disabled={dateError !== ''}
            className={`px-4 py-2 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              dateError !== '' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
            aria-label="Apply selected filters"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterBar;

