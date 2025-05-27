import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../services/authService";
import Layout from "../components/Layout";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError(
        "Invalid or missing reset token. Please request a new password reset link."
      );
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword(token, newPassword);

      if (response.data && response.data.status === 200) {
        setMessage(
          "Password reset successful. You can now log in with your new password."
        );

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError("Password reset failed. Please try again.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred. Please try again or request a new password reset link."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-6 py-12"> 
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 transform transition-transform hover:scale-[1.02] duration-300">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-indigo-700 mb-2 tracking-wide">
              Reset Your Password
            </h2>
            <p className="text-indigo-600 text-lg font-medium">
              Enter your new password below
            </p>
          </div>

          {message && (
            <div className="mb-6 bg-green-100 border-l-6 border-green-500 p-4 rounded-md text-green-800 text-base font-semibold shadow-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-100 border-l-6 border-red-500 p-4 rounded-md text-red-800 text-base font-semibold shadow-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-semibold text-indigo-700 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 placeholder-indigo-400 text-indigo-900 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition"
                  placeholder="New Password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-2xl text-indigo-500 hover:text-indigo-700 transition"
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? "🔓" : "🔒"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-semibold text-indigo-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 placeholder-indigo-400 text-indigo-900 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-2xl text-indigo-500 hover:text-indigo-700 transition"
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "🔓" : "🔒"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white text-lg font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 disabled:bg-indigo-400 transition"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
