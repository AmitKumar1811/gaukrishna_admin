import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTransactions, setLoading } from "../store/transactionSlice";
import api from "../../services/AxiosInstance";
import { TRANSACTIONS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";
import { FiCreditCard } from "react-icons/fi";

const Transactions = () => {
    const dispatch = useDispatch();
    const { transactions, loading } = useSelector((state) => state.transactions);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const fetchTransactions = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(`${TRANSACTIONS}?page=${page}&limit=${limit}`);
            dispatch(setTransactions(response.data?.data || []));
            const totalTransactions = response.data?.totalTransactions ?? response.data?.total ?? 0;
            const pages =
                response.data?.pages ??
                (totalTransactions ? Math.ceil(totalTransactions / limit) : 1);
            setTotalPages(pages || 1);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch transactions");
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, page]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "success": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "paid": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "pending": return "bg-gold-50 text-gold-700 border-gold-200";
            case "created": return "bg-brand-50 text-brand-700 border-brand-200";
            case "processing": return "bg-brand-50 text-brand-700 border-brand-200";
            case "failed": return "bg-rose-50 text-rose-700 border-rose-200";
            case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
            case "canceled": return "bg-rose-50 text-rose-700 border-rose-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const formatDateTime = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getTxnStatus = (txn) => txn?.paymentStatus || txn?.orderStatus || txn?.status || "unknown";

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Transactions</h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium mt-1">View and monitor all payment transactions.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-2xl border-b border-slate-100">Transaction ID</th>
                                    <th className="px-6 py-4 border-b border-slate-100">User</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Amount</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Type</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                    <th className="px-6 py-4 rounded-tr-2xl border-b border-slate-100">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                                                <span className="text-sm font-medium">Loading transactions...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                    <FiCreditCard className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                                                </div>
                                                <p className="font-semibold text-slate-600 text-base">No transactions found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((txn) => (
                                        <tr key={txn.razorpayPaymentId || txn.razorpayOrderId || txn.orderId || txn.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                                            <td className="px-6 py-4 font-mono text-[12px] text-slate-500 tracking-wider">
                                                {txn.razorpayPaymentId || txn.razorpayOrderId || txn.orderId || txn.transactionId || txn.id}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-800 text-[14px]">
                                                {txn.user?.name || "Unknown"}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 text-[14px]">₹{txn.totalAmount ?? txn.amount ?? 0}</td>
                                            <td className="px-6 py-4 text-slate-500 text-[13px] font-medium capitalize">
                                                {txn.type || "Order"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(getTxnStatus(txn))}`}>
                                                    {getTxnStatus(txn)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-[13px] font-medium">
                                                {formatDateTime(txn.timestamp || txn.createdAt)}
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
                            pageValue={page - 1} // 0-indexed
                            setPage={(p) => setPage(p + 1)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
