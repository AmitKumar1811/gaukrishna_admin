import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders, setLoading } from "../store/orderSlice";
import api from "../../services/AxiosInstance";
import { ORDERS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { EllipsisVerticalIcon, EyeIcon } from "@heroicons/react/24/outline";

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
            case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-100";
            case "paid": return "bg-green-50 text-green-700 border-green-100";
            case "completed": return "bg-green-50 text-green-700 border-green-100";
            case "cancelled": return "bg-red-50 text-red-700 border-red-100";
            case "processing": return "bg-blue-50 text-blue-700 border-blue-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    const totalPages = Math.ceil(totalItems / limit);

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Orders</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Monitor and manage customer orders</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/40 border border-slate-100 overflow-visible">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-2xl">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <ThreeDots height="40" width="40" radius="9" color="#0f6845" ariaLabel="three-dots-loading" visible={true} />
                                        <p className="text-sm text-slate-500 mt-2 font-medium">Loading orders...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                    <p className="font-semibold">No orders found.</p>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order._id || order.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500 tracking-wider">
                                        {(order._id || order.id).slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-800 text-[15px]">
                                        {order.user?.name || order.addressSnapshot?.phone || "Order Customer"}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-base">₹{order.totalAmount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus || order.status)}`}>
                                            {order.orderStatus || order.status || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === (order._id || order.id) ? null : (order._id || order.id))}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all focus:outline-none"
                                        >
                                            <EllipsisVerticalIcon className="w-5 h-5" />
                                        </button>
                                        
                                        {activeDropdown === (order._id || order.id) && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setActiveDropdown(null)}
                                                ></div>
                                                <div className="absolute right-8 top-10 w-36 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-100/50 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                                    <button
                                                        onClick={() => {
                                                            navigate(`/orders/${order._id || order.id}`);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-[#0f6845] transition-colors flex items-center gap-2 font-medium"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
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
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                    <Pagination
                        pageCount={totalPages}
                        pageValue={page - 1}
                        setPage={(p) => setPage(p + 1)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Orders;
