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
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Volunteer Profile
          </h1>
          <p className="text-gray-600 text-sm">
            View and update your personal details, preferences, and skills.
          </p>
        </div>

        {profileIncomplete && !isEditing ? (
          <button
            onClick={() => {
              setIsEditing(true);
              toast.info("Please complete your volunteer profile setup.");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus size={16} /> Setup Profile
          </button>
        ) : !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm shadow-sm hover:shadow-md cursor-pointer"
          >
            <Pencil size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm shadow-sm hover:shadow-md transition cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition cursor-pointer"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Setup Alert */}
      {profileIncomplete && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-orange-500 shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-orange-800 text-sm">
                Profile Setup Required
              </h3>
              <p className="text-orange-700 text-xs">
                Please complete your volunteer profile to access all features.
                Required fields: Full Name, Contact Number, and Birthdate.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

