import React from "react";
import { FiActivity, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

const analyticsData = [
  {
    id: 1,
    api: "/login",
    method: "POST",
    status: "Success",
    responseTime: "320ms",
    time: "10:32 AM",
  },
  {
    id: 2,
    api: "/send-notification",
    method: "POST",
    status: "Failed",
    reason: "Invalid FCM token",
    responseTime: "210ms",
    time: "10:35 AM",
  },
  {
    id: 3,
    api: "/get-users",
    method: "GET",
    status: "Success",
    responseTime: "120ms",
    time: "10:40 AM",
  },
  {
    id: 4,
    api: "/update-profile",
    method: "PUT",
    status: "Failed",
    reason: "Unauthorized access",
    responseTime: "450ms",
    time: "10:45 AM",
  },
];

const Analytics = () => {
  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <FiActivity className="w-6 h-6 stroke-[2.5]" />
              </div>
              API Analytics
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2">Monitor recent API requests and performance metrics.</p>
          </div>
        </div>

        {/* Analytics Table */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500">
                <tr>
                  <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Endpoint</th>
                  <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Method</th>
                  <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Status</th>
                  <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Response Time</th>
                  <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Time</th>
                  <th className="py-4 px-6 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">Failure Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analyticsData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 font-mono text-[13px] text-slate-700 font-medium">
                      {item.api}
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                        item.method === 'GET' ? 'bg-blue-50 text-blue-700' :
                        item.method === 'POST' ? 'bg-emerald-50 text-emerald-700' :
                        item.method === 'PUT' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.method}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {item.status === "Success" ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[13px]">
                          <FiCheckCircle className="w-4 h-4" />
                          Success
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-[13px]">
                          <FiXCircle className="w-4 h-4" />
                          Failed
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {item.responseTime}
                    </td>
                    
                    <td className="py-4 px-6 text-slate-500 flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      {item.time}
                    </td>

                    <td className="py-4 px-6">
                      {item.reason ? (
                        <span className="text-rose-500 font-medium text-[13px]">{item.reason}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
