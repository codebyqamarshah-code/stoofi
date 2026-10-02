import React from 'react';
import Link from 'next/link';
import { Search, Copy, FileText, Download, Printer, Layout, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export default function StudentDataTable({ 
  title, 
  breadcrumb = [], 
  columns = [], 
  data = [], 
  showClassFilter = false 
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl font-bold text-indigo-900">{title}</h1>
        <div className="text-sm font-medium text-zinc-500 flex items-center gap-2">
          <Link href="/dashboard/student" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              <span className="text-zinc-300">|</span>
              <span className={i === breadcrumb.length - 1 ? "text-indigo-900" : ""}>{crumb}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-md shadow-sm border border-zinc-100 p-4 sm:p-6">
        
        {/* Optional Filter */}
        {showClassFilter && (
          <div className="mb-6 border-b border-zinc-100 pb-4">
            <button className="px-4 py-2 text-xs font-bold text-zinc-600 border border-zinc-200 rounded hover:bg-zinc-50 transition-colors uppercase tracking-wider">
              Class 1 ()
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center w-full sm:w-auto relative">
            <Search className="w-4 h-4 absolute left-3 text-indigo-900" />
            <input 
              type="text" 
              placeholder="SEARCH" 
              className="pl-9 pr-4 py-2 w-full sm:w-64 border-b-2 border-indigo-100 focus:border-indigo-600 bg-transparent text-sm font-semibold text-zinc-700 outline-none transition-colors uppercase placeholder:text-zinc-950 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1">
            {[
              { icon: Copy, title: 'Copy' },
              { icon: FileText, title: 'CSV' },
              { icon: Download, title: 'Excel' },
              { icon: FileText, title: 'PDF' },
              { icon: Printer, title: 'Print' },
              { icon: Layout, title: 'Columns' },
            ].map((btn, i) => (
              <button 
                key={i}
                title={btn.title}
                className="p-2 text-indigo-900/60 hover:text-indigo-900 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded transition-all"
              >
                <btn.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b-2 border-zinc-100">
                {columns.map((col, i) => (
                  <th key={i} className="py-3 px-4 font-semibold text-indigo-900 whitespace-nowrap">
                    <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                      <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                      {col}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-zinc-500 font-medium bg-zinc-50/50">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50">
                    {columns.map((col, j) => (
                      <td key={j} className="py-3 px-4 text-zinc-700">
                        {row[col] || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm text-zinc-500">
          <div>
            Showing 0 to 0 of 0 entries
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-zinc-200 rounded text-zinc-400 cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 border border-zinc-200 rounded text-zinc-400 cursor-not-allowed">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
