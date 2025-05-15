export const getUserIdFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId; // make sure this matches the claim in your backend token
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};
