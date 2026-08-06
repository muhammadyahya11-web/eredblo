import React, { useState, useEffect } from "react";
import { Search, Shield, ShieldOff, Mail, UserX, Pencil, Trash2 } from "lucide-react";
import { adminAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', cnic: '', role: '', status: '', isVerified: false });
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);

  const fetchUsers = async () => {
    try {
      const params = { page, limit };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await adminAPI.getUsers(params);
      if (data.success) {
        setUsers(data.data);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, page, limit]);

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

  const openEdit = (u) => {
    setEditing(u);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      cnic: u.cnic || '',
      role: u.role || 'user',
      status: u.status || 'active',
      isVerified: !!u.isVerified,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await adminAPI.updateUser(editing._id, editForm);
      if (data.success) {
        setUsers((prev) => prev.map((u) => u._id === data.data._id ? data.data : u));
        toast.success(data.message);
        setEditing(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const { data } = await adminAPI.deleteUser(deleting._id);
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== deleting._id));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
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
            onChange={(e) => { setSearch(e.target.value); setPage(1); setLoading(true); }}
            className="w-full bg-[#050810] border border-blue-500/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); setLoading(true); }}
          className="bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); setLoading(true); }}
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
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-yellow-400 transition-all"
                            title="Edit user"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleting(u)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
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

      <Pagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md bg-[#0d1530] border border-blue-500/20 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white">Edit User</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Name</label>
                <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Email</label>
                <input name="email" type="email" value={editForm.email} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Phone</label>
                <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">CNIC</label>
                <input name="cnic" value={editForm.cnic} onChange={handleEditChange} placeholder="00000-0000000-0" className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-400">Role</label>
                  <select name="role" value={editForm.role} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400">Status</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="isVerified" checked={editForm.isVerified} onChange={handleEditChange} />
                Verified
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleting(null)}>
          <div className="w-full max-w-sm bg-[#0d1530] border border-red-500/20 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white">Delete User</h2>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">{deleting.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
