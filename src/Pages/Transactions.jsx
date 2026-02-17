import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTransactions, setLoading } from "../store/transactionSlice";
import api from "../../services/AxiosInstance";
import { TRANSACTIONS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";
import { ThreeDots } from "react-loader-spinner";

const Transactions = () => {
    const dispatch = useDispatch();
    const { transactions, loading } = useSelector((state) => state.transactions);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const fetchTransactions = async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(`${TRANSACTIONS}?page=${page}&limit=${limit}`);
            dispatch(setTransactions(response.data.data || []));
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch transactions");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [dispatch, page]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "success": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "failed": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const totalPages = Math.ceil(totalItems / limit);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Transaction ID</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex justify-center">
                                        <ThreeDots height="50" width="50" radius="9" color="#9900FF" ariaLabel="three-dots-loading" visible={true} />
                                    </div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{txn.transactionId || txn.id}</td>
                                    <td className="px-6 py-4 text-gray-900">{txn.user?.name || "Unknown"}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">₹{txn.amount}</td>
                                    <td className="px-6 py-4 text-gray-500 capitalize">{txn.type || "Purchase"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusColor(txn.status)}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(txn.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                    <Pagination
                        pageCount={totalPages}
                        pageValue={page - 1} // 0-indexed
                        setPage={(p) => setPage(p + 1)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Transactions;
