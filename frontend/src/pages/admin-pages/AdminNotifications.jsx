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

  const adminId =
    typeof window !== "undefined" ? localStorage.getItem("adminId") : null;

  // =============================
  // Load notifications from API
  // =============================
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!adminId) {
          setLoading(false);
          return;
        }
        
        setLoading(true);
        const res = await getAdminNotifications(adminId);
        if (!mounted) return;

        // Handle different response structures
        let notifications = [];
        if (Array.isArray(res.data)) {
          notifications = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          notifications = res.data.data;
        } else if (res.data?.notifications && Array.isArray(res.data.notifications)) {
          notifications = res.data.notifications;
        } else {
          console.warn("Unexpected response structure:", res.data);
          notifications = [];
        }


        // Replace all items instead of merging to avoid duplicates
        const uniqueNotifications = notifications.filter(
          (notif, index, self) =>
            index === self.findIndex((n) => n._id === notif._id)
        );
        setItems(uniqueNotifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ));
      } catch (e) {
        console.error("Failed to load admin notifications:", e);
        toast.error("Failed to load notifications. Please try again.");
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
    
    let isMounted = true;
    
    const setupSocket = async () => {
      try {
        await registerUserSocket(adminId, "admin");
      } catch (error) {
        console.error("Failed to register socket:", error);
        return;
      }

      const onNew = (notif) => {
        if (!isMounted) return;
        
        
        if (
          notif?.userModel === "Admin" &&
          String(notif?.user) === String(adminId)
        ) {
          setItems((prev) => {
            // Check if notification already exists to prevent duplicates
            const exists = prev.some(item => item._id === notif._id);
            if (exists) return prev;
            
            return [notif, ...prev];
          });
          
          toast.info(`${notif.title}: ${notif.message}`, {
            autoClose: 5000,
          });
        }
      };

      socket.on("newNotification", onNew);
      
      return () => {
        socket.off("newNotification", onNew);
      };
    };

    const cleanup = setupSocket();
    
    return () => {
      isMounted = false;
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
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
  // Filter by System / Organization Events / Volunteer Events / All
  // =============================
  const currentList = useMemo(() => {
    const src = activeTab === "inApp" ? inAppList : emailList;
    
    
    if (filter === "All") return src;

    const filtered = src.filter((n) => {
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
          // Legacy/alternative type names
          "org_signup",
          "org_verification", 
          "org_suspension",
          "org_reactivation",
          "org_deleted",
          "new_opportunity",
          "opportunity_created"
        ];
        return orgTypes.includes(n.type) || 
               (n.type && n.type.toLowerCase().includes('organization')) ||
               (n.type && n.type.toLowerCase().includes('org')) ||
               (n.type && n.type.toLowerCase().includes('opportunity'));
      }
      if (filter === "Volunteer Events") {
        const volunteerTypes = [
          "volunteer_signup", 
          "volunteer_suspension", 
          "volunteer_reactivation", 
          "volunteer_completion",
          // Legacy/alternative type names
          "vol_signup",
          "vol_suspension", 
          "vol_reactivation",
          "vol_completion",
          "user_registration", // Might be used for volunteers
          "user_suspension",   // Might be used for volunteers
          "user_reactivation"  // Might be used for volunteers
        ];
        return volunteerTypes.includes(n.type) || 
               (n.type && n.type.toLowerCase().includes('volunteer')) ||
               (n.type && n.type.toLowerCase().includes('vol'));
      }
      return true;
    });
    
    
    return filtered;
  }, [activeTab, filter, inAppList, emailList, items]);

  // =============================
  // Mark all read
  // =============================
  const markAllAsRead = async () => {
    try {
      if (!adminId) {
        toast.error("Admin ID not found. Please log in again.");
        return;
      }
      
      setLoading(true);
      await markAdminNotificationsRead(adminId);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch (e) {
      console.error("Failed to mark admin notifications read:", e);
      toast.error("Failed to mark notifications as read. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Get appropriate icon for notification type
  // =============================
  const getNotificationIcon = (type) => {
    switch (type) {
      case "email":
        return <Mail className="text-green-600 w-5 h-5" />;
      
      // Organization Events
      case "organization_signup":
        return <Building2 className="text-green-500 w-5 h-5" />;
      case "organization_verification":
        return <CheckCircle className="text-green-500 w-5 h-5" />;
      case "organization_suspension":
        return <AlertCircle className="text-red-500 w-5 h-5" />;
      case "organization_reactivation":
        return <CheckCircle className="text-green-600 w-5 h-5" />;
      case "organization_deleted":
        return <AlertCircle className="text-red-600 w-5 h-5" />;
      case "opportunity_posted":
        return <Bell className="text-purple-500 w-5 h-5" />;
      
      // Volunteer Events
      case "volunteer_signup":
        return <Users className="text-green-500 w-5 h-5" />;
      case "volunteer_suspension":
        return <AlertCircle className="text-orange-500 w-5 h-5" />;
      case "volunteer_reactivation":
        return <CheckCircle className="text-green-600 w-5 h-5" />;
      case "volunteer_completion":
        return <CheckCircle className="text-emerald-500 w-5 h-5" />;
      
      // Legacy types for backward compatibility
      case "user_registration":
      case "user_verification":
        return <Users className="text-green-500 w-5 h-5" />;
      case "report":
      case "user_suspension":
        return <AlertCircle className="text-orange-500 w-5 h-5" />;
      case "system":
      case "status":
      case "update":
      case "maintenance":
      case "security":
        return <Shield className="text-green-500 w-5 h-5" />;
      case "user_reactivation":
        return <CheckCircle className="text-green-600 w-5 h-5" />;
      
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
                    className="appearance-none border border-gray-300 rounded-lg px-4 py-2.5 pr-10 bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option>All</option>
                    <option>System</option>
                    <option>Organization Events</option>
                    <option>Volunteer Events</option>
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
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                In-App Notifications
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
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
                  <Bell className="mx-auto mb-3 text-gray-300 w-10 h-10 animate-pulse" />
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
                currentList.map((n) => {
                  // Add null checks and fallbacks
                  if (!n || !n._id) return null;
                  
                  return (
                    <div
                      key={n._id}
                      className={`flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all ${
                        !n.isRead ? "bg-green-50/70 border-green-200" : ""
                      }`}
                    >
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getNotificationIcon(n.type || "default")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {n.title || "Untitled Notification"}
                          </h4>
                          {!n.isRead && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {n.message || "No message available"}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {n.createdAt ? new Date(n.createdAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }) : "Unknown date"}
                          </span>
                          {n.link ? (
                            <a
                              href={n.link}
                              className="ml-3 text-green-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Details
                            </a>
                          ) : null}
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