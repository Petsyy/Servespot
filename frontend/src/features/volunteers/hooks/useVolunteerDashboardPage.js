import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getOpportunityById, getSession } from "@/shared/services/api";
import { useVolunteerDashboard } from "./useVolunteerDashboard";
import { getCookie, setCookie } from "@/shared/utils/cookies";

export function useVolunteerDashboardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  // Modals state
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [proofStatus, setProofStatus] = useState(null);

  const [viewModal, setViewModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const [viewProofModal, setViewProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);

  const volunteerName = getCookie("volunteerName") || "Volunteer";

  // TanStack Query hook
  const {
    overview,
    tasks,
    progress,
    badges,
    topVolunteers: top,
    notifications,
    isLoading: loading,
    markNotificationRead,
    markAllNotificationsRead,
    refetch,
  } = useVolunteerDashboard();

  // Validate session and ensure volunteer context
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getSession();
        if (!active) return;
        if (res.data?.user?.role !== "volunteer") {
          navigate("/volunteer/login");
          return;
        }

        if (res.data?.user?.id) {
          setCookie("volunteerId", res.data.user.id);
        }
      } catch {
        if (active) navigate("/volunteer/login");
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Handle Submit Proof
  const handleSubmitProof = useCallback(async (taskId) => {
    setSelectedTaskId(taskId);
    setShowProofModal(true);

    try {
      const res = await getOpportunityById(taskId);
      const volunteerId = getCookie("volunteerId");

      if (res.data?.completionProofs && volunteerId) {
        const proof = res.data.completionProofs.find(
          (p) =>
            p.volunteer?._id === volunteerId ||
            p.volunteer?.toString() === volunteerId ||
            p.volunteer === volunteerId
        );
        setProofStatus(proof ? proof.status : null);
      }
    } catch (err) {
      console.warn("Failed to fetch proof status:", err);
    }
  }, []);

  // Handle View Opportunity Details
  const handleViewOpportunity = useCallback(async (taskId) => {
    try {
      const res = await getOpportunityById(taskId);
      setSelectedOpportunity(res.data);
      setViewModal(true);
    } catch {
      toast.error("Failed to load opportunity details.");
    }
  }, []);

  // Handle View Uploaded Proof
  const handleViewProof = useCallback((proofPath) => {
    if (!proofPath) {
      toast.info("No proof uploaded for this task yet.");
      return;
    }
    setSelectedProof(proofPath);
    setViewProofModal(true);
  }, []);

  return {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
    closeSidebar: () => setSidebarOpen(false),
    volunteerName,
    overview,
    tasks,
    progress,
    badges,
    top,
    notifications,
    loading,
    markNotificationRead,
    markAllNotificationsRead,
    refetch,
    activeTab,
    setActiveTab,
    showProofModal,
    setShowProofModal,
    selectedTaskId,
    proofStatus,
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
  };
}

export default useVolunteerDashboardPage;

