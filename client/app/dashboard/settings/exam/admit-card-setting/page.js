'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';

export default function AdmitCardSettingPage() {
  const [photo, setPhoto] = useState('Show');
  const [studentName, setStudentName] = useState('Show');
  const [fatherName, setFatherName] = useState('Show');
  const [admissionNo, setAdmissionNo] = useState('Show');
  const [classSection, setClassSection] = useState('Show');
  const [examName, setExamName] = useState('Show');
  const [academicYear, setAcademicYear] = useState('Show');
  const [schoolAddress, setSchoolAddress] = useState('Show');
  const [studentDownload, setStudentDownload] = useState('Yes');
  const [parentDownload, setParentDownload] = useState('Yes');
  const [studentNotification, setStudentNotification] = useState('Yes');
  const [parentNotification, setParentNotification] = useState('Yes');
  const [controllerSign, setControllerSign] = useState('Show');
  const [subTitle, setSubTitle] = useState('');
  const [description, setDescription] = useState('Rules to be followed by the candidates\n\nAdmit card must be collected before two days of the exam.\nCandidates should take their seats 15 minutes before starting of the exam.\nCandidates can use their own pen, pencil and scientific calculator in the exam hall.\nThe examination will be held on the specified date and time as per the pre-announced examination\'s routine.\nNo student will be allowed to enter the examination hall with any paper, books, mobile phone, except without admit card.');
  
  const fileRef = useRef(null);

  const RadioGroup = ({ label, value, options, onChange }) => (
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
      <div className="flex items-center gap-4">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name={label} checked={value === opt} onChange={() => onChange(opt)} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Admit Card Setting</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">Exam Plan</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Admit Card Setting</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200 text-sm font-medium text-gray-500">
          <button className="px-6 py-3 border-b-2 border-transparent hover:text-indigo-600 uppercase">SELECT A LAYOUT</button>
          <button className="px-6 py-3 border-b-2 border-transparent hover:text-indigo-600 uppercase">LAYOUT ONE</button>
          <button className="px-6 py-3 border-b-2 border-indigo-600 text-indigo-600 uppercase">LAYOUT TWO</button>
        </div>

        <div className="p-8">
          <h2 className="text-base font-semibold text-[#1f2937] mb-8">Layout Two Admit Card Setting</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
            <div>
              <RadioGroup label="STUDENT PHOTO" value={photo} options={['Show', 'Hide']} onChange={setPhoto} />
              <RadioGroup label="FATHER'S NAME" value={fatherName} options={['Show', 'Hide']} onChange={setFatherName} />
              <RadioGroup label="CLASS & SECTION" value={classSection} options={['Show', 'Hide']} onChange={setClassSection} />
              <RadioGroup label="ACADEMIC YEAR" value={academicYear} options={['Show', 'Hide']} onChange={setAcademicYear} />
              <RadioGroup label="STUDENT CAN DOWNLOAD" value={studentDownload} options={['Yes', 'No']} onChange={setStudentDownload} />
              <RadioGroup label="STUDENT NOTIFICATION" value={studentNotification} options={['Yes', 'No']} onChange={setStudentNotification} />
              <RadioGroup label="EXAM CONTROLLER SIGN" value={controllerSign} options={['Show', 'Hide']} onChange={setControllerSign} />
              
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 flex-1 truncate bg-white border border-gray-300 px-3 py-2.5 rounded">Exam Controller Sign</span>
                  <button type="button" onClick={() => fileRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded cursor-pointer transition-colors shadow-sm uppercase">BROWSE</button>
                  <input ref={fileRef} type="file" className="hidden" />
                </div>
              </div>
            </div>

            <div>
              <RadioGroup label="STUDENT NAME" value={studentName} options={['Show', 'Hide']} onChange={setStudentName} />
              <RadioGroup label="ADMISSION NO" value={admissionNo} options={['Show', 'Hide']} onChange={setAdmissionNo} />
              <RadioGroup label="EXAM NAME" value={examName} options={['Show', 'Hide']} onChange={setExamName} />
              <RadioGroup label="SCHOOL ADDRESS" value={schoolAddress} options={['Show', 'Hide']} onChange={setSchoolAddress} />
              <RadioGroup label="PARENT CAN DOWNLOAD" value={parentDownload} options={['Yes', 'No']} onChange={setParentDownload} />
              <RadioGroup label="PARENT NOTIFICATION" value={parentNotification} options={['Yes', 'No']} onChange={setParentNotification} />
              
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-700 uppercase block mb-2">ADMIT CARD SUB TITLE</label>
                <input type="text" value={subTitle} onChange={e => setSubTitle(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="text-xs font-bold text-gray-700 uppercase block mb-2">SHORT DESCRIPTION</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-3 text-gray-600">
                <button className="font-bold px-2 hover:bg-gray-200 rounded">B</button>
                <button className="italic px-2 hover:bg-gray-200 rounded">I</button>
                <button className="underline px-2 hover:bg-gray-200 rounded">U</button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button className="px-2 hover:bg-gray-200 rounded text-sm">Inter ?</button>
                <button className="px-2 hover:bg-gray-200 rounded text-sm">A ?</button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button className="px-2 hover:bg-gray-200 rounded">=</button>
                <button className="px-2 hover:bg-gray-200 rounded">equiv</button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button className="px-2 hover:bg-gray-200 rounded">??</button>
                <button className="px-2 hover:bg-gray-200 rounded">??</button>
                <button className="px-2 hover:bg-gray-200 rounded">&lt;/&gt;</button>
              </div>
              <textarea rows={8} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white text-gray-700 text-sm p-4 focus:outline-none focus:border-indigo-500 resize-none"></textarea>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-8 py-2.5 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">? UPDATE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
