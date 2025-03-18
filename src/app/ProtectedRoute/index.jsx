import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    toast.error("Please login to access this page"); // Show toast error
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
