import React, { useState } from "react";
import {
  Search,
  MapPin,
  Filter,
  Calendar,
  RotateCcw,
} from "lucide-react";
import VolunteerSidebar from "@/shared/components/layout/sidebars/VolunteerSidebar";
import VolunteerNavbar from "@/shared/components/layout/navbars/VolunteerNavbar";
import OpportunityBoard from "@/features/opportunities/components/OpportunityBoard";
import { useAllOpportunities } from "@/features/opportunities/hooks/useOpportunities";

export default function VolunteerBrowseOpportunities() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  // TanStack Query integration
  const {
    opportunities,
    isLoading: loading,
    isRefetching,
    refetch,
    uniqueLocations,
    uniqueSkills,
  } = useAllOpportunities();

  // Helper: normalize to "YYYY-MM-DD" for reliable comparisons
  const toYMD = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
  };

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Closed", label: "Closed" },
  ];

  // Apply filters
  const filtered = opportunities.filter((o) => {
    if (!o) return false;
    if (o?.status === "Completed") return false;

    const title = (o?.title ?? "").toString().toLowerCase();

    const orgNameRaw =
      typeof o?.organization === "object" && o?.organization !== null
        ? (o?.organization?.orgName ??
          o?.organization?.name ??
          o?.organization?.title ??
          "")
        : (o?.organization ?? "");

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

    return (
      matchesSearch &&
      matchesLocation &&
      matchesSkill &&
      matchesDate &&
      matchesStatus
    );
  });

  // Reset filters
  const handleReset = () => {
    setSearch("");
    setLocationFilter("");
    setSkillFilter("");
    setDateFilter("");
    setStatusFilter("");
  };

  // Check if any filter is active
  const hasActiveFilters =
    search || locationFilter || skillFilter || dateFilter || statusFilter;

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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Opportunity Board
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Browse and filter available volunteer opportunities in your community
                </p>
              </div>

              <button
                onClick={() => refetch()}
                disabled={loading || isRefetching}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60 w-full sm:w-auto justify-center"
              >
                <RotateCcw
                  size={16}
                  className={loading || isRefetching ? "animate-spin" : ""}
                />
                {loading || isRefetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* ---------- Search & Filter Bar ---------- */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Filter Opportunities
              </h2>

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
                  {uniqueLocations.map((loc, index) => (
                    <option key={index} value={loc}>
                      {loc}
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
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                  <Filter size={18} />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500 font-medium">Active Filters:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Search: "{search}"
                    <button onClick={() => setSearch("")} className="hover:text-green-900 font-bold ml-1">×</button>
                  </span>
                )}
                {locationFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Location: {locationFilter}
                    <button onClick={() => setLocationFilter("")} className="hover:text-green-900 font-bold ml-1">×</button>
                  </span>
                )}
                {skillFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Skill: {skillFilter}
                    <button onClick={() => setSkillFilter("")} className="hover:text-green-900 font-bold ml-1">×</button>
                  </span>
                )}
                {dateFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Date: {dateFilter}
                    <button onClick={() => setDateFilter("")} className="hover:text-green-900 font-bold ml-1">×</button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter("")} className="hover:text-green-900 font-bold ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ---------- Opportunities Grid ---------- */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Opportunities {hasActiveFilters && `(${filteredCount})`}
              </h3>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="h-40 bg-gray-200 rounded-lg mb-3" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
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
                    {hasActiveFilters
                      ? "No opportunities found"
                      : "No opportunities available"}
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    {hasActiveFilters
                      ? "Try adjusting your filters to see more results."
                      : "Check back later for new volunteer opportunities."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
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
                    currentVolunteers={opp?.volunteers?.length ?? opp?.currentVolunteers ?? 0}
                    volunteers={opp?.volunteers}
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
