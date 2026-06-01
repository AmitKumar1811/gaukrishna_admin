import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategories, setLoading, addCategory, updateCategory, deleteCategory } from "../store/categorySlice";
import api from "../../services/AxiosInstance";
import { CATEGORIES } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { XMarkIcon, PhotoIcon, EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { uploadFileToFirebase } from "../utils/imageUpload";

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

    // Dropdown state
    const [activeDropdown, setActiveDropdown] = useState(null);

    const fetchCategories = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(CATEGORIES);
            // Handle both nested structure and direct array format
            const categoryData = Array.isArray(response.data)
                ? response.data
                : (response.data?.data?.categories || response.data?.data || []);

            dispatch(setCategories(categoryData));
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch categories");
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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
            let imageUrl;
            if (formData.image) {
                const extension = formData.image.name?.split(".").pop();
                const safeSlug = (formData.slug || "category")
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]+/g, "");
                const fileName = `${safeSlug}-${Date.now()}${extension ? `.${extension}` : ""}`;
                imageUrl = await uploadFileToFirebase(formData.image, `categories/${fileName}`);
            }

            const data = {
                name: formData.name,
                slug: formData.slug,
                ...(imageUrl ? { image: imageUrl } : {}),
            };

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
        <div className="p-6 bg-slate-50/50 min-h-screen relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Categories</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage your product categories</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="cursor-pointer bg-[#0f6845] hover:bg-[#0b4d33] text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold text-sm"
                >
                    <span className="text-lg font-bold">+</span> Add Category
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/40 border border-slate-100 overflow-visible">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-2xl">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Created At</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0f6845] rounded-full animate-spin mb-2"></div>
                                        <span className="text-sm font-medium">Loading categories...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                                            <PhotoIcon className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="font-semibold text-slate-600 text-base">No categories found</p>
                                        <p className="text-sm text-slate-400 mt-0.5">Click "Add Category" to create your first one.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category._id || category.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm flex-shrink-0 transition-transform duration-200 hover:scale-105">
                                            <img
                                                src={category.image || "https://placehold.co/48x48?text=N/A"}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-800 text-[15px] capitalize">{category.name}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-sm tracking-wider">{category.slug}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                        {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${category.isActive
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-rose-50 text-rose-700 border-rose-100"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                                            {category.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === (category._id || category.id) ? null : (category._id || category.id))}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all focus:outline-none"
                                        >
                                            <EllipsisVerticalIcon className="w-5 h-5" />
                                        </button>
                                        
                                        {activeDropdown === (category._id || category.id) && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setActiveDropdown(null)}
                                                ></div>
                                                <div className="absolute right-8 top-10 w-36 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-100/50 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                                    <button
                                                        onClick={() => {
                                                            handleOpenEditModal(category);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-[#0f6845] transition-colors flex items-center gap-2 font-medium"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            openDeleteConfirm(category);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 transition-colors flex items-center gap-2 font-medium"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
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
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#0f6845] text-white font-semibold hover:bg-purple-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
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
