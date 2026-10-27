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
import { confirmDelete, successAlert, errorAlert } from "@/shared/utils/swalAlerts";
import { useOrganizationDashboard } from "@/features/organizations/hooks/useOrganizationDashboard";
import { useDeleteOpportunity } from "@/features/opportunities/hooks/useOpportunities";
import { getSession } from "@/shared/services/api";
import OrganizationSidebar from "@/shared/components/layout/sidebars/OrganizationSidebar";
import OrganizationNavbar from "@/shared/components/layout/navbars/OrganizationNavbar";
import StatCard from "@/features/organizations/components/StatCard";
import OpportunityCard from "@/features/opportunities/components/OpportunityCard";
import Notifications from "@/features/notifications/components/OrganizationNotifications";
// import ImpactSummary from "@/features/organizations/components/ImpactSummary";
import PostOpportunityModal from "@/features/opportunities/components/PostOpportunityModal";
import { getCookie, setCookie } from "@/shared/utils/cookies";

export default function OrganizationDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const orgId = getCookie("orgId");

  const {
    org,
    orgName,
    opportunities,
    stats,
    notifications,
    canPost,
    isLoading: loading,
    markNotificationRead,
    markAllNotificationsRead,
  } = useOrganizationDashboard(orgId);

  const deleteMutation = useDeleteOpportunity(orgId);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getSession();
        if (res.data?.user?.role !== "organization") {
          navigate("/organization/login");
          return;
        }

        if (res.data?.user?.id) {
          setCookie("orgId", res.data.user.id);
        }
      } catch {
        navigate("/organization/login");
      }
    })();
  }, [navigate]);

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Delete this opportunity?");
    if (!confirmed) return;
    deleteMutation.mutate(id);
  };

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
                <span className="text-green-700 font-semibold">{orgName}!</span>
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
                      {/* <button
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
                      </button> */}
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
                onMarkAllRead={markAllNotificationsRead}
                onMarkRead={markNotificationRead}
                maxItems={3}
              />
              {/* <ImpactSummary stats={stats} /> */}
            </div>
          </div>
        </main>
      </div>

      {/* Post Opportunity Modal */}
      {showModal && (
        <PostOpportunityModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
