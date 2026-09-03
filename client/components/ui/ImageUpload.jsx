"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export function ImageUpload({ label = "Upload Picture", currentImage, onUpload }) {
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentImage) setPreview(currentImage);
  }, [currentImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    if (onUpload) {
      onUpload(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onUpload) onUpload(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center overflow-hidden group">
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={handleClear}
                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <div className="text-zinc-400 flex flex-col items-center">
              <ImageIcon size={24} className="mb-1 opacity-50" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
          <label 
            htmlFor="image-upload" 
            className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
          >
            <Upload size={16} className="mr-2" />
            Choose Image
          </label>
          <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-wide">JPG, PNG or GIF (Max 2MB)</p>
        </div>
      </div>
    </div>
  );
}
