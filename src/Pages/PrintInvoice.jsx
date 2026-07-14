import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/AxiosInstance";
import { ORDERS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";

const PrintInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await api.get(`admin/${ORDERS}/${id}`);
                setOrder(response.data.data || response.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch order details for invoice");
                navigate("/orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, navigate]);

    useEffect(() => {
        if (!loading && order) {
            // Trigger print dialog once loaded
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, order]);

    if (loading) return <div className="p-8 text-center">Loading invoice...</div>;
    if (!order) return null;

    return (
        <div className="bg-white text-black p-8 font-sans" style={{ maxWidth: "210mm", margin: "0 auto", padding: "20mm" }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">INVOICE</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Order #{order._id}</p>
                    <p className="text-sm text-slate-500">Date: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-800">Gaukrishna</h2>
                    <p className="text-sm text-slate-500">info@gaukrishna.com</p>
                    <p className="text-sm text-slate-500">www.gaukrishna.com</p>
                </div>
            </div>

            {/* Addresses */}
            <div className="flex justify-between mb-8">
                <div className="w-1/2 pr-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Billed To / Shipped To:</h3>
                    <p className="text-sm font-bold text-slate-800">{order.addressSnapshot?.fullName}</p>
                    <p className="text-sm text-slate-600">{order.addressSnapshot?.addressLine}</p>
                    <p className="text-sm text-slate-600">{order.addressSnapshot?.city}, {order.addressSnapshot?.state} {order.addressSnapshot?.pincode}</p>
                    <p className="text-sm text-slate-600">{order.addressSnapshot?.country}</p>
                    <p className="text-sm text-slate-600 mt-1">Phone: {order.addressSnapshot?.phone}</p>
                </div>
                <div className="w-1/3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Info:</h3>
                    <p className="text-sm text-slate-600"><span className="font-bold">Status:</span> {order.paymentStatus?.toUpperCase()}</p>
                    {order.razorpayPaymentId && (
                        <p className="text-sm text-slate-600"><span className="font-bold">Txn ID:</span> {order.razorpayPaymentId}</p>
                    )}
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8 text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-800">
                        <th className="py-3 px-2 text-sm font-bold uppercase tracking-wider text-slate-800">Item</th>
                        <th className="py-3 px-2 text-sm font-bold uppercase tracking-wider text-slate-800 text-center">Qty</th>
                        <th className="py-3 px-2 text-sm font-bold uppercase tracking-wider text-slate-800 text-right">Price</th>
                        <th className="py-3 px-2 text-sm font-bold uppercase tracking-wider text-slate-800 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.products?.map((item, index) => (
                        <tr key={index} className="border-b border-slate-200">
                            <td className="py-4 px-2">
                                <p className="font-bold text-slate-800 text-sm">{item.productId?.name || "Product"}</p>
                                <p className="text-xs text-slate-500 font-mono">ID: {item.productId?._id || item.productId}</p>
                            </td>
                            <td className="py-4 px-2 text-center text-sm font-medium">{item.quantity}</td>
                            <td className="py-4 px-2 text-right text-sm font-medium">₹{item.priceSnapshot.toLocaleString()}</td>
                            <td className="py-4 px-2 text-right text-sm font-bold text-slate-800">₹{(item.quantity * item.priceSnapshot).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-1/3">
                    <div className="flex justify-between py-2 text-sm">
                        <span className="text-slate-600 font-medium">Subtotal:</span>
                        <span className="font-bold text-slate-800">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm border-b border-slate-200">
                        <span className="text-slate-600 font-medium">Shipping:</span>
                        <span className="font-bold text-slate-800">₹0</span>
                    </div>
                    <div className="flex justify-between py-3 text-lg border-b-2 border-slate-800">
                        <span className="font-black text-slate-900">Total:</span>
                        <span className="font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-500 font-medium">Thank you for your business!</p>
                <p className="text-xs text-slate-400 mt-1">This is a computer-generated invoice and does not require a signature.</p>
            </div>
            
            {/* Print style overrides */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .bg-white, .bg-white * {
                        visibility: visible;
                    }
                    .bg-white {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintInvoice;
