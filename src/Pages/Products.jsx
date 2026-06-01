import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setProducts, setLoading, deleteProduct } from "../store/productSlice";
import api from "../../services/AxiosInstance";
import { PRODUCTS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { XMarkIcon, PhotoIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const Products = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading } = useSelector((state) => state.products);

    // Confirmation Modal and Dropdown State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleDropdown = (productId) => {
        setActiveDropdown(activeDropdown === productId ? null : productId);
    };

    const closeDropdown = () => {
        setActiveDropdown(null);
    };

    const fetchData = async () => {
        dispatch(setLoading(true));
        try {
            const prodRes = await api.get(PRODUCTS);
            const productData = prodRes.data?.data?.products || prodRes.data?.data || [];
            dispatch(setProducts(Array.isArray(productData) ? productData : []));
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    const handleOpenAdd = () => {
        navigate("/products/add");
    };

    const handleOpenEdit = (product) => {
        navigate(`/products/edit/${product.slug}`, { state: { product } });
    };

    const openDeleteConfirm = (product) => {
        setProductToDelete(product);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            await api.delete(`${PRODUCTS}/${productToDelete._id || productToDelete.id}`);
            dispatch(deleteProduct(productToDelete._id || productToDelete.id));
            toast.success("Product deleted successfully");
            setIsConfirmOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete product");
        }
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen relative">
            {/* Click-away backdrop overlay for dropdowns */}
            {activeDropdown !== null && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={closeDropdown}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Products</h1>
                        {!loading && products.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                {products.length} {products.length === 1 ? "Product" : "Products"}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">Manage and organize your store's inventory</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="cursor-pointer bg-[#0f6845] hover:bg-[#0b4d33] text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold text-sm"
                >
                    <span className="text-lg font-bold">+</span> Add Product
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/40 border border-slate-100 overflow-visible">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-2xl">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0f6845] rounded-full animate-spin mb-2"></div>
                                        <span className="text-sm font-medium">Loading products...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                                            <PhotoIcon className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="font-semibold text-slate-600 text-base">No products found</p>
                                        <p className="text-sm text-slate-400 mt-0.5">Click "Add Product" to create your first one.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product._id || product.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm flex-shrink-0 transition-transform duration-200 hover:scale-105">
                                            <img
                                                src={product.images?.[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col max-w-xs md:max-w-md lg:max-w-lg">
                                            <span className="font-semibold text-slate-800 text-[15px] hover:text-[#0f6845] transition-colors">{product.name}</span>
                                            {product.sku && <span className="text-xs text-slate-400 font-mono mt-0.5 tracking-wider">{product.sku}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                            {product.category?.name || "Uncategorized"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-base">₹{product.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${product.stock > 0
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-rose-50 text-rose-700 border-rose-100"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => toggleDropdown(product._id || product.id)}
                                            className="cursor-pointer p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                                        >
                                            <EllipsisVerticalIcon className="w-5 h-5" />
                                        </button>

                                        {activeDropdown === (product._id || product.id) && (
                                            <div className="absolute right-6 mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                                <button
                                                    onClick={() => {
                                                        closeDropdown();
                                                        handleOpenEdit(product);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left font-medium cursor-pointer"
                                                >
                                                    <PencilIcon className="w-4 h-4 text-slate-400" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        closeDropdown();
                                                        openDeleteConfirm(product);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors text-left font-medium cursor-pointer"
                                                >
                                                    <TrashIcon className="w-4 h-4 text-red-400" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XMarkIcon className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
                            <p className="text-gray-500 mb-6">
                                You are about to delete <span className="font-semibold text-gray-800">"{productToDelete?.name}"</span>. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsConfirmOpen(false)}
                                    className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-sm"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
