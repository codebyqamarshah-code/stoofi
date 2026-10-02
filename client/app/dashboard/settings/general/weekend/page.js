'use client';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function Weekend() {
    const [days, setDays] = useState([
        { id: 1, name: 'Saturday', isWeekend: true },
        { id: 2, name: 'Sunday', isWeekend: true },
        { id: 3, name: 'Monday', isWeekend: false },
        { id: 4, name: 'Tuesday', isWeekend: false },
        { id: 5, name: 'Wednesday', isWeekend: false },
        { id: 6, name: 'Thursday', isWeekend: false },
        { id: 7, name: 'Friday', isWeekend: false },
    ]);

    const toggleDay = (id) => {
        setDays(days.map(day => day.id === id ? { ...day, isWeekend: !day.isWeekend } : day));
    };

    return (
        <div className="min-h-screen bg-white p-6 text-zinc-950">
            <div className="mb-6">
                <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
                    <span>Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>General Settings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-zinc-950 font-bold">Weekend Setup</span>
                </div>
                <h1 className="text-2xl font-bold text-zinc-950">Weekend Setup</h1>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl shadow-xs max-w-4xl overflow-hidden">
                <div className="border-b border-zinc-200 px-6 py-4">
                    <h2 className="text-sm font-bold text-zinc-950">Active Week Days & Weekends</h2>
                </div>
                
                <div className="p-6">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs font-bold text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-3">NAME</th>
                                <th className="px-6 py-3">WEEKEND</th>
                                <th className="px-6 py-3 text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-zinc-900">
                            {days.map((day) => (
                                <tr key={day.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-zinc-950">{day.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                                            day.isWeekend ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                                        }`}>
                                            {day.isWeekend ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            type="button"
                                            onClick={() => toggleDay(day.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${day.isWeekend ? 'bg-zinc-950' : 'bg-zinc-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${day.isWeekend ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
