import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Mail,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import OrganizationSidebar from "@/shared/components/layout/sidebars/OrganizationSidebar.jsx";
import OrgNavbar from "@/shared/components/layout/navbars/OrganizationNavbar.jsx";
import { getSession } from "@/shared/services/api";
import { useRoleNotifications } from "@/features/notifications/hooks/useRoleNotifications";
import { useNavigate, Link } from "react-router-dom";
import { getCookie, setCookie } from "@/shared/utils/cookies";

export default function OrganizationNotifications() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inApp");
  const [filter, setFilter] = useState("All");
  const [orgId, setOrgId] = useState(() => getCookie("orgId") || null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSession();
        if (res.data?.user?.role !== "organization") {
          navigate("/organization/login");
          return;
        }

        const id = res.data?.user?.id;
        if (!id) {
          navigate("/organization/login");
          return;
        }

        setOrgId(id);
        setCookie("orgId", id);
      } catch {
        navigate("/organization/login");
      }
    })();
  }, [navigate]);

  // TanStack Query custom notifications hook
  const {
    inAppList,
    emailList,
    isLoading: loading,
    markAllAsRead,
  } = useRoleNotifications({ role: "organization", userId: orgId });

  // Filter by System / Volunteer / All
  const currentList = useMemo(() => {
    const src = activeTab === "inApp" ? inAppList : emailList;
    if (filter === "All") return src;

    return src.filter((n) => {
      if (filter === "System")
        return ["status", "update", "system"].includes(n.type);
      if (filter === "Volunteer")
        return ["reminder", "completion"].includes(n.type);
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <OrganizationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <OrgNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Notification Center
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time status updates, volunteer sign-up alerts, and proof submissions.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={markAllAsRead}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition shadow-xs cursor-pointer"
                >
                  Mark all as read
                </button>

                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-xl px-3.5 py-2 pr-9 bg-white text-xs font-medium text-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="System">System Alerts</option>
                    <option value="Volunteer">Volunteer Events</option>
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
                <span>In-App Notifications</span>
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
                <span>Email Notifications</span>
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
                    Loading notifications…
                  </h3>
                </div>
              ) : currentList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                    <Bell size={22} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    No notifications in this feed
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    You're all caught up! New updates will appear here automatically.
                  </p>
                </div>
              ) : (
                currentList.map((n) => {
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
                        {n.type === "email" ? (
                          <Mail size={16} />
                        ) : n.type === "completion" ? (
                          <CheckCircle size={16} className="text-emerald-600" />
                        ) : n.type === "status" ? (
                          <AlertCircle size={16} className="text-amber-600" />
                        ) : (
                          <Bell size={16} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-xs text-gray-900 tracking-tight">
                            {n.title}
                          </h4>
                          {isUnread && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-full border border-emerald-200/60 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              New
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>
                              {new Date(n.createdAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>

                          {n.link && (
                            <Link
                              to={n.link}
                              className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 transition"
                            >
                              <span>View details</span>
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
