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

  const handleReset = () => {
    setSearch("");
    setLocationFilter("");
    setSkillFilter("");
    setDateFilter("");
    setStatusFilter("");
  };

  const hasActiveFilters =
    search || locationFilter || skillFilter || dateFilter || statusFilter;

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

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Opportunity Board
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Discover and register for micro-volunteering tasks in your community.
                </p>
              </div>

              <button
                onClick={() => refetch()}
                disabled={loading || isRefetching}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 text-sm font-semibold rounded-xl transition shadow-xs disabled:opacity-60 justify-center cursor-pointer"
              >
                <RotateCcw
                  size={15}
                  className={loading || isRefetching ? "animate-spin text-emerald-600" : ""}
                />
                <span>{loading || isRefetching ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Filter Opportunities
              </h2>

              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Showing {filteredCount} of {totalOpportunities}
                  </span>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Search */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-gray-200/90 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  <MapPin size={16} />
                </div>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-gray-200/90 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none bg-white transition cursor-pointer"
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
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  <Filter size={16} />
                </div>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-gray-200/90 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none bg-white transition cursor-pointer"
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
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-gray-200/90 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  <Filter size={16} />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-gray-200/90 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none bg-white transition cursor-pointer"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Active:
                </span>
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    <span>Keyword: "{search}"</span>
                    <button
                      onClick={() => setSearch("")}
                      className="hover:text-emerald-950 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {locationFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    <span>Location: {locationFilter}</span>
                    <button
                      onClick={() => setLocationFilter("")}
                      className="hover:text-emerald-950 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {skillFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    <span>Skill: {skillFilter}</span>
                    <button
                      onClick={() => setSkillFilter("")}
                      className="hover:text-emerald-950 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {dateFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    <span>Date: {dateFilter}</span>
                    <button
                      onClick={() => setDateFilter("")}
                      className="hover:text-emerald-950 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    <span>Status: {statusFilter}</span>
                    <button
                      onClick={() => setStatusFilter("")}
                      className="hover:text-emerald-950 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Opportunities Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Available Opportunities {hasActiveFilters && `(${filteredCount})`}
              </h3>
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200/80 p-4 animate-pulse space-y-3"
                  >
                    <div className="h-36 bg-gray-100 rounded-xl" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-1/2 pt-2" />
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-2xl bg-white max-w-lg mx-auto">
                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {hasActiveFilters
                    ? "No matching opportunities"
                    : "No opportunities available"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed">
                  {hasActiveFilters
                    ? "Try adjusting or clearing your filters to see more tasks."
                    : "Check back later for new volunteer opportunities from community partners."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Clear All Filters</span>
                  </button>
                )}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    completionProofs={opp?.completionProofs}
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
