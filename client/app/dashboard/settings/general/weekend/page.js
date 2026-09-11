'use client';
import { useState } from 'react';

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
        <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Weekend</h1>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm max-w-4xl">
                <div className="border-b border-zinc-800 px-6 py-4">
                    <h2 className="text-lg font-medium">Day list</h2>
                </div>
                
                <div className="p-6">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50">
                            <tr>
                                <th className="px-6 py-3 font-medium">NAME</th>
                                <th className="px-6 py-3 font-medium">WEEKEND</th>
                                <th className="px-6 py-3 font-medium">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {days.map((day) => (
                                <tr key={day.id} className="hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 font-medium">{day.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                            day.isWeekend ? 'bg-zinc-600/10 text-zinc-600 border border-zinc-600/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                        }`}>
                                            {day.isWeekend ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => toggleDay(day.id)}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${day.isWeekend ? 'bg-zinc-800' : 'bg-zinc-600'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${day.isWeekend ? 'translate-x-5' : 'translate-x-1'}`} />
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
