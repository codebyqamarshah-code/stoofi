'use client'

import React, { useState } from 'react'
import { ChevronRight, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Search, Plus } from 'lucide-react'
import api from '@/services/api'
import Link from 'next/link'

export default function EmailSMSLog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [logs, setLogs] = useState([])

  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex items-center text-sm text-zinc-400 mb-6">
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Communicate</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-white">Email/SMS Log List</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-medium text-white">Email/SMS Log List</h2>
          <Link href="/dashboard/communicate/send-email-sms">
            <button className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              SEND EMAIL/SMS
            </button>
          </Link>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex gap-1 bg-zinc-950 p-1 rounded-md border border-zinc-800">
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title="Copy">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title="Excel">
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title="CSV">
                <FileText className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title="PDF">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title="Print">
                <Printer className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title="Columns">
                <Columns className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Quick Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-800 rounded-md">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-xs uppercase bg-zinc-950 border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">SL</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-zinc-500">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr key={log.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{log.title}</td>
                      <td className="px-4 py-3">{log.description}</td>
                      <td className="px-4 py-3">{log.date}</td>
                      <td className="px-4 py-3">{log.type}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
