"use client";
import { useState, useMemo } from "react";
import { Search, Download, FileText, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export function DataTable({ 
  columns = [], 
  data = [], 
  title = "Data Export", 
  onEdit, 
  onDelete,
  isLoading = false 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Global Search Filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    const tableColumns = columns.map(c => c.label);
    const tableData = filteredData.map(row => columns.map(c => row[c.key] || "-"));
    
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] } // zinc-600
    });
    doc.save(`${title}.pdf`);
  };

  // Export to Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(row => {
      let excelRow = {};
      columns.forEach(c => { excelRow[c.label] = row[c.key] || "-"; });
      return excelRow;
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  return (
    <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50 dark:bg-zinc-50/50">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search all columns..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9 w-full bg-white dark:bg-white border-zinc-200 dark:border-zinc-200"
          />
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={exportPDF} className="h-9 gap-1.5" disabled={filteredData.length === 0}>
            <FileText size={14} className="text-rose-500" /> <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel} className="h-9 gap-1.5" disabled={filteredData.length === 0}>
            <Download size={14} className="text-zinc-600" /> <span className="hidden sm:inline">Excel</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-50 border-b border-zinc-200 dark:border-zinc-200">
              <th className="py-3 px-4 text-xs font-semibold text-zinc-900 font-bold dark:text-zinc-600 uppercase w-12">#</th>
              {columns.map((col, idx) => (
                <th key={idx} className="py-3 px-4 text-xs font-semibold text-zinc-900 font-bold dark:text-zinc-600 uppercase whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="py-3 px-4 text-xs font-semibold text-zinc-900 font-bold dark:text-zinc-600 uppercase text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length + 2} className="py-12 text-center text-sm text-zinc-500">Loading data...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={columns.length + 2} className="py-12 text-center text-sm text-zinc-500">No records found.</td></tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row._id || idx} className="border-b border-zinc-100 dark:border-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-100/50 transition-colors group">
                  <td className="py-3 px-4 text-sm font-medium text-zinc-800 dark:text-zinc-900">
                    {((currentPage - 1) * rowsPerPage) + idx + 1}
                  </td>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-3 px-4 text-sm text-zinc-700 dark:text-zinc-700">
                      {col.render ? col.render(row) : (row[col.key] || "-")}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="py-3 px-4 text-right opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-1">
                        {onEdit && (
                          <Button variant="ghost" size="icon" onClick={() => onEdit(row)} className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">
                            <Edit size={14} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="ghost" size="icon" onClick={() => onDelete(row._id)} className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && filteredData.length > 0 && (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-50/50 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-900">{((currentPage - 1) * rowsPerPage) + 1}</span> to <span className="font-semibold text-zinc-900 dark:text-zinc-900">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-900">{filteredData.length}</span> entries
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft size={14} />
            </Button>
            <div className="flex items-center px-2 text-xs font-medium bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-md">
              {currentPage} / {totalPages}
            </div>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
