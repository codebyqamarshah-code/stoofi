'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function BookListPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, cRes] = await Promise.all([
          api.get('/book'),
          api.get('/book-category')
        ]);
        if (bRes.success) setBooks(bRes.data);
        if (cRes.success) setCategories(cRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        const res = await api.delete(`/book/${id}`);
        if (res.success) {
          setBooks(books.filter(b => b._id !== id));
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c._id === id);
    return cat ? cat.name : '-';
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    (b.author || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.bookNo || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Book List</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Library</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Book List</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex justify-center items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="QUICK SEARCH" 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-zinc-600 text-center"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold w-16">SL</th>
                <th className="px-4 py-3 font-semibold">Book Title</th>
                <th className="px-4 py-3 font-semibold">Book No</th>
                <th className="px-4 py-3 font-semibold">ISBN No</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Publisher Name</th>
                <th className="px-4 py-3 font-semibold">Author Name</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr><td colSpan="9" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              ) : filteredBooks.length === 0 ? (
                <tr><td colSpan="9" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              ) : (
                filteredBooks.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-600 font-medium">+{idx + 1}</td>
                    <td className="px-4 py-3 text-zinc-300">{item.title}</td>
                    <td className="px-4 py-3 text-zinc-400">{item.bookNo || '-'}</td>
                    <td className="px-4 py-3 text-zinc-400">{item.isbnNo || '-'}</td>
                    <td className="px-4 py-3 text-zinc-400">{getCategoryName(item.categoryId)}</td>
                    <td className="px-4 py-3 text-zinc-400">{item.publisher || '-'}</td>
                    <td className="px-4 py-3 text-zinc-400">{item.author || '-'}</td>
                    <td className="px-4 py-3 text-zinc-400">{item.quantity || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                        DELETE
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
