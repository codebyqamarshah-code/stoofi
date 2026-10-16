'use client';

import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Plus, Calendar as CalendarIcon, Upload, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
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
  const fileInputRef = useRef(null);

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

  const handleRollChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, rollNo: val }));
    if (val && usedRolls.includes(val.trim())) {
      setRollDuplicate(true);
    } else {
      setRollDuplicate(false);
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
    return (sections.length > 0 ? sections : ['A', 'B', 'C', 'D']).map(s => {
      const val = typeof s === 'string' ? s : s.name;
      return { label: val, value: val };
    });
  };

  // Tab Navigation Handling
  const handleNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (activeTab === 'PERSONAL INFO') {
      if (!formData.className || !formData.section) {
        alert("Please select Class and Section before moving to next step.");
        return;
      }
      if (!formData.firstName || !formData.firstName.trim()) {
        alert("Please enter Student First Name.");
        return;
      }
      if (!formData.dob) {
        alert("Please select Date of Birth (Day, Month, Year).");
        return;
      }
      if (rollDuplicate) {
        alert(`Yeh Roll Number (${formData.rollNo}) pehle se is Class / Section mein use ho chuka hai. Doosra Roll Number enter karein.`);
        return;
      }
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
    if (!formData.academicYear || !formData.className || !formData.section || !formData.firstName || !formData.gender || !formData.dob) {
      setActiveTab('PERSONAL INFO');
      alert("Please fill all required fields in Personal Info (Class, Section, First Name, Gender, Date of Birth).");
      return;
    }

    if (rollDuplicate) {
      setActiveTab('PERSONAL INFO');
      alert(`Yeh Roll Number (${formData.rollNo}) pehle se Class ${formData.className} (${formData.section}) mein kisi student ko assign hai. Doosra Roll Number enter karein.`);
      return;
    }

    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        // Skip studentGroup if not chosen (100% optional, prevents Mongoose cast error)
        if (key === 'studentGroup') {
          if (formData[key] && String(formData[key]).trim() !== '') {
            dataToSubmit.append('studentGroup', formData[key]);
          }
          return;
        }
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
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
      alert(error.response?.data?.message || error.message || 'Error saving student');
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Academic Placement */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2">ACADEMIC PLACEMENT</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Academic Year <span className="text-rose-500">*</span></Label>
                      <SearchableSelect 
                        name="academicYear" 
                        value={formData.academicYear} 
                        onChange={handleInputChange} 
                        options={ACADEMIC_YEARS} 
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class <span className="text-rose-500">*</span></Label>
                        <SearchableSelect 
                          name="className" 
                          value={formData.className} 
                          onChange={handleInputChange} 
                          placeholder="Select Class *"
                          options={classes.map(c => ({ label: c.name, value: c.name }))} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section <span className="text-rose-500">*</span></Label>
                        <SearchableSelect 
                          name="section" 
                          value={formData.section} 
                          onChange={handleInputChange} 
                          placeholder={formData.className ? "Select Section *" : "Select Class first"}
                          options={getFilteredSections()} 
                        />
                      </div>
                      
                      {/* Student Group (100% Optional) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Student Group</Label>
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
                      </div>

                      {/* Admission Number (Auto-Increment, Fixed, Read-Only) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                            Admission Number <span className="text-rose-500">*</span>
                          </Label>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                            AUTO-ASSIGNED (FIXED)
                          </span>
                        </div>
                        <Input 
                          name="admissionNo" 
                          value={formData.admissionNo} 
                          readOnly 
                          disabled 
                          className="bg-zinc-100 border-zinc-300 text-zinc-950 font-bold cursor-not-allowed select-none shadow-xs text-sm" 
                        />
                        <p className="text-[11px] text-zinc-500 font-medium">Auto-generated sequential number.</p>
                      </div>

                      {/* Admission Date (Day / Month / Year Format) */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Admission Date</Label>
                        <DayMonthYearInput 
                          name="admissionDate" 
                          value={formData.admissionDate} 
                          onChange={handleInputChange} 
                          minYear={2020} 
                          maxYear={2030} 
                        />
                      </div>

                      {/* Roll Number (Auto-Increment & Duplicate Detection) */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                            Roll Number
                          </Label>
                          {loadingRoll ? (
                            <span className="text-[10px] text-zinc-500 font-medium">Checking...</span>
                          ) : rollDuplicate ? (
                            <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> ALREADY USED
                            </span>
                          ) : (
                            <span className="text-[10px] bg-blue-50 text-[#084A86] font-bold px-2 py-0.5 rounded border border-blue-200">
                              AUTO-INCREMENT
                            </span>
                          )}
                        </div>
                        <Input 
                          name="rollNo" 
                          value={formData.rollNo} 
                          onChange={handleRollChange} 
                          placeholder="e.g. 101" 
                          className={`bg-white font-medium ${
                            rollDuplicate 
                              ? 'border-rose-500 focus-visible:ring-rose-500 bg-rose-50/30 text-rose-950' 
                              : 'border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400'
                          }`} 
                        />
                        {rollDuplicate ? (
                          <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                            ⚠️ Yeh Roll Number ({formData.rollNo}) pehle se is Class / Section mein use ho chuka hai!
                          </p>
                        ) : (
                          <p className="text-[11px] text-zinc-500 font-medium">
                            Class منتخب کرنے پر نیا Roll Number خود بخود آ جائے گا۔
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
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
                </div>

                {/* Right Column: Personal Bio Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2">PERSONAL PROFILE</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">First Name <span className="text-rose-500">*</span></Label>
                        <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Last Name</Label>
                        <Input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
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
                        />
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
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">CNIC / B-Form Number</Label>
                        <Input name="cnic" value={formData.cnic} onChange={handleInputChange} placeholder="e.g. 35201-1234567-1" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Caste</Label>
                        <Input name="caste" value={formData.caste} onChange={handleInputChange} placeholder="Caste" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Student Photo</Label>
                        <div className="flex">
                          <div className="flex-1 bg-white border border-zinc-200 shadow-xs rounded-l-md px-3 py-2 text-sm text-zinc-950 flex items-center truncate">
                            {selectedPhotoName || 'Upload Photo (JPG, PNG)'}
                          </div>
                          <Button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-l-none bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg shadow-xs cursor-pointer">
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
                      <Input name="fatherCnic" value={formData.fatherCnic} onChange={handleInputChange} placeholder="35201-1234567-1" className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" />
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
