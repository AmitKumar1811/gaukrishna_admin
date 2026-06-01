import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/AxiosInstance";
import { DASHBOARD } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
import Chart from "react-apexcharts";

const Dashboard = () => {
  const emptyStats = useMemo(
    () => ({
      counts: {
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        userGrowth: 0,
        orderGrowth: 0,
        revenueGrowth: 0,
      },
      lowStockProducts: [],
      recentOrders: [],
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

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchDashboardStats]);

  const StatCard = ({ title, value, color, icon, growth }) => (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 flex items-center justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">{title}</h3>
        <div className="flex items-end gap-3">
          <p className="text-3xl font-extrabold text-gray-800 tracking-tight">{value}</p>
          {growth !== undefined && (
            <span className={`text-xs font-bold mb-1.5 px-2 py-0.5 rounded-full ${growth >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {growth > 0 ? "+" : ""}{growth}%
            </span>
          )}
        </div>
      </div>
      <div className={`p-4 rounded-2xl ${color} shadow-sm`}>
        <img src={icon} alt={title} className="w-7 h-7" />
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
    <div className="p-6 min-h-screen relative bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Dashboard</h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-gray-500 text-sm font-medium">Welcome back, Admin</p>
            <div className="flex items-center gap-4">
              {formattedUpdatedAt ? (
                <span className="text-xs font-medium text-gray-400 bg-white/60 px-3 py-1.5 rounded-full border border-white/80 shadow-sm backdrop-blur-md">Last updated: {formattedUpdatedAt}</span>
              ) : null}
              <button
                type="button"
                onClick={() => fetchDashboardStats()}
                className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-full hover:bg-emerald-200 transition-colors shadow-sm backdrop-blur-md"
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "Refresh Stats"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.counts?.totalUsers || "0"}
            growth={stats?.counts?.userGrowth}
            color="bg-purple-100 text-purple-600"
            icon="/user.svg"
          />
          <StatCard
            title="Total Orders"
            value={stats?.counts?.totalOrders || "0"}
            growth={stats?.counts?.orderGrowth}
            color="bg-blue-100 text-blue-600"
            icon="/pacakge.svg"
          />
          <StatCard
            title="Total Products"
            value={stats?.counts?.totalProducts || "0"}
            color="bg-green-100 text-green-600"
            icon="/dashboard.svg"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats?.counts?.totalRevenue || "0"}`}
            growth={stats?.counts?.revenueGrowth}
            color="bg-orange-100 text-orange-600"
            icon="/revenue.svg"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
            <h3 className="font-extrabold text-gray-800 mb-6 text-lg">Sales & Orders Trend</h3>
            <div className="h-72">
              <Chart
                options={{
                  chart: {
                    type: 'line',
                    toolbar: { show: false },
                    fontFamily: 'inherit',
                    parentHeightOffset: 0,
                    zoom: { enabled: false }
                  },
                  colors: ['#f97316', '#3b82f6'],
                  dataLabels: { enabled: false },
                  stroke: { curve: 'smooth', width: 4 },
                  xaxis: {
                    categories: (stats?.graphs?.salesTrend || []).map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    labels: { style: { colors: '#64748b', fontWeight: 500 } },
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                  },
                  yaxis: [
                    {
                      labels: { style: { colors: '#64748b', fontWeight: 500 } },
                    },
                    {
                      opposite: true,
                      labels: { style: { colors: '#64748b', fontWeight: 500 } },
                    }
                  ],
                  grid: {
                    borderColor: '#e2e8f0',
                    strokeDashArray: 3,
                    xaxis: { lines: { show: false } },
                    yaxis: { lines: { show: true } },
                  },
                  legend: {
                    position: 'top',
                    horizontalAlign: 'center',
                    fontWeight: 500,
                  },
                  tooltip: {
                    shared: true,
                    intersect: false,
                    theme: 'light',
                    y: {
                      formatter: function (y, { seriesIndex }) {
                        if (typeof y !== "undefined") {
                          return seriesIndex === 0 ? "₹" + y.toFixed(0) : y.toFixed(0);
                        }
                        return y;
                      }
                    }
                  }
                }}
                series={[
                  {
                    name: 'Revenue (₹)',
                    data: (stats?.graphs?.salesTrend || []).map(item => item.revenue)
                  },
                  {
                    name: 'Orders',
                    data: (stats?.graphs?.salesTrend || []).map(item => item.orders)
                  }
                ]}
                type="line"
                height="100%"
                width="100%"
              />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
            <h3 className="font-extrabold text-gray-800 mb-6 text-lg">Top Selling Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-3 font-medium">Product</th>
                    <th className="py-2 pr-3 font-medium text-center">Sold</th>
                    <th className="py-2 pr-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.graphs?.topProducts || []).slice(0, 5).map((p, idx) => (
                    <tr key={p?.productId || idx} className=" hover:bg-gray-50">
                      <td className="py-3 pr-3 text-gray-800 font-medium capitalize">
                        {p?.name || "Unknown Product"}
                      </td>
                      <td className="py-3 pr-3 text-gray-800 text-center">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">{p?.totalSold || 0}</span>
                      </td>
                      <td className="py-3 pr-3 text-gray-800 text-right font-semibold">
                        ₹{p?.revenue || 0}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.graphs?.topProducts || stats.graphs.topProducts.length === 0) && (
                    <tr>
                      <td colSpan="3" className="text-center text-gray-500 py-6">No sales data available yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-gray-800 text-lg">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50">
                  <th className="py-3 px-4 font-medium rounded-tl-lg">Order ID</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(stats?.recentOrders || []).map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-500 font-mono text-xs">{order.orderId}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800 capitalize">{order.user?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{order.user?.email || ""}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">₹{order.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${order.orderStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-8">No recent orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
