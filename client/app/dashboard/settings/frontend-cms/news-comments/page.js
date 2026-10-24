'use client';

import { useState, useEffect } from 'react';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { fetchCmsSection, mutateCmsSection } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  Search,
  Trash2,
  CheckCircle2,
  Plus,
  MessageSquare
} from 'lucide-react';

export default function NewsCommentsPage() {
  const [comments, setComments] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const [author, setAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [inResponseTo, setInResponseTo] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [cData, nData] = await Promise.all([
        fetchCmsSection('newsComments', []),
        fetchCmsSection('newsList', [])
      ]);
      setComments(Array.isArray(cData) ? cData : []);
      setNewsList(Array.isArray(nData) ? nData : []);
      setLoading(false);
    })();
  }, []);

  const handleAddComment = async () => {
    if (!author.trim() || !commentText.trim()) return alert('Please enter Author Name and Comment');
    const payload = {
      id: `cmt-${Date.now()}`,
      author: author.trim(),
      comment: commentText.trim(),
      inResponseTo: inResponseTo || (newsList[0]?.title ?? 'General Campus Announcement'),
      status: 'Approved',
      submittedOn: new Date().toISOString().slice(0, 10)
    };
    const res = await mutateCmsSection('newsComments', 'addItem', { item: payload });
    if (res.success) {
      setComments(Array.isArray(res.data) ? res.data : []);
      setAuthor('');
      setCommentText('');
      showToast('Comment posted & approved!');
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Approved' ? 'Pending' : 'Approved';
    const res = await mutateCmsSection('newsComments', 'updateItem', {
      id: item.id,
      item: { ...item, status: nextStatus }
    });
    if (res.success) {
      setComments(Array.isArray(res.data) ? res.data : []);
      showToast(`Comment marked as ${nextStatus}`);
    }
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('newsComments', 'deleteItem', { id });
    if (res.success) {
      setComments(Array.isArray(res.data) ? res.data : []);
      showToast('Comment deleted.');
    }
  };

  const filtered = comments.filter(
    (c) =>
      (c.author || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.comment || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.inResponseTo || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">News Comment List</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#009966]" /> News Comments & Moderation
          </h1>
        </div>
        {toast && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4 h-fit">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">
            Add / Post Comment
          </h2>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">AUTHOR NAME *</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Ali Raza (Parent)"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">NEWS ARTICLE</label>
            <input
              type="text"
              value={inResponseTo}
              onChange={(e) => setInResponseTo(e.target.value)}
              placeholder="Article title..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">COMMENT *</label>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write comment..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966] resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAddComment}
            className="w-full bg-[#009966] hover:bg-[#008055] text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> POST COMMENT
          </button>
        </div>

        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              News Comment List ({filtered.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Quick search..."
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
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Author</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Comment</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">In Response To</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Status</th>
                  <th className="text-right py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500 text-sm">
                      Loading comments...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500 text-sm">
                      No comments submitted yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-4 text-zinc-950 font-bold">{idx + 1}</td>
                      <td className="py-3 px-4 text-zinc-950 font-bold">{item.author}</td>
                      <td className="py-3 px-4 text-zinc-800 max-w-xs">{item.comment}</td>
                      <td className="py-3 px-4 text-zinc-900 font-medium">{item.inResponseTo}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer ${
                            item.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status || 'Approved'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
