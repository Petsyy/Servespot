import React, { useState } from "react";
import { X, UploadCloud, CheckCircle2, FileCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useSubmitOpportunityProof } from "@/features/opportunities/hooks/useOpportunities";

export default function ProofUploadModal({
  opportunityId,
  onClose,
  onProofSubmitted,
}) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const submitProofMutation = useSubmitOpportunityProof();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return toast.warning("Please upload an image or PDF document as proof.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", message);

    submitProofMutation.mutate(
      { opportunityId, formData },
      {
        onSuccess: () => {
          if (onProofSubmitted) onProofSubmitted();
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200/80 animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-700 shadow-xs">
            <UploadCloud size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Submit Completion Proof
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Upload an image or document verifying you finished this volunteering task.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-emerald-300/80 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-2xl p-5 text-center transition cursor-pointer">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <FileCheck size={20} />
                  </div>
                  <span className="font-semibold text-emerald-900 text-xs truncate max-w-[280px]">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-emerald-700">Click to change file</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud size={28} className="mx-auto text-emerald-600 mb-1" />
                  <p className="text-xs font-semibold text-gray-700">
                    Click to select file or drag here
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Supports PNG, JPG, or PDF (Max 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Volunteer Note (Optional)
            </label>
            <textarea
              placeholder="Add details about your accomplishment or role..."
              className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition resize-none"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitProofMutation.isPending}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {submitProofMutation.isPending ? (
                <>
                  <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Submit Proof</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
