import React, { useState, useEffect } from "react";
import { Search, Shield, ShieldOff, Mail, UserX } from "lucide-react";
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async () => {
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await adminAPI.getUsers(params);
      if (data.success) setUsers(data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      const { data } = await adminAPI.updateUserStatus(id, newStatus);
      if (data.success) {
        setUsers((prev) => prev.map((u) => u._id === id ? { ...u, status: newStatus } : u));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'rejected';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
        <p className="text-slate-400 text-sm mt-1">Manage and monitor all registered users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setLoading(true); }}
            className="w-full bg-[#050810] border border-blue-500/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setLoading(true); }}
          className="bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
          className="bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden hover:border-blue-500/20 transition-all duration-500">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-slate-400">No users found</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-blue-500/5 rounded-lg transition-all duration-300">
                      <td>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </td>
                      <td><span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400">{u.role}</span></td>
                      <td className="text-slate-300">PKR {(u.totalBalance || 0).toLocaleString()}</td>
                      <td><span className={`status-badge ${statusClass(u.status)}`}>{u.status}</span></td>
                      <td className="text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(u._id, u.status)}
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all"
                            title={u.status === 'blocked' ? 'Unblock' : 'Block'}
                          >
                            {u.status === 'blocked' ? <Shield size={16} /> : <ShieldOff size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
