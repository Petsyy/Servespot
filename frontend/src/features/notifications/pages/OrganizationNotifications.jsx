import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Mail,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import OrganizationSidebar from "@/shared/components/layout/sidebars/OrganizationSidebar.jsx";
import OrgNavbar from "@/shared/components/layout/navbars/OrganizationNavbar.jsx";
import { getSession } from "@/shared/services/api";
import { useRoleNotifications } from "@/features/notifications/hooks/useRoleNotifications";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "@/shared/utils/cookies";

export default function OrganizationNotifications() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inApp");
  const [filter, setFilter] = useState("All");
  const [orgId, setOrgId] = useState(
    () => getCookie("orgId") || null
  );

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
    items,
    inAppList,
    emailList,
    isLoading: loading,
    markAllAsRead,
  } = useRoleNotifications({ role: "organization", userId: orgId });

  // =============================
  // Filter by System / Volunteer / All
  // =============================
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



  // =============================
  // UI Rendering
  // =============================
  return (
    <div className="flex min-h-screen bg-gray-50">
      <OrganizationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <OrgNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Notifications
                </h1>
                <p className="text-gray-600 text-sm">
                  Email & In-App notifications automatically send reminders,
                  updates, and confirmations to your organization.
                </p>
              </div>

              {/* Filter + Mark all */}
              <div className="relative flex items-center gap-3">
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2.5 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  Mark all read
                </button>

                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-lg px-4 py-2.5 pr-10 bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option>All</option>
                    <option>System</option>
                    <option>Volunteer</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("inApp")}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
                  activeTab === "inApp"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                In-App Notifications
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
                  activeTab === "email"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Email Notifications
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <Bell className="mx-auto mb-3 text-gray-300 w-10 h-10" />
                  <h3 className="text-gray-600 font-medium">
                    Loading notifications…
                  </h3>
                </div>
              ) : currentList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <Bell className="mx-auto mb-3 text-gray-300 w-10 h-10" />
                  <h3 className="text-gray-600 font-medium">
                    No notifications found
                  </h3>
                </div>
              ) : (
                currentList.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all ${
                      !n.isRead ? "bg-green-50/70 border-green-200" : ""
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      !n.isRead ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      {n.type === "email" ? (
                        <Mail className="text-green-600 w-5 h-5" />
                      ) : n.type === "completion" ? (
                        <CheckCircle className="text-green-500 w-5 h-5" />
                      ) : n.type === "status" ? (
                        <AlertCircle className="text-green-500 w-5 h-5" />
                      ) : (
                        <Bell className="text-green-500 w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(n.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        {n.link ? (
                          <a
                            href={n.link}
                            className="ml-3 text-green-600 hover:text-green-700 hover:underline font-medium"
                          >
                            View
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