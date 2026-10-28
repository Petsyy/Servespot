import React from "react";
import VolunteerSidebar from "@/shared/components/layout/sidebars/VolunteerSidebar";
import VolunteerNavbar from "@/shared/components/layout/navbars/VolunteerNavbar";
import VolunteerProfileHeader from "../components/profile/VolunteerProfileHeader";
import VolunteerProfileSummaryCard from "../components/profile/VolunteerProfileSummaryCard";
import VolunteerAboutSection from "../components/profile/VolunteerAboutSection";
import VolunteerPersonalInfoSection from "../components/profile/VolunteerPersonalInfoSection";
import { useVolunteerProfilePage } from "../hooks/useVolunteerProfilePage";
import { Loader2 } from "lucide-react";

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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <VolunteerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <VolunteerNavbar onToggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header & Controls */}
            <VolunteerProfileHeader
              profileIncomplete={profileIncomplete}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              saving={saving}
              onSave={handleSave}
            />

            {/* Profile Overview Card with Rewards Integration */}
            <VolunteerProfileSummaryCard
              me={me}
              badgesData={badgesData}
            />

            {/* Two-Column Form Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: About, Skills & Availability (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <VolunteerAboutSection
                  me={me}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </div>

              {/* Right Column: Personal Information & Location (7 Cols) */}
              <div className="lg:col-span-7">
                <VolunteerPersonalInfoSection
                  me={me}
                  isEditing={isEditing}
                  onChange={handleChange}
                  onLocationChange={handleLocationChange}
                  profileIncomplete={profileIncomplete}
                />
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-gray-400">
                <Loader2 size={15} className="animate-spin text-emerald-600" />
                <span>Loading profile details...</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
