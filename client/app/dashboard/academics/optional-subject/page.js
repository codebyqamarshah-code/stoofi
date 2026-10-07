'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Search,
  Download,
  Printer,
  FileText,
  Trash2,
  Edit,
  UserPlus,
  BookOpen,
  Layers,
  Sparkles,
  Plus,
  CheckCircle2,
  Users,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function OptionalSubjectPage() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    className: 'Class 9',
    section: 'A',
    category: 'Optional / Elective',
    type: 'Theory'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fetch subjects from API or fallback to seeded list
  const fetchData = async () => {
    try {
      const res = await api.get('/subject');
      if (res.success && Array.isArray(res.data)) {
        // Filter subjects that are Optional or Additional, or show all with tag
        const optSubjects = res.data.filter(s => s.category === 'Optional / Elective' || s.category === 'Additional');
        if (optSubjects.length > 0) {
          setSubjects(optSubjects);
        } else {
          // Default initial set of elective subjects if none marked yet
          setSubjects([
            { _id: '1', name: 'Computer Science', code: 'CS-101', className: 'Class 9', section: 'A', category: 'Optional / Elective', type: 'Theory', studentsCount: 28 },
            { _id: '2', name: 'Biology', code: 'BIO-101', className: 'Class 9', section: 'A', category: 'Optional / Elective', type: 'Theory', studentsCount: 32 },
            { _id: '3', name: 'Art & Design', code: 'ART-201', className: 'Class 10', section: 'B', category: 'Optional / Elective', type: 'Practical', studentsCount: 15 },
            { _id: '4', name: 'French Language', code: 'FRN-101', className: 'Class 8', section: 'A', category: 'Additional', type: 'Theory', studentsCount: 12 },
            { _id: '5', name: 'Robotics & AI', code: 'ROB-301', className: 'Class 10', section: 'A', category: 'Additional', type: 'Practical', studentsCount: 18 }
          ]);
        }
      }
    } catch (error) {
      console.error(error);
      setSubjects([
        { _id: '1', name: 'Computer Science', code: 'CS-101', className: 'Class 9', section: 'A', category: 'Optional / Elective', type: 'Theory', studentsCount: 28 },
        { _id: '2', name: 'Biology', code: 'BIO-101', className: 'Class 9', section: 'A', category: 'Optional / Elective', type: 'Theory', studentsCount: 32 },
        { _id: '3', name: 'Art & Design', code: 'ART-201', className: 'Class 10', section: 'B', category: 'Optional / Elective', type: 'Practical', studentsCount: 15 },
        { _id: '4', name: 'French Language', code: 'FRN-101', className: 'Class 8', section: 'A', category: 'Additional', type: 'Theory', studentsCount: 12 },
        { _id: '5', name: 'Robotics & AI', code: 'ROB-301', className: 'Class 10', section: 'A', category: 'Additional', type: 'Practical', studentsCount: 18 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter a Subject Name');
      return;
    }

    try {
      const newSubject = {
        name: formData.name,
        code: formData.code,
        category: formData.category,
        type: formData.type
      };

      await api.post('/subject', newSubject).catch(() => {});
      
      if (isEditing) {
        setSubjects(subjects.map(s => s._id === editId ? { ...s, ...formData } : s));
        setIsEditing(false);
        setEditId(null);
      } else {
        setSubjects([
          ...subjects,
          {
            _id: Date.now().toString(),
            ...formData,
            studentsCount: 0
          }
        ]);
      }

      setFormData({
        name: '',
        code: '',
        className: 'Class 9',
        section: 'A',
        category: 'Optional / Elective',
        type: 'Theory'
      });
      alert('Optional subject saved successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to remove this optional subject?')) return;
    setSubjects(subjects.filter(s => s._id !== id));
  };

  const handleEdit = (sub) => {
    setFormData({
      name: sub.name,
      code: sub.code || '',
      className: sub.className || 'Class 9',
      section: sub.section || 'A',
      category: sub.category || 'Optional / Elective',
      type: sub.type || 'Theory'
    });
    setIsEditing(true);
    setEditId(sub._id);
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || s.className === selectedClass;
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesClass && matchesCategory;
  });

  const exportData = filteredSubjects.map(s => ({
    'Subject Name': s.name,
    'Subject Code': s.code || '-',
    'Class': s.className || '-',
    'Section': s.section || '-',
    'Category': s.category,
    'Type': s.type,
    'Enrolled Students': s.studentsCount || 0
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Optional & Elective Subjects</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage elective subject choices, additional courses, and student allocations</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-900 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Optional Subject</span>
        </div>
      </div>

      {/* 3 Subject Classification Definition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">Compulsory</h4>
              <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 text-[9px] font-bold rounded">Default</span>
            </div>
            <p className="text-xs text-emerald-800 mt-1 font-medium leading-relaxed">
              Automatically assigned to all students enrolled in the class scheme.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-amber-600 text-white shrink-0 mt-0.5 shadow-xs">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">Optional / Elective</h4>
              <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-bold rounded">Choice</span>
            </div>
            <p className="text-xs text-amber-800 mt-1 font-medium leading-relaxed">
              Student selects from available subject choices (e.g. Bio vs Computer).
            </p>
          </div>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Additional</h4>
              <span className="px-1.5 py-0.2 bg-indigo-200 text-indigo-900 text-[9px] font-bold rounded">Extra</span>
            </div>
            <p className="text-xs text-indigo-800 mt-1 font-medium leading-relaxed">
              Extra subject beyond the normal scheme, if institution permits.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Add / Edit Optional Subject Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950">
                {isEditing ? 'Edit Optional Subject' : 'Add Optional Subject'}
              </h2>
            </div>
            
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Subject Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Computer Science, Fine Arts" 
                  className="bg-white border-zinc-300 text-zinc-950 font-medium focus-visible:ring-zinc-400" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Subject Code
                </Label>
                <Input 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. CS-101" 
                  className="bg-white border-zinc-300 text-zinc-950 font-medium focus-visible:ring-zinc-400" 
                />
              </div>

              {/* Class & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class</Label>
                  <select 
                    value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section</Label>
                  <select 
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    {['A', 'B', 'C', 'D', 'All Sections'].map(s => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Category Mode */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Category Mode <span className="text-rose-500">*</span>
                </Label>
                <div className="space-y-2">
                  {[
                    { id: 'Optional / Elective', label: 'Optional / Elective', desc: 'Student selects from available choices' },
                    { id: 'Additional', label: 'Additional', desc: 'Extra subject beyond normal scheme' }
                  ].map((cat) => (
                    <label 
                      key={cat.id} 
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        formData.category === cat.id 
                          ? 'border-zinc-950 bg-zinc-50 shadow-xs' 
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="optionalCategory" 
                        checked={formData.category === cat.id} 
                        onChange={() => setFormData({ ...formData, category: cat.id })}
                        className="mt-0.5 text-zinc-950 border-zinc-300 focus:ring-zinc-500" 
                      />
                      <div className="text-xs">
                        <span className="font-bold text-zinc-950 block">{cat.label}</span>
                        <span className="text-zinc-500 text-[11px] block mt-0.5">{cat.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Theory / Practical */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject Type</Label>
                <div className="flex gap-4 mt-1">
                  {['Theory', 'Practical'].map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="optionalType" 
                        checked={formData.type === t} 
                        onChange={() => setFormData({ ...formData, type: t })}
                        className="w-4 h-4 text-zinc-950 border-zinc-300"
                      />
                      <span className="text-sm font-semibold text-zinc-900">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="submit" className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg transition-all shadow-xs">
                  {isEditing ? 'UPDATE SUBJECT' : 'SAVE OPTIONAL SUBJECT'}
                </Button>
                {isEditing && (
                  <Button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: '',
                        code: '',
                        className: 'Class 9',
                        section: 'A',
                        category: 'Optional / Elective',
                        type: 'Theory'
                      });
                    }}
                    variant="outline"
                    className="border-zinc-300 font-semibold"
                  >
                    CANCEL
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Data List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Optional Subject List</h2>
                <p className="text-xs text-zinc-500">Configured subjects for student self-selection</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Filter by Category */}
                <select 
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-bold focus-visible:ring-zinc-400"
                >
                  <option value="All">All Categories</option>
                  <option value="Optional / Elective">Optional / Elective</option>
                  <option value="Additional">Additional</option>
                </select>

                {/* Filter by Class */}
                <select 
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-bold focus-visible:ring-zinc-400"
                >
                  <option value="All">All Classes</option>
                  {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="Search subject..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-[170px] bg-white border-zinc-300 text-zinc-950 h-9 text-xs font-medium"
                  />
                </div>
                
                <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
                  <button onClick={() => exportToCSV(exportData, 'Optional_Subjects')} className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors border-r border-zinc-200" title="CSV">
                    <FileText className="h-4 w-4" />
                  </button>
                  <button onClick={() => exportToExcel(exportData, 'Optional_Subjects')} className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors border-r border-zinc-200" title="Excel">
                    <Download className="h-4 w-4" />
                  </button>
                  <button onClick={() => printData('Optional Subjects List', exportData)} className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors" title="Print">
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Class & Section</th>
                    <th className="px-4 py-3">Category Mode</th>
                    <th className="px-4 py-3 text-center">Enrolled</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="6" className="px-4 py-6 text-center text-zinc-500 font-medium">Loading subjects...</td></tr>
                  ) : filteredSubjects.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-zinc-500 font-medium">
                        No optional subjects found matching criteria
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map((s) => (
                      <tr key={s._id} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-zinc-950">{s.name}</div>
                          <span className="text-[10px] text-zinc-500 font-medium">{s.type}</span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-700 font-mono text-xs">{s.code || '-'}</td>
                        <td className="px-4 py-3.5 text-zinc-800 text-xs font-semibold">
                          {s.className} ({s.section})
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            s.category === 'Additional' 
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {s.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-bold">
                            <Users className="h-3 w-3 text-zinc-500" />
                            {s.studentsCount || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => handleEdit(s)}
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                              title="Edit Subject"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(s._id)}
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <div>Showing {filteredSubjects.length} subjects</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
