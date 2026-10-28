import React, { useState, useEffect } from "react";
import {
  Search,
  UserCheck,
  Building2,
  Users,
  Eye,
  Trash2,
  CheckCircle2,
  X,
  Mail,
  Calendar,
  ClipboardList,
  ShieldCheck,
  Award,
  MoreVertical,
  UserX,
  CheckCircle,
  RotateCcw,
  Loader2,
  Shield,
  FileText,
} from "lucide-react";
import { useUserManagement } from "@/features/admin/hooks/useUserManagement";
import { toast } from "react-toastify";
import { buildFileUrl } from "@/shared/utils/fileUrl";
import DocumentViewerModal from "@/features/organizations/components/DocumentViewerModal";
import AdminSidebar from "@/shared/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/shared/components/layout/navbars/AdminNavbar";
import { getSession } from "@/shared/services/api";
import { useNavigate } from "react-router-dom";
import { getCookie } from "@/shared/utils/cookies";

const StatusBadge = ({ status }) => {
  const norm = String(status || "").toLowerCase();
  if (norm === "active") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
        Active
      </span>
    );
  }
  if (norm === "suspended") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/60">
        Suspended
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
      Pending
    </span>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, variant = "default", disabled = false }) => {
  const variantStyles = {
    default: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    view: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    verify: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs",
    suspend: "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60",
    reactivate: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${variantStyles[variant]}`}
      title={typeof label === "string" ? label : undefined}
    >
      <Icon size={13} />
      <span>{label}</span>
    </button>
  );
};

const ViewUserModal = ({ user, onClose, onOpenDocument }) => {
  const initials = (user.orgName || user.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200/80 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950 text-emerald-300 font-bold text-sm flex items-center justify-center border border-emerald-800/60">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight truncate max-w-[220px]">
                {user.orgName || user.fullName}
              </h2>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-slate-50/60 rounded-xl border border-gray-200/80 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-500">Account Role</span>
              <span className="font-bold text-gray-900 capitalize">{user.role}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
              <span className="font-semibold text-gray-500">Email Address</span>
              <span className="font-medium text-gray-800">{user.email}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
              <span className="font-semibold text-gray-500">Registration Date</span>
              <span className="font-medium text-gray-800">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
              <span className="font-semibold text-gray-500">Account Status</span>
              <StatusBadge status={user.status} />
            </div>

            {user.role === "organization" && user.document && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                <span className="font-semibold text-gray-500">Verification Doc</span>
                <button
                  type="button"
                  onClick={() => onOpenDocument(buildFileUrl(user.document))}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                >
                  View Attachment
                </button>
              </div>
            )}

            {user.role === "volunteer" && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                <span className="font-semibold text-gray-500">Completed Initiatives</span>
                <span className="font-bold text-gray-900">{user.completedTasks || 0}</span>
              </div>
            )}

            {user.status === "suspended" && user.suspensionReason && (
              <div className="border-t border-gray-100 pt-2.5 space-y-1">
                <span className="font-semibold text-rose-700">Suspension Notice</span>
                <p className="text-gray-700 font-medium">{user.suspensionReason}</p>
                {user.suspensionDate && (
                  <p className="text-[10px] text-gray-400">
                    Suspended on {new Date(user.suspensionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-100 bg-slate-50/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserManagement() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const adminId = getCookie("adminId") || "";
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [docUrl, setDocUrl] = useState(null);

  const {
    organizations,
    volunteers,
    allUsers,
    isLoading: loading,
    loadingUserId,
    handleVerifyOrganization,
    handleSuspendUser,
    handleReactivateUser,
  } = useUserManagement(adminId);

  const displayedUsers =
    activeTab === "all"
      ? allUsers
      : activeTab === "volunteers"
        ? volunteers
        : organizations;

  const filteredUsers = displayedUsers.filter((user) =>
    (user.orgName || user.fullName)
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1.5 border border-emerald-100">
                  <Shield size={12} className="text-emerald-600" />
                  <span>Access Control & Roster</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  User & Organization Management
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Supervise volunteer accounts, verify organizations, and enforce security policies.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none bg-white transition w-full sm:w-64"
                />
              </div>
            </div>

            {/* Segmented Controller Tabs */}
            <div className="p-1 bg-slate-200/60 rounded-xl inline-flex gap-1 border border-gray-200/80">
              {[
                { key: "all", label: "All Accounts", icon: Users, count: allUsers.length },
                { key: "volunteers", label: "Volunteers", icon: UserCheck, count: volunteers.length },
                { key: "organizations", label: "Organizations", icon: Building2, count: organizations.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-white text-emerald-950 shadow-xs border border-gray-200/50"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <tab.icon size={13} />
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* User Directory Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
              {loading ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-emerald-600 border-t-transparent mb-2"></div>
                  <p className="text-xs font-medium text-gray-500">Loading user directory…</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-gray-100 text-left">
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Name / Organization
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => {
                        const userInitials = (user.orgName || user.fullName || "U")
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <tr
                            key={user._id}
                            className="hover:bg-slate-50/60 transition"
                          >
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-800/40 shrink-0">
                                  {userInitials}
                                </div>
                                <span className="font-bold text-gray-900">
                                  {user.orgName || user.fullName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="font-semibold text-gray-600 capitalize">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-gray-600 font-medium">
                              {user.email}
                            </td>
                            <td className="px-6 py-3.5">
                              <StatusBadge status={user.status} />
                            </td>
                            <td className="px-6 py-3.5 text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex justify-end gap-1.5">
                                <ActionButton
                                  icon={Eye}
                                  label="View"
                                  variant="view"
                                  onClick={() => setSelectedUser(user)}
                                />

                                {user.role === "organization" && user.status === "pending" && (
                                  <ActionButton
                                    icon={CheckCircle}
                                    label={
                                      loadingUserId === user._id ? (
                                        <div className="flex items-center gap-1">
                                          <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                                          <span>Verifying…</span>
                                        </div>
                                      ) : (
                                        "Verify"
                                      )
                                    }
                                    variant="verify"
                                    onClick={() => handleVerifyOrganization(user)}
                                    disabled={loadingUserId === user._id}
                                  />
                                )}

                                {/* Suspend Button */}
                                {(user.status === "active" || user.status === "Active") && (
                                  <ActionButton
                                    icon={UserX}
                                    label={
                                      loadingUserId === user._id ? (
                                        <div className="flex items-center gap-1">
                                          <Loader2 className="animate-spin h-3.5 w-3.5 text-rose-700" />
                                          <span>Suspending…</span>
                                        </div>
                                      ) : (
                                        "Suspend"
                                      )
                                    }
                                    variant="suspend"
                                    onClick={() => handleSuspendUser(user)}
                                    disabled={loadingUserId === user._id}
                                  />
                                )}

                                {/* Reactivate Button */}
                                {user.status === "suspended" && (
                                  <ActionButton
                                    icon={RotateCcw}
                                    label={
                                      loadingUserId === user._id ? (
                                        <div className="flex items-center gap-1">
                                          <Loader2 className="animate-spin h-3.5 w-3.5 text-emerald-700" />
                                          <span>Reactivating…</span>
                                        </div>
                                      ) : (
                                        "Reactivate"
                                      )
                                    }
                                    variant="reactivate"
                                    onClick={() => handleReactivateUser(user)}
                                    disabled={loadingUserId === user._id}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-16">
                      <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-700">No records found</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {search
                          ? "Try adjusting your search terms"
                          : "No accounts in this category yet"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {selectedUser && (
        <ViewUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onOpenDocument={(url) => setDocUrl(url)}
        />
      )}

      {/* Document Viewer Modal */}
      {docUrl && (
        <DocumentViewerModal url={docUrl} onClose={() => setDocUrl(null)} />
      )}
    </div>
  );
}
