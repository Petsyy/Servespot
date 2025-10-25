import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  TrendingUp,
  Award,
  ShieldAlert,
  Plus,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { confirmDelete, successAlert, errorAlert } from "@/utils/swalAlerts";
import { io } from "socket.io-client";
import {
  getOpportunities,
  getOrgStats,
  getOrgNotifications,
  deleteOpportunity,
  getOrganizationProfile,
} from "@/services/organization.api";
import OrganizationSidebar from "@/components/layout/sidebars/OrgSidebar";
import OrganizationNavbar from "@/components/layout/navbars/OrganizationNavbar";
import StatCard from "@/components/organization-dashboard/metrics/StatCard";
import OpportunityCard from "@/components/organization-dashboard/opportunities/OpportunityCard";
import Notifications from "@/components/organization-dashboard/notifications/Notifications";
import ImpactSummary from "@/components/organization-dashboard/metrics/ImpactSummary";
import PostOpportunityModal from "@/components/organization-dashboard/modal/PostOpportunityModal";
import { socket, registerUserSocket } from "@/utils/socket";

export default function OrganizationDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [org, setOrg] = useState(null);

  const [orgName, setOrgName] = useState(
    localStorage.getItem("orgName") || "Organization"
  );

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const orgId = localStorage.getItem("orgId");
    const role = "organization";
    if (orgId) registerUserSocket(orgId, role);

    registerUserSocket(orgId, "organization");

    socket.on("newNotification", (notif) => {
      toast.info(`${notif.title}: ${notif.message}`, { autoClose: 5000 });
      setNotifications((prev) => {
        const updated = [notif, ...prev]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3); // Limit to 3
        return updated;
      });
    });

    // ✅ Listen for suspension/reactivation
    socket.on("suspended", (data) => {
      const reason = data.reason || "No reason provided.";
      toast.error(
        `Your organization account has been suspended.\nReason: ${reason}`,
        {
          autoClose: 6000,
        }
      );
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/organization-suspended";
      }, 3000);
    });

    socket.on("reactivated", () => {
      toast.success("✅ Your organization account has been reactivated!", {
        autoClose: 5000,
      });
      localStorage.setItem("justReactivated", "true");
    });

    return () => {
      socket.off("newNotification");
      socket.off("suspended");
      socket.off("reactivated");
    };
  }, []);

  useEffect(() => {
    const orgId = localStorage.getItem("orgId");
    const orgToken = localStorage.getItem("orgToken");
    const activeRole = localStorage.getItem("activeRole");

    // No credentials — must log in
    if (!orgId || !orgToken) {
      console.warn("No orgId/orgToken found — redirecting to login");
      navigate("/organization/login");
      return;
    }

    // If volunteer was last active, fix context
    if (activeRole !== "organization") {
      console.warn("Restoring organization session context...");
      localStorage.setItem("token", orgToken);
      localStorage.setItem("activeRole", "organization");
    }
  }, [navigate]);

  useEffect(() => {
    const orgId = localStorage.getItem("orgId");
    const orgToken = localStorage.getItem("orgToken");
    const activeRole = localStorage.getItem("activeRole");

    if (activeRole !== "organization" || !orgId || !orgToken) {
      console.warn("Access denied: not an organization user");
      navigate("/organization/login");
      return;
    }

    localStorage.setItem("token", orgToken);

    async function fetchData() {
      try {
        // Fetch org profile first to know status/name
        const orgRes = await getOrganizationProfile(orgId);
        setOrg(orgRes.data);
        setOrgName(orgRes.data?.orgName || "Organization");
        localStorage.setItem("orgName", orgRes.data?.orgName || "Organization");

        const [oppRes, statsRes, notifRes] = await Promise.all([
          getOpportunities(orgId),
          getOrgStats(orgId),
          getOrgNotifications(orgId),
        ]);

        setOpportunities(oppRes.data);
        setStats(statsRes.data);
        // Limit notifications to 3 and sort by latest
        setNotifications(
          notifRes.data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
        );
      } catch (err) {
        console.error("❌ Failed to load dashboard data", err);
        toast.error("Failed to load organization data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  const handleDelete = async (id) => {
    try {
      const confirmed = await confirmDelete("Delete this opportunity?");
      if (!confirmed) return;

      await deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((opp) => opp._id !== id));

      await successAlert(
        "Deleted!",
        "The opportunity has been removed successfully."
      );
    } catch (err) {
      console.error("❌ Failed to delete", err);
      await errorAlert("Delete Failed", "Unable to remove this opportunity.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const orgId = localStorage.getItem("orgId");
      if (!orgId) return;

      // Call your API to mark all as read
      // await markOrgNotificationsRead(orgId);

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      toast.error("Failed to mark notifications as read");
    }
  };

  // Mark single notification as read
  const handleMarkRead = (notificationId) => {
    console.log(`Marking notification as read: ${notificationId}`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const canPost = org?.status === "active"; // ✅ only active orgs can post

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Organization Sidebar */}
      <OrganizationSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Organization Navbar */}
        <OrganizationNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6">
          {/* Verification Banners */}
          {org?.status === "pending" && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded-lg flex items-center gap-3 shadow-sm">
              <ShieldAlert className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Account Pending Verification</p>
                <p className="text-sm mt-1">
                  You can browse your dashboard, but posting and volunteer
                  management are disabled until approval.
                </p>
              </div>
            </div>
          )}

          {org?.status === "suspended" && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 mb-6 rounded-lg flex items-center gap-3 shadow-sm">
              <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Account Suspended</p>
                <p className="text-sm mt-1">
                  Please contact support for reactivation.
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back,{" "}
                <span className="text-green-700 font-semibold">{orgName}</span>!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your opportunities today
              </p>
            </div>
            <button
              disabled={!canPost}
              onClick={() =>
                canPost
                  ? setShowModal(true)
                  : toast.info(
                      org?.status === "pending"
                        ? "Your account is awaiting admin verification."
                        : "Your account is suspended. Please contact support."
                    )
              }
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                canPost
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg cursor-pointer transform hover:scale-105"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plus size={20} />
              <span>{canPost ? "Post Opportunity" : "Posting Disabled"}</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<CalendarDays size={20} className="text-white" />}
              title="Opportunities Created"
              value={stats.totalOpportunities || 0}
              color="green"
            />
            <StatCard
              icon={<Users size={20} className="text-white" />}
              title="Volunteers Recruited"
              value={stats.totalVolunteers || 0}
              color="emerald"
            />
            <StatCard
              icon={<TrendingUp size={20} className="text-white" />}
              title="Impact Hours"
              value={stats.totalHours || 0}
              color="teal"
            />
            <StatCard
              icon={<Award size={20} className="text-white" />}
              title="Completion Rate"
              value={stats.completionRate ? `${stats.completionRate}%` : "0%"}
              color="lime"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Opportunities */}
            <div className="xl:col-span-2 space-y-6">
              {/* Posted Opportunities Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Posted Opportunities
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your active volunteer opportunities
                    </p>
                  </div>
                  {opportunities.length > 0 && (
                    <button
                      onClick={() => navigate("/organization/opportunities")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium cursor-pointer transition-all mt-3 sm:mt-0"
                    >
                      <Eye size={16} />
                      View All
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                    </div>
                  ) : opportunities.length > 0 ? (
                    opportunities.slice(0, 3).map((opp) => (
                      <OpportunityCard
                        key={opp._id}
                        _id={opp._id}
                        title={opp.title}
                        description={opp.description}
                        date={
                          opp.date
                            ? new Date(opp.date).toLocaleDateString()
                            : ""
                        }
                        duration={opp.duration}
                        location={opp.location}
                        currentVolunteers={opp.volunteers?.length || 0}
                        volunteersNeeded={opp.volunteersNeeded || 0}
                        status={opp.status}
                        fileUrl={opp.fileUrl}
                        onDelete={canPost ? handleDelete : undefined} // prevent delete if not active
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarDays className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No opportunities yet
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Start making an impact by posting your first volunteer
                        opportunity
                      </p>
                      <button
                        onClick={() =>
                          canPost
                            ? setShowModal(true)
                            : toast.info(
                                org?.status === "pending"
                                  ? "Your account is awaiting admin verification."
                                  : "Your account is suspended. Please contact support."
                              )
                        }
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                          canPost
                            ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <Plus size={20} />
                        Post First Opportunity
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar Widgets */}
            <div className="space-y-6">
              <Notifications
                items={notifications}
                loading={loading}
                onMarkAllRead={handleMarkAllRead}
                onMarkRead={handleMarkRead}
                maxItems={3}
              />
              <ImpactSummary stats={stats} />
            </div>
          </div>
        </main>
      </div>

      {/* Post Opportunity Modal */}
      {showModal && (
        <PostOpportunityModal
          onClose={() => setShowModal(false)}
          onSuccess={(newOpportunity) => {
            setShowModal(false);
            toast.success("Opportunity posted successfully!");

            if (newOpportunity) {
              // Instantly show new opportunity at top
              setOpportunities((prev) => [newOpportunity, ...prev]);
            }
          }}
        />
      )}
    </div>
  );
}
