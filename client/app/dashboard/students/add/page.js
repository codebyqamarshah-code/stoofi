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
import StudentImportModal from '@/components/StudentImportModal';


const QUALIFICATION_LEVELS = [
  { label: 'Primary (Class 1-5)', value: 'Primary' },
  { label: 'Middle (Class 6-8)', value: 'Middle' },
  { label: 'Matriculation (SSC / O-Levels)', value: 'Matric' },
  { label: 'Intermediate (HSSC / F.Sc / F.A / I.Com / A-Levels)', value: 'Intermediate' },
  { label: 'Bachelors (BS / B.Sc / B.A / B.Com / B.Ed)', value: 'Graduation' },
  { label: 'Masters (MS / M.Sc / M.A / M.Com / MBA)', value: 'Master' },
  { label: 'MPhil / MS Research', value: 'M Phill' },
  { label: 'PhD / Doctorate', value: 'PHD' },
  { label: 'Two Year Diploma / DAE', value: 'Two Year Diploma' },
  { label: 'One Year Diploma', value: 'One Year Diploma' },
  { label: 'IT & Technical Certifications', value: 'IT Courses' },
  { label: 'Other Courses', value: 'Other Courses' }
];

const ACADEMIC_YEARS = [
  { label: '2027', value: '2027' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
];

const BLOOD_GROUPS = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
];

const STUDENT_TYPES = [
  { label: 'Regular', value: 'Regular' },
  { label: 'Private', value: 'Private' },
  { label: 'Scholarship', value: 'Scholarship' },
  { label: 'Hostelite', value: 'Hostelite' },
  { label: 'Day Scholar', value: 'Day Scholar' }
];


const DocumentPreview = ({ preview, error }) => {
  if (error) return <p className="text-rose-500 text-xs mt-1 font-semibold">{error}</p>;
  if (!preview) return null;
  return (
    <div className="mt-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-1 bg-white dark:bg-zinc-800 relative w-full h-32 overflow-hidden shadow-sm">
      {preview.type === 'application/pdf' ? (
        <iframe src={preview.url} className="w-full h-full rounded" />
      ) : (
        <img src={preview.url} alt="Document Preview" className="w-full h-full object-cover rounded" />
      )}
      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">VERIFIED</div>
    </div>
  );
};

export default function AddStudentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('PERSONAL INFO');
  const [submitting, setSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState('');
  const fileInputRef = useRef(null);

  const [docFiles, setDocFiles] = useState({ cnicFront: null, cnicBack: null, document1: null, qualificationDocument: null, previousSchoolDocument: null });
  
  const [docPreviews, setDocPreviews] = useState({ cnicFront: null, cnicBack: null, document1: null, qualificationDocument: null, previousSchoolDocument: null });
  const [docErrors, setDocErrors] = useState({ cnicFront: '', cnicBack: '', document1: '', qualificationDocument: '', previousSchoolDocument: '' });
  
  const handleDocChange = (e, docType) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Validate real document (basic MIME and size)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setDocErrors(prev => ({...prev, [docType]: 'Fake or invalid document. Only JPG, PNG, or PDF allowed.'}));
        setDocPreviews(prev => ({...prev, [docType]: null}));
        setDocFiles(prev => ({...prev, [docType]: null}));
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setDocErrors(prev => ({...prev, [docType]: 'File too large. Max 5MB allowed.'}));
        setDocPreviews(prev => ({...prev, [docType]: null}));
        setDocFiles(prev => ({...prev, [docType]: null}));
        return;
      }

      setDocErrors(prev => ({...prev, [docType]: ''}));
      setDocFiles(prev => ({...prev, [docType]: file}));
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setDocPreviews(prev => ({...prev, [docType]: { url: previewUrl, type: file.type }}));
    }
  };

const [formData, setFormData] = useState({
    academicYear: '2026',
    className: '',
    section: '',
    admissionNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    joiningDate: new Date().toISOString().split('T')[0],
    rollNo: '',
    type: 'Regular',
    phone: '',
    email: '',
    city: '',
    address: '',
    currentAddress: '',
    permanentAddress: '',
    
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '',
    religion: 'Islam',
    caste: '',
    bloodGroup: 'B+',
    nationality: 'Pakistani',
    cnic: '',
    emergencyContact: '',
    medicalHistory: '',

    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    fatherCnic: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianAddress: '',

    previousSchool: '',
    previousSchoolName: '',
    previousSchoolAddress: '',

    tcNo: '',
    remarks: '',
    otherInfo: ''
  });

  const tabs = [
    'PERSONAL INFO',
    'PARENTS & GUARDIAN INFO',
    'DOCUMENT INFO',
    'PREVIOUS SCHOOL INFORMATION',
    'OTHER INFO'
  ];

  const [classes, setClasses] = useState([]);
  useEffect(() => {
    const fetchDynamicClasses = async () => {
      try {
        const res = await api.get('/class');
        if (res && res.success) {
          setClasses(res.data);
        }
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    fetchDynamicClasses();
  }, []);

  const [sections, setSections] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const classRes = await api.get('/class');
        if (classRes?.success && Array.isArray(classRes.data) && classRes.data.length > 0) {
          const sortedClasses = classRes.data.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
          setClasses(sortedClasses);
        } else {
          setClasses([]);
        }
        
        const secRes = await api.get('/section');
        if (secRes?.success && Array.isArray(secRes.data) && secRes.data.length > 0) {
          setSections(secRes.data);
        } else {
          setSections([]);
        }

        // Auto-generate next admission number
        const stRes = await api.get('/student', { params: { limit: 1 } });
        if (stRes?.pagination?.total !== undefined) {
          const nextAdm = `ADM-2026-${String(stRes.pagination.total + 1).padStart(3, '0')}`;
          setFormData(prev => ({ ...prev, admissionNo: prev.admissionNo || nextAdm }));
        }
      } catch (err) {
        console.error(err);
        setClasses([]);
        setSections([]);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'className') {
      setFormData(prev => ({ ...prev, className: value, section: '' }));
    } else if (name === 'currentAddress') {
      setFormData(prev => ({ ...prev, currentAddress: value, address: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPhotoName(e.target.files[0].name);
    }
  };

  const getFilteredSections = () => {
    const selectedClass = classes.find(c => c.name === formData.className);
      if (selectedClass && selectedClass.sections && selectedClass.sections.length > 0) {
        return selectedClass.sections.map(s => ({ label: s, value: s }));
      }
      return [];
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.academicYear || !formData.className || !formData.section || !formData.firstName || !formData.gender || !formData.dob) {
      alert("Please fill all required fields in Personal Info (Class, Section, First Name, Gender, Date of Birth).");
      return;
    }

    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          dataToSubmit.append(key, formData[key]);
        }
      });
      
      if (docFiles.cnicFront) dataToSubmit.append('cnicFront', docFiles.cnicFront);
      if (docFiles.cnicBack) dataToSubmit.append('cnicBack', docFiles.cnicBack);
      if (docFiles.document1) dataToSubmit.append('document1', docFiles.document1);
      if (docFiles.qualificationDocument) dataToSubmit.append('qualificationDocument', docFiles.qualificationDocument);
      if (docFiles.previousSchoolDocument) dataToSubmit.append('previousSchoolDocument', docFiles.previousSchoolDocument);
      
      if (fileInputRef.current?.files[0]) {
        dataToSubmit.append('file', fileInputRef.current.files[0]);
      }

      const res = await api.post('/student', dataToSubmit);
      if (res && res.success !== false) {
        alert("Student saved successfully!");
        router.push('/dashboard/students');
      } else {
        alert(res?.message || "Failed to save student.");
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

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-white">Add Student Profile</h2>
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              onClick={() => setIsImportModalOpen(true)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 font-bold flex items-center gap-2 cursor-pointer text-xs h-9 px-3.5 shadow-xs"
            >
              <Upload className="h-4 w-4 text-zinc-900" /> IMPORT STUDENT
            </Button>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="p-4 sm:p-6">
            {/* Tabs */}
            <div className="flex overflow-x-auto whitespace-nowrap border-b border-zinc-200 dark:border-zinc-800 mb-6 relative custom-scrollbar pb-1">
              {tabs.map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-semibold transition-colors border-b-2 uppercase ${
                      activeTab === tab
                        ? 'border-emerald-500 text-emerald-600 dark:text-white bg-emerald-50 dark:bg-zinc-900/80 font-bold'
                        : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40'
                    }`}
                >
                  {tab}
                </button>
              ))}
              <div className="absolute right-0 bottom-2 hidden sm:block">
                <Button disabled={submitting} type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold h-8 text-xs cursor-pointer">
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
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
                          <a href="/dashboard/class" className="text-xs font-bold text-emerald-500 hover:text-emerald-400 hover:underline flex items-center gap-1">
                            + Add Class
                          </a>
                        </div>
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
                        <Input name="admissionNo" value={formData.admissionNo} onChange={handleInputChange} placeholder="e.g. ADM-2026-001" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Admission Date</Label>
                        <Input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Roll Number</Label>
                        <Input name="rollNo" value={formData.rollNo} onChange={handleInputChange} placeholder="e.g. 101" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Student Type</Label>
                        <SearchableSelect 
                          name="type" 
                          value={formData.type} 
                          onChange={handleInputChange} 
                          options={STUDENT_TYPES} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">CONTACT INFORMATION</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Student Phone</Label>
                        <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="0300-1234567" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Student Email</Label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="student@example.com" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">City</Label>
                        <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Lahore / Karachi" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Emergency Contact</Label>
                        <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} placeholder="0321-7654321" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                    </div>
                  </div>

                  {/* Student Address Info */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">STUDENT ADDRESS</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Current Address</Label>
                        <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} placeholder="House / Street / Area..." className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Permanent Address</Label>
                        <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} placeholder="Permanent home town address..." className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">PERSONAL DETAILS</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">First Name <span className="text-rose-500">*</span></Label>
                        <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Last Name</Label>
                        <Input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
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
                        <Input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
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
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Blood Group</Label>
                        <SearchableSelect 
                          name="bloodGroup" 
                          value={formData.bloodGroup} 
                          onChange={handleInputChange} 
                          placeholder="Select Blood Group"
                          options={BLOOD_GROUPS} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Nationality</Label>
                        <Input name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="Pakistani" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">CNIC / B-Form Number</Label>
                        <Input name="cnic" value={formData.cnic} onChange={handleInputChange} placeholder="e.g. 35201-1234567-1" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Caste</Label>
                        <Input name="caste" value={formData.caste} onChange={handleInputChange} placeholder="Caste" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Student Photo</Label>
                        <div className="flex">
                          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-l-md px-3 py-2 text-sm text-zinc-300 flex items-center truncate">
                            {selectedPhotoName || 'Upload Photo (JPG, PNG)'}
                          </div>
                          <Button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-l-none bg-zinc-800 hover:bg-zinc-700 text-white font-semibold cursor-pointer">
                            BROWSE
                          </Button>
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Parents & Guardian Info */}
            {activeTab === 'PARENTS & GUARDIAN INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">FATHER INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Father Name</Label>
                      <Input name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father's full name" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Father Phone</Label>
                      <Input name="fatherPhone" value={formData.fatherPhone} onChange={handleInputChange} placeholder="0300-1234567" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Father Occupation</Label>
                      <Input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} placeholder="e.g. Businessman / Doctor" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Father CNIC</Label>
                      <Input name="fatherCnic" value={formData.fatherCnic} onChange={handleInputChange} placeholder="35201-1234567-1" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">MOTHER INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Mother Name</Label>
                      <Input name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="Mother's full name" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Mother Phone</Label>
                      <Input name="motherPhone" value={formData.motherPhone} onChange={handleInputChange} placeholder="0300-1234567" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Mother Occupation</Label>
                      <Input name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange} placeholder="e.g. Housewife / Teacher" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">GUARDIAN INFORMATION (IF ANY)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Guardian Name</Label>
                      <Input name="guardianName" value={formData.guardianName} onChange={handleInputChange} placeholder="Guardian name" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Relation</Label>
                      <Input name="guardianRelation" value={formData.guardianRelation} onChange={handleInputChange} placeholder="e.g. Uncle / Grandfather" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Guardian Phone</Label>
                      <Input name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} placeholder="0300-1234567" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-3">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Guardian Address</Label>
                      <textarea name="guardianAddress" value={formData.guardianAddress} onChange={handleInputChange} placeholder="Guardian complete address..." className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Info */}
            {activeTab === 'DOCUMENT INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">ORIGINAL DOCUMENTS UPLOAD</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Transfer Certificate (TC) Scan (Original)</Label>
                      <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocChange(e, 'document1')} className="bg-zinc-900 border-zinc-800 text-zinc-300 file:bg-zinc-800 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-zinc-700 cursor-pointer" />
                        <DocumentPreview preview={docPreviews.document1} error={docErrors.document1} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Transfer Certificate (TC) Number</Label>
                      <Input name="tcNo" value={formData.tcNo} onChange={handleInputChange} placeholder="e.g. TC-8921" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">CNIC / B-Form Front (Original)</Label>
                      <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocChange(e, 'cnicFront')} className="bg-zinc-900 border-zinc-800 text-zinc-300 file:bg-zinc-800 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-zinc-700 cursor-pointer" />
                        <DocumentPreview preview={docPreviews.cnicFront} error={docErrors.cnicFront} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">CNIC / B-Form Back (Original)</Label>
                      <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocChange(e, 'cnicBack')} className="bg-zinc-900 border-zinc-800 text-zinc-300 file:bg-zinc-800 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-zinc-700 cursor-pointer" />
                        <DocumentPreview preview={docPreviews.cnicBack} error={docErrors.cnicBack} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Previous Qualification</Label>
                      <SearchableSelect 
                        name="qualificationLevel" 
                        value={formData.qualificationLevel || ''} 
                        onChange={handleInputChange} 
                        placeholder="Select Qualification"
                        options={QUALIFICATION_LEVELS} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Qualification Certificate (Original)</Label>
                      <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocChange(e, 'qualificationDocument')} className="bg-zinc-900 border-zinc-800 text-zinc-300 file:bg-zinc-800 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-zinc-700 cursor-pointer" />
                        <DocumentPreview preview={docPreviews.qualificationDocument} error={docErrors.qualificationDocument} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Previous School Info */}
            {activeTab === 'PREVIOUS SCHOOL INFORMATION' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">PREVIOUS SCHOOL DETAILS</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Qualification Covered</Label>
                        <SearchableSelect 
                          name="qualificationLevel" 
                          value={formData.qualificationLevel || ''} 
                          onChange={handleInputChange} 
                          placeholder="Select Qualification (e.g., Matric)"
                          options={QUALIFICATION_LEVELS} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Institute Type</Label>
                        <SearchableSelect 
                          name="instituteType" 
                          value={formData.instituteType || ''} 
                          onChange={handleInputChange} 
                          placeholder="Select Institute Type"
                          options={[
                            { label: 'School', value: 'School' },
                            { label: 'College', value: 'College' },
                            { label: 'University', value: 'University' },
                            { label: 'Institute', value: 'Institute' },
                            { label: 'Academy', value: 'Academy' }
                          ]} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Institute Name</Label>
                        <Input name="previousSchoolName" value={formData.previousSchoolName} onChange={(e) => {
                          handleInputChange(e);
                          setFormData(prev => ({ ...prev, previousSchool: e.target.value }));
                        }} placeholder="e.g. Army Public School" className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Institute Address</Label>
                        <Input name="previousSchoolAddress" value={formData.previousSchoolAddress} onChange={handleInputChange} placeholder="City, Campus address" className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Other Info */}
            {activeTab === 'OTHER INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">HEALTH & ADDITIONAL NOTES</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Medical History / Allergies</Label>
                      <Input name="medicalHistory" value={formData.medicalHistory} onChange={handleInputChange} placeholder="e.g. Asthmatic, No allergies, etc." className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase">Additional Remarks / Notes</Label>
                      <textarea name="otherInfo" value={formData.otherInfo} onChange={handleInputChange} placeholder="Special instructions or student history..." className="flex min-h-[120px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button disabled={submitting} type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-8 py-2.5 cursor-pointer shadow-md">
                {submitting ? 'SAVING...' : 'SAVE STUDENT RECORD'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <StudentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          router.push('/dashboard/students');
        }}
        availableClasses={classes}
      />
    </div>
  );
}
