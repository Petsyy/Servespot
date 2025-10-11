import React, { useEffect, useState } from "react";
import { getOpportunities, deleteOpportunity } from "@/services/api";
import OpportunityCard from "@/components/organization-dashboard/opportunities/OpportunityCard";
import OrgSidebar from "@/components/layout/sidebars/OrgSidebar";
import { toast } from "react-toastify";

export default function PostedOpportunities() {
  const orgId = localStorage.getItem("orgId");
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all posted opportunities for this organization
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getOpportunities(orgId);
        setOpportunities(res.data || []);
      } catch (err) {
        console.error("Failed to load opportunities", err);
        toast.error("Failed to fetch opportunities");
      } finally {
        setLoading(false);
      }
    }
    if (orgId) fetchData();
  }, [orgId]);

  // Handle Delete
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

  // Handle update from Edit modal
  const handleUpdate = (updatedOpp) => {
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp._id === updatedOpp._id ? { ...opp, ...updatedOpp } : opp
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <OrgSidebar />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          All Posted Opportunities
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading opportunities...</p>
        ) : opportunities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp._id}
                _id={opp._id}
                title={opp.title}
                date={opp.date}
                duration={opp.duration}
                location={opp.location}
                currentVolunteers={opp.currentVolunteers || 0}
                volunteersNeeded={opp.volunteersNeeded || 0}
                status={opp.status}
                fileUrl={opp.fileUrl}
                onDelete={() => handleDelete(opp._id)}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No opportunities posted yet.</p>
        )}
      </main>
    </div>
  );
}
