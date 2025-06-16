
import { Route, Routes, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// internal imports
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import OTPVerification from "./pages/OTPVerification";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Technologies from "./pages/Technologies";
import QuestionsPage from "./pages/QuestionsPage";
import InterviewSchedule from "./pages/InterviewSchedule";
import UserTechnologyList from "./pages/UserTechnologyList";
import Unauthorized from "./pages/Unauthorized"; 
import InterviewQuestionModule from "./pages/InterviewQuestionModule"; 
import OfferLetter from "./pages/OfferLetter"; 
import MeetingRoom from "./pages/MeetingRoom";
import Calender from "./pages/Calender";

// Role-based utils
import { isAdmin, isUser, isInterviewer } from "./utils/authUtils";

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
const Applications = lazy(() => import("./pages/Applications"));
const Interviews = lazy(() => import("./pages/Interviews"));

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

  const AuthenticatedRoute = ({ element }) =>
    isAuthenticated() ? <Layout>{element}</Layout> : <Navigate to="/login" replace />;

  const ProtectedLayoutRoute = ({ element, checkAccess }) =>
    <ProtectedRoute
      checkAccess={checkAccess}
      redirectPath="/unauthorized"
      element={<Layout>{element}</Layout>}
    />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      

      <Route path="/otp-verification" element={
        <ProtectedRoute
          element={<OTPVerification />}
          redirectPath="/registration"
          checkAccess={hasCompletedRegistration}
        />
      } />

      {/* Authenticated Routes with Layout */}
      <Route path="/profile" element={
        <AuthenticatedRoute element={
          <Suspense fallback={<LoadingSpinner />}><Profile /></Suspense>
        } />
      } />

       <Route path="/meeting-room" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isInterviewer()}
          element={<Suspense fallback={<LoadingSpinner />}><MeetingRoom /></Suspense>}
        />
      } />

       <Route path="/calender" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isUser() || isInterviewer()}
          element={<Suspense fallback={<LoadingSpinner />}><Calender /></Suspense>}
        />
      } />

      <Route path="/dashboard" element={
        <AuthenticatedRoute element={
          <Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>
        } />
      } />

      <Route path="/schedule-interview" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isInterviewer()}
          element={<Suspense fallback={<LoadingSpinner />}><InterviewSchedule /></Suspense>}
        />
      } />

      <Route path="/offer-letter" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin()}
          element={<Suspense fallback={<LoadingSpinner />}><OfferLetter /></Suspense>}
        />
      } />

      <Route path="/openings" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isUser() || isInterviewer()}
          element={<Suspense fallback={<LoadingSpinner />}><Openings /></Suspense>}
        />
      } />

      <Route path="/InterviewQuestionModule" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isUser() || isInterviewer()}
          element={<Suspense fallback={<LoadingSpinner />}><InterviewQuestionModule /></Suspense>}
        />
      } />


      <Route path="/interviews" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isUser() || isInterviewer()}
          element={<Suspense fallback={<LoadingSpinner />}><Interviews /></Suspense>}
        />
      } />

      <Route path="/profile/update" element={
        <AuthenticatedRoute element={
          <Suspense fallback={<LoadingSpinner />}><UpdateProfile /></Suspense>
        } />
      } />

      <Route path="/resume" element={
        <AuthenticatedRoute element={
          <Suspense fallback={<LoadingSpinner />}><Resume /></Suspense>
        } />
      } />

      <Route path="/settings" element={
        <AuthenticatedRoute element={
          <Suspense fallback={<LoadingSpinner />}><Settings /></Suspense>
        } />
      } />

      <Route path="/technologies" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isUser()}
          element={<Suspense fallback={<LoadingSpinner />}><Technologies /></Suspense>}
        />
      } />

      <Route path="/questions" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isInterviewer()}
          element={<QuestionsPage />}
        />
      } />

      <Route path="/applications" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isUser() || isInterviewer()}
          element={<Suspense fallback={<LoadingSpinner />}><Applications /></Suspense>}
        />
      } />

      <Route path="/roles" element={
        <ProtectedLayoutRoute
          checkAccess={isAdmin}
          element={<Suspense fallback={<LoadingSpinner />}><Roles /></Suspense>}
        />
      } />

      <Route path="/user-roles" element={
        <ProtectedLayoutRoute
          checkAccess={isAdmin}
          element={<Suspense fallback={<LoadingSpinner />}><UserRoles /></Suspense>}
        />
      } />

      <Route path="/users-list" element={
        <ProtectedLayoutRoute
          checkAccess={isAdmin}
          element={<Suspense fallback={<LoadingSpinner />}><UsersList /></Suspense>}
        />
      } />

      <Route path="/technologies" element={
        <ProtectedLayoutRoute
          checkAccess={() => isAdmin() || isUser()}
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Technologies />
            </Suspense>
          }
        />
      } />

      <Route path="/user-technologies" element={
        <ProtectedLayoutRoute
          checkAccess={isAdmin}
          element={<Suspense fallback={<LoadingSpinner />}><UserTechnologyList /></Suspense>}
        />
      } />

    </Routes>
  );
}

export default App;
