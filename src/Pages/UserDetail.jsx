import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft, FiUser, FiMapPin, FiShield, FiShieldOff } from "react-icons/fi";

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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <button
                            onClick={() => navigate("/users")}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-3 group cursor-pointer"
                        >
                            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
                            <span className="text-[13px] font-semibold">Back to Users</span>
                        </button>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Details</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            ID: <span className="font-mono text-[12px] text-slate-400">{id}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleToggleBlock}
                            disabled={loading}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border transition-colors cursor-pointer ${user?.isBlocked
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                } disabled:opacity-60`}
                        >
                            {user?.isBlocked ? <FiShield className="w-4 h-4" /> : <FiShieldOff className="w-4 h-4" />}
                            {user?.isBlocked ? "Unblock" : "Block"}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-20 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                        <span className="text-sm text-slate-400 font-medium">Loading user details...</span>
                    </div>
                ) : !user ? (
                    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-16 text-center">
                        <div className="bg-slate-50 p-4 rounded-full inline-flex mb-3">
                            <FiUser className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        </div>
                        <p className="font-semibold text-slate-600 text-base">User not found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Profile</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</p>
                                    <p className="text-[14px] font-bold text-slate-800 mt-1">{user.name || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role</p>
                                    <p className="text-[14px] font-bold text-slate-800 mt-1 capitalize">{user.role || "user"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                    <p className="text-[14px] font-bold text-slate-800 mt-1 break-all">{user.email || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                    <p className="text-[14px] font-bold text-slate-800 mt-1">{user.phone || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                                    <span
                                        className={`inline-flex mt-1.5 items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.isBlocked
                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            }`}
                                    >
                                        {user.isBlocked ? "Blocked" : "Active"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Google ID</p>
                                    <p className="text-[12px] font-mono font-bold text-slate-500 mt-1 break-all">{user.googleId || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Joined</p>
                                    <p className="text-[14px] font-bold text-slate-800 mt-1">{formatDateTime(user.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Updated</p>
                                    <p className="text-[14px] font-bold text-slate-800 mt-1">{formatDateTime(user.updatedAt)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Addresses</h2>
                                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{addresses.length}</span>
                            </div>
                            <div className="p-6">
                                {addresses.length === 0 ? (
                                    <div className="text-center py-6">
                                        <FiMapPin className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400 font-medium">No addresses.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr._id || `${addr.type}-${addr.pincode}`}
                                                className={`p-4 rounded-xl border ${addr.isDefault ? "border-brand-200 bg-brand-50/30" : "border-slate-100 bg-slate-50/30"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[13px] font-bold text-slate-800 capitalize">{addr.type || "Address"}</p>
                                                    {addr.isDefault ? (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full border border-brand-200">
                                                            Default
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="text-[12px] text-slate-500 font-medium mt-2">
                                                    {(addr.name || "-")} • {(addr.phone || "-")}
                                                </p>
                                                <p className="text-[12px] text-slate-500 font-medium mt-1">
                                                    {addr.addressLine1 || "-"}
                                                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                                                </p>
                                                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
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
        </div>
    );
};

export default UserDetail;
