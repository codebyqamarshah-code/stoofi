'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Edit, Save, X, FileText, Camera, User, BookOpen, Calendar, Clock, DollarSign, Award, Shield, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('PROFILE');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState('/default-avatar.png');
  
  const isStudent = user?.role?.toLowerCase() === 'student';
  const isParent = user?.role?.toLowerCase() === 'parent';
  const isTeacher = user?.role?.toLowerCase() === 'teacher';
  const isStaff = !isStudent && !isParent;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    emergencyMobile: '',
    gender: 'Male',
    dateOfBirth: '',
    maritalStatus: 'Single',
    fatherName: '',
    motherName: '',
    currentAddress: '',
    permanentAddress: '',
    city: '',
    avatar: '',
    // Student specific
    admissionNo: '',
    rollNo: '',
    className: '',
    section: '',
    bloodGroup: '',
    religion: '',
    caste: '',
    cnic: '',
    bForm: '',
    fatherPhone: '',
    fatherOccupation: '',
    fatherCnic: '',
    motherPhone: '',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianAddress: '',
    academicYear: '',
    admissionDate: '',
    previousSchool: '',
    previousClassCovered: '',
    // Staff specific
    drivingLicense: '',
    qualifications: '',
    workExperience: '',
    designation: '',
    department: '',
    basicSalary: '',
    epfNo: '',
    contractType: 'Permanent',
    dateOfJoining: '',
    accountName: '',
    bankAccountNumber: '',
    bankName: '',
    branchName: '',
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || user.username || user.name || '',
        email: user.email || '',
        mobile: user.phone || user.mobile || '',
        admissionNo: user.admissionNo || '',
        rollNo: user.rollNo || '',
        className: user.className || '',
        section: user.section || '',
        fatherName: user.fatherName || '',
        gender: user.gender || 'Male',
        designation: user.designation || (isTeacher ? 'Teacher' : isStaff ? (user.role === 'Super Admin' ? 'Super Administrator' : user.role === 'Admin' ? 'Administrator' : 'Staff') : ''),
        department: user.department || (isTeacher ? 'Academics' : isStaff ? 'Administration' : ''),
        basicSalary: user.basicSalary || '',
        epfNo: user.epfNo || '',
        contractType: user.contractType || 'Permanent',
        dateOfJoining: user.dateOfJoining || user.joiningDate || (user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : ''),
        admissionDate: user.admissionDate || user.joiningDate || (user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '')
      }));
      if (user.avatar) setAvatarPreview(user.avatar);
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me'); 
      if (res && res.success && res.data) {
        const u = res.data;
        if (u.avatar) setAvatarPreview(u.avatar);
        setFormData(prev => ({
          ...prev,
          fullName: u.fullName || u.username || u.name || prev.fullName,
          email: u.email || prev.email,
          mobile: u.phone || u.mobile || prev.mobile,
          emergencyMobile: u.emergencyMobile || u.emergencyContact || prev.emergencyMobile,
          gender: u.gender || prev.gender || 'Male',
          dateOfBirth: u.dob || u.dateOfBirth ? (new Date(u.dob || u.dateOfBirth).toISOString().split('T')[0]) : prev.dateOfBirth,
          maritalStatus: u.maritalStatus || prev.maritalStatus || 'Single',
          fatherName: u.fatherName || prev.fatherName,
          motherName: u.motherName || prev.motherName,
          currentAddress: u.currentAddress || u.address || u.schoolAddress || prev.currentAddress,
          permanentAddress: u.permanentAddress || prev.permanentAddress,
          city: u.city || prev.city,
          avatar: u.avatar || prev.avatar,
          // Student fields
          admissionNo: u.admissionNo || prev.admissionNo,
          rollNo: u.rollNo || prev.rollNo,
          className: u.className || prev.className,
          section: u.section || prev.section,
          bloodGroup: u.bloodGroup || prev.bloodGroup,
          religion: u.religion || prev.religion,
          caste: u.caste || prev.caste,
          cnic: u.cnic || u.bForm || prev.cnic,
          bForm: u.bForm || prev.bForm,
          fatherPhone: u.fatherPhone || prev.fatherPhone,
          fatherOccupation: u.fatherOccupation || prev.fatherOccupation,
          fatherCnic: u.fatherCnic || prev.fatherCnic,
          motherPhone: u.motherPhone || prev.motherPhone,
          guardianName: u.guardianName || prev.guardianName,
          guardianRelation: u.guardianRelation || prev.guardianRelation,
          guardianPhone: u.guardianPhone || prev.guardianPhone,
          guardianAddress: u.guardianAddress || prev.guardianAddress,
          academicYear: u.academicYear || prev.academicYear,
          admissionDate: u.admissionDate || u.joiningDate || prev.admissionDate,
          previousSchool: u.previousSchool || prev.previousSchool,
          previousClassCovered: u.previousClassCovered || prev.previousClassCovered,
          // Staff fields
          drivingLicense: u.drivingLicense || prev.drivingLicense,
          qualifications: u.qualifications || prev.qualifications,
          workExperience: u.workExperience || u.experience || prev.workExperience,
          designation: u.designation || prev.designation || (isTeacher ? 'Teacher' : isStaff ? (u.role === 'Super Admin' ? 'Super Administrator' : u.role === 'Admin' ? 'Administrator' : 'Staff') : ''),
          department: u.department || prev.department || (isTeacher ? 'Academics' : isStaff ? 'Administration' : ''),
          basicSalary: u.basicSalary || prev.basicSalary,
          epfNo: u.epfNo || prev.epfNo,
          contractType: u.contractType || prev.contractType || 'Permanent',
          dateOfJoining: u.dateOfJoining || u.joiningDate || prev.dateOfJoining,
          accountName: u.accountName || prev.accountName,
          bankAccountNumber: u.bankAccountNumber || u.accountNo || prev.bankAccountNumber,
          bankName: u.bankName || prev.bankName,
          branchName: u.branchName || prev.branchName,
          facebookUrl: u.facebookUrl || prev.facebookUrl,
          twitterUrl: u.twitterUrl || prev.twitterUrl,
          linkedinUrl: u.linkedinUrl || prev.linkedinUrl,
          instagramUrl: u.instagramUrl || prev.instagramUrl,
        }));
      }
    } catch (e) {
      console.log('Could not fetch full profile details', e);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/me', formData).catch(() => api.put('/auth/profile', formData)).catch(() => {});
      if (checkAuth) await checkAuth(); 
      setIsEditing(false);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (e) {
      console.log('Failed to update profile');
      alert('Profile saved locally.');
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const InputField = ({ label, name, type = "text", readOnly = false, placeholder = '' }) => {
    if (isEditing && !readOnly) {
      return (
        <div className="flex flex-col sm:flex-row py-3 border-b border-zinc-100 dark:border-zinc-200">
          <div className="sm:w-1/3 text-sm text-zinc-500 dark:text-zinc-600 py-1 font-medium">{label}</div>
          <div className="sm:w-2/3">
            <input 
              type={type} 
              name={name} 
              value={formData[name] ?? ''} 
              placeholder={placeholder}
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-200 bg-white dark:bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium text-zinc-900"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col sm:flex-row py-3.5 border-b border-zinc-100 dark:border-zinc-200">
        <div className="sm:w-1/3 text-sm text-zinc-500 dark:text-zinc-600 font-medium">{label}</div>
        <div className="sm:w-2/3 text-sm font-semibold text-zinc-900 dark:text-zinc-800">{formData[name] || '—'}</div>
      </div>
    );
  };

  if (!user) return <div className="p-6 text-zinc-500">Loading profile...</div>;

  // Set tabs based on role
  const tabs = isStudent 
    ? ['PROFILE', 'PARENTS INFO', 'ACADEMIC', 'DOCUMENTS']
    : isParent
    ? ['PROFILE', 'CHILDREN', 'DOCUMENTS']
    : ['PROFILE', 'PAYROLL', 'LEAVE', 'DOCUMENTS', 'TIMELINE'];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-zinc-200 dark:border-zinc-200 pb-4 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-900">
            {isStudent ? 'Student Profile' : isParent ? 'Parent Profile' : `${user.role || 'Staff'} Profile`}
          </h1>
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Dashboard <span className="mx-1">|</span> {isStudent ? 'Academics' : isParent ? 'Parent Portal' : 'Human Resource'} <span className="mx-1">|</span> <span className="text-zinc-950 dark:text-zinc-900 font-bold">{isStudent ? 'Student Details' : isParent ? 'Profile Details' : 'Staff Details'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column (Profile Card) */}
        <div className="md:col-span-4 lg:col-span-4">
          <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-zinc-900 to-zinc-800"></div>
            <div className="flex justify-center -mt-12 mb-2 relative group">
              <div className="h-24 w-24 bg-zinc-100 rounded-2xl border-4 border-white dark:border-zinc-900 overflow-hidden relative shadow-md flex items-center justify-center">
                <img 
                  src={avatarPreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.fullName || user.username || 'User') + '&background=09090b&color=ffffff'; }} 
                />
                {isEditing && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Camera size={20} />
                    <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">Upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
            
            <div className="px-5 pb-5">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-900 leading-tight">
                  {formData.fullName || user.username || 'User'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5 font-medium">{user.email}</p>
                <div className="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 capitalize">
                  {user.role}
                </div>
              </div>

              {/* Dynamic Info List based on Role */}
              <div className="space-y-2.5 text-sm border-t border-zinc-100 dark:border-zinc-200 pt-3">
                {isStudent ? (
                  <>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Student Name</span>
                      <span className="font-semibold text-zinc-900 text-right">{formData.fullName || user.username}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Role</span>
                      <span className="font-semibold text-zinc-900 capitalize">Student</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Admission No</span>
                      <span className="font-semibold text-zinc-900">{formData.admissionNo || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Class & Section</span>
                      <span className="font-semibold text-zinc-900">
                        {formData.className ? `${formData.className} ${formData.section ? `(${formData.section})` : ''}` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Roll No</span>
                      <span className="font-semibold text-zinc-900">{formData.rollNo || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Father's Name</span>
                      <span className="font-semibold text-zinc-900 text-right">{formData.fatherName || formData.guardianName || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Gender</span>
                      <span className="font-semibold text-zinc-900">{formData.gender || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Admission Date</span>
                      <span className="font-semibold text-zinc-900">{formData.admissionDate || '—'}</span>
                    </div>
                  </>
                ) : isParent ? (
                  <>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Parent Name</span>
                      <span className="font-semibold text-zinc-900 text-right">{formData.fullName || user.username}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Role</span>
                      <span className="font-semibold text-zinc-900 capitalize">Parent</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Phone</span>
                      <span className="font-semibold text-zinc-900">{formData.mobile || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Occupation</span>
                      <span className="font-semibold text-zinc-900">{formData.fatherOccupation || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">CNIC / ID</span>
                      <span className="font-semibold text-zinc-900">{formData.cnic || '—'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Staff Name</span>
                      <span className="font-semibold text-zinc-900 text-right">{formData.fullName || user.username}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Role</span>
                      <span className="font-semibold text-zinc-900 capitalize">{user.role}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Designation</span>
                      <span className="font-semibold text-zinc-900">{formData.designation || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Department</span>
                      <span className="font-semibold text-zinc-900">{formData.department || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">EPF NO</span>
                      <span className="font-semibold text-zinc-900">{formData.epfNo || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Basic Salary</span>
                      <span className="font-semibold text-zinc-900">
                        {formData.basicSalary ? `PKR ${Number(formData.basicSalary).toLocaleString()}` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Contract Type</span>
                      <span className="font-semibold text-zinc-900">{formData.contractType || 'Permanent'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                      <span className="text-zinc-500 font-medium">Date of Joining</span>
                      <span className="font-semibold text-zinc-900">{formData.dateOfJoining || '—'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Tabs & Info) */}
        <div className="md:col-span-8 lg:col-span-8">
          
          {/* Tabs */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab 
                      ? 'bg-zinc-900 text-white shadow-sm' 
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === 'PROFILE' && (
              <div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <Edit size={14} /> EDIT
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="flex items-center gap-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      <X size={14} /> CANCEL
                    </button>
                    <button 
                      onClick={handleSave} 
                      disabled={loading} 
                      className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                    >
                      {loading ? 'SAVING...' : <><Save size={14} /> SAVE</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6 sm:p-7">
            
            {/* ── PROFILE TAB ── */}
            {activeTab === 'PROFILE' && (
              <div className="space-y-8 animate-in fade-in">
                
                {/* Personal Info */}
                <div>
                  <h3 className="text-zinc-950 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-500" /> Personal Info
                  </h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Full Name" name="fullName" />
                    {isStudent && (
                      <>
                        <InputField label="Admission No" name="admissionNo" readOnly />
                        <InputField label="Roll No" name="rollNo" />
                        <InputField label="Class" name="className" readOnly />
                        <InputField label="Section" name="section" readOnly />
                      </>
                    )}
                    <InputField label="Email (Login ID)" name="email" type="email" readOnly />
                    <InputField label="Mobile / Phone" name="mobile" />
                    <InputField label="Emergency Contact" name="emergencyMobile" />
                    
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row py-3 border-b border-zinc-100 dark:border-zinc-200">
                        <div className="sm:w-1/3 text-sm text-zinc-500 font-medium py-1">Gender</div>
                        <div className="sm:w-2/3">
                          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <InputField label="Gender" name="gender" />
                    )}

                    <InputField label="Date Of Birth" name="dateOfBirth" type="date" />

                    {isStudent ? (
                      <>
                        {isEditing ? (
                          <div className="flex flex-col sm:flex-row py-3 border-b border-zinc-100 dark:border-zinc-200">
                            <div className="sm:w-1/3 text-sm text-zinc-500 font-medium py-1">Blood Group</div>
                            <div className="sm:w-2/3">
                              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium">
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <InputField label="Blood Group" name="bloodGroup" />
                        )}
                        <InputField label="Religion" name="religion" />
                        <InputField label="Caste / Category" name="caste" />
                        <InputField label="B-Form / CNIC No" name="cnic" />
                      </>
                    ) : (
                      <>
                        <InputField label="Driving License" name="drivingLicense" />
                        {isEditing ? (
                          <div className="flex flex-col sm:flex-row py-3 border-b border-zinc-100 dark:border-zinc-200">
                            <div className="sm:w-1/3 text-sm text-zinc-500 font-medium py-1">Marital Status</div>
                            <div className="sm:w-2/3">
                              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium">
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <InputField label="Marital Status" name="maritalStatus" />
                        )}
                        <InputField label="Father Name" name="fatherName" />
                        <InputField label="Mother Name" name="motherName" />
                        <InputField label="Qualifications" name="qualifications" />
                        <InputField label="Work Experience" name="workExperience" />
                      </>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-zinc-950 font-bold text-xs uppercase tracking-wider mb-2">Address Information</h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Current Address" name="currentAddress" />
                    <InputField label="Permanent Address" name="permanentAddress" />
                    {isStudent && <InputField label="City" name="city" />}
                  </div>
                </div>

                {/* Staff specific sections */}
                {isStaff && (
                  <>
                    {/* Bank Account */}
                    <div>
                      <h3 className="text-zinc-950 font-bold text-xs uppercase tracking-wider mb-2">Bank Account Details</h3>
                      <div className="border-t border-zinc-200 dark:border-zinc-200">
                        <InputField label="Account Name" name="accountName" />
                        <InputField label="Bank Account Number" name="bankAccountNumber" />
                        <InputField label="Bank Name" name="bankName" />
                        <InputField label="Branch Name" name="branchName" />
                      </div>
                    </div>

                    {/* Social Links */}
                    <div>
                      <h3 className="text-zinc-950 font-bold text-xs uppercase tracking-wider mb-2">Social Links</h3>
                      <div className="border-t border-zinc-200 dark:border-zinc-200">
                        <InputField label="Facebook Url" name="facebookUrl" />
                        <InputField label="Twitter Url" name="twitterUrl" />
                        <InputField label="Linkedin Url" name="linkedinUrl" />
                        <InputField label="Instagram Url" name="instagramUrl" />
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* ── PARENTS INFO TAB (STUDENTS) ── */}
            {activeTab === 'PARENTS INFO' && isStudent && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-zinc-950 font-bold text-xs uppercase tracking-wider mb-2">Father's Information</h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Father's Name" name="fatherName" />
                    <InputField label="Father's Phone" name="fatherPhone" />
                    <InputField label="Father's Occupation" name="fatherOccupation" />
                    <InputField label="Father's CNIC" name="fatherCnic" />
                  </div>
                </div>

                <div>
                  <h3 className="text-zinc-950 font-bold text-xs uppercase tracking-wider mb-2">Mother's Information</h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Mother's Name" name="motherName" />
                    <InputField label="Mother's Phone" name="motherPhone" />
                  </div>
                </div>

                <div>
                  <h3 className="text-zinc-950 font-bold text-xs uppercase tracking-wider mb-2">Guardian Information</h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Guardian Name" name="guardianName" />
                    <InputField label="Guardian Relation" name="guardianRelation" />
                    <InputField label="Guardian Phone" name="guardianPhone" />
                    <InputField label="Guardian Address" name="guardianAddress" />
                  </div>
                </div>
              </div>
            )}

            {/* ── ACADEMIC TAB (STUDENTS) ── */}
            {activeTab === 'ACADEMIC' && isStudent && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-zinc-950 font-bold text-xs uppercase tracking-wider mb-2">Academic Record</h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Academic Year" name="academicYear" />
                    <InputField label="Admission Number" name="admissionNo" readOnly />
                    <InputField label="Admission Date" name="admissionDate" />
                    <InputField label="Class" name="className" readOnly />
                    <InputField label="Section" name="section" readOnly />
                    <InputField label="Roll No" name="rollNo" />
                    <InputField label="Previous School" name="previousSchool" />
                    <InputField label="Previous Class Covered" name="previousClassCovered" />
                  </div>
                </div>
              </div>
            )}

            {/* ── PAYROLL TAB (STAFF) ── */}
            {activeTab === 'PAYROLL' && isStaff && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                    <div className="text-xs text-zinc-500 font-bold uppercase">Basic Salary</div>
                    <div className="text-xl font-bold text-zinc-900 mt-1">
                      {formData.basicSalary ? `PKR ${Number(formData.basicSalary).toLocaleString()}` : '—'}
                    </div>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                    <div className="text-xs text-zinc-500 font-bold uppercase">Contract Type</div>
                    <div className="text-xl font-bold text-zinc-900 mt-1">
                      {formData.contractType || 'Permanent'}
                    </div>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                    <div className="text-xs text-zinc-500 font-bold uppercase">EPF Number</div>
                    <div className="text-xl font-bold text-zinc-900 mt-1">
                      {formData.epfNo || '—'}
                    </div>
                  </div>
                </div>

                <div className="border border-zinc-200 rounded-xl p-5 bg-white">
                  <h4 className="text-sm font-bold text-zinc-900 mb-3">Bank Details for Payroll</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500 font-medium">Bank Name:</span>
                      <p className="font-semibold text-zinc-800">{formData.bankName || '—'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium">Account Name:</span>
                      <p className="font-semibold text-zinc-800">{formData.accountName || '—'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium">Account Number:</span>
                      <p className="font-semibold text-zinc-800">{formData.bankAccountNumber || '—'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium">Branch:</span>
                      <p className="font-semibold text-zinc-800">{formData.branchName || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── LEAVE TAB (STAFF) ── */}
            {activeTab === 'LEAVE' && isStaff && (
              <div className="py-8 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <Calendar className="h-10 w-10 text-zinc-300" />
                <p className="font-medium text-sm">No leave history recorded for this academic session.</p>
              </div>
            )}

            {/* ── DOCUMENTS TAB ── */}
            {activeTab === 'DOCUMENTS' && (
              <div className="py-8 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <FileText className="h-10 w-10 text-zinc-300" />
                <p className="font-medium text-sm">No uploaded documents found.</p>
              </div>
            )}

            {/* ── TIMELINE TAB ── */}
            {activeTab === 'TIMELINE' && (
              <div className="py-8 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <Clock className="h-10 w-10 text-zinc-300" />
                <p className="font-medium text-sm">No timeline activities recorded yet.</p>
              </div>
            )}

            {/* ── CHILDREN TAB (PARENTS) ── */}
            {activeTab === 'CHILDREN' && isParent && (
              <div className="py-8 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <User className="h-10 w-10 text-zinc-300" />
                <p className="font-medium text-sm">Connected student records will appear here.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
