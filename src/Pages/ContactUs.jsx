import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { fetchContacts, updateContactStatus, solveInquiry, deleteContact } from "../store/contactSlice";
import { EnvelopeIcon, CheckCircleIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

const ContactUs = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { contacts, loading } = useSelector((state) => state.contacts);
    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    useEffect(() => {
        dispatch(fetchContacts());
    }, [dispatch]);

    const handleOpenInquiry = (contact) => {
        setSelectedContact(contact);
        setShowModal(true);

        if (contact.status === "unread") {
            dispatch(updateContactStatus({ id: contact._id, status: "read", read: true }));
        }
    };

    const handleResolveInquiry = (id) => {
        dispatch(solveInquiry(id))
            .unwrap()
            .then((updated) => {
                toast.success("Inquiry marked as resolved");
                if (selectedContact?._id === id) setSelectedContact(updated);
            })
            .catch(() => toast.error("Failed to resolve inquiry"));
    };

    const handleDeleteInquiry = (id) => {
        if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
        dispatch(deleteContact(id))
            .unwrap()
            .then(() => {
                toast.success("Inquiry deleted successfully");
                setShowModal(false);
            })
            .catch(() => toast.error("Failed to delete inquiry"));
    };

    const filteredContacts = contacts.filter((c) => {
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        const matchesDate = !dateFilter || new Date(c.createdAt).setHours(0, 0, 0, 0) === new Date(dateFilter).setHours(0, 0, 0, 0);
        return matchesStatus && matchesDate;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'unread': return <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-semibold">Unread</span>;
            case 'read': return <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold">Read</span>;
            case 'resolved': return <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-semibold">Resolved</span>;
            default: return null;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Support Inquiries</h1>
                    <p className="text-gray-500 text-sm">Manage customer issues and help requests</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                    >
                        <option value="all">All Inquiries</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-2"></div>
                                        <span>Loading inquiries...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <EnvelopeIcon className="w-12 h-12 text-gray-200 mb-3" />
                                        <p className="font-medium text-gray-400">No inquiries found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map((contact) => (
                                <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">
                                                {contact.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                                                <p className="text-xs text-gray-500">{contact.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-800 font-medium truncate max-w-xs">{contact.subject}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(contact.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(contact.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenInquiry(contact)}
                                            className="text-purple-600 hover:text-purple-800 text-sm font-bold transition-all px-3 py-1.5 rounded-lg hover:bg-purple-50"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Inquiry Details Modal */}
            {showModal && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Inquiry Details</h2>
                                <p className="text-xs text-gray-500 mt-1">From {selectedContact.name} • {new Date(selectedContact.createdAt).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-white shadow-sm transition-all"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Name</label>
                                    <p className="text-sm font-semibold text-gray-900">{selectedContact.name}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                                    <p className="text-sm font-semibold text-gray-400">{selectedContact.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subject</label>
                                <p className="text-sm font-medium text-gray-900 bg-purple-50 px-3 py-1.5 rounded-lg inline-block border border-purple-100">{selectedContact.subject}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Message</label>
                                <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-5 rounded-2xl border border-gray-100 leading-relaxed whitespace-pre-wrap italic shadow-inner">
                                    "{selectedContact.message}"
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between gap-3">
                            <button
                                onClick={() => handleDeleteInquiry(selectedContact._id)}
                                className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm flex items-center gap-2"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Delete Inquiry
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-white transition-all text-sm"
                                >
                                    Close
                                </button>
                                {selectedContact.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleResolveInquiry(selectedContact._id)}
                                        className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all text-sm flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-5 h-5" />
                                        Mark as Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactUs;
