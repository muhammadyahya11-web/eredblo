import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SuperAdminProtectedRoute = () => {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050810]">
        <div className="text-white text-xl">Loading Super Admin Panel...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'super-admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050810]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">403</h1>
          <p className="text-slate-400">Access Denied. Super Admins only.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default SuperAdminProtectedRoute;
