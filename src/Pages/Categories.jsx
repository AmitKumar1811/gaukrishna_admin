import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategories, setLoading, addCategory, updateCategory, deleteCategory } from "../store/categorySlice";
import api from "../../services/AxiosInstance";
import { CATEGORIES } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { uploadFileToFirebase } from "../utils/imageUpload";
import { FiMoreVertical, FiEdit2, FiTrash2, FiImage, FiX } from "react-icons/fi";

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
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Categories</h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage your product categories.</p>
                    </div>
                    <button
                        onClick={handleOpenAddModal}
                        className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold text-[13px]"
                    >
                        <span className="text-lg font-bold leading-none">+</span> Add Category
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-2xl border-b border-slate-100">Image</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Name</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Slug</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Created At</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                    <th className="px-6 py-4 text-right rounded-tr-2xl border-b border-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                                                <span className="text-sm font-medium">Loading categories...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                    <FiImage className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                                                </div>
                                                <p className="font-semibold text-slate-600 text-base">No categories found</p>
                                                <p className="text-sm text-slate-400 mt-1">Click "Add Category" to create your first one.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category._id || category.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shadow-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                                                    <img
                                                        src={category.image || "https://placehold.co/48x48?text=N/A"}
                                                        alt={category.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-800 text-[14px] capitalize hover:text-brand-600 transition-colors cursor-pointer">{category.name}</td>
                                            <td className="px-6 py-4 text-slate-400 font-mono text-[12px] tracking-wider">{category.slug}</td>
                                            <td className="px-6 py-4 text-slate-500 text-[13px] font-medium">
                                                {category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${category.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                                    }`}>
                                                    {category.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === (category._id || category.id) ? null : (category._id || category.id))}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all focus:outline-none cursor-pointer"
                                                >
                                                    <FiMoreVertical className="w-5 h-5" />
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
                                                                className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors flex items-center gap-2.5 font-semibold cursor-pointer"
                                                            >
                                                                <FiEdit2 className="w-4 h-4" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    openDeleteConfirm(category);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2.5 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 font-semibold cursor-pointer"
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

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                {isEditMode ? "Edit Category" : "Add New Category"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-slate-50/30">
                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Milk & Dairy"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-all outline-none text-[14px] bg-white shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. milk-and-dairy"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-all outline-none text-[14px] bg-slate-50 text-slate-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                    Category Image
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative group cursor-pointer"
                                >
                                    {imagePreview ? (
                                        <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                                <p className="text-white text-sm font-semibold tracking-wide">Change Image</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-40 w-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-white group-hover:bg-brand-50/50 group-hover:border-brand-300 transition-all shadow-sm">
                                            <FiImage className="w-8 h-8 text-slate-300 mb-2 group-hover:text-brand-400 transition-colors stroke-[1.5]" />
                                            <p className="text-[13px] font-medium text-slate-500 group-hover:text-brand-600 transition-colors">Click to upload image</p>
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
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-800 transition-all text-[13px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 text-[13px]"
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTrash2 className="w-6 h-6 text-rose-500 stroke-[2]" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Category</h3>
                            <p className="text-slate-500 mb-6 text-sm font-medium">
                                Are you sure you want to delete <span className="font-bold text-slate-700">"{categoryToDelete?.name}"</span>? This action cannot be undone.
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

export default Categories;
