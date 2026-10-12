'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Plus, Download, Printer, FileText, 
  Edit, Trash2, Shield, PlusCircle, MinusCircle, AlertCircle, X, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import behaviourService from '@/services/behaviourService';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'positive' | 'negative'
  
  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    point: 5,
    pointType: 'positive',
    description: ''
  });
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await behaviourService.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditingIncident(null);
    setFormData({
      title: '',
      point: 5,
      pointType: 'positive',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingIncident(item);
    setFormData({
      title: item.title,
      point: Math.abs(item.point),
      pointType: item.pointType || (item.point < 0 ? 'negative' : 'positive'),
      description: item.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this incident category?')) return;
    await behaviourService.deleteIncident(id);
    setIncidents(prev => prev.filter(i => i._id !== id));
    showToast('Incident category deleted successfully.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter an Incident Title');
      return;
    }

    if (editingIncident) {
      await behaviourService.updateIncident(editingIncident._id, formData);
      showToast('Incident updated successfully.');
    } else {
      await behaviourService.createIncident(formData);
      showToast('New incident category created.');
    }

    setShowModal(false);
    loadIncidents();
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || item.pointType === filterType;
      return matchesSearch && matchesType;
    });
  }, [incidents, searchQuery, filterType]);

  const exportData = filteredIncidents.map(item => ({
    'Incident Title': item.title,
    'Point Type': item.pointType === 'positive' ? 'Positive (+)' : 'Negative (-)',
    'Points': item.point > 0 ? `+${item.point}` : `${item.point}`,
    'Description': item.description || '-'
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-950 text-white px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span style={{ color: '#ffffff' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Behaviour Incidents</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage positive and negative incident templates & behaviour points</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-400">Behaviour</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Incidents</span>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl focus-visible:ring-zinc-950"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${filterType === 'all' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'}`}
            >
              All ({incidents.length})
            </button>
            <button
              onClick={() => setFilterType('positive')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${filterType === 'positive' ? 'bg-white text-emerald-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'}`}
            >
              <PlusCircle className="w-3 h-3 text-emerald-600" /> Positive
            </button>
            <button
              onClick={() => setFilterType('negative')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${filterType === 'negative' ? 'bg-white text-rose-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'}`}
            >
              <MinusCircle className="w-3 h-3 text-rose-600" /> Negative
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button 
            onClick={() => exportToCSV(exportData, 'Behaviour_Incidents')} 
            variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Download CSV"
          >
            <Download className="h-4 w-4 text-zinc-700" />
          </Button>
          <Button 
            onClick={() => exportToExcel(exportData, 'Behaviour_Incidents', 'Incidents')} 
            variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Export Excel"
          >
            <FileText className="h-4 w-4 text-zinc-700" />
          </Button>
          <Button 
            onClick={() => printData('Behaviour Incidents Directory', exportData)} 
            variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Print List"
          >
            <Printer className="h-4 w-4 text-zinc-700" />
          </Button>
          <Button
            onClick={handleOpenAdd}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4" />
            <span style={{ color: '#ffffff' }}>ADD INCIDENT</span>
          </Button>
        </div>
      </div>

      {/* Incidents Table Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Incident Title</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Point Value</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-zinc-400">Loading incidents...</td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-zinc-500">
                    <Shield className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-700">No incident templates found.</p>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Click "Add Incident" above to create one.</p>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((item, idx) => {
                  const isPositive = item.pointType === 'positive' || item.point > 0;
                  return (
                    <tr key={item._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-zinc-400">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-bold text-zinc-950">
                        {item.title}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          isPositive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPositive ? <PlusCircle className="w-3 h-3" /> : <MinusCircle className="w-3 h-3" />}
                          {isPositive ? 'Positive' : 'Negative'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-black text-sm">
                        <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                          {item.point > 0 ? `+${item.point}` : item.point} Pts
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600 max-w-xs truncate">
                        {item.description || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
                            title="Edit Incident"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Incident"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">
                    {editingIncident ? 'Edit Incident Category' : 'Create New Incident'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">Define incident rule, point weightage & description</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-zinc-700">Incident Title *</Label>
                <Input 
                  placeholder="e.g. Academic Excellence or Disruptive Class Behaviour"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-zinc-700">Point Type *</Label>
                  <select
                    value={formData.pointType}
                    onChange={(e) => setFormData({ ...formData, pointType: e.target.value })}
                    className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  >
                    <option value="positive">Positive (+ Points)</option>
                    <option value="negative">Negative (- Points)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-zinc-700">Points *</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 5"
                    value={formData.point}
                    onChange={(e) => setFormData({ ...formData, point: e.target.value })}
                    required
                    className="bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-zinc-700">Description / Guidance</Label>
                <textarea 
                  rows={3}
                  placeholder="Enter details on when this incident should be assigned..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                  className="text-xs h-9 px-4 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs cursor-pointer"
                >
                  <span style={{ color: '#ffffff' }}>{editingIncident ? 'Update Incident' : 'Save Incident'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}