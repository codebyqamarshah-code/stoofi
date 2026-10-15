'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Search, Plus, BookOpen, Clock, Users, 
  DollarSign, LayoutGrid, List, Eye, Trash2, Edit2, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const DEFAULT_COURSES = [
  {
    _id: 'c1',
    title: 'Complete Secondary Physics 2026',
    category: 'Natural Sciences',
    chapters: 14,
    price: 3500,
    enrolledStudents: 42,
    instructor: 'Mudassir Bajwa',
    class: 'Class 10',
    section: 'Section A',
    status: 'Published',
    description: 'Comprehensive physics curriculum with video lectures, numerical problems, and solved board papers.'
  },
  {
    _id: 'c2',
    title: 'Higher Algebra & Trigonometry Mastery',
    category: 'Mathematics & Logic',
    chapters: 18,
    price: 4000,
    enrolledStudents: 56,
    instructor: 'Fatima Zahra',
    class: 'Class 10',
    section: 'Section B',
    status: 'Published',
    description: 'In-depth video tutorials covering matrices, quadratic equations, and complex trigonometric identities.'
  },
  {
    _id: 'c3',
    title: 'Organic & Inorganic Chemistry Essentials',
    category: 'Natural Sciences',
    chapters: 12,
    price: 3200,
    enrolledStudents: 38,
    instructor: 'Dr. Bilal Siddiqui',
    class: 'Class 9',
    section: 'Section A',
    status: 'Published',
    description: 'Practical lab demonstrations, reaction mechanisms, and periodic table revision modules.'
  },
  {
    _id: 'c4',
    title: 'Modern Web Development & Python Basics',
    category: 'Computer Science & IT',
    chapters: 16,
    price: 4500,
    enrolledStudents: 64,
    instructor: 'Ms. Rabia Noor',
    class: 'O-Levels',
    section: 'Section A',
    status: 'Published',
    description: 'Hands-on coding labs from HTML/CSS to Python data structures and algorithmic thinking.'
  }
];

export default function AllCoursesPage() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/lms-course').catch(() => null);
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setCourses(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/lms-course/${id}`).catch(() => null);
    } catch (e) {
      console.error(e);
    }
    setCourses(prev => prev.filter(c => c._id !== id));
  };

  const filtered = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.instructor || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = !categoryFilter || c.category === categoryFilter;
    const matchesStat = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesCat && matchesStat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#084A86]" />
            LMS Courses Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Curate, organize and publish digital courses, recorded video lectures, and study modules
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Courses</span>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search course title, instructor, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9.5 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-[#084A86]"
            />
          </div>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9.5 rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86] w-full sm:w-48"
          >
            <option value="">All Categories</option>
            <option value="Natural Sciences">Natural Sciences</option>
            <option value="Mathematics & Logic">Mathematics & Logic</option>
            <option value="Computer Science & IT">Computer Science & IT</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Toggle */}
          <div className="flex border border-zinc-200 rounded-lg overflow-hidden p-0.5 bg-zinc-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#084A86]' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#084A86]' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Link href="/dashboard/lms/add-course">
            <Button className="h-9.5 bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs px-4">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500">
              <BookOpen className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
              <div className="font-bold text-zinc-900">No courses found</div>
              <div className="text-xs text-zinc-500 mt-1">Try clearing your filters or create a new course.</div>
            </div>
          ) : (
            filtered.map((course, idx) => (
              <div 
                key={course._id || idx}
                className="bg-white border border-zinc-200 rounded-2xl shadow-xs hover:shadow-md hover:border-[#084A86]/50 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Top Banner / Placeholder */}
                  <div className="h-32 bg-gradient-to-br from-[#084A86] to-[#073b6b] p-4 flex flex-col justify-between text-white relative">
                    <span className="self-start bg-white/20 backdrop-blur-xs text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                      {course.category}
                    </span>
                    <div>
                      <span className="text-[11px] font-medium text-blue-200">{course.class}</span>
                      <div className="text-xl font-black">Rs. {Number(course.price).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h3 className="font-bold text-sm text-zinc-950 leading-snug line-clamp-2 group-hover:text-[#084A86] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600 font-medium">
                      <span>Chapters: <b className="text-zinc-900">{course.chapters}</b></span>
                      <span>Enrolled: <b className="text-emerald-700">{course.enrolledStudents || 40}</b></span>
                    </div>

                    <div className="text-[11px] text-zinc-500">
                      Instructor: <span className="font-bold text-zinc-800">{course.instructor}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    {course.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleDelete(course._id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Course Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Instructor</th>
                  <th className="px-4 py-3 text-center">Chapters</th>
                  <th className="px-4 py-3 text-center">Price</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((course, idx) => (
                  <tr key={course._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center text-xs text-zinc-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-950 max-w-[200px] truncate">{course.title}</td>
                    <td className="px-4 py-3.5 text-xs text-zinc-700 font-medium">{course.category}</td>
                    <td className="px-4 py-3.5 text-xs text-zinc-900 font-semibold">{course.instructor}</td>
                    <td className="px-4 py-3.5 text-center text-xs font-bold text-zinc-800">{course.chapters}</td>
                    <td className="px-4 py-3.5 text-center text-xs font-bold text-[#084A86]">Rs. {course.price}</td>
                    <td className="px-4 py-3.5 text-xs text-zinc-600">{course.class}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={() => handleDelete(course._id)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}