'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

export default function VideoListPage() {
  const [videos, setVideos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState({ className: '', section: '', title: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', youtubeLink: '', className: '', section: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vidRes, clsRes, secRes] = await Promise.all([
        api.get('/content'),
        api.get('/class'),
        api.get('/section')
      ]);

      if (vidRes.success) {
        setVideos(vidRes.data.filter(c => c.contentType === 'Video'));
      }
      if (clsRes.success) setClasses(clsRes.data);
      if (secRes.success) setSections(secRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/content', { ...formData, contentType: 'Video' });
      if (res.success) {
        setVideos([res.data, ...videos]);
        setShowAddModal(false);
        setFormData({ title: '', youtubeLink: '', className: '', section: '' });
      }
    } catch (err) {
      alert('Error adding video');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this video?')) {
      try {
        const res = await api.delete(`/content/${id}`);
        if (res.success) {
          setVideos(videos.filter(v => v._id !== id));
        }
      } catch (err) {
        alert('Error deleting video');
      }
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchClass = !searchQuery.className || v.className === searchQuery.className;
    const matchSection = !searchQuery.section || v.section === searchQuery.section;
    const matchTitle = !searchQuery.title || (v.title || '').toLowerCase().includes(searchQuery.title.toLowerCase());
    return matchClass && matchSection && matchTitle;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Video</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Download Center</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Video</span>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-zinc-950 mb-4">Add Video</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="bg-white border-zinc-300 text-zinc-950" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">YouTube Link</Label>
                <Input value={formData.youtubeLink} onChange={e => setFormData({...formData, youtubeLink: e.target.value})} required className="bg-white border-zinc-300 text-zinc-950" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Class</Label>
                  <select value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-400">
                    <option value="">Select</option>
                    {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Section</Label>
                  <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-400">
                    <option value="">Select</option>
                    {sections.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Video</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <h2 className="text-base font-semibold text-zinc-950">Search</h2>
          <Button onClick={() => setShowAddModal(true)} className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold h-9 text-xs self-start sm:self-auto">
            <Plus className="h-3.5 w-3.5 mr-1" /> ADD
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Class</Label>
            <select value={searchQuery.className} onChange={e => setSearchQuery({...searchQuery, className: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-400">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Section</Label>
            <select value={searchQuery.section} onChange={e => setSearchQuery({...searchQuery, section: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-400">
              <option value="">All Sections</option>
              {sections.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Title</Label>
            <Input placeholder="Title" value={searchQuery.title} onChange={e => setSearchQuery({...searchQuery, title: e.target.value})} className="bg-white border-zinc-300 text-zinc-950" />
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-zinc-500 p-4">Loading videos...</div>
        ) : filteredVideos.length > 0 ? (
          filteredVideos.map(v => (
            <div key={v._id} className="bg-white border border-zinc-200 shadow-xs rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><Video className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-zinc-950 text-sm">{v.title}</h3>
                    <p className="text-xs text-zinc-500">{v.className} {v.section && `- ${v.section}`}</p>
                  </div>
                </div>
                <Button onClick={() => handleDelete(v._id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"><Trash2 className="w-4 h-4" /></Button>
              </div>
              {v.youtubeLink && (
                <a href={v.youtubeLink} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline truncate bg-white p-2 rounded border border-zinc-200">
                  {v.youtubeLink}
                </a>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-zinc-500 py-10 text-sm bg-white border border-zinc-200 shadow-xs rounded-xl">
            No Videos Found
          </div>
        )}
      </div>
    </div>
  );
}
