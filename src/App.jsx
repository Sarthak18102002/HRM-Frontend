// external imports
import { Route, Routes, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
// internal imports
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import OTPVerification from "./pages/OTPVerification";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // Ensure this is exported correctly
import LoadingSpinner from "./components/LoadingSpinner";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Technologies from "./pages/Technologies";

// Lazy-loaded components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Openings = lazy(() => import("./pages/Openings"));
const Resume = lazy(() => import("./pages/Resume"));
const Settings = lazy(() => import("./pages/Settings"));
const UpdateProfile = lazy(() => import("./pages/UpdateProfile"));
const Roles = lazy(() => import("./pages/Roles")); 
const UserRoles = lazy(() => import("./pages/UserRoles"));
const UsersList = lazy(() => import("./pages/UsersList"));

function App() {
  const isAuthenticated = () => !!localStorage.getItem("authToken");

  const hasCompletedRegistration = () => {
    const email = localStorage.getItem("emailForOtp");
    const expiryTime = localStorage.getItem("otpExpiryTime");
    if (!email || !expiryTime) return false;
    if (Date.now() > parseInt(expiryTime, 10)) {
      localStorage.removeItem("emailForOtp");
      localStorage.removeItem("otpExpiryTime");
      return false;
    }
    return true;
  };

  // Wrapper for routes needing authentication + layout
  const AuthenticatedRoute = ({ element }) =>
    isAuthenticated() ? <Layout>{element}</Layout> : <Navigate to="/login" replace />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/profile" element={<AuthenticatedRoute element={
        <Suspense fallback={<LoadingSpinner />}><Profile /></Suspense>
      } />} />

      <Route
        path="/otp-verification"
        element={
          <ProtectedRoute
            element={<OTPVerification />}
            redirectPath="/registration"
            checkAccess={hasCompletedRegistration}
          />
        }
      />

      {/* Authenticated routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <AuthenticatedRoute
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            }
          />
        }
      />
      <Route
        path="/openings"
        element={
          <AuthenticatedRoute
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Openings />
              </Suspense>
            }
          />
        }
      />
      <Route
        path="/profile/update"
        element={
          <AuthenticatedRoute
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <UpdateProfile />
              </Suspense>
            }
          />
        }
      />
      <Route
        path="/resume"
        element={
          <AuthenticatedRoute
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Resume />
              </Suspense>
            }
          />
        }
      />
      <Route
        path="/settings"
        element={
          <AuthenticatedRoute
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Settings />
              </Suspense>
            }
          />
        }
      />
      <Route
        path="/technologies"
        element={
          <AuthenticatedRoute
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Technologies />
              </Suspense>
            }
          />
        }
      />
      <Route
        path="/roles"
        element={
          <AuthenticatedRoute
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Roles />
              </Suspense>
            }
          />
        }
      />
      <Route
        path="/user-roles"
        element={
          <AuthenticatedRoute
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <UserRoles />
              </Suspense>
            }
          />
        }
      />
      <Route
        path="/users-list"
        element={
          <AuthenticatedRoute
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <UsersList />
              </Suspense>
            }
          />
        }
      />
    </Routes>
  );
}

export default App;
