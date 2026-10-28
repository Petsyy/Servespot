import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/shared/components/layout/ProtectedRoute";

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
          Loading
        </span>
      </div>
    </div>
  );
}

// Shared Pages
const LandingPage = lazy(() => import("@/shared/pages/LandingPage"));
const NotFound = lazy(() => import("@/shared/pages/NotFound"));
const Suspended = lazy(() => import("@/shared/pages/Suspend"));

// Features: Auth
const VolunteerLogin = lazy(() => import("@/features/auth/pages/VolunteerLogin"));
const VolunteerSignup = lazy(() => import("@/features/auth/pages/VolunteerSignup"));
const OrganizationLogin = lazy(() => import("@/features/auth/pages/OrganizationLogin"));
const OrganizationSignup = lazy(() => import("@/features/auth/pages/OrganizationSignup"));
const AdminLogin = lazy(() => import("@/features/auth/pages/AdminLogin"));
const ForgotPassword = lazy(() => import("@/features/auth/pages/ForgotPassword"));

// Features: Volunteers
const VolunteerDashboard = lazy(() => import("@/features/volunteers/pages/VolunteerDashboard"));
const VolunteerProfile = lazy(() => import("@/features/volunteers/pages/VolunteerProfile"));
const VolunteerBadges = lazy(() => import("@/features/volunteers/pages/VolunteerBadges"));
const VolunteerTasks = lazy(() => import("@/features/volunteers/pages/VolunteerTasks"));

// Features: Opportunities
const BrowseOpportunities = lazy(() => import("@/features/opportunities/pages/VolunteerBrowseOpportunities"));
const MyOpportunity = lazy(() => import("@/features/opportunities/pages/OrganizationPostedOpportunity"));

// Features: Organizations
const OrganizationDashboard = lazy(() => import("@/features/organizations/pages/OrganizationDashboard"));
const OrganizationProfile = lazy(() => import("@/features/organizations/pages/OrganizationProfile"));
const OrganizationReports = lazy(() => import("@/features/organizations/pages/OrganizationReports"));

// Features: Admin
const AdminDashboard = lazy(() => import("@/features/admin/pages/AdminDashboard"));
const UserManagement = lazy(() => import("@/features/admin/pages/UserManagement"));
const AdminReports = lazy(() => import("@/features/admin/pages/AdminReports"));

// Features: Notifications
const VolunteerNotifications = lazy(() => import("@/features/notifications/pages/VolunteerNotifications"));
const OrganizationNotifications = lazy(() => import("@/features/notifications/pages/OrganizationNotifications"));
const AdminNotifications = lazy(() => import("@/features/notifications/pages/AdminNotifications"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* General */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/suspended" element={<Suspended />} />

        {/* Direct & Backward-Compatible Auth Routes */}
        <Route path="/role/login" element={<Navigate to="/volunteer/login" replace />} />
        <Route path="/role/signup" element={<Navigate to="/volunteer/signup" replace />} />
        <Route path="/login" element={<Navigate to="/volunteer/login" replace />} />
        <Route path="/signup" element={<Navigate to="/volunteer/signup" replace />} />

        {/* Admin Public */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminNotifications />
            </ProtectedRoute>
          }
        />

        {/* Volunteer Public */}
        <Route path="/volunteer/login" element={<VolunteerLogin />} />
        <Route path="/volunteer/signup" element={<VolunteerSignup />} />
        <Route path="/volunteer/forgot-password" element={<ForgotPassword />} />

        {/* Volunteer Protected */}
        <Route
          path="/volunteer/homepage"
          element={<Navigate to="/volunteer/dashboard" replace />}
        />
        <Route
          path="/volunteer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/opportunities"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <BrowseOpportunities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/tasks"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <VolunteerTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/profile"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <VolunteerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/badges"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <VolunteerBadges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/notifications"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <VolunteerNotifications />
            </ProtectedRoute>
          }
        />

        {/* Organization Public */}
        <Route path="/organization/login" element={<OrganizationLogin />} />
        <Route path="/organization/signup" element={<OrganizationSignup />} />
        <Route path="/organization/forgot-password" element={<ForgotPassword />} />

        {/* Organization Protected */}
        <Route
          path="/organization/homepage"
          element={<Navigate to="/organization/dashboard" replace />}
        />
        <Route
          path="/organization/dashboard"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/opportunities"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <MyOpportunity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/profile"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <OrganizationProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/reports"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <OrganizationReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/notifications"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <OrganizationNotifications />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
