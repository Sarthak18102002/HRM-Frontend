import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (verificationStatus && verificationStatus.success) {
      const redirectTimer = setTimeout(() => {
        localStorage.removeItem("emailForOtp");
        navigate("/login");
      }, 2500);

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
      alert("OTP has been resent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to resend OTP");
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
      setVerificationStatus({
        success: true,
        code: response.data?.code || "SUCCESS",
        message: response.data?.message || "Verification successful!",
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Verification failed");
      setVerificationStatus({
        success: false,
        code: err.response?.data?.code || "ERROR",
        message: err.response?.data?.message || err.message || "Verification failed",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const VerificationAnimation = () => {
    const animationState = verificationStatus.success ? "success" : "error";

    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-white rounded-xl shadow-xl">
        {animationState === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700">Verified Successfully!</h2>
            <p className="text-gray-700 text-center max-w-xs">{verificationStatus.message}</p>
            <p className="text-gray-500 italic">Redirecting to login...</p>
          </>
        )}

        {animationState === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <X className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-700">Verification Failed</h2>
            <p className="text-gray-700 text-center max-w-xs">{verificationStatus.message}</p>
            <button
              className="mt-6 px-6 py-2 rounded-md text-indigo-700 font-semibold bg-indigo-100 hover:bg-indigo-200 transition"
              onClick={() => setVerificationStatus(null)}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
        {!verificationStatus ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-indigo-900 tracking-wide">Verify Your Account</h2>
              <p className="mt-2 text-gray-600 text-sm sm:text-base">
                Enter the 6-digit code sent to <span className="font-semibold text-indigo-700">{email}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-3 mb-6 text-red-700 rounded-lg shadow-sm">
                {error}
              </div>
            )}

            <form
              className="space-y-6"
              onSubmit={handleSubmit}
              onPaste={handlePaste}
              noValidate
            >
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-indigo-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-400 transition-shadow shadow-md"
                    required
                    autoComplete="one-time-code"
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={otp.some((digit) => !digit) || isVerifying}
                className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                  otp.some((digit) => !digit) || isVerifying
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                }`}
              >
                {isVerifying ? (
                  <span className="flex justify-center items-center space-x-2">
                    <Loader className="animate-spin h-5 w-5" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  "Verify Code"
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className={`w-full mt-3 text-center font-medium text-indigo-600 ${
                  isResending ? "opacity-70 cursor-not-allowed" : "hover:text-indigo-800"
                }`}
              >
                {isResending ? (
                  <span className="flex justify-center items-center space-x-2">
                    <Loader className="animate-spin h-5 w-5" />
                    <span>Resending...</span>
                  </span>
                ) : (
                  "Didn't receive a code? Resend"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-500 text-sm">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Back to Login
              </Link>
            </p>
          </>
        ) : (
          <VerificationAnimation />
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
