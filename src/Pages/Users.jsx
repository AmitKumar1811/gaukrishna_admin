import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers, setLoading, setPage } from "../store/userSlice";
import api from "../../services/AxiosInstance";
import { USERS } from "../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { EllipsisVerticalIcon, EyeIcon, NoSymbolIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const Users = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { users, loading, totalUsers, page, limit } = useSelector((state) => state.users);

    // Dropdown state
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
            // Assuming endpoint for toggle block exists
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
        return date.toLocaleString();
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Users</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage your registered customers</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/40 border border-slate-100 overflow-visible">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-2xl">User</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined Date</th>
                            <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <ThreeDots height="40" width="40" radius="9" color="#0f6845" ariaLabel="three-dots-loading" visible={true} />
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
                                <tr key={user._id || user.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800 text-[15px]">{user.name || "Unknown"}</span>
                                            <span className="text-[11px] text-slate-400 font-mono tracking-wider mt-0.5">
                                                ID: {(user._id || user.id || "").slice(-8) || "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.email || "-"}</span>
                                            <span className="text-xs text-[#0f6845] font-semibold mt-0.5">{user.phone || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {user.role || "User"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${!user.isBlocked ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${!user.isBlocked ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                                            {user.isBlocked ? "Blocked" : "Active"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === (user._id || user.id) ? null : (user._id || user.id))}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all focus:outline-none"
                                        >
                                            <EllipsisVerticalIcon className="w-5 h-5" />
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
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-[#0f6845] transition-colors flex items-center gap-2 font-medium"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleToggleBlock(user._id || user.id);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 font-medium ${user.isBlocked ? 'text-emerald-600 hover:bg-emerald-50/80' : 'text-red-600 hover:bg-red-50/80'}`}
                                                    >
                                                        {user.isBlocked ? (
                                                            <><CheckCircleIcon className="w-4 h-4" /> Unblock</>
                                                        ) : (
                                                            <><NoSymbolIcon className="w-4 h-4" /> Block</>
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
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                    <Pagination
                        pageCount={totalPages}
                        pageValue={page - 1}
                        setPage={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default Users;
