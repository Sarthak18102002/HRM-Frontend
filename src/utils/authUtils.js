import { jwtDecode } from "jwt-decode"; // ✅ Correct import for named export

export const getUserRoles = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return [];
  try {
    const decoded = jwtDecode(token); // ✅ works now
    return decoded?.roles || [];
  } catch (err) {
    console.error("Token decode error:", err);
    return [];
  }
};
