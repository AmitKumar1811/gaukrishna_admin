import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";

import api from "../../services/AxiosInstance";
import { USERS } from "../services/Admin/adminEndPoints";

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const seededUser = useMemo(() => location.state?.user, [location.state?.user]);
    const [user, setUser] = useState(seededUser || null);
    const [loading, setLoading] = useState(!seededUser);

    const formatDateTime = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleString();
    };

    const fetchUser = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await api.get(`${USERS}/${id}`);
            const payload = response.data;
            const resolvedUser = payload?.data || payload?.user || payload;
            setUser(resolvedUser || null);
        } catch (error) {
            console.error(error);
            // Fallback for older backend signature
            try {
                const response = await api.get(`${USERS}/getUser?_id=${id}`);
                const payload = response.data;
                const resolvedUser = payload?.data || payload?.user || payload;
                setUser(resolvedUser || null);
            } catch (fallbackError) {
                console.error(fallbackError);
                toast.error("Failed to fetch user details");
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!seededUser) fetchUser();
    }, [fetchUser, seededUser]);

    const handleToggleBlock = async () => {
        if (!id) return;
        try {
            await api.patch(`${USERS}/${id}/block`);
            toast.success("User status updated");
            await fetchUser();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user status");
        }
    };

    const addresses = user?.addresses || [];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
                    <p className="text-gray-500 text-sm">
                        ID: <span className="font-mono">{id}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/users")}
                        className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleToggleBlock}
                        disabled={loading}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border ${user?.isBlocked
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            } disabled:opacity-60`}
                    >
                        {user?.isBlocked ? "Unblock" : "Block"}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex justify-center">
                    <ThreeDots height="50" width="50" radius="9" color="#0f6845" ariaLabel="three-dots-loading" visible={true} />
                </div>
            ) : !user ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
                    User not found.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/40">
                            <h2 className="text-sm font-black uppercase tracking-wider text-gray-600">Profile</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</p>
                                <p className="text-sm font-bold text-gray-900 mt-1">{user.name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</p>
                                <p className="text-sm font-bold text-gray-900 mt-1">{user.role || "user"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                                <p className="text-sm font-bold text-gray-900 mt-1 break-all">{user.email || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                                <p className="text-sm font-bold text-gray-900 mt-1">{user.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</p>
                                <span
                                    className={`inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${user.isBlocked
                                            ? "bg-red-50 text-red-700 border-red-100"
                                            : "bg-green-50 text-green-700 border-green-100"
                                        }`}
                                >
                                    {user.isBlocked ? "Blocked" : "Active"}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Google ID</p>
                                <p className="text-sm font-mono text-gray-800 mt-1 break-all">{user.googleId || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</p>
                                <p className="text-sm font-bold text-gray-900 mt-1">{formatDateTime(user.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Updated</p>
                                <p className="text-sm font-bold text-gray-900 mt-1">{formatDateTime(user.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-wider text-gray-600">Addresses</h2>
                            <span className="text-xs font-bold text-gray-400">{addresses.length}</span>
                        </div>
                        <div className="p-6">
                            {addresses.length === 0 ? (
                                <p className="text-sm text-gray-500">No addresses.</p>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id || `${addr.type}-${addr.pincode}`}
                                            className={`p-4 rounded-xl border ${addr.isDefault ? "border-purple-200 bg-purple-50/40" : "border-gray-100 bg-gray-50/30"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-extrabold text-gray-900">{addr.type || "Address"}</p>
                                                {addr.isDefault ? (
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                                        Default
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">
                                                {(addr.name || "-")} • {(addr.phone || "-")}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-2">
                                                {addr.addressLine1 || "-"}
                                                {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {(addr.city || "-")}, {(addr.state || "-")} - {(addr.pincode || "-")}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetail;
