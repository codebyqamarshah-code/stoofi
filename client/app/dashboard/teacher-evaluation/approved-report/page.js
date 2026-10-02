'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Search, ChevronRight, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Trash2 
} from 'lucide-react';
import api from '@/services/api';

export default function ApprovedReportPage() {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                // const res = await api.get('/teacher-evaluation/approved');
                // setData(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-zinc-950">Teacher Approved Evaluation Report</h1>
                <div className="flex items-center text-sm text-zinc-500 font-medium">
                    <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
                    <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
                    <span>Teacher Evaluation</span>
                    <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
                    <span className="text-zinc-900 font-semibold">Approved Report</span>
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">CLASS *</label>
                        <select className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400">
                            <option value="">Select Class *</option>
                            {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">SUBJECT</label>
                        <select className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400">
                            <option value="">Select Subject</option>
                            {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Language', 'Computer Science'].map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">SECTION</label>
                        <select className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400">
                            <option value="">Select Section</option>
                            {['A', 'B', 'C', 'D'].map(s => (
                                <option key={s} value={s}>Section {s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">TEACHER</label>
                        <select className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400">
                            <option value="">Select Teacher</option>
                            {['Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Dr. Bilal Siddiqui'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">SUBMITTED BY</label>
                        <select className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400">
                            <option value="">Select Submitter</option>
                            {['Principal Office', 'Academic Coordinator', 'Vice Principal', 'HOD Science', 'Admin Officer'].map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end mt-5 pt-4 border-t border-zinc-100">
                    <button className="flex items-center px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold rounded-lg transition-colors shadow-xs">
                        <Search className="w-4 h-4 mr-2" />
                        SEARCH
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="SEARCH" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-zinc-300 rounded-md text-xs font-bold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 uppercase"
                        />
                    </div>
                    <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
                        <button className="p-2 border-r border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors" title="Copy"><Copy className="w-4 h-4" /></button>
                        <button className="p-2 border-r border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors" title="Excel"><FileSpreadsheet className="w-4 h-4" /></button>
                        <button className="p-2 border-r border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors" title="CSV"><FileText className="w-4 h-4" /></button>
                        <button className="p-2 border-r border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors" title="Print"><Printer className="w-4 h-4" /></button>
                        <button className="p-2 border-r border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                        <button className="p-2 text-zinc-700 hover:bg-zinc-100 transition-colors" title="Columns"><Columns className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-950">
                        <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                            <tr>
                                <th className="px-4 py-3 font-bold">Staff Id</th>
                                <th className="px-4 py-3 font-bold">Teacher Name</th>
                                <th className="px-4 py-3 font-bold">Submitted By</th>
                                <th className="px-4 py-3 font-bold">Class(Section)</th>
                                <th className="px-4 py-3 font-bold">Rating</th>
                                <th className="px-4 py-3 font-bold">Comment</th>
                                <th className="px-4 py-3 font-bold">Status</th>
                                <th className="px-4 py-3 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-zinc-500 font-medium">No data available in table</td>
                                </tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-50/80 transition-colors font-medium">
                                        <td className="px-4 py-3.5 text-zinc-700">{item.staffId}</td>
                                        <td className="px-4 py-3.5 font-semibold text-zinc-950">{item.teacherName}</td>
                                        <td className="px-4 py-3.5 text-zinc-700">{item.submittedBy}</td>
                                        <td className="px-4 py-3.5 text-zinc-700">{item.classSection}</td>
                                        <td className="px-4 py-3.5 text-zinc-700">{item.rating}</td>
                                        <td className="px-4 py-3.5 text-zinc-700">{item.comment}</td>
                                        <td className="px-4 py-3.5 text-zinc-700">{item.status}</td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button className="text-rose-600 hover:text-rose-700 p-1 hover:bg-rose-50 rounded transition-colors" title="Delete">
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
