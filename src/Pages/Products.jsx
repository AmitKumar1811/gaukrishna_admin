import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setProducts, setLoading, deleteProduct } from "../store/productSlice";
import { setCategories } from "../store/categorySlice";
import api from "../../services/AxiosInstance";
import { PRODUCTS, CATEGORIES } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { FiMoreVertical, FiEdit2, FiTrash2, FiImage, FiX } from "react-icons/fi";

const Products = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading } = useSelector((state) => state.products);
    const { categories } = useSelector((state) => state.categories);
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
            const [prodRes, catRes] = await Promise.all([
                api.get(PRODUCTS),
                categories.length === 0 ? api.get(CATEGORIES) : Promise.resolve(null)
            ]);
            
            const productData = prodRes.data?.data?.products || prodRes.data?.data || [];
            dispatch(setProducts(Array.isArray(productData) ? productData : []));

            if (catRes) {
                const categoryData = Array.isArray(catRes.data) 
                    ? catRes.data 
                    : (catRes.data?.data?.categories || catRes.data?.data || []);
                dispatch(setCategories(Array.isArray(categoryData) ? categoryData : []));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getCategoryName = (product) => {
        if (product.categoryId?.name) return product.categoryId.name;
        if (product.category?.name) return product.category.name;
        
        const catId = product.categoryId?._id || product.categoryId?.id || product.categoryId || 
                      product.category?._id || product.category?.id || product.category;
                      
        if (catId) {
            const found = categories.find(c => c._id === catId || c.id === catId);
            if (found) return found.name;
        }
        return "Uncategorized";
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
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            {/* Click-away backdrop overlay for dropdowns */}
            {activeDropdown !== null && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={closeDropdown}
                />
            )}

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Products</h1>
                            {!loading && products.length > 0 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 uppercase tracking-wider">
                                    {products.length} {products.length === 1 ? "Product" : "Products"}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage and organize your store's inventory.</p>
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold text-[13px]"
                    >
                        <span className="text-lg font-bold leading-none">+</span> Add Product
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-2xl border-b border-slate-100">Image</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Name</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Category</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Price</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Stock</th>
                                    <th className="px-6 py-4 text-right rounded-tr-2xl border-b border-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                                                <span className="text-sm font-medium">Loading products...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                    <FiImage className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                                                </div>
                                                <p className="font-semibold text-slate-600 text-base">No products found</p>
                                                <p className="text-sm text-slate-400 mt-1">Click "Add Product" to create your first one.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product._id || product.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shadow-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                                                    <img
                                                        src={product.images?.[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col max-w-xs md:max-w-md lg:max-w-lg">
                                                    <span className="font-semibold text-slate-800 text-[14px] hover:text-brand-600 transition-colors cursor-pointer">{product.name}</span>
                                                    {product.sku && <span className="text-[11px] text-slate-400 font-mono mt-0.5 tracking-wider">{product.sku}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                                                    {getCategoryName(product)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 text-[14px]">₹{product.price}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${product.stock > 0
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                                                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    onClick={() => toggleDropdown(product._id || product.id)}
                                                    className="cursor-pointer p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all focus:outline-none"
                                                >
                                                    <FiMoreVertical className="w-5 h-5" />
                                                </button>

                                                {activeDropdown === (product._id || product.id) && (
                                                    <div className="absolute right-8 top-10 w-36 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-100/50 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                                        <button
                                                            onClick={() => {
                                                                closeDropdown();
                                                                handleOpenEdit(product);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors text-left font-semibold cursor-pointer"
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                closeDropdown();
                                                                openDeleteConfirm(product);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold cursor-pointer"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
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
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTrash2 className="w-6 h-6 text-rose-500 stroke-[2]" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Product</h3>
                            <p className="text-slate-500 mb-6 text-sm font-medium">
                                Are you sure you want to delete <span className="font-bold text-slate-700">"{productToDelete?.name}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsConfirmOpen(false)}
                                    className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all text-[13px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-all shadow-sm text-[13px]"
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
