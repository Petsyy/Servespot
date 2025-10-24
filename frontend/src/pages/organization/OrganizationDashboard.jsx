import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  TrendingUp,
  Award,
  ShieldAlert,
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
      setNotifications((prev) => [notif, ...prev]);
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
        setNotifications(notifRes.data);
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
            <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded-lg flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-yellow-600" />
              <span>
                Your account is currently <strong>pending verification</strong>.
                You can browse your dashboard, but posting and volunteer
                management are disabled until approval.
              </span>
            </div>
          )}

          {org?.status === "suspended" && (
            <div className="bg-red-100 border-l-4 border-red-400 text-red-800 p-4 mb-6 rounded-lg flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <span>
                Your account is <strong>suspended</strong>. Please contact
                support for reactivation.
              </span>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back,{" "}
                <span className="text-green-700 font-semibold">{orgName}</span>
              </h1>
              <p className="text-gray-600">
                Here&apos;s what&apos;s happening with your opportunities today
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
              className={`inline-flex items-center gap-2 px-4 h-10 rounded-md font-medium transition-colors ${
                canPost
                  ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              <span>
                {canPost ? "+ Post New Opportunity" : "Posting Disabled"}
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<CalendarDays size={20} />}
              title="Opportunities Created"
              value={stats.totalOpportunities || 0}
              color="green"
            />
            <StatCard
              icon={<Users size={20} />}
              title="Volunteers Recruited"
              value={stats.totalVolunteers || 0}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              title="Impact Hours"
              value={stats.totalHours || 0}
              color="purple"
            />
            <StatCard
              icon={<Award size={20} />}
              title="Completion Rate"
              value={stats.completionRate ? `${stats.completionRate}%` : "0%"}
              color="orange"
            />
          </div>

          {/* Opportunities & Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              {/* Posted Opportunities */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
                    Posted Opportunities
                  </h2>
                  {opportunities.length > 0 && (
                    <button
                      onClick={() => navigate("/organization/opportunities")}
                      className="h-9 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium cursor-pointer transition-colors"
                    >
                      View All
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        No opportunities posted yet.
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
                        className={`font-medium ${
                          canPost
                            ? "text-green-600 hover:text-green-700"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Post your first opportunity
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              <Notifications items={notifications} />
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
            toast.success("Opportunity posted!");

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
