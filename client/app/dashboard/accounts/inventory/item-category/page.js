'use client';

import React, { useState, useEffect } from 'react';
import { 
    Copy, 
    FileSpreadsheet, 
    FileText, 
    Printer, 
    Download, 
    Columns,
    Search,
    ChevronDown,
    Edit,
    Trash2
} from 'lucide-react';
import api from '@/services/api';

export default function ItemCategoryPage() {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/item-category');
            if (res.data && res.data.success) {
                setCategories(res.data.data);
            } else if (Array.isArray(res.data)) {
                setCategories(res.data);
            }
        } catch (error) {
            console.error('Error fetching item categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        try {
            if (editingId) {
                await api.put(`/item-category/${editingId}`, { name: categoryName });
            } else {
                await api.post('/item-category', { name: categoryName });
            }
            setCategoryName('');
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            console.error('Error saving item category:', error);
        }
    };

    const handleEdit = (category) => {
        setCategoryName(category.name || category.title || category.categoryName || '');
        setEditingId(category.id || category._id);
        setDropdownOpen(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/item-category/${id}`);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting item category:', error);
        }
        setDropdownOpen(null);
    };

    const toggleDropdown = (id) => {
        if (dropdownOpen === id) {
            setDropdownOpen(null);
        } else {
            setDropdownOpen(id);
        }
    };

    const filteredCategories = categories.filter(category => {
        const name = category.name || category.title || category.categoryName || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-semibold">Item Category List</h1>
                <div className="text-sm text-zinc-400 flex flex-wrap items-center">
                    <span>Dashboard</span>
                    <span className="mx-2">&gt;</span>
                    <span>Inventory</span>
                    <span className="mx-2">&gt;</span>
                    <span className="text-zinc-200">Item Category List</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Form */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <h2 className="text-lg font-medium border-b border-zinc-800 pb-3 mb-4">Add Category</h2>
                        <form onSubmit={handleSave}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">CATEGORY NAME *</label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zinc-600"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-zinc-800 hover:bg-zinc-800 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                SAVE
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Table */}
                <div className="lg:col-span-2">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <h2 className="text-lg font-medium border-b border-zinc-800 pb-3 mb-4">Item Category List</h2>
                        
                        {/* Table Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:border-zinc-600"
                                />
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                <button className="p-2 bg-zinc-950 border border-zinc-800 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Copy">
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-zinc-950 border border-zinc-800 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Export to Excel">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-zinc-950 border border-zinc-800 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Export to CSV">
                                    <FileText className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-zinc-950 border border-zinc-800 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Print">
                                    <Printer className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-zinc-950 border border-zinc-800 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Download PDF">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-zinc-950 border border-zinc-800 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Columns">
                                    <Columns className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-zinc-950 border-b border-zinc-800">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-zinc-400">SL</th>
                                        <th className="px-4 py-3 font-medium text-zinc-400">Category Title</th>
                                        <th className="px-4 py-3 font-medium text-zinc-400 text-right w-32">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-zinc-500">Loading categories...</td>
                                        </tr>
                                    ) : filteredCategories.length > 0 ? (
                                        filteredCategories.map((category, index) => {
                                            const id = category.id || category._id || index;
                                            return (
                                                <tr key={id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                                                    <td className="px-4 py-3">{index + 1}</td>
                                                    <td className="px-4 py-3">{category.name || category.title || category.categoryName}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="relative inline-block text-left">
                                                            <button 
                                                                onClick={() => toggleDropdown(id)}
                                                                className="inline-flex items-center justify-center px-3 py-1.5 border border-zinc-800 text-zinc-600 hover:bg-zinc-800/10 rounded-md text-xs font-medium transition-colors"
                                                            >
                                                                SELECT
                                                                <ChevronDown className="ml-1 w-3 h-3" />
                                                            </button>
                                                            
                                                            {dropdownOpen === id && (
                                                                <div className="absolute right-0 mt-2 w-32 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-50">
                                                                    <div className="py-1">
                                                                        <button
                                                                            onClick={() => handleEdit(category)}
                                                                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center"
                                                                        >
                                                                            <Edit className="w-4 h-4 mr-2" />
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(id)}
                                                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 flex items-center"
                                                                        >
                                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-zinc-500">No categories found</td>
                                        </tr>
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
