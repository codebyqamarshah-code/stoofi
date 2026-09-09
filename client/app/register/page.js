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
  const [success, setSuccess] = useState(false);
  
  const [role, setRole] = useState('Student');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
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
      joiningDate: ''
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        role,
        ...formData
      };
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

  const inputClass = "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] transition-all text-sm";
  const labelClass = "block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <Link href="/login" className="flex items-center gap-2 text-[#009966] font-semibold hover:opacity-80 transition-opacity text-sm">
          <ArrowLeft size={16} /> Back to Login
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl p-8 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        
        <div className="flex justify-center mb-6">
           <img src="/stoofi light.png" alt="Stoofi PRO" className="h-20 w-auto object-contain dark:hidden" />
           <img src="/stoofi dark.png" alt="Stoofi PRO" className="h-20 w-auto object-contain hidden dark:block" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Create an Account</h1>
          <p className="text-sm text-zinc-500">Join our ERP platform. Register below.</p>
        </div>

        {success ? (
          <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-center border border-emerald-200 dark:border-emerald-800">
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
              <label className={labelClass}>Register As</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Student', 'Teacher', 'Parent', 'Accountant'].map(r => (
                  <label key={r} className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${role === r ? 'border-[#009966] bg-[#009966]/5 dark:bg-[#009966]/10 text-[#009966] font-bold shadow-sm' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-[#009966]/50'}`}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={handleRoleChange} className="hidden" />
                    <span className="text-sm">{r}</span>
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
                <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
              </div>
              
              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+1234567890" />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Full Address" />
              </div>

              <div>
                <label className={labelClass}>Father's Name</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputClass} placeholder="Father's Name" />
              </div>
              
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className={inputClass} />
              </div>

              {/* Conditional Fields based on Role */}
              
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

              {(role === 'Teacher' || role === 'Accountant' || role === 'Staff') && (
                <>
                  <div>
                    <label className={labelClass}>CNIC</label>
                    <input type="text" name="cnic" required value={formData.cnic} onChange={handleChange} className={inputClass} placeholder="12345-1234567-1" />
                  </div>
                  <div>
                    <label className={labelClass}>Joining Date</label>
                    <input type="date" name="joiningDate" required value={formData.joiningDate} onChange={handleChange} className={inputClass} />
                  </div>
                </>
              )}

              {/* Photo Upload */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Profile Picture</label>
                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative overflow-hidden group">
                  {formData.picture ? (
                    <div className="relative w-full flex flex-col items-center">
                      <img src={formData.picture} alt="Preview" className="h-24 w-24 rounded-full object-cover border-4 border-[#009966] shadow-sm mb-2" />
                      <span className="text-xs text-red-500 font-bold cursor-pointer hover:underline relative z-10" onClick={(e) => { e.preventDefault(); setFormData(prev => ({...prev, picture: null}))}}>Remove Image</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center pointer-events-none">
                      <ImageIcon size={24} className="mb-2 text-[#009966]" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Click to upload picture</span>
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
              className="w-full bg-[#009966] hover:bg-emerald-700 text-white py-4 rounded-xl font-bold tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-70 mt-6"
            >
              {loading ? 'REGISTERING...' : 'REGISTER NOW'}
            </button>

          </form>
        )}
        
      </div>
    </div>
  );
}
