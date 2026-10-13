'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  X, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  DollarSign
} from 'lucide-react';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BookListPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    bookNo: '',
    isbnNo: '',
    categoryId: '',
    publisher: '',
    author: '',
    rackNo: '',
    quantity: '',
    price: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        api.get('/book').catch(() => null),
        api.get('/book-category').catch(() => null)
      ]);
      if (bRes?.success && Array.isArray(bRes.data)) setBooks(bRes.data);
      if (cRes?.success && Array.isArray(cRes.data)) setCategories(cRes.data);
    } catch (error) {
      console.error('Error fetching book list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this book from the catalog?')) {
      try {
        const res = await api.delete(`/book/${id}`);
        if (res?.success !== false) {
          setBooks(prev => prev.filter(b => b._id !== id));
        } else {
          alert(res?.message || 'Failed to delete book');
        }
      } catch (error) {
        alert('Failed to delete book.');
      }
    }
  };

  const handleOpenEdit = (book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title || '',
      bookNo: book.bookNo || '',
      isbnNo: book.isbnNo || '',
      categoryId: book.categoryId || '',
      publisher: book.publisher || '',
      author: book.author || '',
      rackNo: book.rackNo || '',
      quantity: book.quantity || 0,
      price: book.price || 0
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) return alert('Book title is required');

    try {
      setSaving(true);
      const res = await api.put(`/book/${editingBook._id}`, editFormData);
      if (res?.success !== false) {
        setIsEditOpen(false);
        fetchData();
      } else {
        alert(res?.message || 'Failed to update book');
      }
    } catch (err) {
      alert('Failed to update book.');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c._id === id);
    return cat ? cat.name : 'General';
  };

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchCat = !selectedCategory || b.categoryId === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchSearch = !q || 
        (b.title || '').toLowerCase().includes(q) || 
        (b.author || '').toLowerCase().includes(q) ||
        (b.bookNo || '').toLowerCase().includes(q) ||
        (b.isbnNo || '').toLowerCase().includes(q) ||
        (b.publisher || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [books, selectedCategory, search]);

  // KPIs
  const stats = useMemo(() => {
    const totalTitles = filteredBooks.length;
    const totalCopies = filteredBooks.reduce((acc, b) => acc + (Number(b.quantity) || 0), 0);
    const inStock = filteredBooks.filter(b => (Number(b.quantity) || 0) > 0).length;
    const outOfStock = filteredBooks.filter(b => (Number(b.quantity) || 0) === 0).length;
    return { totalTitles, totalCopies, inStock, outOfStock };
  }, [filteredBooks]);

  // Export configs
  const exportColumns = [
    { key: 'bookNo', label: 'Book No' },
    { key: 'title', label: 'Book Title' },
    { key: 'category', label: 'Category' },
    { key: 'author', label: 'Author' },
    { key: 'publisher', label: 'Publisher' },
    { key: 'isbnNo', label: 'ISBN' },
    { key: 'rackNo', label: 'Rack No' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'price', label: 'Price (PKR)' }
  ];

  const exportData = filteredBooks.map(b => ({
    bookNo: b.bookNo || '—',
    title: b.title,
    category: getCategoryName(b.categoryId),
    author: b.author || '—',
    publisher: b.publisher || '—',
    isbnNo: b.isbnNo || '—',
    rackNo: b.rackNo || '—',
    quantity: b.quantity || 0,
    price: b.price || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#084A86]" />
            Book Catalog Directory
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Browse, search, edit volumes, and manage school library inventory</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/library" className="hover:text-zinc-600 transition-colors">Library</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Book List</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Book Titles</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.totalTitles}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Copies In Hand</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.totalCopies}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Available In Stock</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.inStock}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Out of Stock</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.outOfStock}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/library/add-book">
              <Button 
                style={{ backgroundColor: '#084A86' }}
                className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add New Book
              </Button>
            </Link>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="h-9 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-900 focus:outline-none font-semibold cursor-pointer"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                placeholder="Search title, author, book no..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-white border-zinc-200 text-zinc-950 text-xs rounded-xl focus-visible:ring-[#084A86]"
              />
            </div>

            <TableExportToolbar
              data={exportData}
              columns={exportColumns}
              filename="Library_Book_Catalog"
            />
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5 font-bold w-12">#</th>
                <th className="px-4 py-3.5 font-bold">Book Title</th>
                <th className="px-4 py-3.5 font-bold">Book No</th>
                <th className="px-4 py-3.5 font-bold">Category</th>
                <th className="px-4 py-3.5 font-bold">Author</th>
                <th className="px-4 py-3.5 font-bold">Publisher</th>
                <th className="px-4 py-3.5 font-bold">Rack No</th>
                <th className="px-4 py-3.5 font-bold">Copies</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      Loading catalog books...
                    </div>
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500">
                    No books found matching the search criteria. Click &quot;Add New Book&quot; to register a book.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((item, idx) => {
                  const qty = Number(item.quantity) || 0;
                  const isAvailable = qty > 0;

                  return (
                    <tr key={item._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-zinc-500 text-xs">#{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-zinc-950">{item.title}</div>
                        {item.isbnNo && <div className="text-[11px] text-zinc-400 font-mono">ISBN: {item.isbnNo}</div>}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-zinc-700">{item.bookNo || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-xs font-semibold border border-zinc-200">
                          {getCategoryName(item.categoryId)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700 text-xs">{item.author || '—'}</td>
                      <td className="px-4 py-3.5 text-zinc-600 text-xs">{item.publisher || '—'}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-zinc-800">{item.rackNo || '—'}</td>
                      <td className="px-4 py-3.5 font-bold text-zinc-950">{qty}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {isAvailable ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          {isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            onClick={() => handleOpenEdit(item)}
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Edit Book Details"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={() => handleDelete(item._id)} 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Book"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-500 bg-zinc-50/30">
          <div>Showing <span className="font-bold text-zinc-900">{filteredBooks.length}</span> catalog titles</div>
          <Link href="/dashboard/library/issue-return-book" className="text-[#084A86] font-bold hover:underline">
            Go to Issue / Return Counter &rarr;
          </Link>
        </div>
      </div>

      {/* Edit Book Modal */}
      {isEditOpen && editingBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 text-zinc-950 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                  <Edit className="h-5 w-5 text-[#084A86]" />
                  Edit Book Details
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Update catalog metadata and stock quantities</p>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Book Title *</Label>
                <Input 
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Book Number</Label>
                  <Input 
                    value={editFormData.bookNo}
                    onChange={e => setEditFormData({ ...editFormData, bookNo: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">ISBN Number</Label>
                  <Input 
                    value={editFormData.isbnNo}
                    onChange={e => setEditFormData({ ...editFormData, isbnNo: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Category</Label>
                  <select
                    value={editFormData.categoryId}
                    onChange={e => setEditFormData({ ...editFormData, categoryId: e.target.value })}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none font-semibold"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Rack / Shelf No</Label>
                  <Input 
                    value={editFormData.rackNo}
                    onChange={e => setEditFormData({ ...editFormData, rackNo: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Author Name</Label>
                  <Input 
                    value={editFormData.author}
                    onChange={e => setEditFormData({ ...editFormData, author: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Publisher</Label>
                  <Input 
                    value={editFormData.publisher}
                    onChange={e => setEditFormData({ ...editFormData, publisher: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Quantity / Copies</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={editFormData.quantity}
                    onChange={e => setEditFormData({ ...editFormData, quantity: Number(e.target.value) || 0 })}
                    className="h-10 rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Unit Price (PKR)</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={editFormData.price}
                    onChange={e => setEditFormData({ ...editFormData, price: Number(e.target.value) || 0 })}
                    className="h-10 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs h-9 text-zinc-700 border-zinc-200 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  style={{ backgroundColor: '#084A86' }}
                  className="hover:opacity-95 text-white font-bold text-xs h-9 px-5 rounded-xl cursor-pointer"
                >
                  {saving ? 'Updating...' : 'Update Book'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
