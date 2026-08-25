import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/AxiosInstance";
import { BLOGS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { uploadFileToFirebase } from "../utils/imageUpload";
import { FiArrowLeft, FiImage } from "react-icons/fi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const emptyForm = {
    title: "",
    slug: "",
    content: "",
    author: "Admin",
    tags: "",
    isActive: true,
    image: null,
};

const editorModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

const toSlug = (value) =>
    value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

const AddEditBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState(emptyForm);
    const [imagePreview, setImagePreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);

    useEffect(() => {
        if (!isEditMode) return;

        const loadBlog = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`${BLOGS}/${id}`);
                const blog = response.data?.data || response.data;
                if (!blog?._id && !blog?.id) {
                    toast.error("Blog not found");
                    navigate("/blogs");
                    return;
                }
                setFormData({
                    title: blog.title || "",
                    slug: blog.slug || "",
                    content: blog.content || "",
                    author: blog.author || "Admin",
                    tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
                    isActive: blog.isActive !== false,
                    image: null,
                });
                setImagePreview(blog.image || "");
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load blog");
                navigate("/blogs");
            } finally {
                setIsLoading(false);
            }
        };

        loadBlog();
    }, [id, isEditMode, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: type === "checkbox" ? checked : value };
            if (name === "title" && !isEditMode) next.slug = toSlug(value);
            return next;
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file");
            return;
        }
        setFormData((prev) => ({ ...prev, image: file }));
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const plainContent = (formData.content || "").replace(/<(.|\n)*?>/g, "").trim();
        if (!formData.title.trim() || !plainContent) {
            toast.error("Title and content are required");
            return;
        }

        setIsSubmitting(true);
        try {
            let imageUrl = imagePreview.startsWith("blob:") ? "" : imagePreview;
            if (formData.image instanceof File) {
                const extension = formData.image.name?.split(".").pop();
                const fileName = `${toSlug(formData.slug || formData.title) || "blog"}-${Date.now()}${extension ? `.${extension}` : ""}`;
                imageUrl = await uploadFileToFirebase(formData.image, `blogs/${fileName}`);
            }

            const payload = {
                title: formData.title.trim(),
                slug: toSlug(formData.slug || formData.title),
                content: formData.content,
                author: formData.author.trim() || "Admin",
                tags: formData.tags
                    ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                    : [],
                isActive: formData.isActive,
                ...(imageUrl ? { image: imageUrl } : {}),
            };

            if (isEditMode) {
                await api.put(`${BLOGS}/${id}`, payload);
                toast.success("Blog updated");
                navigate(`/blogs/${id}`);
            } else {
                const response = await api.post(BLOGS, payload);
                const created = response.data?.data || response.data;
                toast.success("Blog created");
                navigate(created?._id || created?.id ? `/blogs/${created._id || created.id}` : "/blogs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save blog");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium text-sm">Loading blog...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(isEditMode ? `/blogs/${id}` : "/blogs")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-700 transition-all mb-6 group cursor-pointer"
                >
                    <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[13px] font-semibold">{isEditMode ? "Back to blog" : "Back to blogs"}</span>
                </button>

                <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
                    {isEditMode ? "Edit Blog" : "Add Blog"}
                </h1>
                <p className="text-slate-500 text-sm font-medium mb-8">
                    {isEditMode ? "Update the article and publish changes to the website." : "Write a new article for the Gau Krishna website."}
                </p>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-600 to-brand-500 h-1"></div>
                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Title *</label>
                            <input name="title" value={formData.title} onChange={handleChange} placeholder="Blog title" required className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">URL slug</label>
                            <input name="slug" value={formData.slug} onChange={handleChange} placeholder="url-slug" className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Author</label>
                                <input name="author" value={formData.author} onChange={handleChange} placeholder="Author" className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tags</label>
                                <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags, comma separated" className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Cover image</p>
                            <div className="flex items-center gap-4">
                                <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                                    {imagePreview ? <img src={imagePreview} alt="" className="w-full h-full object-cover" /> : <FiImage className="text-slate-300 w-7 h-7" />}
                                </div>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                                    Upload image
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Content *</p>
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden blog-editor">
                                <ReactQuill theme="snow" value={formData.content} onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))} modules={editorModules} />
                            </div>
                            <style>{`.blog-editor .ql-editor { min-height: 280px; }`}</style>
                        </div>

                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                            Published (visible on website)
                        </label>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button type="button" onClick={() => navigate("/blogs")} className="flex-1 py-3 rounded-lg border border-slate-200 text-sm font-semibold cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-60 cursor-pointer">
                                {isSubmitting ? "Saving..." : isEditMode ? "Update Blog" : "Create Blog"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditBlog;
