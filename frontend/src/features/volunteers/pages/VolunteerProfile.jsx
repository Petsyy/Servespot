import React from "react";
import VolunteerSidebar from "@/shared/components/layout/sidebars/VolunteerSidebar";
import VolunteerNavbar from "@/shared/components/layout/navbars/VolunteerNavbar";
import VolunteerProfileHeader from "../components/profile/VolunteerProfileHeader";
import VolunteerProfileSummaryCard from "../components/profile/VolunteerProfileSummaryCard";
import VolunteerAboutSection from "../components/profile/VolunteerAboutSection";
import VolunteerPersonalInfoSection from "../components/profile/VolunteerPersonalInfoSection";
import VolunteerBadgesSection from "../components/profile/VolunteerBadgesSection";
import { useVolunteerProfilePage } from "../hooks/useVolunteerProfilePage";

export default function VolunteerProfile() {
  const {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    isEditing,
    setIsEditing,
    saving,
    loading,
    profileIncomplete,
    me,
    badgesData,
    handleChange,
    handleLocationChange,
    handleSave,
  } = useVolunteerProfilePage();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar with responsive controls */}
      <VolunteerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar with sidebar toggle */}
        <VolunteerNavbar onToggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header & Action Controls */}
            <VolunteerProfileHeader
              profileIncomplete={profileIncomplete}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              saving={saving}
              onSave={handleSave}
            />

            {/* Profile Overview Card */}
            <VolunteerProfileSummaryCard
              me={me}
              profileIncomplete={profileIncomplete}
            />

            {/* Three-Column Profile Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: About & Preferences */}
              <div className="lg:col-span-4 space-y-6">
                <VolunteerAboutSection
                  me={me}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </div>

              {/* Middle Column: Personal Information & Location */}
              <div className="lg:col-span-4">
                <VolunteerPersonalInfoSection
                  me={me}
                  isEditing={isEditing}
                  onChange={handleChange}
                  onLocationChange={handleLocationChange}
                  profileIncomplete={profileIncomplete}
                />
              </div>

              {/* Right Column: Badges & Achievements */}
              <div className="lg:col-span-4">
                <VolunteerBadgesSection badgesData={badgesData} />
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
