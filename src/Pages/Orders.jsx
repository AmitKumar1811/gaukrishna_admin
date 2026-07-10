import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders, setLoading } from "../store/orderSlice";
import api from "../../services/AxiosInstance";
import { ORDERS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";

import { useNavigate } from "react-router-dom";
import { FiMoreVertical, FiEye, FiShoppingBag } from "react-icons/fi";

const Orders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, loading } = useSelector((state) => state.orders);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    
    // Dropdown state
    const [activeDropdown, setActiveDropdown] = useState(null);

    const fetchOrders = async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(`admin/${ORDERS}?page=${page}&limit=${limit}`);
            // Extract from response according to the provided format
            const orderData = Array.isArray(response.data) ? response.data : (response.data.data || []);
            dispatch(setOrders(orderData));
            setTotalItems(response.data.total || orderData.length || 0);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [dispatch, page]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-gold-50 text-gold-700 border-gold-200";
            case "paid": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
            case "processing": return "bg-brand-50 text-brand-700 border-brand-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const totalPages = Math.ceil(totalItems / limit);

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
                                                {order.user?.name || order.addressSnapshot?.phone || "Order Customer"}
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
                                            <td className="px-6 py-4 text-right whitespace-nowrap relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === (order._id || order.id) ? null : (order._id || order.id))}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all focus:outline-none cursor-pointer"
                                                >
                                                    <FiMoreVertical className="w-5 h-5" />
                                                </button>
                                                
                                                {activeDropdown === (order._id || order.id) && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveDropdown(null)}
                                                        ></div>
                                                        <div className="absolute right-8 top-10 w-40 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-100/50 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                                            <button
                                                                onClick={() => {
                                                                    navigate(`/orders/${order._id || order.id}`);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors flex items-center gap-2.5 font-semibold cursor-pointer"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                                View Details
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
                            setPage={(p) => setPage(p + 1)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;
