import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/AxiosInstance";
import { orderById, orderStatus, orderShipment, orderTrack } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { FiArrowLeft, FiPackage, FiMapPin, FiPhone, FiMail, FiUser, FiCheckCircle, FiSettings, FiTruck, FiMap, FiCreditCard, FiPrinter } from "react-icons/fi";

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");

    const fetchOrderDetails = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get(orderById(id));
            setOrder(response.data.data || response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch order details");
            navigate("/orders");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const waybill = order?.delhiveryWaybill || order?.shipmentWaybill;

    const handleStatusUpdate = async (newStatus) => {
        try {
            setActionLoading(newStatus);
            await api.patch(orderStatus(id), { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            await fetchOrderDetails({ silent: true });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update order status");
        } finally {
            setActionLoading("");
        }
    };

    const handleGenerateWaybill = async () => {
        try {
            setActionLoading("shipment");
            await api.post(orderShipment(id));
            toast.success("Waybill generated successfully");
            await fetchOrderDetails({ silent: true });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to generate waybill");
        } finally {
            setActionLoading("");
        }
    };

    const handleTrackShipment = async () => {
        try {
            setActionLoading("track");
            const response = await api.get(orderTrack(id));
            const nextOrderStatus = response.data.orderStatus;
            toast.success(
                nextOrderStatus
                    ? `Tracking: ${response.data.status} · Order status: ${nextOrderStatus}`
                    : `Tracking Status: ${response.data.status}`
            );
            await fetchOrderDetails({ silent: true });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to track shipment");
        } finally {
            setActionLoading("");
        }
    };

    const handlePrintWaybill = async () => {
        window.open(`/print-waybill/${id}`, "_blank");
    };

    const handlePrintInvoice = () => {
        window.open(`/print-invoice/${id}`, "_blank");
    };


    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-amber-100/50 text-amber-700 border-amber-200/50";
            case "paid": return "bg-emerald-100/50 text-emerald-700 border-emerald-200/50";
            case "confirmed": return "bg-blue-100/50 text-blue-700 border-blue-200/50";
            case "processing": return "bg-indigo-100/50 text-indigo-700 border-indigo-200/50";
            case "packing": return "bg-purple-100/50 text-purple-700 border-purple-200/50";
            case "shipped": return "bg-orange-100/50 text-orange-700 border-orange-200/50";
            case "delivered": return "bg-green-100/50 text-green-700 border-green-200/50";
            case "cancelled": return "bg-rose-100/50 text-rose-700 border-rose-200/50";
            default: return "bg-slate-100/50 text-slate-700 border-slate-200/50";
        }
    };

    const getStatusActions = (status) => {
        switch (status?.toLowerCase()) {
            case "paid":
                return [
                    { next: "confirmed", label: "Confirm", className: "bg-slate-900 hover:bg-slate-800 text-white", icon: FiCheckCircle },
                    { next: "cancelled", label: "Cancel", className: "bg-rose-600 hover:bg-rose-500 text-white", icon: FiSettings }
                ];
            case "confirmed":
                return [
                    { next: "processing", label: "Process", className: "bg-blue-600 hover:bg-blue-500 text-white", icon: FiSettings },
                    { next: "cancelled", label: "Cancel", className: "bg-rose-600 hover:bg-rose-500 text-white", icon: FiSettings }
                ];
            case "processing":
                return [
                    { next: "packing", label: "Pack", className: "bg-purple-600 hover:bg-purple-500 text-white", icon: FiPackage },
                    { next: "cancelled", label: "Cancel", className: "bg-rose-600 hover:bg-rose-500 text-white", icon: FiSettings }
                ];
            case "packing":
                return [
                    { next: "shipped", label: "Ship", className: "bg-orange-600 hover:bg-orange-500 text-white", icon: FiTruck },
                    { next: "cancelled", label: "Cancel", className: "bg-rose-600 hover:bg-rose-500 text-white", icon: FiSettings }
                ];
            case "shipped":
                return [
                    { next: "delivered", label: "Mark Delivered", className: "bg-emerald-600 hover:bg-emerald-500 text-white", icon: FiCheckCircle }
                ];
            default:
                return [];
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                <p className="text-slate-400 font-medium text-sm">Fetching order details...</p>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Header Background */}
            <div className="h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 absolute top-0 left-0 right-0 z-0 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/orders")}
                            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group"
                        >
                            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                Order Overview
                                <span className={`text-xs px-3 py-1 rounded-full border backdrop-blur-sm ${
                                    order.paymentStatus?.toLowerCase() === 'paid' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                                }`}>
                                    {order.paymentStatus?.toUpperCase()}
                                </span>
                            </h1>
                            <div className="flex items-center gap-3 mt-1 text-slate-300 text-sm">
                                <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-slate-200">#{order._id || order.id}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                <span>{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrintInvoice}
                            className="px-4 py-2 bg-white text-slate-800 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <FiPrinter /> Print Invoice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column - Main Details */}
                    <div className="xl:col-span-8 space-y-8">
                        {/* Products List */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <FiPackage className="text-emerald-600" />
                                    Order Items
                                </h3>
                                <span className="text-sm font-medium text-slate-500">{order.products?.length || 0} Items</span>
                            </div>
                            
                            <div className="p-8">
                                <div className="space-y-6">
                                    {order.products?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                            <div className="relative w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200/60 shadow-sm group-hover:shadow-md transition-all">
                                                {item.productId?.images?.[0] ? (
                                                    <img
                                                        src={item.productId.images[0]}
                                                        alt={item.productId.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <FiPackage className="w-8 h-8 text-slate-300" />
                                                )}
                                                <div className="absolute top-0 right-0 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                                                    x{item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-bold text-slate-800 truncate">{item.productId?.name || "Product Item"}</h4>
                                                <p className="text-xs font-mono text-slate-400 mt-1 truncate">ID: {item.productId?._id || item.productId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500 font-medium line-through decoration-slate-300">
                                                    ₹{(item.priceSnapshot * 1.2).toLocaleString()} {/* Example MRP */}
                                                </p>
                                                <p className="text-lg font-bold text-slate-800">
                                                    ₹{item.priceSnapshot.toLocaleString()}
                                                </p>
                                                <p className="text-sm font-bold text-emerald-600 mt-1">
                                                    Total: ₹{(item.quantity * item.priceSnapshot).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                    <div className="w-full max-w-sm space-y-3">
                                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                                            <span>Subtotal</span>
                                            <span>₹{order.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                                            <span>Shipping</span>
                                            <span className="text-emerald-600">Free</span>
                                        </div>
                                        <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                                            <span className="text-base font-bold text-slate-800">Total Amount</span>
                                            <span className="text-3xl font-black text-emerald-600 tracking-tight">₹{order.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Status Management */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <FiSettings className="text-blue-600" />
                                    Order Lifecycle
                                </h3>
                            </div>
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1 w-full space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
                                        <div className={`px-4 py-3 rounded-xl border text-sm font-bold inline-flex items-center gap-2 shadow-sm ${getStatusStyle(order.orderStatus || order.status)}`}>
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-40"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                                            </span>
                                            {(order.orderStatus || order.status || "Unknown").toUpperCase()}
                                        </div>
                                    </div>

                                    {getStatusActions(order.orderStatus || order.status).length > 0 && (
                                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                            {getStatusActions(order.orderStatus || order.status).map((action) => {
                                                const Icon = action.icon;
                                                return (
                                                    <button
                                                        key={action.next}
                                                        onClick={() => handleStatusUpdate(action.next)}
                                                        disabled={Boolean(actionLoading)}
                                                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${action.className}`}
                                                    >
                                                        <Icon /> {actionLoading === action.next ? `${action.label}...` : action.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <p className="mt-6 text-sm text-slate-500">
                                    Changing status here updates the order for the customer immediately. Generating a waybill or tracking a shipment also syncs delivery status to the same order status.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="xl:col-span-4 space-y-6">
                        {/* Customer Info Card */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <FiUser className="text-emerald-600" /> Customer
                            </h3>
                            
                            <div className="space-y-5 relative z-10">
                                <div>
                                    <p className="text-lg font-bold text-slate-800">{order.userId?.name || "Gaukrishna Customer"}</p>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <FiMail className="w-4 h-4" />
                                    </div>
                                    <p className="text-sm font-medium truncate">{order.userId?.email || "N/A"}</p>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <FiPhone className="w-4 h-4" />
                                    </div>
                                    <p className="text-sm font-medium">{order.userId?.phone || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-6">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <FiMapPin className="text-indigo-600" /> Shipping Address
                            </h3>
                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-sm font-bold text-slate-800 mb-2">{order.addressSnapshot?.fullName}</p>
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                    {order.addressSnapshot?.addressLine}
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium mb-3">
                                    {order.addressSnapshot?.city}, {order.addressSnapshot?.state}
                                </p>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-400 uppercase">Pincode</span>
                                    <span className="text-slate-800 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">{order.addressSnapshot?.pincode}</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100/80 flex items-center gap-2 text-emerald-700 font-bold text-sm">
                                    <FiPhone /> {order.addressSnapshot?.phone}
                                </div>
                            </div>
                        </div>

                        {/* Delhivery Integration */}
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl shadow-lg shadow-indigo-900/20 p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
                            
                            <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                                <FiTruck className="text-indigo-400" /> Delivery Management
                            </h3>
                            
                            <div className="space-y-4 relative z-10">
                                {!waybill ? (
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                            <FiPackage className="w-8 h-8 text-indigo-300 opacity-50" />
                                        </div>
                                        <p className="text-sm text-indigo-200 mb-4">No shipment created yet.</p>
                                        <button
                                            onClick={handleGenerateWaybill}
                                            disabled={Boolean(actionLoading)}
                                            className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {actionLoading === "shipment" ? "Creating shipment..." : "Generate Waybill"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                            <p className="text-xs text-indigo-300 font-medium mb-1">Waybill Number (AWB)</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-bold font-mono tracking-wider">{waybill}</p>
                                                <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                                    <svg className="w-4 h-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                            <p className="text-xs text-indigo-300 font-medium mb-1">Live Status</p>
                                            <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                                {order.delhiveryShipmentStatus || "Information Received"}
                                            </p>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleTrackShipment}
                                                disabled={Boolean(actionLoading)}
                                                className="flex-1 py-3 rounded-xl bg-white text-indigo-900 text-sm font-bold shadow-md hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <FiMap className="group-hover:animate-bounce" /> Track Shipment
                                            </button>
                                            <button
                                                onClick={handlePrintWaybill}
                                                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                            >
                                                <FiPrinter className="group-hover:scale-110 transition-transform" /> Print Waybill
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Details */}
                        {order.razorpayPaymentId && (
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-6">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <FiCreditCard className="text-slate-600" /> Payment Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Payment ID</p>
                                        <p className="text-sm font-mono text-slate-700 truncate">{order.razorpayPaymentId}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Order Ref</p>
                                        <p className="text-sm font-mono text-slate-700 truncate">{order.razorpayOrderId}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;

