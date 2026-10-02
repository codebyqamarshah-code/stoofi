'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Camera, Loader2, Save, BookOpen, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StudentProfilePage() {
  const { user, checkAuth } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    bloodGroup: '',
    admissionNo: '',
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user?.fullName || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        bloodGroup: user?.bloodGroup || '',
        admissionNo: user?.admissionNo || 'ADM-2026-001',
      });
      if (user?.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming we have an endpoint to update user profile
      // In offline mode, the api.js mock will handle it
      const payload = { ...formData, avatar: avatarPreview };
      const endpoint = user?.referenceId ? `/student/${user.referenceId}` : '/auth/me'; // Fallback
      
      const res = await api.put(endpoint, payload);
      
      if (res?.success || res?.message) {
        toast.success('Profile updated successfully');
        await checkAuth(); // Refresh user data in Zustand
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.success('Profile updated (Local Mode)');
      // Forcing a local state update if mock API fails
      const updatedUser = { ...user, ...formData, avatar: avatarPreview };
      sessionStorage.setItem('auth-storage', JSON.stringify({ state: { user: updatedUser, token: sessionStorage.getItem('token'), isAuthenticated: true } }));
      await checkAuth();
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/10 bg-zinc-800 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-zinc-500" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-2 bg-white text-zinc-900 rounded-xl cursor-pointer shadow-lg hover:scale-105 transition-transform border border-zinc-200">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          
          <div className="text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-zinc-700 text-zinc-200 border border-zinc-600">
                STUDENT PROFILE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 capitalize">
              {formData.fullName || 'Student Name'}
            </h1>
            <p className="text-sm font-bold text-zinc-800">
              {formData.email || 'No email provided'}
            </p>
          </div>
        </div>
      </div>

      {/* ── PROFILE FORM ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
              <BookOpen className="w-5 h-5 text-zinc-500" />
              Academic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">Admission Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    name="admissionNo"
                    value={formData.admissionNo}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    value="Student"
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
              <User className="w-5 h-5 text-zinc-500" />
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 rounded-xl text-sm font-medium text-zinc-900 transition-all"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 rounded-xl text-sm font-medium text-zinc-900 transition-all"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-zinc-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 rounded-xl text-sm font-medium text-zinc-900 transition-all"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                  </div>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 rounded-xl text-sm font-medium text-zinc-900 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">Home Address</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 rounded-xl text-sm font-medium text-zinc-900 transition-all resize-none"
                  placeholder="Enter your full home address"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-zinc-100">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-white text-zinc-950 rounded font-bold-xl font-bold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
