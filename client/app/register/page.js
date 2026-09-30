'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Image as ImageIcon, FileCheck, Upload, Trash2, CheckCircle, ShieldAlert, Building, ShieldCheck } from 'lucide-react';
import api from '@/services/api';
import { ThemeToggle } from '@/components/ThemeToggle';

// Helper for client-side image compression to prevent large payload network errors
const compressImageToBase64 = (file, maxWidth = 800, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    
    // If it's a PDF, read as Data URL directly
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
  const [role, setRole] = useState('Student');
  const [availableRoles, setAvailableRoles] = useState(['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent', 'Accountant']);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    async function checkAvailableRoles() {
      try {
        const res = await api.get(`/auth/registration-status?t=${Date.now()}`);
        const roles = [];
        if (!res?.hasSuperAdmin) {
          roles.push('Super Admin');
        }
        if (!res?.hasAdmin) {
          roles.push('Admin');
        }
        roles.push('Teacher', 'Student', 'Parent', 'Accountant');
        setAvailableRoles(roles);
        if (roles.length > 0) {
          setRole(roles[0]);
        }
      } catch (e) {
        const roles = ['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent', 'Accountant'];
        setAvailableRoles(roles);
        if (roles.length > 0) {
          setRole(roles[0]);
        }
      } finally {
        setStatusLoading(false);
      }
    }
    checkAvailableRoles();
  }, []);

  const [classes, setClasses] = useState([]);
  
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await api.get('/class');
        if (res.success) setClasses(res.data);
      } catch (err) {}
    }
    fetchClasses();
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cnic: '',
    schoolName: '',
    schoolAddress: '',
    address: '',
    fatherName: '',
    dob: '',
    joiningDate: new Date().toISOString().split('T')[0],
    studentClass: '',
    section: '',
    picture: '',
    cnicFront: '',
    cnicBack: ''
  });

  // Previews & Documents state
  const [previews, setPreviews] = useState({
    picture: null,
    cnicFront: null,
    cnicBack: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller image.");
      return;
    }

    try {
      const compressedBase64 = await compressImageToBase64(file);
      setFormData(prev => ({ ...prev, [fieldName]: compressedBase64 }));

      // Create preview URL
      const isImg = file.type.startsWith('image/');
      setPreviews(prev => ({
        ...prev,
        [fieldName]: {
          url: URL.createObjectURL(file),
          name: file.name,
          type: isImg ? 'image' : 'pdf'
        }
      }));
    } catch (err) {
      console.error("File processing error:", err);
    }
  };

  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: '' }));
    setPreviews(prev => ({ ...prev, [fieldName]: null }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    let errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First Name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    }

    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if ((role === 'Super Admin' || role === 'Admin') && !formData.schoolName.trim()) {
      errors.schoolName = "School Name is required for Super Admin / Admin accounts.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const resolvedFullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const generatedUsername = formData.username.trim() || `${formData.firstName.trim().toLowerCase()}_${Date.now().toString().slice(-4)}`;

      const payload = {
        role,
        fullName: resolvedFullName,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: generatedUsername,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        cnic: formData.cnic.trim(),
        schoolName: formData.schoolName.trim(),
        schoolAddress: formData.schoolAddress.trim() || formData.address.trim(),
        address: formData.address.trim() || formData.schoolAddress.trim(),
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        picture: formData.picture,
        cnicFront: formData.cnicFront,
        cnicBack: formData.cnicBack,
        studentClass: formData.studentClass,
        section: formData.section
      };

      const res = await api.post('/auth/register', payload);

      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(res?.message || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Registration failed. Please check your internet connection.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400";
  const labelClass = "block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 py-12 transition-colors duration-300">
      
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <Link href="/login" className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 font-bold transition-colors text-sm">
          <ArrowLeft size={18} /> Back to Login
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Create an Account</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Join Stoofi School Management ERP platform. Select your role to begin.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs font-semibold animate-in fade-in duration-200">
            <ShieldAlert size={18} className="shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3 text-emerald-800 dark:text-emerald-400 text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-600" />
            <span>Registration successful! Redirecting to login page...</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* Role Selection Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>Register As <span className="text-rose-500">*</span></label>
              {!availableRoles.includes('Super Admin') && (
                <span className="text-[10px] text-zinc-400 font-semibold">Super Admin & Admin registered</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent', 'Accountant'].map((r) => {
                const isAvailable = availableRoles.includes(r);
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setRole(r)}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : isAvailable
                        ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Syed"
                className={inputClass}
                required
              />
              {fieldErrors.firstName && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.firstName}</p>}
            </div>

            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Qamar Shah"
                className={inputClass}
              />
            </div>
          </div>

          {/* Section: Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Username (Optional)</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. qamar_shah"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email Address <span className="text-rose-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. admin@school.com"
                className={inputClass}
                required
              />
              {fieldErrors.email && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.email}</p>}
            </div>
          </div>

          {/* Section: School Info for Admin & Super Admin */}
          {(role === 'Super Admin' || role === 'Admin') && (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <Building size={16} /> Institution Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>School / College Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="e.g. Stoofi Grammar School"
                    className={inputClass}
                    required
                  />
                  {fieldErrors.schoolName && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.schoolName}</p>}
                </div>
                <div>
                  <label className={labelClass}>School Address / Location</label>
                  <input
                    type="text"
                    name="schoolAddress"
                    value={formData.schoolAddress}
                    onChange={handleChange}
                    placeholder="e.g. Campus 1, Gulberg, Lahore"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password <span className="text-rose-500">*</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className={inputClass}
                required
              />
              {fieldErrors.password && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className={labelClass}>Confirm Password <span className="text-rose-500">*</span></label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={inputClass}
                required
              />
              {fieldErrors.confirmPassword && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
          </div>

          {/* Section: Phone, CNIC & Joining Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="03351234567"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>CNIC / National ID</label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                placeholder="35202-1234567-1"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Section: Address */}
          <div>
            <label className={labelClass}>Personal Address / Location</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. House #12, Street 4, Lahore"
              className={inputClass}
            />
          </div>

          {/* LEGAL DOCUMENTS & PICTURE UPLOADS WITH LIVE PREVIEW */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <FileCheck size={16} className="text-emerald-500" /> Identity Documents & Profile Picture
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Profile Picture */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                <label className={labelClass}>Profile Picture / Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'picture')}
                  className="hidden"
                  id="picture-upload"
                />
                <label
                  htmlFor="picture-upload"
                  className="flex items-center justify-center gap-2 p-2.5 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-emerald-500 transition-colors"
                >
                  <Upload size={14} /> Choose Image
                </label>

                {previews.picture && (
                  <div className="mt-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center gap-2">
                    <img src={previews.picture.url} alt="Profile" className="w-10 h-10 rounded object-cover border border-emerald-500" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <ShieldCheck size={12} /> Uploaded
                      </p>
                    </div>
                    <button type="button" onClick={() => removeFile('picture')} className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* CNIC Front */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                <label className={labelClass}>CNIC Front Image</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'cnicFront')}
                  className="hidden"
                  id="cnic-front-upload"
                />
                <label
                  htmlFor="cnic-front-upload"
                  className="flex items-center justify-center gap-2 p-2.5 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-emerald-500 transition-colors"
                >
                  <Upload size={14} /> Front CNIC
                </label>

                {previews.cnicFront && (
                  <div className="mt-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center gap-2">
                    {previews.cnicFront.type === 'image' ? (
                      <img src={previews.cnicFront.url} alt="CNIC Front" className="w-10 h-10 rounded object-cover border border-emerald-500" />
                    ) : (
                      <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold text-white">PDF</div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <ShieldCheck size={12} /> VERIFIED
                      </p>
                    </div>
                    <button type="button" onClick={() => removeFile('cnicFront')} className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* CNIC Back */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                <label className={labelClass}>CNIC Back Image</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'cnicBack')}
                  className="hidden"
                  id="cnic-back-upload"
                />
                <label
                  htmlFor="cnic-back-upload"
                  className="flex items-center justify-center gap-2 p-2.5 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-emerald-500 transition-colors"
                >
                  <Upload size={14} /> Back CNIC
                </label>

                {previews.cnicBack && (
                  <div className="mt-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center gap-2">
                    {previews.cnicBack.type === 'image' ? (
                      <img src={previews.cnicBack.url} alt="CNIC Back" className="w-10 h-10 rounded object-cover border border-emerald-500" />
                    ) : (
                      <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold text-white">PDF</div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <ShieldCheck size={12} /> VERIFIED
                      </p>
                    </div>
                    <button type="button" onClick={() => removeFile('cnicBack')} className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 text-sm tracking-wide mt-6"
          >
            {loading ? "REGISTERING ACCOUNT..." : "REGISTER NOW"}
          </button>
        </form>
      </div>
    </div>
  );
}
