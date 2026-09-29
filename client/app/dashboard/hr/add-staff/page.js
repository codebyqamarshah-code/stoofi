"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, User, CreditCard, Building, Share2, FileText, Settings } from "lucide-react";
import api from "@/services/api";
import { CrudForm } from "@/components/ui/CrudForm";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
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


const QUALIFICATION_LEVELS = [
  { label: 'Primary', value: 'Primary' },
  { label: 'Middle', value: 'Middle' },
  { label: 'Matric', value: 'Matric' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Graduation', value: 'Graduation' },
  { label: 'Two Year Diploma', value: 'Two Year Diploma' },
  { label: 'One Year Diploma', value: 'One Year Diploma' },
  { label: 'IT Courses', value: 'IT Courses' },
  { label: 'Other Courses', value: 'Other Courses' },
  { label: 'Master', value: 'Master' },
  { label: 'M Phill', value: 'M Phill' },
  { label: 'PHD', value: 'PHD' }
];

const ROLES = [
  'Teacher',
  'Staff',
  'Admin',
  'Accountant',
  'Super Admin',
  'Driver',
  'Librarian',
  'Receptionist',
  'Other'
];

const EMPTY = {
  staffNo: '', role: 'Teacher', departmentId: '', designationId: '',
  firstName: '', lastName: '', fatherName: '', email: '', 
  gender: 'Male', dateOfBirth: '', dateOfJoining: TODAY,
  mobile: '', maritalStatus: 'Single', emergencyMobile: '', 
  currentAddress: '', permanentAddress: '', qualifications: '', experience: '',
  basicSalary: '', allowances: '', deductions: '',
  bankName: '', accountNo: '', accountName: '', branchName: '', ifscCode: '',
  facebook: '', twitter: '', linkedin: '', instagram: '',
  cnic: '', cnicFront: null, cnicBack: null, document1: null, qualificationLevel: '', qualificationDocument: null,
};

export default function AddStaffPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(EMPTY);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/designation'), api.get('/department'), api.get('/staff')])
      .then(([d, dep, st]) => {
        if (d?.success) setDesignations(d.data || []);
        if (dep?.success) setDepartments(dep.data || []);
        if (st?.success && Array.isArray(st.data)) {
          const nos = st.data.map(s => Number(s.staffNo)).filter(Boolean);
          const nextNo = nos.length ? String(Math.max(...nos) + 1) : '1';
          setFormData(f => ({ ...f, staffNo: nextNo }));
        }
      }).catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
                  <Label>Staff ID / Number *</Label>
                  <Input required name="staffNo" value={formData.staffNo} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <select name="role" value={formData.role} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 font-medium">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <select name="designationId" value={formData.designationId} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600">
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>First Name *</Label><Input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g. Ali" /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g. Khan" /></div>
                <div className="space-y-2"><Label>Father Name</Label><Input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father Name" /></div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Date of Joining</Label><Input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Mobile / Phone *</Label><Input required name="mobile" value={formData.mobile} onChange={handleChange} placeholder="0300-1234567" /></div>
                <div className="space-y-2"><Label>Emergency Mobile</Label><Input name="emergencyMobile" value={formData.emergencyMobile} onChange={handleChange} placeholder="Emergency Contact No" /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="staff@stoofi.com" /></div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm">
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div className="space-y-2"><Label>Qualifications</Label><Input name="qualifications" value={formData.qualifications} onChange={handleChange} placeholder="e.g. M.Sc Mathematics, B.Ed" /></div>
                <div className="space-y-2"><Label>Experience</Label><Input name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5 Years" /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Current Address</Label>
                  <textarea name="currentAddress" value={formData.currentAddress} onChange={handleChange} className="w-full h-20 rounded-md border border-zinc-200 p-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none" placeholder="Current residential address..." />
                </div>
                <div className="space-y-2">
                  <Label>Permanent Address</Label>
                  <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="w-full h-20 rounded-md border border-zinc-200 p-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none" placeholder="Permanent home address..." />
                </div>
              </div>
            </div>

            {/* PAYROLL */}
            <div className={activeTab === 'payroll' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Basic Salary (PKR)</Label><Input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} placeholder="50000" /></div>
                <div className="space-y-2"><Label>Allowances (PKR)</Label><Input type="number" name="allowances" value={formData.allowances} onChange={handleChange} placeholder="5000" /></div>
                <div className="space-y-2"><Label>Deductions (PKR)</Label><Input type="number" name="deductions" value={formData.deductions} onChange={handleChange} placeholder="1000" /></div>
              </div>
            </div>

            {/* BANK */}
            <div className={activeTab === 'bank' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bank Name</Label><Input name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Meezan Bank / HBL" /></div>
                <div className="space-y-2"><Label>Account Title / Name</Label><Input name="accountName" value={formData.accountName} onChange={handleChange} placeholder="Ali Khan" /></div>
                <div className="space-y-2"><Label>Account Number / IBAN</Label><Input name="accountNo" value={formData.accountNo} onChange={handleChange} placeholder="PK00MEZN000123456789" /></div>
                <div className="space-y-2"><Label>Branch Name / Code</Label><Input name="branchName" value={formData.branchName} onChange={handleChange} placeholder="Main Branch" /></div>
                <div className="space-y-2"><Label>IFSC / Swift Code</Label><Input name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="MEZNPKKA" /></div>
              </div>
            </div>

            {/* SOCIAL */}
            <div className={activeTab === 'social' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Facebook URL</Label><Input name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." /></div>
                <div className="space-y-2"><Label>LinkedIn URL</Label><Input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." /></div>
                <div className="space-y-2"><Label>Twitter URL</Label><Input name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/..." /></div>
                <div className="space-y-2"><Label>Instagram URL</Label><Input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." /></div>
              </div>
            </div>
          </CrudForm>
        </div>
      </div>
    </div>
  );
}
