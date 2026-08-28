'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddCoursePage() {
  const [dripContent, setDripContent] = useState(false);
  const [completeSequence, setCompleteSequence] = useState(false);
  const [isFree, setIsFree] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Add Course</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Add Course</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
          
          {/* Drip Content Toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Drip Content</Label>
            <div className="flex items-center gap-4">
              {['No', 'Yes'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setDripContent(opt === 'Yes')}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                      (dripContent && opt === 'Yes') || (!dripContent && opt === 'No')
                        ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-500'
                    }`}>
                    {((dripContent && opt === 'Yes') || (!dripContent && opt === 'No')) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-zinc-300">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Teachers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Assign Teacher</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="">Select Teacher</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Assistant Teacher</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="">Select</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Title <span className="text-rose-500">*</span></Label>
            <Input placeholder="Title" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
          </div>

          {/* Prerequisites */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Prerequisites</Label>
            <div className="min-h-[100px] rounded-md border border-zinc-800 bg-zinc-900 p-3">
              <div className="flex flex-wrap gap-2 text-zinc-600 text-xs border-b border-zinc-800 pb-2 mb-2">
                <span className="cursor-pointer hover:text-zinc-400">B</span>
                <span className="cursor-pointer hover:text-zinc-400 italic">I</span>
                <span className="cursor-pointer hover:text-zinc-400 underline">U</span>
                <span className="cursor-pointer hover:text-zinc-400 line-through">S</span>
              </div>
              <textarea className="w-full bg-transparent text-white text-sm outline-none resize-none min-h-[60px] placeholder:text-zinc-600" placeholder="Write prerequisites here..." />
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Overview</Label>
            <div className="min-h-[100px] rounded-md border border-zinc-800 bg-zinc-900 p-3">
              <div className="flex flex-wrap gap-2 text-zinc-600 text-xs border-b border-zinc-800 pb-2 mb-2">
                <span className="cursor-pointer hover:text-zinc-400">B</span>
                <span className="cursor-pointer hover:text-zinc-400 italic">I</span>
                <span className="cursor-pointer hover:text-zinc-400 underline">U</span>
                <span className="cursor-pointer hover:text-zinc-400 line-through">S</span>
              </div>
              <textarea className="w-full bg-transparent text-white text-sm outline-none resize-none min-h-[60px] placeholder:text-zinc-600" placeholder="Write overview here..." />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Description</Label>
            <div className="min-h-[100px] rounded-md border border-zinc-800 bg-zinc-900 p-3">
              <div className="flex flex-wrap gap-2 text-zinc-600 text-xs border-b border-zinc-800 pb-2 mb-2">
                <span className="cursor-pointer hover:text-zinc-400">B</span>
                <span className="cursor-pointer hover:text-zinc-400 italic">I</span>
                <span className="cursor-pointer hover:text-zinc-400 underline">U</span>
                <span className="cursor-pointer hover:text-zinc-400 line-through">S</span>
              </div>
              <textarea className="w-full bg-transparent text-white text-sm outline-none resize-none min-h-[60px] placeholder:text-zinc-600" placeholder="Write description here..." />
            </div>
          </div>

          {/* Category / Class / Section / Subject / Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Course Category <span className="text-rose-500">*</span></Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="">Course Category *</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Sub Category</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="">Select Sub Category</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Class</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="">Select Class</option>
                <option value="1">Class 1</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Section</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="">Select Section</option>
                <option value="A">A</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Subject</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="">Select Subject</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Mode of Delivery <span className="text-rose-500">*</span></Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Level / Sequence / View */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Level</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Complete Course Sequence</Label>
              <div className="flex items-center gap-4 pt-2">
                {['No', 'Yes'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setCompleteSequence(opt === 'Yes')}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                        (completeSequence && opt === 'Yes') || (!completeSequence && opt === 'No')
                          ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-500'
                      }`}>
                      {((completeSequence && opt === 'Yes') || (!completeSequence && opt === 'No')) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-zinc-300">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">View Scope</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>

          {/* Duration / Certificate / Preview Image */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Duration (LMS in Minutes)</Label>
              <Input type="number" placeholder="Duration in minutes" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Certificate</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <option value="">Certificate</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Preview Image</Label>
              <div className="flex items-center gap-2">
                <Input type="text" placeholder="Preview Image" readOnly className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
                <Button type="button" variant="secondary" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 text-xs font-semibold">BROWSE</Button>
              </div>
            </div>
          </div>

          {/* Price / Discount / Free */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-950 text-emerald-600 focus:ring-emerald-600 h-4 w-4 cursor-pointer" />
                <span className="text-sm text-zinc-300">This course is a free course</span>
              </label>
            </div>
          </div>

          {!isFree && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Price <span className="text-rose-500">*</span></Label>
                <Input type="number" placeholder="Price" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Discount Price</Label>
                <Input type="number" placeholder="Discount Price" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
            </div>
          )}

          {/* Related Course */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Related Course</Label>
            <select className="flex h-10 w-full sm:w-1/3 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select</option>
            </select>
          </div>

          {/* Meta */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Meta Keywords</Label>
            <Input placeholder="Meta Keywords" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Meta Description</Label>
            <textarea className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 resize-y" placeholder="Meta Description" />
          </div>

          <div className="flex justify-center pt-4">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10">
              <Plus className="h-4 w-4 mr-2" /> ADD COURSE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
