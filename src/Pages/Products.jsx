import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setProducts, setLoading } from "../store/productSlice";
import api from "../../services/AxiosInstance";
import { PRODUCTS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";

const Products = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.products);

    const fetchProducts = async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(PRODUCTS);
            dispatch(setProducts(response.data.data || []));
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch products");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [dispatch]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                <button className="bg-[#9900FF] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                    + Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <img
                                            src={product.image || "https://placehold.co/40x40"}
                                            alt={product.name}
                                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{product.category?.name || "-"}</td>
                                    <td className="px-6 py-4 text-gray-900 font-semibold">₹{product.price}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                                        <button className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
