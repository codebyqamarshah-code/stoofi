"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  User, 
  CreditCard, 
  Building, 
  Share2, 
  FileText, 
  Plus, 
  Upload, 
  CheckCircle2, 
  X, 
  GraduationCap, 
  FileUp, 
  Paperclip
} from "lucide-react";
import api from "@/services/api";
import { CrudForm } from "@/components/ui/CrudForm";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const TODAY = new Date().toISOString().split('T')[0];

const TABS = [
  { id: 'basic', label: 'BASIC INFO', icon: User },
  { id: 'payroll', label: 'PAYROLL DETAILS', icon: CreditCard },
  { id: 'bank', label: 'BANK INFO DETAILS', icon: Building },
  { id: 'social', label: 'SOCIAL LINKS', icon: Share2 },
  { id: 'document', label: 'DOCUMENT INFO', icon: FileText }
];

const ROLES = [
  'Teacher',
  'Staff',
  'Admin',
  'Director',
  'Marketer',
  'Accountant',
  'Librarian',
  'Receptionist',
  'Driver',
  'Other'
];

const EMPTY = {
  staffNo: 'PRCS0001', 
  role: 'Teacher', 
  departmentId: '', 
  designationId: '',
  firstName: '', 
  lastName: '', 
  fatherName: '', 
  email: '', 
  gender: 'Male', 
  dateOfBirth: '', 
  dateOfJoining: TODAY,
  mobile: '', 
  maritalStatus: 'Single', 
  emergencyMobile: '', 
  currentAddress: '', 
  permanentAddress: '', 
  qualifications: '', 
  experience: '',
  basicSalary: '', 
  allowances: '', 
  deductions: '',
  bankName: '', 
  accountNo: '', 
  accountName: '', 
  branchName: '', 
  ifscCode: '',
  facebook: '', 
  twitter: '', 
  linkedin: '', 
  instagram: '',
  cnic: ''
};

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AddStaffPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(EMPTY);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [photo, setPhoto] = useState(null);

  // Document Uploads State (All Optional)
  const [documents, setDocuments] = useState({
    cnicFront: null,
    cnicBack: null,
    cv: null,
    lastDegree: null
  });

  const cnicFrontRef = useRef(null);
  const cnicBackRef = useRef(null);
  const cvRef = useRef(null);
  const degreeRef = useRef(null);

  const fetchStaffNoAndDropdowns = () => {
    Promise.all([
      api.get('/designation').catch(() => null),
      api.get('/department').catch(() => null),
      api.get('/staff').catch(() => null)
    ])
      .then(([d, dep, st]) => {
        if (d?.success && Array.isArray(d.data)) setDesignations(d.data);
        if (dep?.success && Array.isArray(dep.data)) setDepartments(dep.data);
        if (st?.success && Array.isArray(st.data)) {
          let maxNum = 0;
          st.data.forEach(s => {
            const str = String(s.staffNo || '').trim();
            const m = str.match(/\d+/);
            if (m) {
              const num = parseInt(m[0], 10);
              if (num > maxNum) maxNum = num;
            }
          });
          const nextStaffNo = `PRCS${String(maxNum + 1).padStart(4, '0')}`;
          setFormData(f => ({ ...f, staffNo: nextStaffNo }));
        }
      })
      .catch(err => console.error('Fetch staff initial error:', err));
  };

  useEffect(() => {
    fetchStaffNoAndDropdowns();
    window.addEventListener('focus', fetchStaffNoAndDropdowns);
    return () => window.removeEventListener('focus', fetchStaffNoAndDropdowns);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocumentSelect = (key, file) => {
    if (!file) return;
    setDocuments(prev => ({ ...prev, [key]: file }));
  };

  const handleDocumentRemove = (key, ref) => {
    setDocuments(prev => ({ ...prev, [key]: null }));
    if (ref && ref.current) ref.current.value = '';
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          data.append(key, value);
        }
      });
      if (photo) {
        data.append('photo', photo);
      }

      // Append optional documents
      if (documents.cnicFront) data.append('cnicFront', documents.cnicFront);
      if (documents.cnicBack) data.append('cnicBack', documents.cnicBack);
      if (documents.cv) data.append('cv', documents.cv);
      if (documents.lastDegree) data.append('lastDegree', documents.lastDegree);

      const res = await api.post('/staff', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res?.success) {
        alert("Staff member saved successfully!");
        router.push('/dashboard/hr/staff-directory');
      } else {
        alert(res?.message || "Failed to save staff record.");
      }
    } catch (e) {
      alert("Error saving staff: " + (e.message || 'Unknown error'));
      throw e;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <span>Dashboard</span> <ChevronRight size={14} /> 
        <span>Human Resource</span> <ChevronRight size={14} /> 
        <span className="text-zinc-800 font-semibold">Add Staff</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="xl:col-span-1 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id 
                  ? "bg-zinc-800 text-white shadow-md shadow-zinc-800/20" 
                  : "bg-white dark:bg-white text-zinc-600 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-200 hover:border-zinc-600 hover:text-zinc-600"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Form */}
        <div className="xl:col-span-3">
          <CrudForm title="Staff Member Information" buttonText="Save Staff Record" onSubmit={handleSubmit}>
            {/* BASIC INFO */}
            <div className={activeTab === 'basic' ? 'block space-y-6' : 'hidden'}>
              <div>
                <ImageUpload label="Staff Photo" onUpload={(file) => setPhoto(file)} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Staff ID / Number *</Label>
                  <Input 
                    required 
                    name="staffNo" 
                    value={formData.staffNo} 
                    onChange={handleChange} 
                    placeholder="PRCS0001"
                    className="bg-zinc-50 border-zinc-300 font-bold text-zinc-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Role *</Label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 font-medium"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Department</Label>
                    <Link 
                      href="/dashboard/hr/department" 
                      target="_blank"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 hover:underline"
                    >
                      <Plus size={13} className="stroke-[3]" /> Add
                    </Link>
                  </div>
                  <select 
                    name="departmentId" 
                    value={formData.departmentId} 
                    onChange={handleChange} 
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Designation</Label>
                    <Link 
                      href="/dashboard/hr/designation" 
                      target="_blank"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 hover:underline"
                    >
                      <Plus size={13} className="stroke-[3]" /> Add
                    </Link>
                  </div>
                  <select 
                    name="designationId" 
                    value={formData.designationId} 
                    onChange={handleChange} 
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600"
                  >
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">First Name *</Label><Input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g. Ali" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Last Name</Label><Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g. Khan" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Father Name</Label><Input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father Name" /></div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Gender</Label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Date of Birth</Label><Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Date of Joining</Label><Input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">CNIC / ID Number</Label><Input name="cnic" value={formData.cnic} onChange={handleChange} placeholder="35201-1234567-1" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Mobile / Phone *</Label><Input required name="mobile" value={formData.mobile} onChange={handleChange} placeholder="0300-1234567" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Emergency Mobile</Label><Input name="emergencyMobile" value={formData.emergencyMobile} onChange={handleChange} placeholder="Emergency Contact No" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Email</Label><Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="staff@stoofi.com" /></div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Marital Status</Label>
                  <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm">
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Qualifications</Label><Input name="qualifications" value={formData.qualifications} onChange={handleChange} placeholder="e.g. M.Sc Mathematics, B.Ed" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Experience</Label><Input name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5 Years" /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Current Address</Label>
                  <textarea name="currentAddress" value={formData.currentAddress} onChange={handleChange} className="w-full h-20 rounded-md border border-zinc-200 p-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none" placeholder="Current residential address..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Permanent Address</Label>
                  <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="w-full h-20 rounded-md border border-zinc-200 p-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none" placeholder="Permanent home address..." />
                </div>
              </div>
            </div>

            {/* PAYROLL */}
            <div className={activeTab === 'payroll' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Basic Salary (PKR)</Label><Input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} placeholder="50000" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Allowances (PKR)</Label><Input type="number" name="allowances" value={formData.allowances} onChange={handleChange} placeholder="5000" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Deductions (PKR)</Label><Input type="number" name="deductions" value={formData.deductions} onChange={handleChange} placeholder="1000" /></div>
              </div>
            </div>

            {/* BANK */}
            <div className={activeTab === 'bank' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Bank Name</Label><Input name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Meezan Bank / HBL" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Account Title / Name</Label><Input name="accountName" value={formData.accountName} onChange={handleChange} placeholder="Ali Khan" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Account Number / IBAN</Label><Input name="accountNo" value={formData.accountNo} onChange={handleChange} placeholder="PK00MEZN000123456789" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Branch Name / Code</Label><Input name="branchName" value={formData.branchName} onChange={handleChange} placeholder="Main Branch" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">IFSC / Swift Code</Label><Input name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="MEZNPKKA" /></div>
              </div>
            </div>

            {/* SOCIAL */}
            <div className={activeTab === 'social' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Facebook URL</Label><Input name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">LinkedIn URL</Label><Input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Twitter URL</Label><Input name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/..." /></div>
                <div className="space-y-2"><Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Instagram URL</Label><Input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." /></div>
              </div>
            </div>

            {/* DOCUMENT INFO (All Optional) */}
            <div className={activeTab === 'document' ? 'block space-y-6' : 'hidden'}>
              <div className="border-b border-zinc-100 pb-3">
                <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Staff Verification Documents</h3>
                <p className="text-xs text-zinc-500 mt-1">Upload verified staff documents (Images or PDF documents). All uploads are optional.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. CNIC Front */}
                <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 hover:border-zinc-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-[#084A86]" />
                      <span className="text-xs font-bold text-zinc-900 uppercase">CNIC Front</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Optional
                    </span>
                  </div>

                  <input 
                    type="file" 
                    ref={cnicFrontRef} 
                    accept="image/*,.pdf" 
                    className="hidden" 
                    onChange={(e) => handleDocumentSelect('cnicFront', e.target.files?.[0])}
                  />

                  {documents.cnicFront ? (
                    <div className="flex items-center justify-between p-3 bg-white border border-emerald-300 rounded-lg shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-zinc-900 truncate">{documents.cnicFront.name}</p>
                          <p className="text-[10px] text-zinc-500">{formatFileSize(documents.cnicFront.size)}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDocumentRemove('cnicFront', cnicFrontRef)}
                        className="text-zinc-400 hover:text-rose-600 p-1"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => cnicFrontRef.current?.click()}
                      className="border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg p-5 text-center cursor-pointer bg-white transition-colors"
                    >
                      <Upload size={22} className="mx-auto text-zinc-400 mb-1.5" />
                      <p className="text-xs font-bold text-zinc-800">Click to upload CNIC Front</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">JPG, PNG, PDF up to 5MB</p>
                    </div>
                  )}
                </div>

                {/* 2. CNIC Back */}
                <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 hover:border-zinc-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-[#084A86]" />
                      <span className="text-xs font-bold text-zinc-900 uppercase">CNIC Back</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Optional
                    </span>
                  </div>

                  <input 
                    type="file" 
                    ref={cnicBackRef} 
                    accept="image/*,.pdf" 
                    className="hidden" 
                    onChange={(e) => handleDocumentSelect('cnicBack', e.target.files?.[0])}
                  />

                  {documents.cnicBack ? (
                    <div className="flex items-center justify-between p-3 bg-white border border-emerald-300 rounded-lg shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-zinc-900 truncate">{documents.cnicBack.name}</p>
                          <p className="text-[10px] text-zinc-500">{formatFileSize(documents.cnicBack.size)}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDocumentRemove('cnicBack', cnicBackRef)}
                        className="text-zinc-400 hover:text-rose-600 p-1"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => cnicBackRef.current?.click()}
                      className="border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg p-5 text-center cursor-pointer bg-white transition-colors"
                    >
                      <Upload size={22} className="mx-auto text-zinc-400 mb-1.5" />
                      <p className="text-xs font-bold text-zinc-800">Click to upload CNIC Back</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">JPG, PNG, PDF up to 5MB</p>
                    </div>
                  )}
                </div>

                {/* 3. CV / Resume */}
                <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 hover:border-zinc-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-violet-600" />
                      <span className="text-xs font-bold text-zinc-900 uppercase">CV / Resume</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Optional
                    </span>
                  </div>

                  <input 
                    type="file" 
                    ref={cvRef} 
                    accept=".pdf,.doc,.docx,image/*" 
                    className="hidden" 
                    onChange={(e) => handleDocumentSelect('cv', e.target.files?.[0])}
                  />

                  {documents.cv ? (
                    <div className="flex items-center justify-between p-3 bg-white border border-emerald-300 rounded-lg shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-zinc-900 truncate">{documents.cv.name}</p>
                          <p className="text-[10px] text-zinc-500">{formatFileSize(documents.cv.size)}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDocumentRemove('cv', cvRef)}
                        className="text-zinc-400 hover:text-rose-600 p-1"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => cvRef.current?.click()}
                      className="border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg p-5 text-center cursor-pointer bg-white transition-colors"
                    >
                      <FileUp size={22} className="mx-auto text-zinc-400 mb-1.5" />
                      <p className="text-xs font-bold text-zinc-800">Click to upload CV / Resume</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  )}
                </div>

                {/* 4. Last Degree / Certificate */}
                <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 hover:border-zinc-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={18} className="text-amber-600" />
                      <span className="text-xs font-bold text-zinc-900 uppercase">Last Degree / Certificate</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Optional
                    </span>
                  </div>

                  <input 
                    type="file" 
                    ref={degreeRef} 
                    accept=".pdf,.doc,.docx,image/*" 
                    className="hidden" 
                    onChange={(e) => handleDocumentSelect('lastDegree', e.target.files?.[0])}
                  />

                  {documents.lastDegree ? (
                    <div className="flex items-center justify-between p-3 bg-white border border-emerald-300 rounded-lg shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-zinc-900 truncate">{documents.lastDegree.name}</p>
                          <p className="text-[10px] text-zinc-500">{formatFileSize(documents.lastDegree.size)}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDocumentRemove('lastDegree', degreeRef)}
                        className="text-zinc-400 hover:text-rose-600 p-1"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => degreeRef.current?.click()}
                      className="border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg p-5 text-center cursor-pointer bg-white transition-colors"
                    >
                      <Upload size={22} className="mx-auto text-zinc-400 mb-1.5" />
                      <p className="text-xs font-bold text-zinc-800">Click to upload Last Degree / Certificate</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CrudForm>
        </div>
      </div>
    </div>
  );
}
