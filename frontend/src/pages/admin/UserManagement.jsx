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
} from "lucide-react";
import {
  getAllOrganizations,
  getAllVolunteers,
  updateOrganizationStatus,
  updateVolunteerStatus,
} from "@/services/admin.api";
import { toast } from "react-toastify";
import { socket, registerUserSocket } from "@/utils/socket";
import { buildFileUrl } from "@/utils/fileUrl";
import DocumentViewerModal from "@/components/organization-dashboard/modal/DocumentViewerModal";
import AdminSidebar from "@/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/components/layout/navbars/AdminNavbar";
import {
  confirmVerification,
  confirmSuspension,
  confirmReactivation,
} from "@/utils/swalAlerts";

/* ---------------------------------------------
   STATUS BADGE
--------------------------------------------- */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Active: { color: "bg-green-100 text-green-700", label: "Active" },
    Pending: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    Suspended: { color: "bg-red-100 text-red-700", label: "Suspended" },
  };
  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};

/* ---------------------------------------------
   ACTION BUTTON COMPONENT
--------------------------------------------- */
const ActionButton = ({ icon: Icon, label, onClick, variant = "default" }) => {
  const variantStyles = {
    default: "bg-gray-50 text-gray-700 hover:bg-gray-100",
    view: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    verify: "bg-green-50 text-green-700 hover:bg-green-100",
    suspend: "bg-red-50 text-red-700 hover:bg-red-100",
    reactivate: "bg-green-50 text-green-700 hover:bg-green-100",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${variantStyles[variant]}`}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

/* ---------------------------------------------
   VIEW MODAL
--------------------------------------------- */
const ViewUserModal = ({ user, onClose, onOpenDocument }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {user.role === "organization" ? (
              <Building2 className="h-6 w-6 text-blue-600" />
            ) : (
              <UserCheck className="h-6 w-6 text-green-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {user.orgName || user.fullName}
            </h2>
            <p className="text-sm text-gray-600 capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 text-gray-700">
          <Mail className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-700">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Joined Date</p>
            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-700">
          <ClipboardList className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <StatusBadge
              status={
                !user.status
                  ? "Pending"
                  : user.status === "pending"
                    ? "Pending"
                    : user.status.charAt(0).toUpperCase() + user.status.slice(1)
              }
            />
          </div>
        </div>

        {user.role === "organization" && user.document && (
          <div className="flex items-center gap-3 text-gray-700">
            <ShieldCheck className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Verification Document</p>
              <button
                type="button"
                onClick={() => onOpenDocument(buildFileUrl(user.document))}
                className="text-blue-600 hover:text-blue-700 underline font-medium transition-colors"
              >
                View Uploaded Document
              </button>
            </div>
          </div>
        )}

        {user.role === "volunteer" && (
          <div className="flex items-center gap-3 text-gray-700">
            <Award className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Completed Tasks</p>
              <p className="font-medium">{user.completedTasks || 0}</p>
            </div>
          </div>
        )}

        {/* Show suspension info if suspended */}
        {user.status === "suspended" && user.suspensionReason && (
          <div className="flex items-start gap-3 text-gray-700">
            <UserX className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Suspension Reason</p>
              <p className="font-medium">{user.suspensionReason}</p>
              {user.suspensionDate && (
                <p className="text-xs text-gray-400 mt-1">
                  Suspended on:{" "}
                  {new Date(user.suspensionDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

/* ---------------------------------------------
   MAIN COMPONENT
--------------------------------------------- */
export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [docUrl, setDocUrl] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  /* -----------------------------
     FETCH DATA
  ----------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, volRes] = await Promise.all([
          getAllOrganizations(),
          getAllVolunteers(),
        ]);
        const orgs = Array.isArray(orgRes.data)
          ? orgRes.data
          : orgRes.data.organizations;
        const vols = Array.isArray(volRes.data)
          ? volRes.data
          : volRes.data.volunteers;

        // Add role field to each type for display consistency
        setOrganizations(
          (orgs || []).map((o) => ({ ...o, role: "organization" }))
        );
        setVolunteers((vols || []).map((v) => ({ ...v, role: "volunteer" })));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const adminId = localStorage.getItem("adminId") || "defaultAdmin";
    registerUserSocket(adminId, "admin");

    // Volunteer status updates
    socket.on("volunteerStatusUpdated", ({ userId, status }) => {
      setVolunteers((prev) =>
        prev.map((v) => (v._id === userId ? { ...v, status } : v))
      );

      const toastId = `vol-status-${userId}-${status}`;
      if (!toast.isActive(toastId)) {
        toast.info(`Volunteer status updated: ${status}`, { toastId });
      }
    });

    // Organization status updates
    socket.on("organizationStatusUpdated", ({ orgId, status }) => {
      setOrganizations((prev) =>
        prev.map((o) => (o._id === orgId ? { ...o, status } : o))
      );
    });

    // ✅ Cleanup to avoid duplicate listeners
    return () => {
      socket.off("volunteerStatusUpdated");
      socket.off("organizationStatusUpdated");
    };
  }, []);

  /* -----------------------------
     SWEETALERT2 HANDLERS
  ----------------------------- */
  const handleVerifyOrganization = async (user) => {
    const confirmed = await confirmVerification(user.orgName);
    if (!confirmed) return;

    try {
      await updateOrganizationStatus(user._id, "active");

      const toastId = `verify-${user._id}`;
      if (!toast.isActive(toastId)) {
        toast.success(`${user.orgName} has been verified successfully!`, {
          toastId,
        });
      }

      // Refresh organizations data
      const updated = await getAllOrganizations();
      const orgs = Array.isArray(updated.data)
        ? updated.data
        : updated.data.organizations;
      setOrganizations(
        (orgs || []).map((o) => ({ ...o, role: "organization" }))
      );
    } catch (error) {
      toast.error("Failed to verify organization");
    }
  };

  const handleSuspendUser = async (user) => {
    if (loadingUserId) return;

    const userType =
      user.role === "organization" ? "Organization" : "Volunteer";
    const userName = user.orgName || user.fullName;

    const confirmed = await confirmSuspension(userType, userName);
    if (!confirmed) return;

    setLoadingUserId(user._id);

    try {
      if (user.role === "organization") {
        await updateOrganizationStatus(user._id, "suspended");
        const toastId = `suspend-org-${user._id}`;
        if (!toast.isActive(toastId)) {
          toast.info(`${user.orgName} has been suspended.`, { toastId });
        }
        setOrganizations((prev) =>
          prev.map((o) =>
            o._id === user._id ? { ...o, status: "suspended" } : o
          )
        );
      } else {
        await updateVolunteerStatus(user._id, "suspended");
        const toastId = `suspend-vol-${user._id}`;
        if (!toast.isActive(toastId)) {
          toast.info(`${user.fullName} has been suspended.`, { toastId });
        }
        setVolunteers((prev) =>
          prev.map((v) =>
            v._id === user._id ? { ...v, status: "suspended" } : v
          )
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to suspend ${user.role}`);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleReactivateUser = async (user) => {
    if (loadingUserId) return;

    const userType =
      user.role === "organization" ? "Organization" : "Volunteer";
    const userName = user.orgName || user.fullName;

    const confirmed = await confirmReactivation(userType, userName);
    if (!confirmed) return;

    setLoadingUserId(user._id);

    try {
      if (user.role === "organization") {
        await updateOrganizationStatus(user._id, "active");
        const toastId = `reactivate-org-${user._id}`;
        if (!toast.isActive(toastId)) {
          toast.success(`${user.orgName} has been reactivated successfully!`, {
            toastId,
          });
        }
        setOrganizations((prev) =>
          prev.map((o) => (o._id === user._id ? { ...o, status: "active" } : o))
        );
      } else {
        await updateVolunteerStatus(user._id, "active");
        const toastId = `reactivate-vol-${user._id}`;
        if (!toast.isActive(toastId)) {
          toast.success(`${user.fullName} has been reactivated successfully!`, {
            toastId,
          });
        }
        setVolunteers((prev) =>
          prev.map((v) => (v._id === user._id ? { ...v, status: "active" } : v))
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to reactivate ${user.role}`);
    } finally {
      setLoadingUserId(null);
    }
  };
  /* -----------------------------
     FILTERED VIEW
  ----------------------------- */
  const allUsers = [...volunteers, ...organizations];

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

  /* -----------------------------
     RENDER
  ----------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6">
          {/* HEADER */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage volunteers and organizations
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors w-full lg:w-64"
              />
            </div>
          </div>

          {/* TABS */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: "all", label: "All", icon: Users },
              { key: "volunteers", label: "Volunteers", icon: UserCheck },
              { key: "organizations", label: "Organizations", icon: Building2 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all font-medium ${
                  activeTab === tab.key
                    ? "bg-green-600 text-white border-green-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Loading users...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name / Organization
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date Joined
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {user.orgName || user.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={
                              !user.status
                                ? "Pending"
                                : user.status === "pending"
                                  ? "Pending"
                                  : user.status.charAt(0).toUpperCase() +
                                    user.status.slice(1)
                            }
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <ActionButton
                              icon={Eye}
                              label="View"
                              variant="view"
                              onClick={() => setSelectedUser(user)}
                            />

                            {/* Verify Button - Only for pending organizations */}
                            {user.role === "organization" &&
                              user.status === "pending" && (
                                <ActionButton
                                  icon={CheckCircle}
                                  label="Verify"
                                  variant="verify"
                                  onClick={() => handleVerifyOrganization(user)}
                                />
                              )}

                            {/* Suspend Button */}
                            {(user.role === "organization" &&
                              user.status === "active") ||
                            (user.role === "volunteer" &&
                              user.status === "active") ? (
                              <ActionButton
                                icon={UserX}
                                label={
                                  loadingUserId === user._id ? (
                                    <div className="flex items-center gap-1">
                                      <svg
                                        className="animate-spin h-4 w-4 text-red-700"
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
                                      Processing…
                                    </div>
                                  ) : (
                                    "Suspend"
                                  )
                                }
                                variant="suspend"
                                onClick={() => handleSuspendUser(user)}
                                disabled={loadingUserId === user._id}
                              />
                            ) : null}

                            {/* Reactivate Button */}
                            {user.status === "suspended" && (
                              <ActionButton
                                icon={RotateCcw}
                                label={
                                  loadingUserId === user._id ? (
                                    <div className="flex items-center gap-1">
                                      <svg
                                        className="animate-spin h-4 w-4 text-green-700"
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
                                      Processing…
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
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">No users found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {search
                        ? "Try adjusting your search terms"
                        : "No records available yet"}
                    </p>
                  </div>
                )}
              </div>
            )}
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
