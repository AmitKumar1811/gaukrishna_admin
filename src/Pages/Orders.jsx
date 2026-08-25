import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders, setLoading } from "../store/orderSlice";
import api from "../../services/AxiosInstance";
import { ORDERS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";

import { useNavigate } from "react-router-dom";
import { FiEye, FiShoppingBag } from "react-icons/fi";

const Orders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, loading } = useSelector((state) => state.orders);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const fetchOrders = async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(`${ORDERS}?page=${page}&limit=${limit}`);
            const payload = response.data;
            const rawOrders = Array.isArray(payload) ? payload : (payload.data || []);
            const total = Number(payload.total);
            const serverPaginated = !Array.isArray(payload) && Array.isArray(payload.data) && Number.isFinite(total);

            const pageOrders = serverPaginated
                ? rawOrders.slice(0, limit)
                : rawOrders.slice((page - 1) * limit, page * limit);

            dispatch(setOrders(pageOrders));
            setTotalItems(serverPaginated ? total : rawOrders.length);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        } finally {
            dispatch(setLoading(false));
        }
    };

    const totalPages = Math.ceil(totalItems / limit);

    useEffect(() => {
        fetchOrders();
    }, [dispatch, page]);

    useEffect(() => {
        if (totalPages > 0 && page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-gold-50 text-gold-700 border-gold-200";
            case "paid": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "confirmed": return "bg-blue-50 text-blue-700 border-blue-200";
            case "processing": return "bg-brand-50 text-brand-700 border-brand-200";
            case "packing": return "bg-purple-50 text-purple-700 border-purple-200";
            case "shipped": return "bg-orange-50 text-orange-700 border-orange-200";
            case "delivered":
            case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Orders</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Monitor and manage customer orders.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-2xl border-b border-slate-100">Order ID</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Customer</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Total</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Date</th>
                                    <th className="px-6 py-4 text-right rounded-tr-2xl border-b border-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                                                <p className="text-sm mt-2 font-medium">Loading orders...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                    <FiShoppingBag className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                                                </div>
                                                <p className="font-semibold text-slate-600 text-base">No orders found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order._id || order.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                                            <td className="px-6 py-4 font-mono text-[12px] text-slate-500 tracking-wider">
                                                {(order._id || order.id).slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-800 text-[14px]">
                                                {order.userId?.name || order.user?.name || order.addressSnapshot?.fullName || order.addressSnapshot?.phone || "Order Customer"}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 text-[14px]">₹{order.totalAmount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.orderStatus || order.status)}`}>
                                                    {order.orderStatus || order.status || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-[13px] font-medium">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => navigate(`/orders/${order._id || order.id}`)}
                                                    title="View Details"
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all focus:outline-none cursor-pointer"
                                                >
                                                    <FiEye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs font-medium text-slate-500">
                            {totalItems === 0
                                ? "No orders"
                                : `Showing ${Math.min((page - 1) * limit + 1, totalItems)}-${Math.min(page * limit, totalItems)} of ${totalItems} orders`}
                        </p>
                        <Pagination
                            pageCount={totalPages}
                            pageValue={page - 1}
                            setPage={(p) => setPage(p + 1)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;
