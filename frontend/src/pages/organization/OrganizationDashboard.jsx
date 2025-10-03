import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrgSidebar from "@/components/layout/OrgSidebar";
import StatCard from "@/components/orgDashboard/StatCard";
import OpportunityCard from "@/components/orgDashboard/OpportunityCard";
import Notifications from "@/components/orgDashboard/Notifications";
import ImpactSummary from "@/components/orgDashboard/ImpactSummary";
import VolunteerActivity from "@/components/orgDashboard/VolunteerActivity";
import { CalendarDays, Users, TrendingUp, Award } from "lucide-react";
import { deleteOpportunity } from "@/services/api";
import { toast } from "react-toastify";

import {
  getOpportunities,
  getOrgStats,
  getOrgNotifications,
  getOrgActivity,
} from "@/services/api";

export default function OrgDashboard() {
  const navigate = useNavigate();
  const orgId = localStorage.getItem("orgId"); // store this when org logs in

  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!orgId) {
          console.error("No orgId found in localStorage");
          return;
        }

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
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [orgId]);

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

// Rendering
{opportunities.slice(0, 3).map((opp) => (
  <OpportunityCard
    key={opp._id}
    {...opp}
    onDelete={handleDelete}
  />
))}

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
            onClick={() => navigate("/organization/post-task")}
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

        {/* Content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          {/* Opportunities */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Active Opportunities
            </h2>
            <div className="rounded-xl border border-gray-200 p-4 space-y-4">
              {loading ? (
                <p className="text-gray-500">Loading opportunities...</p>
              ) : opportunities.length > 0 ? (
                <>
                  {opportunities.slice(0, 3).map((opp) => (
                    <OpportunityCard
                      key={opp._id}
                      _id={opp._id}
                      title={opp.title}
                      date={
                        opp.date ? new Date(opp.date).toLocaleDateString() : ""
                      }
                      duration={opp.duration}
                      location={opp.location}
                      volunteers={opp.volunteersNeeded}
                      status={opp.status}
                      fileUrl={opp.fileUrl}
                      onDelete={handleDelete}
                    />
                  ))}
                  {/* View All Button */}
                  {opportunities.length > 0 && (
                    <button
                      onClick={() => navigate("/organization/post")}
                      className="w-full mt-4 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer"
                    >
                      View All Posted Opportunities →
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No opportunities posted yet.</p>
              )}
            </div>
            <VolunteerActivity items={activity} />
          </div>
          

          {/* Notifications + Impact */}
          <div className="space-y-6">
            <Notifications items={notifications} />
            <ImpactSummary stats={stats} />
          </div>
        </div>
      </main>
    </div>
  );
}
