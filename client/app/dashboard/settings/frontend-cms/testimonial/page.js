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
  Star,
  Upload,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function TestimonialPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [institution, setInstitution] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
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
      const data = await fetchCmsSection('testimonial', []);
      const clean = (Array.isArray(data) ? data : []).filter(
        (t) => !/euhen/i.test(t.name || '')
      );
      setTestimonials(clean);
      setLoading(false);
    })();
  }, []);

  const handleImageChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await compressCmsImage(f, 300, 0.82);
    setImage(dataUrl);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDesignation('');
    setInstitution('');
    setDescription('');
    setRating(5);
    setImage('');
  };

  const handleSave = async () => {
    if (!name.trim() || !designation.trim()) {
      return alert('Please enter Name and Role/Designation');
    }
    setSaving(true);
    const payload = {
      id: editingId || `testi-${Date.now()}`,
      name: name.trim(),
      designation: designation.trim(),
      institution: institution.trim() || 'Parent / Community',
      description: description.trim(),
      rating: Number(rating) || 5,
      image:
        image ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    };
    const res = await mutateCmsSection('testimonial', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    setSaving(false);
    if (res.success) {
      setTestimonials(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'Testimonial updated!' : 'Testimonial published!');
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setDesignation(item.designation || '');
    setInstitution(item.institution || '');
    setDescription(item.description || '');
    setRating(item.rating || 5);
    setImage(item.image || '');
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('testimonial', 'deleteItem', { id });
    if (res.success) {
      setTestimonials(Array.isArray(res.data) ? res.data : []);
      showToast('Testimonial deleted.');
    }
  };

  const filtered = testimonials.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.institution || '').toLowerCase().includes(search.toLowerCase())
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
            <span className="text-zinc-950 font-bold">Testimonial</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">Parent & Alumni Testimonials</h1>
        </div>
        <div className="flex items-center gap-2">
          {toast && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
            </span>
          )}
          <Link
            href="/#testimonials"
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
              {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline">
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">NAME *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mrs. Amina Tariq"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">DESIGNATION *</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Parent of Grade 8"
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">INSTITUTION</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Islamabad"
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">PHOTO</label>
            <div className="flex items-center gap-2">
              {image && <img src={image} alt="Preview" className="w-10 h-10 rounded-full object-cover border shrink-0" />}
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

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">TESTIMONIAL QUOTE *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write feedback..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">RATING *</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <Star className={`w-5 h-5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full bg-[#009966] hover:bg-[#008055] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {editingId ? 'UPDATE TESTIMONIAL' : 'SUBMIT TESTIMONIAL'}
          </button>
        </div>

        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Testimonial List ({filtered.length})
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
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Person</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Feedback</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Rating</th>
                  <th className="text-right py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500 text-sm">
                      Loading testimonials...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500 text-sm">
                      No custom testimonials added yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.image ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                            }
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                          />
                          <div>
                            <div className="text-zinc-950 font-bold">{item.name}</div>
                            <div className="text-xs text-zinc-500">
                              {item.designation} {item.institution ? `• ${item.institution}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-800 max-w-sm">{item.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (item.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
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
