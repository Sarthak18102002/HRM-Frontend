// import { jwtDecode } from "jwt-decode"; 

// export const getUserRoles = () => {
//   const token = localStorage.getItem("authToken");
//   if (!token) return [];
//   try {
//     const decoded = jwtDecode(token); 
//     return decoded?.roles || [];
//   } catch (err) {
//     console.error("Token decode error:", err);
//     return [];
//   }
// };


import { jwtDecode } from "jwt-decode"; 

export const getUserRoles  = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload.roles?.[0]?.toLowerCase() || null;
  } catch {
    return null;
  }
};

export const isAdmin = () => getUserRoles () === "admin";
export const isUser = () => getUserRoles () === "user";
export const isInterviewer = () => getUserRoles () === "interviewer";

