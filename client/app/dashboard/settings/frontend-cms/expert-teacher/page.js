'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { fetchCmsSection, mutateCmsSection, compressCmsImage } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  Search,
  ChevronDown,
  Trash2,
  Plus,
  Edit3,
  Upload,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Award,
  GraduationCap,
  UserCheck
} from 'lucide-react';

export default function ExpertStaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [dbStaff, setDbStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [selectedDbStaffId, setSelectedDbStaffId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Teacher');
  const [designation, setDesignation] = useState('Senior Faculty');
  const [subject, setSubject] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [image, setImage] = useState('');

  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    const items = await fetchCmsSection('expertTeacher', []);
    setStaffList(Array.isArray(items) ? items : []);

    try {
      const [tRes, sRes] = await Promise.all([
        fetch('/api/teacher', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/staff', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ data: [] }))
      ]);
      const teachers = Array.isArray(tRes?.data) ? tRes.data : [];
      const staff = Array.isArray(sRes?.data) ? sRes.data : [];
      const combined = [...teachers, ...staff].filter(Boolean);
      setDbStaff(combined);
    } catch {
      setDbStaff([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectDbStaff = (staffId) => {
    setSelectedDbStaffId(staffId);
    if (!staffId) return;
    const found = dbStaff.find((s) => String(s._id || s.id) === String(staffId));
    if (found) {
      setName(found.fullName || `${found.firstName || ''} ${found.lastName || ''}`.trim() || found.name || '');
      setRole(found.role || 'Teacher');
      setDesignation(found.designation || found.department || 'Senior Teacher');
      setSubject(found.department || found.subject || '');
      setQualification(found.qualification || '');
      setExperience(found.experience ? `${found.experience}` : '');
      if (found.photo) setImage(found.photo);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressCmsImage(file, 400, 0.82);
    setImage(dataUrl);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedDbStaffId('');
    setName('');
    setRole('Teacher');
    setDesignation('Senior Faculty');
    setSubject('');
    setQualification('');
    setExperience('');
    setImage('');
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Please enter Staff Name');
    setSaving(true);
    const payload = {
      id: editingId || `staff-${Date.now()}`,
      name: name.trim(),
      role: role || 'Teacher',
      designation: designation.trim() || 'Senior Teacher',
      subject: subject.trim(),
      qualification: qualification.trim(),
      experience: experience.trim(),
      image:
        image ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
    };

    const res = await mutateCmsSection('expertTeacher', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    setSaving(false);
    if (res.success) {
      setStaffList(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'Expert faculty updated!' : 'Expert faculty added to Home Page!');
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setRole(item.role || 'Teacher');
    setDesignation(item.designation || '');
    setSubject(item.subject || '');
    setQualification(item.qualification || '');
    setExperience(item.experience || '');
    setImage(item.image || '');
    setOpenDropdownId(null);
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('expertTeacher', 'deleteItem', { id });
    if (res.success) {
      setStaffList(Array.isArray(res.data) ? res.data : []);
      showToast('Removed from Expert Staff list.');
    }
    setOpenDropdownId(null);
  };

  const filtered = staffList.filter(
    (s) =>
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.designation || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Expert Staff</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#009966]" /> Expert Staff & Faculty Showcase
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Feature your institution&apos;s top teachers & coordinators on the public Home Page.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {toast && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
            </span>
          )}
          <Link
            href="/#campus-showcase"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View on Home Page
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              {editingId ? 'Edit Expert Staff' : 'Add Expert Staff'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline">
                Cancel Edit
              </button>
            )}
          </div>

          {dbStaff.length > 0 && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
              <label className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Auto-Fill from Directory (Optional)
              </label>
              <select
                value={selectedDbStaffId}
                onChange={(e) => handleSelectDbStaff(e.target.value)}
                className="w-full bg-white border border-emerald-300 text-zinc-950 font-semibold text-xs rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">-- Choose Existing Teacher / Staff --</option>
                {dbStaff.map((s) => {
                  const fullName = s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name;
                  return (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {fullName} ({s.designation || s.role || 'Faculty'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">STAFF NAME *</label>
            <input
              type="text"
              placeholder="e.g. Dr. Sarah Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">ROLE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              >
                <option value="Teacher">Teacher</option>
                <option value="Department Head">Department Head</option>
                <option value="Principal">Principal</option>
                <option value="Coordinator">Coordinator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">DESIGNATION *</label>
              <input
                type="text"
                placeholder="e.g. Senior Lecturer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">SUBJECT / DEPT</label>
              <input
                type="text"
                placeholder="e.g. Physics / STEM"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">QUALIFICATION</label>
              <input
                type="text"
                placeholder="e.g. Ph.D., M.Phil"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">STAFF PHOTO</label>
            <div className="flex items-center gap-3">
              {image && (
                <img
                  src={image}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0"
                />
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex-1 border border-dashed border-zinc-300 hover:border-[#009966] bg-zinc-50 hover:bg-emerald-50/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-[#009966]" /> {image ? 'Change Photo' : 'Upload Staff Photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full bg-[#009966] hover:bg-[#008055] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-xs text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {editingId ? 'UPDATE STAFF' : 'ADD TO EXPERT STAFF'}
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Expert Staff List ({filtered.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff..."
                  className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-36"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left py-3 px-4 text-zinc-800 font-bold text-xs uppercase">SL</th>
                  <th className="text-left py-3 px-4 text-zinc-800 font-bold text-xs uppercase">Faculty Member</th>
                  <th className="text-left py-3 px-4 text-zinc-800 font-bold text-xs uppercase">Designation & Role</th>
                  <th className="text-left py-3 px-4 text-zinc-800 font-bold text-xs uppercase">Department / Qualification</th>
                  <th className="text-right py-3 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500 text-sm">
                      Loading expert faculty...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500 text-sm">
                      No expert faculty added yet. Select or add a faculty member on the left.
                    </td>
                  </tr>
                ) : (
                  filtered.map((staff, idx) => (
                    <tr key={staff.id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-4 text-zinc-900 font-bold">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              staff.image ||
                              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
                            }
                            alt={staff.name}
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-zinc-950">{staff.name}</div>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {staff.role || 'Teacher'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-900 font-semibold">{staff.designation || 'Faculty'}</td>
                      <td className="py-3 px-4">
                        <div className="text-zinc-900 font-medium text-xs">{staff.subject || 'General Academics'}</div>
                        {staff.qualification && (
                          <div className="text-zinc-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3 h-3" /> {staff.qualification}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(staff)}
                            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(staff.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
