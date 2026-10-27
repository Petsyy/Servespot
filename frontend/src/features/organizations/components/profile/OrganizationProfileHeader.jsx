import React from "react";
import { Plus, Pencil, Check, X, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function OrganizationProfileHeader({
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
            Organization Profile
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your organization's information and public details.
          </p>
        </div>

        {profileIncomplete && !isEditing ? (
          <button
            onClick={() => {
              setIsEditing(true);
              toast.info("Please complete your organization profile setup.");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus size={18} /> Setup Profile
          </button>
        ) : !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm hover:shadow-md cursor-pointer"
          >
            <Pencil size={18} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <Check size={18} /> {saving ? "Saving..." : "Save Profile"}
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        )}
      </div>

      {profileIncomplete && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-orange-500 shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-orange-800">
                Profile Setup Required
              </h3>
              <p className="text-orange-700 text-sm">
                Please complete your organization profile to access all features.
                Required fields: Organization Name, Contact Person, and Contact Number.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

