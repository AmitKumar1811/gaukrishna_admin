import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setProducts, setLoading, deleteProduct } from "../store/productSlice";
import api from "../../services/AxiosInstance";
import { PRODUCTS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";

const Products = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading } = useSelector((state) => state.products);

    // Confirmation Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

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
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <p className="text-gray-500 text-sm">Manage your products</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="cursor-pointer bg-[#0f6845] text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-all shadow-sm flex items-center gap-2 font-medium"
                >
                    <span className="text-xl">+</span> Add Product
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-2"></div>
                                        <span>Loading products...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                                            <PhotoIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="font-medium text-gray-600">No products found</p>
                                        <p className="text-sm">Click "Add Product" to create your first one.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product._id || product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <img
                                                src={product.image || "https://placehold.co/48x48?text=N/A"}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{product.category?.name || "Uncategorized"}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">₹{product.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${product.stock > 0
                                            ? "bg-green-50 text-green-700 border-green-100"
                                            : "bg-red-50 text-red-700 border-red-100"
                                            }`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenEdit(product)}
                                            className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(product)}
                                            className="cursor-pointer text-red-600 hover:text-red-800 font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
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
