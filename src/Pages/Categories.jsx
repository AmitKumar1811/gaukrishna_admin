import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategories, setLoading, addCategory, updateCategory, deleteCategory } from "../store/categorySlice";
import api from "../../services/AxiosInstance";
import { CATEGORIES } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";

const Categories = () => {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.categories);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        image: null
    });
    const [imagePreview, setImagePreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Confirmation Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const fetchCategories = async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(CATEGORIES);
            // Handling nested structure: response.data.data.categories
            const categoryData = response.data?.data?.categories || response.data?.data || [];
            dispatch(setCategories(Array.isArray(categoryData) ? categoryData : []));
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

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setSelectedCategory(null);
        setFormData({ name: "", slug: "", image: null });
        setImagePreview("");
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category) => {
        setIsEditMode(true);
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            image: null
        });
        setImagePreview(category.image || "");
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            if (name === "name" && !isEditMode) {
                newData.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            }
            return newData;
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let data;

            if (formData.image) {
                // Use FormData for image upload
                data = new FormData();
                data.append("name", formData.name);
                data.append("slug", formData.slug);
                data.append("image", formData.image);
            } else {
                // Use JSON for text-only updates
                data = {
                    name: formData.name,
                    slug: formData.slug
                };
            }

            if (isEditMode) {
                const response = await api.put(`${CATEGORIES}/${selectedCategory._id || selectedCategory.id}`, data);
                const updatedData = response.data?.data || response.data;
                dispatch(updateCategory(updatedData));
                toast.success("Category updated successfully");
            } else {
                const response = await api.post(CATEGORIES, data);
                const newData = response.data?.data || response.data;
                dispatch(addCategory(newData));
                toast.success("Category added successfully");
            }
            setIsModalOpen(false);
            fetchCategories(); // Refresh to sync with server count/order
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteConfirm = (category) => {
        setCategoryToDelete(category);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await api.delete(`${CATEGORIES}/${categoryToDelete._id || categoryToDelete.id}`);
            dispatch(deleteCategory(categoryToDelete._id || categoryToDelete.id));
            toast.success("Category deleted successfully");
            setIsConfirmOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete category");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                    <p className="text-gray-500 text-sm">Manage your product categories</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="cursor-pointer bg-[#9900FF] text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-all shadow-sm flex items-center gap-2 font-medium"
                >
                    <span className="text-xl">+</span> Add Category
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
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
                                        <span>Loading categories...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                                            <PhotoIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="font-medium text-gray-600">No categories found</p>
                                        <p className="text-sm">Click "Add Category" to create your first one.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category._id || category.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <img
                                                src={category.image || "https://placehold.co/48x48?text=N/A"}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">{category.slug}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${category.isActive
                                                ? "bg-green-50 text-green-700 border-green-100"
                                                : "bg-red-50 text-red-700 border-red-100"
                                            }`}>
                                            {category.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenEditModal(category)}
                                            className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(category)}
                                            className="text-red-600 hover:text-red-800 font-medium transition-colors"
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

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditMode ? "Edit Category" : "Add New Category"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Milk & Dairy"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. milk-and-dairy"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all outline-none bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Category Image
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative group cursor-pointer"
                                >
                                    {imagePreview ? (
                                        <div className="relative h-40 w-full rounded-xl overflow-hidden border-2 border-purple-100">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white text-sm font-medium">Change Image</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-40 w-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 group-hover:bg-gray-100 group-hover:border-purple-300 transition-all">
                                            <PhotoIcon className="w-10 h-10 text-gray-300 mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload image</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#9900FF] text-white font-semibold hover:bg-purple-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            {isEditMode ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        isEditMode ? "Update Category" : "Create Category"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                You are about to delete <span className="font-semibold text-gray-800">"{categoryToDelete?.name}"</span>. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsConfirmOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-sm"
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

export default Categories;
