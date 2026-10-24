'use client';

import Link from 'next/link';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Search,
  ChevronDown,
  Trash2,
  Plus,
  ExternalLink,
  Image as ImageIcon,
  Edit3,
  Eye,
  CheckCircle2,
  Sparkles,
  Globe,
  X
} from 'lucide-react';
import { fetchCmsSection, mutateCmsSection, compressCmsImage } from '@/lib/frontendCmsApi';

export default function HomeSliderPage() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('PAK ROYAL COLLEGE');
  const [buttonText, setButtonText] = useState('Explore Portal');
  const [link, setLink] = useState('/login');
  const [imagePreview, setImagePreview] = useState('');
  const [fileName, setFileName] = useState('');
  const [active, setActive] = useState(true);

  // Preview Carousel state
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    let mounted = true;
    fetchCmsSection('homeSlider', []).then((data) => {
      if (mounted) {
        setSliders(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const activeSliders = sliders.filter(s => s.active !== false);

  useEffect(() => {
    if (activeSliders.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx(prev => (prev + 1) % activeSliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSliders.length]);

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const compressed = await compressCmsImage(f, 1200, 0.82);
    setImagePreview(compressed);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setBadge('PAK ROYAL COLLEGE');
    setButtonText('Explore Portal');
    setLink('/login');
    setImagePreview('');
    setFileName('');
    setActive(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!title.trim() && !imagePreview) {
      alert('Please enter a Slide Title or upload a Banner Image.');
      return;
    }
    setSaving(true);
    const payloadItem = {
      title: title.trim() || 'Pak Royal College Sharaqpur',
      subtitle: subtitle.trim() || 'Empowering students with modern academic excellence and digital learning.',
      badge: badge.trim() || 'PAK ROYAL COLLEGE',
      buttonText: buttonText.trim() || 'Explore Portal',
      link: link.trim() || '/login',
      image: imagePreview || '',
      active
    };

    if (editingId) {
      const res = await mutateCmsSection('homeSlider', 'update', { id: editingId, item: payloadItem });
      if (res?.success) {
        setSliders(res.data);
        showToast('Home slider updated & published to Home Page!');
        resetForm();
      }
    } else {
      const res = await mutateCmsSection('homeSlider', 'add', { item: payloadItem });
      if (res?.success) {
        setSliders(res.data);
        showToast('New slide added & published live to Home Page!');
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleEdit = (slider) => {
    setEditingId(slider.id);
    setTitle(slider.title || '');
    setSubtitle(slider.subtitle || '');
    setBadge(slider.badge || 'PAK ROYAL COLLEGE');
    setButtonText(slider.buttonText || 'Explore Portal');
    setLink(slider.link || '/login');
    setImagePreview(slider.image || '');
    setFileName(slider.image ? 'Uploaded Banner Image' : '');
    setActive(slider.active !== false);
    setOpenDropdownId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (slider) => {
    const res = await mutateCmsSection('homeSlider', 'update', {
      id: slider.id,
      item: { ...slider, active: slider.active === false ? true : false }
    });
    if (res?.success) {
      setSliders(res.data);
      showToast('Slide visibility updated!');
    }
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('homeSlider', 'delete', { id });
    if (res?.success) {
      setSliders(res.data);
      showToast('Slide removed from Home Page.');
    }
    setOpenDropdownId(null);
  };

  const filtered = sliders.filter(s =>
    (s.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.subtitle || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.link || '').toLowerCase().includes(search.toLowerCase())
  );

  const previewSlide = activeSliders[currentSlideIdx] || activeSliders[0] || null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Home Slider</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Home Hero & Banner Slider CMS</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Slides added here are displayed live in the Hero Banner Slider on the Home Page (<code>/</code>).
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 bg-[#087f77] hover:bg-[#06665f] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Globe className="w-4 h-4" /> View Live Home Page <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Live Interactive Slider Preview Banner */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#087f77]" />
            <h2 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
              Live Home Page Slider Preview ({activeSliders.length} Active Slide{activeSliders.length === 1 ? '' : 's'})
            </h2>
          </div>
          {activeSliders.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentSlideIdx((currentSlideIdx - 1 + activeSliders.length) % activeSliders.length)}
                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-zinc-700 px-2">
                {currentSlideIdx + 1} / {activeSliders.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentSlideIdx((currentSlideIdx + 1) % activeSliders.length)}
                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {previewSlide ? (
          <div className="relative rounded-xl overflow-hidden bg-[#0c2436] text-white min-h-[210px] grid grid-cols-1 md:grid-cols-12 items-center p-6 md:p-8 gap-6">
            <div className="md:col-span-7 space-y-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#64e2bc]/20 text-[#64e2bc] border border-[#64e2bc]/30">
                {previewSlide.badge || 'PAK ROYAL COLLEGE'}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {previewSlide.title || 'Welcome to Pak Royal College'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-200 max-w-xl leading-relaxed">
                {previewSlide.subtitle || 'Manage your entire institution from one unified platform.'}
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 bg-[#64e2bc] text-[#0c322f] font-bold text-xs px-4 py-2 rounded-lg">
                  {previewSlide.buttonText || 'Explore Portal'} →
                </span>
              </div>
            </div>
            <div className="md:col-span-5 flex justify-center">
              {previewSlide.image ? (
                <img
                  src={previewSlide.image}
                  alt={previewSlide.title}
                  className="w-full max-h-44 object-cover rounded-xl border border-white/20 shadow-lg"
                />
              ) : (
                <div className="w-full h-40 rounded-xl border border-white/15 bg-white/5 flex flex-col items-center justify-center text-zinc-300 text-xs">
                  <ImageIcon className="w-8 h-8 mb-1 opacity-60" />
                  <span>Text Hero Slide (No Banner Image)</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
            <p className="text-sm font-bold text-zinc-800">No Custom Home Sliders Added Yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              The Home Page is currently showing the default Hero section. Add a slide below to activate the interactive Home Page Slider!
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add / Edit Slider Form */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              {editingId ? 'Edit Home Slide' : 'Add New Home Slide'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">SLIDE TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Admissions Open 2026-2027"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">SUBTITLE / CAPTION</label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="Short description displayed on the hero banner..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">BADGE TEXT</label>
              <input
                type="text"
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder="ADMISSIONS 2026"
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">BUTTON TEXT</label>
              <input
                type="text"
                value={buttonText}
                onChange={e => setButtonText(e.target.value)}
                placeholder="Apply Now"
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">BUTTON / ACTION LINK</label>
            <input
              type="text"
              value={link}
              placeholder="/login or /#contact or https://..."
              onChange={e => setLink(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77]"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">SLIDE BANNER IMAGE *</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-800 border border-zinc-300 rounded-xl px-3.5 py-2.5 bg-zinc-50 flex-1 truncate">
                {fileName || 'Select banner image (JPG, PNG, WEBP)'}
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
                onChange={handleFileChange}
              />
            </div>
            {imagePreview && (
              <div className="mt-2 relative rounded-xl overflow-hidden border border-zinc-200 h-28 bg-zinc-100">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImagePreview(''); setFileName(''); }}
                  className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-1 hover:bg-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-zinc-800 uppercase">Show on Home Page</span>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${active ? 'bg-[#087f77]' : 'bg-zinc-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${active ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl shadow-xs text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {saving ? 'SAVING...' : editingId ? 'UPDATE SLIDE' : 'ADD SLIDE TO HOME PAGE'}
          </button>
        </div>

        {/* Right: Home Slider List Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Home Slider List ({filtered.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH SLIDES..."
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
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Banner</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Slide Title & Subtitle</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Button / Link</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Status</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-600 text-sm font-medium">
                      Loading Home Sliders...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-600 text-sm">
                      No custom Home Sliders added yet. Use the form on the left to add a slide for the Home Page.
                    </td>
                  </tr>
                ) : (
                  filtered.map((slider, idx) => (
                    <tr key={slider.id || idx} className="border-b border-zinc-100 hover:bg-zinc-50/80">
                      <td className="py-3 px-3 text-zinc-900 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="w-24 h-14 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                          {slider.image ? (
                            <img src={slider.image} alt={slider.title || 'Slider'} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mb-1">
                          {slider.badge || 'PAK ROYAL COLLEGE'}
                        </span>
                        <p className="text-zinc-950 font-bold text-sm leading-snug">{slider.title || 'Untitled Slide'}</p>
                        <p className="text-zinc-600 text-xs truncate">{slider.subtitle || '—'}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-bold text-zinc-900 block">{slider.buttonText || 'Explore'}</span>
                        <a
                          href={slider.link || '/'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#087f77] hover:underline flex items-center gap-1 text-xs font-medium"
                        >
                          {slider.link || '/'} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(slider)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                            slider.active !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-300'
                          }`}
                        >
                          {slider.active !== false ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === slider.id ? null : slider.id)}
                            className="border border-zinc-300 bg-white text-zinc-900 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-zinc-100 cursor-pointer"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === slider.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleEdit(slider)}
                                className="w-full text-left px-3 py-1.5 text-xs text-zinc-900 font-semibold hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(slider.id)}
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
    </div>
  );
}
