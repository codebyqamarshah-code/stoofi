'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

export default function AddBookPage() {
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    subject: '',
    bookNo: '',
    isbnNo: '',
    publisher: '',
    author: '',
    rackNo: '',
    quantity: '',
    price: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/book-category'),
          api.get('/subject')
        ]);
        if (cRes.success) setCategories(cRes.data);
        if (sRes.success) setSubjects(sRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId || !formData.subject) {
      return alert('Please fill Title, Category, and Subject');
    }

    try {
      setSubmitting(true);
      const res = await api.post('/book', formData);
      if (res.success) {
        alert('Book saved successfully!');
        setFormData({
          title: '', categoryId: '', subject: '', bookNo: '', isbnNo: '',
          publisher: '', author: '', rackNo: '', quantity: '', price: '', description: ''
        });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Add Book</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Library</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Add Book</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Add Book</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Book Title <span className="text-rose-500">*</span></Label>
              <Input name="title" value={formData.title} onChange={handleChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" />
            </div>
            
            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Book Categories <span className="text-rose-500">*</span></Label>
              <SearchableSelect 
                name="categoryId" value={formData.categoryId} onChange={(v) => handleSelectChange('categoryId', v)}
                placeholder="Select Book Category *"
                options={categories.map(c => ({ label: c.name, value: c._id }))}
              />
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject <span className="text-rose-500">*</span></Label>
              <SearchableSelect 
                name="subject" value={formData.subject} onChange={(v) => handleSelectChange('subject', v)}
                placeholder="Select Subjects *"
                options={subjects.map(s => ({ label: s.name, value: s.name }))}
              />
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Book No</Label>
              <Input name="bookNo" value={formData.bookNo} onChange={handleChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" />
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">ISBN No</Label>
              <Input name="isbnNo" value={formData.isbnNo} onChange={handleChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" />
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Publisher Name</Label>
              <Input name="publisher" value={formData.publisher} onChange={handleChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" />
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Author Name</Label>
              <Input name="author" value={formData.author} onChange={handleChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" />
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Rack Number</Label>
              <Input name="rackNo" value={formData.rackNo} onChange={handleChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" />
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Quantity</Label>
              <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" />
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Book Price</Label>
              <Input type="number" name="price" value={formData.price} onChange={handleChange} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" />
            </div>

            <div className="space-y-1.5 xl:col-span-4">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Description</Label>
              <textarea 
                name="description" 
                value={formData.description} onChange={handleChange}
                className="flex min-h-[120px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" 
              />
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button disabled={submitting} type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold min-w-[200px]">
              {submitting ? 'SAVING...' : 'SAVE BOOK'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
