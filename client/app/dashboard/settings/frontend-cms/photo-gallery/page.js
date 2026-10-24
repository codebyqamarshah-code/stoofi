'use client';

import Link from 'next/link';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  ChevronDown,
  Trash2,
  Plus,
  Image as ImageIcon,
  Edit3,
  Eye,
  CheckCircle2,
  ExternalLink,
  X,
  Globe
} from 'lucide-react';
import { fetchCmsSection, mutateCmsSection, compressCmsImage } from '@/lib/frontendCmsApi';

const GALLERY_CATEGORIES = [
  'Campus Life',
  'Academic Events',
  'Science & IT Labs',
  'Sports Gala',
  'Convocation & Prize Distribution',
  'Classrooms & Library'
];

export default function PhotoGalleryPage() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Campus Life');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverFileName, setCoverFileName] = useState('');
  const [photos, setPhotos] = useState([]);
  const [showOnHome, setShowOnHome] = useState(true);

  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [viewingAlbum, setViewingAlbum] = useState(null);
  const fileRef = useRef();
  const multiFileRef = useRef();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    let mounted = true;
    fetchCmsSection('photoGallery', []).then((data) => {
      if (mounted) {
        setGalleries(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleCoverUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFileName(f.name);
    const compressed = await compressCmsImage(f, 960, 0.82);
    setCoverImage(compressed);
  };

  const handleMultiPhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 8);
    if (!files.length) return;
    const compressedList = [];
    for (const f of files) {
      const dataUri = await compressCmsImage(f, 800, 0.8);
      if (dataUri) compressedList.push(dataUri);
    }
    setPhotos(prev => [...prev, ...compressedList]);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Campus Life');
    setDescription('');
    setCoverImage('');
    setCoverFileName('');
    setPhotos([]);
    setShowOnHome(true);
    if (fileRef.current) fileRef.current.value = '';
    if (multiFileRef.current) multiFileRef.current.value = '';
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter Photo Gallery / Album Name');
      return;
    }
    if (!coverImage && photos.length === 0) {
      alert('Please upload a Feature Image or Gallery Photos');
      return;
    }
    setSaving(true);
    const mainCover = coverImage || photos[0] || '';
    const itemPayload = {
      name: name.trim(),
      category: category || 'Campus Life',
      description: description.trim() || `${name.trim()} — Pak Royal College`,
      image: mainCover,
      photos: photos.length > 0 ? photos : (mainCover ? [mainCover] : []),
      showOnHome
    };

    if (editingId) {
      const res = await mutateCmsSection('photoGallery', 'update', { id: editingId, item: itemPayload });
      if (res?.success) {
        setGalleries(res.data);
        showToast('Photo Gallery updated & synced with Home Page!');
        resetForm();
      }
    } else {
      const res = await mutateCmsSection('photoGallery', 'add', { item: itemPayload });
      if (res?.success) {
        setGalleries(res.data);
        showToast('New Photo Gallery added & published to Home Page!');
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setCategory(item.category || 'Campus Life');
    setDescription(item.description || '');
    setCoverImage(item.image || '');
    setCoverFileName(item.image ? 'Uploaded Feature Image' : '');
    setPhotos(Array.isArray(item.photos) ? item.photos : (item.image ? [item.image] : []));
    setShowOnHome(item.showOnHome !== false);
    setOpenDropdownId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('photoGallery', 'delete', { id });
    if (res?.success) {
      setGalleries(res.data);
      showToast('Photo Gallery deleted.');
    }
    setOpenDropdownId(null);
  };

  const filtered = galleries.filter(g =>
    (g.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Photo Gallery</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Campus Photo Gallery CMS</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Upload real campus albums and event photos here — published albums appear live on the Home Page.
          </p>
        </div>

        <Link
          href="/#photo-gallery"
          target="_blank"
          className="inline-flex items-center gap-2 bg-[#087f77] hover:bg-[#06665f] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm"
        >
          <Globe className="w-4 h-4" /> View Gallery on Home Page <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add / Edit Gallery Form */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              {editingId ? 'Edit Photo Album' : 'Add Photo Album'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">ALBUM / GALLERY NAME *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Annual Sports Gala 2026"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">CATEGORY</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77]"
            >
              {GALLERY_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">DESCRIPTION</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe this campus event or photo collection..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77] resize-none"
            />
          </div>

          {/* Feature Image Upload */}
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">FEATURE COVER IMAGE *</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-800 border border-zinc-300 rounded-xl px-3.5 py-2.5 bg-zinc-50 flex-1 truncate">
                {coverFileName || 'Choose cover photo *'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="bg-[#0c2436] hover:bg-[#163852] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shrink-0"
              >
                BROWSE
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCoverUpload}
              />
            </div>
            {coverImage && (
              <div className="mt-2 relative rounded-xl overflow-hidden border border-zinc-200 h-28 bg-zinc-100">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverImage(''); setCoverFileName(''); }}
                  className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Multi photo button */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase">Additional Album Photos ({photos.length})</span>
              <button
                type="button"
                onClick={() => multiFileRef.current.click()}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Photos
              </button>
              <input
                ref={multiFileRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*"
                onChange={handleMultiPhotoUpload}
              />
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {photos.map((ph, i) => (
                  <div key={i} className="relative h-14 rounded-lg overflow-hidden border border-zinc-200">
                    <img src={ph} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-zinc-800 uppercase">Show on Home Page</span>
            <button
              type="button"
              onClick={() => setShowOnHome(!showOnHome)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${showOnHome ? 'bg-[#087f77]' : 'bg-zinc-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showOnHome ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl shadow-xs text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {saving ? 'SAVING...' : editingId ? 'UPDATE GALLERY' : 'ADD PHOTO GALLERY'}
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Photo Gallery List ({filtered.length})</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH ALBUMS..."
                  className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-32"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">SL</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Image</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Album Name & Category</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Description</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Photos</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-600 text-sm font-medium">
                      Loading Photo Gallery...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-600 text-sm">
                      No photo albums added yet. Create your first campus photo gallery using the form on the left.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-zinc-100 hover:bg-zinc-50/80">
                      <td className="py-3 px-3 text-zinc-900 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div
                          onClick={() => setViewingAlbum(item)}
                          className="w-16 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 cursor-pointer flex items-center justify-center"
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-zinc-950 font-bold block">{item.name}</span>
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.category || 'Campus Life'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-700 font-medium max-w-xs truncate">{item.description || '—'}</td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-bold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
                          {Array.isArray(item.photos) ? item.photos.length : 1} Photo(s)
                        </span>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            className="border border-zinc-300 bg-white text-zinc-900 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-zinc-100 cursor-pointer"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 py-1">
                              <button
                                onClick={() => { setViewingAlbum(item); setOpenDropdownId(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-zinc-900 font-semibold hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Photos
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="w-full text-left px-3 py-1.5 text-xs text-zinc-900 font-semibold hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-zinc-600 font-medium">
            <span>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {viewingAlbum && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {viewingAlbum.category || 'Campus Life'}
                </span>
                <h3 className="text-lg font-bold text-zinc-950 mt-1">{viewingAlbum.name}</h3>
                <p className="text-xs text-zinc-600">{viewingAlbum.description}</p>
              </div>
              <button onClick={() => setViewingAlbum(null)} className="text-zinc-500 hover:text-zinc-950 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(Array.isArray(viewingAlbum.photos) && viewingAlbum.photos.length > 0
                ? viewingAlbum.photos
                : [viewingAlbum.image]
              ).filter(Boolean).map((imgUrl, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-zinc-200 h-44 bg-zinc-100">
                  <img src={imgUrl} alt={`${viewingAlbum.name} ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
