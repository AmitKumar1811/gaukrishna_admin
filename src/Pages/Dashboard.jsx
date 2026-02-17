import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../services/AxiosInstance";
import { DASHBOARD } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get(DASHBOARD);
      setStats(response.data.data || {});
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const StatCard = ({ title, value, color, icon }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between`}>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <img src={icon} alt={title} className="w-6 h-6" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <ThreeDots height="60" width="60" color="#9900FF" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || "0"}
          color="bg-purple-100 text-purple-600"
          icon="/user.svg"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || "0"}
          color="bg-blue-100 text-blue-600"
          icon="/pacakge.svg"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || "0"}
          color="bg-green-100 text-green-600"
          icon="/dashboard.svg"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue || "0"}`}
          color="bg-orange-100 text-orange-600"
          icon="/revenue.svg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Recent Orders</h3>
          {/* Placeholder for chart or table */}
          <div className="text-gray-500 text-center py-10">Chart Placeholder</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">User Growth</h3>
          {/* Placeholder for chart or table */}
          <div className="text-gray-500 text-center py-10">Chart Placeholder</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
