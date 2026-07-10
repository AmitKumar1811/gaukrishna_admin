import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/AxiosInstance";
import { DASHBOARD } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";
import { FiUsers, FiPackage, FiGrid, FiDollarSign, FiRefreshCw } from "react-icons/fi";

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
    fetchDashboardStats();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchDashboardStats]);

  const StatCard = ({ title, value, colorClass, icon: Icon, growth }) => (
    <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 flex items-center justify-between transition-transform duration-300 hover:-translate-y-1">
      <div>
        <h3 className="text-slate-500 text-sm font-semibold mb-1.5 tracking-wide uppercase">{title}</h3>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
          {growth !== undefined && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${growth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {growth > 0 ? "+" : ""}{growth}%
            </span>
          )}
        </div>
      </div>
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6 stroke-[2.5]" />
      </div>
    </div>
  );

  const formattedUpdatedAt = useMemo(() => {
    if (!lastUpdatedAt) return "";
    return lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [lastUpdatedAt]);

  if (initialLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] bg-slate-50">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
        <span className="text-sm text-slate-400 font-medium">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Here's what's happening in your store today.</p>
          </div>
          <div className="flex items-center gap-3">
            {formattedUpdatedAt && (
              <span className="text-xs font-medium text-slate-400">Updated today at {formattedUpdatedAt}</span>
            )}
            <button
              onClick={() => fetchDashboardStats()}
              disabled={refreshing}
              className="flex items-center gap-2 text-[13px] font-semibold text-brand-700 bg-brand-50 px-4 py-2 rounded-lg hover:bg-brand-100 transition-colors border border-brand-100 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.counts?.totalUsers || "0"}
            growth={stats?.counts?.userGrowth}
            colorClass="bg-blue-50 text-blue-600"
            icon={FiUsers}
          />
          <StatCard
            title="Total Orders"
            value={stats?.counts?.totalOrders || "0"}
            growth={stats?.counts?.orderGrowth}
            colorClass="bg-emerald-50 text-emerald-600"
            icon={FiPackage}
          />
          <StatCard
            title="Total Products"
            value={stats?.counts?.totalProducts || "0"}
            colorClass="bg-purple-50 text-purple-600"
            icon={FiGrid}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats?.counts?.totalRevenue || "0"}`}
            growth={stats?.counts?.revenueGrowth}
            colorClass="bg-gold-50 text-gold-600"
            icon={FiDollarSign}
          />
        </div>

        {/* Charts & Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sales Trend Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg mb-6 tracking-tight">Sales & Orders Trend</h3>
            <div className="h-72">
              <Chart
                options={{
                  chart: {
                    type: 'area',
                    toolbar: { show: false },
                    fontFamily: 'Inter, sans-serif',
                    zoom: { enabled: false }
                  },
                  colors: ['#3a6b35', '#4e8f47'],
                  fill: {
                    type: 'gradient',
                    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
                  },
                  dataLabels: { enabled: false },
                  stroke: { curve: 'smooth', width: 3 },
                  xaxis: {
                    categories: (stats?.graphs?.salesTrend || []).map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    labels: { style: { colors: '#64748b', fontWeight: 500 } },
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                  },
                  yaxis: [
                    { labels: { style: { colors: '#64748b', fontWeight: 500 } } },
                    { opposite: true, labels: { style: { colors: '#64748b', fontWeight: 500 } } }
                  ],
                  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
                  legend: { position: 'top', horizontalAlign: 'right', fontWeight: 600, markers: { radius: 12 } },
                  tooltip: {
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
                  { name: 'Revenue (₹)', data: (stats?.graphs?.salesTrend || []).map(item => item.revenue) },
                  { name: 'Orders', data: (stats?.graphs?.salesTrend || []).map(item => item.orders) }
                ]}
                type="area"
                height="100%"
                width="100%"
              />
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 flex flex-col">
            <h3 className="font-bold text-slate-800 text-lg mb-6 tracking-tight">Top Selling Products</h3>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="pb-3 pr-3 font-semibold uppercase text-xs tracking-wider">Product</th>
                    <th className="pb-3 pr-3 font-semibold uppercase text-xs tracking-wider text-center">Sold</th>
                    <th className="pb-3 font-semibold uppercase text-xs tracking-wider text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(stats?.graphs?.topProducts || []).slice(0, 5).map((p, idx) => (
                    <tr key={p?.productId || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pr-3">
                        <div className="font-semibold text-slate-800 capitalize">{p?.name || "Unknown Product"}</div>
                      </td>
                      <td className="py-4 pr-3 text-center">
                        <span className="inline-flex items-center justify-center bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full text-xs font-bold">
                          {p?.totalSold || 0}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-slate-800">
                        ₹{p?.revenue || 0}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.graphs?.topProducts || stats.graphs.topProducts.length === 0) && (
                    <tr>
                      <td colSpan="3" className="text-center text-slate-400 py-10 font-medium">No sales data available yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Recent Orders</h3>
            <button className="text-[13px] font-semibold text-brand-700 hover:text-brand-800 transition-colors">View All &rarr;</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase text-xs tracking-wider rounded-tl-lg border-b border-slate-100">Order ID</th>
                  <th className="py-3 px-4 font-semibold uppercase text-xs tracking-wider border-b border-slate-100">Customer</th>
                  <th className="py-3 px-4 font-semibold uppercase text-xs tracking-wider border-b border-slate-100">Date</th>
                  <th className="py-3 px-4 font-semibold uppercase text-xs tracking-wider border-b border-slate-100">Amount</th>
                  <th className="py-3 px-4 font-semibold uppercase text-xs tracking-wider rounded-tr-lg border-b border-slate-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats?.recentOrders || []).map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4 text-slate-500 font-mono text-xs">{order.orderId}</td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800 capitalize">{order.user?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-500 font-medium">{order.user?.email || ""}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">₹{order.totalAmount}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        order.orderStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        order.orderStatus === 'pending' ? 'bg-gold-50 text-gold-700 border border-gold-200' : 
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan="5" className="text-center text-slate-400 py-10 font-medium">No recent orders found</td>
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
