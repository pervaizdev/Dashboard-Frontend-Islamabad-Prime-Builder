"use client";

import { useEffect, useState } from "react";
import { userAPI } from "@/api/user";
import toast from "react-hot-toast";
import { 
  Loader2, 
  Search, 
  Edit, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Settings, 
  X,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Modal form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    isActive: true,
    isBlocked: false,
    role: "user"
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
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      isActive: user.isActive ?? true,
      isBlocked: user.isBlocked ?? false,
      role: user.role || "user"
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await userAPI.updateUser(selectedUser.userId, formData);
      if (response.success) {
        toast.success("User updated successfully!");
        setIsModalOpen(false);
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = (users || []).filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(u.userId).includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Client Management</h1>
            <p className="mt-2 text-slate-500">Manage your system users, their roles, and status.</p>
          </div>

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
                          {user.role}
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
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-yellow-600 hover:text-white hover:shadow-lg hover:shadow-yellow-600/20 transition-all border border-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
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

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl premium-border-glow overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500" />
              
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <form onSubmit={handleSubmit} className="p-8 sm:p-12">
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
                      <UserIcon className="h-3 w-3" /> Display Name
                    </label>
                    <input 
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Mail className="h-3 w-3" /> Email Address
                    </label>
                    <input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Phone className="h-3 w-3" /> Phone Number
                    </label>
                    <input 
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Settings className="h-3 w-3" /> Access Role
                    </label>
                    <div className="relative group">
                      <select 
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
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
                     ${formData.isActive ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className={`h-5 w-5 ${formData.isActive ? "text-emerald-500" : "text-slate-300"}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Account Active</span>
                      </div>
                      <input 
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded-md border-slate-300 accent-emerald-500"
                      />
                   </label>

                   <label className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer shadow-sm
                     ${formData.isBlocked ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                      <div className="flex items-center gap-3">
                        <ShieldAlert className={`h-5 w-5 ${formData.isBlocked ? "text-rose-500" : "text-slate-300"}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Blocked Status</span>
                      </div>
                      <input 
                        name="isBlocked"
                        type="checkbox"
                        checked={formData.isBlocked}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded-md border-slate-300 accent-rose-500"
                      />
                   </label>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                    {updating ? "Saving Changes..." : "Update Details"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
