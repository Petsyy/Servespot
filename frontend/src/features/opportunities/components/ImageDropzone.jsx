import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { toast } from "react-toastify";

export default function ImageDropzone({ onFile }) {
  const [hover, setHover] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select only JPG, PNG, or JPEG files.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }

      onFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setHover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

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
        ${
          hover
            ? "border-emerald-500 bg-emerald-50/40"
            : "border-gray-200 bg-white hover:border-emerald-400 hover:bg-slate-50/50"
        }
      `}
    >
      {preview ? (
        <div className="relative w-full">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-44 object-cover rounded-xl border border-gray-200"
          />
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-xl p-1.5 shadow-sm border border-gray-200 cursor-pointer transition"
            aria-label="Remove image"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center text-gray-600">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <UploadCloud size={20} />
          </div>
          <p className="text-xs font-semibold text-gray-800">
            Click to upload or drag and drop
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            JPG, PNG, or JPEG up to 5MB
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
