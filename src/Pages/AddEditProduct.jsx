import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { addProduct, updateProduct } from "../store/productSlice";
import { setCategories } from "../store/categorySlice";
import api from "../../services/AxiosInstance";
import { PRODUCTS, CATEGORIES } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import {
    PhotoIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationCircleIcon as ExclamationIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { uploadFileToFirebase } from "../utils/imageUpload";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";



const AddEditProduct = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { slug } = useParams();

    const { products } = useSelector((state) => state.products);
    const { categories } = useSelector((state) => state.categories);

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        sku: "",
        category: "",
        mrp: "",
        price: "",
        stock: "",
        description: "",
        short_description: "",
        weight: "",
        benefits: "",
        ingredients: "",
        is_best_seller: false,
        is_new_launch: false,
        isActive: true,
        attributes: [],
        seo: {
            title: "",
            description: "",
            keywords: "",
        },
    });

    const [images, setImages] = useState([]); // Array of { id, url, file }
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [formErrors, setFormErrors] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        const initData = async () => {
            setIsLoadingInit(true);
            try {
                if (categories.length === 0) {
                    const catRes = await api.get(CATEGORIES);
                    const categoryData = Array.isArray(catRes.data)
                        ? catRes.data
                        : (catRes.data?.data?.categories || catRes.data?.data || []);
                    dispatch(
                        setCategories(Array.isArray(categoryData) ? categoryData : [])
                    );
                }

                // Load product data in edit mode
                if (slug) {
                    setIsEditMode(true);
                    let product =
                        location.state?.product || products.find((p) => p.slug === slug);

                    if (!product) {
                        try {
                            const prodRes = await api.get(`${PRODUCTS}/${slug}`);
                            product = prodRes.data?.data || prodRes.data;
                        } catch (err) {
                            console.error(
                                "Failed to fetch product directly by slug",
                                err
                            );
                        }
                    }

                    if (product) {
                        setSelectedProductId(product._id || product.id);
                        setFormData({
                            name: product.name || "",
                            slug: product.slug || "",
                            sku: product.sku || "",
                             category:
                                product.categoryId?._id ||
                                product.categoryId?.id ||
                                product.categoryId ||
                                product.category?._id ||
                                product.category?.id ||
                                product.category ||
                                "",
                            mrp: product.mrp || "",
                            price: product.price || "",
                            stock: product.stock || "",
                            description: product.description || "",
                            short_description: product.short_description || "",
                            weight: product.weight || "",
                            benefits: product.benefits || "",
                            ingredients: product.ingredients || "",
                            is_best_seller: product.is_best_seller || false,
                            is_new_launch: product.is_new_launch || false,
                            isActive: product.isActive !== undefined ? product.isActive : true,
                            attributes: product.attributes
                                ? Object.entries(product.attributes).map(([k, v]) => ({ key: k, value: v }))
                                : [],
                            seo: {
                                title: product.seo?.title || "",
                                description: product.seo?.description || "",
                                keywords: product.seo?.keywords || "",
                            },
                        });
                        const initialImages = product.images || (product.image ? [product.image] : []);
                        setImages(initialImages.map((url, index) => ({
                            id: `existing-${index}-${Date.now()}`,
                            url,
                            file: null
                        })));
                    } else {
                        toast.error("Product not found");
                        navigate("/products");
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load initial data");
            } finally {
                setIsLoadingInit(false);
            }
        };

        initData();
    }, [slug, products, categories.length, dispatch, location.state, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith("seo_")) {
            const seoField = name.replace("seo_", "");
            setFormData((prev) => ({
                ...prev,
                seo: {
                    ...prev.seo,
                    [seoField]: value,
                },
            }));
            return;
        }

        setFormData((prev) => {
            const newData = { ...prev, [name]: type === "checkbox" ? checked : value };

            if (name === "name" && !isEditMode) {
                newData.slug = value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]+/g, "");
            }

            return newData;
        });

        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({ ...prev, description: content }));
        if (formErrors.description) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.description;
                return newErrors;
            });
        }
    };

    const handleBenefitsChange = (content) => {
        setFormData(prev => ({ ...prev, benefits: content }));
    };

    const handleIngredientsChange = (content) => {
        setFormData(prev => ({ ...prev, ingredients: content }));
    };

    const handleAttributeChange = (index, field, value) => {

        const newAttributes = [...formData.attributes];
        newAttributes[index][field] = value;
        setFormData(prev => ({ ...prev, attributes: newAttributes }));
    };

    const addAttribute = () => {
        setFormData(prev => ({ ...prev, attributes: [...prev.attributes, { key: '', value: '' }] }));
    };

    const removeAttribute = (index) => {
        const newAttributes = [...formData.attributes];
        newAttributes.splice(index, 1);
        setFormData(prev => ({ ...prev, attributes: newAttributes }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        const validFiles = [];

        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                toast.error(`"${file.name}" is not a valid image file`);
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`"${file.name}" exceeds 5MB size limit`);
                continue;
            }
            validFiles.push({
                id: Math.random().toString(36).substring(2, 9) + Date.now(),
                url: URL.createObjectURL(file),
                file
            });
        }

        if (validFiles.length > 0) {
            setImages((prev) => [...prev, ...validFiles]);
            if (formErrors.images) {
                setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.images;
                    return newErrors;
                });
            }
        }
        
        if (e.target) {
            e.target.value = "";
        }
    };

    const removeImage = (id) => {
        setImages((prev) => {
            const imageToRemove = prev.find((img) => img.id === id);
            if (imageToRemove && imageToRemove.file) {
                URL.revokeObjectURL(imageToRemove.url);
            }
            return prev.filter((img) => img.id !== id);
        });
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = "Product name is required";
        }
        if (!formData.slug.trim()) {
            errors.slug = "Slug is required";
        }
        if (!formData.sku.trim()) {
            errors.sku = "SKU is required";
        }
        if (!formData.category) {
            errors.category = "Category is required";
        }
        if (!formData.mrp || Number(formData.mrp) <= 0) {
            errors.mrp = "Valid MRP is required";
        }
        if (!formData.price || Number(formData.price) <= 0) {
            errors.price = "Valid selling price is required";
        }
        if (Number(formData.price) > Number(formData.mrp)) {
            errors.price = "Selling price cannot be greater than MRP";
        }
        if (!formData.stock || Number(formData.stock) < 0) {
            errors.stock = "Valid stock quantity is required";
        }
        if (!formData.description.replace(/<(.|\n)*?>/g, '').trim()) {
            errors.description = "Description is required";
        }
        if (images.length === 0) {
            errors.images = "At least one product image is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload all new images to Firebase
            const uploadPromises = images.map(async (img) => {
                if (img.file) {
                    const path = `products/${Date.now()}_${img.file.name}`;
                    const uploadedUrl = await uploadFileToFirebase(img.file, path);
                    return uploadedUrl;
                }
                return img.url; // Keep existing url
            });

            const imageUrls = await Promise.all(uploadPromises);

            const attributesObj = {};
            formData.attributes.forEach(attr => {
                if (attr.key.trim()) {
                    attributesObj[attr.key.trim()] = attr.value.trim();
                }
            });

            const payload = {
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                sku: (formData.sku || "").trim(),
                categoryId: formData.category,
                mrp: Number(formData.mrp),
                price: Number(formData.price),
                stock: Number(formData.stock),
                description: formData.description.trim(),
                short_description: (formData.short_description || "").trim(),
                weight: (formData.weight || "").trim(),
                benefits: (formData.benefits || "").trim(),
                ingredients: (formData.ingredients || "").trim(),
                is_best_seller: formData.is_best_seller,
                is_new_launch: formData.is_new_launch,
                isActive: formData.isActive,
                attributes: attributesObj,
                seo: formData.seo,
                images: imageUrls,
                variants: [],
            };

            if (isEditMode) {
                const response = await api.put(`${PRODUCTS}/${selectedProductId}`, payload);
                const updatedData = response.data?.data || response.data;
                dispatch(updateProduct(updatedData));
                toast.success("Product updated successfully!");
            } else {
                const response = await api.post(PRODUCTS, payload);
                const newData = response.data?.data || response.data;
                dispatch(addProduct(newData));
                toast.success("Product created successfully!");
            }

            navigate("/products");
        } catch (error) {
            console.error(error);
            const errorMessage =
                error.response?.data?.message || "Something went wrong";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingInit) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium text-sm">Loading product data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/products")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-700 transition-all duration-200 mb-6 group cursor-pointer"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
                        <span className="text-[13px] font-semibold">Back to Products</span>
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">
                                {isEditMode
                                    ? "Update product information and details"
                                    : "Create a new product with all the necessary information"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-600 to-brand-500 h-1"></div>

                    <div className="p-8 lg:p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <FormField
                                        label="Product Name"
                                        error={formErrors.name}
                                        required
                                    >
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter product name (e.g., Fresh Organic Milk)"
                                            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none text-[14px] shadow-sm ${formErrors.name
                                                ? "border-rose-300 bg-rose-50"
                                                : "border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                                                }`}
                                        />
                                    </FormField>

                                    {/* Slug */}
                                    <FormField label="URL Slug" error={formErrors.slug} required>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleInputChange}
                                            placeholder="e.g., fresh-organic-milk"
                                            readOnly={isEditMode}
                                            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none text-[14px] shadow-sm ${isEditMode
                                                ? "bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
                                                : formErrors.slug
                                                    ? "border-rose-300 bg-rose-50"
                                                    : "border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                                                }`}
                                        />
                                    </FormField>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Category */}
                                        <FormField
                                            label="Category"
                                            error={formErrors.category}
                                            required
                                        >
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none appearance-none cursor-pointer text-[14px] shadow-sm ${formErrors.category
                                                    ? "border-rose-300 bg-rose-50"
                                                    : "border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                                                    }`}
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                    backgroundRepeat: "no-repeat",
                                                    backgroundPosition: "right 0.5rem center",
                                                    backgroundSize: "1.5em 1.5em",
                                                    paddingRight: "2.5rem",
                                                }}
                                            >
                                                <option value="" disabled>
                                                    Select a category
                                                </option>
                                                {categories.map((cat) => (
                                                    <option
                                                        key={cat._id || cat.id}
                                                        value={cat._id || cat.id}
                                                    >
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>

                                        {/* SKU */}
                                        <FormField label="SKU" error={formErrors.sku} required>
                                            <input
                                                type="text"
                                                name="sku"
                                                value={formData.sku}
                                                onChange={handleInputChange}
                                                placeholder="e.g., MILK-1L-001"
                                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none text-[14px] shadow-sm ${formErrors.sku
                                                    ? "border-rose-300 bg-rose-50"
                                                    : "border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                                                    }`}
                                            />
                                        </FormField>

                                        {/* Weight */}
                                        <FormField label="Weight / Unit">
                                            <input
                                                type="text"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 5L, 500ml"
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white transition-all duration-200 outline-none text-[14px] shadow-sm"
                                            />
                                        </FormField>
                                    </div>

                                    {/* Benefits */}
                                    <FormField label="Benefits">
                                        <div className="bg-white rounded-lg">
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.benefits}
                                                onChange={handleBenefitsChange}
                                                placeholder="Write product benefits..."
                                                className="quill-editor border-slate-200"
                                                modules={{
                                                    toolbar: [
                                                        ['bold', 'italic', 'underline', 'strike'],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                        ['clean']
                                                    ],
                                                }}
                                                style={{ height: '150px', marginBottom: '45px' }}
                                            />
                                        </div>
                                    </FormField>

                                    {/* Ingredients */}
                                    <FormField label="Ingredients">
                                        <div className="bg-white rounded-lg">
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.ingredients}
                                                onChange={handleIngredientsChange}
                                                placeholder="Write product ingredients..."
                                                className="quill-editor border-gray-200"
                                                modules={{
                                                    toolbar: [
                                                        ['bold', 'italic', 'underline', 'strike'],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                        ['clean']
                                                    ],
                                                }}
                                                style={{ height: '150px', marginBottom: '45px' }}
                                            />
                                        </div>
                                    </FormField>

                                    {/* Pricing & Stock */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            label="MRP (₹)"
                                            error={formErrors.mrp}
                                            required
                                            small
                                        >
                                            <input
                                                type="number"
                                                name="mrp"
                                                value={formData.mrp}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none text-[14px] shadow-sm ${formErrors.mrp
                                                    ? "border-rose-300 bg-rose-50"
                                                    : "border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                                                    }`}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Price (₹)"
                                            error={formErrors.price}
                                            required
                                            small
                                        >
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none text-[14px] shadow-sm ${formErrors.price
                                                    ? "border-rose-300 bg-rose-50"
                                                    : "border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                                                    }`}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Stock"
                                            error={formErrors.stock}
                                            required
                                            small
                                        >
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleInputChange}
                                                placeholder="0"
                                                min="0"
                                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none text-[14px] shadow-sm ${formErrors.stock
                                                    ? "border-rose-300 bg-rose-50"
                                                    : "border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                                                    }`}
                                            />
                                        </FormField>
                                    </div>

                                    {/* Attributes UI */}
                                    <div className="bg-slate-50/70 p-6 rounded-xl border border-slate-100 mt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base font-bold text-slate-800">Product Attributes</h3>
                                            <button
                                                type="button"
                                                onClick={addAttribute}
                                                className="text-[13px] px-3.5 py-1.5 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 font-semibold transition-colors cursor-pointer border border-brand-200"
                                            >
                                                + Add Attribute
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.attributes.map((attr, index) => (
                                                <div key={index} className="flex gap-3 items-start">
                                                    <input
                                                        type="text"
                                                        placeholder="Key (e.g., benefits)"
                                                        value={attr.key}
                                                        onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                                                        className="w-1/3 px-4 py-2.5 border rounded-lg border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white transition-all duration-200 outline-none text-[13px] shadow-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Value (e.g., Boosts Immunity)"
                                                        value={attr.value}
                                                        onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                                                        className="flex-1 px-4 py-2.5 border rounded-lg border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white transition-all duration-200 outline-none text-[13px] shadow-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttribute(index)}
                                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-medium px-2 py-2 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.attributes.length === 0 && (
                                                <p className="text-slate-400 text-sm italic font-medium">No attributes added yet. Click "+ Add Attribute" to start.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="flex flex-wrap gap-6 pt-2">
                                        <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-700 text-[13px]">
                                            <input type="checkbox" name="is_best_seller" checked={formData.is_best_seller} onChange={handleInputChange} className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer" />
                                            Best Seller
                                        </label>
                                        <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-700 text-[13px]">
                                            <input type="checkbox" name="is_new_launch" checked={formData.is_new_launch} onChange={handleInputChange} className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer" />
                                            New Launch
                                        </label>
                                        <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-700 text-[13px]">
                                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer" />
                                            Active Status
                                        </label>
                                    </div>
                                </div>

                                {/* Right Column - Image Upload */}
                                <div className="lg:col-span-1">
                                    <FormField
                                        label="Product Images"
                                        error={formErrors.images}
                                        required
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            {images.map((img, idx) => (
                                                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                                                    <img
                                                        src={img.url}
                                                        alt={`Preview ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(img.id)}
                                                        className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-700 transition-all duration-200 shadow-md cursor-pointer"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="relative group cursor-pointer aspect-square rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-brand-400 transition-all duration-200 bg-slate-50 hover:bg-brand-50"
                                            >
                                                <div className="mb-2 p-2 bg-brand-100 rounded-lg group-hover:bg-brand-200 transition-colors">
                                                    <PhotoIcon className="w-5 h-5 text-brand-600" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">Add Image</span>
                                                <span className="text-[10px] text-slate-500 mt-0.5 font-medium">PNG, JPG up to 5MB</span>
                                            </div>
                                        </div>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                        />
                                    </FormField>
                                </div>
                            </div>

                            {/* ============= Description ============= */}

                            <FormField
                                label="Short Description"
                            >
                                <textarea
                                    name="short_description"
                                    value={formData.short_description}
                                    onChange={handleInputChange}
                                    placeholder="A brief catchy description..."
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white transition-all duration-200 outline-none resize-none text-[14px] shadow-sm"
                                />
                            </FormField>
                            <FormField
                                label="Main Description"
                                error={formErrors.description}
                                required
                            >
                                <div className="bg-white rounded-lg">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.description}
                                        onChange={handleDescriptionChange}
                                        placeholder="Write a detailed product description, features, and benefits..."
                                        className={`quill-editor ${formErrors.description ? "border-rose-300" : "border-slate-200"}`}
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                [{ 'color': [] }, { 'background': [] }],
                                                ['link', 'clean']
                                            ],
                                        }}
                                        style={{ height: '300px', marginBottom: '45px' }}
                                    />
                                </div>
                            </FormField>


                            {/* ============= SEO ============= */}
                            <div className="bg-slate-50/70 p-6 lg:p-8 rounded-xl border border-slate-100">
                                <h3 className="text-base font-bold text-slate-800 mb-6">SEO Details</h3>
                                <div className="space-y-6">
                                    <FormField label="Meta Title">
                                        <input type="text" name="seo_title" value={formData.seo.title} onChange={handleInputChange} placeholder="e.g., Amla & Ashwagandha Chyawanprash | Boost Immunity naturally" className="w-full px-4 py-3 rounded-lg border border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white transition-all duration-200 outline-none text-[14px] shadow-sm" />
                                    </FormField>
                                    <FormField label="Meta Description">
                                        <textarea name="seo_description" value={formData.seo.description} onChange={handleInputChange} placeholder="Enter a rich meta description..." rows="3" className="w-full px-4 py-3 rounded-lg border border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white transition-all duration-200 outline-none resize-none text-[14px] shadow-sm" />
                                    </FormField>
                                    <FormField label="Keywords">
                                        <input type="text" name="seo_keywords" value={formData.seo.keywords} onChange={handleInputChange} placeholder="e.g., chyawanprash, immunity booster, amla" className="w-full px-4 py-3 rounded-lg border border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white transition-all duration-200 outline-none text-[14px] shadow-sm" />
                                    </FormField>
                                </div>
                            </div>

                            {/* ============= Form Actions ============= */}
                            <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100">
                                <div className="text-[13px] text-slate-400 font-medium">
                                    {isEditMode ? (
                                        <p>Editing product • ID: <span className="font-mono text-[12px] text-slate-500">{selectedProductId}</span></p>
                                    ) : (
                                        <p>Creating a new product</p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/products")}
                                        className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-[13px] bg-white hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[13px] shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] active:scale-95 cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>
                                                    {isEditMode ? "Updating..." : "Creating..."}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircleIcon className="w-5 h-5" />
                                                <span>
                                                    {isEditMode ? "Update Product" : "Create Product"}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormField = ({ label, error, required, children, small = false }) => {
    return (
        <div>
            <label className="flex items-center gap-1 text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                {label}
                {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
            {error && (
                <div className="flex items-center gap-1 mt-1.5 text-[13px] text-rose-600 font-medium">
                    <ExclamationIcon className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default AddEditProduct;