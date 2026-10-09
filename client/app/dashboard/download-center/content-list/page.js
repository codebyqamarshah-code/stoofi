'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Upload, Trash2, Edit2, Link as LinkIcon, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function ContentListPage() {
  const [contents, setContents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({ contentType: '', youtubeLink: '' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await api.get('/content');
      if (res && res.success) {
        setContents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        alert('File is too large. Max 20MB.');
        return;
      }
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl('');
    setFileBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.contentType) {
      alert('Content Type is required.');
      return;
    }

    try {
      const payload = {
        contentType: formData.contentType,
        youtubeLink: formData.youtubeLink,
        fileUrl: fileBase64,
        fileName: file ? file.name : '',
        fileType: file ? file.type : '',
        fileSize: file ? formatSize(file.size) : ''
      };

      const res = await api.post('/content', payload);
      if (res.success) {
        setContents([res.data, ...contents]);
        setFormData({ contentType: '', youtubeLink: '' });
        removeFile();
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Error saving content');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        const res = await api.delete(`/content/${id}`);
        if (res.success) {
          setContents(contents.filter(c => c._id !== id));
        }
      } catch (err) {
        alert('Error deleting content');
      }
    }
  };

  const handleShare = () => {
    alert('Share functionality initiated. Link copied to clipboard.');
  };

  const handleGenerateUrl = () => {
    alert('Public URL Generated for selected items.');
  };

  const filteredContents = useMemo(() => {
    return contents.filter(c => {
      const matchName = c.fileName ? c.fileName.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const matchLink = c.youtubeLink ? c.youtubeLink.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      return matchName || matchLink;
    });
  }, [contents, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Content</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Download Center</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Content</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-5">
        <h2 className="text-base font-semibold text-zinc-950 mb-4">Search</h2>
        <div className="space-y-1.5 max-w-xl">
          <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Name</Label>
          <Input placeholder="Name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {/* Add Content + Content List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-950">Add Content</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Content Type <span className="text-rose-500">*</span></Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
                  value={formData.contentType}
                  onChange={(e) => setFormData({...formData, contentType: e.target.value})}
                  required
                >
                  <option value="">Content Type *</option>
                  <option value="Assignments">Assignments</option>
                  <option value="Study Material">Study Material</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Other Downloads">Other Downloads</option>
                  <option value="Video">Video</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">YouTube Link</Label>
                <Input placeholder="YouTube Link" value={formData.youtubeLink} onChange={(e) => setFormData({...formData, youtubeLink: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-500 font-semibold">OR</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              
              <div className="space-y-1.5">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar" />
                
                {!file ? (
                  <div className="flex items-center gap-2">
                    <Input type="text" placeholder="No file selected" readOnly className="bg-white border-zinc-300 text-zinc-950 text-zinc-500" />
                    <Button type="button" onClick={() => fileInputRef.current?.click()} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 shrink-0">
                      <Upload className="h-4 w-4 mr-2" /> BROWSE
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-white border border-zinc-200 shadow-xs rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-zinc-950 font-medium truncate">{file.name}</p>
                        <p className="text-[10px] text-emerald-500 font-bold mt-0.5">Ready to Upload ({formatSize(file.size)})</p>
                      </div>
                    </div>
                    {file.type.startsWith('image/') && previewUrl ? (
                      <div className="w-full h-32 mb-3 rounded border border-zinc-200 overflow-hidden bg-white flex items-center justify-center">
                        <img src={previewUrl} className="max-w-full max-h-full object-contain" alt="Preview" />
                      </div>
                    ) : previewUrl ? (
                      <div className="w-full h-32 mb-3 rounded border border-zinc-200 overflow-hidden bg-white flex items-center justify-center">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          Document<br/>Selected
                        </div>
                      </div>
                    ) : null}
                    
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1 h-8 bg-zinc-800 hover:bg-zinc-700 text-xs">
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Change
                      </Button>
                      <Button type="button" size="sm" onClick={removeFile} variant="destructive" className="flex-1 h-8 bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 text-xs">
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
                
                <p className="text-[10px] text-zinc-500 mt-1">(jpg, png, pdf, docx, txt, xlsx, zip allowed)</p>
              </div>
              <div className="pt-2">
                <Button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-semibold">SAVE</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Content List Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button onClick={handleShare} size="sm" className="h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-semibold text-xs"><Share2 className="w-3.5 h-3.5 mr-1.5" /> SHARE</Button>
                <Button onClick={handleGenerateUrl} size="sm" variant="outline" className="h-9 text-zinc-600 border-zinc-600/50 hover:bg-zinc-600/10 font-semibold text-xs"><LinkIcon className="w-3.5 h-3.5 mr-1.5" /> GENERATE URL</Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input placeholder="SEARCH" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[180px] bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" />
                </div>
                <TableExportToolbar 
                  filename="Content_List" 
                  title="Content List" 
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Document</th>
                    <th className="px-4 py-3 font-semibold">Content Type</th>
                    <th className="px-4 py-3 font-semibold">Size</th>
                    <th className="px-4 py-3 font-semibold">Uploaded By</th>
                    <th className="px-4 py-3 font-semibold">Created On</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  ) : filteredContents.length > 0 ? filteredContents.map((c, i) => (
                    <tr key={c._id} className="border-b border-zinc-200/50 hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-4 text-zinc-950 font-medium">
                        {c.youtubeLink ? (
                          <a href={c.youtubeLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{c.youtubeLink}</a>
                        ) : (
                          <span>{c.fileName}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-zinc-950">{c.contentType}</td>
                      <td className="px-4 py-4 text-zinc-950">{c.uploadedBy ? `${c.uploadedBy.firstName || ''} ${c.uploadedBy.lastName || ''}`.trim() || 'Admin' : 'Admin'}</td>
                      <td className="px-4 py-4 text-zinc-950 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          onClick={() => handleDelete(c._id)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> DELETE
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredContents.length > 0 ? 1 : 0} to {filteredContents.length} of {filteredContents.length} entries</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
