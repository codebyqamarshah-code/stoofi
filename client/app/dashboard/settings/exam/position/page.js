'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, Search, Trophy } from 'lucide-react';
import Link from 'next/link';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function PositionPage() {
  const [exam, setExam] = useState('');
  const [classVal, setClassVal] = useState('');
  const [section, setSection] = useState('');

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [examRes, classRes, secRes, stuRes] = await Promise.all([
          api.get('/exam-setup'),
          api.get('/class'),
          api.get('/section'),
          api.get('/student?limit=1000') // fetch as many as possible for mapping
        ]);
        
        if (examRes?.success && Array.isArray(examRes.data)) setExams(examRes.data);
        if (classRes?.success && Array.isArray(classRes.data)) setClasses(classRes.data);
        if (secRes?.success && Array.isArray(secRes.data)) setSections(secRes.data);
        if (stuRes?.success && Array.isArray(stuRes.data)) setStudents(stuRes.data);
      } catch (err) {
        console.error('Error fetching dropdown data', err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSearch = async () => {
    if (!exam || !classVal || !section) {
      alert('Please select Exam, Class, and Section');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get('/marks-register');
      if (res?.success && Array.isArray(res.data)) {
        // Filter marks by selected criteria
        const filteredMarks = res.data.filter(m => 
          String(m.examId) === String(exam) && 
          String(m.classId) === String(classVal) && 
          String(m.sectionId) === String(section)
        );
        
        // Group by student
        const studentTotals = {};
        filteredMarks.forEach(m => {
          if (!studentTotals[m.studentId]) {
            studentTotals[m.studentId] = { studentId: m.studentId, totalMarks: 0, subjects: 0 };
          }
          studentTotals[m.studentId].totalMarks += Number(m.marks || 0);
          studentTotals[m.studentId].subjects += 1;
        });
        
        // Convert to array and sort by total marks descending
        let positions = Object.values(studentTotals).sort((a, b) => b.totalMarks - a.totalMarks);
        
        // Assign rank/position
        positions = positions.map((p, index) => {
          // Find student name
          const stu = students.find(s => String(s._id) === String(p.studentId));
          return {
            ...p,
            position: index + 1,
            studentName: stu ? (stu.firstName + ' ' + (stu.lastName || '')) : 'Unknown Student',
            admissionNo: stu ? stu.admissionNo : '-'
          };
        });
        
        setSearchResults(positions);
      }
    } catch (err) {
      console.error('Error fetching marks', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Position Setup</h1>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Exam</span><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Settings</span><span className="mx-2">|</span>
          <span className="text-indigo-400 font-medium">Position Setup</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-6">Select Criteria</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Exam *</label>
            <SearchableSelect 
              name="exam" 
              value={exam} 
              onChange={(e) => setExam(e.target.value)} 
              placeholder="Select Exam *"
              options={exams.map(e => ({ label: e.examName || e.name || e._id, value: e._id }))} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Class *</label>
            <SearchableSelect 
              name="classVal" 
              value={classVal} 
              onChange={(e) => setClassVal(e.target.value)} 
              placeholder="Select Class *"
              options={classes.map(c => ({ label: c.name, value: c._id }))} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Section *</label>
            <SearchableSelect 
              name="section" 
              value={section} 
              onChange={(e) => setSection(e.target.value)} 
              placeholder="Select Section *"
              options={sections.map(s => ({ label: s.name, value: s._id }))} 
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Search className="w-4 h-4" /> {loading ? 'SEARCHING...' : 'SEARCH'}
          </button>
        </div>
      </div>

      {searchResults && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 bg-zinc-800/30 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-zinc-950">Position Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-950">
              <thead className="bg-zinc-50/50 text-xs uppercase font-semibold text-zinc-900 font-bold">
                <tr>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Admission No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Total Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {searchResults.length > 0 ? (
                  searchResults.map((res, i) => (
                    <tr key={i} className="hover:bg-zinc-100 transition-colors">
                      <td className="px-4 py-3 font-bold text-indigo-400">#{res.position}</td>
                      <td className="px-4 py-3">{res.admissionNo}</td>
                      <td className="px-4 py-3 font-medium text-zinc-100">{res.studentName}</td>
                      <td className="px-4 py-3">{res.totalMarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-zinc-500">No marks found for the selected criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
