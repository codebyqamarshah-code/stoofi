'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  ChevronRight, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, 
  Upload, User, Shield, GraduationCap, FileText, CheckSquare, 
  CreditCard, Search, Plus, Trash2, Building, RefreshCw, Calendar,
  Layers, School, Phone, Mail, MapPin, Eye, BookOpen, AlertTriangle, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DobInput } from '@/components/ui/DobInput';
import academicApi from '@/lib/academicApi';
import api from '@/services/api';

const STEPS = [
  { id: 1, title: 'Student Identity', icon: User, desc: 'Personal details & ID' },
  { id: 2, title: 'Guardian & Family', icon: Shield, desc: 'Parents & emergency info' },
  { id: 3, title: 'Academic Selection', icon: School, desc: 'Program & offering choice' },
  { id: 4, title: 'Qualifications', icon: GraduationCap, desc: 'Previous academic history' },
  { id: 5, title: 'Program Fields', icon: Layers, desc: 'Specialized dynamic fields' },
  { id: 6, title: 'Documents Checklist', icon: CheckSquare, desc: 'Verification & uploads' },
  { id: 7, title: 'Fees & Final Review', icon: CreditCard, desc: 'Fee plan & confirmation' }
];

function formatCnic(val) {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

function StudentAdmissionWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown Data Collections
  const [campuses, setCampuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loadingOfferings, setLoadingOfferings] = useState(false);

  // Edit Mode & Existing student lookup state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [searchCnicQuery, setSearchCnicQuery] = useState('');
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [existingStudentFound, setExistingStudentFound] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Identity
    studentId: '', // If existing student
    admissionDate: new Date().toISOString().split('T')[0],
    admissionYear: String(new Date().getFullYear()),
    admissionNo: `ADM${String(new Date().getFullYear()).slice(-2)}0001`,
    rollNo: `PRC${String(new Date().getFullYear()).slice(-2)}0001`,
    previewAdmissionNo: `ADM${String(new Date().getFullYear()).slice(-2)}0001`,
    previewRollNo: `PRC${String(new Date().getFullYear()).slice(-2)}0001`,
    previewStudentCode: `STU-${new Date().getFullYear()}-0001`,
    
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '',
    cnic: '',
    nationality: 'Pakistani',
    religion: 'Islam',
    bloodGroup: 'B+',
    phone: '',
    whatsapp: '',
    email: '',
    residentialAddress: '',
    permanentAddress: '',
    sameAsResidential: true,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyRelationship: 'Father',
    photo: '',
    studentPhoto: '',
    photoUrl: '',

    // Step 2: Guardian
    fatherName: '',
    fatherCnic: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    guardianCnic: '',
    guardianOccupation: '',
    guardianAddress: '',
    isMinor: false,

    // Step 3: Academic Selection
    campusId: '',
    categoryId: '',
    programId: '',
    offeringId: '',
    batchId: '',
    sectionName: 'A',
    shift: 'Morning',
    admissionType: 'Regular', // Regular, Transfer, Self-Finance, Scholarship
    initialStage: 'Year 1 / Semester 1',

    // Step 4: Previous Qualifications (Multi-row)
    qualifications: [
      {
        qualification: 'Matriculation (SSC)',
        institution: '',
        awardingBody: 'BISE Lahore',
        completionYear: '2023',
        rollNumber: '',
        totalMarks: 1100,
        obtainedMarks: '',
        percentage: '',
        grade: 'A',
        resultStatus: 'Passed'
      }
    ],

    // Step 5: Program-Specific Dynamic Fields
    // Intermediate:
    boardRegNo: '',
    examRollNo: '',
    fscGroup: 'Pre-Medical',
    practicalCompleted: 'Yes',
    // BS / Undergrad:
    awardingUniRegNo: '',
    entrySemester: 'Semester 1',
    totalCreditHours: 130,
    creditTransferDetails: '',
    specializationTrack: 'Clinical Psychology',
    // Diploma / Technical:
    tradeName: 'Computer Applications',
    practicalHours: 120,
    certificationTrack: 'PBTE Certified',
    // Transfer:
    previousInstituteName: '',
    previousProgramStage: '',
    nocNumber: '',
    exemptedCredits: 0,

    // Step 6: Documents
    documents: [
      { docType: 'CNIC / B-Form of Student', status: 'Submitted', verified: false, file: null, preview: null },
      { docType: 'CNIC of Father / Guardian', status: 'Submitted', verified: false, file: null, preview: null },
      { docType: 'Previous Academic Result Card', status: 'Submitted', verified: false, file: null, preview: null },
      { docType: 'Character Certificate', status: 'Submitted', verified: false, file: null, preview: null },
      { docType: 'Passport Size Photographs (4)', status: 'Submitted', verified: false, file: null, preview: null }
    ],

    // Step 7: Fees & Concessions
    feeCriteria: 'Monthly',
    feeAdmission: 15000,
    feeTuition: 8000,
    feeTransport: 0,
    feeSecurity: 0,
    feeExam: 0,
    feeOther: 0,
    totalProgramFee: 600000,
    totalSemesters: 8,
    semesterFee: 75000,
    concessionType: 'None', // None, Percentage, Fixed
    concessionValue: 0,
    concessionReason: '',
    allowCapacityOverride: false,
    generateInvoice: true,
    invoiceNotes: 'Admission fee invoice generated automatically upon registration.'
  });

  // Selected offering object helper
  const selectedOffering = offerings.find(o => String(o._id) === String(formData.offeringId));
  const selectedBatch = batches.find(b => String(b._id) === String(formData.batchId));
  const selectedCategory = categories.find(c => String(c._id) === String(formData.categoryId));
  const selectedProgram = programs.find(p => String(p._id) === String(formData.programId));

  // Initial Data Load
  useEffect(() => {
    loadInitialDropdowns();
    handleYearChange(new Date().getFullYear());
  }, []);

  const loadInitialDropdowns = async () => {
    try {
      const [campRes, catRes] = await Promise.all([
        academicApi.getCampuses(),
        academicApi.getCategories()
      ]);
      if (campRes?.success && campRes.data?.length > 0) {
        setCampuses(campRes.data);
        setFormData(prev => ({ ...prev, campusId: campRes.data[0]._id }));
      }
      if (catRes?.success && catRes.data?.length > 0) {
        setCategories(catRes.data);
        setFormData(prev => ({ ...prev, categoryId: catRes.data[0]._id }));
      }
    } catch (e) {
      console.error('Error loading academic dropdowns:', e);
    }
  };

  // Reload programs when Category changes
  useEffect(() => {
    if (!formData.categoryId) return;
    const fetchPrograms = async () => {
      try {
        const res = await academicApi.getPrograms({ categoryId: formData.categoryId });
        if (res?.success) {
          setPrograms(res.data || []);
          if (res.data?.length > 0) {
            setFormData(prev => ({ ...prev, programId: res.data[0]._id }));
          } else {
            setFormData(prev => ({ ...prev, programId: '', offeringId: '', batchId: '' }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrograms();
  }, [formData.categoryId]);

  // Reload Offerings when Program or Campus changes
  useEffect(() => {
    if (!formData.programId) {
      setOfferings([]);
      return;
    }
    const fetchOfferings = async () => {
      setLoadingOfferings(true);
      try {
        const params = { programId: formData.programId, status: 'Approved' };
        if (formData.campusId) params.campusId = formData.campusId;
        const res = await academicApi.getOfferings(params);
        if (res?.success) {
          const approvedOfferings = (res.data || []).filter(o => o.status === 'Approved');
          setOfferings(approvedOfferings);
          if (approvedOfferings.length > 0) {
            setFormData(prev => ({ ...prev, offeringId: approvedOfferings[0]._id }));
          } else {
            setFormData(prev => ({ ...prev, offeringId: '', batchId: '' }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOfferings(false);
      }
    };
    fetchOfferings();
  }, [formData.programId, formData.campusId]);

  // Reload Batches when Offering changes
  useEffect(() => {
    if (!formData.offeringId) {
      setBatches([]);
      return;
    }
    const fetchBatches = async () => {
      try {
        const res = await academicApi.getBatches({ offeringId: formData.offeringId });
        if (res?.success) {
          const activeBatches = res.data || [];
          setBatches(activeBatches);
          if (activeBatches.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              batchId: activeBatches[0]._id,
              sectionName: activeBatches[0].sections?.[0] || 'A',
              shift: activeBatches[0].shift || 'Morning'
            }));
          } else {
            setFormData(prev => ({ ...prev, batchId: '' }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBatches();
  }, [formData.offeringId]);

  // Handle Year Change & Auto-fetch Admission and Roll Numbers
  const handleYearChange = async (yearVal) => {
    const year = parseInt(yearVal, 10) || new Date().getFullYear();
    const y2 = String(year).slice(-2);

    setFormData(prev => ({
      ...prev,
      admissionYear: String(year),
      admissionDate: prev.admissionDate ? `${year}-${prev.admissionDate.slice(5) || '08-15'}` : `${year}-08-15`
    }));

    try {
      const res = await academicApi.getNextNumbers(year);
      if (res?.success) {
        const admStr = res.admissionNo || res.nextAdmissionNo?.admissionNumber || res.nextAdmissionNo || `ADM${y2}0001`;
        const rollStr = res.rollNo || res.nextRollNumber?.rollNumber || res.nextRollNo || `PRC${y2}0001`;
        setFormData(prev => ({
          ...prev,
          admissionNo: admStr,
          rollNo: rollStr,
          previewAdmissionNo: admStr,
          previewRollNo: rollStr,
          previewStudentCode: res.nextStudentCode || `STU-${year}-0001`
        }));
      }
    } catch (e) {
      console.error('Error fetching numbers for year:', e);
    }
  };

  // Sync fee defaults when an offering is selected
  useEffect(() => {
    if (selectedOffering) {
      const plan = selectedOffering.feePlan || selectedOffering.feeStructure || {};
      setFormData(p => ({
        ...p,
        feeAdmission: plan.admissionFee !== undefined && plan.admissionFee !== 0 ? plan.admissionFee : p.feeAdmission,
        feeTuition: (plan.tuitionFeePerTerm || plan.tuitionFee) !== undefined && (plan.tuitionFeePerTerm || plan.tuitionFee) !== 0 ? (plan.tuitionFeePerTerm || plan.tuitionFee) : p.feeTuition,
        feeSecurity: plan.securityDeposit !== undefined && plan.securityDeposit !== 0 ? plan.securityDeposit : p.feeSecurity,
        feeExam: plan.examFee !== undefined && plan.examFee !== 0 ? plan.examFee : p.feeExam,
        feeOther: (plan.labFee || plan.labPracticalFee) !== undefined && (plan.labFee || plan.labPracticalFee) !== 0 ? (plan.labFee || plan.labPracticalFee) : p.feeOther
      }));
    }
  }, [selectedOffering?._id]);

  // Student Profile Picture Upload Handlers
  const photoInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Profile picture must be under 5MB.');
      return;
    }
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result;
      if (base64Data) {
        setFormData(prev => ({
          ...prev,
          photo: base64Data,
          studentPhoto: base64Data,
          photoUrl: base64Data
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: '',
      studentPhoto: '',
      photoUrl: ''
    }));
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // Load Student into Form for Full Editing or Multi-Enrollment
  const loadStudentIntoForm = (found, isFullEdit = true) => {
    setIsEditMode(isFullEdit);
    setEditingStudentId(found._id);
    setExistingStudentFound(found);

    const admYear = found.academicYear ? String(found.academicYear).slice(0, 4) : String(new Date().getFullYear());

    setFormData(prev => ({
      ...prev,
      studentId: found._id,
      photo: found.studentPhoto || found.photo || '',
      studentPhoto: found.studentPhoto || found.photo || '',
      photoUrl: found.studentPhoto || found.photo || '',
      admissionNo: found.admissionNo || prev.admissionNo,
      rollNo: found.rollNo || prev.rollNo,
      admissionYear: admYear,
      admissionDate: found.admissionDate || found.joiningDate || prev.admissionDate,
      firstName: found.firstName || found.studentName || found.name || '',
      lastName: found.lastName || '',
      dob: found.dob || '',
      gender: found.gender || 'Male',
      cnic: found.cnic || found.bForm || '',
      bForm: found.bForm || found.cnic || '',
      bloodGroup: found.bloodGroup || 'B+',
      religion: found.religion || 'Islam',
      nationality: found.nationality || 'Pakistani',
      phone: found.phone || '',
      whatsapp: found.whatsapp || found.phone || '',
      email: found.email || '',
      residentialAddress: found.residentialAddress || found.currentAddress || found.address || '',
      permanentAddress: found.permanentAddress || found.address || '',
      sameAsResidential: (found.permanentAddress === found.address) || !found.permanentAddress,
      fatherName: found.fatherName || found.father?.name || '',
      fatherCnic: found.fatherCnic || found.father?.cnic || '',
      fatherPhone: found.fatherPhone || found.father?.phone || '',
      fatherOccupation: found.fatherOccupation || found.father?.occupation || '',
      motherName: found.motherName || found.mother?.name || '',
      motherPhone: found.motherPhone || found.mother?.phone || '',
      motherOccupation: found.motherOccupation || found.mother?.occupation || '',
      guardianName: found.guardianName || found.guardian?.name || found.fatherName || '',
      guardianPhone: found.guardianPhone || found.guardian?.phone || found.fatherPhone || '',
      guardianRelation: found.guardianRelation || found.guardian?.relation || 'Father',
      guardianCnic: found.guardianCnic || found.guardian?.cnic || found.fatherCnic || '',
      guardianAddress: found.guardianAddress || found.guardian?.address || '',
      guardianOccupation: found.guardianOccupation || '',
      emergencyContactName: found.emergencyContactName || found.emergencyContact?.name || found.fatherName || '',
      emergencyContactPhone: found.emergencyContactPhone || found.emergencyContact?.phone || found.fatherPhone || found.phone || '',
      emergencyRelationship: found.emergencyContactRelation || found.emergencyContact?.relationship || 'Father',
      previewStudentCode: found.studentCode || prev.previewStudentCode,
      previewAdmissionNo: found.admissionNo || prev.previewAdmissionNo,
      previewRollNo: found.rollNo || prev.previewRollNo,
      qualifications: Array.isArray(found.qualifications) && found.qualifications.length > 0 ? found.qualifications : prev.qualifications
    }));

    setSuccessMsg(
      isFullEdit 
        ? `Loaded ${found.firstName} ${found.lastName || ''} (${found.admissionNo || found.rollNo}) into Edit Mode. You can update any field across all steps.`
        : `Student record found: ${found.firstName} ${found.lastName || ''}. Details pre-filled for new enrollment.`
    );
  };

  const resetToNewStudent = () => {
    setIsEditMode(false);
    setEditingStudentId(null);
    setExistingStudentFound(null);
    setSearchCnicQuery('');
    if (photoInputRef.current) photoInputRef.current.value = '';
    setFormData(prev => ({
      ...prev,
      studentId: '',
      photo: '',
      studentPhoto: '',
      photoUrl: '',
      firstName: '',
      lastName: '',
      dob: '',
      cnic: '',
      bForm: '',
      phone: '',
      whatsapp: '',
      email: '',
      residentialAddress: '',
      permanentAddress: '',
      fatherName: '',
      fatherCnic: '',
      fatherPhone: '',
      fatherOccupation: '',
      motherName: '',
      motherPhone: '',
      guardianName: '',
      guardianPhone: ''
    }));
    setSuccessMsg('Switched back to New Admission Mode.');
  };

  // Check URL query parameters for student edit request
  useEffect(() => {
    const editId = searchParams.get('id') || searchParams.get('edit') || searchParams.get('studentId');
    const admNo = searchParams.get('admissionNo') || searchParams.get('adm');
    if (editId) {
      api.get(`/student/${editId}`).then(res => {
        const s = res?.data || (res?._id ? res : null);
        if (s) {
          loadStudentIntoForm(s, true);
        }
      }).catch(err => console.error('Failed to load edit student by ID:', err));
    } else if (admNo) {
      academicApi.searchExistingStudent(admNo).then(res => {
        if (res?.success && res.data?.length > 0) {
          loadStudentIntoForm(res.data[0], true);
        }
      }).catch(err => console.error('Failed to load edit student by admNo:', err));
    }
  }, [searchParams]);

  // Existing Student Lookup (Multi-enrollment & Edit Search)
  const handleSearchStudent = async () => {
    if (!searchCnicQuery.trim()) return;
    setSearchingStudent(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const searchFn = academicApi.searchExistingStudent || academicApi.searchStudents;
      const res = await searchFn(searchCnicQuery.trim());
      if (res?.success && res.data?.length > 0) {
        const found = res.data[0];
        loadStudentIntoForm(found, true);
      } else {
        setErrorMsg(`No existing student found matching "${searchCnicQuery}". You can proceed with a new admission.`);
        setExistingStudentFound(null);
      }
    } catch (err) {
      console.error('Search student error:', err);
      setErrorMsg(err?.message || 'Failed to search student record.');
    } finally {
      setSearchingStudent(false);
    }
  };

  // Qualification Table Handlers
  const handleAddQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        {
          qualification: 'Intermediate (HSSC)',
          institution: '',
          awardingBody: 'BISE Lahore',
          completionYear: '2025',
          rollNumber: '',
          totalMarks: 1100,
          obtainedMarks: '',
          percentage: '',
          grade: 'A',
          resultStatus: 'Passed'
        }
      ]
    }));
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleQualificationChange = (index, field, value) => {
    setFormData(prev => {
      const list = [...prev.qualifications];
      list[index] = { ...list[index], [field]: value };
      
      // Auto-calculate percentage
      if (field === 'obtainedMarks' || field === 'totalMarks') {
        const obt = parseFloat(list[index].obtainedMarks) || 0;
        const tot = parseFloat(list[index].totalMarks) || 0;
        if (tot > 0 && obt >= 0) {
          list[index].percentage = ((obt / tot) * 100).toFixed(1) + '%';
        }
      }
      return { ...prev, qualifications: list };
    });
  };

  // Fees Calculation (Editable inputs from formData)
  const feeAdmission = parseFloat(formData.feeAdmission) || 0;
  const feeTuition = parseFloat(formData.feeTuition) || 0;
  const feeTransport = parseFloat(formData.feeTransport) || 0;
  const feeSecurity = parseFloat(formData.feeSecurity) || 0;
  const feeExam = parseFloat(formData.feeExam) || 0;
  const feeOther = parseFloat(formData.feeOther) || 0;
  const feeGross = feeAdmission + feeTuition + feeTransport + feeSecurity + feeExam + feeOther;

  let concessionDiscount = 0;
  if (formData.concessionType === 'Percentage') {
    concessionDiscount = (feeGross * (parseFloat(formData.concessionValue) || 0)) / 100;
  } else if (formData.concessionType === 'Fixed') {
    concessionDiscount = parseFloat(formData.concessionValue) || 0;
  }
  const feeNetPayable = Math.max(0, feeGross - concessionDiscount);

  // Step Validation & Navigation
  const validateStep = (step) => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.firstName.trim()) {
        setErrorMsg('Please enter Student First Name.');
        return false;
      }
      if (!formData.admissionDate) {
        setErrorMsg('Please enter Admission Date.');
        return false;
      }
      if (!formData.phone.trim()) {
        setErrorMsg('Please enter Student or Contact Phone Number.');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.fatherName.trim() && !formData.guardianName.trim()) {
        setErrorMsg("Please enter Father's Name or Guardian's Name.");
        return false;
      }
      if (!formData.guardianPhone.trim() && !formData.fatherPhone.trim()) {
        setErrorMsg('Guardian or Father Contact Phone is required.');
        return false;
      }
    }
    if (step === 3) {
      if (!formData.offeringId) {
        setErrorMsg('Please select an active, approved Program Offering.');
        return false;
      }
      if (selectedOffering && selectedOffering.status !== 'Approved') {
        setErrorMsg(`Selected offering is "${selectedOffering.status}" and cannot accept admissions.`);
        return false;
      }
      if (selectedOffering?.seatCapacity && selectedOffering.enrolledCount >= selectedOffering.seatCapacity) {
        if (!formData.allowCapacityOverride) {
          setErrorMsg(`Offering capacity reached (${selectedOffering.enrolledCount}/${selectedOffering.seatCapacity}). Enable Capacity Override in Step 7 to proceed.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Form Submission
  const handleSubmitAdmission = async () => {
    if (!isEditMode && !validateStep(3)) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const sFullName = `${formData.firstName} ${formData.lastName || ''}`.trim();

      if (isEditMode && editingStudentId) {
        const updatePayload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          name: sFullName,
          fullName: sFullName,
          studentName: sFullName,
          studentPhoto: formData.studentPhoto || formData.photo || undefined,
          photo: formData.studentPhoto || formData.photo || undefined,
          admissionNo: formData.admissionNo.trim(),
          rollNo: formData.rollNo.trim(),
          academicYear: formData.admissionYear,
          admissionDate: formData.admissionDate,
          gender: formData.gender,
          dob: formData.dob || undefined,
          cnic: formData.cnic ? formData.cnic.trim() : undefined,
          bForm: formData.bForm ? formData.bForm.trim() : (formData.cnic ? formData.cnic.trim() : undefined),
          nationality: formData.nationality,
          religion: formData.religion,
          bloodGroup: formData.bloodGroup,
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
          email: formData.email.trim() || undefined,
          address: formData.residentialAddress.trim(),
          currentAddress: formData.residentialAddress.trim(),
          residentialAddress: formData.residentialAddress.trim(),
          permanentAddress: (formData.sameAsResidential ? formData.residentialAddress : formData.permanentAddress).trim(),
          emergencyContact: {
            name: formData.emergencyContactName || formData.fatherName,
            phone: formData.emergencyContactPhone || formData.fatherPhone || formData.phone,
            relationship: formData.emergencyRelationship || 'Guardian'
          },
          emergencyContactName: formData.emergencyContactName || formData.fatherName,
          emergencyContactPhone: formData.emergencyContactPhone || formData.fatherPhone || formData.phone,
          emergencyContactRelation: formData.emergencyRelationship || 'Guardian',
          fatherName: formData.fatherName.trim(),
          fatherCnic: formData.fatherCnic.trim(),
          fatherPhone: formData.fatherPhone.trim(),
          fatherOccupation: formData.fatherOccupation.trim(),
          motherName: formData.motherName.trim(),
          motherPhone: formData.motherPhone.trim(),
          motherOccupation: formData.motherOccupation.trim(),
          guardian: {
            name: formData.guardianName.trim() || formData.fatherName.trim(),
            relation: formData.guardianRelation || 'Father',
            phone: formData.guardianPhone.trim() || formData.fatherPhone.trim(),
            cnic: formData.guardianCnic.trim() || formData.fatherCnic.trim(),
            occupation: formData.guardianOccupation.trim(),
            address: formData.guardianAddress.trim() || formData.residentialAddress.trim()
          },
          guardianName: formData.guardianName.trim() || formData.fatherName.trim(),
          guardianRelation: formData.guardianRelation || 'Father',
          guardianPhone: formData.guardianPhone.trim() || formData.fatherPhone.trim(),
          guardianCnic: formData.guardianCnic.trim() || formData.fatherCnic.trim(),
          qualifications: (Array.isArray(formData.qualifications) ? formData.qualifications : []).filter(q => q && q.qualification && (q.institution || q.awardingBody))
        };

        const updateRes = await api.put(`/student/${editingStudentId}`, updatePayload);
        if (updateRes && updateRes.success) {
          setSuccessMsg(`Student profile updated successfully! Admission No: ${formData.admissionNo}`);
          setTimeout(() => {
            router.push(`/dashboard/students/${editingStudentId}`);
          }, 1500);
          return;
        } else {
          setErrorMsg(updateRes?.message || 'Failed to update student profile.');
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        studentId: formData.studentId || undefined,
        studentName: sFullName,
        name: sFullName,
        fullName: sFullName,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        studentPhoto: formData.studentPhoto || formData.photo || '',
        photo: formData.studentPhoto || formData.photo || '',
        gender: formData.gender,
        dob: formData.dob || undefined,
        cnic: formData.cnic ? formData.cnic.trim() : undefined,
        bForm: formData.bForm ? formData.bForm.trim() : (formData.cnic ? formData.cnic.trim() : undefined),
        nationality: formData.nationality,
        religion: formData.religion,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.residentialAddress.trim(),
        currentAddress: formData.residentialAddress.trim(),
        residentialAddress: formData.residentialAddress.trim(),
        permanentAddress: (formData.sameAsResidential ? formData.residentialAddress : formData.permanentAddress).trim(),
        emergencyContact: {
          name: formData.emergencyContactName || formData.fatherName,
          phone: formData.emergencyContactPhone || formData.fatherPhone || formData.phone,
          relationship: formData.emergencyRelationship || 'Guardian'
        },
        fatherName: formData.fatherName.trim(),
        fatherCnic: formData.fatherCnic.trim(),
        fatherPhone: formData.fatherPhone.trim(),
        fatherOccupation: formData.fatherOccupation.trim(),
        motherName: formData.motherName.trim(),
        motherPhone: formData.motherPhone.trim(),
        motherOccupation: formData.motherOccupation.trim(),
        guardian: {
          name: formData.guardianName.trim() || formData.fatherName.trim(),
          relation: formData.guardianRelation || 'Father',
          phone: formData.guardianPhone.trim() || formData.fatherPhone.trim(),
          cnic: formData.guardianCnic.trim() || formData.fatherCnic.trim(),
          occupation: formData.guardianOccupation.trim(),
          address: formData.guardianAddress.trim() || formData.residentialAddress.trim()
        },
        // Academic & Offering Selection
        campusId: formData.campusId || undefined,
        categoryId: formData.categoryId || undefined,
        programId: formData.programId || undefined,
        offeringId: formData.offeringId,
        batchId: formData.batchId || undefined,
        sectionName: formData.sectionName || 'A',
        shift: formData.shift || 'Morning',
        admissionType: formData.admissionType || 'Regular',
        initialStage: formData.initialStage || 'Year 1 / Semester 1',
        admissionNo: formData.admissionNo.trim(),
        rollNo: formData.rollNo.trim(),
        admissionDate: formData.admissionDate,
        admissionYear: formData.admissionYear,
        allowCapacityOverride: formData.allowCapacityOverride,

        // Step 4: Qualifications
        qualifications: (Array.isArray(formData.qualifications) ? formData.qualifications : []).filter(q => q && q.qualification && (q.institution || q.awardingBody)),

        // Step 5: Program-specific dynamic data
        programSpecificData: {
          boardRegNo: formData.boardRegNo,
          examRollNo: formData.examRollNo,
          fscGroup: formData.fscGroup,
          practicalCompleted: formData.practicalCompleted,
          awardingUniRegNo: formData.awardingUniRegNo,
          entrySemester: formData.entrySemester,
          totalCreditHours: formData.totalCreditHours,
          creditTransferDetails: formData.creditTransferDetails,
          specializationTrack: formData.specializationTrack,
          tradeName: formData.tradeName,
          practicalHours: formData.practicalHours,
          certificationTrack: formData.certificationTrack,
          previousInstituteName: formData.previousInstituteName,
          previousProgramStage: formData.previousProgramStage,
          nocNumber: formData.nocNumber,
          exemptedCredits: formData.exemptedCredits
        },

        // Step 6: Documents
        documents: (Array.isArray(formData.documents) ? formData.documents : []).map(d => ({
          docType: d?.docType || '',
          status: d?.status || '',
          verified: d?.verified || false,
          documentUrl: d?.preview || ''
        })),

        // Step 7: Fee & Concessions
        feeCriteria: formData.feeCriteria || 'Monthly',
        feeAdmission,
        feeTuition,
        feeTransport,
        feeSecurity,
        feeExam,
        feeOther,
        feeGross,
        totalProgramFee: parseFloat(formData.totalProgramFee) || 0,
        totalSemesters: parseInt(formData.totalSemesters, 10) || 8,
        semesterFee: parseFloat(formData.semesterFee) || 0,
        concessionType: formData.concessionType,
        concessionValue: parseFloat(formData.concessionValue) || 0,
        concessionDiscount,
        netPayable: feeNetPayable,
        feeNetPayable,
        feePlan: {
          feeCriteria: formData.feeCriteria || 'Monthly',
          admissionFee: feeAdmission,
          tuitionFee: feeTuition,
          transportFee: feeTransport,
          securityDeposit: feeSecurity,
          examFee: feeExam,
          labFee: feeOther,
          totalProgramFee: parseFloat(formData.totalProgramFee) || 0,
          totalSemesters: parseInt(formData.totalSemesters, 10) || 8,
          semesterFee: parseFloat(formData.semesterFee) || 0,
          grossTotal: feeGross,
          concessionType: formData.concessionType,
          concessionValue: parseFloat(formData.concessionValue) || 0,
          concessionDiscount: concessionDiscount,
          netPayable: feeNetPayable,
          generateInvoice: formData.generateInvoice,
          invoiceNotes: formData.invoiceNotes
        }
      };

      const res = await academicApi.submitAdmission(payload);
      if (res?.success) {
        setSuccessMsg(
          `Student Admission Confirmed Successfully! Admission No: ${res.admissionNo} | Roll No: ${res.rollNo} | Code: ${res.studentCode}`
        );
        setTimeout(() => {
          if (res.studentId) {
            router.push(`/dashboard/students/${res.studentId}`);
          } else {
            router.push('/dashboard/students');
          }
        }, 2200);
      } else {
        setErrorMsg(res?.message || 'Failed to submit student admission.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Error occurred while saving admission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span>Student Management</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Academic Admission</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
            New Student Admission & Program Enrollment
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Dynamic 7-step enrollment wizard supporting permanent student profiles and offering-based enrollments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/academics/programs">
            <Button variant="outline" size="sm" className="text-xs font-medium border-zinc-300 dark:border-zinc-700">
              <School className="w-3.5 h-3.5 mr-1.5" /> Programs & Offerings
            </Button>
          </Link>
          <Link href="/dashboard/students">
            <Button variant="ghost" size="sm" className="text-xs font-medium">
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Edit Mode Banner */}
      {isEditMode && (
        <div className="bg-[#009966] text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Live Edit Mode: {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-xs text-emerald-100 font-mono mt-0.5">
                Adm: {formData.admissionNo} • Roll: {formData.rollNo} • All 7 wizard steps loaded with database records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetToNewStudent}
            className="text-xs bg-white text-emerald-900 hover:bg-emerald-50 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0"
          >
            Switch to New Admission Mode
          </button>
        </div>
      )}

      {/* Existing Student Search Banner (Multi-Enrollment & Profile Editing) */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                Edit Existing Student or Add New Enrollment?
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Search by Name, Roll #, Admission #, or CNIC to load complete profile data for editing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search Name, Roll, Adm, CNIC (e.g. Kinza, ADM260051)..."
              value={searchCnicQuery}
              onChange={(e) => setSearchCnicQuery(e.target.value)}
              className="bg-white dark:bg-zinc-900 text-xs h-9 w-full sm:w-72"
            />
            <Button
              size="sm"
              onClick={handleSearchStudent}
              disabled={searchingStudent || !searchCnicQuery}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
            >
              {searchingStudent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5 mr-1" />}
              Search
            </Button>
          </div>
        </div>

        {existingStudentFound && (
          <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Found Student: <strong>{existingStudentFound.firstName} {existingStudentFound.lastName}</strong> (Adm: <strong>{existingStudentFound.admissionNo || 'N/A'}</strong> | Roll: <strong>{existingStudentFound.rollNo || 'N/A'}</strong>)
              </span>
              {isEditMode && (
                <span className="bg-[#009966] text-white font-bold text-[10px] px-2 py-0.5 rounded-full ml-1">
                  Editing Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => loadStudentIntoForm(existingStudentFound, true)}
                className="h-7 text-[11px] bg-[#009966] hover:bg-[#007a52] text-white font-semibold"
              >
                Load All Details for Edit
              </Button>
              <button
                type="button"
                onClick={resetToNewStudent}
                className="text-xs text-rose-600 hover:underline font-semibold ml-2 cursor-pointer"
              >
                Clear / New Student Mode
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STEPS.map((s) => {
          const StepIcon = s.icon;
          const isActive = currentStep === s.id;
          const isPassed = currentStep > s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                if (s.id < currentStep || validateStep(currentStep)) {
                  setCurrentStep(s.id);
                }
              }}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                  : isPassed
                  ? 'border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-emerald-600 text-white' : isPassed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  Step {s.id}
                </span>
                <StepIcon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : isPassed ? 'text-emerald-500' : 'text-zinc-400'}`} />
              </div>
              <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-zinc-900 dark:text-white' : ''}`}>
                {s.title}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                {s.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STEP CONTENT CONTAINER */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Quick Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Step {currentStep} of {STEPS.length}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {STEPS[currentStep - 1]?.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {STEPS[currentStep - 1]?.desc}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentStep === 1 || submitting}
              onClick={handlePrev}
              className="text-xs h-8 px-3 font-semibold"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Back
            </Button>

            {currentStep < 7 ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-4 font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>Next ({currentStep + 1}/7)</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitAdmission}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-4 font-bold shadow-xs flex items-center gap-1.5"
              >
                {submitting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                <span>Confirm Admission</span>
              </Button>
            )}
          </div>
        </div>

        {/* ================= STEP 1: STUDENT IDENTITY ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Academic Session, Admission No & Roll No Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 via-zinc-50 to-teal-50/50 dark:from-zinc-800/80 dark:to-zinc-800/40 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 dark:border-zinc-700 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ID
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                      Academic Session & Identification Numbers
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Selecting year auto-calculates ADM{formData.admissionYear.slice(-2)} / PRC{formData.admissionYear.slice(-2)} sequence. Both numbers are editable.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300">
                    Session: {formData.admissionYear}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Code: {formData.previewStudentCode}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Year Dropdown */}
                <div>
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>Admission Year / Session *</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Live Sequence</span>
                  </Label>
                  <select
                    value={formData.admissionYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full mt-1.5 text-xs font-bold h-10 rounded-xl border-2 border-emerald-400 dark:border-emerald-700 bg-white dark:bg-zinc-900 px-3 text-zinc-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {[
                      { label: '2027 (Session 2027-2028)', value: '2027' },
                      { label: '2026 (Session 2026-2027)', value: '2026' },
                      { label: '2025 (Session 2025-2026)', value: '2025' },
                      { label: '2024 (Session 2024-2025)', value: '2024' },
                      { label: '2023 (Session 2023-2024)', value: '2023' },
                      { label: '2022 (Session 2022-2023)', value: '2022' }
                    ].map(y => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 block">
                    Prefix: ADM{formData.admissionYear.slice(-2)} / PRC{formData.admissionYear.slice(-2)}
                  </span>
                </div>

                {/* Admission Number */}
                <div>
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>Admission Number *</span>
                    <span className="text-[10px] font-normal text-emerald-600">Editable</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    placeholder={`e.g. ADM${formData.admissionYear.slice(-2)}0001`}
                    className="mt-1.5 font-mono font-extrabold text-xs h-10 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Continuous student admission ID
                  </span>
                </div>

                {/* Roll Number */}
                <div>
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>Roll Number *</span>
                    <span className="text-[10px] font-normal text-emerald-600">Editable</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder={`e.g. PRC${formData.admissionYear.slice(-2)}0001`}
                    className="mt-1.5 font-mono font-extrabold text-xs h-10 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Continuous student academic roll
                  </span>
                </div>
              </div>
            </div>

            {/* Student Photo Upload Card */}
            <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shadow-inner">
                  {formData.photo || formData.studentPhoto ? (
                    <img 
                      src={formData.photo || formData.studentPhoto} 
                      alt="Student Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                      <User className="w-10 h-10 stroke-[1.5] text-emerald-600/70 dark:text-emerald-400/70" />
                      <span className="text-[10px] font-medium mt-1">No Photo</span>
                    </div>
                  )}
                </div>
                {(formData.photo || formData.studentPhoto) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Student Profile Photograph
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ID Card & Portal Profile
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Upload a clear passport-size photograph (blue or white background). Supports JPG, PNG, WebP up to 5MB.
                </p>
                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    type="file"
                    ref={photoInputRef}
                    onChange={handlePhotoChange}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    id="student-photo-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                    className="h-8 text-xs font-semibold flex items-center gap-1.5 border-emerald-300 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    {formData.photo || formData.studentPhoto ? 'Change Photo' : 'Upload Student Photo'}
                  </Button>
                  {(formData.photo || formData.studentPhoto) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Admission Date *</Label>
                <Input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">First Name *</Label>
                <Input
                  type="text"
                  placeholder="e.g. Muhammad"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Last / Family Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Ali"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <DobInput
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={(val) => setFormData({ ...formData, dob: val })}
                  minYear={1980}
                  maxYear={2026}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Gender</Label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold">CNIC / B-Form No</Label>
                <Input
                  type="text"
                  placeholder="35202-1234567-1"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: formatCnic(e.target.value) })}
                  className="mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Blood Group</Label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Student / Primary Phone *</Label>
                <Input
                  type="text"
                  placeholder="0300-1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">WhatsApp Number</Label>
                <Input
                  type="text"
                  placeholder="0300-1234567"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Email Address</Label>
                <Input
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Residential Address</Label>
                <textarea
                  rows={2}
                  value={formData.residentialAddress}
                  onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                  placeholder="Current living address, street, city..."
                  className="w-full mt-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Permanent Address</Label>
                  <label className="text-[11px] text-zinc-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sameAsResidential}
                      onChange={(e) => setFormData({ ...formData, sameAsResidential: e.target.checked })}
                      className="rounded"
                    />
                    Same as residential
                  </label>
                </div>
                <textarea
                  rows={2}
                  disabled={formData.sameAsResidential}
                  value={formData.sameAsResidential ? formData.residentialAddress : formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  placeholder="Permanent native address..."
                  className="w-full mt-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 disabled:bg-zinc-100 dark:disabled:bg-zinc-800"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                Emergency Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Contact Person Name</Label>
                  <Input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="e.g. Aslam Khan"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Emergency Phone</Label>
                  <Input
                    type="text"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="0300-0000000"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Relationship</Label>
                  <Input
                    type="text"
                    value={formData.emergencyRelationship}
                    onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                    placeholder="e.g. Uncle / Brother"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: GUARDIAN & FAMILY ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Step 2: Parents & Guardian Details
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Provides reusable guardian records and family emergency notification channels.
              </p>
            </div>

            {/* Father Details */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Father Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Father Full Name *</Label>
                  <Input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Father Name"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Father CNIC</Label>
                  <Input
                    type="text"
                    value={formData.fatherCnic}
                    onChange={(e) => setFormData({ ...formData, fatherCnic: formatCnic(e.target.value) })}
                    placeholder="35202-0000000-0"
                    className="mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Father Phone</Label>
                  <Input
                    type="text"
                    value={formData.fatherPhone}
                    onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                    placeholder="0300-0000000"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Father Occupation</Label>
                  <Input
                    type="text"
                    value={formData.fatherOccupation}
                    onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                    placeholder="e.g. Government Officer / Business"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Mother Details */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" /> Mother Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Mother Name</Label>
                  <Input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="Mother Name"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Mother Phone</Label>
                  <Input
                    type="text"
                    value={formData.motherPhone}
                    onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                    placeholder="0300-0000000"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Mother Occupation</Label>
                  <Input
                    type="text"
                    value={formData.motherOccupation}
                    onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                    placeholder="e.g. Teacher / Housewife"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Designated Guardian */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" /> Designated Legal Guardian
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      guardianName: prev.fatherName,
                      guardianCnic: prev.fatherCnic,
                      guardianPhone: prev.fatherPhone,
                      guardianOccupation: prev.fatherOccupation,
                      guardianRelation: 'Father'
                    }));
                  }}
                  className="text-[11px] h-7 px-2"
                >
                  Copy from Father
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Guardian Name *</Label>
                  <Input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="Guardian Name"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Relationship *</Label>
                  <Input
                    type="text"
                    value={formData.guardianRelation}
                    onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                    placeholder="Father / Mother / Brother"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Guardian Phone *</Label>
                  <Input
                    type="text"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    placeholder="0300-0000000"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Guardian CNIC</Label>
                  <Input
                    type="text"
                    value={formData.guardianCnic}
                    onChange={(e) => setFormData({ ...formData, guardianCnic: formatCnic(e.target.value) })}
                    placeholder="35202-0000000-0"
                    className="mt-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ACADEMIC SELECTION ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Step 3: Academic Program & Offering Selection
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Enforce hierarchy: Campus → Academic Category → Program → Approved Program Offering → Batch/Section.
              </p>
            </div>

            {/* Dependent Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">1. Select Campus *</Label>
                <select
                  value={formData.campusId}
                  onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                  className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                >
                  {(Array.isArray(campuses) ? campuses : []).map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">2. Academic Category *</Label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                >
                  {(Array.isArray(categories) ? categories : []).map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">3. Select Program *</Label>
                <select
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                  className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                >
                  {(!Array.isArray(programs) || programs.length === 0) && <option value="">No programs available</option>}
                  {(Array.isArray(programs) ? programs : []).map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Approved Offerings Picker */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                    4. Select Approved Program Offering *
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Only approved, active offerings with available seat capacity can be selected for enrollment.
                  </p>
                </div>
                {loadingOfferings && <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />}
              </div>

              {(!Array.isArray(offerings) || offerings.length === 0) ? (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>No approved offerings available for this program on the selected campus. Please create an offering in <strong>Academics → Programs & Offerings</strong>.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Array.isArray(offerings) ? offerings : []).map(offering => {
                    const isSelected = String(offering._id) === String(formData.offeringId);
                    const isCapacityFull = offering.seatCapacity && offering.enrolledCount >= offering.seatCapacity;
                    return (
                      <div
                        key={offering._id}
                        onClick={() => {
                          if (offering.status === 'Approved') {
                            setFormData(prev => ({ ...prev, offeringId: offering._id }));
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 ring-1 ring-emerald-600'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{offering.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                            {offering.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <div>Affiliation: <span className="font-medium text-zinc-700 dark:text-zinc-300">{offering.affiliationId?.name || 'Authorized Body'}</span></div>
                          <div>Session: <span className="font-medium text-zinc-700 dark:text-zinc-300">{offering.academicSession || 'Current'}</span></div>
                          <div>Duration: <span className="font-medium text-zinc-700 dark:text-zinc-300">{offering.durationMonths ? `${offering.durationMonths} Mo` : '2 Years'}</span></div>
                          <div>
                            Seats: <span className={`font-semibold ${isCapacityFull ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {offering.enrolledCount || 0} / {offering.seatCapacity || 50}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Batch, Section, Shift, Admission Type */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
              <div>
                <Label className="text-xs font-semibold">Batch Assignment</Label>
                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                >
                  {(Array.isArray(batches) ? batches : []).map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                  {(!Array.isArray(batches) || batches.length === 0) && <option value="">Default Batch (Auto)</option>}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Section</Label>
                <select
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                >
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Shift</Label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Weekend">Weekend</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Admission Type</Label>
                <select
                  value={formData.admissionType}
                  onChange={(e) => setFormData({ ...formData, admissionType: e.target.value })}
                  className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                >
                  <option value="Regular">Regular</option>
                  <option value="Transfer">Transfer / Migration</option>
                  <option value="Self-Finance">Self-Finance</option>
                  <option value="Scholarship">Scholarship</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: PREVIOUS QUALIFICATIONS ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Step 4: Previous Academic Qualifications
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Support multiple prior degrees, boards, roll numbers, and examination records.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddQualification}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Qualification
              </Button>
            </div>

            <div className="space-y-4">
              {formData.qualifications.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Qualification Record #{idx + 1}
                    </span>
                    {formData.qualifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(idx)}
                        className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Degree / Certificate *</Label>
                      <Input
                        type="text"
                        value={q.qualification}
                        onChange={(e) => handleQualificationChange(idx, 'qualification', e.target.value)}
                        placeholder="e.g. Matric / FSc / O-Levels"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Awarding Board / University *</Label>
                      <Input
                        type="text"
                        value={q.awardingBody}
                        onChange={(e) => handleQualificationChange(idx, 'awardingBody', e.target.value)}
                        placeholder="e.g. BISE Lahore / Punjab University"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Previous School / College</Label>
                      <Input
                        type="text"
                        value={q.institution}
                        onChange={(e) => handleQualificationChange(idx, 'institution', e.target.value)}
                        placeholder="Institution name"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <Label className="text-xs">Passing Year</Label>
                      <Input
                        type="text"
                        value={q.completionYear}
                        onChange={(e) => handleQualificationChange(idx, 'completionYear', e.target.value)}
                        placeholder="2024"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Roll Number</Label>
                      <Input
                        type="text"
                        value={q.rollNumber}
                        onChange={(e) => handleQualificationChange(idx, 'rollNumber', e.target.value)}
                        placeholder="e.g. 543210"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total Marks</Label>
                      <Input
                        type="number"
                        value={q.totalMarks}
                        onChange={(e) => handleQualificationChange(idx, 'totalMarks', e.target.value)}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Obtained Marks</Label>
                      <Input
                        type="number"
                        value={q.obtainedMarks}
                        onChange={(e) => handleQualificationChange(idx, 'obtainedMarks', e.target.value)}
                        placeholder="e.g. 980"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Percentage / Grade</Label>
                      <Input
                        type="text"
                        readOnly
                        value={q.percentage ? `${q.percentage} (${q.grade || 'Passed'})` : ''}
                        placeholder="Auto"
                        className="mt-1 text-xs bg-zinc-100 dark:bg-zinc-800 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 5: PROGRAM-SPECIFIC FIELDS ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Step 5: Dynamic Program-Specific Configuration
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Fields adapt according to the selected program ({selectedProgram?.name || 'Selected Program'}).
              </p>
            </div>

            {/* Intermediate / F.Sc Section */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                Intermediate / F.Sc / HSSC Stream Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Board Registration No</Label>
                  <Input
                    type="text"
                    value={formData.boardRegNo}
                    onChange={(e) => setFormData({ ...formData, boardRegNo: e.target.value })}
                    placeholder="e.g. 123-B-LHR-2024"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Exam Roll Number</Label>
                  <Input
                    type="text"
                    value={formData.examRollNo}
                    onChange={(e) => setFormData({ ...formData, examRollNo: e.target.value })}
                    placeholder="e.g. 789123"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Academic Group</Label>
                  <select
                    value={formData.fscGroup}
                    onChange={(e) => setFormData({ ...formData, fscGroup: e.target.value })}
                    className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                  >
                    <option value="Pre-Medical">Pre-Medical</option>
                    <option value="Pre-Engineering">Pre-Engineering</option>
                    <option value="General Science / ICS">ICS / Computer Science</option>
                    <option value="Allied Health Sciences / OTT">Allied Health (OTT / Nursing)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Science Practicals Completed</Label>
                  <select
                    value={formData.practicalCompleted}
                    onChange={(e) => setFormData({ ...formData, practicalCompleted: e.target.value })}
                    className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                  >
                    <option value="Yes">Yes (All labs verified)</option>
                    <option value="Pending">Pending Evaluation</option>
                    <option value="Exempted">Exempted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BS / Undergraduate Section */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                BS / Undergraduate / ADP University Stream
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Awarding University Student ID / Reg No</Label>
                  <Input
                    type="text"
                    value={formData.awardingUniRegNo}
                    onChange={(e) => setFormData({ ...formData, awardingUniRegNo: e.target.value })}
                    placeholder="e.g. PU-2026-PSY-042"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Entry Semester</Label>
                  <select
                    value={formData.entrySemester}
                    onChange={(e) => setFormData({ ...formData, entrySemester: e.target.value })}
                    className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                  >
                    {['Semester 1', 'Semester 2', 'Semester 3 (Lateral Entry)', 'Semester 5 (BS 5th)'].map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Program Credit Hours</Label>
                  <Input
                    type="number"
                    value={formData.totalCreditHours}
                    onChange={(e) => setFormData({ ...formData, totalCreditHours: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Technical / Diploma Section */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                Technical Diploma & Practical Competency
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Trade / Specialized Discipline</Label>
                  <Input
                    type="text"
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    placeholder="e.g. Pharmacy Assistant / Radiology"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Clinical / Practical Hours</Label>
                  <Input
                    type="number"
                    value={formData.practicalHours}
                    onChange={(e) => setFormData({ ...formData, practicalHours: e.target.value })}
                    placeholder="120"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Awarding Authority / Board</Label>
                  <Input
                    type="text"
                    value={formData.certificationTrack}
                    onChange={(e) => setFormData({ ...formData, certificationTrack: e.target.value })}
                    placeholder="e.g. Punjab Pharmacy Council / PBTE"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: DOCUMENTS CHECKLIST ================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Step 6: Document Verification & Checklist
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Verify mandatory admission credentials against program requirements.
              </p>
            </div>

            <div className="space-y-3">
              {formData.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-zinc-50/30 dark:bg-zinc-900/30"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{doc.docType}</p>
                      <span className="text-[10px] text-zinc-500">Required for official enrollment</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={doc.status}
                      onChange={(e) => {
                        const newDocs = [...formData.documents];
                        newDocs[idx].status = e.target.value;
                        setFormData({ ...formData, documents: newDocs });
                      }}
                      className="text-xs h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2"
                    >
                      <option value="Submitted">Submitted (Hardcopy)</option>
                      <option value="Pending">Pending Submission</option>
                      <option value="Verified">Verified & Approved</option>
                      <option value="Exempted">Exempted</option>
                    </select>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={doc.verified}
                        onChange={(e) => {
                          const newDocs = [...formData.documents];
                          newDocs[idx].verified = e.target.checked;
                          if (e.target.checked) newDocs[idx].status = 'Verified';
                          setFormData({ ...formData, documents: newDocs });
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span>Verified</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 7: FEES & FINAL REVIEW ================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Step 7: Fee Structure, Concessions & Final Confirmation
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Review academic selection, apply scholarships/concessions, and generate invoice.
              </p>
            </div>

            {/* Fee Criteria & Program Billing Model Selector */}
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#084A86]/30 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#084A86]" />
                  Fee Criteria & Program Billing Model *
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Select standard program fee model: Monthly (Intermediate), Semester-wise (BS Programs), Annual (5-Year Professional), or Diploma.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  {
                    id: 'Monthly',
                    title: 'Monthly Tuition',
                    badge: 'Intermediate (FSc, ICS, FA)',
                    desc: 'Admission fee + Monthly tuition fee (Rs. 8,000/mo default)',
                    applyPreset: () => {
                      setFormData(prev => ({
                        ...prev,
                        feeCriteria: 'Monthly',
                        feeAdmission: prev.feeAdmission || 15000,
                        feeTuition: 8000
                      }));
                    }
                  },
                  {
                    id: 'Semester',
                    title: 'Semester Wise',
                    badge: 'BS Programs (4–5 Yrs)',
                    desc: 'Total Rs. 600k / 8 Semesters (Rs. 75,000/sem or Rs. 12,500/mo installment)',
                    applyPreset: () => {
                      setFormData(prev => ({
                        ...prev,
                        feeCriteria: 'Semester',
                        feeAdmission: prev.feeAdmission || 15000,
                        feeTuition: 75000,
                        totalProgramFee: 600000,
                        totalSemesters: 8,
                        semesterFee: 75000
                      }));
                    }
                  },
                  {
                    id: 'Annual',
                    title: 'Annual / Yearly',
                    badge: '5-Year Professional (DPT)',
                    desc: 'Total Rs. 600k / 5 Years (Rs. 120,000/yr or Rs. 10,000/mo installment)',
                    applyPreset: () => {
                      setFormData(prev => ({
                        ...prev,
                        feeCriteria: 'Annual',
                        feeAdmission: prev.feeAdmission || 15000,
                        feeTuition: 120000,
                        totalProgramFee: 600000,
                        totalSemesters: 5,
                        semesterFee: 120000
                      }));
                    }
                  },
                  {
                    id: 'Diploma / Custom',
                    title: 'Diploma / Certificate',
                    badge: 'Short Courses (3–24 Mos)',
                    desc: 'Lump-sum or configurable custom installment schedule',
                    applyPreset: () => {
                      setFormData(prev => ({
                        ...prev,
                        feeCriteria: 'Diploma / Custom',
                        feeAdmission: prev.feeAdmission || 5000,
                        feeTuition: 30000
                      }));
                    }
                  }
                ].map(opt => {
                  const isSelected = (formData.feeCriteria || 'Monthly') === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, feeCriteria: opt.id }));
                        opt.applyPreset();
                      }}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#084A86] bg-blue-50/50 dark:bg-blue-950/20 shadow-xs ring-1 ring-[#084A86]'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100">{opt.title}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-[#084A86]" />}
                        </div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {opt.badge}
                        </span>
                        <p className="text-[11px] text-zinc-500 mt-1.5 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold mt-2 ${isSelected ? 'text-[#084A86]' : 'text-zinc-400'}`}>
                        {isSelected ? '✓ Active Criteria' : 'Click to apply'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fee Structure Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2 space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        Editable Admission & Term Fee Breakdown
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Customize or enter fee heads for this student. Gross total updates live.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Fully Editable
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          Admission / Registration Fee (PKR) *
                        </Label>
                        <Input
                          type="number"
                          value={formData.feeAdmission}
                          onChange={(e) => setFormData({ ...formData, feeAdmission: e.target.value })}
                          className="mt-1 font-mono font-bold text-xs h-9 bg-zinc-50/50 dark:bg-zinc-800"
                          placeholder="15000"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {formData.feeCriteria === 'Semester'
                            ? 'Semester Tuition Fee (PKR) *'
                            : formData.feeCriteria === 'Annual'
                            ? 'Annual Tuition Fee (PKR) *'
                            : formData.feeCriteria === 'Diploma / Custom'
                            ? 'Course Tuition Fee (PKR) *'
                            : 'Monthly Tuition Fee (PKR) *'}
                        </Label>
                        <Input
                          type="number"
                          value={formData.feeTuition}
                          onChange={(e) => setFormData({ ...formData, feeTuition: e.target.value })}
                          className="mt-1 font-mono font-bold text-xs h-9 bg-zinc-50/50 dark:bg-zinc-800"
                          placeholder="8000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                          <Truck className="h-3 w-3 text-[#084A86]" />
                          Transport Fee
                        </Label>
                        <Input
                          type="number"
                          value={formData.feeTransport}
                          onChange={(e) => setFormData({ ...formData, feeTransport: e.target.value })}
                          className="mt-1 font-mono font-bold text-xs h-9 bg-zinc-50/50 dark:bg-zinc-800"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Security (Refundable)
                        </Label>
                        <Input
                          type="number"
                          value={formData.feeSecurity}
                          onChange={(e) => setFormData({ ...formData, feeSecurity: e.target.value })}
                          className="mt-1 font-mono font-bold text-xs h-9 bg-zinc-50/50 dark:bg-zinc-800"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Exam Fee
                        </Label>
                        <Input
                          type="number"
                          value={formData.feeExam}
                          onChange={(e) => setFormData({ ...formData, feeExam: e.target.value })}
                          className="mt-1 font-mono font-bold text-xs h-9 bg-zinc-50/50 dark:bg-zinc-800"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Lab / Library Fee
                        </Label>
                        <Input
                          type="number"
                          value={formData.feeOther}
                          onChange={(e) => setFormData({ ...formData, feeOther: e.target.value })}
                          className="mt-1 font-mono font-bold text-xs h-9 bg-zinc-50/50 dark:bg-zinc-800"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      <span>Gross Total Fee:</span>
                      <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                        PKR {feeGross.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Concessions / Scholarships */}
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Scholarship & Fee Concession
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Concession Type</Label>
                      <select
                        value={formData.concessionType}
                        onChange={(e) => setFormData({ ...formData, concessionType: e.target.value })}
                        className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 cursor-pointer"
                      >
                        <option value="None">No Concession</option>
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Fixed">Fixed Amount (PKR)</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Value ({formData.concessionType === 'Percentage' ? '%' : 'PKR'})</Label>
                      <Input
                        type="number"
                        disabled={formData.concessionType === 'None'}
                        value={formData.concessionValue}
                        onChange={(e) => setFormData({ ...formData, concessionValue: e.target.value })}
                        className="mt-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Approval / Reference Reason</Label>
                      <Input
                        type="text"
                        disabled={formData.concessionType === 'None'}
                        placeholder="e.g. Merit Scholarship 25%"
                        value={formData.concessionReason}
                        onChange={(e) => setFormData({ ...formData, concessionReason: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Card */}
              <div className="p-5 rounded-2xl border-2 border-emerald-400 dark:border-emerald-700 bg-gradient-to-br from-white via-zinc-50 to-emerald-50/40 dark:from-zinc-900 dark:to-emerald-950/20 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Admission Net Total Payable
                  </span>
                  <div className="mt-2">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                      PKR {feeNetPayable.toLocaleString()}
                    </span>
                    {concessionDiscount > 0 && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        - PKR {concessionDiscount.toLocaleString()} ({formData.concessionValue}{formData.concessionType === 'Percentage' ? '%' : ' PKR'} off)
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={formData.generateInvoice}
                        onChange={(e) => setFormData({ ...formData, generateInvoice: e.target.checked })}
                        className="rounded text-emerald-600 cursor-pointer"
                      />
                      <span>Auto-generate fee invoice in Finance</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-700 dark:text-amber-400">
                      <input
                        type="checkbox"
                        checked={formData.allowCapacityOverride}
                        onChange={(e) => setFormData({ ...formData, allowCapacityOverride: e.target.checked })}
                        className="rounded text-amber-600 cursor-pointer"
                      />
                      <span>Allow capacity override (Admin)</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Button
                    onClick={handleSubmitAdmission}
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-12 text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Finalizing Admission...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Confirm & Complete Admission
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Complete Admission Summary Card */}
            <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs space-y-3">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                <span>Final Review Summary</span>
                <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Session {formData.admissionYear}
                </span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-zinc-600 dark:text-zinc-400">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Student Name</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{formData.firstName} {formData.lastName || ''}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Admission Number</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formData.admissionNo}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Roll Number</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formData.rollNo}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Program Offering</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block">{selectedOffering?.title || 'Selected Offering'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Net Total Payable</span>
                  <span className="font-mono font-extrabold text-zinc-900 dark:text-zinc-100">PKR {feeNetPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons Footer */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentStep === 1 || submitting}
            onClick={handlePrev}
            className="text-xs h-10 px-4 font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous Step
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < 7 ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 px-6 font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Step ({currentStep + 1} of 7)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitAdmission}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 px-6 font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> {isEditMode ? 'Updating Student Record...' : 'Finalizing Admission...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> {isEditMode ? 'Save & Update Student Profile' : 'Confirm & Complete Admission'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StudentAdmissionWizardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-[#009966]" />
        <p className="text-sm font-medium text-zinc-600">Loading Student Wizard...</p>
      </div>
    }>
      <StudentAdmissionWizardInner />
    </Suspense>
  );
}
