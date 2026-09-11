'use client';
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
  Star
} from 'lucide-react';

const INITIAL_TESTIMONIALS = [
  {
    id: 1,
    name: 'Malala euhen',
    designation: 'Chairman',
    institution: 'Linkdin',
    rating: 4,
    description: 'Great education system with excellent management tools.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Tristique euhen',
    designation: 'CEO',
    institution: 'Google',
    rating: 5,
    description: 'Exceptional user interface and very easy to configure for schools.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export default function TestimonialPage() {
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [institution, setInstitution] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleAdd = () => {
    if (!name || !designation || !institution) {
      alert('Please fill Name, Designation and Institution Name');
      return;
    }
    const newTestimonial = {
      id: Date.now(),
      name,
      designation,
      institution,
      description,
      rating,
      image: file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    };
    setTestimonials(prev => [...prev, newTestimonial]);
    setName('');
    setDesignation('');
    setInstitution('');
    setDescription('');
    setRating(5);
    setFile(null);
  };

  const handleDelete = (id) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = testimonials.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.institution.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">Add Testimonial</span>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Add Testimonial</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Testimonial */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Add Testimonial</h2>
          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">NAME *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">DESIGNATION *</label>
            <input
              type="text"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">INSTITUTION NAME *</label>
            <input
              type="text"
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          {/* Image File Upload */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">IMAGE *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 border border-zinc-700 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Image *'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold px-4 py-2 rounded cursor-pointer"
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

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">DESCRIPTION *</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
            />
          </div>

          {/* Rating Picker */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1.5">RATING *</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-sm py-2 rounded flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            ✓ SUBMIT
          </button>
        </div>

        {/* Right Table: Testimonial List */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Testimonial List</h2>
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
                  <button key={i} className="p-1 text-zinc-400 hover:text-zinc-500">
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
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Name</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Designation</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Institution Name</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Rating</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Image</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-3 text-zinc-200 font-medium">{item.name}</td>
                      <td className="py-3 px-3 text-zinc-400">{item.designation}</td>
                      <td className="py-3 px-3 text-zinc-400">{item.institution}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
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
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">←</button>
              <button className="px-2 py-1 bg-zinc-800 text-white rounded">1</button>
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
