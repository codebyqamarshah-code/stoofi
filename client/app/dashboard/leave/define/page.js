'use client';
import React, { useState, useEffect } from 'react';
import { 
    Search, ChevronRight, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Trash2 
} from 'lucide-react';
import api from '@/services/api';

export default function LeaveDefinePage() {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form state
    const [role, setRole] = useState('');
    const [leaveType, setLeaveType] = useState('');
    const [days, setDays] = useState('');
    
    useEffect(() => {
        // Fetch leave define data
        const fetchData = async () => {
            try {
                // const res = await api.get('/leave-define');
                // setData(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leave-define', { role, leaveType, days });
            alert('Leave Define Saved Successfully');
            // reset form or refetch
            setRole('');
            setLeaveType('');
            setDays('');
        } catch (error) {
            console.error('Error saving leave define', error);
            alert('Error saving leave define');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-6">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-zinc-400 mb-6">
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span>Leave</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-zinc-100">Leave Define</span>
            </div>

            <h1 className="text-2xl font-semibold text-white mb-6">Leave Define</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Form: Add Leave Define */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-6 self-start">
                    <h2 className="text-lg font-medium text-zinc-100 mb-6 border-b border-zinc-800 pb-2">Add Leave Define</h2>
                    
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">ROLE *</label>
                            <select 
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                            >
                                <option value="">Select Role *</option>
                                <option value="Admin">Admin</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Student">Student</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">LEAVE TYPE *</label>
                            <select 
                                required
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                            >
                                <option value="">Select Leave Type *</option>
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Casual Leave">Casual Leave</option>
                                <option value="Maternity Leave">Maternity Leave</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">DAYS *</label>
                            <input 
                                required
                                type="number" 
                                min="0"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                                placeholder="0"
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit"
                                className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-medium rounded transition-colors"
                            >
                                SAVE
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Table: Leave Define List */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h2 className="text-lg font-medium text-zinc-100 mb-6 border-b border-zinc-800 pb-2">Leave Define List</h2>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <div className="relative w-full sm:w-auto">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full sm:w-64 bg-zinc-900 border border-zinc-800 rounded text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Copy"><Copy className="w-4 h-4" /></button>
                            <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Excel"><FileSpreadsheet className="w-4 h-4" /></button>
                            <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="CSV"><FileText className="w-4 h-4" /></button>
                            <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Print"><Printer className="w-4 h-4" /></button>
                            <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                            <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Columns"><Columns className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-400">
                            <thead className="text-xs text-zinc-400 uppercase bg-zinc-950 border-y border-zinc-800">
                                <tr>
                                    <th className="px-4 py-3 font-medium">User</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium">Leave Type</th>
                                    <th className="px-4 py-3 font-medium">Days</th>
                                    <th className="px-4 py-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-zinc-500">No data available in table</td>
                                    </tr>
                                ) : (
                                    data.map((item, idx) => (
                                        <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                            <td className="px-4 py-3 text-zinc-300">{item.user}</td>
                                            <td className="px-4 py-3 text-zinc-300">{item.role}</td>
                                            <td className="px-4 py-3 text-zinc-300">{item.leaveType}</td>
                                            <td className="px-4 py-3 text-zinc-300">{item.days}</td>
                                            <td className="px-4 py-3 text-right text-zinc-300">
                                                <button className="text-rose-500 hover:text-rose-400 transition-colors" title="Delete">
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
        </div>
    );
}
