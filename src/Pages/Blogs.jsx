import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setBlogs, setLoading } from "../store/blogSlice";
import api from "../../services/AxiosInstance";
import { BLOGS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiImage, FiEye } from "react-icons/fi";

const Blogs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { blogs = [], loading = false } = useSelector((state) => state.blogs || {});
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    const totalPages = Math.ceil(totalItems / limit);
    const blogList = Array.isArray(blogs) ? blogs : [];

    const fetchBlogs = async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(`${BLOGS}?page=${page}&limit=${limit}`);
            const payload = response.data;
            const list = Array.isArray(payload) ? payload : (payload.data || []);
            dispatch(setBlogs(list));
            setTotalItems(payload.total || list.length || 0);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to fetch blogs");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [page]);

    useEffect(() => {
        if (totalPages > 0 && page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const blogId = (blog) => blog._id || blog.id;

    const handleDelete = async () => {
        if (!blogToDelete) return;
        try {
            await api.delete(`${BLOGS}/${blogId(blogToDelete)}`);
            toast.success("Blog deleted");
            setIsConfirmOpen(false);
            fetchBlogs();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete blog");
        }
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Blogs</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Create and manage articles shown on the Gau Krishna website.</p>
                    </div>
                    <button
                        onClick={() => navigate("/blogs/add")}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                    >
                        <FiPlus className="w-4 h-4 stroke-[2.5]" /> Add Blog
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-2xl border-b border-slate-100">Image</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Title</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Slug</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                    <th className="px-6 py-4 rounded-tr-2xl border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                                                <span className="text-sm font-medium">Loading blogs...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : blogList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                    <FiFileText className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                                                </div>
                                                <p className="font-semibold text-slate-600 text-base">No blogs found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    blogList.map((blog) => (
                                        <tr key={blogId(blog)} className="hover:bg-slate-50/50 transition-colors duration-150">
                                            <td className="px-6 py-4">
                                                {blog.image ? (
                                                    <img src={blog.image} alt={blog.title} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                        <FiImage className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 text-[14px] max-w-xs truncate">
                                                <button
                                                    onClick={() => navigate(`/blogs/${blogId(blog)}`)}
                                                    className="hover:text-brand-600 cursor-pointer text-left"
                                                    title={blog.title}
                                                >
                                                    {blog.title}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-[13px] font-medium max-w-xs truncate">{blog.slug}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                        blog.isActive
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                                    }`}
                                                >
                                                    {blog.isActive ? "Published" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => navigate(`/blogs/${blogId(blog)}`)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                                                        title="View"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/blogs/edit/${blogId(blog)}`)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setBlogToDelete(blog); setIsConfirmOpen(true); }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs font-medium text-slate-500">
                            {totalItems === 0 ? "No blogs" : `Showing ${Math.min((page - 1) * limit + 1, totalItems)}-${Math.min(page * limit, totalItems)} of ${totalItems} blogs`}
                        </p>
                        <Pagination pageCount={totalPages} pageValue={page - 1} setPage={(p) => setPage(p + 1)} />
                    </div>
                </div>
            </div>

            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
                        <h3 className="text-lg font-bold mb-2">Delete Blog</h3>
                        <p className="text-sm text-slate-500 mb-6">Delete <span className="font-bold">{blogToDelete?.title}</span>? This cannot be undone.</p>
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

export default Blogs;
