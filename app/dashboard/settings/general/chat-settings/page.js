'use client';
import React, { useState } from 'react';

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
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 font-sans space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Chat Settings</h1>
        <div className="text-sm text-zinc-400">Dashboard &gt; General Settings &gt; Chat Settings</div>
      </div>

      {/* Chatting Method Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-medium text-white">Chatting Method Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-1">CHAT SETTINGS</label>
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="chatMethod" value="pusher" checked={chatMethod === 'pusher'} onChange={() => setChatMethod('pusher')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" />
                <span>Pusher</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="chatMethod" value="jquery" checked={chatMethod === 'jquery'} onChange={() => setChatMethod('jquery')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" />
                <span>jQuery</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-1">PUSHER APP ID</label>
            <input type="text" value={pusherAppId} onChange={(e) => setPusherAppId(e.target.value)} className="md:col-span-2 w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-1">PUSHER APP KEY</label>
            <input type="text" value={pusherAppKey} onChange={(e) => setPusherAppKey(e.target.value)} className="md:col-span-2 w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-1">PUSHER APP SECRET</label>
            <input type="password" value={pusherAppSecret} onChange={(e) => setPusherAppSecret(e.target.value)} className="md:col-span-2 w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-1">PUSHER APP CLUSTER</label>
            <input type="text" value={pusherAppCluster} onChange={(e) => setPusherAppCluster(e.target.value)} className="md:col-span-2 w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="flex justify-end">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded transition-colors">UPDATE</button>
          </div>
        </div>
      </div>

      {/* Chat Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-medium text-white">Chat Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">CAN TEACHER CHAT WITH PARENTS</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teacherChatParent" value="yes" checked={teacherChatParent === 'yes'} onChange={() => setTeacherChatParent('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teacherChatParent" value="no" checked={teacherChatParent === 'no'} onChange={() => setTeacherChatParent('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">CAN STUDENT CHAT WITH ADMIN ACCOUNTS</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="studentChatAdmin" value="yes" checked={studentChatAdmin === 'yes'} onChange={() => setStudentChatAdmin('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="studentChatAdmin" value="no" checked={studentChatAdmin === 'no'} onChange={() => setStudentChatAdmin('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">ADMIN CAN CHAT WITHOUT INVITATION</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="adminChatNoInvite" value="yes" checked={adminChatNoInvite === 'yes'} onChange={() => setAdminChatNoInvite('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="adminChatNoInvite" value="no" checked={adminChatNoInvite === 'no'} onChange={() => setAdminChatNoInvite('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">OPEN CHAT SYSTEM</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="openChatSystem" value="yes" checked={openChatSystem === 'yes'} onChange={() => setOpenChatSystem('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="openChatSystem" value="no" checked={openChatSystem === 'no'} onChange={() => setOpenChatSystem('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded transition-colors">UPDATE</button>
          </div>
        </div>
      </div>

      {/* Invitation Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-medium text-white">Invitation Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-1">INVITATION REQUIREMENT</label>
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="invitationReq" value="required" checked={invitationReq === 'required'} onChange={() => setInvitationReq('required')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Required
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="invitationReq" value="not_required" checked={invitationReq === 'not_required'} onChange={() => setInvitationReq('not_required')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Not Required
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded transition-colors">UPDATE</button>
          </div>
        </div>
      </div>

      {/* Generate Connections */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-medium text-white">Generate Connections</h2>
        </div>
        <div className="p-6 flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-300">GENERATE TEACHER AND STUDENT CONNECTION FOR OLD CLASS & SUBJECTS</span>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded transition-colors">GENERATE</button>
        </div>
      </div>

      {/* Permission Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm mb-8">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-medium text-white">Permission Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">CAN UPLOAD FILE</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="canUploadFile" value="yes" checked={canUploadFile === 'yes'} onChange={() => setCanUploadFile('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="canUploadFile" value="no" checked={canUploadFile === 'no'} onChange={() => setCanUploadFile('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">UPLOAD FILE LIMIT (MB)</label>
            <input type="number" value={uploadLimit} onChange={(e) => setUploadLimit(e.target.value)} className="md:col-span-1 w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">STUDENT CAN MAKE GROUP</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="studentMakeGroup" value="yes" checked={studentMakeGroup === 'yes'} onChange={() => setStudentMakeGroup('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="studentMakeGroup" value="no" checked={studentMakeGroup === 'no'} onChange={() => setStudentMakeGroup('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">CAN STAFF OR TEACHER BAN STUDENT</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="staffBanStudent" value="yes" checked={staffBanStudent === 'yes'} onChange={() => setStaffBanStudent('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="staffBanStudent" value="no" checked={staffBanStudent === 'no'} onChange={() => setStaffBanStudent('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">STUDENT CAN ADD MEMBER</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="studentAddMember" value="yes" checked={studentAddMember === 'yes'} onChange={() => setStudentAddMember('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="studentAddMember" value="no" checked={studentAddMember === 'no'} onChange={() => setStudentAddMember('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">TEACHER OR STAFF CAN MAKE GROUP</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teacherMakeGroup" value="yes" checked={teacherMakeGroup === 'yes'} onChange={() => setTeacherMakeGroup('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teacherMakeGroup" value="no" checked={teacherMakeGroup === 'no'} onChange={() => setTeacherMakeGroup('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-300 md:col-span-2">TEACHER CAN PINNED TOP MESSAGE</label>
            <div className="md:col-span-1 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teacherPinMessage" value="yes" checked={teacherPinMessage === 'yes'} onChange={() => setTeacherPinMessage('yes')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teacherPinMessage" value="no" checked={teacherPinMessage === 'no'} onChange={() => setTeacherPinMessage('no')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" /> No
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded transition-colors">UPDATE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
