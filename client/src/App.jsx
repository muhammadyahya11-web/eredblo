import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import SuperAdminLayout from './components/SuperAdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';
import './App.css';
import './Pages.css';
const Home = lazy(() => import('./Pages/Mainweb/Home'));
const Login = lazy(() => import('./Pages/Auth/Login'));
const Register = lazy(() => import('./Pages/Auth/Register'));
const VerifyOTP = lazy(() => import('./Pages/Auth/VerifyOTP'));
const ForgotPassword = lazy(() => import('./Pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./Pages/Auth/ResetPassword'));
const About = lazy(() => import('./Pages/Mainweb/About'));
const Contact = lazy(() => import('./Pages/Mainweb/Contact'));
const Dashboard = lazy(() => import('./Pages/user/Dashboard'));
const Deposit = lazy(() => import('./Pages/user/Deposit'));
const Withdraw = lazy(() => import('./Pages/user/Withdraw'));
const Transactions = lazy(() => import('./Pages/user/Transactions'));
const Earnings = lazy(() => import('./Pages/user/Earnings'));
const MyTeam = lazy(() => import('./Pages/user/MyTeam'));
const MyInvestments = lazy(() => import('./Pages/user/MyInvestments'));
const Settings = lazy(() => import('./Pages/user/Settings'));
const Bonuses = lazy(() => import('./Pages/user/Bonuses'));
const Profile = lazy(() => import('./Pages/user/Profile'));
const Support = lazy(() => import('./Pages/user/Support'));
const Notifications = lazy(() => import('./Pages/user/Notifications'));
const AdminDashboard = lazy(() => import('./Pages/Admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./Pages/Admin/AdminUsers'));
const AdminDeposits = lazy(() => import('./Pages/Admin/AdminDeposits'));
const AdminWithdrawals = lazy(() => import('./Pages/Admin/AdminWithdrawals'));
const AdminTransactions = lazy(() => import('./Pages/Admin/AdminTransactions'));
const AdminPlans = lazy(() => import('./Pages/Admin/AdminPlans'));
const AdminEarnings = lazy(() => import('./Pages/Admin/AdminEarnings'));
const AdminSupport = lazy(() => import('./Pages/Admin/AdminSupport'));
const AdminNotifications = lazy(() => import('./Pages/Admin/AdminNotifications'));
const AdminSettings = lazy(() => import('./Pages/Admin/AdminSettings'));
const AdminGifts = lazy(() => import('./Pages/Admin/AdminGifts'));
const SuperAdminDashboard = lazy(() => import('./Pages/SuperAdmin/Dashboard'));
const SuperAdminAdmins = lazy(() => import('./Pages/SuperAdmin/Admins'));
const SuperAdminUsers = lazy(() => import('./Pages/SuperAdmin/Users'));
const SuperAdminDeposits = lazy(() => import('./Pages/SuperAdmin/Deposits'));
const SuperAdminWithdrawals = lazy(() => import('./Pages/SuperAdmin/Withdrawals'));
const SuperAdminTransactions = lazy(() => import('./Pages/SuperAdmin/Transactions'));
const SuperAdminPlans = lazy(() => import('./Pages/SuperAdmin/Plans'));
const SuperAdminEarnings = lazy(() => import('./Pages/SuperAdmin/Earnings'));
const SuperAdminSupport = lazy(() => import('./Pages/SuperAdmin/Support'));
const SuperAdminNotifications = lazy(() => import('./Pages/SuperAdmin/Notifications'));
const SuperAdminSettings = lazy(() => import('./Pages/SuperAdmin/Settings'));

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
      <Suspense fallback={<div className="min-h-screen bg-[#050810] flex items-center justify-center text-slate-400">Loading...</div>}>
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
            <Route path="gifts" element={<AdminGifts />} />
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
            <Route path="gifts" element={<AdminGifts />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>
        </Route>

        {/* Catch-all: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </Suspense>
    </>
  );
}

export default App;
