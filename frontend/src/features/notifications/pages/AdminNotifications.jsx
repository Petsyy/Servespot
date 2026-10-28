import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Mail,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Building2,
  Shield,
  ExternalLink,
} from "lucide-react";
import AdminSidebar from "@/shared/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/shared/components/layout/navbars/AdminNavbar";
import { getSession } from "@/shared/services/api";
import { useRoleNotifications } from "@/features/notifications/hooks/useRoleNotifications";
import { useNavigate, Link } from "react-router-dom";
import { getCookie, setCookie } from "@/shared/utils/cookies";

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inApp");
  const [filter, setFilter] = useState("All");
  const [adminId, setAdminId] = useState(() => getCookie("adminId") || null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSession();
        if (res.data?.user?.role !== "admin") {
          navigate("/admin/login");
          return;
        }

        const id = res.data?.user?.id;
        if (!id) {
          navigate("/admin/login");
          return;
        }

        setAdminId(id);
        setCookie("adminId", id);
      } catch {
        navigate("/admin/login");
      }
    })();
  }, [navigate]);

  const {
    inAppList,
    emailList,
    isLoading: loading,
    markAllAsRead,
  } = useRoleNotifications({ role: "admin", userId: adminId });

  // Filter by System / Organization Events / Volunteer Events / All
  const currentList = useMemo(() => {
    const src = activeTab === "inApp" ? inAppList : emailList;
    if (filter === "All") return src;

    return src.filter((n) => {
      if (filter === "System") {
        return ["maintenance", "security", "system"].includes(n.type);
      }
      if (filter === "Organization Events") {
        const orgTypes = [
          "organization_signup",
          "organization_verification",
          "organization_suspension",
          "organization_reactivation",
          "organization_deleted",
          "opportunity_posted",
          "org_signup",
          "org_verification",
          "org_suspension",
          "org_reactivation",
          "org_deleted",
          "new_opportunity",
          "opportunity_created",
        ];
        return (
          orgTypes.includes(n.type) ||
          (n.type && n.type.toLowerCase().includes("organization")) ||
          (n.type && n.type.toLowerCase().includes("org")) ||
          (n.type && n.type.toLowerCase().includes("opportunity"))
        );
      }
      if (filter === "Volunteer Events") {
        const volunteerTypes = [
          "volunteer_signup",
          "volunteer_suspension",
          "volunteer_reactivation",
          "volunteer_completion",
          "vol_signup",
          "vol_suspension",
          "vol_reactivation",
          "vol_completion",
          "user_registration",
          "user_suspension",
          "user_reactivation",
        ];
        return (
          volunteerTypes.includes(n.type) ||
          (n.type && n.type.toLowerCase().includes("volunteer")) ||
          (n.type && n.type.toLowerCase().includes("vol"))
        );
      }
      return true;
    });
  }, [activeTab, filter, inAppList, emailList]);

  const unreadInAppCount = useMemo(
    () => inAppList.filter((n) => !n.isRead).length,
    [inAppList]
  );
  const unreadEmailCount = useMemo(
    () => emailList.filter((n) => !n.isRead).length,
    [emailList]
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case "email":
        return <Mail size={16} className="text-emerald-700" />;
      case "organization_signup":
      case "org_signup":
        return <Building2 size={16} className="text-sky-600" />;
      case "organization_verification":
      case "org_verification":
        return <CheckCircle size={16} className="text-emerald-600" />;
      case "organization_suspension":
      case "org_suspension":
      case "user_suspension":
        return <AlertCircle size={16} className="text-rose-600" />;
      case "organization_reactivation":
      case "user_reactivation":
        return <CheckCircle size={16} className="text-teal-600" />;
      case "volunteer_signup":
      case "vol_signup":
        return <Users size={16} className="text-emerald-600" />;
      case "volunteer_completion":
        return <CheckCircle size={16} className="text-emerald-600" />;
      case "maintenance":
      case "security":
      case "system":
        return <Shield size={16} className="text-amber-600" />;
      default:
        return <Bell size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1.5 border border-emerald-100">
                  <Bell size={12} className="text-emerald-600" />
                  <span>Administrative Feed</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  System Notifications & Broadcasts
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Platform activity telemetry, organization verifications, and compliance alerts.
                </p>
              </div>

              {/* Filter + Mark all */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={markAllAsRead}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition shadow-xs cursor-pointer"
                >
                  Mark all read
                </button>

                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-xl px-3.5 py-2 pr-9 bg-white text-xs font-medium text-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="System">System Alerts</option>
                    <option value="Organization Events">Organization Events</option>
                    <option value="Volunteer Events">Volunteer Events</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Segmented Controller Tabs */}
            <div className="p-1 bg-slate-200/60 rounded-xl inline-flex gap-1 border border-gray-200/80">
              <button
                onClick={() => setActiveTab("inApp")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "inApp"
                    ? "bg-white text-emerald-950 shadow-xs border border-gray-200/50"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>In-App Stream</span>
                {unreadInAppCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                    {unreadInAppCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("email")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "email"
                    ? "bg-white text-emerald-950 shadow-xs border border-gray-200/50"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>Email Logs</span>
                {unreadEmailCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                    {unreadEmailCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-emerald-600 border-t-transparent mb-2"></div>
                  <h3 className="text-xs font-medium text-gray-500">
                    Loading telemetry stream…
                  </h3>
                </div>
              ) : currentList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                    <Bell size={22} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    No notifications recorded
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {filter !== "All"
                      ? 'Try switching your filter to "All Categories"'
                      : "System telemetry is all clear!"}
                  </p>
                </div>
              ) : (
                currentList.map((n) => {
                  if (!n || !n._id) return null;
                  const isUnread = !n.isRead;

                  return (
                    <div
                      key={n._id}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border shadow-xs transition ${
                        isUnread
                          ? "bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300"
                          : "bg-white border-gray-200/80 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isUnread
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                            : "bg-slate-100 text-slate-600 border border-gray-200/60"
                        }`}
                      >
                        {getNotificationIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-xs text-gray-900 tracking-tight">
                            {n.title || "Untitled Notification"}
                          </h4>
                          {isUnread && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-full border border-emerald-200/60 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              New
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {n.message || "No message available"}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>
                              {n.createdAt
                                ? new Date(n.createdAt).toLocaleString(undefined, {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : "Recent"}
                            </span>
                          </div>

                          {n.link && (
                            <Link
                              to={n.link}
                              className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 transition"
                            >
                              <span>View incident</span>
                              <ExternalLink size={10} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
