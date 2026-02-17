import React from "react";

export const ProgramStatusWidget = ({ live, upcoming, onView }) => {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all h-full">
            <h3 className="text-base font-semibold text-gray-900">
                Programs Status
            </h3>
            <p className="text-xs text-gray-500 mt-1">Based on current time</p>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-green-600 font-medium">Live Programs</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{live ?? "--"}</p>
                    <button
                        onClick={() => onView("live")}
                        className="mt-2 text-xs text-green-700 font-semibold hover:underline"
                    >
                        View Live →
                    </button>
                </div>

                <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-600 font-medium">Upcoming Programs</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{upcoming ?? "--"}</p>
                    <button
                        onClick={() => onView("upcoming")}
                        className="mt-2 text-xs text-blue-700 font-semibold hover:underline"
                    >
                        View Upcoming →
                    </button>
                </div>
            </div>
        </div>
    );
};
