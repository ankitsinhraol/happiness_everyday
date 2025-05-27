import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  vendorOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  vendorOnly = false 
}) => {
  const { user, isLoading, isVendor } = useAuth();

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If route requires vendor role but user is not a vendor
  if (vendorOnly && !isVendor) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is a vendor but tries to access regular user dashboard
  if (!vendorOnly && isVendor) {
    return <Navigate to="/vendor-dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;