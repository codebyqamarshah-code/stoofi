'use client';
import { useState } from 'react';

export default function HeaderOption() {
    const [websiteEnabled, setWebsiteEnabled] = useState(true);
    const [dashboardEnabled, setDashboardEnabled] = useState(true);
    const [languageEnabled, setLanguageEnabled] = useState(true);
    const [customUrl, setCustomUrl] = useState('');

    const Toggle = ({ checked, onChange }) => (
        <button 
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-zinc-800' : 'bg-zinc-700'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
            <div className="mb-6">
                <div className="text-xs text-zinc-400 mb-1 flex space-x-2">
                    <span>Dashboard</span>
                    <span>&gt;</span>
                    <span>System Settings</span>
                    <span>&gt;</span>
                    <span className="text-zinc-100">Header Option</span>
                </div>
                <h1 className="text-2xl font-semibold">Header Option</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Website</span>
                            <Toggle checked={websiteEnabled} onChange={() => setWebsiteEnabled(!websiteEnabled)} />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Custom URL</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                                placeholder="https://example.com"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                            />
                        </div>

                        <div>
                            <button className="px-6 py-2 bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-medium rounded-md transition-colors">
                                UPDATE
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm h-fit">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <span className="text-sm font-medium">Dashboard</span>
                            <Toggle checked={dashboardEnabled} onChange={() => setDashboardEnabled(!dashboardEnabled)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Language</span>
                            <Toggle checked={languageEnabled} onChange={() => setLanguageEnabled(!languageEnabled)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
