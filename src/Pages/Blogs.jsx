import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBlogs, setLoading } from "../store/blogSlice";
import api from "../../services/AxiosInstance";
import { BLOGS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";

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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
                <button className="bg-[#9900FF] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                    + Add Blog
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : blogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No blogs found.
                                </td>
                            </tr>
                        ) : (
                            blogs.map((blog) => (
                                <tr key={blog.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <img
                                            src={blog.image || "https://placehold.co/40x40"}
                                            alt={blog.title}
                                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={blog.title}>
                                        {blog.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{blog.slug}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === "published"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {blog.status}
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

export default Blogs;
