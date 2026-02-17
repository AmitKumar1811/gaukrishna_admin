import React from "react";
import { useNavigate } from "react-router-dom";

export const WeeklyPurchaseModal = ({ open, onClose, purchases }) => {
    const navigate = useNavigate();
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Recent Purchases (Last 7 Days)</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">✕</button>
                </div>
                {purchases.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-10">No purchases found</p>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500 border-b border-gray-100 sticky top-0 bg-white">
                                <tr>
                                    <th className="py-3 font-medium">Program</th>
                                    <th className="py-3 font-medium">User</th>
                                    <th className="py-3 font-medium">Date</th>
                                    <th className="text-right py-3 font-medium">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map((p) => (
                                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 font-medium text-gray-900">{p.title}</td>
                                        <td onClick={() => navigate(`/users/${p.userId}`)} className="py-3 font-medium cursor-pointer text-blue-500 hover:text-blue-700">{p.userName}</td>
                                        <td className="text-gray-500">{p.date.toLocaleDateString()}</td>
                                        <td className="text-right font-bold text-gray-900">₹ {p.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">Close</button>
                </div>
            </div>
        </div>
    );
};

export const ProgramListModal = ({ open, type, programs, onClose }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{type === "live" ? "Live Programs" : "Upcoming Programs"}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">✕</button>
                </div>
                {programs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-10">No programs found</p>
                ) : (
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500 border-b border-gray-100 sticky top-0 bg-white">
                                <tr>
                                    <th className="py-3 font-medium">ID</th>
                                    <th className="py-3 font-medium">Program</th>
                                    <th className="py-3 font-medium">Status</th>
                                    <th className="py-3 font-medium">Start</th>
                                    <th className="py-3 font-medium">End</th>
                                </tr>
                            </thead>
                            <tbody>
                                {programs.map((p) => {
                                    const now = Math.floor(Date.now() / 1000);
                                    const status = p.startTime <= now && p.endTime >= now ? "LIVE" : p.startTime > now ? "UPCOMING" : "COMPLETED";
                                    return (
                                        <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 font-mono text-xs text-gray-400">{p.id}</td>
                                            <td className="font-medium text-gray-900">{p.programName || "Unnamed Program"}</td>
                                            <td>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status === "LIVE" ? "bg-green-100 text-green-700" : status === "UPCOMING" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="text-gray-500">{new Date(p.startTime * 1000).toLocaleString()}</td>
                                            <td className="text-gray-500">{new Date(p.endTime * 1000).toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">Close</button>
                </div>
            </div>
        </div>
    );
};
