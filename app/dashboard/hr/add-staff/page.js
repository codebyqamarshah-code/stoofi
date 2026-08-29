'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, Upload, User, CreditCard, Building, Share2, FileText, Settings } from 'lucide-react';
import api from '@/services/api';

const TODAY = new Date().toISOString().split('T')[0];

const TABS = [
  { id: 'basic', label: 'BASIC INFO', icon: User },
  { id: 'payroll', label: 'PAYROLL DETAILS', icon: CreditCard },
  { id: 'bank', label: 'BANK INFO DETAILS', icon: Building },
  { id: 'social', label: 'SOCIAL LINKS DETAILS', icon: Share2 },
  { id: 'document', label: 'DOCUMENT INFO', icon: FileText },
  { id: 'custom', label: 'CUSTOM FIELD', icon: Settings },
];

const EMPTY = {
  staffNo: '', role: '', departmentId: '', designationId: '',
  firstName: '', lastName: '', fatherName: '', motherName: '',
  email: '', gender: '', dateOfBirth: '', dateOfJoining: TODAY,
  mobile: '', maritalStatus: '', emergencyMobile: '', drivingLicense: '',
  showAsExpert: 'no', currentAddress: '', permanentAddress: '',
  qualifications: '', experience: '',
  // payroll
  basicSalary: '', allowances: '', deductions: '',
  // bank
  bankName: '', accountNo: '', accountName: '', branchName: '', ifscCode: '',
  // social
  facebook: '', twitter: '', linkedin: '', instagram: '',
};

export default function AddStaffPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(EMPTY);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [nextStaffNo, setNextStaffNo] = useState('');

  useEffect(() => {
    Promise.all([api.get('/designation'), api.get('/department'), api.get('/staff')]).then(([d, dep, st]) => {
      if (d.success) setDesignations(d.data);
      if (dep.success) setDepartments(dep.data);
      if (st.success) {
        const nos = st.data.map(s => Number(s.staffNo)).filter(Boolean);
        setNextStaffNo(nos.length ? String(Math.max(...nos) + 1) : '1');
        setFormData(f => ({ ...f, staffNo: nos.length ? String(Math.max(...nos) + 1) : '1' }));
      }
    }).catch(() => {});
  }, []);

  const set = (field, val) => setFormData(f => ({ ...f, [field]: val }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.email || !formData.role) { alert('First Name, Email and Role are required.'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/staff', formData);
      if (res.success) {
        alert('Staff saved successfully!');
        setFormData({ ...EMPTY, staffNo: String(Number(formData.staffNo) + 1), dateOfJoining: TODAY });
        setPhotoPreview(null);
      }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const inputCls = "w-full h-10 rounded-md border border-zinc-700 bg-transparent px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const selectCls = "w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const textareaCls = "w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[90px] resize-y";
  const labelCls = "text-xs font-bold text-zinc-400 uppercase tracking-wider";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-white">Add New Staff</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
          <Link href="/dashboard/hr/staff-directory" className="hover:text-emerald-400 transition-colors">Human Resource</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
          <span className="text-emerald-400 font-medium">Add New Staff</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-md">
        {/* Card Header */}
        <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">Staff Information</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 text-sm font-bold rounded-md transition-colors">
              <Upload className="h-4 w-4" /> IMPORT STAFF
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-colors disabled:opacity-50">
              <Check className="h-4 w-4" /> {submitting ? 'SAVING...' : 'SAVE STAFF'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-zinc-800 bg-zinc-900/30 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'}`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {/* BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-2">
                  <label className={labelCls}>STAFF NO <span className="text-rose-500">*</span></label>
                  <input type="text" value={formData.staffNo} onChange={e => set('staffNo', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>ROLE <span className="text-rose-500">*</span></label>
                  <select value={formData.role} onChange={e => set('role', e.target.value)} className={selectCls}>
                    <option value="">Role *</option>
                    {['admin','teacher','staff','accountant','driver','super admin'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>DEPARTMENT</label>
                  <select value={formData.departmentId} onChange={e => set('departmentId', e.target.value)} className={selectCls}>
                    <option value="">Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>DESIGNATION</label>
                  <select value={formData.designationId} onChange={e => set('designationId', e.target.value)} className={selectCls}>
                    <option value="">Designations</option>
                    {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-2">
                  <label className={labelCls}>FIRST NAME <span className="text-rose-500">*</span></label>
                  <input type="text" value={formData.firstName} onChange={e => set('firstName', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>LAST NAME</label>
                  <input type="text" value={formData.lastName} onChange={e => set('lastName', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>FATHER NAME</label>
                  <input type="text" value={formData.fatherName} onChange={e => set('fatherName', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>MOTHER NAME</label>
                  <input type="text" value={formData.motherName} onChange={e => set('motherName', e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-2">
                  <label className={labelCls}>EMAIL <span className="text-rose-500">*</span></label>
                  <input type="email" value={formData.email} onChange={e => set('email', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>GENDER</label>
                  <select value={formData.gender} onChange={e => set('gender', e.target.value)} className={selectCls}>
                    <option value="">Gender *</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>DATE OF BIRTH</label>
                  <input type="date" value={formData.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>DATE OF JOINING</label>
                  <input type="date" value={formData.dateOfJoining} onChange={e => set('dateOfJoining', e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-2">
                  <label className={labelCls}>MOBILE</label>
                  <input type="tel" value={formData.mobile} onChange={e => set('mobile', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>MARITAL STATUS</label>
                  <select value={formData.maritalStatus} onChange={e => set('maritalStatus', e.target.value)} className={selectCls}>
                    <option value="">Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>EMERGENCY MOBILE</label>
                  <input type="tel" value={formData.emergencyMobile} onChange={e => set('emergencyMobile', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>DRIVING LICENSE</label>
                  <input type="text" value={formData.drivingLicense} onChange={e => set('drivingLicense', e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Photo & Expert Staff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelCls}>STAFF PHOTO</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-10 rounded-md border border-zinc-700 bg-transparent px-3 flex items-center text-sm text-zinc-600">
                      {photo ? photo.name : 'Staff Photo'}
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-colors">
                      BROWSE
                      <input type="file" accept=".jpg,.jpeg,.png" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs text-emerald-400">(JPG,JPEG,PNG are allowed for upload)</p>
                  {photoPreview && <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-zinc-700 mt-2" />}
                </div>
                <div className="space-y-3">
                  <label className={labelCls}>Show As Expert Staff</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="yes" checked={formData.showAsExpert === 'yes'} onChange={() => set('showAsExpert', 'yes')} className="w-4 h-4 accent-emerald-600" />
                      <span className="text-sm text-zinc-300">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="no" checked={formData.showAsExpert === 'no'} onChange={() => set('showAsExpert', 'no')} className="w-4 h-4 accent-emerald-600" />
                      <span className="text-sm text-zinc-300">no</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelCls}>CURRENT ADDRESS</label>
                  <textarea value={formData.currentAddress} onChange={e => set('currentAddress', e.target.value)} className={textareaCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>PERMANENT ADDRESS</label>
                  <textarea value={formData.permanentAddress} onChange={e => set('permanentAddress', e.target.value)} className={textareaCls} />
                </div>
              </div>

              {/* Qualifications & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelCls}>QUALIFICATIONS</label>
                  <textarea value={formData.qualifications} onChange={e => set('qualifications', e.target.value)} className={textareaCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>EXPERIENCE</label>
                  <textarea value={formData.experience} onChange={e => set('experience', e.target.value)} className={textareaCls} />
                </div>
              </div>
            </div>
          )}

          {/* PAYROLL DETAILS */}
          {activeTab === 'payroll' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-2"><label className={labelCls}>BASIC SALARY</label><input type="number" value={formData.basicSalary} onChange={e => set('basicSalary', e.target.value)} className={inputCls} placeholder="0.00" /></div>
              <div className="space-y-2"><label className={labelCls}>ALLOWANCES</label><input type="number" value={formData.allowances} onChange={e => set('allowances', e.target.value)} className={inputCls} placeholder="0.00" /></div>
              <div className="space-y-2"><label className={labelCls}>DEDUCTIONS</label><input type="number" value={formData.deductions} onChange={e => set('deductions', e.target.value)} className={inputCls} placeholder="0.00" /></div>
              <div className="sm:col-span-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <p className="text-sm text-zinc-400">Net Salary: <span className="text-xl font-bold text-emerald-400">{((Number(formData.basicSalary)||0) + (Number(formData.allowances)||0) - (Number(formData.deductions)||0)).toLocaleString()}</span></p>
              </div>
            </div>
          )}

          {/* BANK INFO */}
          {activeTab === 'bank' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2"><label className={labelCls}>BANK NAME</label><input type="text" value={formData.bankName} onChange={e => set('bankName', e.target.value)} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>ACCOUNT NUMBER</label><input type="text" value={formData.accountNo} onChange={e => set('accountNo', e.target.value)} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>ACCOUNT HOLDER NAME</label><input type="text" value={formData.accountName} onChange={e => set('accountName', e.target.value)} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>BRANCH NAME</label><input type="text" value={formData.branchName} onChange={e => set('branchName', e.target.value)} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>IFSC / SWIFT CODE</label><input type="text" value={formData.ifscCode} onChange={e => set('ifscCode', e.target.value)} className={inputCls} /></div>
            </div>
          )}

          {/* SOCIAL LINKS */}
          {activeTab === 'social' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2"><label className={labelCls}>FACEBOOK</label><input type="url" value={formData.facebook} onChange={e => set('facebook', e.target.value)} className={inputCls} placeholder="https://facebook.com/..." /></div>
              <div className="space-y-2"><label className={labelCls}>TWITTER / X</label><input type="url" value={formData.twitter} onChange={e => set('twitter', e.target.value)} className={inputCls} placeholder="https://twitter.com/..." /></div>
              <div className="space-y-2"><label className={labelCls}>LINKEDIN</label><input type="url" value={formData.linkedin} onChange={e => set('linkedin', e.target.value)} className={inputCls} placeholder="https://linkedin.com/..." /></div>
              <div className="space-y-2"><label className={labelCls}>INSTAGRAM</label><input type="url" value={formData.instagram} onChange={e => set('instagram', e.target.value)} className={inputCls} placeholder="https://instagram.com/..." /></div>
            </div>
          )}

          {/* DOCUMENT INFO */}
          {activeTab === 'document' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {['NID / National ID', 'Passport', 'Resume / CV', 'Other Document'].map(doc => (
                <div key={doc} className="space-y-2">
                  <label className={labelCls}>{doc.toUpperCase()}</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-10 rounded-md border border-zinc-700 bg-transparent px-3 flex items-center text-sm text-zinc-600">{doc}</div>
                    <label className="cursor-pointer px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-md transition-colors border border-zinc-700">
                      BROWSE<input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CUSTOM FIELD */}
          {activeTab === 'custom' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Settings className="h-12 w-12 text-zinc-600 mb-3" />
              <p className="text-zinc-500 text-sm">No custom fields configured yet.</p>
              <p className="text-xs text-zinc-600 mt-1">Go to Settings → Custom Field → Staff Registration to add custom fields.</p>
            </div>
          )}
        </div>

        {/* Save Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-colors disabled:opacity-50">
            <Check className="h-4 w-4" /> {submitting ? 'SAVING...' : 'SAVE STAFF'}
          </button>
        </div>
      </div>
    </div>
  );
}

