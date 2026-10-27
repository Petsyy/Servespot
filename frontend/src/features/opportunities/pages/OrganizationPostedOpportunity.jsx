import React, { useState } from "react";
import {
  Filter,
  Search,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import OpportunityCard from "@/features/opportunities/components/OpportunityCard";
import OrganizationSidebar from "@/shared/components/layout/sidebars/OrganizationSidebar";
import OrganizationNavbar from "@/shared/components/layout/navbars/OrganizationNavbar";
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

        <main className="flex-1 p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Posted Opportunities
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage and track all volunteer opportunities posted by your organization
                </p>
              </div>
            </div>
          </div>

          {/* Filters and Search Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search opportunities by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="Open">Active</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="volunteers">Most Volunteers</option>
                  <option value="title">Title A-Z</option>
                </select>

                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter size={18} />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedOpportunities.length} of {opportunities.length} opportunities
              </p>
            </div>
          </div>

          {/* Opportunities Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">Loading opportunities...</p>
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
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No opportunities found
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Get started by posting your first volunteer opportunity from your dashboard."}
                </p>
                {searchTerm || statusFilter !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/organization/dashboard")}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors mx-auto text-sm"
                  >
                    <span>Go to Dashboard</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
