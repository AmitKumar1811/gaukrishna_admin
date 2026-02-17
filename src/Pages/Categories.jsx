import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategories, setLoading } from "../store/categorySlice";
import api from "../../services/AxiosInstance";
import { CATEGORIES } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";

const Categories = () => {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.categories);

    const fetchCategories = async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(CATEGORIES);
            dispatch(setCategories(response.data.data || []));
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch categories");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [dispatch]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                <button className="bg-[#9900FF] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                    + Add Category
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No categories found.
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <img
                                            src={category.image || "https://placehold.co/40x40"}
                                            alt={category.name}
                                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{category.slug}</td>
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

export default Categories;
