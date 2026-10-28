import React, { useState } from "react";
import {
  Search,
  Calendar,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import OpportunityCard from "@/features/opportunities/components/OpportunityCard";
import OrganizationSidebar from "@/shared/components/layout/sidebars/OrganizationSidebar";
import OrganizationNavbar from "@/shared/components/layout/navbars/OrganizationNavbar";
import PostOpportunityModal from "@/features/opportunities/components/PostOpportunityModal";
import {
  useOrganizationOpportunities,
  useDeleteOpportunity,
} from "@/features/opportunities/hooks/useOpportunities";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { getCookie } from "@/shared/utils/cookies";

export default function OrganizationPostedOpportunities() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgId = user?.id || getCookie("orgId") || "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showPostModal, setShowPostModal] = useState(false);

  // TanStack Query integration
  const { opportunities, isLoading: loading } = useOrganizationOpportunities(orgId);
  const deleteMutation = useDeleteOpportunity(orgId);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  // Handle Delete via TanStack Mutation
  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  // Handle update from Edit modal (syncs query cache)
  const handleUpdate = (updatedOpp) => {
    queryClient.setQueryData(
      queryKeys.organizations.opportunities(orgId),
      (old = []) =>
        old.map((opp) =>
          opp._id === updatedOpp._id ? { ...opp, ...updatedOpp } : opp
        )
    );
  };

  // Filter and sort opportunities
  const filteredAndSortedOpportunities = opportunities
    .filter((opp) => {
      const matchesSearch =
        opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || opp.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          );
        case "oldest":
          return (
            new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date)
          );
        case "volunteers":
          return (b.volunteers?.length || 0) - (a.volunteers?.length || 0);
        case "title":
          return a.title?.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Organization Sidebar */}
      <OrganizationSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Organization Navbar */}
        <OrganizationNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 px-4 sm:px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Posted Opportunities
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage applications, verify volunteer participation, and track progress.
                </p>
              </div>

              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition cursor-pointer"
              >
                <Plus size={18} />
                <span>Post Opportunity</span>
              </button>
            </div>

            {/* Filters and Search Section */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
              <div className="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition text-sm"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition text-sm font-medium text-gray-700 bg-white cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="Open">Active (Open)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition text-sm font-medium text-gray-700 bg-white cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="volunteers">Most Volunteers</option>
                    <option value="title">Title A-Z</option>
                  </select>

                  {(searchTerm || statusFilter !== "all" || sortBy !== "newest") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setSortBy("newest");
                      }}
                      className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>
                  Showing {filteredAndSortedOpportunities.length} of {opportunities.length} opportunities
                </span>
              </div>
            </div>

            {/* Opportunities Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-9 w-9 border-3 border-emerald-600 border-t-transparent mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">Loading opportunities...</p>
                </div>
              </div>
            ) : filteredAndSortedOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp._id}
                    _id={opp._id}
                    title={opp.title}
                    description={opp.description}
                    date={opp.date ? new Date(opp.date).toLocaleDateString() : ""}
                    duration={opp.duration}
                    location={opp.location}
                    currentVolunteers={opp.volunteers?.length || 0}
                    volunteersNeeded={opp.volunteersNeeded || 0}
                    status={opp.status}
                    fileUrl={opp.fileUrl}
                    onDelete={() => handleDelete(opp._id)}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3.5 text-gray-400">
                    <Calendar size={26} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    No opportunities found
                  </h3>
                  <p className="text-gray-500 text-xs mb-5 leading-relaxed">
                    {searchTerm || statusFilter !== "all"
                      ? "No opportunities match your search criteria. Try clearing or modifying your filters."
                      : "You haven't posted any opportunities yet. Create your first initiative to start recruiting volunteers."}
                  </p>
                  {searchTerm || statusFilter !== "all" ? (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                      className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition text-xs shadow-xs cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-xs shadow-xs cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Post First Opportunity</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Post Opportunity Modal */}
      {showPostModal && (
        <PostOpportunityModal
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
          }}
        />
      )}
    </div>
  );
}
