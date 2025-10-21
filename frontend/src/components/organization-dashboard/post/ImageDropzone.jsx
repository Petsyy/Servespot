import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { toast } from "react-toastify";

export default function ImageDropzone({ onFile }) {
  const [hover, setHover] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png"];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select only JPG, PNG, or JPEG files.");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }

      onFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setHover(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    []
  );

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setPreview(null);
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      className={`w-full rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center p-6 cursor-pointer
        ${hover ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}
      `}
    >
      {preview ? (
        <div className="relative w-full">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1 shadow-sm"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center text-gray-600">
          <UploadCloud size={32} className="text-blue-500 mb-2" />
          <p className="text-sm font-medium">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, JPEG files only (Max 5MB)
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}