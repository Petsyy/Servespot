import React, { useState } from "react";
import { X, UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ProofUploadModal({ opportunityId, onClose, onProofSubmitted }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.warning("Please upload an image as proof.");

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("message", message);

      const token = localStorage.getItem("volToken"); // assuming token from login

      const res = await axios.post(`${API_BASE}/api/opportunities/${opportunityId}/proof`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message || "Proof submitted!");
      // Trigger parent component to refresh proof status
      if (onProofSubmitted) {
        onProofSubmitted();
      }
      onClose();
    } catch (err) {
      console.error("❌ Proof upload failed:", err);
      toast.error(err.response?.data?.message || "Failed to submit proof");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
          Submit Proof of Completion
        </h2>
        <p className="text-gray-600 text-sm text-center mb-4">
          Upload a photo or document to show that you finished this task.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <UploadCloud size={32} className="mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-gray-600">
                {file ? (
                  <span className="font-medium text-green-600">{file.name}</span>
                ) : (
                  "Click to upload or drag file here"
                )}
              </p>
            </label>
          </div>

          {/* Message */}
          <textarea
            placeholder="Add a note (optional)"
            className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
            rows="3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-1"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Submit Proof
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
