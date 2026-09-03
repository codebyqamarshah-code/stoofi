"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, User, CreditCard, Building, Share2, FileText, Settings } from "lucide-react";
import api from "@/services/api";
import { CrudForm } from "@/components/ui/CrudForm";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TODAY = new Date().toISOString().split('T')[0];

const TABS = [
  { id: 'basic', label: 'BASIC INFO', icon: User },
  { id: 'payroll', label: 'PAYROLL DETAILS', icon: CreditCard },
  { id: 'bank', label: 'BANK INFO DETAILS', icon: Building },
  { id: 'social', label: 'SOCIAL LINKS', icon: Share2 }
];

const EMPTY = {
  staffNo: '', role: '', departmentId: '', designationId: '',
  firstName: '', lastName: '', fatherName: '', email: '', 
  gender: '', dateOfBirth: '', dateOfJoining: TODAY,
  mobile: '', maritalStatus: '', emergencyMobile: '', 
  currentAddress: '', permanentAddress: '', qualifications: '', experience: '',
  basicSalary: '', allowances: '', deductions: '',
  bankName: '', accountNo: '', accountName: '', branchName: '', ifscCode: '',
  facebook: '', twitter: '', linkedin: '', instagram: '',
};

export default function AddStaffPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(EMPTY);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/designation'), api.get('/department'), api.get('/staff')])
      .then(([d, dep, st]) => {
        if (d.success) setDesignations(d.data);
        if (dep.success) setDepartments(dep.data);
        if (st.success) {
          const nos = st.data.map(s => Number(s.staffNo)).filter(Boolean);
          const nextNo = nos.length ? String(Math.max(...nos) + 1) : '1';
          setFormData(f => ({ ...f, staffNo: nextNo }));
        }
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (photo) {
        data.append('photo', photo);
      }

      const res = await api.post('/staff', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.success) {
        alert("Staff member saved successfully!");
        setFormData(EMPTY);
        setPhoto(null);
      }
    } catch (e) {
      alert("Error saving staff: " + e.message);
      throw e; // for CrudForm to catch
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <span>Dashboard</span> <ChevronRight size={14} /> 
        <span>Human Resource</span> <ChevronRight size={14} /> 
        <span className="text-emerald-600 font-semibold">Add Staff</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="xl:col-span-1 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all $($){
                activeTab === tab.id 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:text-emerald-500"
              }}
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
            <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ImageUpload label="Staff Photo" onUpload={(file) => setPhoto(file)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Staff ID / Number *</Label>
                  <Input required name="staffNo" value={formData.staffNo} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <select name="designationId" value={formData.designationId} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500">
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>First Name *</Label><Input required name="firstName" value={formData.firstName} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input name="lastName" value={formData.lastName} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Mobile</Label><Input name="mobile" value={formData.mobile} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Date of Joining</Label><Input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} /></div>
              </div>
            </div>

            {/* PAYROLL */}
            <div className={activeTab === 'payroll' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Basic Salary</Label><Input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Allowances</Label><Input type="number" name="allowances" value={formData.allowances} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Deductions</Label><Input type="number" name="deductions" value={formData.deductions} onChange={handleChange} /></div>
              </div>
            </div>

            {/* BANK */}
            <div className={activeTab === 'bank' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bank Name</Label><Input name="bankName" value={formData.bankName} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Account Name</Label><Input name="accountName" value={formData.accountName} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Account Number</Label><Input name="accountNo" value={formData.accountNo} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Branch / IFSC</Label><Input name="ifscCode" value={formData.ifscCode} onChange={handleChange} /></div>
              </div>
            </div>

            {/* SOCIAL */}
            <div className={activeTab === 'social' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Facebook URL</Label><Input name="facebook" value={formData.facebook} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>LinkedIn URL</Label><Input name="linkedin" value={formData.linkedin} onChange={handleChange} /></div>
                <div className="space-y-2"><Label>Twitter URL</Label><Input name="twitter" value={formData.twitter} onChange={handleChange} /></div>
              </div>
            </div>
          </CrudForm>
        </div>
      </div>
    </div>
  );
}
