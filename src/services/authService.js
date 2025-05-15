// src/services/authService.js

import axiosInstance from "../utils/axiosInstance";

export const loginUser = (email, password) => {
  return axiosInstance.post("/auth/login", { email, password });
};

export const registerUser = (userData) => {
  return axiosInstance.post("/auth/register", userData);
};

export const verifyOtp = (email, otp) => {
  return axiosInstance.post("/auth/verify-otp", { email, otp });
};

export const resendOtp = (email) => {
  return axiosInstance.post("/auth/resend-otp", { email });
};

export const requestPasswordReset = (email) => {
  return axiosInstance.post("/auth/forgot-password", { email });
};

export const resetPassword = (token, newPassword) => {
  return axiosInstance.post("/auth/reset-password", {
    token,
    newPassword,
  });
};

export const updateUserProfile = (userId, profileData) => {
  return axiosInstance.put(`/profile/update`, profileData);
};
