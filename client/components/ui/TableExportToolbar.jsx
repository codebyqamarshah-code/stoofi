'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  MoreVertical, 
  Check, 
  Copy, 
  FileSpreadsheet, 
  Columns, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Maximize2
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData, copyToClipboard } from '@/lib/exportUtils';

export default function TableExportToolbar({
  data = null,
  headers = null,
  columns = null, // array of { id, key, label, visible }
  onToggleColumn = null,
  filename = 'Export_Data',
  title = 'Data Report',
  tableSelector = null, // optional specific table selector
  className = '',
  showDensity = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [density, setDensity] = useState('normal'); // 'compact' | 'normal' | 'relaxed'
  const [activeColumns, setActiveColumns] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const menuRef = useRef(null);
  const toolbarRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !toolbarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Show temporary toast
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Find nearest table in DOM if data or columns are not fully supplied
  const getNearestTable = () => {
    if (typeof document === 'undefined') return null;
    if (tableSelector) return document.querySelector(tableSelector);
    if (toolbarRef.current) {
      // Look up parent container then down for table
      const parentCard = toolbarRef.current.closest('.bg-white, .rounded-xl, .border, [class*="col-span"], [class*="overflow"]');
      if (parentCard) {
        const tbl = parentCard.querySelector('table');
        if (tbl) return tbl;
      }
      return document.querySelector('table');
    }
    return document.querySelector('table');
  };

  // Initialize columns from props or DOM table
  useEffect(() => {
    if (columns && Array.isArray(columns) && columns.length > 0) {
      setActiveColumns(columns.map(c => ({
        id: c.id || c.key || c.label,
        key: c.key || c.id || c.label,
        label: c.label || c.title || c.key || 'Column',
        visible: c.visible !== false
      })));
    } else {
      // Extract from nearest table DOM
      const tbl = getNearestTable();
      if (tbl) {
        const thElements = Array.from(tbl.querySelectorAll('thead th'));
        if (thElements.length > 0) {
          const domCols = thElements.map((th, index) => {
            const text = th.innerText.trim() || `Column ${index + 1}`;
            return {
              id: `col-${index}`,
              index,
              key: `col_${index}`,
              label: text,
              visible: th.style.display !== 'none'
            };
          });
          setActiveColumns(domCols);
        }
      }
    }
  }, [columns]);

  // Extract structured data from table if data prop is not provided
  const getTableData = () => {
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    const tbl = getNearestTable();
    if (!tbl) return [];

    const thElements = Array.from(tbl.querySelectorAll('thead th'));
    const colHeaders = thElements.map((th, i) => th.innerText.trim() || `Column ${i + 1}`);

    const rows = Array.from(tbl.querySelectorAll('tbody tr'));
    const extracted = rows.map((tr) => {
      const cells = Array.from(tr.querySelectorAll('td'));
      const rowObj = {};
      cells.forEach((td, i) => {
        const colName = colHeaders[i] || `Column ${i + 1}`;
        // Exclude action buttons text if complicated
        rowObj[colName] = td.innerText.replace(/\n+/g, ' ').trim();
      });
      return rowObj;
    });

    return extracted;
  };

  // Toggle column visibility
  const toggleColumnVisibility = (colId, colIndex) => {
    setActiveColumns(prev => {
      const updated = prev.map(c => {
        if (c.id === colId || c.key === colId || c.index === colIndex) {
          return { ...c, visible: !c.visible };
        }
        return c;
      });

      // If callback provided
      if (onToggleColumn) {
        onToggleColumn(colId, !prev.find(c => c.id === colId || c.key === colId)?.visible, updated);
      }

      // Apply DOM visibility style to nearest table
      const tbl = getNearestTable();
      if (tbl) {
        const targetIdx = typeof colIndex === 'number' ? colIndex : prev.findIndex(c => c.id === colId || c.key === colId);
        if (targetIdx !== -1) {
          const isNowVisible = updated[targetIdx]?.visible;
          // Toggle the TH
          const ths = tbl.querySelectorAll('thead th');
          if (ths[targetIdx]) {
            ths[targetIdx].style.display = isNowVisible ? '' : 'none';
          }
          // Toggle all TD in that column
          const trs = tbl.querySelectorAll('tbody tr');
          trs.forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds[targetIdx]) {
              tds[targetIdx].style.display = isNowVisible ? '' : 'none';
            }
          });
        }
      }

      return updated;
    });
  };

  // Show all columns
  const showAllColumns = () => {
    setActiveColumns(prev => {
      const updated = prev.map(c => ({ ...c, visible: true }));
      const tbl = getNearestTable();
      if (tbl) {
        tbl.querySelectorAll('thead th, tbody td').forEach(el => {
          el.style.display = '';
        });
      }
      return updated;
    });
    showToast('All columns visible');
  };

  // Handle Density toggle
  const applyDensity = (mode) => {
    setDensity(mode);
    const tbl = getNearestTable();
    if (tbl) {
      const tds = tbl.querySelectorAll('tbody td');
      const ths = tbl.querySelectorAll('thead th');
      
      const paddingMap = {
        compact: '0.35rem 0.75rem',
        normal: '0.75rem 1rem',
        relaxed: '1.25rem 1rem'
      };

      tds.forEach(td => {
        td.style.padding = paddingMap[mode] || paddingMap.normal;
      });
      ths.forEach(th => {
        th.style.padding = paddingMap[mode] || paddingMap.normal;
      });
    }
    showToast(`Table density: ${mode}`);
  };

  // Copy Action
  const handleCopy = async () => {
    const tableData = getTableData();
    if (!tableData || tableData.length === 0) {
      showToast('No table records found to copy');
      return;
    }
    const success = await copyToClipboard(tableData, headers);
    if (success) {
      setCopied(true);
      showToast('✓ Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // CSV Action
  const handleCSV = () => {
    const tableData = getTableData();
    exportToCSV(tableData, filename);
    showToast('✓ Exporting CSV...');
  };

  // Excel Action
  const handleExcel = () => {
    const tableData = getTableData();
    exportToExcel(tableData, filename);
    showToast('✓ Exporting Excel...');
  };

  // PDF Action
  const handlePDF = () => {
    const tableData = getTableData();
    exportToPDF(tableData, headers || filename, title, filename);
    showToast('✓ Generating PDF...');
  };

  // Print Action
  const handlePrint = () => {
    const tableData = getTableData();
    printData(title, tableData, headers);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* 6 Toolbar Buttons in Rounded Group */}
      <div 
        ref={toolbarRef}
        className="flex items-center border border-zinc-200 dark:border-zinc-200 rounded-lg bg-white dark:bg-zinc-50 shadow-xs overflow-hidden"
      >
        {/* 1. Copy */}
        <button
          onClick={handleCopy}
          title="Copy Data to Clipboard"
          className="p-2 text-zinc-700 dark:text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 transition-colors border-r border-zinc-200 cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>

        {/* 2. Excel */}
        <button
          onClick={handleExcel}
          title="Export to Excel (.xlsx)"
          className="p-2 text-zinc-700 dark:text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 transition-colors border-r border-zinc-200 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" />
        </button>

        {/* 3. PDF */}
        <button
          onClick={handlePDF}
          title="Export to PDF"
          className="p-2 text-zinc-700 dark:text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 transition-colors border-r border-zinc-200 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
        </button>

        {/* 4. CSV */}
        <button
          onClick={handleCSV}
          title="Export to CSV"
          className="p-2 text-zinc-700 dark:text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 transition-colors border-r border-zinc-200 cursor-pointer"
        >
          <Download className="h-4 w-4" />
        </button>

        {/* 5. Print */}
        <button
          onClick={handlePrint}
          title="Print Official Table"
          className="p-2 text-zinc-700 dark:text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 transition-colors border-r border-zinc-200 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
        </button>

        {/* 6. 3-Dots (Column Visibility & Table Actions) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Columns & Table Options"
          className={`relative p-2 text-zinc-700 dark:text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 transition-colors cursor-pointer ${
            isOpen ? 'bg-zinc-100 text-[#084A86]' : ''
          }`}
        >
          <div className="relative flex items-center justify-center">
            {/* Green active dot indicator as seen in user screenshot */}
            <span className="absolute -left-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <MoreVertical className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* 3-Dot Interactive Popover Dropdown */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-300 rounded-2xl shadow-2xl overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-100/80 border-b border-zinc-200 dark:border-zinc-200">
            <div className="flex items-center gap-2">
              <Columns className="h-4 w-4 text-[#084A86]" />
              <span className="text-xs font-bold text-zinc-900">Table Settings</span>
            </div>
            <button 
              onClick={showAllColumns}
              className="text-[10px] font-semibold text-[#084A86] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div className="p-3 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
            {/* Column Visibility Section */}
            <div>
              <div className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider mb-2 flex items-center justify-between">
                <span>Column Visibility</span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {activeColumns.filter(c => c.visible).length}/{activeColumns.length} visible
                </span>
              </div>
              
              <div className="space-y-1">
                {activeColumns.length > 0 ? (
                  activeColumns.map((col, idx) => (
                    <label 
                      key={col.id || col.key || idx}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-100 text-xs text-zinc-800 font-medium cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={col.visible}
                          onChange={() => toggleColumnVisibility(col.id, col.index !== undefined ? col.index : idx)}
                          className="h-3.5 w-3.5 rounded border-zinc-300 text-[#084A86] focus:ring-[#084A86] cursor-pointer"
                        />
                        <span className="truncate max-w-[170px]">{col.label}</span>
                      </div>
                      {col.visible ? (
                        <Eye className="h-3 w-3 text-emerald-600 shrink-0" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-zinc-400 shrink-0" />
                      )}
                    </label>
                  ))
                ) : (
                  <div className="text-xs text-zinc-400 py-1 italic">No column metadata</div>
                )}
              </div>
            </div>

            {/* Row Density Section */}
            {showDensity && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-200">
                <div className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider mb-2">
                  Row Density
                </div>
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-100 p-1 rounded-lg">
                  {[
                    { key: 'compact', label: 'Compact' },
                    { key: 'normal', label: 'Normal' },
                    { key: 'relaxed', label: 'Spacious' }
                  ].map(d => (
                    <button
                      key={d.key}
                      onClick={() => applyDensity(d.key)}
                      className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        density === d.key
                          ? 'bg-white text-[#084A86] shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Export Actions */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-200">
              <div className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider mb-2">
                Quick Actions
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { handleCopy(); setIsOpen(false); }}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => { handlePrint(); setIsOpen(false); }}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => { handleExcel(); setIsOpen(false); }}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => { handlePDF(); setIsOpen(false); }}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-rose-600" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-zinc-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
