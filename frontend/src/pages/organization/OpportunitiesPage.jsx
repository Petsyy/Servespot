import React, { useEffect, useState } from "react";
import { getOpportunities } from "@/services/api";
import OpportunityCard from "@/components/orgDashboard/OpportunityCard";
import OrgSidebar from "@/components/layout/OrgSidebar";
import { toast } from "react-toastify";
import { deleteOpportunity } from "@/services/api";

export default function OpportunitiesPage() {
  const orgId = localStorage.getItem("orgId");
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getOpportunities(orgId);
        setOpportunities(res.data);
      } catch (err) {
        console.error("Failed to load opportunities", err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) fetchData();
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
  {
    opportunities
      .slice(0, 3)
      .map((opp) => (
        <OpportunityCard key={opp._id} {...opp} onDelete={handleDelete} />
      ));
  }

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
                title={opp.title}
                date={opp.date ? new Date(opp.date).toLocaleDateString() : ""}
                duration={opp.duration}
                location={opp.location}
                volunteers={opp.volunteersNeeded}
                status={opp.status}
                fileUrl={opp.fileUrl}
                onDelete={() => handleDelete(opp._id)}
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
