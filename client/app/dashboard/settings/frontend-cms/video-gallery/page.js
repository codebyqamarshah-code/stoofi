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
  Video,
  ExternalLink,
  Play,
  Edit3,
  CheckCircle2,
  Globe,
  X
} from 'lucide-react';
import {
  fetchCmsSection,
  mutateCmsSection,
  compressCmsImage,
  extractYouTubeId,
  getVideoThumbnail
} from '@/lib/frontendCmsApi';

const VIDEO_CATEGORIES = [
  'Campus Tour',
  'Science & Robotics Exhibition',
  'Annual Sports & Events',
  'Academic Seminars & Lectures',
  'Student Achievements'
];

export default function VideoGalleryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Campus Tour');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [customThumb, setCustomThumb] = useState('');
  const [thumbFileName, setThumbFileName] = useState('');
  const [showOnHome, setShowOnHome] = useState(true);

  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const fileRef = useRef();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    let mounted = true;
    fetchCmsSection('videoGallery', []).then((data) => {
      if (mounted) {
        setVideos(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleThumbUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbFileName(f.name);
    const compressed = await compressCmsImage(f, 800, 0.8);
    setCustomThumb(compressed);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Campus Tour');
    setDescription('');
    setLink('');
    setCustomThumb('');
    setThumbFileName('');
    setShowOnHome(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    if (!name.trim() || !link.trim()) {
      alert('Please enter Video Title and Video Link (YouTube/Vimeo/MP4)');
      return;
    }
    setSaving(true);
    const resolvedThumbnail = getVideoThumbnail(link.trim(), customThumb);
    const itemPayload = {
      name: name.trim(),
      category: category || 'Campus Tour',
      description: description.trim() || 'Campus activity and academic highlights video',
      link: link.trim(),
      thumbnail: resolvedThumbnail,
      showOnHome
    };

    if (editingId) {
      const res = await mutateCmsSection('videoGallery', 'update', { id: editingId, item: itemPayload });
      if (res?.success) {
        setVideos(res.data);
        showToast('Video updated & published to Home Page!');
        resetForm();
      }
    } else {
      const res = await mutateCmsSection('videoGallery', 'add', { item: itemPayload });
      if (res?.success) {
        setVideos(res.data);
        showToast('New video added & published to Home Page!');
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setCategory(item.category || 'Campus Tour');
    setDescription(item.description || '');
    setLink(item.link || '');
    setCustomThumb(item.thumbnail || '');
    setThumbFileName(item.thumbnail ? 'Custom Thumbnail' : '');
    setShowOnHome(item.showOnHome !== false);
    setOpenDropdownId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('videoGallery', 'delete', { id });
    if (res?.success) {
      setVideos(res.data);
      showToast('Video removed from gallery.');
    }
    setOpenDropdownId(null);
  };

  const filtered = videos.filter(v =>
    (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(search.toLowerCase())
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
            <span className="text-zinc-950 font-bold">Video Gallery</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Campus Video Gallery CMS</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Add YouTube, Vimeo, or campus video links here — published videos appear live on the Home Page with an embedded player.
          </p>
        </div>

        <Link
          href="/#video-gallery"
          target="_blank"
          className="inline-flex items-center gap-2 bg-[#087f77] hover:bg-[#06665f] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm"
        >
          <Globe className="w-4 h-4" /> View Videos on Home Page <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add / Edit Video */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              {editingId ? 'Edit Video' : 'Add Campus Video'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">VIDEO TITLE *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Pak Royal College Campus Tour"
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
              {VIDEO_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">VIDEO LINK (YOUTUBE / VIMEO / MP4) *</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">DESCRIPTION</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description of the video..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#087f77] resize-none"
            />
          </div>

          {/* Thumbnail File Upload */}
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">
              THUMBNAIL IMAGE (AUTO-DETECTED FOR YOUTUBE)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-800 border border-zinc-300 rounded-xl px-3.5 py-2.5 bg-zinc-50 flex-1 truncate">
                {thumbFileName || 'Optional custom thumbnail'}
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
                onChange={handleThumbUpload}
              />
            </div>
            {(customThumb || extractYouTubeId(link)) && (
              <div className="mt-2 relative rounded-xl overflow-hidden border border-zinc-200 h-28 bg-zinc-100">
                <img
                  src={getVideoThumbnail(link, customThumb)}
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover"
                />
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
            <Plus className="w-4 h-4" /> {saving ? 'SAVING...' : editingId ? 'UPDATE VIDEO' : 'ADD VIDEO'}
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Video Gallery List ({filtered.length})</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH VIDEOS..."
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
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Thumbnail</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Video Title & Description</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Play / Link</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-600 text-sm font-medium">
                      Loading Video Gallery...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-600 text-sm">
                      No videos added yet. Use the form on the left to add a YouTube or campus video.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => {
                    const thumb = getVideoThumbnail(item.link, item.thumbnail);
                    return (
                      <tr key={item.id || idx} className="border-b border-zinc-100 hover:bg-zinc-50/80">
                        <td className="py-3 px-3 text-zinc-900 font-bold">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div
                            onClick={() => setPlayingVideo(item)}
                            className="w-20 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-900 relative flex items-center justify-center cursor-pointer group"
                          >
                            {thumb ? (
                              <img src={thumb} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                            ) : (
                              <Video className="w-5 h-5 text-white/70" />
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <span className="text-zinc-950 font-bold block">{item.name}</span>
                          <span className="text-zinc-600 text-xs truncate block">{item.description}</span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => setPlayingVideo(item)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087f77] hover:underline cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-[#087f77]" /> Watch Video
                          </button>
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
                                  onClick={() => { setPlayingVideo(item); setOpenDropdownId(null); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-900 font-semibold hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5" /> Play
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-zinc-600 font-medium">
            <span>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</span>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#0c2436] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{playingVideo.name}</h3>
                <p className="text-xs text-zinc-300">{playingVideo.category || 'Campus Video'}</p>
              </div>
              <button onClick={() => setPlayingVideo(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black w-full">
              {extractYouTubeId(playingVideo.link) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(playingVideo.link)}?autoplay=1`}
                  title={playingVideo.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center gap-3">
                  <Video className="w-10 h-10 text-[#64e2bc]" />
                  <p className="text-sm font-semibold">{playingVideo.description}</p>
                  <a
                    href={playingVideo.link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#64e2bc] text-[#0c322f] font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5"
                  >
                    Open External Video Stream <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
