'use client';

import Link from 'next/link';

import React, { useState } from 'react';
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
  MonitorSmartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Available Section Templates ---
const SECTION_TEMPLATES = {
  header: {
    type: 'header',
    icon: Heading,
    label: 'Navbar Header',
    defaultProps: { brand: 'Stoofi', links: 'Home, Features, About, Contact' }
  },
  hero: {
    type: 'hero',
    icon: LayoutTemplate,
    label: 'Hero Section',
    defaultProps: { title: 'Welcome to Stoofi ERP', subtitle: 'The most advanced and powerful school management system in the cloud.', buttonText: 'Get Started Today' }
  },
  features: {
    type: 'features',
    icon: Columns,
    label: 'Feature Cards',
    defaultProps: { title: 'Our Core Features', f1: 'Student Management', f2: 'Fee Collection', f3: 'Live Virtual Classes' }
  },
  text_block: {
    type: 'text_block',
    icon: Type,
    label: 'Text Block',
    defaultProps: { title: 'About Our School', content: 'We provide world-class education with top-notch facilities and experienced faculty members dedicated to your success.' }
  },
  footer: {
    type: 'footer',
    icon: PanelBottom,
    label: 'Footer',
    defaultProps: { copyright: '© 2026 Stoofi. All rights reserved.' }
  }
};

// --- Live Preview Component ---
const PreviewRenderer = ({ section }) => {
  const { type, props } = section;
  
  if (type === 'header') {
    return (
      <div className="bg-white text-zinc-900 py-4 px-6 flex justify-between items-center border-b shadow-sm">
        <div className="text-xl font-extrabold text-zinc-800">{props.brand}</div>
        <div className="hidden sm:flex gap-4 text-sm font-medium text-zinc-600">
          {props.links.split(',').map((l, i) => <span key={i} className="hover:text-zinc-600 cursor-pointer">{l.trim()}</span>)}
        </div>
      </div>
    );
  }
  
  if (type === 'hero') {
    return (
      <div className="bg-zinc-50 py-20 px-6 text-center border-b">
        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 mb-4">{props.title}</h1>
        <p className="text-zinc-600 max-w-2xl mx-auto mb-8 text-lg">{props.subtitle}</p>
        <button className="bg-zinc-800 text-white px-8 py-3 rounded-full font-bold hover:bg-zinc-800 transition shadow-lg">
          {props.buttonText}
        </button>
      </div>
    );
  }
  
  if (type === 'features') {
    return (
      <div className="bg-white py-16 px-6 border-b">
        <h2 className="text-3xl font-bold text-center text-zinc-900 mb-12">{props.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          {[props.f1, props.f2, props.f3].map((f, i) => (
            <div key={i} className="p-6 bg-zinc-50 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition">
              <div className="h-12 w-12 bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={20} />
              </div>
              <h3 className="font-bold text-zinc-800 text-lg">{f}</h3>
              <p className="text-zinc-500 text-sm mt-2">Manage everything efficiently with our built-in module.</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (type === 'text_block') {
    return (
      <div className="bg-white py-16 px-6 border-b text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">{props.title}</h2>
        <p className="text-zinc-600 leading-relaxed">{props.content}</p>
      </div>
    );
  }
  
  if (type === 'footer') {
    return (
      <div className="bg-zinc-900 text-zinc-400 py-8 px-6 text-center text-sm border-t-4 border-zinc-600">
        <div className="mb-4 flex justify-center gap-4">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
        </div>
        {props.copyright}
      </div>
    );
  }
  
  return null;
};

export default function FrontendCmsPage() {
  const [sections, setSections] = useState([
    { id: '1', type: 'header', props: { ...SECTION_TEMPLATES.header.defaultProps } },
    { id: '2', type: 'hero', props: { ...SECTION_TEMPLATES.hero.defaultProps } },
    { id: '3', type: 'features', props: { ...SECTION_TEMPLATES.features.defaultProps } },
    { id: '4', type: 'footer', props: { ...SECTION_TEMPLATES.footer.defaultProps } },
  ]);
  
  const [selectedId, setSelectedId] = useState('2');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // --- Actions ---
  const addSection = (typeKey) => {
    const template = SECTION_TEMPLATES[typeKey];
    const newId = Date.now().toString();
    setSections([...sections, { id: newId, type: template.type, props: { ...template.defaultProps } }]);
    setSelectedId(newId);
  };

  const removeSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handlePropChange = (id, key, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, props: { ...s.props, [key]: value } } : s));
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the dragged element from instantly disappearing if re-rendered
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
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

    const draggedIdx = sections.findIndex(s => s.id === draggedId);
    const targetIdx = sections.findIndex(s => s.id === targetId);
    
    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIdx, 1);
    newSections.splice(targetIdx, 0, draggedItem);
    
    setSections(newSections);
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center text-xs text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/settings/general" className="hover:text-zinc-500 transition-colors">Settings</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600 font-semibold">Frontend CMS Builder</span>
        </div>
        <Button className="bg-zinc-800 hover:bg-zinc-800 text-white h-9 px-4 text-xs">
          <Save className="h-4 w-4 mr-2" /> Save & Publish
        </Button>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        
        {/* LEFT: Add Sections Panel */}
        <div className="w-64 shrink-0 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-bold text-white text-sm">Add Elements</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Click to add to your page</p>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
            {Object.keys(SECTION_TEMPLATES).map(key => {
              const tmpl = SECTION_TEMPLATES[key];
              const Icon = tmpl.icon;
              return (
                <div 
                  key={key}
                  onClick={() => addSection(key)}
                  className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-600/50 hover:bg-zinc-100 transition group"
                >
                  <div className="h-8 w-8 rounded-md bg-zinc-800 text-zinc-400 group-hover:text-zinc-500 group-hover:bg-zinc-100 flex items-center justify-center transition">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 text-xs font-semibold text-zinc-300 group-hover:text-zinc-200">{tmpl.label}</div>
                  <Plus size={14} className="text-zinc-600 group-hover:text-zinc-600" />
                </div>
              );
            })}
          </div>
        </div>

        {/* MIDDLE: Canvas / Live Preview */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden relative shadow-inner">
          <div className="p-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-center gap-2">
            <MonitorSmartphone size={16} className="text-zinc-600" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Live Page Preview</span>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-zinc-300 custom-scrollbar relative p-4 sm:p-8">
            <div className="max-w-5xl mx-auto bg-white min-h-[500px] shadow-2xl rounded-sm overflow-hidden flex flex-col relative">
              {sections.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-12">
                  <LayoutTemplate size={48} className="mb-4 opacity-50" />
                  <p>Your page is empty.</p>
                  <p className="text-sm">Add sections from the left panel.</p>
                </div>
              ) : (
                sections.map((section, idx) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDrop={(e) => handleDrop(e, section.id)}
                    onClick={() => setSelectedId(section.id)}
                    className={`
                      relative group transition-all duration-200 cursor-pointer
                      ${dragOverId === section.id ? 'border-t-4 border-zinc-600' : 'border-t-4 border-transparent'}
                      ${selectedId === section.id ? 'ring-2 ring-zinc-600 ring-inset z-10' : ''}
                    `}
                  >
                    {/* Hover Controls Overlay */}
                    <div className={`absolute top-0 right-0 left-0 bottom-0 pointer-events-none transition-colors duration-200 ${selectedId === section.id ? 'bg-zinc-600/5' : 'group-hover:bg-zinc-600/5'}`}></div>
                    
                    <div className={`absolute top-2 right-2 flex gap-1 z-20 transition-opacity duration-200 ${selectedId === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div 
                        className="h-8 w-8 bg-zinc-900 border border-zinc-700 rounded shadow-lg flex items-center justify-center text-zinc-300 hover:text-zinc-500 hover:border-zinc-600 cursor-grab active:cursor-grabbing"
                        title="Drag to reorder"
                      >
                        <GripHorizontal size={16} />
                      </div>
                      <div 
                        className="h-8 w-8 bg-zinc-900 border border-zinc-700 rounded shadow-lg flex items-center justify-center text-zinc-300 hover:text-rose-400 hover:border-rose-500 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                        title="Delete Section"
                      >
                        <Trash2 size={16} />
                      </div>
                    </div>

                    {/* Component Render */}
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
        <div className="w-80 shrink-0 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col hidden md:flex">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-bold text-white text-sm">Edit Content</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Select a section to edit its properties</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {!selectedId || !sections.find(s => s.id === selectedId) ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center">
                <PanelBottom size={40} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">No section selected</p>
                <p className="text-xs mt-2">Click on any section in the canvas to edit its properties here.</p>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {(() => {
                  const section = sections.find(s => s.id === selectedId);
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="h-2 w-2 rounded-full bg-zinc-600 animate-pulse"></div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{section.type} Settings</span>
                      </div>
                      
                      {Object.entries(section.props).map(([key, value]) => (
                        <div key={key} className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400 capitalize flex items-center justify-between">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          {key === 'content' || key === 'subtitle' ? (
                            <textarea
                              rows={4}
                              value={value}
                              onChange={(e) => handlePropChange(selectedId, key, e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50 transition-all outline-none resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handlePropChange(selectedId, key, e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50 transition-all outline-none"
                            />
                          )}
                        </div>
                      ))}
                      
                      <div className="pt-4 mt-6 border-t border-zinc-800">
                        <Button 
                          variant="outline" 
                          className="w-full border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50"
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

