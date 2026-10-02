'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import api from '@/services/api';

export default function TeacherEvaluationSettingsPage() {
    const [evaluation, setEvaluation] = useState('Enable');
    const [evaluationApproval, setEvaluationApproval] = useState('Auto');
    
    const [submittedBy, setSubmittedBy] = useState('Student');
    const [submissionTime, setSubmissionTime] = useState('Any Time');

    const handleSaveSettings = async (type) => {
        try {
            if (type === 'evaluation') {
                await api.post('/teacher-evaluation-settings', {
                    evaluation,
                    evaluationApproval
                });
                alert('Evaluation settings saved!');
            } else if (type === 'submission') {
                await api.post('/teacher-evaluation-settings', {
                    submittedBy,
                    submissionTime
                });
                alert('Submission settings saved!');
            }
        } catch (error) {
            console.error('Error saving settings', error);
            alert('Failed to save settings');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-zinc-950">Teacher Evaluation Setting</h1>
                <div className="flex items-center text-sm text-zinc-500 font-medium">
                    <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
                    <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
                    <span>Teacher Evaluation</span>
                    <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
                    <span className="text-zinc-900 font-semibold">Settings</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card 1: Evaluation Settings */}
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                        <h2 className="text-base font-bold text-zinc-950">Evaluation Settings</h2>
                    </div>
                    
                    <div className="p-6 flex-1 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">Evaluation</label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-800 font-medium">
                                    <input 
                                        type="radio" 
                                        name="evaluation" 
                                        value="Enable" 
                                        checked={evaluation === 'Enable'}
                                        onChange={(e) => setEvaluation(e.target.value)}
                                        className="text-zinc-900 focus:ring-zinc-800 border-zinc-300"
                                    />
                                    <span>Enable</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-800 font-medium">
                                    <input 
                                        type="radio" 
                                        name="evaluation" 
                                        value="Disable" 
                                        checked={evaluation === 'Disable'}
                                        onChange={(e) => setEvaluation(e.target.value)}
                                        className="text-zinc-900 focus:ring-zinc-800 border-zinc-300"
                                    />
                                    <span>Disable</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">Evaluation Approval</label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-800 font-medium">
                                    <input 
                                        type="radio" 
                                        name="approval" 
                                        value="Auto" 
                                        checked={evaluationApproval === 'Auto'}
                                        onChange={(e) => setEvaluationApproval(e.target.value)}
                                        className="text-zinc-900 focus:ring-zinc-800 border-zinc-300"
                                    />
                                    <span>Auto</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-800 font-medium">
                                    <input 
                                        type="radio" 
                                        name="approval" 
                                        value="Manual" 
                                        checked={evaluationApproval === 'Manual'}
                                        onChange={(e) => setEvaluationApproval(e.target.value)}
                                        className="text-zinc-900 focus:ring-zinc-800 border-zinc-300"
                                    />
                                    <span>Manual</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-zinc-100 flex justify-center bg-zinc-50/30">
                        <button 
                            onClick={() => handleSaveSettings('evaluation')}
                            className="px-8 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold rounded-lg transition-colors shadow-xs"
                        >
                            SAVE
                        </button>
                    </div>
                </div>

                {/* Card 2: Submission Settings */}
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                        <h2 className="text-base font-bold text-zinc-950">Submission Settings</h2>
                    </div>
                    
                    <div className="p-6 flex-1 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">Submitted By</label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-800 font-medium">
                                    <input 
                                        type="radio" 
                                        name="submittedBy" 
                                        value="Student" 
                                        checked={submittedBy === 'Student'}
                                        onChange={(e) => setSubmittedBy(e.target.value)}
                                        className="text-zinc-900 focus:ring-zinc-800 border-zinc-300"
                                    />
                                    <span>Student</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-800 font-medium">
                                    <input 
                                        type="radio" 
                                        name="submittedBy" 
                                        value="Parent" 
                                        checked={submittedBy === 'Parent'}
                                        onChange={(e) => setSubmittedBy(e.target.value)}
                                        className="text-zinc-900 focus:ring-zinc-800 border-zinc-300"
                                    />
                                    <span>Parent</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">Submission Time</label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-800 font-medium">
                                    <input 
                                        type="radio" 
                                        name="submissionTime" 
                                        value="Any Time" 
                                        checked={submissionTime === 'Any Time'}
                                        onChange={(e) => setSubmissionTime(e.target.value)}
                                        className="text-zinc-900 focus:ring-zinc-800 border-zinc-300"
                                    />
                                    <span>Any Time</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-800 font-medium">
                                    <input 
                                        type="radio" 
                                        name="submissionTime" 
                                        value="Fixed Time" 
                                        checked={submissionTime === 'Fixed Time'}
                                        onChange={(e) => setSubmissionTime(e.target.value)}
                                        className="text-zinc-900 focus:ring-zinc-800 border-zinc-300"
                                    />
                                    <span>Fixed Time</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-zinc-100 flex justify-center bg-zinc-50/30">
                        <button 
                            onClick={() => handleSaveSettings('submission')}
                            className="px-8 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold rounded-lg transition-colors shadow-xs"
                        >
                            SAVE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
