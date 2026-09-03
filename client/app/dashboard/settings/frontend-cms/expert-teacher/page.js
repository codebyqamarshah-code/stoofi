'use client';
import { useState } from 'react';
import { 
  ChevronRight, 
  Search, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Columns, 
  ChevronDown,
  Trash2,
  Plus,
  GripVertical
} from 'lucide-react';

const INITIAL_STAFF = [
  { 
    id: 1, 
    sl: 1, 
    name: 'Iveen Chowdhury', 
    designation: 'Senior Teacher', 
    role: 'Teacher',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' 
  },
  { 
    id: 2, 
    sl: 2, 
    name: 'Dr. Michael Vance', 
    designation: 'Department Head', 
    role: 'Teacher',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' 
  }
];

export default function ExpertStaffPage() {
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [role, setRole] = useState('');
  const [staffName, setStaffName] = useState('');
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleAdd = () => {
    if (!staffName) return alert('Please enter Staff Name');
    const newStaff = {
      id: Date.now(),
      sl: staffList.length + 1,
      name: staffName,
      designation: 'Lecturer',
      role: role || 'Teacher',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    };
    setStaffList(prev => [...prev, newStaff]);
    setStaffName('');
    setRole('');
  };

  const handleDelete = (id) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-emerald-400">Expert Staff</span>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Expert Staff</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Add Expert Staff</h2>
          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">ROLE</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Role</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
              <option value="Coordinator">Coordinator</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">STAFF *</label>
            <input
              type="text"
              placeholder="Name *"
              value={staffName}
              onChange={e => setStaffName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 rounded flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> ADD
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Expert Staff List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-700 rounded px-2 py-1">
                <Search className="w-3 h-3 text-zinc-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH"
                  className="bg-transparent text-xs text-zinc-300 outline-none w-28"
                />
              </div>
              <div className="flex gap-1">
                {[Copy, FileSpreadsheet, FileText, Printer, Download, Columns].map((Icon, i) => (
                  <button key={i} className="p-1 text-zinc-400 hover:text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ SL</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Name</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Designation</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Image</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((staff, idx) => (
                    <tr key={staff.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-3 text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab" />
                          <span className="text-emerald-500 font-medium">{idx + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-200 font-medium">{staff.name}</td>
                      <td className="py-3 px-3 text-zinc-400">{staff.designation}</td>
                      <td className="py-3 px-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                          <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === staff.id ? null : staff.id)}
                            className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-emerald-500 hover:text-emerald-400"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === staff.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleDelete(staff.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-zinc-400">
            <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">←</button>
              <button className="px-2 py-1 bg-emerald-600 text-white rounded">1</button>
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
