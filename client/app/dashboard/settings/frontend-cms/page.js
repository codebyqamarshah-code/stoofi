'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCmsSection, mutateCmsSection } from '@/lib/frontendCmsApi';
import {
  GripHorizontal,
  Trash2,
  Plus,
  LayoutTemplate,
  Heading,
  Image as ImageIcon,
  Columns,
  Type,
  PanelBottom,
  ChevronRight,
  Save,
  MonitorSmartphone,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const SECTION_TEMPLATES = {
  header: {
    type: 'header',
    icon: Heading,
    label: 'Navbar Header',
    defaultProps: { brand: 'Stoofi Pro', links: 'Home, Features, Gallery, Downloads, Contact' }
  },
  hero: {
    type: 'hero',
    icon: LayoutTemplate,
    label: 'Hero Section',
    defaultProps: {
      title: 'Welcome to Stoofi Education ERP',
      subtitle: 'The most advanced and powerful school management system in the cloud.',
      buttonText: 'Explore Campus'
    }
  },
  features: {
    type: 'features',
    icon: Columns,
    label: 'Feature Cards',
    defaultProps: {
      title: 'Our Core Pillars',
      f1: 'Smart Student Portal',
      f2: 'Automated Fee & Result Ledger',
      f3: 'Live Virtual Classrooms'
    }
  },
  text_block: {
    type: 'text_block',
    icon: Type,
    label: 'Text Block',
    defaultProps: {
      title: 'About Our Institution',
      content:
        'We provide world-class education with modern digital facilities and experienced faculty dedicated to student excellence.'
    }
  },
  footer: {
    type: 'footer',
    icon: PanelBottom,
    label: 'Footer',
    defaultProps: { copyright: '© 2026 Stoofi Education ERP. All rights reserved.' }
  }
};

const DEFAULT_SECTIONS = [
  { id: '1', type: 'header', props: { ...SECTION_TEMPLATES.header.defaultProps } },
  { id: '2', type: 'hero', props: { ...SECTION_TEMPLATES.hero.defaultProps } },
  { id: '3', type: 'features', props: { ...SECTION_TEMPLATES.features.defaultProps } },
  { id: '4', type: 'footer', props: { ...SECTION_TEMPLATES.footer.defaultProps } }
];

const PreviewRenderer = ({ section }) => {
  const { type, props } = section;

  if (type === 'header') {
    return (
      <div className="bg-white text-zinc-900 py-4 px-6 flex justify-between items-center border-b shadow-xs">
        <div className="text-xl font-black text-zinc-950">{props.brand}</div>
        <div className="hidden sm:flex gap-4 text-sm font-semibold text-zinc-700">
          {(props.links || '').split(',').map((l, i) => (
            <span key={i} className="hover:text-[#009966] cursor-pointer">
              {l.trim()}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'hero') {
    return (
      <div className="bg-zinc-50 py-16 px-6 text-center border-b">
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 mb-3">{props.title}</h1>
        <p className="text-zinc-600 max-w-2xl mx-auto mb-6 text-base">{props.subtitle}</p>
        <button className="bg-[#009966] text-white px-7 py-2.5 rounded-full font-bold shadow-md">
          {props.buttonText}
        </button>
      </div>
    );
  }

  if (type === 'features') {
    return (
      <div className="bg-white py-14 px-6 border-b">
        <h2 className="text-2xl font-black text-center text-zinc-950 mb-10">{props.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto text-center">
          {[props.f1, props.f2, props.f3].map((f, i) => (
            <div key={i} className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
              <div className="h-11 w-11 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon size={18} />
              </div>
              <h3 className="font-bold text-zinc-950 text-base">{f}</h3>
              <p className="text-zinc-600 text-xs mt-1.5">Managed seamlessly with real-time cloud sync.</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'text_block') {
    return (
      <div className="bg-white py-14 px-6 border-b text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-zinc-950 mb-3">{props.title}</h2>
        <p className="text-zinc-700 leading-relaxed">{props.content}</p>
      </div>
    );
  }

  if (type === 'footer') {
    return (
      <div className="bg-zinc-900 text-zinc-200 py-8 px-6 text-center text-xs">
        <div className="mb-3 flex justify-center gap-4 text-zinc-400">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
        {props.copyright}
      </div>
    );
  }

  return null;
};

export default function FrontendCmsPage() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [selectedId, setSelectedId] = useState('2');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    (async () => {
      const saved = await fetchCmsSection('builderSections', DEFAULT_SECTIONS);
      if (Array.isArray(saved) && saved.length > 0) {
        setSections(saved);
      }
    })();
  }, []);

  const handleSavePublish = async () => {
    setSaving(true);
    const res = await mutateCmsSection('builderSections', 'replaceAll', { items: sections });
    setSaving(false);
    if (res.success) {
      setToast('Builder layout saved & published!');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const addSection = (typeKey) => {
    const template = SECTION_TEMPLATES[typeKey];
    const newId = Date.now().toString();
    setSections([...sections, { id: newId, type: template.type, props: { ...template.defaultProps } }]);
    setSelectedId(newId);
  };

  const removeSection = (id) => {
    setSections(sections.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handlePropChange = (id, key, value) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, props: { ...s.props, [key]: value } } : s)));
  };

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (dragOverId !== id) setDragOverId(id);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIdx = sections.findIndex((s) => s.id === draggedId);
    const targetIdx = sections.findIndex((s) => s.id === targetId);

    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIdx, 1);
    newSections.splice(targetIdx, 0, draggedItem);

    setSections(newSections);
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center text-xs text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Frontend CMS Visual Builder</span>
        </div>
        <div className="flex items-center gap-2">
          {toast && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
            </span>
          )}
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Live Site
          </Link>
          <Button
            onClick={handleSavePublish}
            disabled={saving}
            className="bg-[#009966] hover:bg-[#008055] text-white font-bold h-9 px-4 text-xs cursor-pointer"
          >
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save & Publish'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* LEFT: Add Sections Panel */}
        <div className="w-64 shrink-0 bg-white border border-zinc-200 rounded-xl shadow-xs flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="font-bold text-zinc-950 text-sm">Add Elements</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Click to add section to canvas</p>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {Object.keys(SECTION_TEMPLATES).map((key) => {
              const tmpl = SECTION_TEMPLATES[key];
              const Icon = tmpl.icon;
              return (
                <div
                  key={key}
                  onClick={() => addSection(key)}
                  className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:border-[#009966] hover:bg-emerald-50/40 transition group"
                >
                  <div className="h-8 w-8 rounded-lg bg-zinc-100 text-zinc-700 group-hover:text-[#009966] group-hover:bg-emerald-100 flex items-center justify-center transition">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 text-xs font-bold text-zinc-950">{tmpl.label}</div>
                  <Plus size={14} className="text-zinc-600 group-hover:text-[#009966]" />
                </div>
              );
            })}
          </div>
        </div>

        {/* MIDDLE: Canvas / Live Preview */}
        <div className="flex-1 bg-white border border-zinc-200 rounded-xl flex flex-col overflow-hidden relative">
          <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-center gap-2">
            <MonitorSmartphone size={16} className="text-[#009966]" />
            <span className="text-xs font-bold text-zinc-950 uppercase tracking-widest">Live Page Preview</span>
          </div>

          <div className="flex-1 overflow-y-auto bg-zinc-200/70 relative p-4 sm:p-6">
            <div className="max-w-5xl mx-auto bg-white min-h-[500px] shadow-xl rounded-xl overflow-hidden flex flex-col relative">
              {sections.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-12">
                  <LayoutTemplate size={48} className="mb-4 opacity-50" />
                  <p className="font-bold text-zinc-800">Your page is empty.</p>
                  <p className="text-xs">Add sections from the left panel.</p>
                </div>
              ) : (
                sections.map((section) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDrop={(e) => handleDrop(e, section.id)}
                    onClick={() => setSelectedId(section.id)}
                    className={`relative group transition-all duration-200 cursor-pointer ${
                      dragOverId === section.id ? 'border-t-4 border-[#009966]' : 'border-t-4 border-transparent'
                    } ${selectedId === section.id ? 'ring-2 ring-[#009966] ring-inset z-10' : ''}`}
                  >
                    <div
                      className={`absolute top-2 right-2 flex gap-1 z-20 transition-opacity duration-200 ${
                        selectedId === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div
                        className="h-8 w-8 bg-white border border-zinc-200 rounded-lg shadow-md flex items-center justify-center text-zinc-900 hover:text-[#009966] cursor-grab"
                        title="Drag to reorder"
                      >
                        <GripHorizontal size={16} />
                      </div>
                      <div
                        className="h-8 w-8 bg-white border border-zinc-200 rounded-lg shadow-md flex items-center justify-center text-zinc-900 hover:text-rose-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSection(section.id);
                        }}
                        title="Delete Section"
                      >
                        <Trash2 size={16} />
                      </div>
                    </div>

                    <div className="pointer-events-none">
                      <PreviewRenderer section={section} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Settings Panel */}
        <div className="w-80 shrink-0 bg-white border border-zinc-200 rounded-xl shadow-xs flex flex-col hidden md:flex">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="font-bold text-zinc-950 text-sm">Edit Section Content</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Select a section to customize its text</p>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {!selectedId || !sections.find((s) => s.id === selectedId) ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center">
                <PanelBottom size={40} className="mb-4 opacity-50" />
                <p className="text-sm font-bold text-zinc-800">No section selected</p>
                <p className="text-xs mt-1">Click on any section in the canvas to edit its properties.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const section = sections.find((s) => s.id === selectedId);
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#009966]"></div>
                        <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                          {section.type} Settings
                        </span>
                      </div>

                      {Object.entries(section.props).map(([key, value]) => (
                        <div key={key} className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 capitalize block">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          {key === 'content' || key === 'subtitle' ? (
                            <textarea
                              rows={4}
                              value={value}
                              onChange={(e) => handlePropChange(selectedId, key, e.target.value)}
                              className="w-full bg-white border border-zinc-300 rounded-xl p-3 text-xs text-zinc-950 font-medium focus:border-[#009966] outline-none resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handlePropChange(selectedId, key, e.target.value)}
                              className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-950 font-medium focus:border-[#009966] outline-none"
                            />
                          )}
                        </div>
                      ))}

                      <div className="pt-4 mt-6 border-t border-zinc-100">
                        <Button
                          variant="outline"
                          className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          onClick={() => removeSection(selectedId)}
                        >
                          <Trash2 size={14} className="mr-2" /> Delete Section
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
