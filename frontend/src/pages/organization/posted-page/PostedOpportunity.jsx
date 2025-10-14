import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Filter, 
  Search, 
  Download,
  Calendar,
  MapPin,
  Users,
  Clock
} from "lucide-react";
import { getOpportunities, deleteOpportunity } from "@/services/organization.api";
import OpportunityCard from "@/components/organization-dashboard/opportunities/OpportunityCard";
import OrgSidebar from "@/components/layout/sidebars/OrgSidebar";
import OrganizationNavbar from "@/components/layout/navbars/OrganizationNavbar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function PostedOpportunities() {
  const navigate = useNavigate();
  const orgId = localStorage.getItem("orgId");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

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
      toast.success("Opportunity removed successfully!");
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

  // Filter and sort opportunities
  const filteredAndSortedOpportunities = opportunities
    .filter(opp => {
      const matchesSearch = opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           opp.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || opp.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        case "oldest":
          return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
        case "volunteers":
          return (b.volunteers?.length || 0) - (a.volunteers?.length || 0);
        case "title":
          return a.title?.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Stats calculation
  const stats = {
    total: opportunities.length,
    active: opportunities.filter(opp => opp.status === "Open").length,
    completed: opportunities.filter(opp => opp.status === "Completed").length,
    totalVolunteers: opportunities.reduce((sum, opp) => sum + (opp.volunteers?.length || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Organization Sidebar */}
      <OrgSidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Organization Navbar */}
        <OrganizationNavbar 
          onToggleSidebar={toggleSidebar}
        />

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
              
              <button
                onClick={() => navigate("/organization/dashboard")}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                
                <span>Go to dashboard</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<Calendar className="text-blue-600" size={20} />}
                label="Total Opportunities"
                value={stats.total}
                color="blue"
              />
              <StatCard
                icon={<Users className="text-green-600" size={20} />}
                label="Active Opportunities"
                value={stats.active}
                color="green"
              />
              <StatCard
                icon={<Clock className="text-purple-600" size={20} />}
                label="Completed"
                value={stats.completed}
                color="purple"
              />
              <StatCard
                icon={<MapPin className="text-orange-600" size={20} />}
                label="Total Volunteers"
                value={stats.totalVolunteers}
                color="orange"
              />
            </div>
          </div>

          {/* Filters and Search Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search opportunities by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="Open">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="volunteers">Most Volunteers</option>
                  <option value="title">Title A-Z</option>
                </select>

                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter size={18} />
                  <span>More Filters</span>
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedOpportunities.length} of {opportunities.length} opportunities
              </p>
              {filteredAndSortedOpportunities.length > 0 && (
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                </button>
              )}
            </div>
          </div>

          {/* Opportunities Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading opportunities...</p>
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
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Get started by posting your first volunteer opportunity."
                  }
                </p>
                {(searchTerm || statusFilter !== "all") ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/organization/dashboard")}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mx-auto"
                  >
                    <Plus size={18} />
                    <span>Post First Opportunity</span>
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

// Stat Card Component
function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200"
  };

  return (
    <div className={`bg-white rounded-xl border-2 p-4 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-white shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}