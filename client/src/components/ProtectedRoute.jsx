import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050810]">
        <div className="text-white text-xl">Loading ERED BLOO...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'user') return <Navigate to={user?.role === 'super-admin' ? '/super-admin' : '/admin'} replace />;
  return <Outlet />;
};

export default ProtectedRoute;
