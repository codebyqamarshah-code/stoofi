'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatDateDMY } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { fetchCmsSection, mutateCmsSection, fileToCmsAsset } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  Search,
  Trash2,
  Plus,
  Edit3,
  Download,
  Eye,
  ExternalLink,
  CheckCircle2,
  FileText,
  X
} from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function FrontExamRoutinePage() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [examTerm, setExamTerm] = useState('Mid-Term Exam');
  const [className, setClassName] = useState('All Classes');
  const [publishDate, setPublishDate] = useState(todayISO());
  const [fileAsset, setFileAsset] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCmsSection('examRoutine', []);
      setRoutines(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const asset = await fileToCmsAsset(f);
    setFileAsset(asset);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setExamTerm('Mid-Term Exam');
    setClassName('All Classes');
    setPublishDate(todayISO());
    setFileAsset(null);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Please enter Exam Routine Title');
    setSaving(true);
    const payload = {
      id: editingId || `eroutine-${Date.now()}`,
      title: title.trim(),
      examTerm,
      className,
      date: publishDate || todayISO(),
      fileName: fileAsset?.fileName || 'exam_datesheet.pdf',
      fileSize: fileAsset?.fileSize || '290 KB',
      fileUrl: fileAsset?.fileUrl || ''
    };
    const res = await mutateCmsSection('examRoutine', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    setSaving(false);
    if (res.success) {
      setRoutines(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'Exam datesheet updated!' : 'Exam datesheet published!');
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setExamTerm(item.examTerm || 'Mid-Term Exam');
    setClassName(item.className || 'All Classes');
    setPublishDate(item.date || todayISO());
    setFileAsset(item.fileName ? { fileName: item.fileName, fileSize: item.fileSize || '', fileUrl: item.fileUrl || '' } : null);
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('examRoutine', 'deleteItem', { id });
    if (res.success) {
      setRoutines(Array.isArray(res.data) ? res.data : []);
      showToast('Exam routine deleted.');
    }
  };

  const handleDownload = (item) => {
    if (item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName || `${item.title}.pdf`;
      a.click();
    } else {
      setPreviewItem(item);
    }
  };

  const filtered = routines.filter(
    (r) =>
      (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.className || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Front Exam Routine</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">Front Exam Routine & Datesheets</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Publish official examination schedules and seating plans to the public website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {toast && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
            </span>
          )}
          <Link
            href="/#academic-downloads"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View on Home Page
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl p-6 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              {editingId ? 'Edit Exam Routine' : 'Add Exam Routine'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline">
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Final Examination Datesheet 2026"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">EXAM TERM</label>
              <select
                value={examTerm}
                onChange={(e) => setExamTerm(e.target.value)}
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              >
                <option value="First Term">First Term</option>
                <option value="Mid-Term Exam">Mid-Term Exam</option>
                <option value="Final Term">Final Term</option>
                <option value="Practical Exam">Practical Exam</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">CLASS / GRADE</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Grade 9 - 12"
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">PUBLISH DATE *</label>
            <Input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">DATESHEET FILE *</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-800 border border-zinc-300 rounded-xl px-3.5 py-2.5 bg-zinc-50 flex-1 truncate">
                {fileAsset ? `${fileAsset.fileName} (${fileAsset.fileSize})` : 'Select Datesheet PDF/Image...'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer shrink-0"
              >
                BROWSE
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full bg-[#009966] hover:bg-[#008055] disabled:opacity-50 text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {editingId ? 'UPDATE EXAM ROUTINE' : 'ADD EXAM ROUTINE'}
          </button>
        </div>

        <div className="xl:col-span-2 bg-white border border-zinc-200 shadow-xs rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Front Exam Routine List ({filtered.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-32"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase">SL</th>
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase">Title & Term</th>
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase">Class</th>
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase">Date</th>
                  <th className="text-right py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                      Loading exam routines...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                      No exam routines published yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-3.5 text-zinc-950 font-bold">{i + 1}</td>
                      <td className="py-3 px-3.5">
                        <div className="text-zinc-950 font-bold">{r.title}</div>
                        <div className="text-xs text-zinc-500">
                          <span className="text-emerald-700 font-semibold">{r.examTerm || 'Exam'}</span> •{' '}
                          {r.fileName || 'datesheet.pdf'}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-zinc-900 font-semibold">{r.className || 'All Classes'}</td>
                      <td className="py-3 px-3.5 text-zinc-800 font-medium">{formatDateDMY(r.date)}</td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewItem(r)}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(r)}
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-black text-zinc-950">{previewItem.title}</h3>
                <p className="text-xs text-zinc-500">
                  {previewItem.examTerm || 'Exam'} • {previewItem.className || 'All Classes'} • Published{' '}
                  {formatDateDMY(previewItem.date)}
                </p>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {previewItem.fileUrl && previewItem.fileUrl.startsWith('data:image') ? (
              <img src={previewItem.fileUrl} alt={previewItem.title} className="max-h-96 mx-auto rounded-xl border" />
            ) : (
              <div className="p-8 bg-zinc-50 rounded-xl border border-zinc-200 text-center space-y-2">
                <FileText className="w-10 h-10 text-[#009966] mx-auto" />
                <p className="text-sm font-bold text-zinc-950">{previewItem.fileName || 'exam_datesheet.pdf'}</p>
                <p className="text-xs text-zinc-600">Official examination datesheet document.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
