import React, { useEffect, useState } from "react";
import { Search, MapPin, Filter, Calendar, RotateCcw } from "lucide-react";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import VolunteerNavbar from "@/components/layout/navbars/VolunteerNavbar";
import OpportunityBoard from "@/components/volunteer-dashboard/opportunities/OpportunityBoard";
import { getAllOpportunities } from "@/services/volunteer.api";

export default function BrowseOpportunities() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllOpportunities();
        const list = Array.isArray(res?.data) ? res.data : [];
        setOpportunities(list);
      } catch (err) {
        console.error("❌ Failed to load opportunities:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Helper: normalize to "YYYY-MM-DD" for reliable comparisons
  const toYMD = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
  };

  // 🔎 Combined search + filter logic (null-safe)
  const filtered = opportunities.filter((o) => {
    const title = (o?.title ?? "").toString().toLowerCase();

    // organization might be an object, string, null, or undefined
    const orgNameRaw =
      typeof o?.organization === "object" && o?.organization !== null
        ? o?.organization?.orgName ??
          o?.organization?.name ??
          o?.organization?.title ??
          ""
        : o?.organization ?? "";

    const org = orgNameRaw.toString().toLowerCase();

    const location = (o?.location ?? "").toString().toLowerCase();

    const skills = Array.isArray(o?.skills)
      ? o.skills.map((s) => (s ?? "").toString().toLowerCase())
      : [];

    const dateYMD = toYMD(o?.date);

    const q = search.toLowerCase();

    const matchesSearch =
      !q || title.includes(q) || org.includes(q) || location.includes(q);

    const matchesLocation = locationFilter
      ? location.includes(locationFilter.toLowerCase())
      : true;

    const matchesSkill = skillFilter
      ? skills.some((s) => s.includes(skillFilter.toLowerCase()))
      : true;

    const matchesDate = dateFilter ? dateYMD === dateFilter : true;

    return matchesSearch && matchesLocation && matchesSkill && matchesDate;
  });

  // 🔄 Reset filters
  const handleReset = () => {
    setSearch("");
    setLocationFilter("");
    setSkillFilter("");
    setDateFilter("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar with responsive controls */}
      <VolSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar with sidebar toggle */}
        <VolunteerNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Opportunity Board</h1>
            <p className="text-gray-600 text-sm">
              Browse and filter volunteer opportunities.
            </p>
          </div>

          {/* ---------- Search & Filter Bar ---------- */}
          <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-200 shadow-sm rounded-xl p-4 mb-6">
            {/* Search */}
            <div className="relative w-full sm:w-[260px]">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-50 text-blue-600 rounded-md p-1">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by title, organization, or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Location Filter */}
            <div className="relative w-full sm:w-[220px]">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-50 text-blue-600 rounded-md p-1">
                <MapPin size={16} />
              </div>
              <input
                type="text"
                placeholder="Filter by location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Skill Filter */}
            <div className="relative w-full sm:w-[220px]">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-50 text-blue-600 rounded-md p-1">
                <Filter size={16} />
              </div>
              <input
                type="text"
                placeholder="Filter by skill"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Date Filter */}
            <div className="relative w-full sm:w-[200px]">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-50 text-blue-600 rounded-md p-1">
                <Calendar size={16} />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 custom-date-input"
              />
            </div>

            {/* Reset Filters */}
            {(search || locationFilter || skillFilter || dateFilter) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>

          {/* ---------- Opportunities Grid ---------- */}
          <div className="flex flex-wrap justify-start gap-4 mt-6 ml-2">
            {loading && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse w-72" />
                ))}
              </>
            )}

            {!loading && filtered.length === 0 && (
              <p className="text-gray-500 text-sm mt-8">
                No opportunities match your filters.
              </p>
            )}

            {!loading &&
              filtered.map((opp) => (
                <OpportunityBoard
                  key={opp?._id}
                  _id={opp?._id}
                  title={opp?.title}
                  description={opp?.description}
                  organization={opp?.organization}
                  location={opp?.location}
                  date={opp?.date ? new Date(opp.date).toLocaleDateString() : "TBA"}
                  duration={opp?.duration}
                  points={opp?.points}
                  status={opp?.status}
                  fileUrl={opp?.fileUrl}
                  skills={opp?.skills}
                />
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
