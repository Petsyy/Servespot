import React, { useEffect, useState } from "react";
import { Search, MapPin, Filter, Calendar, RotateCcw, Building2, Users, Award } from "lucide-react";
import VolunteerSidebar from "@/components/layout/sidebars/VolunteerSidebar";
import VolunteerNavbar from "@/components/layout/navbars/VolunteerNavbar";
import OpportunityBoard from "@/components/volunteer-dashboard/opportunities/OpportunityBoard";
import { getAllOpportunities } from "@/services/volunteer.api";

export default function VolunteerBrowseOpportunities() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await getAllOpportunities();
      const list = Array.isArray(res?.data) ? res.data : [];
      setOpportunities(list);
    } catch (err) {
      console.error("❌ Failed to load opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Helper: normalize to "YYYY-MM-DD" for reliable comparisons
  const toYMD = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
  };

  // Extract unique values for filter options
  const uniqueLocations = [...new Set(opportunities
    .map(o => o?.location)
    .filter(Boolean)
    .map(loc => loc.toString().trim())
  )].sort();

  const uniqueSkills = [...new Set(opportunities
    .flatMap(o => Array.isArray(o?.skills) ? o.skills : [])
    .filter(Boolean)
    .map(skill => skill.toString().trim())
  )].sort();

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Closed", label: "Closed" }
    // Removed "Completed" since completed opportunities disappear
  ];

  // 🔎 Combined search + filter logic (null-safe)
  const filtered = opportunities.filter((o) => {
    if (!o) return false;

    // 🚨 EXCLUDE COMPLETED OPPORTUNITIES - They disappear from browse view
    if (o?.status === "Completed") return false;

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
    const status = (o?.status ?? "").toString();

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

    const matchesStatus = statusFilter ? status === statusFilter : true;

    return matchesSearch && matchesLocation && matchesSkill && matchesDate && matchesStatus;
  });

  // 🔄 Reset filters
  const handleReset = () => {
    setSearch("");
    setLocationFilter("");
    setSkillFilter("");
    setDateFilter("");
    setStatusFilter("");
  };

  // Check if any filter is active
  const hasActiveFilters = search || locationFilter || skillFilter || dateFilter || statusFilter;

  // Stats for filtered results
  const totalOpportunities = opportunities.length;
  const filteredCount = filtered.length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <VolunteerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <VolunteerNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 sm:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Opportunity Board</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Browse and filter available volunteer opportunities in your community
                </p>
              </div>
              
              <button
                onClick={fetchOpportunities}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60 w-full sm:w-auto justify-center"
              >
                <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* ---------- Search & Filter Bar ---------- */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filter Opportunities</h2>
              
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing {filteredCount} of {totalOpportunities} opportunities
                  </span>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
                  >
                    <RotateCcw size={14} />
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                  <MapPin size={18} />
                </div>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill Filter */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                  <Filter size={18} />
                </div>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Skills</option>
                  {uniqueSkills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                  <Calendar size={18} />
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                  <Award size={18} />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                {search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Search: "{search}"
                    <button onClick={() => setSearch("")} className="ml-1 hover:text-green-900">
                      ×
                    </button>
                  </span>
                )}
                {locationFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Location: {locationFilter}
                    <button onClick={() => setLocationFilter("")} className="ml-1 hover:text-blue-900">
                      ×
                    </button>
                  </span>
                )}
                {skillFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                    Skill: {skillFilter}
                    <button onClick={() => setSkillFilter("")} className="ml-1 hover:text-orange-900">
                      ×
                    </button>
                  </span>
                )}
                {dateFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    Date: {new Date(dateFilter).toLocaleDateString()}
                    <button onClick={() => setDateFilter("")} className="ml-1 hover:text-purple-900">
                      ×
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter("")} className="ml-1 hover:text-gray-900">
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ---------- Opportunities Grid ---------- */}
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Opportunities {hasActiveFilters && `(${filteredCount})`}
              </h3>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filtered.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Search size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasActiveFilters ? "No opportunities found" : "No opportunities available"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {hasActiveFilters
                      ? "Try adjusting your filters to see more results."
                      : "Check back later for new volunteer opportunities."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <RotateCcw size={16} />
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Opportunities Grid */}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((opp) => (
                  <OpportunityBoard
                    key={opp?._id}
                    _id={opp?._id}
                    title={opp?.title}
                    description={opp?.description}
                    organization={opp?.organization}
                    location={opp?.location}
                    date={opp?.date}
                    duration={opp?.duration}
                    points={opp?.points}
                    status={opp?.status}
                    fileUrl={opp?.fileUrl}
                    skills={opp?.skills}
                    volunteersNeeded={opp?.volunteersNeeded}
                    currentVolunteers={opp?.currentVolunteers}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}