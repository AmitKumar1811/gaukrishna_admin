import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/AxiosInstance";
import { ORDERS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`admin/${ORDERS}/${id}`);
            setOrder(response.data.data || response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch order details");
            navigate("/orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await api.patch(`admin/${ORDERS}/${id}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrderDetails(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update order status");
        }
    };

    const statuses = [
        "pending",
        "paid",
        "confirmed",
        "processing",
        "packing",
        "shipped",
        "delivered",
        "cancelled"
    ];

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-100";
            case "paid": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "confirmed": return "bg-blue-50 text-blue-700 border-blue-100";
            case "processing": return "bg-indigo-50 text-indigo-700 border-indigo-100";
            case "packing": return "bg-purple-50 text-purple-700 border-purple-100";
            case "shipped": return "bg-orange-50 text-orange-700 border-orange-100";
            case "delivered": return "bg-green-50 text-green-700 border-green-100";
            case "cancelled": return "bg-red-50 text-red-700 border-red-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <ThreeDots height="50" width="50" radius="9" color="#0f6845" visible={true} />
                <p className="mt-4 text-gray-500 font-medium tracking-wide">Loading Order Details...</p>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/orders")}
                        className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order Detail</h1>
                        <p className="text-gray-500 text-sm font-mono mt-1 uppercase">Order ID: {order._id || order.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Customer & Payment Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Customer Information</h3>
                            <div className="space-y-4">
                                <div className="border-b border-gray-50 pb-4">
                                    <p className="text-xs text-gray-400 font-semibold mb-1">Full Name</p>
                                    <p className="text-sm font-bold text-gray-800">{order.userId?.name || "Gaukrishna Customer"}</p>
                                </div>
                                <div className="border-b border-gray-50 pb-4">
                                    <p className="text-xs text-gray-400 font-semibold mb-1">Email Address</p>
                                    <p className="text-sm font-medium text-gray-600">{order.userId?.email || "N/A"}</p>
                                </div>
                                <div className="border-b border-gray-50 pb-4">
                                    <p className="text-xs text-gray-400 font-semibold mb-1">Account Phone</p>
                                    <p className="text-sm font-medium text-gray-600">{order.userId?.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold mb-1">Shipping Details</p>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                            {order.addressSnapshot?.city}, {order.addressSnapshot?.state}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Pincode: {order.addressSnapshot?.pincode}</p>
                                        <p className="text-xs text-[#0f6845] font-bold mt-2">📞 {order.addressSnapshot?.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Order Status Management</h3>
                            <div className="space-y-4">
                                {(order.orderStatus?.toLowerCase() === "paid" || order.status?.toLowerCase() === "paid") ? (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-gray-500 mb-2 font-mono">Action Required</p>
                                        <button
                                            onClick={() => handleStatusUpdate("confirmed")}
                                            className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <span className="text-lg">✓</span> Confirm Order
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate("processing")}
                                            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <span className="text-lg">⚙</span> Start Processing
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-500">Current Status</p>
                                        <div className={`w-full px-4 py-3 rounded-xl border text-sm font-black text-center ${getStatusColor(order.orderStatus || order.status)}`}>
                                            {(order.orderStatus || order.status || "Unknown").toUpperCase()}
                                        </div>
                                        <p className="text-[10px] text-gray-400 text-center italic mt-2">
                                            Status updates are now managed by the delivery webhook.
                                        </p>
                                    </div>
                                )}

                                <div className="border-t border-gray-50 pt-4 flex justify-between items-center">
                                    <p className="text-xs font-bold text-gray-500">Payment Status</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {order.razorpayPaymentId && (
                            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                <h3 className="text-xs font-bold text-[#0f6845] uppercase tracking-widest mb-4">Payment Reference</h3>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-purple-400 font-mono break-all uppercase leading-relaxed">
                                        Payment ID: {order.razorpayPaymentId}
                                    </p>
                                    <p className="text-[10px] text-purple-400 font-mono break-all uppercase leading-relaxed">
                                        Order Ref: {order.razorpayOrderId}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Products & Totals */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Items</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Product Details</th>
                                            <th className="px-6 py-4 text-center">Quantity</th>
                                            <th className="px-6 py-4 text-right">Price</th>
                                            <th className="px-6 py-4 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {order.products?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100">
                                                            {item.productId?.images?.[0] ? (
                                                                <img
                                                                    src={item.productId.images[0]}
                                                                    alt={item.productId.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <svg className="w-6 h-6 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4zm1 2h10v10H5V5z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-800">{item.productId?.name || "Product Item"}</span>
                                                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter mt-0.5">ID: {item.productId?._id || item.productId}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-black text-gray-700">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right text-sm text-gray-600 font-mono">₹{item.priceSnapshot.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-sm font-black text-[#0f6845] font-mono">₹{(item.quantity * item.priceSnapshot).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50/20">
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-right font-bold text-gray-400 uppercase tracking-widest text-xs">Total Amount</td>
                                            <td className="px-6 py-8 text-right font-black text-3xl text-[#0f6845] font-mono whitespace-nowrap">₹{order.totalAmount.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 bg-gray-900 p-8 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-purple-200">
                            <div>
                                <h2 className="text-lg font-bold">Quick Actions</h2>
                                <p className="text-gray-400 text-sm mt-1">Status and tracking can be managed from the dashboard.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Final Total Paid</p>
                                <p className="text-4xl font-black text-[#0f6845] font-mono">₹{order.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
