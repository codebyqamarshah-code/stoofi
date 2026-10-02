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
  Mail,
  Eye
} from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    id: 1,
    name: 'Sarah Connor',
    email: 'sarah.c@gmail.com',
    subject: 'Admission Inquiry for Grade 5',
    message: 'Hello, I would like to know the admission dates and fee structure for Grade 5 for upcoming session.'
  },
  {
    id: 2,
    name: 'Robert Davis',
    email: 'robert.davis@yahoo.com',
    subject: 'Transport Facility Route 4',
    message: 'Can you please provide the bus pickup timings for Blue Area Islamabad?'
  }
];

export default function ContactMessagePage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleDelete = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = messages.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Contact Message</span>
      </div>

      <h1 className="text-xl font-bold text-zinc-950">Contact Message</h1>

      {/* Main Card */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-950">Contact Message</h2>
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
              <tr className="border-b border-zinc-100">
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Name</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Email</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Subject</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Message</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100/50 hover:bg-zinc-50/80">
                    <td className="py-3 px-3 text-zinc-200 font-medium">{item.name}</td>
                    <td className="py-3 px-3 text-zinc-700">{item.email}</td>
                    <td className="py-3 px-3 text-zinc-950 font-medium">{item.subject}</td>
                    <td className="py-3 px-3 text-zinc-700 max-w-xs truncate">{item.message}</td>
                    <td className="py-3 px-3 relative">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                          className="border border-zinc-300 bg-white text-zinc-800 text-xs px-3 py-1 rounded-md font-bold flex items-center gap-1 hover:bg-zinc-100 cursor-pointer"
                        >
                          SELECT <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdownId === item.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-zinc-200 rounded-lg shadow-xl z-20 py-1">
                            <button
                              onClick={() => { setSelectedMessage(item); setOpenDropdownId(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs text-zinc-950 hover:bg-zinc-100 hover:text-zinc-500 flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
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
          <span>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 font-bold">←</button>
            <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 font-bold">→</button>
          </div>
        </div>
      </div>

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-950">Contact Message Details</h3>
              <button onClick={() => setSelectedMessage(null)} className="text-zinc-400 hover:text-zinc-950">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-zinc-700 font-bold">From:</span> <span className="text-zinc-950">{selectedMessage.name}</span> ({selectedMessage.email})</p>
              <p><span className="text-zinc-700 font-bold">Subject:</span> <span className="text-zinc-950 font-bold">{selectedMessage.subject}</span></p>
              <div className="mt-3 p-3 bg-zinc-800/60 rounded-lg text-zinc-950 leading-relaxed border border-zinc-200/50">
                {selectedMessage.message}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold shadow-xs text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

