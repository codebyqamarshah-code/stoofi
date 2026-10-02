'use client';
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function ChatSettingsPage() {
  const [chatMethod, setChatMethod] = useState('pusher');
  const [pusherAppId, setPusherAppId] = useState('');
  const [pusherAppKey, setPusherAppKey] = useState('');
  const [pusherAppSecret, setPusherAppSecret] = useState('');
  const [pusherAppCluster, setPusherAppCluster] = useState('');
  
  const [teacherChatParent, setTeacherChatParent] = useState('no');
  const [studentChatAdmin, setStudentChatAdmin] = useState('yes');
  const [adminChatNoInvite, setAdminChatNoInvite] = useState('yes');
  const [openChatSystem, setOpenChatSystem] = useState('no');
  
  const [invitationReq, setInvitationReq] = useState('required');
  
  const [canUploadFile, setCanUploadFile] = useState('yes');
  const [uploadLimit, setUploadLimit] = useState('5');
  const [studentMakeGroup, setStudentMakeGroup] = useState('no');
  const [staffBanStudent, setStaffBanStudent] = useState('yes');
  const [studentAddMember, setStudentAddMember] = useState('no');
  const [teacherMakeGroup, setTeacherMakeGroup] = useState('yes');
  const [teacherPinMessage, setTeacherPinMessage] = useState('yes');

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 font-sans space-y-6">
      <div>
        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>General Settings</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-950 font-bold">Chat Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">Chat Settings</h1>
      </div>

      {/* Chatting Method Settings */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-sm font-bold text-zinc-950">Chatting Method Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">CHAT SETTINGS</label>
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="chatMethod" value="pusher" checked={chatMethod === 'pusher'} onChange={() => setChatMethod('pusher')} className="w-4 h-4 accent-zinc-950" />
                <span>Pusher</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="chatMethod" value="jquery" checked={chatMethod === 'jquery'} onChange={() => setChatMethod('jquery')} className="w-4 h-4 accent-zinc-950" />
                <span>jQuery</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">PUSHER APP ID</label>
            <input type="text" value={pusherAppId} onChange={(e) => setPusherAppId(e.target.value)} className="md:col-span-2 w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">PUSHER APP KEY</label>
            <input type="text" value={pusherAppKey} onChange={(e) => setPusherAppKey(e.target.value)} className="md:col-span-2 w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">PUSHER APP SECRET</label>
            <input type="password" value={pusherAppSecret} onChange={(e) => setPusherAppSecret(e.target.value)} className="md:col-span-2 w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">PUSHER APP CLUSTER</label>
            <input type="text" value={pusherAppCluster} onChange={(e) => setPusherAppCluster(e.target.value)} className="md:col-span-2 w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <div className="flex justify-end">
            <button className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm transition-colors cursor-pointer">UPDATE</button>
          </div>
        </div>
      </div>

      {/* Chat Settings */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-sm font-bold text-zinc-950">Chat Rules & Permissions</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">CAN TEACHER CHAT WITH PARENTS</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="teacherChatParent" value="yes" checked={teacherChatParent === 'yes'} onChange={() => setTeacherChatParent('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="teacherChatParent" value="no" checked={teacherChatParent === 'no'} onChange={() => setTeacherChatParent('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">CAN STUDENT CHAT WITH ADMIN ACCOUNTS</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="studentChatAdmin" value="yes" checked={studentChatAdmin === 'yes'} onChange={() => setStudentChatAdmin('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="studentChatAdmin" value="no" checked={studentChatAdmin === 'no'} onChange={() => setStudentChatAdmin('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">ADMIN CAN CHAT WITHOUT INVITATION</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="adminChatNoInvite" value="yes" checked={adminChatNoInvite === 'yes'} onChange={() => setAdminChatNoInvite('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="adminChatNoInvite" value="no" checked={adminChatNoInvite === 'no'} onChange={() => setAdminChatNoInvite('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">OPEN CHAT SYSTEM</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="openChatSystem" value="yes" checked={openChatSystem === 'yes'} onChange={() => setOpenChatSystem('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="openChatSystem" value="no" checked={openChatSystem === 'no'} onChange={() => setOpenChatSystem('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm transition-colors cursor-pointer">UPDATE</button>
          </div>
        </div>
      </div>

      {/* Invitation Settings */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-sm font-bold text-zinc-950">Invitation Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">INVITATION REQUIREMENT</label>
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="invitationReq" value="required" checked={invitationReq === 'required'} onChange={() => setInvitationReq('required')} className="w-4 h-4 accent-zinc-950" /> Required
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="invitationReq" value="not_required" checked={invitationReq === 'not_required'} onChange={() => setInvitationReq('not_required')} className="w-4 h-4 accent-zinc-950" /> Not Required
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm transition-colors cursor-pointer">UPDATE</button>
          </div>
        </div>
      </div>

      {/* Generate Connections */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-sm font-bold text-zinc-950">Generate Connections</h2>
        </div>
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <span className="text-sm font-semibold text-zinc-800">GENERATE TEACHER AND STUDENT CONNECTION FOR OLD CLASS & SUBJECTS</span>
          <button className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0">GENERATE</button>
        </div>
      </div>

      {/* Permission Settings */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs mb-8">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-sm font-bold text-zinc-950">Permission Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">CAN UPLOAD FILE</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="canUploadFile" value="yes" checked={canUploadFile === 'yes'} onChange={() => setCanUploadFile('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="canUploadFile" value="no" checked={canUploadFile === 'no'} onChange={() => setCanUploadFile('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">UPLOAD FILE LIMIT (MB)</label>
            <input type="number" value={uploadLimit} onChange={(e) => setUploadLimit(e.target.value)} className="md:col-span-1 w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">STUDENT CAN MAKE GROUP</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="studentMakeGroup" value="yes" checked={studentMakeGroup === 'yes'} onChange={() => setStudentMakeGroup('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="studentMakeGroup" value="no" checked={studentMakeGroup === 'no'} onChange={() => setStudentMakeGroup('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">CAN STAFF OR TEACHER BAN STUDENT</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="staffBanStudent" value="yes" checked={staffBanStudent === 'yes'} onChange={() => setStaffBanStudent('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="staffBanStudent" value="no" checked={staffBanStudent === 'no'} onChange={() => setStaffBanStudent('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">STUDENT CAN ADD MEMBER</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="studentAddMember" value="yes" checked={studentAddMember === 'yes'} onChange={() => setStudentAddMember('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="studentAddMember" value="no" checked={studentAddMember === 'no'} onChange={() => setStudentAddMember('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">TEACHER OR STAFF CAN MAKE GROUP</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="teacherMakeGroup" value="yes" checked={teacherMakeGroup === 'yes'} onChange={() => setTeacherMakeGroup('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="teacherMakeGroup" value="no" checked={teacherMakeGroup === 'no'} onChange={() => setTeacherMakeGroup('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-2">TEACHER CAN PINNED TOP MESSAGE</label>
            <div className="md:col-span-1 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="teacherPinMessage" value="yes" checked={teacherPinMessage === 'yes'} onChange={() => setTeacherPinMessage('yes')} className="w-4 h-4 accent-zinc-950" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-900">
                <input type="radio" name="teacherPinMessage" value="no" checked={teacherPinMessage === 'no'} onChange={() => setTeacherPinMessage('no')} className="w-4 h-4 accent-zinc-950" /> No
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm transition-colors cursor-pointer">UPDATE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
