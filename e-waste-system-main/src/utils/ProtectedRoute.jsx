import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    const role = localStorage.getItem("role");
    if (role !== requiredRole) {
      return <Navigate to="/" />;
    }
  }

  return children;
}

export default ProtectedRoute;