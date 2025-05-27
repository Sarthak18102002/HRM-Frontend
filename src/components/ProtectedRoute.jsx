
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ element, redirectPath = "/login", checkAccess }) => {
//   const canAccess = checkAccess();

//   return canAccess ? element : <Navigate to={redirectPath} replace />;
// };

// export default ProtectedRoute;



import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element, redirectPath = "/login", checkAccess }) => {
  const canAccess = checkAccess();

  return canAccess ? element : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;
