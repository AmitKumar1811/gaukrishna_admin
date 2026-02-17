import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers, setLoading, setPage } from "../store/userSlice";
import api from "../../services/AxiosInstance";
import { USERS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";
import { ThreeDots } from "react-loader-spinner";

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, totalUsers, page, limit } = useSelector((state) => state.users);

  const fetchUsers = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get(`${USERS}?page=${page}&limit=${limit}`);
      dispatch(setUsers({
        users: response.data.data || [],
        total: response.data.total || 0,
        limit: response.data.limit || 10
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch, page]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage + 1)); // Pagination component might be 0-indexed
  };

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-20 text-center">
                  <div className="flex justify-center">
                    <ThreeDots height="50" width="50" radius="9" color="#9900FF" ariaLabel="three-dots-loading" visible={true} />
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phoneNumber || "-"}</td>
                  <td className="px-6 py-4 capitalize text-gray-600">{user.role || "User"}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#9900FF] hover:text-purple-700 font-medium text-sm">View</button>
                    {/* Add Block/Unblock buttons if needed */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
          <Pagination
            pageCount={totalPages}
            pageValue={page - 1} // 0-indexed for component
            setPage={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Users;