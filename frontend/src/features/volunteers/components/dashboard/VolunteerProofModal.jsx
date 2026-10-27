import React from "react";
import { X, Eye, Clock, Info } from "lucide-react";
import { buildFileUrl } from "@/shared/utils/fileUrl";

export default function VolunteerProofModal({ proofPath, onClose }) {
  if (!proofPath) return null;

  const isPdf = typeof proofPath === "string" && proofPath.toLowerCase().endsWith(".pdf");
  const fileUrl = buildFileUrl(proofPath);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Eye size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Proof Submission
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                View your submitted evidence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 cursor-pointer"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-dashed border-gray-300 shadow-inner">
            {isPdf ? (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    PDF Document
                  </p>
                  <p className="text-xs text-gray-500">
                    Your submitted PDF proof
                  </p>
                </div>

                <div className="w-full bg-white rounded-xl border border-gray-300 shadow-lg overflow-hidden">
                  <iframe
                    src={fileUrl}
                    title="Proof PDF"
                    className="w-full h-[500px]"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex flex-col items-center">
                  <p className="text-base font-semibold text-gray-900">
                    Image Proof
                  </p>
                  <p className="text-xs text-gray-500">
                    Your submitted image evidence
                  </p>
                </div>

                <div className="flex justify-center w-full">
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg bg-white max-w-2xl">
                    <img
                      src={fileUrl}
                      alt="Proof submission"
                      className="max-h-[500px] w-auto object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/600/400";
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Proof Info Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <Info size={14} className="text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-green-900">
                    Proof Status:
                  </p>
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-sm text-green-700 leading-relaxed">
                  This proof has been successfully submitted and verified by
                  the organization. Your contribution has been recorded and
                  points have been awarded.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-between items-center gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>Submitted on {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex gap-3">
            {!isPdf && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg font-medium shadow hover:shadow-md transition text-sm flex items-center gap-2"
              >
                <Eye size={16} />
                Open Original
              </a>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 rounded-lg font-medium shadow hover:shadow-md transition text-sm flex items-center gap-2 cursor-pointer"
            >
              <X size={16} />
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

