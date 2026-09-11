'use client';
import React, { useState } from 'react';
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
        <div className="min-h-screen bg-zinc-950 p-6">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-zinc-400 mb-6">
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span>Teacher Evaluation</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-zinc-100">Settings</span>
            </div>

            <h1 className="text-2xl font-semibold text-white mb-6">Teacher Evaluation Setting</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card 1: Evaluation Settings */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col h-full">
                    <h2 className="text-lg font-medium text-zinc-100 mb-6 border-b border-zinc-800 pb-2">Evaluation Settings</h2>
                    
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-3">Evaluation</label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-300">
                                    <input 
                                        type="radio" 
                                        name="evaluation" 
                                        value="Enable" 
                                        checked={evaluation === 'Enable'}
                                        onChange={(e) => setEvaluation(e.target.value)}
                                        className="text-zinc-600 focus:ring-zinc-600 bg-zinc-800 border-zinc-700"
                                    />
                                    <span>Enable</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-300">
                                    <input 
                                        type="radio" 
                                        name="evaluation" 
                                        value="Disable" 
                                        checked={evaluation === 'Disable'}
                                        onChange={(e) => setEvaluation(e.target.value)}
                                        className="text-zinc-600 focus:ring-zinc-600 bg-zinc-800 border-zinc-700"
                                    />
                                    <span>Disable</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-3">Evaluation Approval</label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-300">
                                    <input 
                                        type="radio" 
                                        name="approval" 
                                        value="Auto" 
                                        checked={evaluationApproval === 'Auto'}
                                        onChange={(e) => setEvaluationApproval(e.target.value)}
                                        className="text-zinc-600 focus:ring-zinc-600 bg-zinc-800 border-zinc-700"
                                    />
                                    <span>Auto</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-300">
                                    <input 
                                        type="radio" 
                                        name="approval" 
                                        value="Manual" 
                                        checked={evaluationApproval === 'Manual'}
                                        onChange={(e) => setEvaluationApproval(e.target.value)}
                                        className="text-zinc-600 focus:ring-zinc-600 bg-zinc-800 border-zinc-700"
                                    />
                                    <span>Manual</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => handleSaveSettings('evaluation')}
                            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-medium rounded transition-colors"
                        >
                            SAVE
                        </button>
                    </div>
                </div>

                {/* Card 2: Submission Settings */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col h-full">
                    <h2 className="text-lg font-medium text-zinc-100 mb-6 border-b border-zinc-800 pb-2">Submission Settings</h2>
                    
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-3">Submitted By</label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-300">
                                    <input 
                                        type="radio" 
                                        name="submittedBy" 
                                        value="Student" 
                                        checked={submittedBy === 'Student'}
                                        onChange={(e) => setSubmittedBy(e.target.value)}
                                        className="text-zinc-600 focus:ring-zinc-600 bg-zinc-800 border-zinc-700"
                                    />
                                    <span>Student</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-300">
                                    <input 
                                        type="radio" 
                                        name="submittedBy" 
                                        value="Parent" 
                                        checked={submittedBy === 'Parent'}
                                        onChange={(e) => setSubmittedBy(e.target.value)}
                                        className="text-zinc-600 focus:ring-zinc-600 bg-zinc-800 border-zinc-700"
                                    />
                                    <span>Parent</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-3">Submission Time</label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-300">
                                    <input 
                                        type="radio" 
                                        name="submissionTime" 
                                        value="Any Time" 
                                        checked={submissionTime === 'Any Time'}
                                        onChange={(e) => setSubmissionTime(e.target.value)}
                                        className="text-zinc-600 focus:ring-zinc-600 bg-zinc-800 border-zinc-700"
                                    />
                                    <span>Any Time</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer text-zinc-300">
                                    <input 
                                        type="radio" 
                                        name="submissionTime" 
                                        value="Fixed Time" 
                                        checked={submissionTime === 'Fixed Time'}
                                        onChange={(e) => setSubmissionTime(e.target.value)}
                                        className="text-zinc-600 focus:ring-zinc-600 bg-zinc-800 border-zinc-700"
                                    />
                                    <span>Fixed Time</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => handleSaveSettings('submission')}
                            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-medium rounded transition-colors"
                        >
                            SAVE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
