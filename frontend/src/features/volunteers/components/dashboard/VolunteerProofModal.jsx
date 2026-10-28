import React from "react";
import { X, Eye, Clock, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import { buildFileUrl } from "@/shared/utils/fileUrl";

export default function VolunteerProofModal({ proofPath, onClose }) {
  if (!proofPath) return null;

  const isPdf = typeof proofPath === "string" && proofPath.toLowerCase().endsWith(".pdf");
  const fileUrl = buildFileUrl(proofPath);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200/80 animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Eye size={20} className="text-emerald-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Proof Submission
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View your submitted completion evidence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-200/80">
            {isPdf ? (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mb-2">
                    <FileText className="w-7 h-7 text-sky-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    PDF Verification Document
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted document preview
                  </p>
                </div>

                <div className="w-full bg-white rounded-xl border border-gray-300/80 shadow-xs overflow-hidden">
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
                <div className="flex justify-center w-full">
                  <div className="rounded-xl overflow-hidden border border-gray-200 shadow-xs bg-white max-w-2xl">
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

          {/* Proof Info Status Card */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-emerald-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-emerald-950">
                    Proof Status
                  </p>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200/60 text-xs font-semibold rounded-full">
                    Verified & Recorded
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  This task proof has been successfully submitted and approved. Your volunteer hours and milestone points have been credited to your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-between items-center gap-3 p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Clock size={14} className="text-gray-400" />
            <span>Submission recorded in database</span>
          </div>
          <div className="flex items-center gap-2.5">
            {!isPdf && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink size={14} />
                Open Original
              </a>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
