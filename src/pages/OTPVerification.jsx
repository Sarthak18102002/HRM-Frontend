import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, X, Loader } from "lucide-react";

import { verifyOtp, resendOtp } from "../services/authService";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || localStorage.getItem("emailForOtp");

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  useEffect(() => {
    if (verificationStatus && verificationStatus.success) {
      const redirectTimer = setTimeout(() => {
        // Clear the stored email when verification is complete
        localStorage.removeItem("emailForOtp");
        navigate("/login");
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [verificationStatus, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5].focus();
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Email not found. Please try registering again.");
      return;
    }

    setError("");
    setIsResending(true);

    try {
      const response = await resendOtp(email);
      console.log("OTP resent:", response.data);
      alert("OTP has been resent to your email.");
    } catch (err) {
      console.error("Resend OTP failed:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to resend OTP"
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (!email) {
      setError("Email not found. Please try registering again.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await verifyOtp(email, otpValue);
      console.log("OTP verified:", response.data);

      setVerificationStatus({
        success: true,
        code: response.data?.code || "SUCCESS",
        message: response.data?.message || "Verification successful!",
      });
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(
        err.response?.data?.message || err.message || "Verification failed"
      );
      setVerificationStatus({
        success: false,
        code: err.response?.data?.code || "ERROR",
        message:
          err.response?.data?.message || err.message || "Verification failed",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const VerificationAnimation = () => {
    const animationState = verificationStatus.success ? "success" : "error";

    return (
      <div className="flex flex-col items-center justify-center p-6">
        {animationState === "success" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Verified Successfully!
            </h2>
            <p className="mt-2 text-gray-600">{verificationStatus.message}</p>
            <p className="mt-2 text-gray-500">Redirecting to login...</p>
          </div>
        )}

        {animationState === "error" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Verification Failed
            </h2>
            <p className="mt-2 text-gray-600">{verificationStatus.message}</p>
            {/* <p className="mt-1 text-gray-500">
              Error code: {verificationStatus.code}
            </p> */}
            <button
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
              onClick={() => setVerificationStatus(null)}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-4 sm:p-8 rounded-xl shadow-lg">
        {!verificationStatus ? (
          <>
            <div className="text-center">
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
                Verify Your Account
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">
                Enter the 6-digit verification code sent to{" "}
                <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-2 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}

            <form
              className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
              onSubmit={handleSubmit}
              onPaste={handlePaste}
            >
              <div className="flex justify-center space-x-1 sm:space-x-2 md:space-x-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 text-center text-lg sm:text-xl font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                ))}
              </div>

              <div className="mt-4 sm:mt-6">
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={otp.some((digit) => !digit) || isVerifying}
                >
                  {isVerifying ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <button
                className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500"
                onClick={handleResendOtp}
                disabled={isResending}
              >
                {isResending ? (
                  <span className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Resending...
                  </span>
                ) : (
                  "Didn't receive a code? Resend"
                )}
              </button>
            </div>
          </>
        ) : (
          <VerificationAnimation />
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
