import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers, setLoading, setPage } from "../store/userSlice";
import api from "../../services/AxiosInstance";
import { USERS } from "../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";

import { useNavigate } from "react-router-dom";
import { FiMoreVertical, FiEye, FiSlash, FiCheckCircle } from "react-icons/fi";

const Users = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { users, loading, totalUsers, page, limit } = useSelector((state) => state.users);

    const [activeDropdown, setActiveDropdown] = useState(null);

    const fetchUsers = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(`${USERS}?page=${page}&limit=${limit}`);
            const payload = response.data;

            const usersData = Array.isArray(payload)
                ? payload
                : payload?.data || payload?.users || [];

            const total =
                (Array.isArray(payload) ? payload.length : (payload?.totalUsers ?? payload?.total)) ??
                usersData.length;

            dispatch(
                setUsers({
                    users: usersData,
                    total,
                    limit: payload?.limit || limit || 10,
                }),
            );
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, page, limit]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handlePageChange = (newPage) => {
        dispatch(setPage(newPage + 1));
    };

    const handleToggleBlock = async (userId) => {
        try {
            await api.patch(`${USERS}/${userId}/block`);
            toast.success("User status updated");
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user status");
        }
    };

    const safeLimit = limit || 10;
    const totalPages = Math.max(1, Math.ceil((totalUsers || 0) / safeLimit));

    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Users</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage your registered customers and their accounts.</p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 text-slate-500">
                                <tr>
                                    <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100 rounded-tl-2xl">User</th>
                                    <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Contact</th>
                                    <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Role</th>
                                    <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Status</th>
                                    <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Joined Date</th>
                                    <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100 text-right rounded-tr-2xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                                                <p className="text-sm mt-2 font-medium">Loading users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-semibold">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id || user.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800 text-[14px] capitalize">{user.name || "Unknown"}</span>
                                                    <span className="text-[11px] text-slate-400 font-mono tracking-wider mt-0.5">
                                                        ID: {(user._id || user.id || "").slice(-8) || "-"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-medium">{user.email || "-"}</span>
                                                    <span className="text-[12px] text-slate-400 font-medium mt-0.5">{user.phone || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {user.role || "User"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${!user.isBlocked ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                    {user.isBlocked ? "Blocked" : "Active"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-[13px] font-medium">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === (user._id || user.id) ? null : (user._id || user.id))}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all focus:outline-none cursor-pointer"
                                                >
                                                    <FiMoreVertical className="w-5 h-5" />
                                                </button>

                                                {activeDropdown === (user._id || user.id) && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveDropdown(null)}
                                                        ></div>
                                                        <div className="absolute right-8 top-10 w-40 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-100/50 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                                            <button
                                                                onClick={() => {
                                                                    navigate(`/users/${user._id || user.id}`, { state: { user } });
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors flex items-center gap-2.5 font-semibold cursor-pointer"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                                View Details
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleToggleBlock(user._id || user.id);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors flex items-center gap-2.5 font-semibold cursor-pointer ${user.isBlocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'}`}
                                                            >
                                                                {user.isBlocked ? (
                                                                    <><FiCheckCircle className="w-4 h-4" /> Unblock</>
                                                                ) : (
                                                                    <><FiSlash className="w-4 h-4" /> Block</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                        <Pagination
                            pageCount={totalPages}
                            pageValue={page - 1}
                            setPage={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;
