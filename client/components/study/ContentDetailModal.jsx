'use client';

import React from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  Calendar, 
  Users, 
  BookOpen, 
  Layers, 
  Award, 
  Clock, 
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';

export default function ContentDetailModal({ item, onClose, onDownloadSuccess }) {
  if (!item) return null;

  const handleDownload = async () => {
    try {
      if (item._id) {
        await api.post(`/study-material/${item._id}/download`);
        if (onDownloadSuccess) onDownloadSuccess(item._id);
      }
    } catch (e) {
      console.error('Download count increment failed:', e);
    }

    if (item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName || `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (item.sourceUrl) {
      window.open(item.sourceUrl, '_blank');
    }
  };

  const isPdf = item.fileName?.toLowerCase().endsWith('.pdf') || item.fileUrl?.startsWith('data:application/pdf');
  const isImage = item.fileUrl?.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(item.fileName || '');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-50 to-emerald-50/40 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
              item.contentType === 'Assignment' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
              item.contentType === 'Syllabus' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
              'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {item.contentType}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              item.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              item.status === 'Draft' ? 'bg-zinc-100 text-zinc-700 border border-zinc-300' :
              'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {item.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-950">{item.title}</h2>
            {item.category && item.category !== 'General' && (
              <span className="inline-block mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {item.category}
              </span>
            )}
          </div>

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
            <div>
              <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Academic Program</div>
              <div className="text-zinc-950 font-bold mt-0.5">{item.className || 'All Classes'}</div>
            </div>
            <div>
              <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Section</div>
              <div className="text-zinc-950 font-bold mt-0.5">{item.section ? `Section ${item.section}` : 'All Sections'}</div>
            </div>
            <div>
              <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Subject Area</div>
              <div className="text-zinc-950 font-bold mt-0.5">{item.subject || 'General'}</div>
            </div>
            <div>
              <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Publish Date</div>
              <div className="text-zinc-950 font-semibold mt-0.5">{formatDateDMY(item.publishDate)}</div>
            </div>
            {item.dueDate && (
              <div>
                <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Due Date</div>
                <div className={`font-bold mt-0.5 ${new Date(item.dueDate) < new Date() ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatDateDMY(item.dueDate)} {new Date(item.dueDate) < new Date() ? '(Past Due)' : '(Active)'}
                </div>
              </div>
            )}
            {item.totalMarks !== undefined && item.contentType === 'Assignment' && (
              <div>
                <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Marks Allocation</div>
                <div className="text-zinc-950 font-bold mt-0.5">{item.totalMarks} Total (Pass: {item.passingMarks || Math.round(item.totalMarks * 0.5)})</div>
              </div>
            )}
            {item.version && item.contentType === 'Syllabus' && (
              <div>
                <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Curriculum Version</div>
                <div className="text-zinc-950 font-bold mt-0.5">v{item.version}</div>
              </div>
            )}
            <div>
              <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Available For</div>
              <div className="text-zinc-950 font-semibold mt-0.5">{item.availableFor || 'Student'}</div>
            </div>
            <div>
              <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Downloads Count</div>
              <div className="text-zinc-950 font-bold mt-0.5">{item.downloadsCount || 0} times</div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Instructions & Description</h3>
              <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50/70 p-3.5 rounded-lg border border-zinc-200">
                {item.description}
              </p>
            </div>
          )}

          {/* Document Preview Box */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Attached Document</h3>
            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
              <div className="p-3 bg-zinc-100/80 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <FileText className="w-4 h-4 text-[#009966]" />
                  <span>{item.fileName || 'Attachment Document'}</span>
                  {item.fileSize && <span className="text-zinc-500 font-normal">({item.fileSize})</span>}
                </div>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="bg-[#009966] hover:bg-[#007a52] text-white font-bold h-7 text-xs px-3 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download
                </Button>
              </div>

              {/* In-Modal Preview */}
              {item.fileUrl && (
                <div className="p-2 flex justify-center bg-zinc-200/40">
                  {isPdf ? (
                    <iframe 
                      src={item.fileUrl} 
                      className="w-full h-80 rounded border border-zinc-300 bg-white"
                      title="PDF Preview"
                    />
                  ) : isImage ? (
                    <img 
                      src={item.fileUrl} 
                      alt="Material Preview" 
                      className="max-h-72 rounded object-contain border border-zinc-300 bg-white"
                    />
                  ) : (
                    <div className="py-8 text-center text-xs text-zinc-600">
                      File ready for download ({item.fileName || 'Document'})
                    </div>
                  )}
                </div>
              )}

              {item.sourceUrl && (
                <div className="p-3 bg-white border-t border-zinc-200 flex items-center justify-between text-xs">
                  <span className="text-zinc-600 font-medium truncate max-w-md">Source: {item.sourceUrl}</span>
                  <a 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#009966] hover:underline"
                  >
                    Open Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Uploaded by: <span className="font-semibold text-zinc-800">{item.uploaderName || 'Faculty'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-100"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="bg-[#009966] hover:bg-[#007a52] text-white font-bold text-xs shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
