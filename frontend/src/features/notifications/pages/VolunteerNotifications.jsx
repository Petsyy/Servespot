import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Mail,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import VolunteerSidebar from "@/shared/components/layout/sidebars/VolunteerSidebar.jsx";
import VolunteerNavbar from "@/shared/components/layout/navbars/VolunteerNavbar.jsx";
import { getSession } from "@/shared/services/api";
import { useRoleNotifications } from "@/features/notifications/hooks/useRoleNotifications";
import { useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "@/shared/utils/cookies";

export default function VolunteerNotifications() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inApp");
  const [filter, setFilter] = useState("All");
  const [volunteerId, setVolunteerId] = useState(
    () => getCookie("volunteerId") || null
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await getSession();
        if (res.data?.user?.role !== "volunteer") {
          navigate("/volunteer/login");
          return;
        }

        const id = res.data?.user?.id;
        if (!id) {
          navigate("/volunteer/login");
          return;
        }

        setVolunteerId(id);
        setCookie("volunteerId", id);
      } catch {
        navigate("/volunteer/login");
      }
    })();
  }, [navigate]);

  // TanStack Query custom notifications hook
  const {
    items,
    inAppList,
    emailList,
    isLoading: loading,
    markAllAsRead,
  } = useRoleNotifications({ role: "volunteer", userId: volunteerId });

  // Filter by System / Opportunity / All
  const currentList = useMemo(() => {
    const src = activeTab === "inApp" ? inAppList : emailList;
    if (filter === "All") return src;

    return src.filter((n) => {
      if (filter === "System")
        return ["status", "update", "system"].includes(n.type);
      if (filter === "Opportunity")
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
    <div className="flex min-h-screen bg-gray-50">
      <VolunteerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <VolunteerNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
                  Notifications
                </h1>
                <p className="text-gray-600 text-sm">
                  Stay updated with task assignments, organization announcements, and milestone rewards.
                </p>
              </div>

              {/* Filter + Mark all */}
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-300 hover:bg-emerald-50 hover:border-emerald-200 text-gray-700 hover:text-emerald-800 shadow-xs transition-colors cursor-pointer"
                >
                  Mark all read
                </button>

                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-xl px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-400 shadow-xs transition-colors outline-hidden cursor-pointer"
                  >
                    <option>All</option>
                    <option>System</option>
                    <option>Opportunity</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Segmented Tab Controls */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("inApp")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "inApp"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>In-App Notifications</span>
                {unreadInAppCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                    {unreadInAppCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("email")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "email"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>Email Notifications</span>
                {unreadEmailCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                    {unreadEmailCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent mx-auto mb-3" />
                  <h3 className="text-gray-600 font-semibold text-sm">
                    Loading notifications…
                  </h3>
                </div>
              ) : currentList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-800 font-bold text-base mb-1">
                    No notifications found
                  </h3>
                  <p className="text-xs text-gray-500">
                    You're all caught up! New updates will appear here.
                  </p>
                </div>
              ) : (
                currentList.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                      !n.isRead
                        ? "bg-emerald-50/40 border-emerald-200/80 shadow-xs"
                        : "bg-white border-gray-200/80 shadow-xs"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        !n.isRead
                          ? "bg-emerald-100/70 border-emerald-200 text-emerald-700"
                          : "bg-gray-100 border-gray-200 text-gray-500"
                      }`}
                    >
                      {n.type === "email" ? (
                        <Mail className="w-5 h-5 text-emerald-700" />
                      ) : n.type === "completion" ? (
                        <CheckCircle className="w-5 h-5 text-emerald-700" />
                      ) : n.type === "status" ? (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Bell className="w-5 h-5 text-emerald-700" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2.5 text-xs text-gray-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {new Date(n.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        {n.link ? (
                          <a
                            href={n.link}
                            className="ml-3 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline transition-colors"
                          >
                            View Details &rarr;
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
