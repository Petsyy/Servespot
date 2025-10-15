import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Phone,
  Calendar,
  User,
  Briefcase,
} from "lucide-react";
import OrgSidebar from "@/components/layout/sidebars/OrgSidebar.jsx";
import OrgNavbar from "@/components/layout/navbars/OrganizationNavbar.jsx";
import { getOrgVolunteers, updateVolunteerStatus } from "@/services/api";
import { toast } from "react-toastify";

export default function ManageVolunteers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [opportunityFilter, setOpportunityFilter] = useState("All Opportunities");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // ✅ Fetch all opportunities & volunteers
  useEffect(() => {
    const orgId = localStorage.getItem("orgId");
    if (!orgId) return;

    const fetchData = async () => {
      try {
        const res = await getOrgVolunteers(orgId);
        const allVolunteers = [];

        res.data.forEach((opp) => {
          (opp.volunteers || []).forEach((vol) => {
            allVolunteers.push({
              id: vol._id,
              name:
                vol.firstName && vol.lastName
                  ? `${vol.firstName} ${vol.lastName}`
                  : vol.fullName,
              email: vol.email,
              phone: vol.contactNumber || "—",
              opportunity: opp.title,
              opportunityId: opp._id,
              status: opp.completedVolunteers?.includes(vol._id)
                ? "Completed"
                : vol.status || "Pending",
              appliedDate: new Date(opp.createdAt).toLocaleDateString(),
            });
          });
        });

        setVolunteers(allVolunteers);
        setOpportunities(
          res.data.map((opp) => ({
            id: opp._id,
            title: opp.title,
          }))
        );
      } catch (err) {
        console.error("Error loading volunteers:", err);
        toast.error("Failed to load volunteers");
      }
    };

    fetchData();
    const handleRefresh = () => fetchData();
    window.addEventListener("volunteersUpdated", handleRefresh);
    return () => window.removeEventListener("volunteersUpdated", handleRefresh);
  }, []);

  // ✅ Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ✅ Unified handleAction (Approve / Reject / Complete)
  const handleAction = async (newStatus) => {
    if (!selectedVolunteer) return;
    try {
      setLoadingAction(true);
      await updateVolunteerStatus(
        selectedVolunteer.id,
        selectedVolunteer.opportunityId,
        newStatus
      );
      toast.success(`${selectedVolunteer.name} marked as ${newStatus}`);

      // Update UI instantly
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === selectedVolunteer.id ? { ...v, status: newStatus } : v
        )
      );

      // Dispatch global event for syncing with OpportunityCard
      window.dispatchEvent(new Event("volunteersUpdated"));
      setShowModal(false);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update volunteer status");
    } finally {
      setLoadingAction(false);
    }
  };

  // ✅ Filtering
  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch =
      vol.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.opportunity?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || vol.status === statusFilter;
    const matchesOpportunity =
      opportunityFilter === "All Opportunities" ||
      vol.opportunity === opportunityFilter;
    return matchesSearch && matchesStatus && matchesOpportunity;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <OrgSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <OrgNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Manage Volunteers
              </h1>
              <p className="text-gray-600 text-sm">
                Review and manage volunteer participation across your opportunities
              </p>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* Search Bar */}
                <div className="flex-1 w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search volunteers by name, email, or opportunity..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-auto">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full md:w-40 appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option>All Status</option>
                      <option>Approved</option>
                      <option>Pending</option>
                      <option>Completed</option>
                      <option>Rejected</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* Opportunity Filter */}
                <div className="w-full md:w-auto">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Opportunity
                  </label>
                  <div className="relative">
                    <select
                      value={opportunityFilter}
                      onChange={(e) => setOpportunityFilter(e.target.value)}
                      className="w-full md:w-48 appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option>All Opportunities</option>
                      {opportunities.map((opp, index) => (
                        <option key={`${opp.id}-${index}`} value={opp.title}>
                          {opp.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Volunteer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Opportunity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Applied Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredVolunteers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-gray-500 py-8 text-sm"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <User className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="font-medium text-gray-900 mb-1">No volunteers found</p>
                            <p className="text-gray-500 text-xs">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredVolunteers.map((v) => (
                        <tr
                          key={v.id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {v.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div className="font-medium text-gray-900 text-sm">
                                {v.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-700">
                                <Mail className="w-3 h-3 text-gray-400" />
                                {v.email}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {v.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                              <Briefcase className="w-3 h-3" />
                              {v.opportunity}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-gray-700">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {v.appliedDate}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(v.status)}`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedVolunteer(v);
                                setShowModal(true);
                              }}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 hover:border-gray-400 flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Enhanced Volunteer Details Modal */}
        {showModal && selectedVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div 
              className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-blue-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{selectedVolunteer.name}</h2>
                      <p className="text-blue-100 text-xs">Volunteer Profile</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-4">
                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Current Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedVolunteer.status)}`}
                  >
                    {selectedVolunteer.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-medium text-gray-900 text-sm">{selectedVolunteer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Contact Number</p>
                      <p className="font-medium text-gray-900 text-sm">{selectedVolunteer.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Opportunity</p>
                      <p className="font-medium text-gray-900 text-sm">{selectedVolunteer.opportunity}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Applied Date</p>
                      <p className="font-medium text-gray-900 text-sm">{selectedVolunteer.appliedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-4 space-y-3">
                  <div className="text-sm font-semibold text-gray-900">Manage Status</div>
                  
                  {selectedVolunteer.status === "Pending" && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAction("Approved")}
                        disabled={loadingAction}
                        className="px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                      >
                        {loadingAction ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction("Rejected")}
                        disabled={loadingAction}
                        className="px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}

                  {selectedVolunteer.status === "Approved" && (
                    <button
                      onClick={() => handleAction("Completed")}
                      disabled={loadingAction}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                    >
                      {loadingAction ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Mark as Completed
                    </button>
                  )}

                  {(selectedVolunteer.status === "Completed" || selectedVolunteer.status === "Rejected") && (
                    <div className="text-center py-2">
                      <p className="text-gray-500 text-xs">
                        No actions available for {selectedVolunteer.status.toLowerCase()} volunteers.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}