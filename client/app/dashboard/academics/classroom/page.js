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
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function ClassRoomPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ roomNo: '', capacity: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/classroom');
      if (res.success) setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomNo || !formData.capacity) {
      alert("Room No and Capacity are required");
      return;
    }

    try {
      if (isEditing) {
        const res = await api.put(`/classroom/${editId}`, formData);
        if (res.success) {
          alert('Classroom updated successfully');
        }
      } else {
        const res = await api.post('/classroom', formData);
        if (res.success) {
          alert('Classroom added successfully');
        }
      }
      setFormData({ roomNo: '', capacity: '' });
      setIsEditing(false);
      setEditId(null);
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({ roomNo: item.roomNo, capacity: item.capacity });
    setIsEditing(true);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await api.delete(`/classroom/${id}`);
      if (res.success) {
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredData = data.filter(item => 
    item.roomNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = filteredData.map(item => ({
    'Room No': item.roomNo,
    Capacity: item.capacity
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Class Room</h1>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-900 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Class Room</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">{isEditing ? 'Edit Class Room' : 'Add Class Room'}</h2>
            </div>
            
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Room No <span className="text-rose-500">*</span></Label>
                <Input 
                  value={formData.roomNo}
                  onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                  placeholder="e.g. 101" 
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Capacity <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="e.g. 40" 
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="submit" className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg">
                  {isEditing ? 'UPDATE CLASS ROOM' : 'SAVE CLASS ROOM'}
                </Button>
                {isEditing && (
                  <Button type="button" onClick={() => { setIsEditing(false); setFormData({roomNo: '', capacity: ''}); }} variant="outline" className="border-zinc-300 text-zinc-800 font-semibold">
                    CANCEL
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-zinc-950">Class Room List</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 h-9 w-full sm:w-64 font-medium" 
                  />
                </div>
                
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-zinc-200">
                  <Button onClick={() => exportToCSV(exportData, 'ClassRoom_List')} variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 text-zinc-600" title="Download CSV">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => exportToExcel(exportData, 'ClassRoom_List')} variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 text-zinc-600" title="Export Excel">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => printData('Class Room List', exportData)} variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 text-zinc-600" title="Print">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">Room No</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="3" className="px-4 py-4 text-center text-zinc-500 font-medium">Loading...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500 font-medium">No Data Available In Table</td></tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 text-zinc-950 font-bold">{item.roomNo}</td>
                        <td className="px-4 py-3 text-zinc-800 font-medium">{item.capacity}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button onClick={() => handleEdit(item)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleDelete(item._id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
    </div>
  );
}
