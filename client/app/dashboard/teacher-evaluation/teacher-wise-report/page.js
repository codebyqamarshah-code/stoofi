'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Search, ChevronRight, Star, User, BookOpen, Award, Trash2, CheckCircle2, SlidersHorizontal 
} from 'lucide-react';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

const DEFAULT_EVALUATIONS = [
  { _id: 'e1', staffId: 'TCH-101', teacherName: 'Mudassir Bajwa', submittedBy: 'Academic Coordinator', classSection: 'FSC OTT (A)', rating: '4.8 / 5.0', scorePercent: 96, comment: 'Exceptional pedagogy, engages students effectively and keeps disciplined classroom environment.', status: 'Approved', date: '2026-03-12' },
  { _id: 'e2', staffId: 'TCH-102', teacherName: 'Fatima Zahra', submittedBy: 'Principal Office', classSection: 'BS Psychology (B)', rating: '4.5 / 5.0', scorePercent: 90, comment: 'Strong subject mastery in Chemistry; thorough lesson planning and timely homework checking.', status: 'Approved', date: '2026-03-18' },
  { _id: 'e3', staffId: 'TCH-103', teacherName: 'Muhammad Ali', submittedBy: 'Vice Principal', classSection: 'DPT (A)', rating: '4.2 / 5.0', scorePercent: 84, comment: 'Punctual and consistent. Good communication with parents during parent-teacher meetings.', status: 'Approved', date: '2026-03-25' },
  { _id: 'e4', staffId: 'TCH-104', teacherName: 'Ahmed Khan', submittedBy: 'HOD Science', classSection: 'Class 10 (B)', rating: '3.9 / 5.0', scorePercent: 78, comment: 'Good syllabus coverage. Recommended to introduce more audio-visual lab experiments.', status: 'Approved', date: '2026-04-02' },
  { _id: 'e5', staffId: 'TCH-105', teacherName: 'Dr. Bilal Siddiqui', submittedBy: 'Academic Coordinator', classSection: 'FSC OTT (A)', rating: '4.9 / 5.0', scorePercent: 98, comment: 'Role-model educator. Consistently high student board exam scores and innovative teaching methods.', status: 'Approved', date: '2026-04-10' },
];

export default function TeacherWiseReportPage() {
    const [data, setData] = useState(DEFAULT_EVALUATIONS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedSubmitter, setSelectedSubmitter] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/teacher-evaluation').catch(() => null);
            if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
                setData(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = () => {
        let filtered = DEFAULT_EVALUATIONS;
        if (selectedTeacher) {
            filtered = filtered.filter(item => item.teacherName.toLowerCase().includes(selectedTeacher.toLowerCase()));
        }
        if (selectedSubmitter) {
            filtered = filtered.filter(item => item.submittedBy.toLowerCase().includes(selectedSubmitter.toLowerCase()));
        }
        setData(filtered);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this evaluation report?')) return;
        try {
            await api.delete(`/teacher-evaluation/${id}`).catch(() => null);
        } catch (e) {
            console.error(e);
        }
        setData(prev => prev.filter(item => item._id !== id));
    };

    const filtered = data.filter(item => {
        const matchesQuery = 
            item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.classSection.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.comment.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTeacher = !selectedTeacher || item.teacherName.toLowerCase().includes(selectedTeacher.toLowerCase());
        const matchesSubmitter = !selectedSubmitter || item.submittedBy.toLowerCase().includes(selectedSubmitter.toLowerCase());
        return matchesQuery && matchesTeacher && matchesSubmitter;
    });

    const averageRating = (
        filtered.length > 0
            ? filtered.reduce((acc, curr) => acc + (curr.scorePercent || 85), 0) / filtered.length
            : 0
    ).toFixed(1);

    return (
        <div className="space-y-6">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
                        <Award className="h-6 w-6 text-[#084A86]" />
                        Teacher Wise Evaluation Report
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">Detailed performance metrics, classroom observation scores, and supervisor feedback</p>
                </div>
                <div className="flex items-center text-sm text-zinc-400 font-medium">
                    <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
                    <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
                    <span>Teacher Evaluation</span>
                    <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
                    <span className="text-zinc-950 font-bold">Teacher Wise Report</span>
                </div>
            </div>

            {/* Performance KPI Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Evaluated Records</div>
                        <div className="text-2xl font-extrabold text-zinc-950 mt-1">{filtered.length}</div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
                        <User className="h-5 w-5" />
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Average Performance Score</div>
                        <div className="text-2xl font-extrabold text-emerald-600 mt-1">{averageRating}%</div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Star className="h-5 w-5" />
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Approval Compliance</div>
                        <div className="text-2xl font-extrabold text-[#084A86] mt-1">100%</div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">Select Teacher</label>
                        <select 
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                        >
                            <option value="">All Teachers</option>
                            {['Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Dr. Bilal Siddiqui'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">Submitted By</label>
                        <select 
                            value={selectedSubmitter}
                            onChange={(e) => setSelectedSubmitter(e.target.value)}
                            className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                        >
                            <option value="">All Evaluators</option>
                            {['Principal Office', 'Academic Coordinator', 'Vice Principal', 'HOD Science', 'Admin Officer'].map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-zinc-100">
                    <button 
                        onClick={() => { setSelectedTeacher(''); setSelectedSubmitter(''); setSearchQuery(''); setData(DEFAULT_EVALUATIONS); }}
                        className="px-4 py-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold rounded-lg transition-colors"
                    >
                        Reset Filter
                    </button>
                    <button 
                        onClick={handleSearch}
                        className="flex items-center px-6 py-2 bg-[#084A86] hover:bg-[#073b6b] text-white text-sm font-bold rounded-lg transition-colors shadow-xs"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        SEARCH REPORT
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="SEARCH BY TEACHER, CLASS, NOTE..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full sm:w-80 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                        />
                    </div>
                    <TableExportToolbar />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-950">
                        <thead className="text-xs text-zinc-700 uppercase bg-zinc-100/70 border-b border-zinc-200 font-bold">
                            <tr>
                                <th className="px-4 py-3 font-bold w-12">#</th>
                                <th className="px-4 py-3 font-bold">Staff ID</th>
                                <th className="px-4 py-3 font-bold">Teacher Name</th>
                                <th className="px-4 py-3 font-bold">Submitted By</th>
                                <th className="px-4 py-3 font-bold">Class / Section</th>
                                <th className="px-4 py-3 font-bold">Rating</th>
                                <th className="px-4 py-3 font-bold">Performance Note</th>
                                <th className="px-4 py-3 font-bold">Status</th>
                                <th className="px-4 py-3 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-4 py-10 text-center text-zinc-500 font-medium">
                                        No evaluation records matched the filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item, idx) => (
                                    <tr key={item._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                                        <td className="px-4 py-3.5 text-zinc-400 text-xs">{idx + 1}</td>
                                        <td className="px-4 py-3.5 font-mono text-zinc-900 text-xs font-semibold">{item.staffId}</td>
                                        <td className="px-4 py-3.5 font-bold text-zinc-950">{item.teacherName}</td>
                                        <td className="px-4 py-3.5 text-zinc-700 text-xs">{item.submittedBy}</td>
                                        <td className="px-4 py-3.5 text-zinc-700 text-xs font-medium">{item.classSection}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-xs text-zinc-900">{item.rating}</span>
                                                <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${
                                                            (item.scorePercent || 80) >= 90 ? 'bg-emerald-500' :
                                                            (item.scorePercent || 80) >= 75 ? 'bg-[#084A86]' : 'bg-amber-500'
                                                        }`}
                                                        style={{ width: `${item.scorePercent || 80}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-zinc-600 text-xs max-w-[240px] truncate" title={item.comment}>
                                            {item.comment}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button 
                                                onClick={() => handleDelete(item._id)} 
                                                className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors" 
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 ml-auto" />
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
    );
}