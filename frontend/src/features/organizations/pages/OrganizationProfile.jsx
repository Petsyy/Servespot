import React from "react";
import OrganizationSidebar from "@/shared/components/layout/sidebars/OrganizationSidebar";
import OrganizationNavbar from "@/shared/components/layout/navbars/OrganizationNavbar";
import OrganizationProfileHeader from "../components/profile/OrganizationProfileHeader";
import OrganizationProfileSummaryCard from "../components/profile/OrganizationProfileSummaryCard";
import OrganizationAboutSection from "../components/profile/OrganizationAboutSection";
import OrganizationContactSection from "../components/profile/OrganizationContactSection";
import { useOrganizationProfilePage } from "../hooks/useOrganizationProfilePage";

export default function OrganizationProfile() {
  const {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    isEditing,
    setIsEditing,
    saving,
    loading,
    profileIncomplete,
    org,
    handleChange,
    handleLocationChange,
    handleSave,
  } = useOrganizationProfilePage();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Organization Sidebar */}
      <OrganizationSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Organization Navbar */}
        <OrganizationNavbar onToggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header & Controls */}
            <OrganizationProfileHeader
              profileIncomplete={profileIncomplete}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              saving={saving}
              onSave={handleSave}
            />

            {/* Profile Summary Card */}
            <OrganizationProfileSummaryCard
              org={org}
              profileIncomplete={profileIncomplete}
            />

            {/* Two-Column Form Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: About Section */}
              <div className="lg:col-span-1 space-y-6">
                <OrganizationAboutSection
                  org={org}
                  isEditing={isEditing}
                  onChange={handleChange}
                  profileIncomplete={profileIncomplete}
                />
              </div>

              {/* Right Column: Contact & Location */}
              <div className="lg:col-span-2">
                <OrganizationContactSection
                  org={org}
                  isEditing={isEditing}
                  onChange={handleChange}
                  onLocationChange={handleLocationChange}
                  profileIncomplete={profileIncomplete}
                />
              </div>
            </div>

            {loading && (
              <div className="mt-6 text-sm text-gray-500">Loading profile…</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
