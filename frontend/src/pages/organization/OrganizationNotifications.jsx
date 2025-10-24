import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Mail,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import OrgSidebar from "@/components/layout/sidebars/OrgSidebar.jsx";
import OrgNavbar from "@/components/layout/navbars/OrganizationNavbar.jsx";
import {
  getOrgNotifications,
  markOrgNotificationsRead,
} from "@/services/organization.api";
import { socket, registerUserSocket } from "@/utils/socket";
import { toast } from "react-toastify";

export default function OrganizationNotifications() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inApp");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const orgId =
    typeof window !== "undefined" ? localStorage.getItem("orgId") : null;

  // =============================
  // Load notifications from API
  // =============================
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!orgId) return;
        const res = await getOrgNotifications(orgId);
        if (!mounted) return;

        setItems((prev) => {
          // merge old (from socket) + new (from API)
          const existingIds = new Set(prev.map((n) => n._id));
          const merged = [
            ...res.data.filter((n) => !existingIds.has(n._id)),
            ...prev,
          ];
          // sort newest first
          return merged.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        });
      } catch (e) {
        console.error("Failed to load notifications:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [orgId]);

  // =============================
  // Live socket updates
  // =============================
  useEffect(() => {
    if (!orgId) return;
    registerUserSocket(orgId, "organization");

    const onNew = (notif) => {
      if (
        notif?.userModel === "Organization" &&
        String(notif?.user) === String(orgId)
      ) {
        setItems((prev) => [notif, ...prev]);
        toast.info(`${notif.title}: ${notif.message}`, {
          autoClose: 5000,
        });
      }
    };

    socket.on("newNotification", onNew);
    return () => socket.off("newNotification", onNew);
  }, [orgId]);

  // =============================
  // Split by channel type
  // =============================
  const inAppList = useMemo(
    () => items.filter((n) => n.type !== "email"),
    [items]
  );
  const emailList = useMemo(
    () => items.filter((n) => n.type === "email"),
    [items]
  );

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
  // Mark all read
  // =============================
  const markAllAsRead = async () => {
    try {
      if (!orgId) return;
      await markOrgNotificationsRead(orgId);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch (e) {
      console.error("Failed to mark notifications read:", e);
    }
  };

  // =============================
  // UI Rendering
  // =============================
  return (
    <div className="flex min-h-screen bg-gray-50">
      <OrgSidebar
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
                  className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-300 hover:bg-gray-50"
                >
                  Mark all read
                </button>

                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-lg px-4 py-2.5 pr-10 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === "inApp"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                In-App Notifications
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === "email"
                    ? "text-blue-600 border-b-2 border-blue-600"
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
                      !n.isRead ? "bg-blue-50/70" : ""
                    }`}
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {n.type === "email" ? (
                        <Mail className="text-blue-600 w-5 h-5" />
                      ) : n.type === "completion" ? (
                        <CheckCircle className="text-green-500 w-5 h-5" />
                      ) : n.type === "status" ? (
                        <AlertCircle className="text-orange-500 w-5 h-5" />
                      ) : (
                        <Bell className="text-blue-500 w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {n.title}
                      </h4>
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
                            className="ml-3 text-blue-600 hover:underline"
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
