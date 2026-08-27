'use client';

import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LmsSettingsPage() {
  const [settings, setSettings] = useState({
    adminCommission: '0',
    teacherCommission: '100',
    showReviewOption: 'Enable',
    showInstructorReview: 'Enable',
    showQaOption: 'Enable',
    lmsCheckout: 'Enable',
    payLater: 'Disable',
    payLaterDueDay: '10',
    payLaterMessage: 'Hello Your Payment Will Be Add Into Fees',
    hosts: ['Self', 'Youtube', 'URL', 'Vimeo', 'Iframe', 'Image', 'PDF', 'Word', 'Excel', 'PowerPoint', 'Text', 'Zip'],
    showInstructorEnrolled: 'Enable',
    autoApproveCourse: 'Disable',
    showInstructorCourses: 'Enable',
    lessonCompleteManually: 'Disable',
    videoSeekBar: 'Disable',
    youtubeDefaultPlayer: 'No'
  });

  const handleUpdate = (section) => {
    alert(`${section} settings updated successfully!`);
  };

  const RadioGroup = ({ name, value, onChange }) => (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${value === 'Enable' ? 'border-emerald-500' : 'border-zinc-700'}`}>
          {value === 'Enable' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
        </div>
        <span className="text-sm text-zinc-400 group-hover:text-zinc-300">Enable</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${value === 'Disable' ? 'border-emerald-500' : 'border-zinc-700'}`}>
          {value === 'Disable' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
        </div>
        <span className="text-sm text-zinc-400 group-hover:text-zinc-300">Disable</span>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">LMS Settings</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Settings</span>
        </div>
      </div>

      {/* 1. Commission Settings */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Commission Settings</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-sm font-semibold text-zinc-400 uppercase">COMMISSION PERCENTAGE</div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400">Admin Commission %</Label>
              <Input 
                value={settings.adminCommission}
                onChange={(e) => setSettings({...settings, adminCommission: e.target.value})}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400">Teacher Commission %</Label>
              <Input 
                value={settings.teacherCommission}
                onChange={(e) => setSettings({...settings, teacherCommission: e.target.value})}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => handleUpdate('Commission')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> UPDATE
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Review & QA Setting */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Review & QA Setting</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400 uppercase">SHOW REVIEW OPTION</span>
              <RadioGroup 
                value={settings.showReviewOption} 
                onChange={(val) => setSettings({...settings, showReviewOption: val})} 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400 uppercase">SHOW INSTRUCTOR REVIEW</span>
              <RadioGroup 
                value={settings.showInstructorReview} 
                onChange={(val) => setSettings({...settings, showInstructorReview: val})} 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400 uppercase">SHOW QA OPTION</span>
              <RadioGroup 
                value={settings.showQaOption} 
                onChange={(val) => setSettings({...settings, showQaOption: val})} 
              />
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Button onClick={() => handleUpdate('Review & QA')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> UPDATE
            </Button>
          </div>
        </div>
      </div>

      {/* 3. lms.lms_checkout */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">lms.lms_checkout</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-12">
            <span className="text-sm font-semibold text-zinc-400 uppercase">LMS CHECKOUT OPTION</span>
            <RadioGroup 
              value={settings.lmsCheckout} 
              onChange={(val) => setSettings({...settings, lmsCheckout: val})} 
            />
          </div>
          <div className="mt-8 flex justify-center">
            <Button onClick={() => handleUpdate('Checkout')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> UPDATE
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Pay Later Setting */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Pay Later Setting</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400 uppercase">PAY LATER</span>
              <RadioGroup 
                value={settings.payLater} 
                onChange={(val) => setSettings({...settings, payLater: val})} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400">Pay Later Due Day</Label>
              <Input 
                value={settings.payLaterDueDay}
                onChange={(e) => setSettings({...settings, payLaterDueDay: e.target.value})}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
              />
            </div>
          </div>
          <div className="mt-6 space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400">Pay Later Message</Label>
            <Input 
              value={settings.payLaterMessage}
              onChange={(e) => setSettings({...settings, payLaterMessage: e.target.value})}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
            />
          </div>
          <div className="mt-8 flex justify-center">
            <Button onClick={() => handleUpdate('Pay Later')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> UPDATE
            </Button>
          </div>
        </div>
      </div>

      {/* 5. Host Settings */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Host Settings</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {['Self', 'Youtube', 'URL', 'Vimeo', 'Iframe', 'Image', 'PDF', 'Word', 'Excel', 'PowerPoint', 'Text', 'Zip'].map((host) => (
              <label key={host} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${settings.hosts.includes(host) ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-700 bg-zinc-900'}`}>
                  {settings.hosts.includes(host) && <Check className="h-3 w-3" />}
                </div>
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300">{host}</span>
              </label>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button onClick={() => handleUpdate('Host')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> UPDATE
            </Button>
          </div>
        </div>
      </div>

      {/* 6. Others Settings */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Others Settings</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400 uppercase">SHOW INSTRUCTOR ENROLLED</span>
              <RadioGroup 
                value={settings.showInstructorEnrolled} 
                onChange={(val) => setSettings({...settings, showInstructorEnrolled: val})} 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400 uppercase">AUTO APPROVE COURSE</span>
              <RadioGroup 
                value={settings.autoApproveCourse} 
                onChange={(val) => setSettings({...settings, autoApproveCourse: val})} 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400 uppercase">SHOW INSTRUCTOR COURSES</span>
              <RadioGroup 
                value={settings.showInstructorCourses} 
                onChange={(val) => setSettings({...settings, showInstructorCourses: val})} 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400 uppercase">LESSON COMPLETE MANUALLY</span>
              <RadioGroup 
                value={settings.lessonCompleteManually} 
                onChange={(val) => setSettings({...settings, lessonCompleteManually: val})} 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400 uppercase">VIDEO SEEK BAR</span>
              <RadioGroup 
                value={settings.videoSeekBar} 
                onChange={(val) => setSettings({...settings, videoSeekBar: val})} 
              />
            </div>
          </div>
          
          <div className="mt-8 max-w-sm space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">YOUTUBE DEFAULT PLAYER</Label>
            <select 
              value={settings.youtubeDefaultPlayer}
              onChange={(e) => setSettings({...settings, youtubeDefaultPlayer: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div className="mt-8 flex justify-center">
            <Button onClick={() => handleUpdate('Others')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> UPDATE
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
