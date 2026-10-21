'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  Search,
  Download,
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_CONTENTS = [
  {
    id: 'cnt-1',
    title: 'Anatomy & Physiology Practical Manual',
    type: 'Assignment',
    date: '2026-10-18',
    availableFor: 'Student',
    classSection: 'FSC OTT (A)',
    fileName: 'anatomy_lab_manual.pdf',
    size: '2.4 MB'
  },
  {
    id: 'cnt-2',
    title: 'Clinical Psychology Course Outline & Syllabus',
    type: 'Syllabus',
    date: '2026-10-15',
    availableFor: 'All Admin, Student',
    classSection: 'BS Psychology (A)',
    fileName: 'clinical_psychology_syllabus_2026.pdf',
    size: '1.8 MB'
  },
  {
    id: 'cnt-3',
    title: 'Radiology Imaging & Safety Protocols',
    type: 'Other Download',
    date: '2026-10-12',
    availableFor: 'Student',
    classSection: 'BS RIT (A)',
    fileName: 'rit_imaging_protocols.pdf',
    size: '3.1 MB'
  }
];

export default function UploadContentPage() {
  const fileInputRef = useRef(null);
  const [contents, setContents] = useState(DEFAULT_CONTENTS);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('');
  const [availAdmin, setAvailAdmin] = useState(false);
  const [availStudent, setAvailStudent] = useState(true);
  const [selectedClass, setSelectedClass] = useState('FSC OTT');
  const [selectedSection, setSelectedSection] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stoofi_uploaded_contents');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContents(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const saveToStorage = (updated) => {
    setContents(updated);
    try {
      localStorage.setItem('stoofi_uploaded_contents', JSON.stringify(updated));
    } catch (e) {}
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      showToast(`Selected: ${file.name}`);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter Content Title.', true);
      return;
    }
    if (!contentType) {
      showToast('Please select Content Type.', true);
      return;
    }
    if (!selectedFile && !sourceUrl.trim()) {
      showToast('Please browse and select a file or provide a Source URL.', true);
      return;
    }

    const availableList = [];
    if (availAdmin) availableList.push('All Admin');
    if (availStudent) availableList.push('Student');
    const availableStr = availableList.length > 0 ? availableList.join(', ') : 'Student';

    const newContent = {
      id: `cnt-${Date.now()}`,
      title: title.trim(),
      type: contentType,
      date: date || new Date().toISOString().split('T')[0],
      availableFor: availableStr,
      classSection: `${selectedClass} (${selectedSection})`,
      fileName: selectedFile ? selectedFile.name : (sourceUrl ? 'Web Link' : 'Document'),
      size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Link',
      sourceUrl: sourceUrl.trim(),
      description: description.trim()
    };

    const updated = [newContent, ...contents];
    saveToStorage(updated);
    showToast('Study material uploaded successfully!');

    // Reset Form
    setTitle('');
    setContentType('');
    setDescription('');
    setSourceUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this study content?')) {
      const updated = contents.filter(c => c.id !== id);
      saveToStorage(updated);
      showToast('Content removed.');
    }
  };

  const handleDownload = (item) => {
    showToast(`Downloading: ${item.fileName || item.title}...`);
  };

  const filteredContents = contents.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase()) ||
    c.classSection.toLowerCase().includes(search.toLowerCase()) ||
    (c.fileName && c.fileName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
          toast.isError ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {toast.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.mp3,.txt" 
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Upload Content List</h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">Upload syllabus, assignments, and study materials for enrolled students.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span>Study Material</span>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-[#084A86] font-bold">Upload Content</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wide">Upload Content</h2>
            </div>
            
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Content Title <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="e.g. Anatomy Lab Manual Chapter 1" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" 
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Content Type <span className="text-rose-500">*</span>
                </Label>
                <select 
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium"
                >
                  <option value="">Select Content Type *</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Other Download">Other Download</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Available For <span className="text-rose-500">*</span>
                </Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={availAdmin}
                      onChange={(e) => setAvailAdmin(e.target.checked)}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4" 
                    />
                    <span className="text-sm text-zinc-800 font-medium">All Admin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={availStudent}
                      onChange={(e) => setAvailStudent(e.target.checked)}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4" 
                    />
                    <span className="text-sm text-zinc-800 font-medium">Student</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class</Label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium"
                >
                  {['BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section</Label>
                <select 
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium"
                >
                  {['A', 'B', 'C', 'D', 'E'].map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Date</Label>
                <Input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Description</Label>
                <textarea 
                  placeholder="Additional instructions for students..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-y font-medium" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Source URL <span className="text-zinc-400 font-normal normal-case">(Optional)</span></Label>
                <Input 
                  placeholder="https://drive.google.com/..." 
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>

              {/* File Attachment & Browse Button */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Attach Document</Label>
                <div className="flex items-center gap-2">
                  <div 
                    onClick={handleBrowseClick}
                    className="flex-1 bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-950 font-medium cursor-pointer truncate hover:border-zinc-400 transition-colors"
                  >
                    {selectedFile ? (
                      <span className="font-bold text-[#084A86] flex items-center gap-1.5 truncate">
                        <File className="w-4 h-4 shrink-0 text-[#084A86]" />
                        {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    ) : (
                      <span className="text-zinc-400">No file selected</span>
                    )}
                  </div>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Remove selected file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleBrowseClick}
                    className="bg-[#084A86] hover:bg-[#063866] text-white font-bold shrink-0 text-xs shadow-xs cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" /> BROWSE
                  </Button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-medium">(jpg, png, jpeg, pdf, doc, docx, mp4, mp3, txt are allowed for upload)</p>
              </div>

              <div className="pt-3">
                <Button 
                  type="submit"
                  className="w-full bg-[#084A86] hover:bg-[#063866] text-white font-bold py-2.5 rounded-lg transition-all shadow-xs cursor-pointer text-xs uppercase tracking-wider"
                >
                  SAVE & UPLOAD CONTENT
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Data List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wide">
                Upload Content List ({filteredContents.length})
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="QUICK SEARCH" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-[220px] bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 text-xs font-bold uppercase"
                  />
                </div>
                
                <TableExportToolbar />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3 font-bold">SL</th>
                    <th className="px-4 py-3 font-bold">Content Title</th>
                    <th className="px-4 py-3 font-bold">Type</th>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Available For</th>
                    <th className="px-4 py-3 font-bold">Class (Section)</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredContents.length > 0 ? (
                    filteredContents.map((c, i) => (
                      <tr key={c.id || i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5 text-zinc-700 font-semibold">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-zinc-950">{c.title}</div>
                          {c.fileName && (
                            <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 font-mono">
                              <File className="w-3 h-3 text-[#084A86]" />
                              {c.fileName} {c.size ? `(${c.size})` : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            c.type === 'Assignment' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            c.type === 'Syllabus' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                            'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-700 font-mono text-xs">{formatDateDMY(c.date)}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{c.availableFor}</td>
                        <td className="px-4 py-3.5 text-zinc-900 font-semibold">{c.classSection}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownload(c)}
                              className="p-1.5 text-[#084A86] hover:bg-sky-50 rounded cursor-pointer"
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete content"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-zinc-500 font-medium">
                        No Data Available In Table
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <div>Showing 1 to {filteredContents.length} of {filteredContents.length} entries</div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-700 border-zinc-300 bg-white hover:bg-zinc-100" disabled>
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-700 border-zinc-300 bg-white hover:bg-zinc-100" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
