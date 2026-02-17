import React from "react";

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📊 App Analytics</h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 text-left">API</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Response Time</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Failure Reason</th>
            </tr>
          </thead>

          <tbody>
            {analyticsData.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium">{item.api}</td>

                <td className="p-3">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                    {item.method}
                  </span>
                </td>

                <td className="p-3">
                  {item.status === "Success" ? (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                      Success
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                      Failed
                    </span>
                  )}
                </td>

                <td className="p-3">{item.responseTime}</td>
                <td className="p-3">{item.time}</td>

                <td className="p-3 text-red-600">
                  {item.reason || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
