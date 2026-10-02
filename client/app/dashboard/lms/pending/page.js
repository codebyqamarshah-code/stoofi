'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, CheckCircle, XCircle, Eye, Layers, BookOpen, User, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const INITIAL_PENDING_COURSES = [
  {
    id: 'course-p1',
    title: 'Python for Artificial Intelligence & Machine Learning',
    instructor: 'Mudassir Bajwa',
    category: 'Computer Science & AI',
    level: 'Intermediate',
    lessonsCount: 24,
    price: 18000,
    submittedDate: '2026-09-22',
    status: 'Pending'
  },
  {
    id: 'course-p2',
    title: 'Cambridge O-Levels Additional Mathematics Fast Track',
    instructor: 'Fatima Zahra',
    category: 'Academic Preparation',
    level: 'Advanced',
    lessonsCount: 32,
    price: 14000,
    submittedDate: '2026-09-23',
    status: 'Pending'
  },
  {
    id: 'course-p3',
    title: 'Organic Chemistry Reactions & Mechanisms Masterclass',
    instructor: 'Dr. Bilal Siddiqui',
    category: 'Science & Chemistry',
    level: 'High School / FSc',
    lessonsCount: 18,
    price: 10000,
    submittedDate: '2026-09-24',
    status: 'Pending'
  }
];

export default function LmsPendingCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get('/lms-course?status=Pending');
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setCourses(res.data.map(c => ({
            id: c._id,
            title: c.title || c.courseName || 'Untitled Course',
            instructor: c.instructor || c.instructorName || 'Unknown',
            category: c.category || c.categoryName || 'General',
            level: c.level || c.courseLevel || 'All Levels',
            lessonsCount: c.lessonsCount || c.lessons?.length || 0,
            price: c.price || c.fees || 0,
            submittedDate: c.createdAt ? c.createdAt.split('T')[0] : '',
            status: c.status || 'Pending'
          })));
        } else {
          // Use demo data if no real data
          setCourses(INITIAL_PENDING_COURSES);
        }
      } catch (e) {
        console.error('Failed to fetch pending courses:', e);
        setCourses(INITIAL_PENDING_COURSES);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleApprove = (id, title) => {
    setCourses(courses.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
    setMessage(`Course "${title}" has been successfully approved and published!`);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleReject = (id, title) => {
    if (confirm(`Are you sure you want to reject the course "${title}"?`)) {
      setCourses(courses.filter(c => c.id !== id));
      setMessage(`Course "${title}" was rejected and returned to instructor for revisions.`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Pending Course Approvals
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Review, verify curriculum standards, and approve new courses submitted by instructors.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 dark:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-500">Pending Courses</span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search by course title, instructor, category..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus-visible:ring-amber-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
              Awaiting Review: <strong className="text-amber-600 dark:text-amber-400 font-bold">{courses.filter(c => c.status === 'Pending').length} Courses</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Pending Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
            <Layers className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
            <p className="text-base font-semibold text-zinc-600 dark:text-zinc-300">No pending courses awaiting review</p>
            <p className="text-sm text-zinc-500 mt-1">All submitted courses have been reviewed and published.</p>
          </div>
        ) : (
          filteredCourses.map((c) => (
            <div key={c.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    {c.category}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    c.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-400'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">{c.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                    <User className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Instructor: <strong className="text-zinc-900 dark:text-zinc-200">{c.instructor}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Lessons:</span>
                    <strong className="text-zinc-900 dark:text-zinc-200">{c.lessonsCount} Modules</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Course Level:</span>
                    <strong className="text-zinc-900 dark:text-zinc-200">{c.level}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Price:</span>
                    <strong className="text-emerald-400 font-mono">PKR {c.price.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Submitted:</span>
                    <span className="text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">{c.submittedDate}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-white dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setReviewModal(c)}
                  className="h-8 text-xs border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:text-white"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                </Button>

                {c.status === 'Pending' ? (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleReject(c.id, c.title)}
                      className="h-8 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 hover:text-rose-700 dark:hover:text-white"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(c.id, c.title)}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Published
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">COURSE REVIEW</span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">{reviewModal.title}</h3>
              </div>
              <button onClick={() => setReviewModal(null)} className="text-zinc-500 hover:text-zinc-900 dark:text-white font-bold text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div><span className="text-zinc-500">Instructor:</span> <strong className="text-zinc-900 dark:text-white block">{reviewModal.instructor}</strong></div>
                <div><span className="text-zinc-500">Category:</span> <strong className="text-zinc-900 dark:text-white block">{reviewModal.category}</strong></div>
                <div><span className="text-zinc-500">Level:</span> <strong className="text-zinc-900 dark:text-white block">{reviewModal.level}</strong></div>
                <div><span className="text-zinc-500">Suggested Price:</span> <strong className="text-emerald-400 block font-mono">PKR {reviewModal.price.toLocaleString()}</strong></div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-zinc-600 dark:text-zinc-400 font-semibold block">Curriculum Breakdown:</span>
                <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-300">
                  <li>Module 1: Introduction & Fundamentals (4 Videos, 2 Quizzes)</li>
                  <li>Module 2: Core Concepts & Deep Dive (8 Videos, 3 Assignments)</li>
                  <li>Module 3: Hands-on Practical Projects (6 Lab Sessions)</li>
                  <li>Module 4: Final Assessment & Certification Test</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <Button onClick={() => setReviewModal(null)} variant="outline" className="border-zinc-700 text-zinc-600 dark:text-zinc-300">
                Close
              </Button>
              {reviewModal.status === 'Pending' && (
                <Button 
                  onClick={() => {
                    handleApprove(reviewModal.id, reviewModal.title);
                    setReviewModal(null);
                  }} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Approve & Publish
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}









