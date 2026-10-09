'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState, useRef } from 'react';
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
  Bold,
  Italic,
  Underline,
  List,
  Link2
} from 'lucide-react';

const INITIAL_COURSES = [
  { id: 1, title: 'Aut dolore animi sapiente ea soluta quasi.', overview: 'Voluptate libero quia expedita incidunt voluptatib', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80' },
  { id: 2, title: 'Non incidunt molestiae autem autem.', overview: 'Eveniet maiores adipisci recusandae exercitationem', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80' },
  { id: 3, title: 'Numquam sit et non sint aut aut', overview: 'Laboriosam et doloribus facere et numquam doloruri', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=150&auto=format&fit=crop&q=80' },
  { id: 4, title: 'Quas asperiores dolore voluptatem quibusdam.', overview: 'Fugit id et vel praesentium in. Doloremque ut saep', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80' },
  { id: 5, title: 'Ut beatae sit architecto voluptatibus vitae.', overview: 'Sapiente quos quo dolor nam est. Ferferendis nostr', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150&auto=format&fit=crop&q=80' },
];

export default function CourseListPage() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);
  const [overview, setOverview] = useState('');
  const [outline, setOutline] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [resources, setResources] = useState('');
  const [stats, setStats] = useState('');
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleAdd = () => {
    if (!title) return alert('Please enter Course Title');
    const newCourse = {
      id: Date.now(),
      title,
      overview: overview || 'Course overview and learning milestones.',
      image: file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&auto=format&fit=crop&q=80'
    };
    setCourses(prev => [...prev, newCourse]);
    setTitle('');
    setCategory('');
    setOverview('');
    setOutline('');
    setPrerequisites('');
    setResources('');
    setStats('');
    setFile(null);
  };

  const handleDelete = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.overview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Add Course</span>
      </div>

      <h1 className="text-xl font-bold text-zinc-950">Add Course</h1>

      {/* Top Form: Add Course */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6 space-y-5">
        <h2 className="text-sm font-semibold text-zinc-950">Add Course</h2>

        <div>
          <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">TITLE *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">COURSE CATEGORY *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              <option value="">Course Category *</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Literature">Literature</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">IMAGE</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-700 border border-zinc-200 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Image'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-950 text-sm font-semibold px-4 py-2 rounded cursor-pointer"
              >
                BROWSE
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        {/* Text Areas with Mini Editor Toolbar */}
        {[
          { label: 'OVERVIEW', val: overview, setVal: setOverview },
          { label: 'OUTLINE', val: outline, setVal: setOutline },
          { label: 'PREREQUISITES', val: prerequisites, setVal: setPrerequisites },
          { label: 'RESOURCES', val: resources, setVal: setResources },
          { label: 'STATS', val: stats, setVal: setStats },
        ].map(({ label, val, setVal }) => (
          <div key={label} className="border border-zinc-200 rounded-lg overflow-hidden">
            <div className="bg-zinc-800/80 px-3 py-1.5 border-b border-zinc-200 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-950 uppercase">{label}</span>
              <div className="flex items-center gap-2 text-zinc-400">
                <Bold className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
                <Italic className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
                <Underline className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
                <List className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
                <Link2 className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
              </div>
            </div>
            <textarea
              rows={3}
              value={val}
              onChange={e => setVal(e.target.value)}
              className="w-full bg-zinc-900 text-white text-sm p-3 focus:outline-none resize-none"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg"
        >
          ✓ UPDATE COURSE
        </button>
      </div>

      {/* Bottom Card: Course List */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-950">Course List</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-zinc-200 rounded px-2 py-1">
              <Search className="w-3 h-3 text-zinc-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="SEARCH"
                className="bg-transparent text-xs text-zinc-950 outline-none w-28"
              />
            </div>
            <TableExportToolbar />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Title</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Overview</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Image</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500 text-sm">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-200/50 hover:bg-zinc-100">
                    <td className="py-3 px-3 text-zinc-200 font-medium max-w-xs">{item.title}</td>
                    <td className="py-3 px-3 text-zinc-700 max-w-sm truncate">{item.overview}</td>
                    <td className="py-3 px-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-800">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-3 relative">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                          className="border border-zinc-600 text-zinc-950 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500"
                        >
                          SELECT <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdownId === item.id && (
                          <div className="absolute right-0 mt-1 w-28 bg-white border border-zinc-200 shadow-xs rounded-lg shadow-xl z-20 py-1">
                            <button
                              onClick={() => handleDelete(item.id)}
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
            <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">←</button>
            <button className="px-2 py-1 bg-zinc-800 text-zinc-950 rounded">1</button>
            <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}