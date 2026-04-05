import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/AxiosInstance";
import { DASHBOARD } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";

const Dashboard = () => {
  const emptyStats = useMemo(
    () => ({
      totalUsers: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalRevenue: 0,
      lowStockProducts: [],
    }),
    []
  );

  const [stats, setStats] = useState(emptyStats);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const isMountedRef = useRef(true);

  const fetchDashboardStats = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setRefreshing(true);
      const response = await api.get(DASHBOARD);

      if (!isMountedRef.current) return;

      setStats((prev) => ({ ...prev, ...(response?.data?.data || {}) }));
      setLastUpdatedAt(new Date());
    } catch (error) {
      console.error(error);
      if (!silent) toast.error("Failed to fetch dashboard stats");
    } finally {
      if (isMountedRef.current) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const run = async () => {
      await fetchDashboardStats();
    };

    run();

    const intervalMs = 10_000; // "realtime" polling
    const intervalId = setInterval(() => {
      fetchDashboardStats({ silent: true });
    }, intervalMs);

    const onFocus = () => {
      fetchDashboardStats({ silent: true });
    };

    window.addEventListener("focus", onFocus);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchDashboardStats]);

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

  const formattedUpdatedAt = useMemo(() => {
    if (!lastUpdatedAt) return "";
    return lastUpdatedAt.toLocaleString();
  }, [lastUpdatedAt]);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <ThreeDots height="60" width="60" color="#0f6845" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">Welcome back, Admin</p>
          <div className="flex items-center gap-3">
            {formattedUpdatedAt ? (
              <span className="text-xs text-gray-400">Last updated: {formattedUpdatedAt}</span>
            ) : null}
            <button
              type="button"
              onClick={() => fetchDashboardStats()}
              className="text-xs font-semibold text-green-700 hover:text-green-800"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Low Stock Products</h3>
            <span className="text-xs text-gray-500">
              {Array.isArray(stats?.lowStockProducts) ? stats.lowStockProducts.length : 0}
            </span>
          </div>

          {Array.isArray(stats?.lowStockProducts) && stats.lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-3 font-medium">Product</th>
                    <th className="py-2 pr-3 font-medium">Stock</th>
                    <th className="py-2 pr-3 font-medium">SKU/ID</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.slice(0, 8).map((p, idx) => (
                    <tr key={p?._id || p?.id || p?.sku || idx} className="border-b last:border-b-0">
                      <td className="py-2 pr-3 text-gray-800">
                        {p?.name || p?.title || p?.productName || "—"}
                      </td>
                      <td className="py-2 pr-3 text-gray-800">
                        {p?.stock ?? p?.quantity ?? p?.availableQuantity ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-gray-500">{p?.sku || p?._id || p?.id || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {stats.lowStockProducts.length > 8 ? (
                <div className="pt-3 text-xs text-gray-500">Showing 8 of {stats.lowStockProducts.length}</div>
              ) : null}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-10">No low stock products</div>
          )}
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
