import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCoupons, setLoading } from "../store/couponSlice";
import api from "../../services/AxiosInstance";
import { COUPONS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";
import { FiEdit2, FiTrash2, FiTag, FiX } from "react-icons/fi";

const emptyForm = {
    code: "",
    title: "",
    type: "percent",
    value: "",
    minOrderAmount: 0,
    maxDiscount: "",
    usageLimit: "",
    perUserLimit: 1,
    expiresAt: "",
    isActive: true,
};

const Coupons = () => {
    const dispatch = useDispatch();
    const { coupons = [], loading = false } = useSelector((state) => state.coupons || {});
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);

    const totalPages = Math.ceil(totalItems / limit);

    const fetchCoupons = async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(`${COUPONS}?page=${page}&limit=${limit}`);
            const payload = response.data;
            const list = Array.isArray(payload) ? payload : (payload.data || []);
            dispatch(setCoupons(list));
            setTotalItems(payload.total || list.length || 0);
        } catch (error) {
            console.error(error);
            const status = error.response?.status;
            toast.error(
                status === 404
                    ? "Coupon API not found. Deploy the updated backend_gau first."
                    : (error.response?.data?.message || "Failed to fetch coupons")
            );
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [page]);

    useEffect(() => {
        if (totalPages > 0 && page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const openAdd = () => {
        setIsEditMode(false);
        setSelectedCoupon(null);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const openEdit = (coupon) => {
        setIsEditMode(true);
        setSelectedCoupon(coupon);
        setFormData({
            code: coupon.code || "",
            title: coupon.title || "",
            type: coupon.type || "percent",
            value: coupon.value ?? "",
            minOrderAmount: coupon.minOrderAmount ?? 0,
            maxDiscount: coupon.maxDiscount ?? "",
            usageLimit: coupon.usageLimit ?? "",
            perUserLimit: coupon.perUserLimit ?? 1,
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : "",
            isActive: coupon.isActive !== false,
        });
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : name === "code" ? value.toUpperCase() : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                value: Number(formData.value),
                minOrderAmount: Number(formData.minOrderAmount) || 0,
                maxDiscount: formData.maxDiscount === "" ? null : Number(formData.maxDiscount),
                usageLimit: formData.usageLimit === "" ? null : Number(formData.usageLimit),
                perUserLimit: Number(formData.perUserLimit) || 1,
                expiresAt: formData.expiresAt || null,
            };

            if (isEditMode) {
                await api.put(`${COUPONS}/${selectedCoupon._id || selectedCoupon.id}`, payload);
                toast.success("Coupon updated");
            } else {
                await api.post(COUPONS, payload);
                toast.success("Coupon created");
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save coupon");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!couponToDelete) return;
        try {
            await api.delete(`${COUPONS}/${couponToDelete._id || couponToDelete.id}`);
            toast.success("Coupon deleted");
            setIsConfirmOpen(false);
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete coupon");
        }
    };

    const handleToggle = async (coupon) => {
        try {
            await api.patch(`${COUPONS}/${coupon._id || coupon.id}/toggle`);
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Coupons</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Create offers and track how many times each coupon is used.</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold text-[13px]"
                    >
                        <span className="text-lg font-bold leading-none">+</span> Add Coupon
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-2xl border-b border-slate-100">Code</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Offer</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Min Order</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Used / Limit</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Expires</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                    <th className="px-6 py-4 text-right rounded-tr-2xl border-b border-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center text-slate-400">
                                            <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
                                            Loading coupons...
                                        </td>
                                    </tr>
                                ) : coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                                            <FiTag className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                                            <p className="font-semibold text-slate-600">No coupons yet</p>
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr key={coupon._id || coupon.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-mono font-bold text-slate-800">{coupon.code}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                                {coupon.type === "percent" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                                {coupon.title ? <span className="block text-xs font-medium text-slate-400 mt-0.5">{coupon.title}</span> : null}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">₹{coupon.minOrderAmount || 0}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                                {coupon.usedCount || 0} / {coupon.usageLimit ?? "∞"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No expiry"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggle(coupon)}
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                        coupon.isActive
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-slate-100 text-slate-500 border-slate-200"
                                                    }`}
                                                >
                                                    {coupon.isActive ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button onClick={() => openEdit(coupon)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full">
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setCouponToDelete(coupon); setIsConfirmOpen(true); }}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs font-medium text-slate-500">
                            {totalItems === 0 ? "No coupons" : `Showing ${Math.min((page - 1) * limit + 1, totalItems)}-${Math.min(page * limit, totalItems)} of ${totalItems} coupons`}
                        </p>
                        <Pagination pageCount={totalPages} pageValue={page - 1} setPage={(p) => setPage(p + 1)} />
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">{isEditMode ? "Edit Coupon" : "Add Coupon"}</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                                <FiX />
                            </button>
                        </div>
                        <input name="code" value={formData.code} onChange={handleChange} placeholder="Coupon code (e.g. PURE15)" required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold uppercase" />
                        <input name="title" value={formData.title} onChange={handleChange} placeholder="Offer title (optional)" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" />
                        <div className="grid grid-cols-2 gap-3">
                            <select name="type" value={formData.type} onChange={handleChange} className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm">
                                <option value="percent">Percent</option>
                                <option value="flat">Flat ₹</option>
                            </select>
                            <input name="value" type="number" min="0" value={formData.value} onChange={handleChange} placeholder={formData.type === "percent" ? "% value" : "₹ amount"} required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input name="minOrderAmount" type="number" min="0" value={formData.minOrderAmount} onChange={handleChange} placeholder="Min order ₹" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" />
                            <input name="maxDiscount" type="number" min="0" value={formData.maxDiscount} onChange={handleChange} placeholder="Max discount ₹" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input name="usageLimit" type="number" min="1" value={formData.usageLimit} onChange={handleChange} placeholder="Total use limit" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" />
                            <input name="perUserLimit" type="number" min="1" value={formData.perUserLimit} onChange={handleChange} placeholder="Per user limit" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" />
                        </div>
                        <input name="expiresAt" type="date" value={formData.expiresAt} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" />
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                            Active
                        </label>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold disabled:opacity-60">
                                {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
                        <h3 className="text-lg font-bold mb-2">Delete Coupon</h3>
                        <p className="text-sm text-slate-500 mb-6">Delete <span className="font-bold">{couponToDelete?.code}</span>? This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-2.5 rounded-lg border text-sm font-semibold">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-semibold">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
