import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBlogs, setLoading } from "../store/blogSlice";
import api from "../../services/AxiosInstance";
import { BLOGS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiFileText } from "react-icons/fi";

const Blogs = () => {
    const dispatch = useDispatch();
    const { blogs, loading } = useSelector((state) => state.blogs);

    const fetchBlogs = async () => {
        dispatch(setLoading(true));
        try {
            const response = await api.get(BLOGS);
            dispatch(setBlogs(response.data.data || []));
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch blogs");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [dispatch]);

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Blogs</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage blog posts and articles.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer">
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
                                ) : blogs.length === 0 ? (
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
                                    blogs.map((blog) => (
                                        <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                                            <td className="px-6 py-4">
                                                <img
                                                    src={blog.image || "https://placehold.co/40x40"}
                                                    alt={blog.title}
                                                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 text-[14px] max-w-xs truncate" title={blog.title}>
                                                {blog.title}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-[13px] font-medium max-w-xs truncate">{blog.slug}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${blog.status === "published"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                                        }`}
                                                >
                                                    {blog.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer">
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
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
                </div>
            </div>
        </div>
    );
};

export default Blogs;
