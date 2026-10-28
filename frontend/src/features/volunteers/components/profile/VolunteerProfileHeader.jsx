import React from "react";
import { Plus, Pencil, Check, X, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function VolunteerProfileHeader({
  profileIncomplete,
  isEditing,
  setIsEditing,
  saving,
  onSave,
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Volunteer Profile
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            View and update your personal details, preferences, and skills.
          </p>
        </div>

        {profileIncomplete && !isEditing ? (
          <button
            onClick={() => {
              setIsEditing(true);
              toast.info("Please complete your volunteer profile setup.");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition text-sm font-semibold shadow-xs cursor-pointer"
          >
            <Plus size={16} /> Setup Profile
          </button>
        ) : !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition text-sm font-semibold shadow-xs cursor-pointer"
          >
            <Pencil size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-60 text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <Check size={16} /> {saving ? "Saving..." : "Save Profile"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                if (profileIncomplete) {
                  toast.info(
                    "Please complete your profile setup to access all features."
                  );
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Setup Alert */}
      {profileIncomplete && (
        <div className="mb-6 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">
                Profile Setup Required
              </h3>
              <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                Please complete your volunteer profile to access all platform features.
                Required fields: Full Name, Contact Number, and Birthdate.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
