import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  UploadCloud,
  Trophy,
  Medal,
  Award,
  CheckCircle
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
  const navigate = useNavigate();
  const volunteerId = getCookie("volunteerId") || "";

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
      {/* Tabs Header */}
      <div className="flex space-x-1 p-2 border-b border-gray-200/70 bg-slate-50/80">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-emerald-800 shadow-xs border border-gray-200/80"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6">
        {/* 1. Active Tasks Tab */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {!loading && (!tasks?.active || tasks.active.length === 0) && (
              <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl bg-slate-50/50">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  No active tasks yet
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
                  Join micro-volunteering opportunities in your local community to start logging verified hours and earning points.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/volunteer/opportunities")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <span>Browse Opportunities</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {loading && <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />}

            {tasks?.active?.map((t) => (
              <div
                key={t._id}
                className="border border-gray-200/90 rounded-2xl p-5 hover:border-emerald-300/80 hover:shadow-xs transition-all bg-white relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                    {t.title}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full self-start sm:self-auto ${
                      t.status === "Open"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : t.status === "In Progress"
                        ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mb-3">
                  <span className="font-medium text-gray-700">Organization:</span>{" "}
                  {t.organization?.orgName || "Community Partner"}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600 mb-4 font-medium">
                  {t.date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={15} className="text-emerald-600" />
                      {new Date(t.date).toLocaleDateString()}
                    </span>
                  )}
                  {t.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} className="text-emerald-600" />
                      {t.duration}
                    </span>
                  )}
                  {t.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-emerald-600" />
                      {t.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users size={15} className="text-emerald-600" />
                    {t.volunteers?.length || 0} / {t.volunteersNeeded || 1} volunteers
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => onViewOpportunity(t._id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl transition cursor-pointer"
                  >
                    <Eye size={15} /> <span>View Details</span>
                  </button>
                  {(() => {
                    const volunteerProof = t.completionProofs?.find((p) => {
                      const vId = p.volunteer?._id || p.volunteer?.id || p.volunteer;
                      return vId && String(vId) === String(volunteerId);
                    });
                    let status = volunteerProof?.status;
                    if (!status) {
                      try {
                        const localMap = JSON.parse(
                          localStorage.getItem(`proofStatus_${volunteerId}`) || "{}"
                        );
                        status = localMap[t._id] || null;
                      } catch (err) {
                        console.warn("Failed to read local proof status in tabs:", err);
                      }
                    }

                    if (status === "Pending") {
                      return (
                        <button
                          disabled
                          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl transition shadow-xs cursor-default"
                        >
                          <Clock size={15} className="text-amber-600" />{" "}
                          <span>Proof In Review</span>
                        </button>
                      );
                    }
                    if (status === "Approved") {
                      return (
                        <button
                          disabled
                          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl transition shadow-xs cursor-default"
                        >
                          <CheckCircle size={15} className="text-emerald-600" />{" "}
                          <span>Approved</span>
                        </button>
                      );
                    }
                    if (status === "Rejected") {
                      return (
                        <button
                          onClick={() => onSubmitProof(t._id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition shadow-xs cursor-pointer"
                        >
                          <UploadCloud size={15} /> <span>Resubmit Proof</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        onClick={() => onSubmitProof(t._id)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition shadow-xs cursor-pointer"
                      >
                        <UploadCloud size={15} /> <span>Submit Proof</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Completed Tasks Tab */}
        {activeTab === "completed" && (
          <div className="space-y-4">
            {!loading && (!tasks?.completed || tasks.completed.length === 0) && (
              <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl bg-slate-50/50">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200/80 shadow-xs">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  No completed tasks yet
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Keep going! Once you finish your first volunteering task and have your proof verified, it will appear here with points and badges.
                </p>
              </div>
            )}

            {loading && <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />}

            {tasks?.completed?.map((t) => (
              <div
                key={t._id}
                className="border border-gray-200/90 rounded-2xl p-5 hover:border-gray-300 transition-all bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {t.title}
                  </h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 self-start sm:self-auto">
                    Completed
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mb-3">
                  <span className="font-medium text-gray-700">Organization:</span>{" "}
                  {t.organization?.orgName || "Community Partner"}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600 mb-4 font-medium">
                  {t.date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={15} className="text-emerald-600" />
                      {new Date(t.date).toLocaleDateString()}
                    </span>
                  )}
                  {t.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} className="text-emerald-600" />
                      {t.duration}
                    </span>
                  )}
                  {t.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-emerald-600" />
                      {t.location}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100">
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
                    className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                  >
                    <Eye size={15} /> <span>View Proof</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Badges & Points Tab */}
        {activeTab === "badges" && (
          <div className="space-y-6">
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Medal size={20} className="text-emerald-600" />
                <span>Your Community Achievements</span>
              </h3>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Points
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {overview?.points || 0}
                </p>
              </div>
              <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Completed Tasks
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {overview?.completedTasks || 0}
                </p>
              </div>
              <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Badges Earned
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {overview?.badgesCount || badges?.length || 0}
                </p>
              </div>
            </div>

            {/* Earned Badges Grid */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                <span>Earned Badges</span>
              </h4>

              {!badges || badges.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    No badges earned yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Complete your first volunteering activity to unlock your milestone badge!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map((b) => (
                    <div
                      key={b._id || b.name}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm transition text-center"
                    >
                      <div className="text-3xl mb-2">{b.icon || "🏅"}</div>
                      <p className="font-bold text-gray-900 text-sm">{b.name}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
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
