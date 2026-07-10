import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { fetchContacts, updateContactStatus, solveInquiry, deleteContact } from "../store/contactSlice";
import { FiMail, FiCheckCircle, FiX, FiTrash2, FiMoreVertical, FiEye } from "react-icons/fi";

const ContactUs = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { contacts, loading } = useSelector((state) => state.contacts);
    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    
    const [activeDropdown, setActiveDropdown] = useState(null);

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
            case 'unread': return <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider">Unread</span>;
            case 'read': return <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold uppercase tracking-wider">Read</span>;
            case 'resolved': return <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">Resolved</span>;
            default: return null;
        }
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Support Inquiries</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage customer issues and help requests</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-all font-semibold text-slate-600 shadow-sm cursor-pointer"
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
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-all font-semibold text-slate-600 shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-2xl border-b border-slate-100">Customer</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Subject</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Date</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                    <th className="px-6 py-4 text-right rounded-tr-2xl border-b border-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                                                <span className="text-sm font-medium">Loading inquiries...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredContacts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                    <FiMail className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                                                </div>
                                                <p className="font-semibold text-slate-600 text-base">No inquiries found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <tr key={contact._id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-[13px] border border-brand-200 flex-shrink-0">
                                                        {contact.name[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[14px] font-bold text-slate-800">{contact.name}</p>
                                                        <p className="text-[12px] text-slate-400 font-medium mt-0.5">{contact.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[13px] text-slate-700 font-semibold truncate max-w-xs">{contact.subject}</p>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">
                                                {new Date(contact.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(contact.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === contact._id ? null : contact._id)}
                                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all focus:outline-none cursor-pointer"
                                                >
                                                    <FiMoreVertical className="w-4 h-4" />
                                                </button>

                                                {activeDropdown === contact._id && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveDropdown(null)}
                                                        ></div>
                                                        <div className="absolute right-8 top-10 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                                                            <button
                                                                onClick={() => {
                                                                    handleOpenInquiry(contact);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                                View Details
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteInquiry(contact._id);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                                Delete
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
                </div>
            </div>

            {/* Inquiry Details Modal */}
            {showModal && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Inquiry Details</h2>
                                <p className="text-[12px] text-slate-400 font-medium mt-1">From {selectedContact.name} • {new Date(selectedContact.createdAt).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Name</label>
                                    <p className="text-[14px] font-bold text-slate-800">{selectedContact.name}</p>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                                    <p className="text-[14px] font-medium text-slate-500">{selectedContact.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                                <p className="text-[14px] font-semibold text-slate-800 bg-brand-50 px-3 py-1.5 rounded-lg inline-block border border-brand-200">{selectedContact.subject}</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Message</label>
                                <div className="mt-2 text-[14px] text-slate-600 bg-slate-50 p-5 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap font-medium">
                                    "{selectedContact.message}"
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between gap-3">
                            <button
                                onClick={() => handleDeleteInquiry(selectedContact._id)}
                                className="px-5 py-2.5 rounded-lg border border-rose-200 text-rose-600 font-semibold hover:bg-rose-50 transition-all text-[13px] flex items-center gap-2 cursor-pointer"
                            >
                                <FiTrash2 className="w-4 h-4" />
                                Delete Inquiry
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-white transition-all text-[13px] cursor-pointer"
                                >
                                    Close
                                </button>
                                {selectedContact.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleResolveInquiry(selectedContact._id)}
                                        className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm transition-all text-[13px] flex items-center gap-2 cursor-pointer"
                                    >
                                        <FiCheckCircle className="w-4 h-4" />
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
