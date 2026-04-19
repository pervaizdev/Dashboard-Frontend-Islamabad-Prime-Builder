"use client";

import { useEffect, useState } from "react";
import { userAPI } from "@/api/user";
import { authAPI } from "@/api/auth";
import toast from "react-hot-toast";
import {
  Loader2,
  Search,
  Edit,
  Trash2,
  User as UserIcon,
  Mail,
  Phone,
  Settings,
  X,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Plus,
  Lock
} from "lucide-react";
import { countryCodes } from "@/constants/countryCodes";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    countryCode: "+92",
    phone: "",
    isActive: true,
    isBlocked: false,
    role: "user"
  });

  // Add form state
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    countryCode: "+92",
    phone: "",
    password: ""
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      if (response.success) {
        setUsers(response.users || []);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setSelectedUser(user);

    // Try to extract country code from phone
    let phoneNum = user.phone || "";
    let cCode = "+92";

    for (const country of countryCodes) {
      if (phoneNum.startsWith(country.code)) {
        cCode = country.code;
        phoneNum = phoneNum.slice(country.code.length);
        break;
      }
    }

    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      countryCode: cCode,
      phone: phoneNum,
      isActive: user.isActive ?? true,
      isBlocked: user.isBlocked ?? false,
      role: user.role || "user"
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const payload = {
        ...editFormData,
        phone: `${editFormData.countryCode}${editFormData.phone}`
      };
      const response = await userAPI.updateUser(selectedUser.userId, payload);
      if (response.success) {
        toast.success("User updated successfully!");
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.phone || !addFormData.password) {
      toast.error("Please fill Name, Phone and Password");
      return;
    }
    setProcessing(true);
    try {
      const payload = {
        ...addFormData,
        phone: `${addFormData.countryCode}${addFormData.phone}`
      };
      const response = await authAPI.signUp(payload);
      if (response.success) {
        toast.success("Client added successfully!");
        setIsAddModalOpen(false);
        setAddFormData({ name: "", email: "", countryCode: "+92", phone: "", password: "" });
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || "Failed to add client");
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = (users || []).filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(u.userId).includes(searchTerm)
  );

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setProcessing(true);
    try {
      const response = await userAPI.deleteUser(selectedUser.userId);
      if (response.success) {
        toast.success("User deleted successfully");
        setIsDeleteModalOpen(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Islamabad Prime Builder Client Management
            </h1>
            <p className="mt-2 text-slate-500">Manage your system users and add new clients.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Add Client
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-yellow-600" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all shadow-sm"
          />
        </div>

        {/* User Table Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">User Info</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} className="px-8 py-6">
                          <div className="h-4 bg-slate-100 rounded w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={user.userId}
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm text-yellow-600 font-bold uppercase">
                            {user.name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{user.name}</span>
                            <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm
                          ${user.role === "super-admin" ? "bg-purple-50 text-purple-600 border-purple-100" :
                            user.role === "admin" ? "bg-blue-50 text-blue-600 border-blue-100" :
                              "bg-slate-50 text-slate-600 border-slate-100"}`}
                        >
                          {user.role === "super-admin" ? <ShieldCheck className="h-3 w-3" /> : (user.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />)}
                          {user.role === "admin" ? "Partners" : user.role}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-slate-300"} shadow-sm`}></div>
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${user.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          {user.isBlocked && (
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="h-3 w-3 text-rose-500" />
                              <span className="text-[10px] font-bold uppercase text-rose-500">Blocked</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-yellow-600 hover:text-white hover:shadow-lg transition-all border border-slate-100"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white hover:shadow-lg transition-all border border-slate-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <Search className="h-12 w-12 text-slate-200 mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No users found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsEditModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-4xl shadow-2xl premium-border-glow overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-yellow-500 via-yellow-600 to-yellow-500" />

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <form onSubmit={handleEditSubmit} className="p-8 sm:p-12">
                <div className="mb-10 flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm">
                    <UserIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Edit Client Details</h2>
                    <p className="text-sm text-slate-500 mt-1">Updates will reflect across all systems</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Display Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="countryCode"
                        value={editFormData.countryCode}
                        onChange={handleEditChange}
                        className="w-[100px] bg-slate-50 border border-slate-100 rounded-2xl px-2 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all appearance-none cursor-pointer"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code + c.label} value={c.code}>{c.label} ({c.code})</option>
                        ))}
                      </select>
                      <input
                        name="phone"
                        type="tel"
                        value={editFormData.phone}
                        onChange={handleEditChange}
                        placeholder="3001234567"
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Access Role
                    </label>
                    <div className="relative group">
                      <select
                        name="role"
                        value={editFormData.role}
                        onChange={handleEditChange}
                        className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                      >
                        <option value="user">User</option>
                        <option value="admin">Partners</option>
                        <option value="super-admin">Super Admin</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ArrowRight className="h-3 w-3 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-4 mb-10">
                  <label className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer shadow-sm
                     ${editFormData.isActive ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                    </div>
                    <input
                      name="isActive"
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={handleEditChange}
                      className="w-4 h-4"
                    />
                  </label>
                  <label className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer shadow-sm
                     ${editFormData.isBlocked ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Blocked</span>
                    </div>
                    <input
                      name="isBlocked"
                      type="checkbox"
                      checked={editFormData.isBlocked}
                      onChange={handleEditChange}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {processing ? "Saving..." : "Update Details"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsAddModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-4xl shadow-2xl premium-border-glow overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-yellow-500 via-yellow-600 to-yellow-500" />

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <form onSubmit={handleAddSubmit} className="p-8 sm:p-12">
                <div className="mb-10 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">Add New Client</h2>
                  <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold text-[9px]">Join the elite network</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Full Name *</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          name="name"
                          value={addFormData.name}
                          onChange={handleAddChange}
                          type="text"
                          placeholder="Imran Khan"
                          className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50/50 pl-11 pr-4 text-[13px] text-slate-800 outline-none transition-all focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/5 font-semibold"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Email (Optional)</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          name="email"
                          value={addFormData.email}
                          onChange={handleAddChange}
                          type="email"
                          placeholder="imran@example.com"
                          className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50/50 pl-11 pr-4 text-[13px] text-slate-800 outline-none transition-all focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/5 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Phone Number *</label>
                      <div className="flex gap-2">
                        <select
                          name="countryCode"
                          value={addFormData.countryCode}
                          onChange={handleAddChange}
                          className="w-[90px] h-11 rounded-xl border border-slate-100 bg-slate-50/50 px-2 text-[11px] font-bold text-slate-800 outline-none transition-all focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/5 appearance-none cursor-pointer"
                        >
                          {countryCodes.map((c) => (
                            <option key={c.code + c.label} value={c.code}>{c.label} ({c.code})</option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            name="phone"
                            value={addFormData.phone}
                            onChange={handleAddChange}
                            type="text"
                            placeholder="3001234567"
                            className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50/50 pl-11 pr-4 text-[13px] text-slate-800 outline-none transition-all focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/5 font-semibold"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          name="password"
                          value={addFormData.password}
                          onChange={handleAddChange}
                          type="password"
                          placeholder="••••••••"
                          className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50/50 pl-11 pr-4 text-[13px] text-slate-800 outline-none transition-all focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/5 font-semibold"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {processing ? "Adding..." : "Add Client"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsDeleteModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-4xl shadow-2xl overflow-hidden p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <Trash2 className="h-10 w-10 text-rose-500" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">Delete User?</h2>
              <p className="text-slate-500 mb-8 px-4 text-sm">
                Are you sure you want to delete <span className="font-bold text-slate-800">{selectedUser?.name}</span>? This action is permanent and cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
                >
                  No, Keep User
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={processing}
                  className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
