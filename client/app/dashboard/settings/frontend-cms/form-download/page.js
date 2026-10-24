'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { fetchCmsSection, mutateCmsSection, fileToCmsAsset } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  Search,
  Trash2,
  Plus,
  FileDown,
  Edit3,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

const DEFAULT_FORMS = [
  {
    id: 'form-admission',
    title: 'Student Admission Application Form 2026',
    description: 'Official enrollment application form for all grades',
    fileName: 'admission_form_2026.pdf',
    size: '1.4 MB'
  },
  {
    id: 'form-scholarship',
    title: 'Scholarship & Financial Aid Request Form',
    description: 'Need-based and merit scholarship application document',
    fileName: 'scholarship_request.pdf',
    size: '850 KB'
  },
  {
    id: 'form-migration',
    title: 'School Leaving / Migration Certificate Request',
    description: 'Transfer certificate and clearance form for outgoing students',
    fileName: 'migration_clearance.pdf',
    size: '620 KB'
  }
];

export default function FormDownloadPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileAsset, setFileAsset] = useState(null);
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCmsSection('formDownload', DEFAULT_FORMS);
      if (!data || data.length === 0) {
        const seeded = await mutateCmsSection('formDownload', 'replaceAll', { items: DEFAULT_FORMS });
        setForms(seeded.data || DEFAULT_FORMS);
      } else {
        setForms(data);
      }
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
    setDescription('');
    setFileAsset(null);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Please enter Form Title');
    setSaving(true);
    const payload = {
      id: editingId || `form-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Official institution document',
      fileName: fileAsset?.fileName || 'official_form.pdf',
      size: fileAsset?.fileSize || '500 KB',
      fileUrl: fileAsset?.fileUrl || ''
    };
    const res = await mutateCmsSection('formDownload', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    setSaving(false);
    if (res.success) {
      setForms(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'Form updated!' : 'Form published for download!');
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setFileAsset(
      item.fileName ? { fileName: item.fileName, fileSize: item.size || '', fileUrl: item.fileUrl || '' } : null
    );
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('formDownload', 'deleteItem', { id });
    if (res.success) {
      setForms(Array.isArray(res.data) ? res.data : []);
      showToast('Form removed.');
    }
  };

  const handleDownload = (item) => {
    if (item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName || `${item.title}.pdf`;
      a.click();
    } else {
      const content = `OFFICIAL INSTITUTION FORM\n\nTitle: ${item.title}\nDescription: ${item.description}\nFile: ${item.fileName}\nGenerated: ${new Date().toLocaleDateString()}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (item.fileName || 'form').replace(/\.[^.]+$/, '') + '.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const filtered = forms.filter(
    (f) =>
      (f.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.description || '').toLowerCase().includes(search.toLowerCase())
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
            <span className="text-zinc-950 font-bold">Form Download</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">Downloadable Forms & Prospectuses</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Manage official admission, scholarship, and clearance forms downloadable from the Home Page.
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
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              {editingId ? 'Edit Form' : 'Add Downloadable Form'}
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
              placeholder="e.g. Admission Form 2026"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">DESCRIPTION</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of who needs this form..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">DOCUMENT FILE *</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-800 border border-zinc-300 rounded-xl px-3.5 py-2.5 bg-zinc-50 flex-1 truncate">
                {fileAsset ? `${fileAsset.fileName} (${fileAsset.fileSize})` : 'Choose file (PDF / DOC / Image)'}
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full bg-[#009966] hover:bg-[#008055] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {editingId ? 'UPDATE FORM' : 'ADD FORM'}
          </button>
        </div>

        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Downloadable Forms List ({filtered.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search forms..."
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
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase">Title & Description</th>
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase">File / Size</th>
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase">Download</th>
                  <th className="text-right py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                      Loading downloadable forms...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                      No forms available.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-3.5 text-zinc-950 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3.5">
                        <span className="text-zinc-950 font-bold block">{item.title}</span>
                        <span className="text-zinc-600 text-xs">{item.description}</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="text-xs text-zinc-900 font-semibold font-mono block">{item.fileName}</span>
                        <span className="text-[11px] text-zinc-500">({item.size})</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <button
                          onClick={() => handleDownload(item)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5" /> Download
                        </button>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
    </div>
  );
}
