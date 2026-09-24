'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const SAMPLE_TEMPLATE_DATA = [
  {
    'First Name': 'Muhammad',
    'Last Name': 'Ali',
    'Admission No': 'ADM-2026-001',
    'Roll No': '101',
    'Class': 'Class 1',
    'Section': 'A',
    'Gender': 'Male',
    'Date of Birth': '2016-04-15',
    'Father Name': 'Tariq Mehmood',
    'Father Phone': '03001234567',
    'Mother Name': 'Fatima Bibi',
    'Guardian Name': 'Tariq Mehmood',
    'Phone': '03001234567',
    'Current Address': 'House 14, St 5, Sector G-9, Islamabad',
    'Academic Year': '2026 [Jan-Dec]',
    'Religion': 'Islam'
  },
  {
    'First Name': 'Ayesha',
    'Last Name': 'Khan',
    'Admission No': 'ADM-2026-002',
    'Roll No': '102',
    'Class': 'Class 1',
    'Section': 'B',
    'Gender': 'Female',
    'Date of Birth': '2016-07-22',
    'Father Name': 'Nasir Khan',
    'Father Phone': '03219876543',
    'Mother Name': 'Zainab Begum',
    'Guardian Name': 'Nasir Khan',
    'Phone': '03219876543',
    'Current Address': 'Plot 42, Bahria Town Phase 4, Rawalpindi',
    'Academic Year': '2026 [Jan-Dec]',
    'Religion': 'Islam'
  }
];

export default function StudentImportModal({ isOpen, onClose, onSuccess, availableClasses = [] }) {
  const [file, setFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importStats, setImportStats] = useState(null);

  // Default fallback values if missing in row
  const [defaultClass, setDefaultClass] = useState('');
  const [defaultSection, setDefaultSection] = useState('A');
  const [defaultAcademicYear, setDefaultAcademicYear] = useState('2026 [Jan-Dec]');
  const [importProgress, setImportProgress] = useState(0);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Download official pre-configured Excel sample template
  const downloadSampleTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_DATA);
    
    // Auto-fit column widths
    const keys = Object.keys(SAMPLE_TEMPLATE_DATA[0]);
    ws['!cols'] = keys.map(key => ({
      wch: Math.max(key.length + 4, 16)
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student_Import_Template');
    XLSX.writeFile(wb, 'Stoofi_Student_Import_Template.xlsx');
  };

  // Helper: dynamic key resolution for variations in Excel headers
  const getVal = (row, candidates) => {
    const rowKeys = Object.keys(row);
    for (const candidate of candidates) {
      const match = rowKeys.find(k => k.trim().toLowerCase().replace(/[_\s-]/g, '') === candidate.toLowerCase().replace(/[_\s-]/g, ''));
      if (match && row[match] !== undefined && row[match] !== null && String(row[match]).trim() !== '') {
        return String(row[match]).trim();
      }
    }
    return '';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  const processFile = (fileToParse) => {
    setErrorMsg('');
    setImportStats(null);
    setParsing(true);
    setFile(fileToParse);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setErrorMsg('The selected file does not contain any data rows.');
          setParsedStudents([]);
          setParsing(false);
          return;
        }

        // Validate if this is actually student data (must have at least name or admission number)
        const firstRow = data[0];
        const hasValidColumns = Object.keys(firstRow).some(key => 
          /name|student|admission|roll|class|grade|dob|age/i.test(key)
        );

        if (!hasValidColumns) {
          setErrorMsg('Invalid file format. The uploaded file contains random or unrecognized data. Please ensure the file contains valid student records and use the standard template provided.');
          setParsedStudents([]);
          setFile(null);
          setParsing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        // Map columns intelligently
        const currentYear = new Date().getFullYear();
        const randSeed = Math.floor(Math.random() * 800) + 100;

        const mapped = data.map((row, idx) => {
          const firstName = getVal(row, ['firstName', 'first name', 'firstname', 'student name', 'name', 'first']) || '';
          const lastName = getVal(row, ['lastName', 'last name', 'lastname', 'surname', 'last']) || '';
          const admissionNo = getVal(row, ['admissionNo', 'admission no', 'admission number', 'adm no', 'registration no', 'reg no']) ||
            `ADM-${currentYear}-${String(randSeed + idx).padStart(3, '0')}`;
          const rollNo = getVal(row, ['rollNo', 'roll no', 'roll number', 'roll']) || '';
          const className = getVal(row, ['className', 'class', 'grade', 'standard']) || defaultClass || '';
          const section = getVal(row, ['section', 'sec']) || defaultSection || '';
          const gender = getVal(row, ['gender', 'sex']) || '';
          const dob = getVal(row, ['dob', 'date of birth', 'birth date', 'birthday', 'age']) || '';
          const fatherName = getVal(row, ['fatherName', 'father name', 'father', 'guardian name', 'parent']) || '';
          const phone = getVal(row, ['phone', 'mobile', 'cell', 'father phone', 'contact']) || '';
          const address = getVal(row, ['currentAddress', 'address', 'residential address', 'permanent address']) || '';
          const academicYear = getVal(row, ['academicYear', 'academic year', 'session', 'year']) || defaultAcademicYear;
          const religion = getVal(row, ['religion']) || '';

          // Skip completely empty rows
          if (!firstName && !lastName && !getVal(row, ['admissionNo', 'admission no'])) return null;

          return {
            _id: 'stu-' + Date.now() + '-' + idx,
            firstName,
            lastName,
            admissionNo,
            rollNo,
            className,
            section,
            gender,
            dob,
            fatherName,
            phone,
            currentAddress: address,
            permanentAddress: address,
            academicYear,
            religion,
            status: 'Active'
          };
        }).filter(Boolean); // Remove nulls

        if (mapped.length === 0) {
           setErrorMsg('No valid student rows found in the file. Please check your data.');
           setParsedStudents([]);
           setFile(null);
           setParsing(false);
           return;
        }

        if (mapped.length > 50) {
           setErrorMsg(`Maximum limit exceeded. You can only import up to 50 students at a time. The uploaded file contains ${mapped.length} students.`);
           setParsedStudents([]);
           setFile(null);
           setParsing(false);
           if (fileInputRef.current) fileInputRef.current.value = '';
           return;
        }

        setParsedStudents(mapped);
      } catch (err) {
        console.error('File parsing error:', err);
        setErrorMsg('Failed to parse file. Please upload a valid .xlsx, .xls or .csv file containing student data.');
      } finally {
        // Simulate a slight parsing delay for professional UX
        setTimeout(() => setParsing(false), 800);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Error reading file. Please try again.');
      setParsing(false);
    };

    reader.readAsBinaryString(fileToParse);
  };

  const handleConfirmImport = async () => {
    if (!parsedStudents || parsedStudents.length === 0) {
      setErrorMsg('No students found to import.');
      return;
    }

    if (parsedStudents.length > 50) {
      setErrorMsg('Maximum limit exceeded. You can only import up to 50 students at a time.');
      return;
    }

    setImporting(true);
    setImportProgress(0);
    setErrorMsg('');

    try {
      setImportProgress(20);
      const res = await api.post('/student/bulk', { students: parsedStudents });
      setImportProgress(100);

      if (res && res.success !== false) {
        setImportStats({
          totalParsed: parsedStudents.length,
          addedCount: res.count || parsedStudents.length,
          duplicatesSkipped: 0
        });

        if (onSuccess) {
          onSuccess(res.data || parsedStudents);
        }

        setTimeout(() => {
          onClose();
          handleReset();
        }, 2000);
      } else {
        throw new Error(res?.message || 'Bulk import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setErrorMsg('An error occurred during import: ' + err.message);
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedStudents([]);
    setErrorMsg('');
    setImportStats(null);
    setImporting(false);
    setImportProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white text-zinc-900 border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Import Student Records</h2>
              <p className="text-xs text-zinc-500">Upload Excel (.xlsx, .xls) or CSV file with automatic column mapping</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Download Template Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-zinc-200 bg-zinc-50 gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Step 1: Download Standard Sample Template</div>
              <p className="text-xs text-zinc-600">Download our formatted Excel template with pre-filled sample rows and proper columns.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={downloadSampleTemplate}
              className="border-zinc-950 text-zinc-950 hover:bg-zinc-950 hover:text-white shrink-0 flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download Sample Template (.xlsx)
            </Button>
          </div>

          {/* Upload Area */}
          {!file ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 hover:border-zinc-950 hover:bg-zinc-50/50 rounded-2xl p-10 text-center flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className="h-14 w-14 rounded-2xl bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center mb-4 transition-colors">
                <Upload className="h-7 w-7 text-zinc-900" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">Click to upload or drag & drop Excel / CSV</h3>
              <p className="text-xs text-zinc-500">Supports .xlsx, .xls, and .csv files up to 10MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-zinc-950" />
                  <div>
                    <div className="text-xs font-bold text-zinc-900">{file.name}</div>
                    <div className="text-[11px] text-zinc-500">{(file.size / 1024).toFixed(1)} KB &bull; {parsedStudents.length} rows parsed</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleReset} 
                  className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
                >
                  Change File
                </Button>
              </div>

              {/* Parsing Indicator */}
              {parsing && (
                <div className="py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-950" />
                  <span className="text-xs font-medium">Parsing Excel rows...</span>
                </div>
              )}

              {/* Parsed Data Preview Table */}
              {!parsing && parsedStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Preview Parsed Data ({parsedStudents.length} Students Ready to Import)
                    </span>
                    <span className="text-[11px] text-zinc-500">Showing first {Math.min(5, parsedStudents.length)} rows</span>
                  </div>

                  <div className="border border-zinc-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200 uppercase">
                        <tr>
                          <th className="p-2.5">Admission No</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Class (Sec)</th>
                          <th className="p-2.5">Roll No</th>
                          <th className="p-2.5">Gender</th>
                          <th className="p-2.5">Father Name</th>
                          <th className="p-2.5">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {parsedStudents.slice(0, 5).map((stu, i) => (
                          <tr key={i} className="hover:bg-zinc-50">
                            <td className="p-2.5 font-medium text-zinc-950">{stu.admissionNo}</td>
                            <td className="p-2.5 font-semibold text-zinc-900">{stu.firstName} {stu.lastName}</td>
                            <td className="p-2.5">{stu.className} ({stu.section})</td>
                            <td className="p-2.5">{stu.rollNo}</td>
                            <td className="p-2.5">{stu.gender}</td>
                            <td className="p-2.5">{stu.fatherName}</td>
                            <td className="p-2.5">{stu.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Summary */}
          {importStats && (
            <div className="p-4 rounded-xl border border-zinc-300 bg-zinc-50 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-zinc-950 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-zinc-950 uppercase">Import Successful!</h4>
                <p className="text-xs text-zinc-700 mt-0.5">
                  Imported <strong>{importStats.addedCount}</strong> new students. 
                  {importStats.duplicatesSkipped > 0 && ` (${importStats.duplicatesSkipped} duplicates skipped).`}
                </p>
              </div>
            </div>
          )}

          {/* Import Progress Bar */}
          {importing && !importStats && (
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
              <div className="flex justify-between text-xs font-semibold text-zinc-900">
                <span>Processing {parsedStudents.length} records...</span>
                <span>{importProgress}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 transition-all duration-300 ease-out"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs font-medium">{errorMsg}</div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="border-zinc-300 text-zinc-700 hover:bg-zinc-200 cursor-pointer text-xs"
            disabled={importing}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!file || parsedStudents.length === 0 || importing || parsing}
            onClick={handleConfirmImport}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6 text-xs cursor-pointer flex items-center gap-2 transition-all"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing... {importProgress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import {parsedStudents.length > 0 ? `${parsedStudents.length} Students Now` : 'Students'}
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
