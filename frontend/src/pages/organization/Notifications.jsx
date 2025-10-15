import React, { useState } from "react";
import {
  Bell,
  Mail,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import OrgSidebar from "@/components/layout/sidebars/OrgSidebar.jsx";
import OrgNavbar from "@/components/layout/navbars/OrganizationNavbar.jsx";

export default function Notifications() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inApp");
  const [filter, setFilter] = useState("All");

  // Hardcoded Notifications
  const notifications = {
    inApp: [
      {
        id: 1,
        icon: <Bell className="text-blue-500 w-5 h-5" />,
        title: "New Volunteer Joined",
        message: "Sarah Johnson just signed up for the Tree Planting Drive.",
        time: "5 mins ago",
        read: false,
        type: "Volunteer",
      },
      {
        id: 2,
        icon: <CheckCircle className="text-green-500 w-5 h-5" />,
        title: "Opportunity Completed",
        message: "Clean-Up Drive has been marked as completed successfully.",
        time: "2 hours ago",
        read: true,
        type: "System",
      },
      {
        id: 3,
        icon: <AlertCircle className="text-orange-500 w-5 h-5" />,
        title: "Volunteer Cancelled",
        message: "Michael Chen withdrew from Blood Donation Campaign.",
        time: "Yesterday",
        read: false,
        type: "Volunteer",
      },
    ],
    email: [
      {
        id: 4,
        icon: <Mail className="text-blue-600 w-5 h-5" />,
        title: "Email Sent to Volunteers",
        message: "Reminder email sent for Clean-Up Drive this weekend.",
        time: "30 mins ago",
        read: true,
        type: "System",
      },
      {
        id: 5,
        icon: <Mail className="text-blue-600 w-5 h-5" />,
        title: "Confirmation Email",
        message: "Volunteer completion confirmation email sent to Sarah Johnson.",
        time: "3 hours ago",
        read: true,
        type: "System",
      },
      {
        id: 6,
        icon: <Mail className="text-blue-600 w-5 h-5" />,
        title: "New Opportunity Alert",
        message: "Email update sent: 'Feeding Program' is now open for sign-ups.",
        time: "Yesterday",
        read: false,
        type: "System",
      },
    ],
  };

  const currentList = notifications[activeTab].filter(
    (n) => filter === "All" || n.type === filter
  );

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

        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Notifications
                </h1>
                <p className="text-gray-600 text-sm">
                  Email & In-App notifications automatically send reminders,
                  updates, and confirmations to both volunteers and organizers.
                </p>
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg px-4 py-2.5 pr-10 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>All</option>
                  <option>System</option>
                  <option>Volunteer</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("inApp")}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === "inApp"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                In-App Notifications
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === "email"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Email Notifications
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {currentList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <Bell className="mx-auto mb-3 text-gray-300 w-10 h-10" />
                  <h3 className="text-gray-600 font-medium">
                    No notifications found
                  </h3>
                </div>
              ) : (
                currentList.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all ${
                      !n.read ? "bg-blue-50/70" : ""
                    }`}
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">{n.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {n.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
