import { Routes, Route, Navigate } from "react-router-dom";

// Public
import LandingPage from "./pages/public/LandingPage";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import VerifyOtp from "./pages/public/VerifyOtp";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";

// User
import UserDashboard from "./pages/user/UserDashboard";
import UserProfile from "./pages/user/UserProfile";
import ChangePassword from "./pages/user/ChangePassword";
import CreatePickup from "./pages/user/CreatePickup";
import MyRequests from "./pages/user/MyRequests";
import NotificationPage from "./pages/user/NotificationPage";
// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRequestDetails from "./pages/admin/AdminRequestDetails";

import ProtectedRoute from "./utils/ProtectedRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= USER ROUTES ================= */}

        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/create-pickup"
          element={
            <ProtectedRoute>
              <CreatePickup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/my-requests"
          element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/notifications"
          element={
            <ProtectedRoute>
              <NotificationPage />
            </ProtectedRoute>
          }
        />



        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Alias for typo safety */}
        <Route
          path="/amin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/request/:id"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminRequestDetails />
            </ProtectedRoute>
          }
        />



        {/* Catch-all unmatched routes redirect to landing/home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}

export default App;