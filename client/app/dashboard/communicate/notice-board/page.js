'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRight, Calendar, User, Edit, Trash2, Plus, X } from 'lucide-react'
import api from '@/services/api' 

export default function NoticeBoard() {
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: 'Summer Vacation Notice',
      publishDate: '2026-08-20',
      noticeDate: '2026-08-25',
      createdBy: 'Admin'
    },
    {
      id: 2,
      title: 'Exam Schedule Announced',
      publishDate: '2026-08-22',
      noticeDate: '2026-08-26',
      createdBy: 'Principal'
    }
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNotice, setNewNotice] = useState({ title: '', publishDate: '', noticeDate: '' })

  const handleAddNotice = () => {
    if (newNotice.title) {
      setNotices([...notices, { ...newNotice, id: Date.now(), createdBy: 'Admin' }])
      setShowAddModal(false)
      setNewNotice({ title: '', publishDate: '', noticeDate: '' })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex items-center text-sm text-zinc-400 mb-6">
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Communicate</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-white">Notice Board</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">All Notices</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            ADD NOTICE
          </button>
        </div>
        
        <div className="p-4">
          {notices.length === 0 ? (
            <div className="text-zinc-400 text-center py-4">No notices available</div>
          ) : (
            notices.map(notice => (
              <div key={notice.id} className="border border-zinc-800 p-4 rounded-md mb-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900/50">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-medium text-zinc-100">{notice.title}</h3>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-emerald-500" />
                      <span>{notice.publishDate}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-emerald-500" />
                      <span>{notice.noticeDate}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1 text-emerald-500" />
                      <span>{notice.createdBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0 md:ml-4">
                    <button className="flex items-center text-emerald-500 hover:text-emerald-400 px-2 py-1">
                      <Edit className="w-4 h-4 mr-1" />
                      EDIT
                    </button>
                    <button className="flex items-center text-rose-500 hover:text-rose-400 px-2 py-1">
                      <Trash2 className="w-4 h-4 mr-1" />
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white">Add Notice</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-zinc-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Notice Title"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Publish Date</label>
                <input 
                  type="date" 
                  value={newNotice.publishDate}
                  onChange={(e) => setNewNotice({...newNotice, publishDate: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-zinc-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Notice Date</label>
                <input 
                  type="date" 
                  value={newNotice.noticeDate}
                  onChange={(e) => setNewNotice({...newNotice, noticeDate: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-zinc-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <button 
                onClick={handleAddNotice}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors mt-4"
              >
                Save Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
