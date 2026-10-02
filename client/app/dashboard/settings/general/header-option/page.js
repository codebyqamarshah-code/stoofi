'use client';
import { useState } from 'react';

export default function HeaderOption() {
    const [websiteEnabled, setWebsiteEnabled] = useState(true);
    const [dashboardEnabled, setDashboardEnabled] = useState(true);
    const [languageEnabled, setLanguageEnabled] = useState(true);
    const [customUrl, setCustomUrl] = useState('');

    const Toggle = ({ checked, onChange }) => (
        <button 
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${checked ? 'bg-zinc-950' : 'bg-zinc-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="mb-6">
                <div className="text-xs font-semibold text-zinc-600 mb-1 flex items-center space-x-2">
                    <span>Dashboard</span>
                    <span>&gt;</span>
                    <span>System Settings</span>
                    <span>&gt;</span>
                    <span className="text-zinc-950 font-bold">Header Option</span>
                </div>
                <h1 className="text-2xl font-bold text-zinc-950">Header Option</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-950">Website</span>
                            <Toggle checked={websiteEnabled} onChange={() => setWebsiteEnabled(!websiteEnabled)} />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">Custom URL</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 rounded-lg bg-white border border-zinc-300 text-sm font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                placeholder="https://example.com"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                            />
                        </div>

                        <div>
                            <button className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer">
                                UPDATE
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl shadow-xs h-fit">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                            <span className="text-sm font-bold text-zinc-950">Dashboard</span>
                            <Toggle checked={dashboardEnabled} onChange={() => setDashboardEnabled(!dashboardEnabled)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-950">Language</span>
                            <Toggle checked={languageEnabled} onChange={() => setLanguageEnabled(!languageEnabled)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
