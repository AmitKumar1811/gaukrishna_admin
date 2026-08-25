import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/AxiosInstance";
import { BLOGS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { FiArrowLeft, FiEdit2, FiImage, FiTrash2 } from "react-icons/fi";

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        const loadBlog = async () => {
            setLoading(true);
            try {
                const response = await api.get(`${BLOGS}/${id}`);
                const data = response.data?.data || response.data;
                if (!data?._id && !data?.id) {
                    toast.error("Blog not found");
                    navigate("/blogs");
                    return;
                }
                setBlog(data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load blog");
                navigate("/blogs");
            } finally {
                setLoading(false);
            }
        };
        loadBlog();
    }, [id, navigate]);

    const handleDelete = async () => {
        try {
            await api.delete(`${BLOGS}/${id}`);
            toast.success("Blog deleted");
            navigate("/blogs");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete blog");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium text-sm">Loading blog...</p>
                </div>
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => navigate("/blogs")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-700 transition-all group cursor-pointer w-fit"
                    >
                        <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[13px] font-semibold">Back to blogs</span>
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/blogs/edit/${id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-semibold cursor-pointer"
                        >
                            <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                            onClick={() => setIsConfirmOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[13px] font-semibold cursor-pointer"
                        >
                            <FiTrash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>

                <article className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-600 to-brand-500 h-1"></div>
                    {blog.image ? (
                        <img src={blog.image} alt={blog.title} className="w-full h-64 object-cover bg-slate-100" />
                    ) : (
                        <div className="w-full h-40 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                            <FiImage className="w-10 h-10 text-slate-300" />
                        </div>
                    )}
                    <div className="p-6 md:p-10">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                blog.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                                {blog.isActive ? "Published" : "Draft"}
                            </span>
                            {blog.slug && <span className="text-xs font-mono text-slate-400">/{blog.slug}</span>}
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-3">{blog.title}</h1>
                        <p className="text-sm text-slate-500 mb-6">
                            {blog.author || "Admin"}
                            {blog.createdAt ? ` · ${new Date(blog.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}` : ""}
                        </p>
                        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {blog.tags.map((tag) => (
                                    <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div
                            className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: blog.content || "" }}
                        />
                    </div>
                </article>
            </div>

            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
                        <h3 className="text-lg font-bold mb-2">Delete Blog</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Delete <span className="font-bold">{blog.title}</span>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-semibold cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogDetail;
