import React from "react";
import { X, Download, FileText, Image } from "lucide-react";

export default function DocumentViewerModal({ url, onClose }) {
  if (!url) return null;

  // Extract filename and extension
  const filename = url.split('/').pop() || 'document';
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  // Supported file types
  const isPDF = extension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png'].includes(extension);
  const isWord = extension === 'docx';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            {isPDF ? (
              <FileText className="h-5 w-5 text-red-500" />
            ) : isImage ? (
              <Image className="h-5 w-5 text-blue-500" />
            ) : (
              <FileText className="h-5 w-5 text-gray-500" />
            )}
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">
                {isPDF ? 'PDF Document' : 
                 isImage ? 'Image Document' : 
                 isWord ? 'Word Document' : 'Document'}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-xs">
                {filename}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download={filename}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 bg-gray-50">
          {isPDF ? (
            <iframe
              title="Organization Document"
              src={url}
              className="w-full h-full min-h-[60vh] rounded-md border border-gray-300 bg-white"
            />
          ) : isImage ? (
            <div className="w-full h-full min-h-[60vh] overflow-auto flex items-center justify-center bg-white rounded-md border border-gray-300">
              <img
                src={url}
                alt="Uploaded document"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="h-full min-h-[60vh] flex items-center justify-center text-center p-8 bg-white rounded-md border border-gray-300">
              <div>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Document Preview
                </h4>
                <p className="text-gray-600 mb-4 max-w-md">
                  {isWord 
                    ? "Word documents (.docx) cannot be previewed in the browser. Please download the file to view it."
                    : "This file type cannot be previewed in the browser."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={url}
                    download={filename}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </a>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}