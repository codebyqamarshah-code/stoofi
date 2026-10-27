'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  User, 
  Shield, 
  School, 
  GraduationCap, 
  CheckSquare, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Calendar,
  CreditCard,
  Building,
  Hash,
  Eye,
  Camera,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DobInput } from '@/components/ui/DobInput';
import api from '@/services/api';

function formatCnic(val) {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

export default function EditStudentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('identity'); // identity, family, academic, qualifications

  // Student Form State
  const [formData, setFormData] = useState({
    // Identity
    admissionNo: '',
    rollNo: '',
    studentCode: '',
    admissionYear: '2026',
    admissionDate: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '',
    cnic: '',
    bForm: '',
    bloodGroup: 'B+',
    religion: 'Islam',
    nationality: 'Pakistani',
    phone: '',
    whatsapp: '',
    email: '',
    residentialAddress: '',
    permanentAddress: '',
    city: '',
    sameAsResidential: true,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyRelationship: 'Father',
    studentPhoto: '',

    // Family / Guardian
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
    guardianAddress: '',
    guardianOccupation: '',

    // Academic Placement
    className: '',
    section: 'A',
    type: 'Regular',
    status: 'Active',
    remarks: '',

    // Qualifications
    qualifications: []
  });

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Load student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/student/${id}`);
        const s = res?.data || (res?._id ? res : null);

        if (!s) {
          showToast('Student record not found.', true);
          setLoading(false);
          return;
        }

        // Map values into form state
        setFormData({
          admissionNo: s.admissionNo || '',
          rollNo: s.rollNo || '',
          studentCode: s.studentCode || '',
          admissionYear: s.academicYear ? String(s.academicYear).slice(0, 4) : '2026',
          admissionDate: s.admissionDate || s.joiningDate || '',
          firstName: s.firstName || s.studentName || s.name || '',
          lastName: s.lastName || '',
          gender: s.gender || 'Male',
          dob: s.dob || '',
          cnic: s.cnic || s.bForm || '',
          bForm: s.bForm || s.cnic || '',
          bloodGroup: s.bloodGroup || 'B+',
          religion: s.religion || 'Islam',
          nationality: s.nationality || 'Pakistani',
          phone: s.phone || '',
          whatsapp: s.whatsapp || s.phone || '',
          email: s.email || '',
          residentialAddress: s.residentialAddress || s.currentAddress || s.address || '',
          permanentAddress: s.permanentAddress || s.address || '',
          city: s.city || '',
          sameAsResidential: (s.permanentAddress === s.address) || !s.permanentAddress,
          emergencyContactName: s.emergencyContactName || s.emergencyContact?.name || s.fatherName || '',
          emergencyContactPhone: s.emergencyContactPhone || s.emergencyContact?.phone || s.fatherPhone || s.phone || '',
          emergencyRelationship: s.emergencyContactRelation || s.emergencyContact?.relationship || 'Father',
          studentPhoto: s.studentPhoto || s.photo || '',

          fatherName: s.fatherName || s.father?.name || '',
          fatherCnic: s.fatherCnic || s.father?.cnic || '',
          fatherPhone: s.fatherPhone || s.father?.phone || '',
          fatherOccupation: s.fatherOccupation || s.father?.occupation || '',
          motherName: s.motherName || s.mother?.name || '',
          motherPhone: s.motherPhone || s.mother?.phone || '',
          motherOccupation: s.motherOccupation || s.mother?.occupation || '',
          guardianName: s.guardianName || s.guardian?.name || s.fatherName || '',
          guardianRelation: s.guardianRelation || s.guardian?.relation || 'Father',
          guardianPhone: s.guardianPhone || s.guardian?.phone || s.fatherPhone || '',
          guardianCnic: s.guardianCnic || s.guardian?.cnic || s.fatherCnic || '',
          guardianAddress: s.guardianAddress || s.guardian?.address || s.address || '',
          guardianOccupation: s.guardianOccupation || s.guardian?.occupation || '',

          className: s.className || '',
          section: s.section || 'A',
          type: s.type || 'Regular',
          status: s.status || 'Active',
          remarks: s.remarks || '',

          qualifications: Array.isArray(s.qualifications) && s.qualifications.length > 0 
            ? s.qualifications 
            : [
                {
                  qualification: 'Matriculation (SSC)',
                  institution: s.previousSchool || '',
                  awardingBody: 'BISE Lahore',
                  completionYear: '2024',
                  rollNumber: '',
                  totalMarks: 1100,
                  obtainedMarks: '',
                  grade: 'A',
                  resultStatus: 'Passed'
                }
              ]
        });
      } catch (err) {
        console.error('Error fetching student for edit:', err);
        showToast('Error loading student profile.', true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Qualifications multi-row handlers
  const handleQualChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.qualifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, qualifications: updated };
    });
  };

  const addQualificationRow = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        {
          qualification: 'Intermediate (HSSC)',
          institution: '',
          awardingBody: 'BISE Lahore',
          completionYear: '2026',
          rollNumber: '',
          totalMarks: 1100,
          obtainedMarks: '',
          grade: 'A',
          resultStatus: 'Passed'
        }
      ]
    }));
  };

  const removeQualificationRow = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  // Auto-straightens, center-crops to portrait (4:5 ratio), and sets uploaded photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let source = null;
      if (typeof createImageBitmap === 'function') {
        try {
          source = await createImageBitmap(file, { imageOrientation: 'from-image' });
        } catch {
          source = null;
        }
      }

      if (!source) {
        source = await new Promise((resImg, rejImg) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new window.Image();
            img.onload = () => resImg(img);
            img.onerror = rejImg;
            img.src = ev.target.result;
          };
          reader.onerror = rejImg;
          reader.readAsDataURL(file);
        });
      }

      const iw = source.naturalWidth || source.width;
      const ih = source.naturalHeight || source.height;
      if (!iw || !ih) return;

      const targetRatio = 0.8;
      const currentRatio = iw / ih;

      const canvasW = 320;
      const canvasH = 400;
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let sx = 0, sy = 0, sWidth = iw, sHeight = ih;
      if (currentRatio > targetRatio) {
        sWidth = ih * targetRatio;
        sx = (iw - sWidth) / 2;
        sy = 0;
      } else {
        sHeight = iw / targetRatio;
        sx = 0;
        sy = Math.max(0, (ih - sHeight) * 0.12);
      }

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.drawImage(source, sx, sy, sWidth, sHeight, 0, 0, canvasW, canvasH);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setFormData(prev => ({ ...prev, studentPhoto: dataUrl }));
      showToast('Photo uploaded, auto-straightened and fitted!');
    } catch {
      showToast('Failed to process photo', true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      showToast('First Name is required.', true);
      return;
    }
    if (!formData.admissionNo.trim()) {
      showToast('Admission Number is required.', true);
      return;
    }

    try {
      setSaving(true);
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name: fullName,
        fullName: fullName,
        studentName: fullName,
        admissionNo: formData.admissionNo.trim(),
        rollNo: formData.rollNo.trim(),
        academicYear: formData.admissionYear,
        admissionDate: formData.admissionDate,
        gender: formData.gender,
        dob: formData.dob,
        cnic: formData.cnic.trim(),
        bForm: formData.bForm.trim(),
        bloodGroup: formData.bloodGroup,
        religion: formData.religion,
        nationality: formData.nationality,
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim(),
        email: formData.email.trim(),
        address: formData.residentialAddress.trim(),
        currentAddress: formData.residentialAddress.trim(),
        residentialAddress: formData.residentialAddress.trim(),
        permanentAddress: formData.sameAsResidential ? formData.residentialAddress.trim() : formData.permanentAddress.trim(),
        city: formData.city.trim(),

        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        emergencyContactRelation: formData.emergencyRelationship,
        emergencyContact: formData.emergencyContactPhone.trim() || formData.emergencyContactName.trim() || '',

        studentPhoto: formData.studentPhoto || '',
        photo: formData.studentPhoto || '',

        fatherName: formData.fatherName.trim(),
        fatherCnic: formData.fatherCnic.trim(),
        fatherPhone: formData.fatherPhone.trim(),
        fatherOccupation: formData.fatherOccupation.trim(),
        motherName: formData.motherName.trim(),
        motherPhone: formData.motherPhone.trim(),
        motherOccupation: formData.motherOccupation.trim(),

        guardianName: formData.guardianName.trim(),
        guardianRelation: formData.guardianRelation,
        guardianPhone: formData.guardianPhone.trim(),
        guardianCnic: formData.guardianCnic.trim(),
        guardianAddress: formData.guardianAddress.trim(),
        guardianOccupation: formData.guardianOccupation.trim(),

        className: formData.className.trim(),
        section: formData.section.trim(),
        type: formData.type,
        status: formData.status,
        remarks: formData.remarks.trim(),

        qualifications: formData.qualifications
      };

      const res = await api.put(`/student/${id}`, payload);
      if (res && res.success) {
        showToast('Student profile updated successfully!');
        setTimeout(() => {
          router.push(`/dashboard/students/${id}`);
        }, 1500);
      } else {
        showToast(res?.message || 'Failed to update student profile.', true);
      }
    } catch (err) {
      console.error('Error updating student:', err);
      showToast(err.response?.data?.message || 'Failed to save student profile.', true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-[#009966]" />
        <p className="text-sm font-medium text-zinc-600">Loading student profile data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
          toast.isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.isError ? <AlertCircle className="h-4 w-4 shrink-0 text-red-600" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/dashboard/students" className="hover:text-zinc-700 transition-colors">Student List</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/dashboard/students/${id}`} className="hover:text-zinc-700 transition-colors">
          {formData.firstName} {formData.lastName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-800 font-bold">Edit Profile</span>
      </div>

      {/* Header Profile Banner */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/50 via-white to-white">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div className="h-16 w-16 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl border-2 border-emerald-300 overflow-hidden shadow-xs relative">
              {formData.studentPhoto ? (
                <img src={formData.studentPhoto} alt={formData.firstName} className="h-full w-full object-cover rounded-[10px]" style={{ imageOrientation: 'from-image' }} />
              ) : (
                formData.firstName.slice(0, 2).toUpperCase()
              )}
            </div>
            <label 
              htmlFor="student-photo-edit-input" 
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#009966] text-white shadow-md hover:bg-[#007a52] cursor-pointer transition-transform hover:scale-110"
              title="Upload / Change Photo (Auto-straightens and crops)"
            >
              <Camera className="w-3.5 h-3.5" />
              <input 
                id="student-photo-edit-input" 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </label>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-950">
                Edit Student: {formData.firstName} {formData.lastName}
              </h1>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#009966] text-white">
                Live Edit Mode
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-mono mt-1">
              <span>Adm: <strong>{formData.admissionNo || 'N/A'}</strong></span>
              <span>•</span>
              <span>Roll: <strong>{formData.rollNo || 'N/A'}</strong></span>
              <span>•</span>
              <span>Class: <strong>{formData.className || 'General'} ({formData.section || 'A'})</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/dashboard/students/${id}`}>
            <Button variant="outline" size="sm" className="h-9 text-xs border-zinc-300 text-zinc-700 hover:bg-zinc-100">
              <Eye className="h-3.5 w-3.5 mr-1 text-zinc-500" />
              View Profile
            </Button>
          </Link>
          <Button 
            onClick={handleSubmit}
            disabled={saving}
            size="sm" 
            className="h-9 text-xs bg-[#009966] hover:bg-[#007a52] text-white font-semibold gap-1.5 shadow-xs"
          >
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save & Update Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 bg-white px-4 pt-2 rounded-t-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('identity')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'identity' ? 'border-[#009966] text-[#009966]' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <User className="h-4 w-4" />
          1. Student Identity & Contact
        </button>

        <button
          onClick={() => setActiveTab('family')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'family' ? 'border-[#009966] text-[#009966]' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          2. Guardian & Family Details
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'academic' ? 'border-[#009966] text-[#009966]' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <School className="h-4 w-4" />
          3. Academic Class & Placement
        </button>

        <button
          onClick={() => setActiveTab('qualifications')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'qualifications' ? 'border-[#009966] text-[#009966]' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          4. Previous Qualifications
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 shadow-xs rounded-b-xl overflow-hidden p-6 space-y-6">

        {/* TAB 1: IDENTITY & CONTACT */}
        {activeTab === 'identity' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top IDs */}
            <div className="bg-zinc-50/70 p-4 rounded-xl border border-zinc-200">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-[#009966]" /> Official Identity & Registration Numbers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Admission Number *</Label>
                  <Input 
                    type="text" 
                    value={formData.admissionNo} 
                    onChange={e => handleChange('admissionNo', e.target.value)}
                    className="bg-white border-zinc-300 font-mono text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Roll Number *</Label>
                  <Input 
                    type="text" 
                    value={formData.rollNo} 
                    onChange={e => handleChange('rollNo', e.target.value)}
                    className="bg-white border-zinc-300 font-mono text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Academic Year</Label>
                  <Input 
                    type="text" 
                    value={formData.admissionYear} 
                    onChange={e => handleChange('admissionYear', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Admission Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD/MM/YYYY or YYYY-MM-DD"
                    value={formData.admissionDate} 
                    onChange={e => handleChange('admissionDate', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#009966]" /> Student Core Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">First Name *</Label>
                  <Input 
                    type="text" 
                    value={formData.firstName} 
                    onChange={e => handleChange('firstName', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Last / Family Name</Label>
                  <Input 
                    type="text" 
                    value={formData.lastName} 
                    onChange={e => handleChange('lastName', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Gender *</Label>
                  <select
                    value={formData.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <DobInput
                    value={formData.dob}
                    onChange={val => handleChange('dob', val)}
                    label="Date of Birth"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">CNIC / B-Form Number</Label>
                  <Input 
                    type="text" 
                    value={formData.cnic} 
                    onChange={e => handleChange('cnic', formatCnic(e.target.value))}
                    placeholder="35202-1234567-1"
                    className="bg-white border-zinc-300 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Blood Group</Label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => handleChange('bloodGroup', e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Religion</Label>
                  <Input 
                    type="text" 
                    value={formData.religion} 
                    onChange={e => handleChange('religion', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Nationality</Label>
                  <Input 
                    type="text" 
                    value={formData.nationality} 
                    onChange={e => handleChange('nationality', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#009966]" /> Student Contact & Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Primary Phone</Label>
                  <Input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="0300-1234567"
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">WhatsApp Number</Label>
                  <Input 
                    type="text" 
                    value={formData.whatsapp} 
                    onChange={e => handleChange('whatsapp', e.target.value)}
                    placeholder="0300-1234567"
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Email Address</Label>
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="student@example.com"
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Current / Residential Address</Label>
                  <textarea 
                    rows={2}
                    value={formData.residentialAddress}
                    onChange={e => handleChange('residentialAddress', e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966] resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-zinc-700 uppercase">Permanent Address</Label>
                    <label className="text-[11px] text-zinc-500 flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.sameAsResidential}
                        onChange={e => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            sameAsResidential: checked,
                            permanentAddress: checked ? prev.residentialAddress : prev.permanentAddress
                          }));
                        }}
                        className="rounded"
                      />
                      Same as residential
                    </label>
                  </div>
                  <textarea 
                    rows={2}
                    disabled={formData.sameAsResidential}
                    value={formData.sameAsResidential ? formData.residentialAddress : formData.permanentAddress}
                    onChange={e => handleChange('permanentAddress', e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966] resize-none disabled:bg-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[#009966]" /> Emergency Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Contact Name</Label>
                  <Input 
                    type="text" 
                    value={formData.emergencyContactName} 
                    onChange={e => handleChange('emergencyContactName', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Contact Phone</Label>
                  <Input 
                    type="text" 
                    value={formData.emergencyContactPhone} 
                    onChange={e => handleChange('emergencyContactPhone', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Relationship</Label>
                  <Input 
                    type="text" 
                    value={formData.emergencyRelationship} 
                    onChange={e => handleChange('emergencyRelationship', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GUARDIAN & FAMILY */}
        {activeTab === 'family' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Father Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#009966]" /> Father Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Father Name</Label>
                  <Input 
                    type="text" 
                    value={formData.fatherName} 
                    onChange={e => handleChange('fatherName', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Father CNIC</Label>
                  <Input 
                    type="text" 
                    value={formData.fatherCnic} 
                    onChange={e => handleChange('fatherCnic', formatCnic(e.target.value))}
                    placeholder="35202-1234567-1"
                    className="bg-white border-zinc-300 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Father Phone</Label>
                  <Input 
                    type="text" 
                    value={formData.fatherPhone} 
                    onChange={e => handleChange('fatherPhone', e.target.value)}
                    placeholder="0300-1234567"
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Father Occupation</Label>
                  <Input 
                    type="text" 
                    value={formData.fatherOccupation} 
                    onChange={e => handleChange('fatherOccupation', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Mother Details */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#009966]" /> Mother Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Mother Name</Label>
                  <Input 
                    type="text" 
                    value={formData.motherName} 
                    onChange={e => handleChange('motherName', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Mother Phone</Label>
                  <Input 
                    type="text" 
                    value={formData.motherPhone} 
                    onChange={e => handleChange('motherPhone', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Mother Occupation</Label>
                  <Input 
                    type="text" 
                    value={formData.motherOccupation} 
                    onChange={e => handleChange('motherOccupation', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Guardian Details */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[#009966]" /> Guardian Details (If different)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Guardian Name</Label>
                  <Input 
                    type="text" 
                    value={formData.guardianName} 
                    onChange={e => handleChange('guardianName', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Relationship</Label>
                  <Input 
                    type="text" 
                    value={formData.guardianRelation} 
                    onChange={e => handleChange('guardianRelation', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Guardian Phone</Label>
                  <Input 
                    type="text" 
                    value={formData.guardianPhone} 
                    onChange={e => handleChange('guardianPhone', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Guardian CNIC</Label>
                  <Input 
                    type="text" 
                    value={formData.guardianCnic} 
                    onChange={e => handleChange('guardianCnic', formatCnic(e.target.value))}
                    className="bg-white border-zinc-300 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACADEMIC & PLACEMENT */}
        {activeTab === 'academic' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <School className="h-4 w-4 text-[#009966]" /> Class, Section & Enrollment Placement
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Class / Program Name *</Label>
                  <Input 
                    type="text" 
                    value={formData.className} 
                    onChange={e => handleChange('className', e.target.value)}
                    placeholder="e.g. FSC OTT, CMW, DPT"
                    className="bg-white border-zinc-300 text-xs font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Section</Label>
                  <Input 
                    type="text" 
                    value={formData.section} 
                    onChange={e => handleChange('section', e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Student Type</Label>
                  <select
                    value={formData.type}
                    onChange={e => handleChange('type', e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Self-Finance">Self-Finance</option>
                    <option value="Scholarship">Scholarship</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Enrollment Status</Label>
                  <select
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-3">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Administrative Notes / Remarks</Label>
                <textarea 
                  rows={3}
                  value={formData.remarks}
                  onChange={e => handleChange('remarks', e.target.value)}
                  placeholder="Additional student notes, medical conditions, or transfer details..."
                  className="w-full rounded-md border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUALIFICATIONS */}
        {activeTab === 'qualifications' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#009966]" /> Previous Education History
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQualificationRow}
                className="h-8 text-xs gap-1 border-dashed border-[#009966] text-[#009966] hover:bg-emerald-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Qualification
              </Button>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 text-[11px] uppercase">
                  <tr>
                    <th className="px-3 py-2.5 w-8">#</th>
                    <th className="px-3 py-2.5">Qualification</th>
                    <th className="px-3 py-2.5">Institution</th>
                    <th className="px-3 py-2.5">Board / Uni</th>
                    <th className="px-3 py-2.5 w-20 text-center">Year</th>
                    <th className="px-3 py-2.5 w-24 text-right">Marks</th>
                    <th className="px-3 py-2.5 w-20 text-center">Grade</th>
                    <th className="px-3 py-2.5 w-10 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {formData.qualifications.map((q, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="px-3 py-2 text-zinc-400 font-medium">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <Input 
                          type="text" 
                          value={q.qualification || ''} 
                          onChange={e => handleQualChange(idx, 'qualification', e.target.value)}
                          placeholder="e.g. Matriculation (SSC)"
                          className="h-8 text-xs bg-white border-zinc-300"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input 
                          type="text" 
                          value={q.institution || ''} 
                          onChange={e => handleQualChange(idx, 'institution', e.target.value)}
                          placeholder="School / College name"
                          className="h-8 text-xs bg-white border-zinc-300"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input 
                          type="text" 
                          value={q.awardingBody || ''} 
                          onChange={e => handleQualChange(idx, 'awardingBody', e.target.value)}
                          placeholder="BISE Lahore"
                          className="h-8 text-xs bg-white border-zinc-300"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Input 
                          type="text" 
                          value={q.completionYear || ''} 
                          onChange={e => handleQualChange(idx, 'completionYear', e.target.value)}
                          placeholder="2024"
                          className="h-8 text-xs text-center bg-white border-zinc-300 font-mono"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Input 
                          type="text" 
                          value={q.obtainedMarks || ''} 
                          onChange={e => handleQualChange(idx, 'obtainedMarks', e.target.value)}
                          placeholder="950"
                          className="h-8 text-xs text-right bg-white border-zinc-300 font-mono font-bold"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Input 
                          type="text" 
                          value={q.grade || ''} 
                          onChange={e => handleQualChange(idx, 'grade', e.target.value)}
                          placeholder="A+"
                          className="h-8 text-xs text-center bg-white border-zinc-300 font-bold"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeQualificationRow(idx)}
                          className="p-1 text-zinc-400 hover:text-red-600 rounded"
                          title="Remove row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
          <Link href={`/dashboard/students/${id}`}>
            <Button type="button" variant="outline" className="border-zinc-300 text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Cancel & Return to Profile
            </Button>
          </Link>

          <Button 
            type="submit" 
            disabled={saving}
            className="bg-[#009966] hover:bg-[#007a52] text-white font-semibold text-xs h-9 px-6 gap-1.5 shadow-xs"
          >
            {saving ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Updating Student Record...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save & Update Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
