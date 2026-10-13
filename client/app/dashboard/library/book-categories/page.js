'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Tag, 
  Edit, 
  Trash2, 
  Plus, 
  X,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

export default function BookCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [cRes, bRes] = await Promise.all([
        api.get('/book-category').catch(() => null),
        api.get('/book').catch(() => null)
      ]);
      if (cRes?.success && Array.isArray(cRes.data)) setCategories(cRes.data);
      if (bRes?.success && Array.isArray(bRes.data)) setBooks(bRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Category Name is required');
    try {
      setSubmitting(true);
      const res = await api.post('/book-category', { name: name.trim() });
      if (res?.success) {
        setName('');
        fetchCategories();
      } else {
        alert(res?.message || 'Failed to save category');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return alert('Category name is required');
    try {
      setEditSaving(true);
      const res = await api.put(`/book-category/${editingCategory._id}`, { name: editName.trim() });
      if (res?.success) {
        setIsEditOpen(false);
        fetchCategories();
      } else {
        alert(res?.message || 'Failed to update category');
      }
    } catch (err) {
      alert('Failed to update category');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const res = await api.delete(`/book-category/${id}`);
        if (res?.success) fetchCategories();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getBookCount = (catId) => {
    return books.filter(b => b.categoryId === catId).length;
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const exportColumns = [
    { key: 'name', label: 'Category Name' },
    { key: 'bookCount', label: 'Books Count' }
  ];

  const exportData = filteredCategories.map(c => ({
    name: c.name,
    bookCount: getBookCount(c._id)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Tag className="h-6 w-6 text-[#084A86]" />
            Book Categories
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Organize library volumes into academic and subject classifications</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/library" className="hover:text-zinc-600 transition-colors">Library</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Categories</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Category */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#084A86]" />
                Add Book Category
              </h2>
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Category Name <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="e.g. Science, Fiction, Islamic, History..."
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-xl bg-white border-zinc-200" 
                  required
                />
              </div>
              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-xl shadow-xs cursor-pointer"
              >
                {submitting ? 'Saving...' : 'Save Category'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Category List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Category Directory ({categories.length})</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Manage and organize book classification tags</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search category..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-white border-zinc-200 rounded-xl"
                  />
                </div>

                <TableExportToolbar
                  data={exportData}
                  columns={exportColumns}
                  filename="Book_Categories_Report"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3.5 font-bold w-14">#</th>
                    <th className="px-4 py-3.5 font-bold">Category Title</th>
                    <th className="px-4 py-3.5 font-bold">Associated Books</th>
                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-12 text-center text-zinc-500">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          Loading categories...
                        </div>
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-12 text-center text-zinc-500">
                        No categories found. Add your first book category above.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-zinc-500 text-xs">#{idx + 1}</td>
                        <td className="px-4 py-3.5 font-bold text-zinc-950">
                          {item.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#084A86] border border-blue-100">
                            {getBookCount(item._id)} Books
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              onClick={() => handleOpenEdit(item)} 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(item._id)} 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Category"
                            >
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

            <div className="p-3 border-t border-zinc-200 text-xs text-zinc-500 bg-zinc-50/30">
              Showing {filteredCategories.length} categories
            </div>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      {isEditOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 text-zinc-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Edit className="h-4 w-4 text-[#084A86]" />
                Edit Category
              </h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Category Name *</Label>
                <Input 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs h-9 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editSaving}
                  style={{ backgroundColor: '#084A86' }}
                  className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-xl cursor-pointer"
                >
                  {editSaving ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
