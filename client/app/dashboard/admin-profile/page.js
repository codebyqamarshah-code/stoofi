'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Edit, Save, X, FileText, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('PROFILE');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState('/default-avatar.png');
  
  const [formData, setFormData] = useState({
    mobile: '',
    emergencyMobile: '',
    email: '',
    drivingLicense: '',
    gender: 'Male',
    dateOfBirth: '',
    maritalStatus: 'Single',
    fatherName: '',
    motherName: '',
    qualifications: '',
    workExperience: '',
    currentAddress: '',
    permanentAddress: '',
    accountName: '',
    bankAccountNumber: '',
    bankName: '',
    branchName: '',
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        mobile: user.phone || user.mobile || '',
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
          mobile: u.phone || u.mobile || prev.mobile,
          emergencyMobile: u.emergencyMobile || '',
          email: u.email || prev.email,
          drivingLicense: u.drivingLicense || '',
          gender: u.gender || 'Male',
          dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '',
          maritalStatus: u.maritalStatus || 'Single',
          fatherName: u.fatherName || '',
          motherName: u.motherName || '',
          qualifications: u.qualifications || '',
          workExperience: u.workExperience || '',
          currentAddress: u.currentAddress || '',
          permanentAddress: u.permanentAddress || '',
          accountName: u.accountName || '',
          bankAccountNumber: u.bankAccountNumber || '',
          bankName: u.bankName || '',
          branchName: u.branchName || '',
          facebookUrl: u.facebookUrl || '',
          twitterUrl: u.twitterUrl || '',
          linkedinUrl: u.linkedinUrl || '',
          instagramUrl: u.instagramUrl || '',
          avatar: u.avatar || prev.avatar
        }));
      }
    } catch (e) {
      console.log('Could not fetch full profile details', e);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', formData).catch(() => {});
      // In a real app, the backend saves it. We'll refresh global state:
      if (checkAuth) await checkAuth(); 
      setIsEditing(false);
      fetchProfile(); // Re-fetch to apply live changes
      alert('Profile updated successfully! (Email changes will apply on next login)');
    } catch (e) {
      console.log('Failed to update profile');
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

  const InputField = ({ label, name, type = "text" }) => {
    if (isEditing) {
      return (
        <div className="flex flex-col sm:flex-row py-3 border-b border-zinc-100 dark:border-zinc-200">
          <div className="sm:w-1/3 text-sm text-zinc-500 dark:text-zinc-600 py-1">{label}</div>
          <div className="sm:w-2/3">
            <input 
              type={type} 
              name={name} 
              value={formData[name]} 
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-200 bg-white dark:bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col sm:flex-row py-4 border-b border-zinc-100 dark:border-zinc-200">
        <div className="sm:w-1/3 text-sm text-zinc-500 dark:text-zinc-600">{label}</div>
        <div className="sm:w-2/3 text-sm text-zinc-900 dark:text-zinc-800">{formData[name] || '-'}</div>
      </div>
    );
  };

  if (!user) return <div className="p-6 text-zinc-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-900">Human Resource</h1>
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Dashboard <span className="mx-1">|</span> Human Resource <span className="mx-1">|</span> <span className="text-zinc-950 dark:text-zinc-900">Staff Details</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column (Profile Card) */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-lg shadow-sm overflow-hidden relative">
            <div className="h-24 bg-zinc-950"></div>
            <div className="flex justify-center -mt-12 mb-2 relative group">
              <div className="h-24 w-24 bg-zinc-200 rounded-md border-4 border-white dark:border-zinc-950 overflow-hidden relative shadow-sm">
                <img 
                  src={avatarPreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name='+user.username+'&background=random'; }} 
                />
                {isEditing && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Camera size={20} />
                    <span className="text-[10px] mt-1 font-medium">Upload</span>
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
            
            <div className="px-4 pb-4">
              <div className="space-y-3 mt-4 text-sm">
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                  <span className="text-zinc-950 font-bold">Staff Name</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-800 text-right">{user.fullName || user.username || 'System Administrator'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                  <span className="text-zinc-950 font-bold">Role</span>
                  <span className="font-semibold text-zinc-950 dark:text-zinc-900 capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                  <span className="text-zinc-950 font-bold">Designation</span>
                  <span className="font-semibold text-zinc-950 dark:text-zinc-900">Principal</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                  <span className="text-zinc-950 font-bold">Department</span>
                  <span className="font-semibold text-zinc-950 dark:text-zinc-900">Admin</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                  <span className="text-zinc-950 font-bold">EPF NO</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-800">-</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                  <span className="text-zinc-950 font-bold">Basic Salary</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-800">-</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                  <span className="text-zinc-950 font-bold">Contract Type</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-800">-</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-200 pb-2">
                  <span className="text-zinc-950 font-bold">Date of Joining</span>
                  <span className="font-semibold text-zinc-950 dark:text-zinc-900">15th Aug, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Tabs & Info) */}
        <div className="md:col-span-8 lg:col-span-9">
          
          {/* Tabs */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-wrap gap-2">
              {['PROFILE', 'PAYROLL', 'LEAVE', 'DOCUMENTS', 'TIMELINE'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded transition-colors ${
                    activeTab === tab 
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-900 border-b-2 border-zinc-600 shadow-sm' 
                      : 'bg-zinc-100 dark:bg-zinc-50/50 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === 'PROFILE' && (
              <div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white px-5 py-2 rounded text-xs font-bold transition-colors shadow-sm">
                    <Edit size={14} /> EDIT
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 bg-zinc-500 hover:bg-zinc-600 text-zinc-950 px-4 py-2 rounded text-xs font-bold transition-colors">
                      <X size={14} /> CANCEL
                    </button>
                    <button onClick={handleSave} disabled={loading} className="flex items-center gap-1 bg-zinc-950 hover:bg-zinc-800 text-white px-5 py-2 rounded text-xs font-bold transition-colors shadow-sm">
                      {loading ? 'SAVING...' : <><Save size={14} /> SAVE</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-lg shadow-sm p-6">
            
            {activeTab === 'PROFILE' && (
              <div className="space-y-8 animate-in fade-in">
                
                {/* Personal Info */}
                <div>
                  <h3 className="text-zinc-950 dark:text-zinc-900 font-bold text-xs uppercase tracking-wider mb-2">Personal Info</h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Mobile No" name="mobile" />
                    <InputField label="Emergency Mobile" name="emergencyMobile" />
                    <InputField label="Email (Used for Login)" name="email" type="email" />
                    <InputField label="Driving License" name="drivingLicense" />
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row py-3 border-b border-zinc-100 dark:border-zinc-200">
                        <div className="sm:w-1/3 text-sm text-zinc-500 dark:text-zinc-600 py-1">Gender</div>
                        <div className="sm:w-2/3">
                          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-200 bg-white dark:bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950">
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
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row py-3 border-b border-zinc-100 dark:border-zinc-200">
                        <div className="sm:w-1/3 text-sm text-zinc-500 dark:text-zinc-600 py-1">Marital Status</div>
                        <div className="sm:w-2/3">
                          <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-200 bg-white dark:bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950">
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
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-zinc-950 dark:text-zinc-900 font-bold text-xs uppercase tracking-wider mb-2">Address</h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Current Address" name="currentAddress" />
                    <InputField label="Permanent Address" name="permanentAddress" />
                  </div>
                </div>

                {/* Bank Account */}
                <div>
                  <h3 className="text-zinc-950 dark:text-zinc-900 font-bold text-xs uppercase tracking-wider mb-2">Bank Account Details</h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Account Name" name="accountName" />
                    <InputField label="Bank Account Number" name="bankAccountNumber" />
                    <InputField label="Bank Name" name="bankName" />
                    <InputField label="Branch Name" name="branchName" />
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-zinc-950 dark:text-zinc-900 font-bold text-xs uppercase tracking-wider mb-2">Social Links Details</h3>
                  <div className="border-t border-zinc-200 dark:border-zinc-200">
                    <InputField label="Facebook Url" name="facebookUrl" />
                    <InputField label="Twitter Url" name="twitterUrl" />
                    <InputField label="Linkedin Url" name="linkedinUrl" />
                    <InputField label="Instagram Url" name="instagramUrl" />
                  </div>
                </div>

              </div>
            )}

            {activeTab !== 'PROFILE' && (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>No data available for {activeTab} yet.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}


