'use client'

import React, { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import api from '@/services/api'

export default function SendEmailSMS() {
  const [showAlert, setShowAlert] = useState(true)
  const [activeTab, setActiveTab] = useState('INDIVIDUAL')
  const [sendThrough, setSendThrough] = useState('Email')
  const [messageTo, setMessageTo] = useState('Student')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const tabs = ['GROUP', 'INDIVIDUAL', 'CLASS']
  const userTypes = ['Student', 'Parents', 'Teacher', 'Admin', 'Accountant', 'Receptionist', 'Librarian', 'Driver']

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex items-center text-sm text-zinc-400 mb-6">
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Communicate</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-white">Send Email/SMS</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-medium text-white">Send Email/SMS</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">TITLE *</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-zinc-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">SEND THROUGH</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sendThrough" 
                    value="Email"
                    checked={sendThrough === 'Email'}
                    onChange={(e) => setSendThrough(e.target.value)}
                    className="text-emerald-500 focus:ring-emerald-500 bg-zinc-900 border-zinc-800"
                  />
                  <span className="text-sm text-zinc-300">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sendThrough" 
                    value="SMS"
                    checked={sendThrough === 'SMS'}
                    onChange={(e) => setSendThrough(e.target.value)}
                    className="text-emerald-500 focus:ring-emerald-500 bg-zinc-900 border-zinc-800"
                  />
                  <span className="text-sm text-zinc-300">SMS</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">DESCRIPTION *</label>
              <textarea 
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-zinc-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            {showAlert && (
              <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 p-3 rounded-md flex justify-between items-start text-sm">
                <p>For Sending Email / Sms, it may take some seconds. So please take patience.</p>
                <button onClick={() => setShowAlert(false)} className="text-emerald-500 hover:text-emerald-400 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors mt-4 font-medium">
              SEND
            </button>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm flex flex-col">
          <div className="flex border-b border-zinc-800">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'text-emerald-500 border-b-2 border-emerald-500 bg-zinc-800/50' 
                    : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="p-4 flex-1">
            {activeTab === 'INDIVIDUAL' && (
              <div>
                <label className="block text-sm text-zinc-400 mb-3">MESSAGE TO *</label>
                <div className="grid grid-cols-2 gap-3">
                  {userTypes.map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="messageTo"
                        value={type}
                        checked={messageTo === type}
                        onChange={(e) => setMessageTo(e.target.value)}
                        className="text-emerald-500 focus:ring-emerald-500 bg-zinc-900 border-zinc-800"
                      />
                      <span className="text-sm text-zinc-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'GROUP' && (
              <div className="text-zinc-400 text-sm">Group selection options will appear here.</div>
            )}
            {activeTab === 'CLASS' && (
              <div className="text-zinc-400 text-sm">Class selection options will appear here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
