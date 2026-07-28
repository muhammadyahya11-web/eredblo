import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import SuperAdminLayout from './components/SuperAdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';
import Dashboard from './Pages/user/Dashboard';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import AdminUsers from './Pages/Admin/AdminUsers';
import AdminDeposits from './Pages/Admin/AdminDeposits';
import AdminWithdrawals from './Pages/Admin/AdminWithdrawals';
import AdminTransactions from './Pages/Admin/AdminTransactions';
import AdminPlans from './Pages/Admin/AdminPlans';
import AdminEarnings from './Pages/Admin/AdminEarnings';
import AdminSupport from './Pages/Admin/AdminSupport';
import AdminNotifications from './Pages/Admin/AdminNotifications';
import AdminSettings from './Pages/Admin/AdminSettings';
import SuperAdminDashboard from './Pages/SuperAdmin/Dashboard';
import SuperAdminAdmins from './Pages/SuperAdmin/Admins';
import SuperAdminUsers from './Pages/SuperAdmin/Users';
import SuperAdminDeposits from './Pages/SuperAdmin/Deposits';
import SuperAdminWithdrawals from './Pages/SuperAdmin/Withdrawals';
import SuperAdminTransactions from './Pages/SuperAdmin/Transactions';
import SuperAdminPlans from './Pages/SuperAdmin/Plans';
import SuperAdminEarnings from './Pages/SuperAdmin/Earnings';
import SuperAdminSupport from './Pages/SuperAdmin/Support';
import SuperAdminNotifications from './Pages/SuperAdmin/Notifications';
import SuperAdminSettings from './Pages/SuperAdmin/Settings';
import Deposit from './Pages/user/Deposit';
import Withdraw from './Pages/user/Withdraw';
import Transactions from './Pages/user/Transactions';
import Earnings from './Pages/user/Earnings';
import MyTeam from './Pages/user/MyTeam';
import MyInvestments from './Pages/user/MyInvestments';
import Settings from './Pages/user/Settings';
import Bonuses from './Pages/user/Bonuses';
import Profile from './Pages/user/Profile';
import Support from './Pages/user/Support';
import Notifications from './Pages/user/Notifications';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import VerifyOTP from './Pages/Auth/VerifyOTP';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';
import './App.css';
import './Pages.css';
import Home from './Pages/Mainweb/Home';
import About from './Pages/Mainweb/About';
import Contact from './Pages/Mainweb/Contact';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0B1320',
            color: '#fff',
            border: '1px solid #1c2333',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="my-team" element={<MyTeam />} />
            <Route path="my-investments" element={<MyInvestments />} />
            <Route path="settings" element={<Settings />} />
            <Route path="bonuses" element={<Bonuses />} />
            <Route path="profile" element={<Profile />} />
            <Route path="support" element={<Support />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="deposits" element={<AdminDeposits />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="earnings" element={<AdminEarnings />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Super Admin Routes */}
        <Route element={<SuperAdminProtectedRoute />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="admins" element={<SuperAdminAdmins />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="deposits" element={<SuperAdminDeposits />} />
            <Route path="withdrawals" element={<SuperAdminWithdrawals />} />
            <Route path="transactions" element={<SuperAdminTransactions />} />
            <Route path="plans" element={<SuperAdminPlans />} />
            <Route path="earnings" element={<SuperAdminEarnings />} />
            <Route path="support" element={<SuperAdminSupport />} />
            <Route path="notifications" element={<SuperAdminNotifications />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>
        </Route>

        {/* Catch-all: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
