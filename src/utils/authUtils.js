import { jwtDecode } from "jwt-decode"; 

export const getUserRoles = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return [];
  try {
    const decoded = jwtDecode(token); 
    return decoded?.roles || [];
  } catch (err) {
    console.error("Token decode error:", err);
    return [];
  }
};
