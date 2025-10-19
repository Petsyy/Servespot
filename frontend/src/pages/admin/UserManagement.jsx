import React, { useState } from "react";
import {
  Search,
  UserCheck,
  Building2,
  Users,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  Mail,
  Calendar,
  Award,
  ClipboardList,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";
import AdminSidebar from "@/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/components/layout/navbars/AdminNavbar";

// Mock data
const MOCK_USERS = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    role: "Volunteer",
    status: "Active",
    dateJoined: "2025-09-10",
    badges: 5,
    completed: 12,
  },
  {
    id: 2,
    name: "Helping Hands Org",
    email: "contact@helpinghands.org",
    role: "Organization",
    status: "Pending Verification",
    dateJoined: "2025-09-05",
    posted: 8,
    verified: false,
  },
  {
    id: 3,
    name: "Maria Santos",
    email: "maria@example.com",
    role: "Volunteer",
    status: "Active",
    dateJoined: "2025-08-15",
    badges: 8,
    completed: 18,
  },
  {
    id: 4,
    name: "Green Earth Foundation",
    email: "info@greenearth.org",
    role: "Organization",
    status: "Active",
    dateJoined: "2025-08-20",
    posted: 15,
    verified: true,
  },
];

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    "Active": { color: "bg-green-100 text-green-700", label: "Active" },
    "Pending Verification": { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    "Suspended": { color: "bg-red-100 text-red-700", label: "Suspended" },
  };

  const config = statusConfig[status] || statusConfig["Active"];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// View User Modal Component
const ViewUserModal = ({ user, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative">
      <div className="p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            {user.role === "Organization" ? (
              <Building2 className="h-6 w-6 text-blue-600" />
            ) : (
              <UserCheck className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-600">{user.role}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Joined: {user.dateJoined}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <ClipboardList className="h-4 w-4 text-gray-400" />
            <StatusBadge status={user.status} />
          </div>

          {user.role === "Volunteer" ? (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 text-gray-600">
                <Award className="h-4 w-4 text-gray-400" />
                <span><strong className="text-blue-600">{user.badges}</strong> Badges earned</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 mt-2">
                <CheckCircle2 className="h-4 w-4 text-gray-400" />
                <span><strong className="text-blue-600">{user.completed}</strong> Tasks completed</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 text-gray-600">
                <ClipboardList className="h-4 w-4 text-gray-400" />
                <span><strong className="text-blue-600">{user.posted}</strong> Opportunities posted</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 mt-2">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                <span>Verified: <strong className={user.verified ? "text-green-600" : "text-red-600"}>
                  {user.verified ? "Yes" : "No"}
                </strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState(user);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-6">Edit User Information</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Verify Organization Modal Component
const VerifyOrganizationModal = ({ user, onClose, onVerify }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm relative text-center">
      <div className="p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          Verify Organization
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Are you sure you want to verify <strong className="text-blue-600">{user.name}</strong>?
          This will grant them full access to post opportunities.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onVerify(user)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Verify Organization
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [verifyingUser, setVerifyingUser] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const filteredUsers = MOCK_USERS.filter((user) => {
    if (activeTab === "volunteers" && user.role !== "Volunteer") return false;
    if (activeTab === "organizations" && user.role !== "Organization") return false;
    if (search && !user.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSaveUser = (updatedUser) => {
    console.log("Updated user:", updatedUser);
    setEditingUser(null);
  };

  const handleVerifyOrganization = (user) => {
    console.log("Organization verified:", user.name);
    setVerifyingUser(null);
  };

  const TABS = [
    { key: "all", label: "All Users", icon: Users },
    { key: "volunteers", label: "Volunteers", icon: UserCheck },
    { key: "organizations", label: "Organizations", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage volunteers and organizations</p>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors w-full lg:w-64"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mt-6">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all font-medium ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role === "Volunteer" ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <Building2 className="h-3 w-3" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.dateJoined}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit User"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          {user.role === "Organization" && user.status === "Pending Verification" ? (
                            <button
                              onClick={() => setVerifyingUser(user)}
                              className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Verify Organization"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No users found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {search ? "Try adjusting your search terms" : "No users match the current filters"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedUser && (
        <ViewUserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
      
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}
      
      {verifyingUser && (
        <VerifyOrganizationModal 
          user={verifyingUser} 
          onClose={() => setVerifyingUser(null)}
          onVerify={handleVerifyOrganization}
        />
      )}
    </div>
  );
}