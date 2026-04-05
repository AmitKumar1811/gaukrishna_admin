import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers, setLoading, setPage } from "../store/userSlice";
import api from "../../services/AxiosInstance";
import { USERS } from "../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";

const Users = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { users, loading, totalUsers, page, limit } = useSelector((state) => state.users);

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
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Users</h1>
                    <p className="text-gray-500 text-sm">Manage your registered customers</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <ThreeDots height="40" width="40" radius="9" color="#0f6845" ariaLabel="three-dots-loading" visible={true} />
                                        <p className="text-sm mt-2">Loading users...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id || user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{user.name || "Unknown"}</span>
                                            <span className="text-xs text-gray-400 font-mono tracking-tighter uppercase">
                                                ID: {(user._id || user.id || "").slice(-8) || "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.email || "-"}</span>
                                            <span className="text-xs text-[#0f6845] font-bold mt-0.5">{user.phone || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {user.role || "User"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${!user.isBlocked ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                            {user.isBlocked ? "Blocked" : "Active"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() =>
                                                    navigate(`/users/${user._id || user.id}`, {
                                                        state: { user },
                                                    })
                                                }
                                                className="text-[#0f6845] hover:text-purple-800 font-bold text-xs uppercase transition-all cursor-pointer"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleToggleBlock(user._id || user.id)}
                                                className={`${user.isBlocked ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'} font-bold text-xs uppercase transition-all cursor-pointer`}
                                            >
                                                {user.isBlocked ? "Unblock" : "Block"}
                                            </button>
                                        </div>
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
