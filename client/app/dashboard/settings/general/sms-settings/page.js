'use client';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function SmsSettings() {
    const tabs = ['SELECT A SMS SERVICE', 'TWILIO', 'MSG91', 'TEXTLOCAL', 'AFRICATALKING', 'MOBILE SMS', 'CUSTOM SMS'];
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [service, setService] = useState('');
    const [number, setNumber] = useState('');

    return (
        <div className="min-h-screen bg-white p-6 text-zinc-950">
            <div className="mb-6">
                <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
                    <span>Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>General Settings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-zinc-950 font-bold">SMS Settings</span>
                </div>
                <h1 className="text-2xl font-bold text-zinc-950">SMS Settings</h1>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
                <div className="border-b border-zinc-200 px-6 py-4">
                    <h2 className="text-sm font-bold text-zinc-950">Select A SMS Gateway</h2>
                </div>
                
                <div className="px-6 py-3 border-b border-zinc-200 flex gap-2 overflow-x-auto bg-zinc-50">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap rounded-lg transition-colors cursor-pointer ${
                                activeTab === tab ? 'bg-white text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6 max-w-2xl">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">SELECT A SMS SERVICE *</label>
                            <select 
                                className="w-full p-2.5 rounded-lg bg-white border border-zinc-300 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                            >
                                <option value="">Select Service Gateway</option>
                                <option value="twilio">Twilio</option>
                                <option value="msg91">Msg91</option>
                                <option value="textlocal">TextLocal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">RECEIVER NUMBER</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 rounded-lg bg-white border border-zinc-300 text-sm font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                placeholder="e.g. +923001234567"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <button className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer">
                                SEND TEST SMS
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
