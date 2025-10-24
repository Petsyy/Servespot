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
} from "lucide-react";
import AdminSidebar from "@/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/components/layout/navbars/AdminNavbar";
import {
  getAdminNotifications,
  markAdminNotificationsRead,
} from "@/services/admin.api"; // You'll need to create these API functions
import { socket, registerUserSocket } from "@/utils/socket";
import { toast } from "react-toastify";

export default function AdminNotifications() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inApp");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const adminId = typeof window !== "undefined"
    ? (localStorage.getItem("adminId") || (() => {
        try {
          const user = JSON.parse(localStorage.getItem("adminUser") || "null");
          return user?.id || user?._id || null;
        } catch {
          return null;
        }
      })())
    : null;

  // =============================
  // Load notifications from API
  // =============================
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!adminId) return;
        const res = await getAdminNotifications(adminId);
        if (!mounted) return;

        setItems((prev) => {
          // Handle different response structures
          let notifications = [];
          if (Array.isArray(res.data)) {
            notifications = res.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            notifications = res.data.data;
          } else {
            console.warn("Unexpected response structure:", res.data);
            notifications = [];
          }

          const existingIds = new Set(prev.map((n) => n._id));
          const merged = [
            ...notifications.filter((n) => !existingIds.has(n._id)),
            ...prev,
          ];
          return merged.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        });
      } catch (e) {
        console.error("Failed to load admin notifications:", e);
        // Set empty array on error to prevent further issues
        if (mounted) {
          setItems([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [adminId]);

  // =============================
  // Live socket updates
  // =============================
  useEffect(() => {
    if (!adminId) return;
    registerUserSocket(adminId, "admin");

    const onNew = (notif) => {
      if (
        notif?.userModel === "Admin" &&
        String(notif?.user) === String(adminId)
      ) {
        setItems((prev) => [notif, ...prev]);
        toast.info(`${notif.title}: ${notif.message}`, {
          autoClose: 5000,
        });
      }
    };

    socket.on("newNotification", onNew);
    return () => socket.off("newNotification", onNew);
  }, [adminId]);

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
  // Filter by System / User Management / All
  // =============================
  const currentList = useMemo(() => {
    const src = activeTab === "inApp" ? inAppList : emailList;
    if (filter === "All") return src;

    return src.filter((n) => {
      if (filter === "System")
        return ["status", "update", "system"].includes(n.type);
      if (filter === "User Management")
        return ["user_registration", "organization_verification", "report"].includes(n.type);
      return true;
    });
  }, [activeTab, filter, inAppList, emailList]);

  // =============================
  // Mark all read
  // =============================
  const markAllAsRead = async () => {
    try {
      if (!adminId) return;
      await markAdminNotificationsRead(adminId);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch (e) {
      console.error("Failed to mark admin notifications read:", e);
    }
  };

  // =============================
  // Get appropriate icon for notification type
  // =============================
  const getNotificationIcon = (type) => {
    switch (type) {
      case "email":
        return <Mail className="text-blue-600 w-5 h-5" />;
      case "user_registration":
        return <Users className="text-green-500 w-5 h-5" />;
      case "organization_verification":
        return <Building2 className="text-purple-500 w-5 h-5" />;
      case "report":
        return <AlertCircle className="text-orange-500 w-5 h-5" />;
      case "system":
        return <Shield className="text-blue-500 w-5 h-5" />;
      default:
        return <Bell className="text-gray-500 w-5 h-5" />;
    }
  };

  // =============================
  // UI Rendering
  // =============================
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Admin Notifications
                </h1>
                <p className="text-gray-600 text-sm">
                  Stay updated on platform activities, user registrations, organization verifications, and system alerts.
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
                    <option>User Management</option>
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
                  <p className="text-sm text-gray-500 mt-1">
                    {filter !== "All" ? `Try changing the filter to "All"` : "You're all caught up!"}
                  </p>
                </div>
              ) : (
                currentList.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all ${
                      !n.isRead ? "bg-blue-50/70 border-blue-200" : ""
                    }`}
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
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
                            className="ml-3 text-blue-600 hover:underline"
                          >
                            View Details
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