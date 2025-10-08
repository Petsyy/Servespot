import React, { useEffect, useState } from "react";
import { CalendarDays, Users, TrendingUp, Award } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getOpportunities,
  getOrgStats,
  getOrgNotifications,
  getOrgActivity,
  deleteOpportunity,
} from "@/services/api";
import OrgSidebar from "@/components/layout/sidebars/OrgSidebar";
import StatCard from "@/components/organization-dashboard/metrics/StatCard";
import OpportunityCard from "@/components/organization-dashboard/opportunities/OpportunityCard";
import Notifications from "@/components/organization-dashboard/notifications/Notifications";
import ImpactSummary from "@/components/organization-dashboard/metrics/ImpactSummary";
import VolunteerActivity from "@/components/organization-dashboard/volunteers/VolunteerActivity";
import PostOpportunityModal from "@/components/organization-dashboard/modal/PostOpportunityModal";

export default function OrganizationDashboard() {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // SESSION & TOKEN VALIDATION
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

    //  If volunteer was last active, fix context
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
        const [oppRes, statsRes, notifRes, activityRes] = await Promise.all([
          getOpportunities(orgId),
          getOrgStats(orgId),
          getOrgNotifications(orgId),
          getOrgActivity(orgId),
        ]);

        setOpportunities(oppRes.data);
        setStats(statsRes.data);
        setNotifications(notifRes.data);
        setActivity(activityRes.data);
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
      await deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((opp) => opp._id !== id));
      toast.success("Opportunity removed!");
    } catch (err) {
      console.error("❌ Failed to delete", err);
      toast.error("Failed to remove opportunity");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <OrgSidebar />

      <main className="flex-1 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, Organization
            </h1>
            <p className="text-gray-600">
              Here&apos;s what&apos;s happening with your opportunities today
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer"
          >
            <span>+ Post New Opportunity</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <StatCard
            icon={<CalendarDays size={20} />}
            title="Active Opportunities"
            value={stats.active || 0}
          />
          <StatCard
            icon={<Users size={20} />}
            title="Volunteers Engaged"
            value={stats.engagedVolunteers || 0}
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            title="Total Hours"
            value={stats.totalHours || 0}
          />
          <StatCard
            icon={<Award size={20} />}
            title="Completed Tasks"
            value={stats.completedTasks || 0}
          />
        </div>

        {/* Opportunities & Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Posted Opportunities
              </h2>
              {opportunities.length > 0 && (
                <button
                  onClick={() => navigate("/organization/opportunities")}
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer"
                >
                  View All
                </button>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 p-4 space-y-4">
              {loading ? (
                <p className="text-gray-500">Loading opportunities...</p>
              ) : opportunities.length > 0 ? (
                opportunities.slice(0, 3).map((opp) => (
                  <OpportunityCard
                    key={opp._id}
                    _id={opp._id}
                    title={opp.title}
                    description={opp.description}
                    date={
                      opp.date ? new Date(opp.date).toLocaleDateString() : ""
                    }
                    duration={opp.duration}
                    location={opp.location}
                    currentVolunteers={opp.volunteers?.length || 0}
                    volunteersNeeded={opp.volunteersNeeded || 0}
                    status={opp.status}
                    fileUrl={opp.fileUrl}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <p className="text-gray-500">No opportunities posted yet.</p>
              )}
            </div>

            <VolunteerActivity items={activity} />
          </div>

          <div className="space-y-6">
            <Notifications items={notifications} />
            <ImpactSummary stats={stats} />
          </div>
        </div>
      </main>

      {showModal && (
        <PostOpportunityModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            toast.success("Opportunity posted!");
          }}
        />
      )}
    </div>
  );
}
