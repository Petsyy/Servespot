import React from "react";
import VolunteerSidebar from "@/shared/components/layout/sidebars/VolunteerSidebar";
import VolunteerNavbar from "@/shared/components/layout/navbars/VolunteerNavbar";
import Notifications from "@/features/notifications/components/VolunteerNotifications";
import ProgressCard from "@/features/volunteers/components/ProgressCard";
import ProofUploadModal from "@/features/opportunities/components/ProofUploadModal";
import VolunteerDashboardHeader from "../components/dashboard/VolunteerDashboardHeader";
import VolunteerDashboardTabs from "../components/dashboard/VolunteerDashboardTabs";
import OpportunityDetailsModal from "../components/dashboard/OpportunityDetailsModal";
import VolunteerProofModal from "../components/dashboard/VolunteerProofModal";
import { useVolunteerDashboardPage } from "../hooks/useVolunteerDashboardPage";

export default function VolunteerDashboard() {
  const {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    volunteerName,
    overview,
    tasks,
    progress,
    badges,
    notifications,
    loading,
    markNotificationRead,
    markAllNotificationsRead,
    activeTab,
    setActiveTab,
    showProofModal,
    setShowProofModal,
    selectedTaskId,
    setProofStatus,
    viewModal,
    setViewModal,
    selectedOpportunity,
    viewProofModal,
    setViewProofModal,
    selectedProof,
    handleSubmitProof,
    handleViewOpportunity,
    handleViewProof,
  } = useVolunteerDashboardPage();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <VolunteerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <VolunteerNavbar
          onToggleSidebar={toggleSidebar}
          notifCount={notifications.filter((n) => !n.isRead).length}
          notifications={notifications}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {/* Welcome Header & Top Metrics */}
          <VolunteerDashboardHeader
            volunteerName={volunteerName}
            overview={overview}
            loading={loading}
          />

          {/* Responsive Two-Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column (Main Content): Tasks & Badges Tabs */}
            <div className="xl:col-span-2 space-y-6">
              <VolunteerDashboardTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tasks={tasks}
                overview={overview}
                badges={badges}
                loading={loading}
                onViewOpportunity={handleViewOpportunity}
                onSubmitProof={handleSubmitProof}
                onViewProof={handleViewProof}
              />
            </div>

            {/* Right Column: Widgets */}
            <div className="space-y-6">
              <Notifications
                items={notifications}
                loading={loading}
                onMarkAllRead={markAllNotificationsRead}
                onMarkRead={markNotificationRead}
                maxItems={3}
              />

              <ProgressCard progress={progress} loading={loading} />
            </div>
          </div>
        </main>
      </div>

      {/* Proof Upload Modal */}
      {showProofModal && (
        <ProofUploadModal
          opportunityId={selectedTaskId}
          onClose={() => setShowProofModal(false)}
          onProofSubmitted={() => {
            setProofStatus("Pending");
            const volunteerId = getCookie("volunteerId");
            if (volunteerId && selectedTaskId) {
              try {
                const proofStorageKey = `proofStatus_${volunteerId}`;
                const localMap = JSON.parse(
                  localStorage.getItem(proofStorageKey) || "{}"
                );
                localMap[selectedTaskId] = "Pending";
                localStorage.setItem(proofStorageKey, JSON.stringify(localMap));
              } catch (err) {
                console.warn("Failed to cache proof submission in dashboard:", err);
              }
            }
          }}
        />
      )}

      {/* Opportunity Details Modal */}
      {viewModal && selectedOpportunity && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          onClose={() => setViewModal(false)}
        />
      )}

      {/* Proof Submission Viewer Modal */}
      {viewProofModal && selectedProof && (
        <VolunteerProofModal
          proofPath={selectedProof}
          onClose={() => setViewProofModal(false)}
        />
      )}
    </div>
  );
}
