'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Settings, 
  Save, 
  Eye, 
  EyeOff, 
  GripVertical,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Search,
  Layers,
  FolderOpen,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookMarked,
  Printer,
  Download,
  Shield,
  DollarSign,
  BookOpen,
  Award,
  CalendarDays,
  Monitor,
  Wallet,
  Building,
  Box,
  MessageSquare,
  Megaphone,
  Paintbrush,
  PieChart,
  List,
  Video,
  User,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DEFAULT_MENU_STRUCTURE, 
  ICON_MAP, 
  getStoredSidebar, 
  saveStoredSidebar, 
  resetStoredSidebar 
} from '@/lib/sidebarConfig';

const ROLES = ['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent'];
const AVAILABLE_ICONS = [
  'LayoutDashboard', 'Users', 'GraduationCap', 'FolderOpen', 'BookMarked', 
  'Printer', 'Download', 'Layers', 'Shield', 'DollarSign', 'BookOpen', 
  'Award', 'CalendarDays', 'Monitor', 'Wallet', 'Building', 'Box', 
  'MessageSquare', 'Megaphone', 'Paintbrush', 'PieChart', 'List', 'Video', 'User', 'Settings'
];

export default function SidebarManagerPage() {
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [sections, setSections] = useState(DEFAULT_MENU_STRUCTURE);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', href: '', badge: '', iconName: 'Settings' });
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupTitle, setEditGroupTitle] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [liveChangesCount, setLiveChangesCount] = useState(0);

  // New Section form state
  const [newGroupTitle, setNewGroupTitle] = useState('');

  // New Item form state
  const [targetGroupId, setTargetGroupId] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemHref, setNewItemHref] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('FolderOpen');
  const [newItemBadge, setNewItemBadge] = useState('');

  // Drag & Drop State
  const [draggedGroupIndex, setDraggedGroupIndex] = useState(null);
  const [draggedItemInfo, setDraggedItemInfo] = useState(null); // { groupIdx, itemIdx }
  const [dragOverTarget, setDragOverTarget] = useState(null); // { type: 'group'|'item', groupIdx, itemIdx }

  // Load configuration on mount and role change
  useEffect(() => {
    const data = getStoredSidebar(selectedRole);
    if (data && Array.isArray(data)) {
      setSections(JSON.parse(JSON.stringify(data)));
    } else {
      setSections(JSON.parse(JSON.stringify(DEFAULT_MENU_STRUCTURE)));
    }
  }, [selectedRole]);

  const markChanged = () => {
    setLiveChangesCount(prev => prev + 1);
  };

  // --- SAVE & RESET ACTIONS ---
  const handleSaveLayout = () => {
    saveStoredSidebar(sections, selectedRole);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefault = () => {
    if (window.confirm(`Are you sure you want to reset the sidebar layout to default for "${selectedRole}"?`)) {
      const def = resetStoredSidebar(selectedRole);
      setSections(JSON.parse(JSON.stringify(def)));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // --- COLLAPSE ALL / EXPAND ALL ---
  const toggleCollapseAll = (collapse) => {
    const newCollapsed = {};
    sections.forEach(g => {
      newCollapsed[g.id || g.groupTitle] = collapse;
    });
    setCollapsedSections(newCollapsed);
  };

  const toggleSectionCollapse = (groupId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // --- ADD SECTION & ITEM ACTIONS ---
  const handleAddGroup = (e) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;

    const newGroup = {
      id: `grp-custom-${Date.now()}`,
      groupTitle: newGroupTitle.trim().toUpperCase(),
      visible: true,
      items: []
    };

    setSections(prev => [...prev, newGroup]);
    setNewGroupTitle('');
    markChanged();
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !targetGroupId) return;

    const targetGroup = sections.find(g => (g.id || g.groupTitle) === targetGroupId);
    if (!targetGroup) return;

    const newItem = {
      id: `item-custom-${Date.now()}`,
      name: newItemName.trim(),
      href: newItemHref.trim() || `/dashboard/${newItemName.toLowerCase().replace(/\s+/g, '-')}`,
      iconName: newItemIcon,
      badge: newItemBadge.trim() || undefined,
      visible: true,
      hasSubmenu: false
    };

    const updated = sections.map(g => {
      if ((g.id || g.groupTitle) === targetGroupId) {
        return {
          ...g,
          items: [...(g.items || []), newItem]
        };
      }
      return g;
    });

    setSections(updated);
    setNewItemName('');
    setNewItemHref('');
    setNewItemBadge('');
    markChanged();
  };

  // --- TOGGLE VISIBILITY ---
  const toggleGroupVisibility = (groupId) => {
    setSections(prev => prev.map(g => {
      if ((g.id || g.groupTitle) === groupId) {
        return { ...g, visible: g.visible === false ? true : false };
      }
      return g;
    }));
    markChanged();
  };

  const toggleItemVisibility = (groupId, itemId) => {
    setSections(prev => prev.map(g => {
      if ((g.id || g.groupTitle) === groupId) {
        return {
          ...g,
          items: (g.items || []).map(item => {
            if ((item.id || item.name) === itemId) {
              return { ...item, visible: item.visible === false ? true : false };
            }
            return item;
          })
        };
      }
      return g;
    }));
    markChanged();
  };

  const toggleSubItemVisibility = (groupId, itemId, subId) => {
    setSections(prev => prev.map(g => {
      if ((g.id || g.groupTitle) === groupId) {
        return {
          ...g,
          items: (g.items || []).map(item => {
            if ((item.id || item.name) === itemId && item.subItems) {
              return {
                ...item,
                subItems: item.subItems.map(sub => {
                  if ((sub.id || sub.name) === subId) {
                    return { ...sub, visible: sub.visible === false ? true : false };
                  }
                  return sub;
                })
              };
            }
            return item;
          })
        };
      }
      return g;
    }));
    markChanged();
  };

  // --- DELETE ACTIONS ---
  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to remove this section and all its menu items?')) {
      setSections(prev => prev.filter(g => (g.id || g.groupTitle) !== groupId));
      markChanged();
    }
  };

  const handleDeleteItem = (groupId, itemId) => {
    setSections(prev => prev.map(g => {
      if ((g.id || g.groupTitle) === groupId) {
        return {
          ...g,
          items: (g.items || []).filter(item => (item.id || item.name) !== itemId)
        };
      }
      return g;
    }));
    markChanged();
  };

  const handleDeleteSubItem = (groupId, itemId, subId) => {
    setSections(prev => prev.map(g => {
      if ((g.id || g.groupTitle) === groupId) {
        return {
          ...g,
          items: (g.items || []).map(item => {
            if ((item.id || item.name) === itemId && item.subItems) {
              return {
                ...item,
                subItems: item.subItems.filter(sub => (sub.id || sub.name) !== subId)
              };
            }
            return item;
          })
        };
      }
      return g;
    }));
    markChanged();
  };

  // --- EDIT ACTIONS ---
  const startEditItem = (item) => {
    setEditingItemId(item.id || item.name);
    setEditFormData({
      name: item.name,
      href: item.href || '',
      badge: item.badge || '',
      iconName: item.iconName || 'Settings'
    });
  };

  const saveEditItem = (groupId, itemId) => {
    setSections(prev => prev.map(g => {
      if ((g.id || g.groupTitle) === groupId) {
        return {
          ...g,
          items: (g.items || []).map(item => {
            if ((item.id || item.name) === itemId) {
              return {
                ...item,
                name: editFormData.name,
                href: editFormData.href,
                badge: editFormData.badge || undefined,
                iconName: editFormData.iconName
              };
            }
            return item;
          })
        };
      }
      return g;
    }));
    setEditingItemId(null);
    markChanged();
  };

  const startEditGroup = (group) => {
    setEditingGroupId(group.id || group.groupTitle);
    setEditGroupTitle(group.groupTitle);
  };

  const saveEditGroup = (groupId) => {
    if (!editGroupTitle.trim()) return;
    setSections(prev => prev.map(g => {
      if ((g.id || g.groupTitle) === groupId) {
        return { ...g, groupTitle: editGroupTitle.trim().toUpperCase() };
      }
      return g;
    }));
    setEditingGroupId(null);
    markChanged();
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleGroupDragStart = (e, index) => {
    setDraggedGroupIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGroupDragOver = (e, index) => {
    e.preventDefault();
    if (draggedGroupIndex === null || draggedGroupIndex === index) return;
    setDragOverTarget({ type: 'group', groupIdx: index });
  };

  const handleGroupDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedGroupIndex === null || draggedGroupIndex === targetIndex) {
      setDraggedGroupIndex(null);
      setDragOverTarget(null);
      return;
    }

    const updated = [...sections];
    const [moved] = updated.splice(draggedGroupIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setSections(updated);
    setDraggedGroupIndex(null);
    setDragOverTarget(null);
    markChanged();
  };

  const handleItemDragStart = (e, groupIdx, itemIdx) => {
    e.stopPropagation();
    setDraggedItemInfo({ groupIdx, itemIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e, groupIdx, itemIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItemInfo) return;
    setDragOverTarget({ type: 'item', groupIdx, itemIdx });
  };

  const handleItemDrop = (e, targetGroupIdx, targetItemIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItemInfo) return;

    const { groupIdx: srcGroupIdx, itemIdx: srcItemIdx } = draggedItemInfo;

    const updated = JSON.parse(JSON.stringify(sections));
    const [movedItem] = updated[srcGroupIdx].items.splice(srcItemIdx, 1);

    if (targetItemIdx !== undefined && targetItemIdx !== null) {
      updated[targetGroupIdx].items.splice(targetItemIdx, 0, movedItem);
    } else {
      updated[targetGroupIdx].items.push(movedItem);
    }

    setSections(updated);
    setDraggedItemInfo(null);
    setDragOverTarget(null);
    markChanged();
  };

  // Filtered sections for search query
  const filteredSections = sections.filter(group => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const groupMatch = group.groupTitle.toLowerCase().includes(term);
    const itemMatch = (group.items || []).some(item => 
      item.name.toLowerCase().includes(term) || 
      (item.subItems || []).some(s => s.name.toLowerCase().includes(term))
    );
    return groupMatch || itemMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Header & Role Selector Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-500 border border-zinc-200">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                Sidebar Manager <span style={{backgroundColor:'#09090b', color:'#ffffff'}} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">Live Builder</span>
              </h1>
              <div className="flex items-center text-xs text-zinc-400 mt-0.5">
                <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">
                  Dashboard
                </Link>
                <ChevronRight className="h-3.5 w-3.5 mx-1 text-zinc-950" />
                <Link href="/dashboard/settings/general" className="hover:text-zinc-700 transition-colors">
                  Settings
                </Link>
                <ChevronRight className="h-3.5 w-3.5 mx-1 text-zinc-950" />
                <span className="text-zinc-950 font-bold">Sidebar Manager</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Switcher */}
          <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 gap-2">
            <span className="text-xs font-semibold text-zinc-500">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
            >
              {ROLES.map(role => (
                <option key={role} value={role} className="bg-white text-zinc-900 font-medium">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Reset to default */}
          <Button 
            onClick={handleResetDefault}
            variant="outline" 
            size="sm" 
            className="border-zinc-200 text-zinc-500 hover:text-rose-500 hover:bg-rose-50 text-xs h-9"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Default
          </Button>

          {/* Save changes button */}
          <Button 
            onClick={handleSaveLayout}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs h-9 shadow-sm"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save & Update Sidebar
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="flex items-center justify-between bg-zinc-600/10 border border-zinc-600/30 text-zinc-500 px-4 py-3 rounded-xl text-xs font-semibold animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-zinc-500" />
            <span>Sidebar layout saved successfully! The navigation has been updated live.</span>
          </div>
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">SAVED</span>
        </div>
      )}

      {/* Grid Layout: Left Add Panel, Right Menu Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Add Section & Add Menu (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Filter Box */}
          <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search menus or sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200 text-[11px] text-zinc-500">
              <span>{sections.length} Sections ({sections.reduce((acc, g) => acc + (g.items || []).length, 0)} Items)</span>
              <div className="flex gap-2">
                <button onClick={() => toggleCollapseAll(false)} className="hover:text-zinc-900 transition-colors">Expand All</button>
                <span>•</span>
                <button onClick={() => toggleCollapseAll(true)} className="hover:text-zinc-900 transition-colors">Collapse All</button>
              </div>
            </div>
          </div>

          {/* Add New Section (Group) */}
          <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-zinc-500" /> Add New Section
              </h2>
            </div>
            
            <form onSubmit={handleAddGroup} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Section Title</Label>
                <Input
                  placeholder="e.g. MARKETING / PAYMENTS"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  className="bg-white border-zinc-200 text-xs text-zinc-900 h-9 rounded-lg focus-visible:ring-zinc-900"
                />
              </div>
              <Button type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs h-9 rounded-lg">
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Section
              </Button>
            </form>
          </div>

          {/* Add Submenu / Item */}
          <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-zinc-500" /> Add Custom Menu Link
              </h2>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Target Section <span className="text-rose-500">*</span></Label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  required
                >
                  <option value="">-- Select Section --</option>
                  {sections.map(g => (
                    <option key={g.id || g.groupTitle} value={g.id || g.groupTitle}>
                      {g.groupTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Menu Label <span className="text-rose-500">*</span></Label>
                <Input
                  placeholder="e.g. Online Store"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="bg-white border-zinc-200 text-xs text-zinc-900 h-9 rounded-lg focus-visible:ring-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Route / URL</Label>
                <Input
                  placeholder="e.g. /dashboard/store"
                  value={newItemHref}
                  onChange={(e) => setNewItemHref(e.target.value)}
                  className="bg-white border-zinc-200 text-xs text-zinc-900 h-9 rounded-lg focus-visible:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Icon</Label>
                  <select
                    value={newItemIcon}
                    onChange={(e) => setNewItemIcon(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  >
                    {AVAILABLE_ICONS.map(iconName => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Badge (Optional)</Label>
                  <Input
                    placeholder="e.g. NEW"
                    value={newItemBadge}
                    onChange={(e) => setNewItemBadge(e.target.value)}
                    className="bg-white border-zinc-200 text-xs text-zinc-900 h-9 rounded-lg focus-visible:ring-zinc-900"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs h-9 rounded-lg mt-2">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Menu Item
              </Button>
            </form>
          </div>

          {/* Quick Tips */}
          <div className="bg-zinc-100 border border-zinc-600/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs mb-1.5">
              <Sparkles className="h-4 w-4" /> Drag & Drop Guide
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Grab the handle <GripVertical className="inline h-3 w-3 text-zinc-500" /> on any section or menu item to reorder them seamlessly. Toggle the eye icon to show/hide items without deleting.
            </p>
          </div>
        </div>

        {/* RIGHT MAIN CANVAS: Hierarchical Drag & Drop Menu Builder (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <span className="font-semibold uppercase tracking-wider text-zinc-500">Navigation Structure</span>
            <span>Total Sections: <strong className="text-zinc-900">{filteredSections.length}</strong></span>
          </div>

          {filteredSections.length === 0 ? (
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-12 text-center text-zinc-400 space-y-2">
              <Layers className="h-8 w-8 mx-auto text-zinc-950" />
              <p className="text-sm font-semibold text-zinc-500">No menus matched your search</p>
              <p className="text-xs">Try searching for another keyword or clear the search filter.</p>
            </div>
          ) : (
            filteredSections.map((group, groupIdx) => {
              const groupId = group.id || group.groupTitle;
              const isCollapsed = collapsedSections[groupId];
              const isGroupHidden = group.visible === false;
              const isEditingGroup = editingGroupId === groupId;
              const isDragOver = dragOverTarget?.type === 'group' && dragOverTarget?.groupIdx === groupIdx;

              return (
                <div
                  key={groupId}
                  draggable
                  onDragStart={(e) => handleGroupDragStart(e, groupIdx)}
                  onDragOver={(e) => handleGroupDragOver(e, groupIdx)}
                  onDrop={(e) => handleGroupDrop(e, groupIdx)}
                  className={`
                    bg-white border rounded-2xl overflow-hidden transition-all duration-200 shadow-sm
                    ${isGroupHidden ? 'opacity-60 border-zinc-200' : 'border-zinc-200 hover:border-zinc-400'}
                    ${isDragOver ? 'border-t-4 border-t-zinc-900 ring-2 ring-zinc-900/10' : ''}
                    ${draggedGroupIndex === groupIdx ? 'opacity-40 scale-[0.99]' : ''}
                  `}
                >
                  {/* Section Header Card */}
                  <div className="flex items-center justify-between p-3.5 bg-zinc-50 border-b border-zinc-200 gap-3">
                    
                    {/* Left: Drag Handle & Title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-700 transition-colors p-1"
                        title="Drag to reorder section"
                      >
                        <GripVertical size={16} />
                      </div>

                      {isEditingGroup ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editGroupTitle}
                            onChange={(e) => setEditGroupTitle(e.target.value)}
                            className="bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs text-zinc-900 font-bold focus:outline-none focus:border-zinc-900"
                            autoFocus
                          />
                          <button 
                            onClick={() => saveEditGroup(groupId)} 
                            className="p-1 text-zinc-500 hover:text-zinc-900"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => setEditingGroupId(null)} 
                            className="p-1 text-zinc-500 hover:text-zinc-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 truncate">
                          <button
                            onClick={() => toggleSectionCollapse(groupId)}
                            className="flex items-center gap-2 text-left text-xs font-black tracking-wider text-zinc-900 hover:text-zinc-500 transition-colors truncate"
                          >
                            <span>{group.groupTitle}</span>
                            {isCollapsed ? (
                              <ChevronDown size={14} className="text-zinc-400" />
                            ) : (
                              <ChevronUp size={14} className="text-zinc-400" />
                            )}
                          </button>
                          <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full shrink-0">
                            {(group.items || []).length} items
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Section Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      
                      {/* Rename */}
                      <button
                        onClick={() => startEditGroup(group)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        title="Rename section"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleGroupVisibility(groupId)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          !isGroupHidden 
                            ? 'text-zinc-400 hover:bg-zinc-100' 
                            : 'text-zinc-950 hover:bg-zinc-100'
                        }`}
                        title={isGroupHidden ? "Show Section" : "Hide Section"}
                      >
                        {!isGroupHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      {/* Delete Section */}
                      <button
                        onClick={() => handleDeleteGroup(groupId)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Delete section"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Section Menu Items Container */}
                  {!isCollapsed && (
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedItemInfo && draggedItemInfo.groupIdx !== groupIdx) {
                          setDragOverTarget({ type: 'item', groupIdx, itemIdx: (group.items || []).length });
                        }
                      }}
                      onDrop={(e) => {
                        if (draggedItemInfo && draggedItemInfo.groupIdx !== groupIdx) {
                          handleItemDrop(e, groupIdx, (group.items || []).length);
                        }
                      }}
                      className="p-3 space-y-2 bg-zinc-50/50 min-h-[48px]"
                    >
                      {(group.items || []).length === 0 ? (
                        <div className="p-4 border border-dashed border-zinc-200 rounded-xl text-center text-xs text-zinc-400">
                          Empty section. Add or drag menu items here.
                        </div>
                      ) : (
                        group.items.map((item, itemIdx) => {
                          const itemId = item.id || item.name;
                          const isItemHidden = item.visible === false || isGroupHidden;
                          const isEditingThisItem = editingItemId === itemId;
                          const IconComp = (item.iconName && ICON_MAP[item.iconName]) || Settings;
                          const isItemDragOver = dragOverTarget?.type === 'item' && dragOverTarget?.groupIdx === groupIdx && dragOverTarget?.itemIdx === itemIdx;

                          return (
                            <div 
                              key={itemId}
                              draggable
                              onDragStart={(e) => handleItemDragStart(e, groupIdx, itemIdx)}
                              onDragOver={(e) => handleItemDragOver(e, groupIdx, itemIdx)}
                              onDrop={(e) => handleItemDrop(e, groupIdx, itemIdx)}
                              className={`
                                rounded-xl border transition-all duration-150
                                ${isItemHidden ? 'bg-zinc-50 border-zinc-200 opacity-60' : 'bg-white border-zinc-200 hover:border-zinc-400'}
                                ${isItemDragOver ? 'border-t-2 border-t-zinc-900 ring-1 ring-zinc-900/20' : ''}
                                ${draggedItemInfo?.groupIdx === groupIdx && draggedItemInfo?.itemIdx === itemIdx ? 'opacity-30' : ''}
                              `}
                            >
                              {/* Main Item Row */}
                              <div className="flex items-center justify-between p-2.5 gap-2">
                                
                                {/* Left Drag & Details */}
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                  <div 
                                    className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-700 p-0.5"
                                    title="Drag to reorder"
                                  >
                                    <GripVertical size={14} />
                                  </div>

                                  <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                                    <IconComp size={14} />
                                  </div>

                                  {isEditingThisItem ? (
                                    <div className="flex flex-wrap items-center gap-2 flex-1">
                                      <input
                                        type="text"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="bg-white border border-zinc-300 rounded px-2 py-0.5 text-xs text-zinc-900 font-medium focus:outline-none focus:border-zinc-900"
                                        placeholder="Name"
                                      />
                                      <input
                                        type="text"
                                        value={editFormData.href}
                                        onChange={(e) => setEditFormData({ ...editFormData, href: e.target.value })}
                                        className="bg-white border border-zinc-300 rounded px-2 py-0.5 text-xs text-zinc-600 focus:outline-none focus:border-zinc-900"
                                        placeholder="Route / URL"
                                      />
                                      <select
                                        value={editFormData.iconName}
                                        onChange={(e) => setEditFormData({ ...editFormData, iconName: e.target.value })}
                                        className="bg-white border border-zinc-300 rounded px-2 py-0.5 text-xs text-zinc-700 focus:outline-none focus:border-zinc-900"
                                      >
                                        {AVAILABLE_ICONS.map(ic => (
                                          <option key={ic} value={ic}>{ic}</option>
                                        ))}
                                      </select>
                                      <button 
                                        onClick={() => saveEditItem(groupId, itemId)} 
                                        className="p-1 text-zinc-500 hover:text-zinc-900"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button 
                                        onClick={() => setEditingItemId(null)} 
                                        className="p-1 text-zinc-500 hover:text-zinc-700"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 truncate">
                                      <span className={`text-xs font-semibold ${isItemHidden ? 'text-zinc-400 line-through' : 'text-zinc-900'} truncate`}>
                                        {item.name}
                                      </span>
                                      {item.badge && (
                                        <span className="text-[9px] font-bold uppercase bg-zinc-100 text-zinc-500 px-1.5 py-0.2 rounded border border-zinc-200">
                                          {item.badge}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-zinc-400 truncate hidden sm:inline">
                                        {item.href}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Right Item Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                  
                                  {/* Edit Button */}
                                  <button
                                    onClick={() => startEditItem(item)}
                                    className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                                    title="Edit item"
                                  >
                                    <Edit2 size={13} />
                                  </button>

                                  {/* Visibility Toggle */}
                                  <button
                                    onClick={() => toggleItemVisibility(groupId, itemId)}
                                    className={`p-1 transition-colors ${
                                      !isItemHidden 
                                        ? 'text-zinc-400 hover:text-zinc-700' 
                                        : 'text-zinc-950 hover:text-zinc-500'
                                    }`}
                                    title={isItemHidden ? "Show Menu" : "Hide Menu"}
                                  >
                                    {!isItemHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                                  </button>

                                  {/* Delete Item */}
                                  <button
                                    onClick={() => handleDeleteItem(groupId, itemId)}
                                    className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                                    title="Delete item"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Nested Sub-items (if present) */}
                              {item.subItems && item.subItems.length > 0 && (
                                <div className="pl-8 pr-3 pb-2.5 pt-1 space-y-1.5 border-t border-zinc-100">
                                  {item.subItems.map((sub, sIdx) => {
                                    const subId = sub.id || sub.name;
                                    const isSubHidden = sub.visible === false || isItemHidden;

                                    return (
                                      <div 
                                        key={subId}
                                        className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs"
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <div className="h-1.5 w-1.5 rounded-full bg-zinc-300"></div>
                                          <span className={`${isSubHidden ? 'text-zinc-400 line-through' : 'text-zinc-700'} truncate text-[11px]`}>
                                            {sub.name}
                                          </span>
                                          <span className="text-[9px] text-zinc-400 hidden md:inline truncate">
                                            {sub.href}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => toggleSubItemVisibility(groupId, itemId, subId)}
                                            className={`p-0.5 ${!isSubHidden ? 'text-zinc-400' : 'text-zinc-950'}`}
                                            title="Toggle submenu item visibility"
                                          >
                                            {!isSubHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                                          </button>
                                          <button
                                            onClick={() => handleDeleteSubItem(groupId, itemId, subId)}
                                            className="p-0.5 text-zinc-400 hover:text-rose-500"
                                            title="Delete submenu item"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
