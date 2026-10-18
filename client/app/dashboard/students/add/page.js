'use client';

import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, Plus, Calendar as CalendarIcon, Upload, CheckCircle2, 
  AlertTriangle, AlertCircle, ArrowRight, ArrowLeft, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DayMonthYearInput } from '@/components/ui/DayMonthYearInput';
import { sortClassesAcademic } from '@/lib/academicUtils';
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
  if (digits.length <= 5) {
    return digits;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

const DocumentPreview = ({ preview, error }) => {
  if (error) return <p className="text-rose-500 text-xs mt-1 font-semibold">{error}</p>;
  if (!preview) return null;
  return (
    <div className="mt-2 rounded-lg border border-zinc-200 dark:border-zinc-200 p-1 bg-white dark:bg-zinc-800 relative w-full h-32 overflow-hidden shadow-sm">
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
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Field-level inline errors state (displays directly under fields)
  const [fieldErrors, setFieldErrors] = useState({});
  const [formGeneralError, setFormGeneralError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Roll Number Validation State
  const [usedRolls, setUsedRolls] = useState([]);
  const [rollDuplicate, setRollDuplicate] = useState(false);
  const [loadingRoll, setLoadingRoll] = useState(false);

  const [docFiles, setDocFiles] = useState({ cnicFront: null, cnicBack: null, document1: null, qualificationDocument: null, previousSchoolDocument: null });
  const [docPreviews, setDocPreviews] = useState({ cnicFront: null, cnicBack: null, document1: null, qualificationDocument: null, previousSchoolDocument: null });
  const [docErrors, setDocErrors] = useState({ cnicFront: '', cnicBack: '', document1: '', qualificationDocument: '', previousSchoolDocument: '' });

  const handleDocChange = (e, docType) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setDocErrors(prev => ({ ...prev, [docType]: 'Fake or invalid document. Only JPG, PNG, or PDF allowed.' }));
        setDocPreviews(prev => ({ ...prev, [docType]: null }));
        setDocFiles(prev => ({ ...prev, [docType]: null }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDocErrors(prev => ({ ...prev, [docType]: 'File too large. Max 5MB allowed.' }));
        setDocPreviews(prev => ({ ...prev, [docType]: null }));
        setDocFiles(prev => ({ ...prev, [docType]: null }));
        return;
      }

      setDocErrors(prev => ({ ...prev, [docType]: '' }));
      setDocFiles(prev => ({ ...prev, [docType]: file }));
      
      const previewUrl = URL.createObjectURL(file);
      setDocPreviews(prev => ({ ...prev, [docType]: { url: previewUrl, type: file.type } }));
    }
  };

  const [formData, setFormData] = useState({
    academicYear: '2026',
    className: '',
    section: '',
    studentGroup: '',
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

  // Fetch Next Admission Number
  const fetchNextAdmissionNumber = async () => {
    try {
      const res = await api.get('/student/next-admission-no');
      if (res?.success && res.nextAdmissionNo) {
        setFormData(prev => ({ ...prev, admissionNo: res.nextAdmissionNo }));
      }
    } catch (e) {
      const currYear = new Date().getFullYear();
      setFormData(prev => ({ ...prev, admissionNo: `ADM-${currYear}-001` }));
    }
  };

  // Fetch Next Roll Number for selected class and section
  const fetchNextRollNumber = async (cls, sec) => {
    if (!cls) return;
    try {
      setLoadingRoll(true);
      const res = await api.get('/student/next-roll-no', {
        params: { className: cls, section: sec || '' }
      });
      if (res?.success) {
        setFormData(prev => ({ ...prev, rollNo: res.nextRollNo }));
        setUsedRolls(res.usedRollNumbers || []);
        setRollDuplicate(false);
      }
    } catch (e) {
      console.error('Error fetching next roll no:', e);
    } finally {
      setLoadingRoll(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, secRes, grpRes] = await Promise.allSettled([
          api.get('/class'),
          api.get('/section'),
          api.get('/student-group')
        ]);

        if (classRes.status === 'fulfilled' && classRes.value?.success && Array.isArray(classRes.value.data)) {
          const sortedClasses = sortClassesAcademic(classRes.value.data);
          setClasses(sortedClasses);
        }

        if (secRes.status === 'fulfilled' && secRes.value?.success && Array.isArray(secRes.value.data)) {
          setSections(secRes.value.data);
        }

        if (grpRes.status === 'fulfilled' && grpRes.value?.success && Array.isArray(grpRes.value.data)) {
          setGroups(grpRes.value.data);
        }

        await fetchNextAdmissionNumber();
      } catch (err) {
        console.error('Initial data fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Clear inline error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'className') {
      setFormData(prev => ({ ...prev, className: value, section: '' }));
      fetchNextRollNumber(value, '');
    } else if (name === 'section') {
      setFormData(prev => ({ ...prev, section: value }));
      fetchNextRollNumber(formData.className, value);
    } else if (name === 'currentAddress') {
      setFormData(prev => ({ ...prev, currentAddress: value, address: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // CNIC input handler with automatic hyphens (XXXXX-XXXXXXX-X)
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

  const handleRollChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, rollNo: val }));
    if (val && usedRolls.includes(val.trim())) {
      setRollDuplicate(true);
      setFieldErrors(prev => ({ ...prev, rollNo: `Roll Number (${val}) is already assigned in this Class / Section.` }));
    } else {
      setRollDuplicate(false);
      if (fieldErrors.rollNo) {
        setFieldErrors(prev => ({ ...prev, rollNo: '' }));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhotoName(file.name);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const getFilteredSections = () => {
    const selectedClass = classes.find(c => c.name === formData.className);
    if (selectedClass && selectedClass.sections && selectedClass.sections.length > 0) {
      return selectedClass.sections.map(s => ({ label: s, value: s }));
    }
    return (sections.length > 0 ? sections : ['A', 'B', 'C', 'D']).map(s => {
      const val = typeof s === 'string' ? s : s.name;
      return { label: val, value: val };
    });
  };

  // Frontend Validation logic — populates inline field errors
  const validatePersonalInfo = () => {
    const errors = {};
    if (!formData.className || !formData.className.trim()) {
      errors.className = 'Class is required.';
    }
    if (!formData.firstName || !formData.firstName.trim()) {
      errors.firstName = 'Full Name is required.';
    }
    if (!formData.gender) {
      errors.gender = 'Gender is required.';
    }
    if (!formData.dob) {
      errors.dob = 'Date of birth is required.';
    }
    // CNIC is strictly required and must follow XXXXX-XXXXXXX-X format
    if (!formData.cnic || !formData.cnic.trim()) {
      errors.cnic = 'CNIC / B-Form number is required.';
    } else if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic.trim())) {
      errors.cnic = 'Invalid CNIC format. Required format: 12345-1234567-1 (13 digits).';
    }
    if (rollDuplicate) {
      errors.rollNo = `Roll Number (${formData.rollNo}) is already assigned in this Class / Section.`;
    }
    return errors;
  };

  // Handle Backend Error mapping into field-level inline errors
  const handleBackendError = (msg) => {
    const errMap = {};
    if (typeof msg === 'string') {
      if (msg.includes('studentGroup')) {
        errMap.studentGroup = 'Student Group is invalid. Leave it as None.';
      }
      if (msg.includes('rollNo') || msg.includes('Roll Number') || msg.includes('roll')) {
        errMap.rollNo = 'This Roll Number is already assigned.';
      }
      if (msg.includes('cnic') || msg.includes('CNIC')) {
        errMap.cnic = 'This CNIC number is invalid or already registered.';
      }
      if (msg.includes('admissionNo') || msg.includes('Admission Number')) {
        errMap.admissionNo = 'Admission number already exists.';
      }
      if (msg.includes('className') || msg.includes('class')) {
        errMap.className = 'Class is required.';
      }
    }
    setFieldErrors(prev => ({ ...prev, ...errMap }));
    setFormGeneralError(typeof msg === 'string' ? msg : 'Error saving student record.');
    setActiveTab('PERSONAL INFO');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Tab Navigation Handling
  const handleNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (activeTab === 'PERSONAL INFO') {
      const errs = validatePersonalInfo();
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setFormGeneralError('Please fill in all required fields highlighted in red.');
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
      setFormGeneralError('Please fill in all required fields highlighted in red.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    setFieldErrors({});
    setFormGeneralError('');

    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        // NEVER send studentGroup if empty or null (prevents Mongoose CastError on any backend)
        if (key === 'studentGroup') {
          if (formData.studentGroup && String(formData.studentGroup).trim() !== '' && formData.studentGroup !== 'undefined' && formData.studentGroup !== 'null') {
            dataToSubmit.append('studentGroup', String(formData.studentGroup).trim());
          }
          return;
        }
        // Section is optional
        if (key === 'section') {
          if (formData.section && String(formData.section).trim() !== '') {
            dataToSubmit.append('section', String(formData.section).trim());
          }
          return;
        }
        if (formData[key] !== undefined && formData[key] !== null && String(formData[key]).trim() !== '') {
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
        setFormSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/students');
        }, 1200);
      } else {
        const msg = res?.message || "Failed to save student.";
        handleBackendError(msg);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error saving student';
      handleBackendError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const currentTabIndex = tabs.indexOf(activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-950">Student Admission</h1>
        <div className="flex flex-wrap items-center text-xs sm:text-sm text-zinc-400 gap-y-1">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 shrink-0" />
          <Link href="/dashboard/students" className="hover:text-zinc-600 transition-colors">Student Info</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 shrink-0" />
          <span className="text-[#084A86] font-bold">Student Admission</span>
        </div>
      </div>

      {/* Top Notification Banners */}
      {formGeneralError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Student record saved successfully! Redirecting to student list...</span>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden shadow-lg">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-950">Add Student Profile</h2>
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
                        className={fieldErrors.className ? "border-rose-500 ring-1 ring-rose-500" : ""}
                      />
                      {fieldErrors.className && (
                        <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {fieldErrors.className}
                        </p>
                      )}
                    </div>

                    {/* Section (100% Optional) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                        Section <span className="text-zinc-400 font-normal normal-case">(Optional)</span>
                      </Label>
                      <SearchableSelect 
                        name="section" 
                        value={formData.section} 
                        onChange={handleInputChange} 
                        placeholder="Select Section (Optional)"
                        options={[
                          { label: 'None / Default Section', value: '' },
                          ...getFilteredSections()
                        ]} 
                      />
                    </div>
                    
                    {/* Student Group (100% Optional) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                          Student Group <span className="text-zinc-400 font-normal normal-case">(Optional)</span>
                        </Label>
                        <Link href="/dashboard/students/groups" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1">
                          + Add Group
                        </Link>
                      </div>
                      <SearchableSelect 
                        name="studentGroup" 
                        value={formData.studentGroup} 
                        onChange={handleInputChange} 
                        placeholder="Select Group (Optional)"
                        options={[
                          { label: 'None / No Group (Optional)', value: '' },
                          ...groups.map(g => ({ label: g.name, value: g._id }))
                        ]} 
                      />
                      {fieldErrors.studentGroup && (
                        <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {fieldErrors.studentGroup}
                        </p>
                      )}
                    </div>

                    {/* Admission Number */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                        Admission Number <span className="text-rose-500">*</span>
                      </Label>
                      <Input 
                        name="admissionNo" 
                        value={formData.admissionNo} 
                        readOnly 
                        disabled 
                        className="bg-zinc-100 border-zinc-300 text-zinc-950 font-bold cursor-not-allowed select-none shadow-xs text-sm" 
                      />
                      {fieldErrors.admissionNo && (
                        <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {fieldErrors.admissionNo}
                        </p>
                      )}
                    </div>

                    {/* Roll Number (Auto-assigned, Read-Only, Starts from 1) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                          Roll Number
                        </Label>
                        {loadingRoll && (
                          <span className="text-[10px] text-zinc-500 font-medium">Checking next roll...</span>
                        )}
                      </div>
                      <Input 
                        name="rollNo" 
                        value={formData.rollNo} 
                        readOnly 
                        disabled 
                        placeholder="Auto-assigned (e.g. PRC260001)" 
                        className="bg-zinc-100 border-zinc-300 text-zinc-950 font-bold cursor-not-allowed select-none shadow-xs text-sm" 
                      />
                      {fieldErrors.rollNo && (
                        <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1 animate-in fade-in">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {fieldErrors.rollNo}
                        </p>
                      )}
                    </div>

                    {/* Admission Date (Day / Month / Year Format) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Admission Date</Label>
                      <DayMonthYearInput 
                        name="admissionDate" 
                        value={formData.admissionDate} 
                        onChange={handleInputChange} 
                        minYear={2020} 
                        maxYear={2030} 
                      />
                    </div>

                    {/* Student Type */}
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

                {/* Right Column: Personal Bio Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2">PERSONAL PROFILE</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Full Name <span className="text-rose-500">*</span></Label>
                        <Input 
                          name="firstName" 
                          value={formData.firstName} 
                          onChange={handleInputChange} 
                          placeholder="Student Full Name (e.g. Muhammad Ali)" 
                          className={`bg-white text-zinc-950 font-medium ${fieldErrors.firstName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-zinc-300'}`} 
                        />
                        {fieldErrors.firstName && (
                          <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.firstName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Gender <span className="text-rose-500">*</span></Label>
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
                          className={fieldErrors.gender ? "border-rose-500 ring-1 ring-rose-500" : ""}
                        />
                        {fieldErrors.gender && (
                          <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.gender}
                          </p>
                        )}
                      </div>

                      {/* Date of Birth (Day / Month / Year Format) */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Date of Birth <span className="text-rose-500">*</span></Label>
                        <DayMonthYearInput 
                          name="dob" 
                          value={formData.dob} 
                          onChange={handleInputChange} 
                          minYear={1990} 
                          maxYear={2026} 
                          required={true}
                        />
                        {fieldErrors.dob && (
                          <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.dob}
                          </p>
                        )}
                      </div>

                      {/* CNIC / B-Form with Hyphens (Required) */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                            CNIC / B-Form Number <span className="text-rose-500">*</span>
                          </Label>
                          <span className="text-[10px] text-zinc-500 font-mono">12345-1234567-1</span>
                        </div>
                        <Input 
                          name="cnic" 
                          value={formData.cnic} 
                          onChange={handleCnicChange} 
                          placeholder="35201-1234567-1" 
                          maxLength={15}
                          className={`bg-white font-mono text-zinc-950 font-semibold tracking-wider ${
                            fieldErrors.cnic ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20' : 'border-zinc-300 focus-visible:ring-zinc-400'
                          }`} 
                        />
                        {fieldErrors.cnic && (
                          <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.cnic}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Religion</Label>
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

                      {/* Blood Group with NA & N/A Options */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Blood Group</Label>
                        <SearchableSelect 
                          name="bloodGroup" 
                          value={formData.bloodGroup} 
                          onChange={handleInputChange} 
                          placeholder="Select Blood Group"
                          options={BLOOD_GROUPS} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Nationality</Label>
                        <Input name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="Pakistani" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                      </div>

                      {/* Caste (100% Optional) */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                          Caste <span className="text-zinc-400 font-normal normal-case">(Optional)</span>
                        </Label>
                        <Input name="caste" value={formData.caste} onChange={handleInputChange} placeholder="e.g. Rajput, Arain, etc." className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                      </div>

                      {/* Student Photo */}
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Student Photo <span className="text-zinc-400 font-normal normal-case">(Optional)</span></Label>
                        <div className="flex items-center gap-4">
                          {/* Photo preview circle */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative h-24 w-24 shrink-0 rounded-full border-2 border-dashed border-zinc-300 hover:border-[#084A86] bg-zinc-50 hover:bg-blue-50/30 overflow-hidden flex items-center justify-center cursor-pointer transition-all group"
                          >
                            {photoPreview ? (
                              <img
                                src={photoPreview}
                                alt="Student Photo"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                                }}
                                className="h-full w-full object-cover rounded-full"
                              />
                            ) : null}
                            <div className={`flex flex-col items-center gap-1 text-zinc-400 group-hover:text-[#084A86] ${photoPreview ? 'hidden' : 'flex'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              <span className="text-[10px] font-bold">Upload</span>
                            </div>
                          </div>
                          {/* Right side info */}
                          <div className="flex-1 space-y-2">
                            <p className="text-xs text-zinc-500">
                              {photoPreview ? (
                                <span className="text-emerald-600 font-semibold">✓ Photo selected: {selectedPhotoName}</span>
                              ) : (
                                'Click the circle to upload a student photo (JPG, PNG). Max 5MB.'
                              )}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-[#084A86] hover:bg-[#063b6d] text-white font-bold text-xs h-8 px-4 cursor-pointer"
                              >
                                {photoPreview ? 'Change Photo' : 'Browse Photo'}
                              </Button>
                              {photoPreview && (
                                <Button
                                  type="button"
                                  onClick={() => { setPhotoPreview(null); setSelectedPhotoName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                  className="bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300 font-bold text-xs h-8 px-3 cursor-pointer"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
</div>
                {/* Contact & Residential Information */}
                <div className="pt-6 border-t border-zinc-200">
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">CONTACT & RESIDENTIAL INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Student Phone</Label>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="03001234567" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Email Address <span className="text-zinc-400 font-normal normal-case">(Optional)</span></Label>
                      <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="student@example.com" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">City</Label>
                      <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Lahore, Islamabad" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Emergency Contact</Label>
                      <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} placeholder="03001234567" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Current Residential Address</Label>
                      <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} placeholder="House No, Street, Area, City" className="flex min-h-[75px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 font-medium text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"></textarea>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Permanent Address <span className="text-zinc-400 font-normal normal-case">(If different)</span></Label>
                      <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} placeholder="Permanent residential address" className="flex min-h-[75px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 font-medium text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Parents & Guardian Info */}
            {activeTab === 'PARENTS & GUARDIAN INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">FATHER INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Father Name</Label>
                      <Input name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father's full name" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Father Phone</Label>
                      <Input name="fatherPhone" value={formData.fatherPhone} onChange={handleInputChange} placeholder="0300-1234567" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Father Occupation</Label>
                      <Input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} placeholder="e.g. Businessman / Doctor" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-3">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Father CNIC</Label>
                      <Input 
                        name="fatherCnic" 
                        value={formData.fatherCnic} 
                        onChange={handleFatherCnicChange} 
                        placeholder="35201-1234567-1" 
                        maxLength={15}
                        className="bg-white border-zinc-300 text-zinc-950 font-mono tracking-wider focus-visible:ring-zinc-400 font-medium" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">MOTHER INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Mother Name</Label>
                      <Input name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="Mother's full name" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Mother Phone</Label>
                      <Input name="motherPhone" value={formData.motherPhone} onChange={handleInputChange} placeholder="0300-1234567" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Mother Occupation</Label>
                      <Input name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange} placeholder="e.g. Housewife / Teacher" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">GUARDIAN INFORMATION (IF ANY)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Guardian Name</Label>
                      <Input name="guardianName" value={formData.guardianName} onChange={handleInputChange} placeholder="Guardian name" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Relation</Label>
                      <Input name="guardianRelation" value={formData.guardianRelation} onChange={handleInputChange} placeholder="e.g. Uncle / Grandfather" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Guardian Phone</Label>
                      <Input name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} placeholder="0300-1234567" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-3">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Guardian Address</Label>
                      <textarea name="guardianAddress" value={formData.guardianAddress} onChange={handleInputChange} placeholder="Guardian complete address..." className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Document Info */}
            {activeTab === 'DOCUMENT INFO' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">ORIGINAL DOCUMENTS UPLOAD</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Transfer Certificate (TC) Scan (Original)</Label>
                      <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocChange(e, 'document1')} className="bg-white border-zinc-300 text-zinc-950 file:bg-[#084A86] file:text-white file:font-bold file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-[#063b6d] file:rounded-md cursor-pointer" />
                      <DocumentPreview preview={docPreviews.document1} error={docErrors.document1} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Transfer Certificate (TC) Number</Label>
                      <Input name="tcNo" value={formData.tcNo} onChange={handleInputChange} placeholder="e.g. TC-8921" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">CNIC / B-Form Front (Original)</Label>
                      <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocChange(e, 'cnicFront')} className="bg-white border-zinc-300 text-zinc-950 file:bg-[#084A86] file:text-white file:font-bold file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-[#063b6d] file:rounded-md cursor-pointer" />
                      <DocumentPreview preview={docPreviews.cnicFront} error={docErrors.cnicFront} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">CNIC / B-Form Back (Original)</Label>
                      <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocChange(e, 'cnicBack')} className="bg-white border-zinc-300 text-zinc-950 file:bg-[#084A86] file:text-white file:font-bold file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-[#063b6d] file:rounded-md cursor-pointer" />
                      <DocumentPreview preview={docPreviews.cnicBack} error={docErrors.cnicBack} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Previous Qualification</Label>
                      <SearchableSelect 
                        name="qualificationLevel" 
                        value={formData.qualificationLevel || ''} 
                        onChange={handleInputChange} 
                        placeholder="Select Qualification"
                        options={QUALIFICATION_LEVELS} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Qualification Certificate (Original)</Label>
                      <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocChange(e, 'qualificationDocument')} className="bg-white border-zinc-300 text-zinc-950 file:bg-[#084A86] file:text-white file:font-bold file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-[#063b6d] file:rounded-md cursor-pointer" />
                      <DocumentPreview preview={docPreviews.qualificationDocument} error={docErrors.qualificationDocument} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Previous School Info */}
            {activeTab === 'PREVIOUS SCHOOL INFORMATION' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-200 pb-2 mb-4">PREVIOUS SCHOOL DETAILS</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 uppercase">Qualification Covered</Label>
                      <SearchableSelect 
                        name="qualificationLevel" 
                        value={formData.qualificationLevel || ''} 
                        onChange={handleInputChange} 
                        placeholder="Select Qualification (e.g., Matric)"
                        options={QUALIFICATION_LEVELS} 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 uppercase">Institute Type</Label>
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
                      <Label className="text-xs font-bold text-zinc-700 uppercase">Institute Name</Label>
                      <Input name="previousSchoolName" value={formData.previousSchoolName} onChange={(e) => {
                        handleInputChange(e);
                        setFormData(prev => ({ ...prev, previousSchool: e.target.value }));
                      }} placeholder="e.g. Army Public School" className="bg-white border-zinc-300 focus-visible:ring-emerald-500" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 uppercase">Institute Address</Label>
                      <Input name="previousSchoolAddress" value={formData.previousSchoolAddress} onChange={handleInputChange} placeholder="City, Campus address" className="bg-white border-zinc-300 focus-visible:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Other Info */}
            {activeTab === 'OTHER INFO' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">CONTACT INFORMATION</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Phone Number</Label>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="03001234567" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Email Address <span className="text-zinc-400 font-normal normal-case">(Optional)</span></Label>
                      <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="student@example.com" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">City</Label>
                      <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Lahore, Islamabad" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Emergency Contact</Label>
                      <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} placeholder="03001234567" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Current Address</Label>
                      <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} placeholder="House No, Street, Area, City" className="flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 font-medium text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"></textarea>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Permanent Address <span className="text-zinc-400 font-normal normal-case">(If different)</span></Label>
                      <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} placeholder="Permanent residential address" className="flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 font-medium text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"></textarea>
                    </div>
                  </div>
                </div>

                {/* Health & Additional Notes */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2 mb-4">HEALTH & ADDITIONAL NOTES</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Medical History / Allergies</Label>
                      <Input name="medicalHistory" value={formData.medicalHistory} onChange={handleInputChange} placeholder="e.g. Asthmatic, No allergies, etc." className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Additional Remarks / Notes</Label>
                      <textarea name="otherInfo" value={formData.otherInfo} onChange={handleInputChange} placeholder="Special instructions or student history..." className="flex min-h-[120px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 font-medium text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Shift Buttons Bar */}
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
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? 'SAVING RECORD...' : 'SAVE STUDENT RECORD'}
                </Button>
              </div>
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
