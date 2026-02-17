import React, { useEffect, useState } from "react";

const StatCard = ({ icon, value = 0, label, gradient, duration = 800 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === null || value === undefined) return;

    let start = 0;
    const end = Number(value);
    if (isNaN(end)) return;

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ease-out animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.floor(easedProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-xl ${gradient} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}
        >
          <img src={icon} alt={label} className="w-5 h-5 object-contain" />
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900 tracking-tight">
          {displayValue.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-gray-500 mt-1">
          {label}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
