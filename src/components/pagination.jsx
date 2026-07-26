import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalRecords, 
  limit, 
  onPageChange, 
  onLimitChange 
}) => {
  const [jumpPage, setJumpPage] = useState(currentPage);

  // Calculate the range of items being shown
  const startItem = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalRecords);

  // Generate page numbers to show (max 5 buttons)
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleJumpPage = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      onPageChange(val);
      setJumpPage(val);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 bg-white border-t border-slate-200 w-full mt-4 rounded-b-lg space-y-4">
      {/* Top text */}
      <div className="text-sm text-slate-500">
        Showing {startItem} to {endItem} of {totalRecords} entries
      </div>

      {/* Bottom controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
        
        {/* Limit Dropdown */}
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select 
            value={limit} 
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
          >
            {[10, 25, 50, 100].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onPageChange(1)} 
            disabled={currentPage === 1}
            className="p-1 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft size={16} />
          </button>
          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="p-1 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 border rounded transition-colors ${
                currentPage === pageNum 
                  ? 'bg-orange-500 text-white border-orange-500 font-medium' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="p-1 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button 
            onClick={() => onPageChange(totalPages)} 
            disabled={currentPage === totalPages}
            className="p-1 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        {/* Page Info */}
        <div className="font-medium text-slate-500">
          Page {currentPage} of {totalPages || 1}
        </div>

        {/* Go To Page */}
        <div className="flex items-center gap-2">
          <span>Go to page:</span>
          <input 
            type="number" 
            min="1" 
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onBlur={handleJumpPage}
            onKeyDown={(e) => { if (e.key === 'Enter') handleJumpPage(e); }}
            className="w-16 border border-slate-300 rounded px-2 py-1 text-center outline-none focus:border-blue-500"
          />
        </div>

      </div>
    </div>
  );
};

export default Pagination;
