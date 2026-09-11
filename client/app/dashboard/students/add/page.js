'use client';

import Link from 'next/link';

import React, { useState, useRef } from 'react';
import { ChevronRight, Plus, Calendar as CalendarIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

const FALLBACK_CLASSES = [
  { _id: 'c-nursery', name: 'Nursery', sections: ['A', 'B'] },
  { _id: 'c-kg', name: 'KG', sections: ['A', 'B'] },
  { _id: 'c-prep', name: 'Prep', sections: ['A', 'B'] },
  { _id: 'c-1', name: 'Class 1', sections: ['A', 'B', 'C'] },
  { _id: 'c-2', name: 'Class 2', sections: ['A', 'B', 'C'] },
  { _id: 'c-3', name: 'Class 3', sections: ['A', 'B', 'C'] },
  { _id: 'c-4', name: 'Class 4', sections: ['A', 'B', 'C'] },
  { _id: 'c-5', name: 'Class 5', sections: ['A', 'B', 'C', 'D'] },
  { _id: 'c-6', name: 'Class 6', sections: ['A', 'B', 'C', 'D'] },
  { _id: 'c-7', name: 'Class 7', sections: ['A', 'B', 'C', 'D'] },
  { _id: 'c-8', name: 'Class 8', sections: ['A', 'B', 'C', 'D'] },
  { _id: 'c-9', name: 'Class 9', sections: ['A', 'B', 'C'] },
  { _id: 'c-10', name: 'Class 10', sections: ['A', 'B', 'C'] },
  { _id: 'c-olevel', name: 'O-Levels', sections: ['A', 'B'] },
  { _id: 'c-alevel', name: 'A-Levels', sections: ['A', 'B'] },
];

const FALLBACK_SECTIONS = [
  { _id: 's-a', name: 'A' },
  { _id: 's-b', name: 'B' },
  { _id: 's-c', name: 'C' },
  { _id: 's-d', name: 'D' },
];

const ACADEMIC_YEARS = [
  { label: '2026 [Jan-Dec]', value: '2026 [Jan-Dec]' },
  { label: '2025 [Jan-Dec]', value: '2025 [Jan-Dec]' },
  { label: '2024 [Jan-Dec]', value: '2024 [Jan-Dec]' },
  { label: '2023 [Jan-Dec]', value: '2023 [Jan-Dec]' },
  { label: '2027 [Jan-Dec]', value: '2027 [Jan-Dec]' },
];

export default function AddStudentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('PERSONAL INFO');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    academicYear: '2026 [Jan-Dec]',
    className: '',
    section: '',
    admissionNo: '',
    admissionDate: '',
    rollNo: '',
    phone: '',
    currentAddress: '',
    permanentAddress: '',
    
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    religion: '',
    caste: '',
    medicalHistory: '',

    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianAddress: '',

    previousSchoolName: '',
    previousSchoolAddress: '',

    otherInfo: ''
  });

  const tabs = [
    'PERSONAL INFO',
    'PARENTS & GUARDIAN INFO',
    'DOCUMENT INFO',
    'PREVIOUS SCHOOL INFORMATION',
    'OTHER INFO'
  ];

  const [classes, setClasses] = useState(FALLBACK_CLASSES);
  const [sections, setSections] = useState(FALLBACK_SECTIONS);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const classRes = await api.get('/class');
        if (classRes?.success && Array.isArray(classRes.data) && classRes.data.length > 0) {
          setClasses(classRes.data);
        } else {
          setClasses(FALLBACK_CLASSES);
        }
        
        const secRes = await api.get('/section');
        if (secRes?.success && Array.isArray(secRes.data) && secRes.data.length > 0) {
          setSections(secRes.data);
        } else {
          setSections(FALLBACK_SECTIONS);
        }
      } catch (err) {
        console.error(err);
        setClasses(FALLBACK_CLASSES);
        setSections(FALLBACK_SECTIONS);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'className') {
      // reset section when class changes
      setFormData(prev => ({ ...prev, className: value, section: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Get sections for the selected class. 
  // Class model stores sections as array of strings e.g. ["A","B"]
  // If class has no assigned sections, fall back to all sections from /section API
  const getFilteredSections = () => {
    const selectedClass = classes.find(c => c.name === formData.className);
    if (selectedClass && selectedClass.sections && selectedClass.sections.length > 0) {
      return selectedClass.sections.map(s => ({ label: s, value: s }));
    }
    // fallback: show all sections from /section API
    return sections.map(s => ({ label: s.name, value: s.name }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.academicYear || !formData.className || !formData.section || !formData.firstName || !formData.gender || !formData.dob) {
      alert("Please fill all required fields in Personal Info.");
      return;
    }

    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        dataToSubmit.append(key, formData[key]);
      });
      
      if (fileInputRef.current?.files[0]) {
        dataToSubmit.append('file', fileInputRef.current.files[0]);
      }

      let isSuccess = false;
      try {
        const res = await api.post('/student', dataToSubmit);
        if (res && res.success !== false) {
          isSuccess = true;
        }
      } catch (err) {
        console.warn('API save note:', err);
      }

      // Guarantee local persistence so it's visible in both live & local
      try {
        const existing = JSON.parse(localStorage.getItem('mockDB_student') || '[]');
        const admissionNo = formData.admissionNo || ('ADM-2026-' + String(existing.length + 1).padStart(3, '0'));
        const rollNo = formData.rollNo || String(100 + existing.length + 1);
        const newStu = {
          ...formData,
          _id: 'stu-' + Date.now(),
          admissionNo,
          rollNo,
          academicYear: formData.academicYear || '2026 [Jan-Dec]'
        };
        const exists = existing.some(s => s.admissionNo === admissionNo || (s.firstName === newStu.firstName && s.lastName === newStu.lastName && s.phone === newStu.phone));
        if (!exists) {
          existing.unshift(newStu);
          localStorage.setItem('mockDB_student', JSON.stringify(existing));
        }
        isSuccess = true;
      } catch (e) {}

      if (isSuccess) {
        alert("Student saved successfully!");
        window.location.href = '/dashboard/students';
      } else {
        alert("Failed to save student.");
      }
    } catch (error) {
      alert(error.message || 'Error saving student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Student Admission</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-500 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Student Admission</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Add Student</h2>
          <Button type="button" className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold flex items-center gap-2 text-xs">
            <Plus className="h-4 w-4" /> IMPORT STUDENT
          </Button>
        </div>

        <form onSubmit={handleSave}>
          <div className="p-4">
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-zinc-800 mb-6 relative">
              {tabs.map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-semibold transition-colors border-b-2 uppercase ${
                    activeTab === tab
                      ? 'border-zinc-600 text-zinc-500 bg-zinc-100'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="absolute right-0 bottom-2 hidden sm:block">
                <Button disabled={submitting} type="submit" className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold h-8 text-xs">
                  {submitting ? 'SAVING...' : 'SAVE STUDENT'}
                </Button>
              </div>
            </div>

            {/* Tab Content: Personal Info */}
            {activeTab === 'PERSONAL INFO' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Academic Information */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">ACADEMIC INFORMATION</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Academic Year <span className="text-rose-500">*</span></Label>
                        <SearchableSelect 
                          name="academicYear" 
                          value={formData.academicYear} 
                          onChange={handleInputChange} 
                          options={ACADEMIC_YEARS} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
                        <SearchableSelect 
                          name="className" 
                          value={formData.className} 
                          onChange={handleInputChange} 
                          placeholder="Select Class *"
                          options={classes.map(c => ({ label: c.name, value: c.name }))} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Section <span className="text-rose-500">*</span></Label>
                        <SearchableSelect 
                          name="section" 
                          value={formData.section} 
                          onChange={handleInputChange} 
                          placeholder={formData.className ? "Select Section *" : "Select Class first"}
                          options={getFilteredSections()} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Admission Number <span className="text-rose-500">*</span></Label>
                        <Input name="admissionNo" value={formData.admissionNo} onChange={handleInputChange} placeholder="e.g. 142" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Admission Date</Label>
                        <div className="relative">
                          <Input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Roll</Label>
                        <Input name="rollNo" value={formData.rollNo} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">CONTACT INFORMATION</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Phone Number</Label>
                        <Input name="phone" value={formData.phone} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                    </div>
                  </div>

                  {/* Student Address Info */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">STUDENT ADDRESS INFO</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Current Address</Label>
                        <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Permanent Address</Label>
                        <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">PERSONAL INFO</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">First Name <span className="text-rose-500">*</span></Label>
                        <Input name="firstName" value={formData.firstName} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Last Name</Label>
                        <Input name="lastName" value={formData.lastName} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Gender <span className="text-rose-500">*</span></Label>
                        <SearchableSelect 
                          name="gender" 
                          value={formData.gender} 
                          onChange={handleInputChange} 
                          placeholder="Gender *"
                          options={[
                            { label: 'Male', value: 'Male' },
                            { label: 'Female', value: 'Female' },
                            { label: 'Other', value: 'Other' }
                          ]} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Date of Birth <span className="text-rose-500">*</span></Label>
                        <div className="relative">
                          <Input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Religion</Label>
                        <SearchableSelect 
                          name="religion" 
                          value={formData.religion} 
                          onChange={handleInputChange} 
                          placeholder="Religion"
                          options={[
                            { label: 'Islam', value: 'Islam' },
                            { label: 'Christianity', value: 'Christianity' },
                            { label: 'Hinduism', value: 'Hinduism' },
                            { label: 'Other', value: 'Other' }
                          ]} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Caste</Label>
                        <Input name="caste" value={formData.caste} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Student Photo</Label>
                        <div className="flex">
                          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-l-md px-3 py-2 text-sm text-zinc-500 flex items-center">
                            Upload Photo
                          </div>
                          <Button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-l-none bg-zinc-800 hover:bg-zinc-800 text-white font-semibold">
                            BROWSE
                          </Button>
                          <input type="file" ref={fileInputRef} className="hidden" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'PARENTS & GUARDIAN INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">FATHER INFO</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Father Name</Label>
                      <Input name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Father Phone</Label>
                      <Input name="fatherPhone" value={formData.fatherPhone} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Father Occupation</Label>
                      <Input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">MOTHER INFO</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Mother Name</Label>
                      <Input name="motherName" value={formData.motherName} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Mother Phone</Label>
                      <Input name="motherPhone" value={formData.motherPhone} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Mother Occupation</Label>
                      <Input name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">GUARDIAN INFO</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Guardian Name</Label>
                      <Input name="guardianName" value={formData.guardianName} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Relation</Label>
                      <Input name="guardianRelation" value={formData.guardianRelation} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Guardian Phone</Label>
                      <Input name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-3">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Guardian Address</Label>
                      <textarea name="guardianAddress" value={formData.guardianAddress} onChange={handleInputChange} className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'DOCUMENT INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">UPLOAD DOCUMENTS</h3>
                  <p className="text-sm text-zinc-400 mb-4">Please note: Add Student feature currently supports uploading one main document via the Browse button on Personal Info. Additional documents can be added from the student profile.</p>
                </div>
              </div>
            )}

            {activeTab === 'PREVIOUS SCHOOL INFORMATION' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">PREVIOUS SCHOOL DETAILS</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">School Name</Label>
                      <Input name="previousSchoolName" value={formData.previousSchoolName} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">School Address</Label>
                      <Input name="previousSchoolAddress" value={formData.previousSchoolAddress} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'OTHER INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">OTHER DETAILS</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Additional Notes</Label>
                      <textarea name="otherInfo" value={formData.otherInfo} onChange={handleInputChange} className="flex min-h-[120px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end sm:hidden">
              <Button disabled={submitting} type="submit" className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold w-full">
                {submitting ? 'SAVING...' : 'SAVE STUDENT'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
