'use client'

import { useState } from 'react'
import { ChevronRight, X, Check } from 'lucide-react'

const DEFAULT_TAGS = [
  { id: 'prefix', label: 'prefix' },
  { id: 'admission', label: 'Admission No' },
  { id: 'class', label: 'Class' },
  { id: 'section', label: 'Section' },
]

export default function FeesInvoiceSettingsPage() {
  const [tags, setTags] = useState(DEFAULT_TAGS)
  const [newPosition, setNewPosition] = useState('')
  const [formData, setFormData] = useState({
    uniqueIdStart: '0011',
    prefix: 'ST.AS',
    classLimit: '3',
    sectionLimit: '1',
    admissionNoLimit: '3',
  })

  const removeTag = (id) => {
    setTags((prev) => prev.filter((t) => t.id !== id))
  }

  const addTag = (e) => {
    if (e.key === 'Enter' && newPosition.trim()) {
      const label = newPosition.trim()
      setTags((prev) => [
        ...prev,
        { id: label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(), label },
      ])
      setNewPosition('')
    }
  }

  const buildPreview = () => {
    const parts = tags.map((t) => {
      if (t.id === 'prefix') return formData.prefix || 'ST.JIS'
      if (t.id === 'admission') return formData.uniqueIdStart || '123'
      if (t.id === 'class') return 'One'
      if (t.id === 'section') return 'A'
      return t.label
    })
    return parts.join(' ') || '—'
  }

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleUpdate = () => {
    // TODO: persist settings
    alert('Settings updated!')
  }

  return (
    <div className="space-y-6 text-zinc-950 px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-zinc-400 mb-6">
        <span className="hover:text-zinc-200 cursor-pointer">Dashboard</span>
        <ChevronRight size={13} className="text-zinc-600" />
        <span className="hover:text-zinc-200 cursor-pointer">Fees</span>
        <ChevronRight size={13} className="text-zinc-600" />
        <span className="text-zinc-200 font-medium">Fees Invoice Settings</span>
      </nav>

      {/* Page Title */}
      <h1 className="text-xl font-semibold text-zinc-950 mb-6">Fees Invoice Settings</h1>

      {/* SECTION 1 — Two-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Left Panel — Invoice Number Generator */}
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6">
          <h2 className="text-sm font-semibold text-zinc-950 mb-5">Invoice Number Generator</h2>

          <label className="block text-xs font-medium text-zinc-700 uppercase font-bold tracking-wider mb-3">
            Invoice Number Position <span className="text-red-400">*</span>
          </label>

          {/* Tag Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="flex items-center gap-1 bg-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded"
              >
                {tag.label}
                <button
                  onClick={() => removeTag(tag.id)}
                  className="text-zinc-400 hover:text-red-400 transition-colors ml-0.5"
                  aria-label={`Remove ${tag.label}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>

          {/* Add new position input */}
          <input
            type="text"
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
            onKeyDown={addTag}
            placeholder="Type and press Enter to add…"
            className="bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 w-full placeholder:text-zinc-500"
          />
        </div>

        {/* Right Panel — Invoice Number Preview */}
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6 flex flex-col">
          <h2 className="text-sm font-semibold text-zinc-950 mb-5">Invoice Number Preview</h2>
          <div className="flex-1 flex items-center justify-center bg-zinc-800 border border-zinc-200 rounded-lg min-h-[96px]">
            <span className="text-2xl font-bold text-zinc-950 tracking-wide">
              {buildPreview()}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Invoice Attribute */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-950 mb-6">Invoice Attribute</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-6">
          {/* Unique ID Start */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 uppercase font-bold tracking-wider mb-1.5">
              Unique ID Start <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.uniqueIdStart}
              onChange={handleChange('uniqueIdStart')}
              className="bg-white border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 w-full"
            />
          </div>

          {/* Prefix */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 uppercase font-bold tracking-wider mb-1.5">
              Prefix <span className="text-zinc-950 font-bold">(Max 10 Characters)</span>
            </label>
            <input
              type="text"
              value={formData.prefix}
              onChange={handleChange('prefix')}
              maxLength={10}
              className="bg-white border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 w-full"
            />
          </div>

          {/* Class Limit */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 uppercase font-bold tracking-wider mb-1.5">
              Class Limit
            </label>
            <input
              type="number"
              value={formData.classLimit}
              onChange={handleChange('classLimit')}
              min={0}
              className="bg-white border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 w-full"
            />
          </div>

          {/* Section Limit */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 uppercase font-bold tracking-wider mb-1.5">
              Section Limit
            </label>
            <input
              type="number"
              value={formData.sectionLimit}
              onChange={handleChange('sectionLimit')}
              min={0}
              className="bg-white border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 w-full"
            />
          </div>

          {/* Admission No Limit */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 uppercase font-bold tracking-wider mb-1.5">
              Admission No Limit
            </label>
            <input
              type="number"
              value={formData.admissionNoLimit}
              onChange={handleChange('admissionNoLimit')}
              min={0}
              className="bg-white border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 w-full"
            />
          </div>
        </div>

        {/* Update Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpdate}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold px-6 py-2 rounded transition-colors"
          >
            <Check size={16} />
            UPDATE
          </button>
        </div>
      </div>
    </div>
  )
}

