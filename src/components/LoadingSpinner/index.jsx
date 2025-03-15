import React from "react";
import { Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";

const LoadingSpinner = () => {
  const isLoading = useSelector((state) => state.auth.isLoading); // Get loading state

  if (!isLoading) return null; // Hide spinner if not loading

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100vw", 
      height: "100vh", 
      background: "rgba(255, 255, 255, 0.8)", 
      zIndex: 9999 
    }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );
};

export default LoadingSpinner;
