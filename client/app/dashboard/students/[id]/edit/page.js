'use client';

import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronRight, Calendar as CalendarIcon, Upload, CheckCircle2, 
  AlertTriangle, AlertCircle, ArrowRight, ArrowLeft, X, User,
  Save, Phone, Mail, MapPin, Shield, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';
import { getPhotoUrl } from '@/lib/utils';
import { DayMonthYearInput } from '@/components/ui/DayMonthYearInput';

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
  { label: 'NA', value: 'NA' },
  { label: 'N/A (Not Available / Unknown)', value: 'N/A' },
];

const STUDENT_TYPES = [
  { label: 'Regular', value: 'Regular' },
  { label: 'Private', value: 'Private' },
  { label: 'Scholarship', value: 'Scholarship' },
  { label: 'Hostelite', value: 'Hostelite' },
  { label: 'Day Scholar', value: 'Day Scholar' }
];

// Helper to auto-format Pakistani CNIC (12345-1234567-1)
function formatCnic(val) {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

const DocumentPreview = ({ preview, error }) => {
  if (error) return <p className="text-rose-500 text-xs mt-1 font-semibold">{error}</p>;
  if (!preview) return null;
  return (
    <div className="mt-2 rounded-lg border border-zinc-200 p-1 bg-white relative w-full h-32 overflow-hidden shadow-sm">
      {preview.type === 'application/pdf' ? (
        <iframe src={preview.url} className="w-full h-full rounded" />
      ) : (
        <img src={preview.url} alt="Document Preview" className="w-full h-full object-cover rounded" />
      )}
      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">VERIFIED</div>
    </div>
  );
};

export default function EditStudentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('PERSONAL INFO');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [formGeneralError, setFormGeneralError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const [docFiles, setDocFiles] = useState({ cnicFront: null, cnicBack: null, document1: null, qualificationDocument: null, previousSchoolDocument: null });
  const [docPreviews, setDocPreviews] = useState({ cnicFront: null, cnicBack: null, document1: null, qualificationDocument: null, previousSchoolDocument: null });
  const [docErrors, setDocErrors] = useState({ cnicFront: '', cnicBack: '', document1: '', qualificationDocument: '', previousSchoolDocument: '' });

  const [formData, setFormData] = useState({
    academicYear: '2026',
    className: '',
    section: '',
    studentGroup: '',
    admissionNo: '',
    admissionDate: '',
    joiningDate: '',
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
    qualificationLevel: '',
    instituteType: '',

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
  const [sections, setSections] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentRes, classRes, secRes, grpRes] = await Promise.allSettled([
          api.get(`/student/${id}`),
          api.get('/class'),
          api.get('/section'),
          api.get('/student-group')
        ]);

        if (classRes.status === 'fulfilled' && classRes.value?.success && Array.isArray(classRes.value.data)) {
          setClasses(sortClassesAcademic(classRes.value.data));
        }

        if (secRes.status === 'fulfilled' && secRes.value?.success && Array.isArray(secRes.value.data)) {
          setSections(secRes.value.data);
        }

        if (grpRes.status === 'fulfilled' && grpRes.value?.success && Array.isArray(grpRes.value.data)) {
          setGroups(grpRes.value.data);
        }

        if (studentRes.status === 'fulfilled') {
          const s = studentRes.value?.data || (studentRes.value?._id ? studentRes.value : null);
          if (s) {
            setFormData({
              academicYear: s.academicYear || '2026',
              className: s.className || '',
              section: s.section || '',
              studentGroup: s.studentGroup || '',
              admissionNo: s.admissionNo || '',
              admissionDate: s.admissionDate || s.joiningDate || '',
              joiningDate: s.joiningDate || s.admissionDate || '',
              rollNo: s.rollNo || '',
              type: s.type || 'Regular',
              phone: s.phone || '',
              email: s.email || '',
              city: s.city || '',
              address: s.currentAddress || s.address || '',
              currentAddress: s.currentAddress || s.address || '',
              permanentAddress: s.permanentAddress || '',
              
              firstName: s.firstName || '',
              lastName: s.lastName || '',
              gender: s.gender || 'Male',
              dob: s.dob || '',
              religion: s.religion || 'Islam',
              caste: s.caste || '',
              bloodGroup: s.bloodGroup || 'B+',
              nationality: s.nationality || 'Pakistani',
              cnic: formatCnic(s.cnic || s.bForm) || s.cnic || s.bForm || '',
              emergencyContact: s.emergencyContact || '',
              medicalHistory: s.medicalHistory || '',

              fatherName: s.fatherName || '',
              fatherPhone: s.fatherPhone || '',
              fatherOccupation: s.fatherOccupation || '',
              fatherCnic: formatCnic(s.fatherCnic) || s.fatherCnic || '',
              motherName: s.motherName || '',
              motherPhone: s.motherPhone || '',
              motherOccupation: s.motherOccupation || '',
              guardianName: s.guardianName || '',
              guardianRelation: s.guardianRelation || '',
              guardianPhone: s.guardianPhone || '',
              guardianAddress: s.guardianAddress || '',

              previousSchool: s.previousSchool || '',
              previousSchoolName: s.previousSchoolName || s.previousSchool || '',
              previousSchoolAddress: s.previousSchoolAddress || '',
              qualificationLevel: s.qualificationLevel || '',
              instituteType: s.instituteType || '',

              tcNo: s.tcNo || '',
              remarks: s.remarks || '',
              otherInfo: s.otherInfo || s.remarks || ''
            });

            const photo = getPhotoUrl(s);
            if (photo) setPhotoPreview(photo);
          } else {
            setFormGeneralError('Student record not found.');
          }
        } else {
          setFormGeneralError('Failed to fetch student details.');
        }
      } catch (err) {
        console.error('Error fetching student edit data:', err);
        setFormGeneralError('An error occurred while loading student information.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'className') {
      setFormData(prev => ({ ...prev, className: value, section: '' }));
    } else if (name === 'currentAddress') {
      setFormData(prev => ({ ...prev, currentAddress: value, address: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCnicChange = (e) => {
    const formatted = formatCnic(e.target.value);
    setFormData(prev => ({ ...prev, cnic: formatted }));
    if (fieldErrors.cnic) {
      if (formatted.length === 15 && /^\d{5}-\d{7}-\d{1}$/.test(formatted)) {
        setFieldErrors(prev => ({ ...prev, cnic: '' }));
      }
    }
  };

  const handleFatherCnicChange = (e) => {
    const formatted = formatCnic(e.target.value);
    setFormData(prev => ({ ...prev, fatherCnic: formatted }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhotoName(file.name);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleDocChange = (e, docType) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setDocErrors(prev => ({ ...prev, [docType]: 'Only JPG, PNG, or PDF allowed.' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDocErrors(prev => ({ ...prev, [docType]: 'File too large. Max 5MB allowed.' }));
        return;
      }

      setDocErrors(prev => ({ ...prev, [docType]: '' }));
      setDocFiles(prev => ({ ...prev, [docType]: file }));
      
      const previewUrl = URL.createObjectURL(file);
      setDocPreviews(prev => ({ ...prev, [docType]: { url: previewUrl, type: file.type } }));
    }
  };

  const validatePersonalInfo = () => {
    const errors = {};
    if (!formData.className || !formData.className.trim()) {
      errors.className = 'Class is required.';
    }
    if (!formData.firstName || !formData.firstName.trim()) {
      errors.firstName = 'Full Name / First Name is required.';
    }
    if (!formData.gender) {
      errors.gender = 'Gender is required.';
    }
    return errors;
  };

  const handleBackendError = (msg) => {
    const errMap = {};
    if (typeof msg === 'string') {
      if (msg.includes('rollNo') || msg.includes('Roll Number') || msg.includes('roll')) {
        errMap.rollNo = 'This Roll Number is already assigned.';
      }
      if (msg.includes('cnic') || msg.includes('CNIC')) {
        errMap.cnic = 'This CNIC number is invalid or already registered.';
      }
      if (msg.includes('admissionNo')) {
        errMap.admissionNo = 'Admission number already exists.';
      }
      if (msg.includes('className')) {
        errMap.className = 'Class is required.';
      }
    }
    setFieldErrors(prev => ({ ...prev, ...errMap }));
    setFormGeneralError(typeof msg === 'string' ? msg : 'Error saving student record.');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (activeTab === 'PERSONAL INFO') {
      const errs = validatePersonalInfo();
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setFormGeneralError('Please fill in required fields.');
        window.scrollTo({ top: 120, behavior: 'smooth' });
        return;
      }
      setFieldErrors({});
      setFormGeneralError('');
    }
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validatePersonalInfo();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setActiveTab('PERSONAL INFO');
      setFormGeneralError('Please fill in required fields.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    setFieldErrors({});
    setFormGeneralError('');

    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'studentGroup') {
          if (formData.studentGroup && String(formData.studentGroup).trim() !== '' && formData.studentGroup !== 'undefined' && formData.studentGroup !== 'null') {
            dataToSubmit.append('studentGroup', String(formData.studentGroup).trim());
          }
          return;
        }
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

      const res = await api.put(`/student/${id}`, dataToSubmit);
      if (res && res.success !== false) {
        setFormSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard/students/${id}`);
        }, 1200);
      } else {
        const msg = res?.message || "Failed to update student profile.";
        handleBackendError(msg);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error updating student';
      handleBackendError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const currentTabIndex = tabs.indexOf(activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-medium">Loading full student profile...</p>
        </div>
      </div>
    );
  }

  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Student Profile';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 flex items-center gap-2">
            Edit Student: <span className="text-[#084A86]">{fullName}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Update complete student bio, academic placement, parent details, addresses, and documents.
          </p>
        </div>
        <div className="flex flex-wrap items-center text-xs text-zinc-400 gap-y-1">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 shrink-0" />
          <Link href="/dashboard/students" className="hover:text-zinc-600 transition-colors">Student List</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 shrink-0" />
          <Link href={`/dashboard/students/${id}`} className="hover:text-zinc-600 transition-colors">Profile</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 shrink-0" />
          <span className="text-[#084A86] font-bold">Edit Profile</span>
        </div>
      </div>

      {/* Top Notification Banners */}
      {formGeneralError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{formGeneralError}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFormGeneralError('')} 
            className="text-rose-600 hover:text-rose-900 font-extrabold text-sm p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Student profile updated successfully! Redirecting to student profile...</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            Full Profile Edit & Details
          </h2>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/students/${id}`}>
              <Button 
                type="button" 
                variant="outline"
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold flex items-center gap-1.5 text-xs h-9 px-3.5"
              >
                <Eye className="h-3.5 w-3.5" /> View Profile
              </Button>
            </Link>
            <Link href="/dashboard/students">
              <Button 
                type="button" 
                variant="ghost"
                className="text-zinc-500 hover:text-zinc-900 font-semibold flex items-center gap-1 text-xs h-9 px-3"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to List
              </Button>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Tabs Bar */}
            <div className="flex border-b border-zinc-200 overflow-x-auto gap-2 pb-2 scrollbar-none">
              {tabs.map((tab, idx) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 uppercase tracking-wide cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'bg-[#084A86] text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${activeTab === tab ? 'bg-white text-[#084A86]' : 'bg-zinc-300 text-zinc-700'}`}>
                    {idx + 1}
                  </span>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Personal Info */}
            {activeTab === 'PERSONAL INFO' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Academic Placement */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2">ACADEMIC PLACEMENT</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Academic Year <span className="text-rose-500">*</span></Label>
                        <SearchableSelect 
                          name="academicYear" 
                          value={formData.academicYear} 
                          onChange={handleInputChange} 
                          options={ACADEMIC_YEARS} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class <span className="text-rose-500">*</span></Label>
                        <SearchableSelect 
                          name="className" 
                          value={formData.className} 
                          onChange={handleInputChange} 
                          placeholder="Select Class *"
                          options={classes.map(c => ({ label: c.name, value: c.name }))} 
                        />
                        {fieldErrors.className && (
                          <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.className}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                          Section <span className="text-zinc-400 font-normal normal-case">(Optional)</span>
                        </Label>
                        <SearchableSelect 
                          name="section" 
                          value={formData.section} 
                          onChange={handleInputChange} 
                          placeholder="Select Section"
                          options={(classes.find(c => c.name === formData.className)?.sections || sections || ['A', 'B', 'C', 'D']).map(s => {
                            const val = typeof s === 'string' ? s : s.name;
                            return { label: val, value: val };
                          })} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Admission Number <span className="text-rose-500">*</span></Label>
                        <Input 
                          name="admissionNo" 
                          value={formData.admissionNo} 
                          onChange={handleInputChange} 
                          placeholder="ADM-2026-001" 
                          className="bg-white border-zinc-300 text-zinc-950 font-mono tracking-wider font-bold" 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Admission Date</Label>
                        <DayMonthYearInput 
                          name="admissionDate" 
                          value={formData.admissionDate} 
                          onChange={handleInputChange} 
                          minYear={2015} 
                          maxYear={2030} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Joining Date</Label>
                        <DayMonthYearInput 
                          name="joiningDate" 
                          value={formData.joiningDate} 
                          onChange={handleInputChange} 
                          minYear={2015} 
                          maxYear={2030} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Roll Number</Label>
                        <Input 
                          name="rollNo" 
                          value={formData.rollNo} 
                          onChange={handleInputChange} 
                          placeholder="Roll No" 
                          className="bg-white border-zinc-300 text-zinc-950 font-mono font-bold" 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Student Type</Label>
                        <SearchableSelect 
                          name="type" 
                          value={formData.type} 
                          onChange={handleInputChange} 
                          options={STUDENT_TYPES} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Bio Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2">STUDENT PERSONAL DETAILS</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Full Name / First Name <span className="text-rose-500">*</span></Label>
                        <Input 
                          name="firstName" 
                          value={formData.firstName} 
                          onChange={handleInputChange} 
                          placeholder="Student Full Name" 
                          className="bg-white border-zinc-300 text-zinc-950 font-semibold" 
                        />
                        {fieldErrors.firstName && (
                          <p className="text-xs text-rose-600 font-bold mt-1">{fieldErrors.firstName}</p>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Last Name <span className="text-zinc-400 font-normal normal-case">(Optional)</span></Label>
                        <Input 
                          name="lastName" 
                          value={formData.lastName} 
                          onChange={handleInputChange} 
                          placeholder="Last Name" 
                          className="bg-white border-zinc-300 text-zinc-950 font-medium" 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Gender <span className="text-rose-500">*</span></Label>
                        <select 
                          name="gender" 
                          value={formData.gender} 
                          onChange={handleInputChange} 
                          className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-950 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Date of Birth</Label>
                        <DayMonthYearInput 
                          name="dob" 
                          value={formData.dob} 
                          onChange={handleInputChange} 
                          minYear={1990} 
                          maxYear={2026} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Religion</Label>
                        <Input 
                          name="religion" 
                          value={formData.religion} 
                          onChange={handleInputChange} 
                          placeholder="Islam" 
                          className="bg-white border-zinc-300 text-zinc-950 font-medium" 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Blood Group</Label>
                        <SearchableSelect 
                          name="bloodGroup" 
                          value={formData.bloodGroup} 
                          onChange={handleInputChange} 
                          options={BLOOD_GROUPS} 
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Student CNIC / B-Form Number</Label>
                        <Input 
                          name="cnic" 
                          value={formData.cnic} 
                          onChange={handleCnicChange} 
                          maxLength={15}
                          placeholder="35201-1234567-1" 
                          className="bg-white border-zinc-300 text-zinc-950 font-mono tracking-wider font-semibold" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
                  <h3 className="text-sm font-bold text-zinc-950 mb-3">STUDENT PHOTOGRAPH</h3>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-xl border-2 border-zinc-300 bg-white overflow-hidden flex items-center justify-center shrink-0">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-zinc-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-zinc-300 file:text-xs file:font-semibold file:bg-white hover:file:bg-zinc-100 cursor-pointer" 
                      />
                      <p className="text-[11px] text-zinc-500">Supported formats: JPG, PNG, WEBP (Max 5MB). Photo updates automatically.</p>
                    </div>
                  </div>
                </div>

                {/* Contact & Residential Information */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">CONTACT & RESIDENTIAL INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Student Phone</Label>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="03001234567" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Email Address</Label>
                      <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="student@example.com" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">City</Label>
                      <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Lahore, Sharaqpur" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Emergency Contact</Label>
                      <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} placeholder="03001234567" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Current Residential Address</Label>
                      <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} placeholder="House No, Street, Area, City" className="flex min-h-[75px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"></textarea>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Permanent Address</Label>
                      <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} placeholder="Permanent residential address" className="flex min-h-[75px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Parents & Guardian Info */}
            {activeTab === 'PARENTS & GUARDIAN INFO' && (
              <div className="space-y-8">
                {/* Father Information */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">FATHER INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Father Name</Label>
                      <Input name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father Full Name" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Father Phone</Label>
                      <Input name="fatherPhone" value={formData.fatherPhone} onChange={handleInputChange} placeholder="03001234567" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Father Occupation</Label>
                      <Input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} placeholder="e.g. Business, Engineer" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Father CNIC</Label>
                      <Input 
                        name="fatherCnic" 
                        value={formData.fatherCnic} 
                        onChange={handleFatherCnicChange} 
                        maxLength={15}
                        placeholder="35201-1234567-1" 
                        className="bg-white border-zinc-300 text-zinc-950 font-mono tracking-wider font-medium" 
                      />
                    </div>
                  </div>
                </div>

                {/* Mother Information */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">MOTHER INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Mother Name</Label>
                      <Input name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="Mother Full Name" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Mother Phone</Label>
                      <Input name="motherPhone" value={formData.motherPhone} onChange={handleInputChange} placeholder="03001234567" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Mother Occupation</Label>
                      <Input name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange} placeholder="e.g. Housewife, Teacher" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">GUARDIAN INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Guardian Name</Label>
                      <Input name="guardianName" value={formData.guardianName} onChange={handleInputChange} placeholder="Guardian Full Name" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Relation</Label>
                      <Input name="guardianRelation" value={formData.guardianRelation} onChange={handleInputChange} placeholder="e.g. Uncle, Brother" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Guardian Phone</Label>
                      <Input name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} placeholder="03001234567" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Guardian Address</Label>
                      <Input name="guardianAddress" value={formData.guardianAddress} onChange={handleInputChange} placeholder="Guardian Address" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Document Info */}
            {activeTab === 'DOCUMENT INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">OFFICIAL DOCUMENTS</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Transfer Certificate (TC) Number</Label>
                      <Input name="tcNo" value={formData.tcNo} onChange={handleInputChange} placeholder="e.g. TC-908234" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">TC Scan Document</Label>
                      <input type="file" onChange={(e) => handleDocChange(e, 'document1')} className="text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-zinc-300 file:bg-white" />
                      <DocumentPreview preview={docPreviews.document1} error={docErrors.document1} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">CNIC / B-Form Front</Label>
                      <input type="file" onChange={(e) => handleDocChange(e, 'cnicFront')} className="text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-zinc-300 file:bg-white" />
                      <DocumentPreview preview={docPreviews.cnicFront} error={docErrors.cnicFront} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">CNIC / B-Form Back</Label>
                      <input type="file" onChange={(e) => handleDocChange(e, 'cnicBack')} className="text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-zinc-300 file:bg-white" />
                      <DocumentPreview preview={docPreviews.cnicBack} error={docErrors.cnicBack} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Previous School Info */}
            {activeTab === 'PREVIOUS SCHOOL INFORMATION' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">PRIOR ACADEMIC BACKGROUND</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Previous School Name</Label>
                      <Input name="previousSchoolName" value={formData.previousSchoolName} onChange={handleInputChange} placeholder="e.g. Army Public School, City School" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Qualification Level</Label>
                      <SearchableSelect 
                        name="qualificationLevel" 
                        value={formData.qualificationLevel} 
                        onChange={handleInputChange} 
                        options={QUALIFICATION_LEVELS} 
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Previous School Address</Label>
                      <Input name="previousSchoolAddress" value={formData.previousSchoolAddress} onChange={handleInputChange} placeholder="Address of previous institution" className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Other Info */}
            {activeTab === 'OTHER INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">HEALTH & ADDITIONAL NOTES</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Medical History / Allergies</Label>
                      <Input name="medicalHistory" value={formData.medicalHistory} onChange={handleInputChange} placeholder="e.g. Asthmatic, No allergies, etc." className="bg-white border-zinc-300 text-zinc-950 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Additional Remarks / Notes</Label>
                      <textarea name="otherInfo" value={formData.otherInfo} onChange={handleInputChange} placeholder="Special instructions or student history..." className="flex min-h-[120px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-3">
              <div>
                {currentTabIndex > 0 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevTab}
                    className="border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <ArrowLeft className="h-4 w-4" /> PREVIOUS STEP
                  </Button>
                ) : (
                  <span className="text-xs text-zinc-400 font-medium">Step 1 of 5: Personal & Academic</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentTabIndex < tabs.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={handleNextTab}
                    className="bg-[#084A86] hover:bg-[#063866] text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer text-xs shadow-xs"
                  >
                    NEXT: {tabs[currentTabIndex + 1]} <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : null}

                <Button 
                  disabled={submitting} 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-lg cursor-pointer shadow-sm text-xs flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? 'SAVING CHANGES...' : 'SAVE STUDENT PROFILE'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
