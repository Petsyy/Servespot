import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import VolSidebar from "@/components/layout/VolSidebar";
import OpportunityCard from "@/components/volDashboard/FindOpportunities";
import { getAllOpportunities } from "@/services/api";

export default function BrowseOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllOpportunities();
        setOpportunities(res.data || []);
      } catch (err) {
        console.error("❌ Failed to load opportunities:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fixed search filter — safer for nested org names
  const filtered = opportunities.filter((o) => {
    const title = o.title?.toLowerCase() || "";
    const org =
      typeof o.organization === "object"
        ? o.organization.orgName?.toLowerCase() || ""
        : o.organization?.toLowerCase() || "";
    const location = o.location?.toLowerCase() || "";
    return (
      title.includes(search.toLowerCase()) ||
      org.includes(search.toLowerCase()) ||
      location.includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <VolSidebar />

      <main className="flex-1 p-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Find Opportunities
          </h1>
          <p className="text-gray-600 text-sm">
            Browse open volunteering events and programs.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-2/3 md:w-1/3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by title, organization, or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-gray-500 text-sm mt-8">
              No opportunities available.
            </p>
          )}

          {!loading &&
            filtered.map((opp) => (
              <OpportunityCard
                key={opp._id}
                _id={opp._id}
                title={opp.title}
                description={opp.description}
                organization={opp.organization}
                location={opp.location}
                date={
                  opp.date
                    ? new Date(opp.date).toLocaleDateString()
                    : "TBA"
                }
                duration={opp.duration}
                points={opp.points}
                status={opp.status}
                fileUrl={opp.fileUrl}
              />
            ))}
        </div>
      </main>
    </div>
  );
}
