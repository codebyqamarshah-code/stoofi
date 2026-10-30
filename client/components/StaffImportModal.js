'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, X, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const SAMPLE_STAFF_TEMPLATE = [
  {
    'Full Name': 'Prof. Zahid Mahmood',
    'Staff ID': 'PRCS0010',
    'Role': 'Teacher',
    'Designation': 'Lecturer',
    'Department': 'Computer Science & IT Department',
    'Gender': 'Male',
    'Mobile': '03001234567',
    'Email': 'zahid.mahmood@example.com',
    'CNIC': '35201-1234567-1',
    'Father Name': 'Mahmood Ahmad',
    'Date of Birth': '15/04/1988',
    'Date of Joining': '15/08/2026',
    'Basic Salary': 45000,
    'Qualifications': 'M.Phil Computer Science',
    'Experience': '5 Years',
    'Current Address': 'Main Jaranwala Road, Sharaqpur Sharif'
  },
  {
    'Full Name': 'Ms. Nadia Farooq',
    'Staff ID': 'PRCS0011',
    'Role': 'Teacher',
    'Designation': 'Senior Faculty',
    'Department': 'Biological Sciences Department',
    'Gender': 'Female',
    'Mobile': '03219876543',
    'Email': 'nadia.farooq@example.com',
    'CNIC': '35202-7654321-2',
    'Father Name': 'Farooq Azam',
    'Date of Birth': '22/07/1990',
    'Date of Joining': '15/08/2026',
    'Basic Salary': 48000,
    'Qualifications': 'M.Sc Biology',
    'Experience': '4 Years',
    'Current Address': 'Lal Puli Stop, Sharaqpur Sharif'
  },
  {
    'Full Name': 'Mr. Usman Haider',
    'Staff ID': 'PRCS0012',
    'Role': 'Staff',
    'Designation': 'Accountant',
    'Department': 'Finance',
    'Gender': 'Male',
    'Mobile': '03334567890',
    'Email': 'usman.accounts@example.com',
    'CNIC': '35201-9876543-3',
    'Father Name': 'Haider Ali',
    'Date of Birth': '10/11/1992',
    'Date of Joining': '01/09/2026',
    'Basic Salary': 38000,
    'Qualifications': 'B.Com / CA Inter',
    'Experience': '3 Years',
    'Current Address': 'Sheikhupura City'
  }
];

export default function StaffImportModal({ isOpen, onClose, onSuccess, availableDepartments = [], availableDesignations = [] }) {
  const [file, setFile] = useState(null);
  const [parsedStaff, setParsedStaff] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importStats, setImportStats] = useState(null);
  const [importProgress, setImportProgress] = useState(0);

  // Fallback defaults for missing fields
  const [defaultRole, setDefaultRole] = useState('Teacher');
  const [defaultDepartment, setDefaultDepartment] = useState('');
  const [defaultDesignation, setDefaultDesignation] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Download official sample template
  const downloadSampleTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_STAFF_TEMPLATE);
    const keys = Object.keys(SAMPLE_STAFF_TEMPLATE[0]);
    ws['!cols'] = keys.map(k => ({ wch: Math.max(k.length + 4, 18) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff_Import_Template');
    XLSX.writeFile(wb, 'Stoofi_Staff_Import_Template.xlsx');
  };

  const getVal = (row, candidates) => {
    const rowKeys = Object.keys(row);
    for (const cand of candidates) {
      const match = rowKeys.find(k => k.trim().toLowerCase().replace(/[_\s-]/g, '') === cand.toLowerCase().replace(/[_\s-]/g, ''));
      if (match && row[match] !== undefined && row[match] !== null && String(row[match]).trim() !== '') {
        return String(row[match]).trim();
      }
    }
    return '';
  };

  const convertExcelDate = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (!isNaN(num) && num > 1000 && num < 80000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const d = new Date(excelEpoch.getTime() + num * 86400000);
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = d.getUTCFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
    return String(val);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  const processFile = (fileToParse) => {
    const ext = fileToParse.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setErrorMsg('Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setFile(fileToParse);
    setParsing(true);
    setErrorMsg('');
    setImportStats(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: false });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!data || data.length === 0) {
          setErrorMsg('The selected file does not contain any data rows.');
          setParsedStaff([]);
          setParsing(false);
          return;
        }

        // Validate basic column existence
        const firstRow = data[0];
        const hasValidColumns = Object.keys(firstRow).some(key =>
          /name|staff|teacher|emp|designation|department|role|mobile|phone/i.test(key)
        );

        if (!hasValidColumns) {
          setErrorMsg('Invalid file format. Please ensure the file contains staff records using the standard template.');
          setParsedStaff([]);
          setFile(null);
          setParsing(false);
          return;
        }

        const mapped = data.map((row, idx) => {
          let firstName = getVal(row, ['fullName', 'full name', 'name', 'staff name', 'firstName', 'first name', 'teacher name']) || '';
          let lastName = getVal(row, ['lastName', 'last name', 'surname']) || '';

          if (firstName && !lastName && firstName.trim().includes(' ')) {
            const parts = firstName.trim().split(/\s+/);
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
          }

          if (!firstName) return null;

          const staffNo = getVal(row, ['staffNo', 'staff no', 'staff id', 'employee id', 'empid', 'id']) || '';
          const role = getVal(row, ['role', 'user role', 'staff type']) || defaultRole || 'Teacher';
          const designation = getVal(row, ['designation', 'post', 'title', 'position']) || defaultDesignation || (role === 'Teacher' ? 'Lecturer' : 'Staff');
          const department = getVal(row, ['department', 'dept', 'faculty']) || defaultDepartment || 'Academics';
          const gender = getVal(row, ['gender', 'sex']) || 'Male';
          const phone = getVal(row, ['mobile', 'phone', 'contact', 'mobile no', 'cell', 'phone no']) || '';
          const email = getVal(row, ['email', 'email address', 'e-mail']) || '';
          const cnic = getVal(row, ['cnic', 'id card', 'cnic no']) || '';
          const fatherName = getVal(row, ['fatherName', 'father name', 'father']) || '';
          const rawDob = getVal(row, ['dob', 'date of birth', 'birth date']) || '';
          const dob = convertExcelDate(rawDob);
          const rawJd = getVal(row, ['dateOfJoining', 'joining date', 'date of join', 'joining']) || '';
          const dateOfJoining = convertExcelDate(rawJd);
          const basicSalary = parseFloat(getVal(row, ['basicSalary', 'salary', 'pay'])) || 0;
          const qualifications = getVal(row, ['qualifications', 'qualification', 'degree', 'education']) || '';
          const experience = getVal(row, ['experience', 'exp']) || '';
          const currentAddress = getVal(row, ['currentAddress', 'address', 'present address', 'city']) || '';

          return {
            _id: 'temp-staff-' + Date.now() + '-' + idx,
            staffNo,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            role,
            designation,
            department,
            gender,
            phone,
            mobile: phone,
            email,
            cnic,
            fatherName,
            dob,
            dateOfBirth: dob,
            dateOfJoining,
            basicSalary,
            qualifications,
            experience,
            currentAddress,
            status: 'Active'
          };
        }).filter(Boolean);

        if (mapped.length === 0) {
          setErrorMsg('No valid staff records found in the file. Please verify your data.');
          setParsedStaff([]);
          setFile(null);
          setParsing(false);
          return;
        }

        setParsedStaff(mapped);
        setErrorMsg('');
      } catch (err) {
        console.error('Staff file parse error:', err);
        setErrorMsg('Failed to parse file. Please upload a valid .xlsx, .xls or .csv file.');
      } finally {
        setTimeout(() => setParsing(false), 500);
      }
    };

    reader.readAsBinaryString(fileToParse);
  };

  const handleConfirmImport = async () => {
    if (!parsedStaff || parsedStaff.length === 0) {
      setErrorMsg('No staff members to import.');
      return;
    }

    setImporting(true);
    setImportProgress(20);
    setErrorMsg('');

    try {
      setImportProgress(50);
      const payload = parsedStaff.map(({ _id, ...rest }) => rest);

      const res = await api.post('/staff/bulk', { staff: payload });
      setImportProgress(100);

      if (res && res.success !== false) {
        setImportStats({
          totalParsed: parsedStaff.length,
          addedCount: res.count || parsedStaff.length
        });

        if (onSuccess) {
          onSuccess(res.data || parsedStaff);
        }

        setTimeout(() => {
          onClose();
          handleReset();
        }, 1400);
      } else {
        throw new Error(res?.message || 'Bulk import failed');
      }
    } catch (err) {
      console.error('Staff import error:', err);
      const msg = err.response?.data?.message || err.message || 'Bulk import failed';
      setErrorMsg('Error during import: ' + msg);
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedStaff([]);
    setErrorMsg('');
    setImportStats(null);
    setImporting(false);
    setImportProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeRow = (indexToRemove) => {
    setParsedStaff(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950">Bulk Import Staff Members</h2>
              <p className="text-xs text-zinc-500">Upload Excel (.xlsx, .xls) or CSV file with employee and faculty records</p>
            </div>
          </div>
          <button
            onClick={() => { onClose(); handleReset(); }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Download Sample Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-emerald-950">Download Standard Staff Excel Template</h4>
                <p className="text-[11px] text-emerald-800/80 mt-0.5">
                  Use the pre-formatted columns (Name, Role, Designation, Department, Phone, Email, Salary, CNIC) to avoid formatting errors.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={downloadSampleTemplate}
              variant="outline"
              size="sm"
              className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 font-semibold text-xs shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download Template
            </Button>
          </div>

          {/* Upload Area */}
          {!file && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition bg-zinc-50/50 hover:bg-emerald-50/20 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-zinc-100 group-hover:bg-emerald-100 text-zinc-500 group-hover:text-emerald-700 flex items-center justify-center mx-auto mb-3 transition">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-950">
                Click to browse or drag & drop staff file here
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)</p>
            </div>
          )}

          {/* Parsing Spinner */}
          {parsing && (
            <div className="py-8 text-center space-y-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-zinc-600">Reading and validating staff data rows...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Success Banner */}
          {importStats && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Staff Import Completed Successfully!</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Imported {importStats.addedCount} staff member(s) into database.
                </p>
              </div>
            </div>
          )}

          {/* Parsed Staff Preview */}
          {parsedStaff.length > 0 && !importStats && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                    <span>Parsed Records</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {parsedStaff.length} Found
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-500">File: {file?.name}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Choose Different File
                </Button>
              </div>

              {/* Table Preview */}
              <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 sticky top-0 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Staff ID</th>
                      <th className="p-2.5">Full Name</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5">Designation</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-800">
                    {parsedStaff.slice(0, 50).map((st, idx) => (
                      <tr key={st._id || idx} className="hover:bg-zinc-50/70 transition">
                        <td className="p-2.5 text-zinc-400 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-semibold text-zinc-900">{st.staffNo || 'Auto'}</td>
                        <td className="p-2.5 font-semibold text-zinc-950">{st.name}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 text-zinc-700">
                            {st.role}
                          </span>
                        </td>
                        <td className="p-2.5 text-zinc-600">{st.designation || '—'}</td>
                        <td className="p-2.5 text-zinc-600 truncate max-w-[140px]">{st.department || '—'}</td>
                        <td className="p-2.5 font-mono text-zinc-600">{st.phone || '—'}</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="text-zinc-400 hover:text-rose-600 transition"
                            title="Remove row"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedStaff.length > 50 && (
                <p className="text-[11px] text-zinc-400 italic text-center">
                  Showing first 50 records. All {parsedStaff.length} will be imported into database.
                </p>
              )}

              {/* Progress bar during import */}
              {importing && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-600">
                    <span>Importing into MongoDB...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { onClose(); handleReset(); }}
            disabled={importing}
            className="text-xs"
          >
            Cancel
          </Button>

          {parsedStaff.length > 0 && !importStats && (
            <Button
              type="button"
              onClick={handleConfirmImport}
              disabled={importing || parsedStaff.length === 0}
              className="bg-[#009966] hover:bg-[#008055] text-white font-semibold text-xs px-5 shadow-sm flex items-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Confirm & Import {parsedStaff.length} Staff
                </>
              )}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
