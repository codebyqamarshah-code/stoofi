'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Image as ImageIcon, FileCheck, Upload, Trash2, CheckCircle, ShieldAlert, Building, ShieldCheck, GraduationCap } from 'lucide-react';
import api from '@/services/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StoofiLogo } from '@/components/StoofiLogo';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';

// Helper for client-side image compression to prevent large payload network errors
const compressImageToBase64 = (file, maxWidth = 600, quality = 0.6) => {
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
  const [availableRoles, setAvailableRoles] = useState(['Super Admin', 'Admin', 'Teacher', 'Student']);
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
        roles.push('Teacher', 'Student');
        setAvailableRoles(roles);
        if (roles.length > 0) {
          setRole(roles[0]);
        }
      } catch (e) {
        const roles = ['Super Admin', 'Admin', 'Teacher', 'Student'];
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
    cnicBack: '',
    previousSchool: '',
    previousClassesTaught: '',
    experienceYears: '',
    characterCertificate: '',
    experienceLetter: ''
  });

  // Previews & Documents state
  const [previews, setPreviews] = useState({
    picture: null,
    cnicFront: null,
    cnicBack: null,
    characterCertificate: null,
    experienceLetter: null
  });

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isGibberish = (str) => {
    if (!str || str.trim().length < 2) return false;
    const s = str.trim().toLowerCase();
    const mashPatterns = [
      'qwerty', 'asdfgh', 'zxcvbn', 'fghjkl'
    ];
    if (mashPatterns.some(p => s.includes(p))) return true;
    if (/^(.)\1{4,}$/.test(s)) return true;
    if (/[bcdfghjklmnpqrstvwxyz]{7,}/.test(s)) return true;
    return false;
  };

  const isFakeEmail = (emailStr) => {
    if (!emailStr) return false;
    const s = emailStr.trim().toLowerCase();
    const fakeDomains = ['test.com', 'example.com', 'foo.com', 'bar.com', 'fake.com', 'dummy.com', 'temp.com'];
    const parts = s.split('@');
    if (parts.length === 2 && fakeDomains.includes(parts[1])) return true;
    return false;
  };

  const isFakePhone = (phoneStr) => {
    if (!phoneStr) return false;
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) return true;
    const fakePatterns = [
      '03000000000', '03111111111', '03222222222', '03333333333', 
      '03444444444', '03555555555', '03666666666', '03777777777', 
      '03888888888', '03999999999', '03123456789', '03012345678',
      '923000000000', '923111111111', '923123456789'
    ];
    if (fakePatterns.includes(digits)) return true;
    if (/^(\d)\1+$/.test(digits)) return true;
    return false;
  };

  const isFakeCnic = (cnicStr) => {
    if (!cnicStr) return false;
    const digits = cnicStr.replace(/\D/g, '');
    if (digits.length !== 13) return true;
    if (/^(\d)\1+$/.test(digits)) return true;
    if (digits === '1234567890123' || digits === '0123456789012') return true;
    return false;
  };

  const validatePasswordStrict = (password) => {
    if (!password || password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least 1 uppercase letter (A-Z).";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least 1 lowercase letter (a-z).";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least 1 number (0-9).";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least 1 special character (e.g. @, #, $, %, !).";
    }
    return "";
  };

  const mapServerErrorToFields = (msg) => {
    const errs = {};
    if (!msg) return errs;
    const lower = msg.toLowerCase();

    if (lower.includes('email')) {
      errs.email = msg;
    } else if (lower.includes('phone')) {
      errs.phone = msg;
    } else if (lower.includes('cnic front') || lower.includes('front document')) {
      errs.cnicFront = msg;
    } else if (lower.includes('cnic back') || lower.includes('back document')) {
      errs.cnicBack = msg;
    } else if (lower.includes('cnic')) {
      errs.cnic = msg;
    } else if (lower.includes('password')) {
      errs.password = msg;
    } else if (lower.includes('school')) {
      errs.schoolName = msg;
    } else if (lower.includes('username')) {
      errs.username = msg;
    } else if (lower.includes('address') || lower.includes('location')) {
      errs.address = msg;
    } else if (lower.includes('first name') || lower.includes('name')) {
      errs.firstName = msg;
    }
    return errs;
  };

  const validateSingleField = (name, value, currentFormData = formData) => {
    let err = "";
    const phoneRegex = /^(\+92|92|0)?3[0-9]{9}$/;
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$|^[0-9]{13}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const userAge = calculateAge(currentFormData.dob);
    const isMinorStudent = role === 'Student' && userAge !== null && userAge < 18;

    if (name === 'firstName') {
      if (!value.trim()) err = "First Name is required.";
      else if (value.trim().length < 2 || isGibberish(value)) err = "Please enter a valid First Name in English.";
    } else if (name === 'lastName') {
      if (value.trim() && isGibberish(value)) err = "Please enter a valid Last Name in English.";
    } else if (name === 'username') {
      if (!value.trim()) err = "Username is required.";
      else if (value.trim().length < 3) err = "Username must be at least 3 characters.";
      else if (!/^[a-zA-Z0-9_.-]+$/.test(value.trim())) err = "Username can only contain letters, numbers, underscores, dots, or hyphens.";
    } else if (name === 'email') {
      if (!value.trim()) err = "Email address is required.";
      else if (!emailRegex.test(value.trim()) || isFakeEmail(value)) err = "Enter a valid real email address (e.g. user@domain.com).";
    } else if (name === 'phone') {
      if (!value.trim()) {
        err = "Phone Number is required.";
      } else if (!phoneRegex.test(value.trim()) || isFakePhone(value)) {
        err = "Please enter a valid 11-digit Pakistani phone number starting with 03 (e.g. 03351234567).";
      }
    } else if (name === 'cnic') {
      if (!isMinorStudent) {
        if (!value.trim()) err = "CNIC / National ID number is required.";
        else if (!cnicRegex.test(value.trim()) || isFakeCnic(value)) err = "Please enter a valid 13-digit Pakistani CNIC number (e.g. 35202-1234567-1).";
      }
    } else if (name === 'studentClass' && role === 'Student') {
      if (!value || !value.trim()) err = "Please select your Class / Grade.";
    } else if (name === 'section' && role === 'Student') {
      if (!value || !value.trim()) err = "Please select your Section.";
    } else if (name === 'password') {
      err = validatePasswordStrict(value);
    } else if (name === 'confirmPassword') {
      if (!value) err = "Please confirm your password.";
      else if (value !== currentFormData.password) err = "Passwords do not match.";
    } else if (name === 'schoolName' && (role === 'Super Admin' || role === 'Admin') && !value.trim()) {
      err = "School Name is required for Super Admin / Admin accounts.";
    }

    setFieldErrors(prev => {
      const updated = { ...prev };
      if (err) {
        updated[name] = err;
      } else {
        delete updated[name];
      }
      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...formData, [name]: value };
    setFormData(newForm);
    validateSingleField(name, value, newForm);

    if (name === 'password' && newForm.confirmPassword) {
      validateSingleField('confirmPassword', newForm.confirmPassword, newForm);
    }
    if (name === 'dob' && newForm.cnic) {
      validateSingleField('cnic', newForm.cnic, newForm);
    }
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: "File size exceeds 5MB limit. Please upload a smaller image." }));
      return;
    }

    try {
      const compressedBase64 = await compressImageToBase64(file);
      setFormData(prev => ({ ...prev, [fieldName]: compressedBase64 }));
      setFieldErrors(prev => ({ ...prev, [fieldName]: "" }));

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
    const userAge = calculateAge(formData.dob);
    const isMinorStudent = role === 'Student' && userAge !== null && userAge < 18;
    setFieldErrors(prev => ({ 
      ...prev, 
      [fieldName]: (!isMinorStudent && fieldName.includes('cnic')) ? `${fieldName.includes('Front') ? 'CNIC Front' : 'CNIC Back'} document image is required.` : '' 
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    let errors = {};

    const phoneRegex = /^(\+92|92|0)?3[0-9]{9}$/;
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$|^[0-9]{13}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const userAge = calculateAge(formData.dob);
    const isMinorStudent = role === 'Student' && userAge !== null && userAge < 18;

    if (!formData.firstName.trim()) {
      errors.firstName = "First Name is required.";
    } else if (formData.firstName.trim().length < 2 || isGibberish(formData.firstName.trim())) {
      errors.firstName = "Please enter a valid First Name in English. Random characters are not allowed.";
    }

    if (formData.lastName.trim() && isGibberish(formData.lastName.trim())) {
      errors.lastName = "Please enter a valid Last Name in English.";
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required.";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username.trim())) {
      errors.username = "Username can only contain letters, numbers, underscores, dots, or hyphens.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim()) || isFakeEmail(formData.email.trim())) {
      errors.email = "Enter a valid real email address (e.g. user@domain.com).";
    }

    const passErr = validatePasswordStrict(formData.password);
    if (passErr) {
      errors.password = passErr;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if ((role === 'Super Admin' || role === 'Admin') && !formData.schoolName.trim()) {
      errors.schoolName = "School Name is required for Super Admin / Admin accounts.";
    }

    if (role === 'Student') {
      if (!formData.studentClass || !formData.studentClass.trim()) {
        errors.studentClass = "Please select your Class / Grade.";
      }
      if (!formData.section || !formData.section.trim()) {
        errors.section = "Please select your Section.";
      }
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone Number is required.";
    } else if (!phoneRegex.test(formData.phone.trim()) || isFakePhone(formData.phone.trim())) {
      errors.phone = "Please enter a valid 11-digit Pakistani phone number starting with 03 (e.g. 03351234567).";
    }

    if (!isMinorStudent) {
      if (!formData.cnic.trim()) {
        errors.cnic = "CNIC / National ID number is required.";
      } else if (!cnicRegex.test(formData.cnic.trim()) || isFakeCnic(formData.cnic.trim())) {
        errors.cnic = "Please enter a valid 13-digit Pakistani CNIC number (e.g. 35202-1234567-1).";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      const resolvedFullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

      const payload = {
        role,
        fullName: resolvedFullName,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        cnic: formData.cnic.trim(),
        schoolName: formData.schoolName.trim(),
        schoolAddress: formData.schoolAddress.trim(),
        address: formData.schoolAddress.trim(),
        dob: formData.dob,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        picture: formData.picture,
        cnicFront: formData.cnicFront,
        cnicBack: formData.cnicBack,
        studentClass: formData.studentClass,
        section: formData.section,
        gender: formData.gender || 'Male',
        characterCertificate: formData.characterCertificate,
        experienceLetter: formData.experienceLetter,
        previousSchool: formData.previousSchool,
        previousClassesTaught: formData.previousClassesTaught,
        previousSchoolContact: formData.previousSchoolContact
      };

      const res = await api.post('/auth/register', payload, { timeout: 25000 });

      if (res && res.success) {
        const userObj = res.data || {};
        const profileToStore = {
          _id: userObj._id,
          name: userObj.fullName || userObj.name || resolvedFullName,
          fullName: userObj.fullName || userObj.name || resolvedFullName,
          username: userObj.username || formData.username.trim(),
          email: userObj.email || formData.email.trim().toLowerCase(),
          role: userObj.role || role,
          avatar: userObj.avatar || formData.picture || '',
          picture: userObj.avatar || formData.picture || '',
          className: userObj.className || formData.studentClass || '',
          section: userObj.section || formData.section || ''
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('recent_user', JSON.stringify(profileToStore));
          if (res.token) {
            localStorage.setItem('token', res.token);
            sessionStorage.setItem('token', res.token);
            Cookies.set('token', res.token, { path: '/', expires: 7 });
          }
        }

        if (res.token) {
          useAuth.getState().setSession(userObj, res.token);
        }

        setSuccess(true);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setTimeout(() => {
          if (res.token) {
            const finalRole = userObj.role || role;
            if (finalRole === 'Super Admin' || finalRole === 'Admin') {
              window.location.href = '/dashboard';
            } else if (finalRole === 'Teacher') {
              window.location.href = '/dashboard/teacher';
            } else if (finalRole === 'Student') {
              window.location.href = '/dashboard/student';
            } else {
              window.location.href = '/dashboard';
            }
          } else {
            router.push('/login');
          }
        }, 1500);
      } else {
        const serverMsg = res?.message || 'Registration failed. Please check your information.';
        const mapped = mapServerErrorToFields(serverMsg);
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...mapped }));
          setError(null);
        } else {
          setError(serverMsg);
        }
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Registration failed. Please check your information.';
      const mapped = mapServerErrorToFields(errMsg);
      if (Object.keys(mapped).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...mapped }));
        setError(null);
      } else {
        setError(errMsg);
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
          <div className="mb-6 flex justify-center">
            <StoofiLogo size="lg" />
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
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Super Admin', 'Admin', 'Teacher', 'Student'].map((r) => {
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
                onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
                placeholder="Enter first name"
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
                placeholder="Enter last name"
                className={inputClass}
              />
            </div>
          </div>

          {/* Section: Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Username <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
                placeholder="Enter unique username (e.g. user_123)"
                className={inputClass}
                required
              />
              {fieldErrors.username && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.username}</p>}
            </div>

            <div>
              <label className={labelClass}>Email Address <span className="text-rose-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
                placeholder="e.g. admin@school.com"
                className={inputClass}
                required
              />
              {fieldErrors.email && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.email}</p>}
            </div>
          </div>

          {/* Section: Student Academic Class & Section */}
          {role === 'Student' && (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <GraduationCap size={16} /> Academic Class & Section <span className="text-rose-500">*</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Class / Grade <span className="text-rose-500">*</span></label>
                  <select
                    name="studentClass"
                    value={formData.studentClass}
                    onChange={handleChange}
                    onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">-- Select Enrolled Class --</option>
                    {classes && classes.length > 0 ? (
                      classes.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      [
                        'Play Group', 'Nursery', 'Prep',
                        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                        'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
                      ].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    )}
                  </select>
                  {fieldErrors.studentClass && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.studentClass}</p>}
                </div>

                <div>
                  <label className={labelClass}>Section <span className="text-rose-500">*</span></label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">-- Select Section --</option>
                    {['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'General'].map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                  {fieldErrors.section && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.section}</p>}
                </div>
              </div>
            </div>
          )}

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
                    onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
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
                    placeholder="Enter school campus / address"
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
                onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
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
                onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
                placeholder="Re-enter password"
                className={inputClass}
                required
              />
              {fieldErrors.confirmPassword && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
          </div>

          {/* Section: Date of Birth, Phone & CNIC */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Date of Birth (DOB)</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
                placeholder="03351234567"
                className={inputClass}
              />
              {fieldErrors.phone && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className={labelClass}>
                CNIC / National ID {role === 'Student' && calculateAge(formData.dob) !== null && calculateAge(formData.dob) < 18 ? <span className="text-xs text-zinc-400 font-normal">(Optional)</span> : <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
                placeholder="35202-1234567-1"
                className={inputClass}
              />
              {fieldErrors.cnic && <p className="text-rose-500 text-xs font-medium mt-1">{fieldErrors.cnic}</p>}
            </div>
          </div>


          {/* Section: Teacher Experience Background */}
          {role === 'Teacher' && (
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                <Building size={16} /> Teaching Experience & History
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Previous School / College</label>
                  <input
                    type="text"
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={handleChange}
                    placeholder="e.g. Army Public School"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Classes / Subjects Taught</label>
                  <input
                    type="text"
                    name="previousClassesTaught"
                    value={formData.previousClassesTaught}
                    onChange={handleChange}
                    placeholder="e.g. Class 9th & 10th Math"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Teaching Experience (Years)</label>
                  <input
                    type="text"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    placeholder="e.g. 3 Years"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

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
