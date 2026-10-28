import React from "react";
import { Plus, Pencil, Check, X, AlertCircle, Building2 } from "lucide-react";
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Organization Profile
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your organization's public identity, leadership contacts, and operational reach.
          </p>
        </div>

        {profileIncomplete && !isEditing ? (
          <button
            onClick={() => {
              setIsEditing(true);
              toast.info("Please complete your organization profile setup.");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-xs rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus size={16} /> Setup Profile
          </button>
        ) : !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition shadow-xs cursor-pointer"
          >
            <Pencil size={15} /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-xl disabled:opacity-60 shadow-xs transition cursor-pointer"
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              <X size={15} /> Cancel
            </button>
          </div>
        )}
      </div>

      {profileIncomplete && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900 tracking-tight">
                Profile Setup Required
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                Please complete your organization profile to unlock verified status and public opportunity listings.
                Required fields: Organization Name, Contact Person, and Contact Number.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
