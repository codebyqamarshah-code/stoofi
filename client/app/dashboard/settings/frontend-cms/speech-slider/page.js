'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { fetchCmsSection, mutateCmsSection, compressCmsImage } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  Search,
  Trash2,
  Edit3,
  Plus,
  Upload,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function SpeechSliderPage() {
  const [speeches, setSpeeches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [speech, setSpeech] = useState('');
  const [image, setImage] = useState('');
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCmsSection('speechSlider', []);
      setSpeeches(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const handleImageChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await compressCmsImage(f, 400, 0.82);
    setImage(dataUrl);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDesignation('');
    setSpeech('');
    setImage('');
  };

  const handleSave = async () => {
    if (!name.trim() || !designation.trim() || !speech.trim()) {
      return alert('Please fill Name, Designation, and Speech');
    }
    setSaving(true);
    const payload = {
      id: editingId || `speech-${Date.now()}`,
      name: name.trim(),
      designation: designation.trim(),
      speech: speech.trim(),
      image:
        image ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    };
    const res = await mutateCmsSection('speechSlider', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    setSaving(false);
    if (res.success) {
      setSpeeches(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'Leadership speech updated!' : 'Leadership speech published!');
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setDesignation(item.designation || '');
    setSpeech(item.speech || '');
    setImage(item.image || '');
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('speechSlider', 'deleteItem', { id });
    if (res.success) {
      setSpeeches(Array.isArray(res.data) ? res.data : []);
      showToast('Speech deleted.');
    }
  };

  const filtered = speeches.filter(
    (s) =>
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.speech || '').toLowerCase().includes(search.toLowerCase())
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
            <span className="text-zinc-950 font-bold">Speech Slider</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">Principal & Leadership Messages</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Publish keynote messages from the Principal, Chairman, and Academic Deans to the Home Page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {toast && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
            </span>
          )}
          <Link
            href="/#campus-showcase"
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
              {editingId ? 'Edit Leadership Speech' : 'Add Speech Slider'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline">
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">SPEAKER NAME *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Kamran Siddiqui"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">DESIGNATION *</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Principal & Academic Director"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">SPEECH / MESSAGE *</label>
            <textarea
              rows={4}
              value={speech}
              onChange={(e) => setSpeech(e.target.value)}
              placeholder="Write leadership message..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">SPEAKER PHOTO</label>
            <div className="flex items-center gap-2">
              {image && <img src={image} alt="Preview" className="w-10 h-10 rounded-xl object-cover border shrink-0" />}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex-1 bg-zinc-50 hover:bg-emerald-50/40 border border-dashed border-zinc-300 hover:border-[#009966] text-zinc-800 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#009966]" /> {image ? 'Change Photo' : 'Upload Photo'}
              </button>
              <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full bg-[#009966] hover:bg-[#008055] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {editingId ? 'UPDATE SPEECH' : 'ADD SPEECH'}
          </button>
        </div>

        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Speech Slider List ({filtered.length})
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
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">SL</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Speaker</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Speech / Quote</th>
                  <th className="text-right py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500 text-sm">
                      Loading leadership speeches...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500 text-sm">
                      No speeches published yet. Add a Principal or Chairman message on the left.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-4 text-zinc-950 font-bold w-12">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.image ||
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
                            }
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-200"
                          />
                          <div>
                            <div className="text-zinc-950 font-bold">{item.name}</div>
                            <div className="text-xs text-emerald-700 font-semibold">{item.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-800 max-w-md">{item.speech}</td>
                      <td className="py-3 px-4 text-right">
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
