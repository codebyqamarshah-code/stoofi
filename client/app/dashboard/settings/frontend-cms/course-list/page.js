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

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('STEM & Computer Science');
  const [duration, setDuration] = useState('1 Academic Year');
  const [gradeLevel, setGradeLevel] = useState('Grade 9 - 12');
  const [overview, setOverview] = useState('');
  const [outline, setOutline] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
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
      const [cData, catData] = await Promise.all([
        fetchCmsSection('courseList', []),
        fetchCmsSection('courseCategory', [])
      ]);
      // Filter out any old Latin dummy courses
      const cleanCourses = (Array.isArray(cData) ? cData : []).filter(
        (c) => !/^(Aut dolore|Non incidunt|Numquam sit|Quas asperiores|Ut beatae)/i.test(c.title || '')
      );
      setCourses(cleanCourses);
      setCategories(
        Array.isArray(catData) && catData.length > 0
          ? catData
          : [
              { id: '1', title: 'STEM & Computer Science' },
              { id: '2', title: 'Natural & Applied Sciences' },
              { id: '3', title: 'Business & Humanities' }
            ]
      );
      setLoading(false);
    })();
  }, []);

  const handleImageChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await compressCmsImage(f, 700, 0.82);
    setImage(dataUrl);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('STEM & Computer Science');
    setDuration('1 Academic Year');
    setGradeLevel('Grade 9 - 12');
    setOverview('');
    setOutline('');
    setPrerequisites('');
    setImage('');
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Please enter Course Title');
    setSaving(true);
    const payload = {
      id: editingId || `course-${Date.now()}`,
      title: title.trim(),
      category: category || 'STEM & Computer Science',
      duration: duration.trim() || '1 Academic Year',
      gradeLevel: gradeLevel.trim() || 'All Grades',
      overview: overview.trim() || 'Comprehensive curriculum designed for academic excellence.',
      outline: outline.trim(),
      prerequisites: prerequisites.trim(),
      image:
        image ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'
    };
    const res = await mutateCmsSection('courseList', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    setSaving(false);
    if (res.success) {
      setCourses(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'Course updated!' : 'Course added to Home Page!');
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setCategory(item.category || 'STEM & Computer Science');
    setDuration(item.duration || '1 Academic Year');
    setGradeLevel(item.gradeLevel || 'All Grades');
    setOverview(item.overview || '');
    setOutline(item.outline || '');
    setPrerequisites(item.prerequisites || '');
    setImage(item.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('courseList', 'deleteItem', { id });
    if (res.success) {
      setCourses(Array.isArray(res.data) ? res.data : []);
      showToast('Course deleted.');
    }
  };

  const filtered = courses.filter(
    (c) =>
      (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.overview || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(search.toLowerCase())
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
            <span className="text-zinc-950 font-bold">Course List</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">Academic Programs & Courses</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Publish academic courses, study programs, and learning tracks displayed on the Home Page.
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

      {/* Top Form */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            {editingId ? 'Edit Course' : 'Add Academic Course'}
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline">
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">COURSE TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Computer Science & Robotics"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">COURSE CATEGORY *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            >
              {categories.map((cat) => (
                <option key={cat.id || cat.title} value={cat.title}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">GRADE / LEVEL</label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="e.g. Grade 9 - 12 / O-Levels"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">DURATION</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 1 Academic Year"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">COURSE THUMBNAIL</label>
            <div className="flex items-center gap-2">
              {image && <img src={image} alt="Preview" className="w-10 h-10 rounded-lg object-cover border shrink-0" />}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex-1 bg-zinc-50 hover:bg-emerald-50/40 border border-dashed border-zinc-300 hover:border-[#009966] text-zinc-800 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#009966]" /> {image ? 'Change Image' : 'Upload Thumbnail'}
              </button>
              <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">OVERVIEW *</label>
            <textarea
              rows={3}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Course overview and key learning outcomes..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl p-3 focus:outline-none focus:border-[#009966] resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">SYLLABUS OUTLINE</label>
            <textarea
              rows={3}
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder="Modules and topics covered..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl p-3 focus:outline-none focus:border-[#009966] resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">PREREQUISITES</label>
            <textarea
              rows={3}
              value={prerequisites}
              onChange={(e) => setPrerequisites(e.target.value)}
              placeholder="Required prior knowledge or grade..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl p-3 focus:outline-none focus:border-[#009966] resize-none"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="bg-[#009966] hover:bg-[#008055] disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {editingId ? 'UPDATE COURSE' : 'PUBLISH COURSE'}
        </button>
      </div>

      {/* Bottom Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Course List ({filtered.length})
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-36"
              />
            </div>
            <TableExportToolbar />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Image</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Course Title & Category</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Grade / Duration</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Overview</th>
                <th className="text-right py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    Loading courses...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    No courses published yet. Add your first academic program above!
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-zinc-50/80">
                    <td className="py-3 px-4 w-20">
                      <img
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={item.title}
                        className="w-14 h-10 rounded-lg object-cover border border-zinc-200"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-zinc-950 font-bold">{item.title}</div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {item.category || 'Academic'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-800 font-medium text-xs">
                      <div>{item.gradeLevel || 'All Grades'}</div>
                      <div className="text-zinc-500">{item.duration || '1 Year'}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-700 max-w-sm truncate">{item.overview}</td>
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
  );
}
