import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders, setLoading } from "../store/orderSlice";
import api from "../../services/AxiosInstance";
import { ORDERS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";

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
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-500 text-sm">Monitor and manage customer orders</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <ThreeDots height="40" width="40" radius="9" color="#0f6845" ariaLabel="three-dots-loading" visible={true} />
                                        <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <p className="font-medium">No orders found.</p>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order._id || order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {(order._id || order.id).slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {order.user?.name || order.addressSnapshot?.phone || "Order Customer"}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">₹{order.totalAmount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus || order.status)}`}>
                                            {order.orderStatus || order.status || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/orders/${order._id || order.id}`)}
                                            className="text-[#0f6845] hover:text-purple-700 font-semibold text-sm transition-colors cursor-pointer"
                                        >
                                            View Details
                                        </button>
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
