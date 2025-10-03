import React, { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react"; // upload + cancel icons

export default function ImageDropzone({ onFile }) {
  const [hover, setHover] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file) {
      onFile(file);
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null); // PDFs won't preview
      }
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
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
        className={`w-full h-40 rounded-lg border-2 border-dashed flex items-center justify-center relative cursor-pointer transition ${
          hover ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1 shadow"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600">
            <Upload size={22} className="mb-1" />
            <span className="text-sm">Click to upload image or flyer</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={onPick}
        />
      </div>
    </div>
  );
}
