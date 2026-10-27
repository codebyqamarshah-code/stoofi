'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Layers,
  BookOpen,
  FolderGit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEFAULT_CLASSES = ['BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT'];
const CATEGORIES = [
  'General', 
  'Lecture Notes', 
  'Lab Manual', 
  'Reading Materials', 
  'Reference Documents', 
  'Forms & Templates', 
  'Practical Guides', 
  'Notices', 
  'Course Outline',
  'Other'
];

export default function ContentFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  defaultType = 'Assignment', 
  editItem = null,
  lockType = false
}) {
  const fileInputRef = useRef(null);

  // Form states
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState(defaultType);
  const [availAdmin, setAvailAdmin] = useState(false);
  const [availStudent, setAvailStudent] = useState(true);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [subject, setSubject] = useState('');
  const [academicSession, setAcademicSession] = useState('2026-2027');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('General');
  const [version, setVersion] = useState('1.0');
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(50);
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  
  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('pdf');

  // Dropdown lists
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState(['All', 'A', 'B', 'C', 'D']);
  const [subjectsList, setSubjectsList] = useState([]);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch classes and subjects on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [clsRes, subRes] = await Promise.all([
          api.get('/class'),
          api.get('/subject')
        ]);
        if (clsRes && clsRes.data) {
          setClassesList(clsRes.data);
        }
        if (subRes && subRes.data) {
          setSubjectsList(subRes.data);
        }
      } catch (e) {
        console.error('Failed to load classes or subjects:', e);
      }
    };
    fetchMetadata();
  }, []);

  // Sync sections when selected class changes
  useEffect(() => {
    if (selectedClass === 'All') {
      setSectionsList(['All', 'A', 'B', 'C', 'D']);
      return;
    }
    const found = classesList.find(c => c.name === selectedClass);
    if (found && Array.isArray(found.sections) && found.sections.length > 0) {
      setSectionsList(['All', ...found.sections]);
    } else {
      setSectionsList(['All', 'A', 'B', 'C', 'D']);
    }
  }, [selectedClass, classesList]);

  // Populate edit fields if editing
  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || '');
      setContentType(editItem.contentType || defaultType);
      setAvailAdmin(Boolean(editItem.availAdmin));
      setAvailStudent(editItem.availStudent !== undefined ? Boolean(editItem.availStudent) : true);
      setSelectedClass(editItem.className || 'All');
      setSelectedSection(editItem.section || 'All');
      setSubject(editItem.subject || '');
      setAcademicSession(editItem.academicSession || '2026-2027');
      setPublishDate(editItem.publishDate ? new Date(editItem.publishDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
      setDueDate(editItem.dueDate ? new Date(editItem.dueDate).toISOString().slice(0, 10) : '');
      setCategory(editItem.category || 'General');
      setVersion(editItem.version || '1.0');
      setTotalMarks(editItem.totalMarks || 100);
      setPassingMarks(editItem.passingMarks || 50);
      setDescription(editItem.description || '');
      setSourceUrl(editItem.sourceUrl || '');
      setFileUrl(editItem.fileUrl || '');
      setFileName(editItem.fileName || '');
      setFileSize(editItem.fileSize || '');
      setFileType(editItem.fileType || 'pdf');
    } else {
      // Reset
      setTitle('');
      setContentType(defaultType);
      setAvailAdmin(false);
      setAvailStudent(true);
      setSelectedClass('All');
      setSelectedSection('All');
      setSubject('');
      setAcademicSession('2026-2027');
      setPublishDate(new Date().toISOString().slice(0, 10));
      setDueDate('');
      setCategory(defaultType === 'Other Download' ? 'Reference Documents' : 'General');
      setVersion('1.0');
      setTotalMarks(100);
      setPassingMarks(50);
      setDescription('');
      setSourceUrl('');
      setSelectedFile(null);
      setFileUrl('');
      setFileName('');
      setFileSize('');
      setFileType('pdf');
    }
  }, [editItem, defaultType, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      const ext = file.name.split('.').pop().toLowerCase();
      setFileType(ext);

      // Read file to data URI
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (status = 'Published') => {
    if (!title.trim()) {
      showToast('Please enter Content Title.', true);
      return;
    }
    if (!contentType) {
      showToast('Please select Content Type.', true);
      return;
    }

    try {
      setSaving(true);

      const availableList = [];
      if (availAdmin) availableList.push('All Admin');
      if (availStudent) availableList.push('Student');
      const availableStr = availableList.length > 0 ? availableList.join(', ') : 'Student';

      const payload = {
        title: title.trim(),
        contentType,
        description: description.trim(),
        availableFor: availableStr,
        availAdmin,
        availStudent,
        className: selectedClass,
        section: selectedSection,
        subject: subject.trim() || 'General',
        academicSession,
        publishDate: new Date(publishDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        status,
        category,
        version,
        totalMarks: Number(totalMarks) || 100,
        passingMarks: Number(passingMarks) || 50,
        sourceUrl: sourceUrl.trim(),
        fileUrl,
        fileName,
        fileType,
        fileSize
      };

      let res;
      if (editItem && editItem._id) {
        res = await api.put(`/study-material/${editItem._id}`, payload);
      } else {
        res = await api.post('/study-material', payload);
      }

      if (res && res.success) {
        showToast(editItem ? 'Study material updated successfully!' : 'Study material created successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data);
          onClose();
        }, 600);
      } else {
        showToast(res?.message || 'Operation failed', true);
      }
    } catch (err) {
      showToast(err.message || 'Error saving study material', true);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Toast */}
        {toast && (
          <div className={`p-3 text-xs font-bold text-center ${
            toast.isError ? 'bg-rose-50 text-rose-800 border-b border-rose-200' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-50 to-emerald-50/40 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#009966]/10 text-[#009966]">
              <Upload className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-zinc-950">
              {editItem ? `Edit ${contentType}` : `Upload New ${contentType}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Content Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Anatomy & Physiology Laboratory Manual 2026"
              className="bg-white border-zinc-300 font-medium"
              required
            />
          </div>

          {/* Content Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Content Type <span className="text-rose-500">*</span>
              </Label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                disabled={lockType}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium disabled:bg-zinc-100"
              >
                <option value="Assignment">Assignment</option>
                <option value="Syllabus">Syllabus</option>
                <option value="Other Download">Other Download</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Resource Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Program & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Academic Program / Class</Label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium"
              >
                <option value="All">All Programs</option>
                {classesList.length > 0 ? (
                  classesList.map(c => (
                    <option key={c._id || c.name} value={c.name}>{c.name}</option>
                  ))
                ) : (
                  DEFAULT_CLASSES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section</Label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium"
              >
                {sectionsList.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Sections' : `Section ${s}`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject Area</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Clinical Anatomy"
                className="bg-white border-zinc-300 font-medium"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Academic Session</Label>
              <Input
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                placeholder="2026-2027"
                className="bg-white border-zinc-300 font-medium"
              />
            </div>
          </div>

          {/* Publication Date & Due Date (if Assignment) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Publication Date</Label>
              <Input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="bg-white border-zinc-300 font-medium"
              />
            </div>

            {contentType === 'Assignment' ? (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Submission Due Date
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white border-zinc-300 font-medium"
                />
              </div>
            ) : contentType === 'Syllabus' ? (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Curriculum Version</Label>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 2.1"
                  className="bg-white border-zinc-300 font-medium"
                />
              </div>
            ) : null}
          </div>

          {/* Assignment Marks (if Assignment) */}
          {contentType === 'Assignment' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Total Marks</Label>
                <Input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="bg-white border-zinc-300 font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Passing Marks</Label>
                <Input
                  type="number"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                  className="bg-white border-zinc-300 font-medium"
                />
              </div>
            </div>
          )}

          {/* Available For Checkboxes */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Available For</Label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availAdmin}
                  onChange={(e) => setAvailAdmin(e.target.checked)}
                  className="rounded border-zinc-300 text-[#009966] focus:ring-[#009966] h-4 w-4"
                />
                <span className="text-xs text-zinc-800 font-medium">All Admin</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availStudent}
                  onChange={(e) => setAvailStudent(e.target.checked)}
                  className="rounded border-zinc-300 text-[#009966] focus:ring-[#009966] h-4 w-4"
                />
                <span className="text-xs text-zinc-800 font-medium">Enrolled Students</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Description & Student Instructions</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific objectives, textbook chapters, or clinical precautions..."
              className="flex min-h-[75px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
          </div>

          {/* External Source URL */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              External Resource / Cloud Drive Link <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </Label>
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://drive.google.com/... or https://youtube.com/..."
              className="bg-white border-zinc-300 font-medium"
            />
          </div>

          {/* File Attachment */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Attach Document / File</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.mp3,.txt"
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-950 font-medium cursor-pointer truncate hover:border-zinc-400 transition-colors"
              >
                {fileName ? (
                  <span className="font-bold text-[#009966] flex items-center gap-1.5 truncate">
                    <FileText className="w-4 h-4 shrink-0" />
                    {fileName} {fileSize ? `(${fileSize})` : ''}
                  </span>
                ) : (
                  <span className="text-zinc-400">Click to browse or drop file here</span>
                )}
              </div>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#009966] hover:bg-[#007a52] text-white font-bold shrink-0 text-xs shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-1" /> Browse
              </Button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Allowed: PDF, DOC, DOCX, JPG, PNG, MP4, MP3, TXT. Stored securely and synchronized across all devices.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-semibold border-zinc-300 text-zinc-700 bg-white"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleFormSubmit('Draft')}
              className="text-xs font-bold border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-100"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => handleFormSubmit('Published')}
              className="bg-[#009966] hover:bg-[#007a52] text-white font-bold text-xs shadow-xs"
            >
              {saving ? 'Saving...' : editItem ? 'Update & Save' : 'Upload & Publish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
