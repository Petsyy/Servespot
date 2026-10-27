import React from "react";
import {
  Info,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  UploadCloud,
  Trophy,
  Medal,
  Award,
} from "lucide-react";
import { getCookie } from "@/shared/utils/cookies";
import { toast } from "react-toastify";

const TABS = [
  { id: "active", label: "Active Tasks" },
  { id: "completed", label: "Completed Tasks" },
  { id: "badges", label: "Badges & Points" },
];

export default function VolunteerDashboardTabs({
  activeTab,
  setActiveTab,
  tasks,
  overview,
  badges,
  loading = false,
  onViewOpportunity,
  onSubmitProof,
  onViewProof,
}) {
  const volunteerId = getCookie("volunteerId") || "";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Tabs Header */}
      <div className="flex space-x-1 p-2 border-b border-gray-200 bg-gray-50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-green-600 shadow-sm border border-gray-200"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {/* 1. Active Tasks Tab */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {!loading && (!tasks?.active || tasks.active.length === 0) && (
              <div className="flex items-start gap-3 p-4 border border-green-100 bg-green-50 rounded-xl">
                <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Info size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    You haven't joined any active opportunities yet
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Join an opportunity from the{" "}
                    <span className="font-medium text-green-600">Browse</span>{" "}
                    page to see it here.
                  </p>
                </div>
              </div>
            )}

            {loading && <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />}

            {tasks?.active?.map((t) => (
              <div
                key={t._id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-white relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full self-start sm:self-auto ${
                      t.status === "Open"
                        ? "bg-green-100 text-green-700"
                        : t.status === "In Progress"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Organization:</span>{" "}
                  {t.organization?.orgName || "Community Partner"}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  {t.date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-green-600" />
                      {new Date(t.date).toLocaleDateString()}
                    </span>
                  )}
                  {t.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} className="text-green-600" />
                      {t.duration}
                    </span>
                  )}
                  {t.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-green-600" />
                      {t.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users size={16} className="text-green-600" />
                    {t.volunteers?.length || 0} / {t.volunteersNeeded || 1} volunteers
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onViewOpportunity(t._id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition flex-1 sm:flex-none justify-center cursor-pointer"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => onSubmitProof(t._id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition flex-1 sm:flex-none justify-center cursor-pointer"
                  >
                    <UploadCloud size={16} /> Submit Proof
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Completed Tasks Tab */}
        {activeTab === "completed" && (
          <div className="space-y-4">
            {!loading && (!tasks?.completed || tasks.completed.length === 0) && (
              <div className="flex items-start gap-3 p-4 border border-amber-100 bg-amber-50 rounded-xl">
                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Trophy size={18} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    You haven't completed any tasks yet
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Keep going! Once you finish your first activity, it will appear
                    here with your earned points and badges.
                  </p>
                </div>
              </div>
            )}

            {loading && <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />}

            {tasks?.completed?.map((t) => (
              <div
                key={t._id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 self-start sm:self-auto">
                    Completed
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Organization:</span>{" "}
                  {t.organization?.orgName || "Community Partner"}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4 font-medium">
                  {t.date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-green-600" />
                      {new Date(t.date).toLocaleDateString()}
                    </span>
                  )}
                  {t.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} className="text-green-600" />
                      {t.duration}
                    </span>
                  )}
                  {t.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-green-600" />
                      {t.location}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    const proof =
                      t.completionProofs?.find(
                        (p) =>
                          p.volunteer?._id === volunteerId ||
                          p.volunteer === volunteerId
                      )?.fileUrl || null;

                    if (!proof) {
                      toast.info("No proof uploaded for this task yet.");
                    } else {
                      onViewProof(proof);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition w-full justify-center sm:w-auto cursor-pointer"
                >
                  <Eye size={16} /> View Proof
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. Badges & Points Tab */}
        {activeTab === "badges" && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 justify-center sm:justify-start">
                <Medal size={22} className="text-green-600" />
                Your Achievements
              </h3>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 text-center shadow-md">
                <p className="text-sm opacity-90">Total Points</p>
                <p className="text-3xl font-bold mt-1">{overview?.points || 0}</p>
              </div>
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl p-4 text-center shadow-md">
                <p className="text-sm opacity-90">Completed Tasks</p>
                <p className="text-3xl font-bold mt-1">
                  {overview?.completedTasks || 0}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl p-4 text-center shadow-md">
                <p className="text-sm opacity-90">Badges Earned</p>
                <p className="text-3xl font-bold mt-1">
                  {overview?.badgesCount || badges?.length || 0}
                </p>
              </div>
            </div>

            {/* Earned Badges Grid */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 justify-center sm:justify-start">
                <Award size={22} className="text-amber-500" />
                Earned Badges
              </h4>

              {!badges || badges.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <p className="text-gray-600 italic">
                    You haven't earned any badges yet.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete more volunteering opportunities to earn your first one!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map((b) => (
                    <div
                      key={b._id || b.name}
                      className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition text-center"
                    >
                      <div className="text-3xl mb-2">{b.icon || "🏅"}</div>
                      <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {b.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

