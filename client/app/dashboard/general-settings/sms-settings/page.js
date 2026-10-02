'use client';
import { useState } from 'react';

export default function SmsSettings() {
    const tabs = ['SELECT A SMS SERVICE', 'TWILIO', 'MSG91', 'TEXTLOCAL', 'AFRICATALKING', 'MOBILE SMS', 'CUSTOM SMS'];
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [service, setService] = useState('');
    const [number, setNumber] = useState('');

    return (
        <div className="space-y-6 p-6 text-zinc-100">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Sms Settings</h1>
            </div>
            
            <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm">
                <div className="border-b border-zinc-200 px-6 py-4">
                    <h2 className="text-lg font-medium">Select A SMS Service</h2>
                </div>
                
                <div className="px-6 py-4 border-b border-zinc-200 flex space-x-4 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                                activeTab === tab ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-100'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6 max-w-2xl">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm text-zinc-900 font-semibold mb-2">SELECT A SMS SERVICE *</label>
                            <select 
                                className="w-full p-2.5 rounded-md bg-white border border-zinc-200 shadow-xs text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                            >
                                <option value="">Select Service</option>
                                <option value="twilio">Twilio</option>
                                <option value="msg91">Msg91</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-900 font-semibold mb-2">RECIVER NUMBER</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 rounded-md bg-white border border-zinc-200 shadow-xs text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                                placeholder="Enter Number"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <button className="px-6 py-2 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 text-sm font-medium rounded-md transition-colors">
                                SEND TEST SMS
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
