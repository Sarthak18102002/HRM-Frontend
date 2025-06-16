import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/authService";
import Layout from "../components/Layout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email);
      if (
        response.data &&
        (response.data.status === 200 ||
          response.data.message === "Password reset link sent")
      ) {
        setMessage("Password reset link has been sent to your email.");
      } else {
        setError("Password reset request failed. Please try again.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAuthenticated = !!localStorage.getItem("authToken");

  const content = (
       <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl  p-10 transform transition-transform hover:scale-[1.02] duration-300">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-indigo-700 mb-2 tracking-wide">
            Forgot Password
          </h2>
          <h2 className="text-xs  text-indigo-700 mb-2 tracking-wide">
            Enter your email address and we’ll send you a link to reset your password.
          </h2>
          {/* <p className="text-indigo-600 text-lg font-medium">
            
          </p> */}
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
            <label htmlFor="email-address" className="block text-sm font-semibold text-indigo-700 mb-2">
              Email Address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 placeholder-indigo-400 text-indigo-900 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-lg font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 disabled:bg-indigo-400 transition"
          >
            {isSubmitting ? "Sending..." : "Send Reset Password Link"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-500 font-semibold underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
     </div>
  );

  return isAuthenticated ? <Layout>{content}</Layout> : content;
};

export default ForgotPassword;
