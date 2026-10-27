'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, X, Check, Save, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';

const DEFAULT_TAGS = [
  { id: 'prefix', label: 'prefix' },
  { id: 'admission', label: 'Admission No' },
  { id: 'class', label: 'Class' },
  { id: 'section', label: 'Section' },
];

export default function FeesInvoiceSettingsPage() {
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [newPosition, setNewPosition] = useState('');
  const [formData, setFormData] = useState({
    uniqueIdStart: '001',
    prefix: 'PRC',
    classLimit: '3',
    sectionLimit: '1',
    admissionNoLimit: '4',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/setting');
      if (res?.success && res.data?.feeInvoiceSettings) {
        const s = res.data.feeInvoiceSettings;
        if (s.tags && Array.isArray(s.tags)) setTags(s.tags);
        setFormData({
          uniqueIdStart: s.uniqueIdStart || '001',
          prefix: s.prefix || 'PRC',
          classLimit: s.classLimit || '3',
          sectionLimit: s.sectionLimit || '1',
          admissionNoLimit: s.admissionNoLimit || '4',
        });
      }
    } catch (e) {
      console.error('Failed to load fee invoice settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (id) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && newPosition.trim()) {
      const label = newPosition.trim();
      setTags((prev) => [
        ...prev,
        { id: label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(), label },
      ]);
      setNewPosition('');
    }
  };

  const buildPreview = () => {
    const parts = tags.map((t) => {
      if (t.id === 'prefix') return formData.prefix || 'PRC';
      if (t.id === 'admission') return formData.uniqueIdStart || '001';
      if (t.id === 'class') return 'One';
      if (t.id === 'section') return 'A';
      return t.label;
    });
    return parts.join('-') || '—';
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      const payload = {
        feeInvoiceSettings: {
          ...formData,
          tags,
        },
      };
      const res = await api.put('/setting', payload);
      if (res?.success) {
        setSuccessMsg('Fees Invoice Settings saved and applied successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
      } else {
        alert(res?.message || 'Failed to update invoice settings');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error updating fees invoice settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-zinc-950 px-6 py-8">
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-6">
        <span className="hover:text-zinc-800 cursor-pointer">Dashboard</span>
        <ChevronRight size={13} className="text-zinc-400" />
        <span className="hover:text-zinc-800 cursor-pointer">Fees</span>
        <ChevronRight size={13} className="text-zinc-400" />
        <span className="text-zinc-950 font-bold">Fees Invoice Settings</span>
      </nav>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Fees Invoice Settings</h1>
          <p className="text-xs text-zinc-500 mt-1">Configure automated fee voucher numbering patterns, prefixes, and identifier limits.</p>
        </div>
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'SAVE SETTINGS'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading fee invoice settings...
        </div>
      ) : (
        <>
          {/* SECTION 1 — Two-column row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Panel — Invoice Number Generator */}
            <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6">
              <h2 className="text-sm font-bold text-zinc-950 mb-5">Invoice Number Generator</h2>

              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">
                Invoice Number Position <span className="text-rose-500">*</span>
              </label>

              {/* Tag Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-900 text-xs font-semibold px-2.5 py-1 rounded-md"
                  >
                    {tag.label}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors ml-0.5"
                      aria-label={`Remove ${tag.label}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Position Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Type extra keyword and press Enter..."
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  onKeyDown={addTag}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-950 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-900 w-full"
                />
                <p className="text-[11px] text-zinc-400 mt-1">Press Enter to add tag to invoice sequence</p>
              </div>

              {/* Unique ID Start */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Unique ID Start <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.uniqueIdStart}
                  onChange={handleChange('uniqueIdStart')}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-950 text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-900 w-full"
                />
              </div>

              {/* Prefix */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Prefix <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={handleChange('prefix')}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-950 text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-900 w-full"
                />
              </div>
            </div>

            {/* Right Panel — Format Preview */}
            <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-950 mb-5">Generated Invoice Voucher Preview</h2>
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 text-center">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Live Format Output</span>
                  <span className="text-2xl font-black text-emerald-600 tracking-wider font-mono">
                    {buildPreview()}
                  </span>
                  <p className="text-xs text-zinc-500 mt-3">This pattern will automatically print on all generated student fee vouchers and bank deposit challans.</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                <p className="text-xs text-amber-800 font-medium">
                  <strong>Note:</strong> Adjusting limits below controls zero-padding on classes and sections for barcode and optical scanner readability.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2 — Three Input Controls */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6">
            <h2 className="text-sm font-bold text-zinc-950 mb-4">Digit Padding & Sequence Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Class Limit */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Class Digit Limit
                </label>
                <input
                  type="number"
                  value={formData.classLimit}
                  onChange={handleChange('classLimit')}
                  min={1}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-950 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-900 w-full"
                />
              </div>

              {/* Section Limit */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Section Digit Limit
                </label>
                <input
                  type="number"
                  value={formData.sectionLimit}
                  onChange={handleChange('sectionLimit')}
                  min={1}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-950 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-900 w-full"
                />
              </div>

              {/* Admission No Limit */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Admission No Digit Limit
                </label>
                <input
                  type="number"
                  value={formData.admissionNoLimit}
                  onChange={handleChange('admissionNoLimit')}
                  min={1}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-950 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-900 w-full"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-8 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{saving ? 'Updating...' : 'SAVE INVOICE SETTINGS'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
