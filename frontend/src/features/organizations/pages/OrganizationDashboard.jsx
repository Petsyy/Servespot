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
import { confirmDelete } from "@/shared/utils/swalAlerts";
import { useOrganizationDashboard } from "@/features/organizations/hooks/useOrganizationDashboard";
import { useDeleteOpportunity } from "@/features/opportunities/hooks/useOpportunities";
import { getSession } from "@/shared/services/api";
import OrganizationSidebar from "@/shared/components/layout/sidebars/OrganizationSidebar";
import OrganizationNavbar from "@/shared/components/layout/navbars/OrganizationNavbar";
import StatCard from "@/features/organizations/components/StatCard";
import OpportunityCard from "@/features/opportunities/components/OpportunityCard";
import Notifications from "@/features/notifications/components/OrganizationNotifications";
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

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

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

        <main className="flex-1 px-4 sm:px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Verification Banners */}
            {org?.status === "pending" && (
              <div className="bg-amber-50/80 border border-amber-200/80 text-amber-900 p-4 rounded-2xl flex items-center gap-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Account Pending Verification</p>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    You can view your organization dashboard, but opportunity publishing and volunteer confirmations remain restricted until admin verification.
                  </p>
                </div>
              </div>
            )}

            {org?.status === "suspended" && (
              <div className="bg-rose-50/80 border border-rose-200/80 text-rose-900 p-4 rounded-2xl flex items-center gap-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 text-rose-700">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Account Suspended</p>
                  <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                    Your organization account has been temporarily suspended. Please contact platform administration for assistance.
                  </p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Welcome back, <span className="text-emerald-800">{orgName}!</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Here is an overview of your active initiatives and volunteer participation.
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
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition-all ${
                  canPost
                    ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white cursor-pointer"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
              >
                <Plus size={18} />
                <span>{canPost ? "Post Opportunity" : "Posting Restricted"}</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<CalendarDays />}
                title="Opportunities"
                value={stats.totalOpportunities || 0}
                color="green"
              />
              <StatCard
                icon={<Users />}
                title="Volunteers Recruited"
                value={stats.totalVolunteers || 0}
                color="emerald"
              />
              <StatCard
                icon={<TrendingUp />}
                title="Impact Hours"
                value={stats.totalHours || 0}
                color="teal"
              />
              <StatCard
                icon={<Award />}
                title="Completion Rate"
                value={stats.completionRate ? `${stats.completionRate}%` : "0%"}
                color="lime"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Opportunities List */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50/80">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Posted Opportunities
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Manage active and upcoming volunteer tasks
                      </p>
                    </div>
                    {opportunities.length > 0 && (
                      <button
                        onClick={() => navigate("/organization/opportunities")}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>View All ({opportunities.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent" />
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
                          onDelete={canPost ? handleDelete : undefined}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-700">
                          <CalendarDays size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">
                          No opportunities posted yet
                        </h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4 leading-relaxed">
                          Start engaging passionate volunteers by publishing your organization's first community project.
                        </p>
                        {canPost && (
                          <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                          >
                            <Plus size={15} />
                            <span>Post First Opportunity</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Notifications Widget */}
              <div className="space-y-6">
                <Notifications
                  items={notifications}
                  loading={loading}
                  onMarkAllRead={markAllNotificationsRead}
                  onMarkRead={markNotificationRead}
                  maxItems={3}
                />
              </div>
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
