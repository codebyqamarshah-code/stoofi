'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Image as ImageIcon } from 'lucide-react';
import api from '@/services/api';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
  const [role, setRole] = useState('Student');
  const [availableRoles, setAvailableRoles] = useState(['Student', 'Teacher', 'Parent', 'Accountant']);
  const [statusLoading, setStatusLoading] = useState(true);

  React.useEffect(() => {
    async function checkAvailableRoles() {
      try {
        const res = await api.get('/auth/registration-status');
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
        let users = [];
        try {
          users = JSON.parse(localStorage.getItem('mockDB_users') || '[]');
        } catch (err) {}
        const hasSuperAdmin = users.some(u => u.role === 'Super Admin');
        const hasAdmin = users.some(u => u.role === 'Admin');
        const roles = [];
        if (!hasSuperAdmin) roles.push('Super Admin');
        if (!hasAdmin) roles.push('Admin');
        roles.push('Teacher', 'Student', 'Parent', 'Accountant');
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

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    fatherName: '',
    dob: '',
    joiningDate: '',
    studentClass: '',
    section: '',
    cnic: '',
    picture: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    // Reset specific fields when role changes
    setFormData(prev => ({
      ...prev,
      studentClass: '',
      section: '',
      cnic: '',
      joiningDate: '',
      address: '',
      fatherName: '',
      dob: ''
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setFieldErrors({});
    let errors = {};

    // Password validation
    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.password = "Password must contain at least one special character.";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    // Teacher Age Validation
    if (role === 'Teacher' && formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 20) {
        errors.dob = "Teacher must be at least 20 years old.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        role,
        ...formData
      };
      
      // Auto-set DOB to current date for staff roles if empty
      if (!payload.dob) {
        payload.dob = new Date().toISOString().split('T')[0];
      }
      
      // Auto-set Joining Date if empty
      if (!payload.joiningDate) {
        payload.joiningDate = new Date().toISOString().split('T')[0];
      }

      const res = await api.post('/auth/register', payload);
      if (res && res.success) {
        setSuccess(true);
        // Add a slight delay then go to login
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 transition-all text-sm";
  const labelClass = "block text-xs font-bold text-zinc-600 dark:text-zinc-600 mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-zinc-50 dark:bg-white transition-colors duration-300">
      
      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <Link href="/login" className="flex items-center gap-2 text-zinc-950 font-semibold hover:opacity-80 transition-opacity text-sm">
          <ArrowLeft size={16} /> Back to Login
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-white rounded-2xl p-8 sm:p-10 border border-zinc-200 dark:border-zinc-200 shadow-xl">
        
        <div className="flex justify-center mb-6">
           <img src="/stoofi light.png" alt="Stoofi PRO" className="h-14 w-auto object-contain" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-900 mb-2">Create an Account</h1>
          <p className="text-sm text-zinc-500">Join our ERP platform. Register below.</p>
        </div>

        {success ? (
          <div className="p-6 rounded-xl bg-zinc-100 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 text-center border border-zinc-300 dark:border-zinc-200">
            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-1">Registration Successful!</h3>
            <p className="text-sm opacity-80">You will be redirected to the login page shortly.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900 text-center">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>Register As</label>
                {availableRoles.length < 6 && (
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {!availableRoles.includes('Super Admin') && !availableRoles.includes('Admin') ? 'Super Admin & Admin registered' : !availableRoles.includes('Super Admin') ? 'Super Admin registered' : 'Admin registered'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
                {availableRoles.map(r => (
                  <label key={r} className={`cursor-pointer border rounded-xl p-2.5 sm:p-3 text-center transition-all flex flex-col items-center justify-center ${role === r ? 'border-zinc-950 bg-zinc-950/5 dark:bg-white/10 text-zinc-950 font-bold shadow-sm' : 'border-zinc-200 dark:border-zinc-200 text-zinc-500 hover:border-zinc-950/50'}`}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={handleRoleChange} className="hidden" />
                    <span className="text-xs sm:text-sm font-semibold">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Common Fields */}
              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className={inputClass} placeholder="John Doe" />
              </div>
              
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="john@example.com" />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className={`${inputClass} ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="••••••••" />
                {fieldErrors.password && <span className="text-red-500 text-[11px] font-bold mt-1.5 block">{fieldErrors.password}</span>}
              </div>

              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className={`${inputClass} ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="••••••••" />
                {fieldErrors.confirmPassword && <span className="text-red-500 text-[11px] font-bold mt-1.5 block">{fieldErrors.confirmPassword}</span>}
              </div>
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+1234567890" />
              </div>

              {/* Conditional Fields based on Role */}
              
              {/* Address (For Everyone) */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Full Address" />
              </div>

              {/* CNIC (For everyone except Student) */}
              {role !== 'Student' && (
                <div>
                  <label className={labelClass}>CNIC</label>
                  <input type="text" name="cnic" required value={formData.cnic} onChange={handleChange} className={inputClass} placeholder="12345-1234567-1" />
                </div>
              )}

              {/* Joining Date (For everyone except Student and Parent) */}
              {(role !== 'Student' && role !== 'Parent') && (
                <div>
                  <label className={labelClass}>Joining Date</label>
                  <input type="date" name="joiningDate" required value={formData.joiningDate} onChange={handleChange} className={inputClass} />
                </div>
              )}

              {/* Father Name (Only for Student) */}
              {role === 'Student' && (
                <div>
                  <label className={labelClass}>Father's Name</label>
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputClass} placeholder="Father's Name" />
                </div>
              )}
              
              {/* DOB (For Student, Teacher, Parent) */}
              {(role === 'Student' || role === 'Teacher' || role === 'Parent') && (
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className={`${inputClass} ${fieldErrors.dob ? 'border-red-500 focus:ring-red-500' : ''}`} />
                  {fieldErrors.dob && <span className="text-red-500 text-[11px] font-bold mt-1.5 block">{fieldErrors.dob}</span>}
                </div>
              )}
              
              {role === 'Student' && (
                <>
                  <div>
                    <label className={labelClass}>Class</label>
                    <select name="studentClass" required value={formData.studentClass} onChange={handleChange} className={inputClass}>
                      <option value="">Select Class</option>
                      {['1','2','3','4','5','6','7','8','9','10'].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Section</label>
                    <select name="section" required value={formData.section} onChange={handleChange} className={inputClass}>
                      <option value="">Select Section</option>
                      {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* Photo Upload */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Profile Picture</label>
                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-100 transition-colors relative overflow-hidden group">
                  {formData.picture ? (
                    <div className="relative w-full flex flex-col items-center">
                      <img src={formData.picture} alt="Preview" className="h-24 w-24 rounded-full object-cover border-4 border-zinc-950 shadow-sm mb-2" />
                      <span className="text-xs text-red-500 font-bold cursor-pointer hover:underline relative z-10" onClick={(e) => { e.preventDefault(); setFormData(prev => ({...prev, picture: null}))}}>Remove Image</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center pointer-events-none">
                      <ImageIcon size={24} className="mb-2 text-zinc-950" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-700">Click to upload picture</span>
                      <span className="text-xs opacity-70 mt-1">PNG, JPG up to 2MB</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, picture: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-4 rounded-xl font-bold tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-70 mt-6 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'REGISTERING...' : 'REGISTER NOW'}
            </button>

          </form>
        )}
        
      </div>
    </div>
  );
}
