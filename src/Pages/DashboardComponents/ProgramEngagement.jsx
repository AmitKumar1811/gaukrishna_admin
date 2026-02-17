import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";

// src/data/staticPrograms.js
export const PROGRAM_DATA = [
  { id: "p1", name: "Morning Meditation", duration: 45, activeUsers: 320, week: 1, month: 1, year: 2026 },
  { id: "p2", name: "Deep Focus Music", duration: 120, activeUsers: 890, week: 1, month: 1, year: 2026 },
  { id: "p3", name: "Sleep Therapy", duration: 60, activeUsers: 540, week: 1, month: 1, year: 2026 },
  { id: "p4", name: "Stress Relief Sounds", duration: 35, activeUsers: 210, week: 1, month: 1, year: 2026 },
  { id: "p5", name: "Productivity Boost", duration: 50, activeUsers: 430, week: 1, month: 1, year: 2026 },

  { id: "p6", name: "Focus Beats", duration: 90, activeUsers: 760, week: 2, month: 1, year: 2026 },
  { id: "p7", name: "Healing Frequencies", duration: 70, activeUsers: 610, week: 2, month: 1, year: 2026 },
  { id: "p8", name: "Relaxing Piano", duration: 55, activeUsers: 480, week: 2, month: 1, year: 2026 },
  { id: "p9", name: "Evening Calm", duration: 40, activeUsers: 290, week: 2, month: 1, year: 2026 },
  { id: "p10", name: "Mind Detox", duration: 65, activeUsers: 520, week: 2, month: 1, year: 2026 },

  { id: "p11", name: "Breathing Practice", duration: 30, activeUsers: 200, week: 3, month: 1, year: 2026 },
  { id: "p12", name: "Zen Flow", duration: 75, activeUsers: 680, week: 3, month: 1, year: 2026 },
  { id: "p13", name: "Nature Therapy", duration: 100, activeUsers: 830, week: 3, month: 1, year: 2026 },
  { id: "p14", name: "Deep Sleep Music", duration: 110, activeUsers: 920, week: 3, month: 1, year: 2026 },
  { id: "p15", name: "Positive Affirmations", duration: 25, activeUsers: 260, week: 3, month: 1, year: 2026 },

  { id: "p16", name: "Mindfulness Basics", duration: 45, activeUsers: 340, week: 4, month: 1, year: 2026 },
  { id: "p17", name: "Creative Flow", duration: 80, activeUsers: 710, week: 4, month: 1, year: 2026 },
  { id: "p18", name: "Calm Ocean Waves", duration: 95, activeUsers: 800, week: 4, month: 1, year: 2026 },
  { id: "p19", name: "Anxiety Relief", duration: 60, activeUsers: 560, week: 4, month: 1, year: 2026 },
  { id: "p20", name: "Night Relaxation", duration: 70, activeUsers: 640, week: 4, month: 1, year: 2026 },

  { id: "p21", name: "Morning Energy", duration: 50, activeUsers: 420, week: 1, month: 2, year: 2026 },
  { id: "p22", name: "Deep Concentration", duration: 130, activeUsers: 950, week: 1, month: 2, year: 2026 },
  { id: "p23", name: "Sound Healing", duration: 90, activeUsers: 720, week: 1, month: 2, year: 2026 },
  { id: "p24", name: "Yoga Nidra", duration: 85, activeUsers: 690, week: 1, month: 2, year: 2026 },
  { id: "p25", name: "Evening Wind Down", duration: 40, activeUsers: 310, week: 1, month: 2, year: 2026 },

  { id: "p26", name: "Relax & Reset", duration: 55, activeUsers: 460, week: 2, month: 2, year: 2026 },
  { id: "p27", name: "Focus Marathon", duration: 150, activeUsers: 1020, week: 2, month: 2, year: 2026 },
  { id: "p28", name: "Stress Free Mind", duration: 65, activeUsers: 540, week: 2, month: 2, year: 2026 },
  { id: "p29", name: "Mental Clarity", duration: 70, activeUsers: 600, week: 2, month: 2, year: 2026 },
  { id: "p30", name: "Late Night Calm", duration: 95, activeUsers: 810, week: 2, month: 2, year: 2026 },

  { id: "p31", name: "Morning Flow", duration: 45, activeUsers: 350, week: 3, month: 2, year: 2026 },
  { id: "p32", name: "Healing Piano", duration: 85, activeUsers: 690, week: 3, month: 2, year: 2026 },
  { id: "p33", name: "Deep Relaxation", duration: 100, activeUsers: 870, week: 3, month: 2, year: 2026 },
  { id: "p34", name: "Mind Expansion", duration: 120, activeUsers: 930, week: 3, month: 2, year: 2026 },
  { id: "p35", name: "Evening Serenity", duration: 60, activeUsers: 520, week: 3, month: 2, year: 2026 },

  { id: "p36", name: "Focus Sprint", duration: 40, activeUsers: 310, week: 4, month: 2, year: 2026 },
  { id: "p37", name: "Peaceful Sleep", duration: 110, activeUsers: 960, week: 4, month: 2, year: 2026 },
  { id: "p38", name: "Mind Reset", duration: 75, activeUsers: 640, week: 4, month: 2, year: 2026 },
  { id: "p39", name: "Nature Calm", duration: 90, activeUsers: 780, week: 4, month: 2, year: 2026 },
  { id: "p40", name: "Relaxed Focus", duration: 65, activeUsers: 560, week: 4, month: 2, year: 2026 },

  // ----- Yearly spread -----
  ...Array.from({ length: 60 }, (_, i) => ({
    id: `p${41 + i}`,
    name: `Wellness Program ${41 + i}`,
    duration: 30 + (i % 10) * 10,
    activeUsers: 200 + (i % 20) * 40,
    week: (i % 4) + 1,
    month: (i % 12) + 1,
    year: 2026,
  })),
];

// src/components/ProgramAnalyticsChart.jsx


const FILTERS = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

const filterPrograms = (data, filter) => {
  const now = new Date();
  const currentWeek = Math.ceil(now.getDate() / 7);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (filter === FILTERS.WEEKLY) {
    return data.filter(
      (p) => p.week === currentWeek && p.year === currentYear
    );
  }

  if (filter === FILTERS.MONTHLY) {
    return data.filter(
      (p) => p.month === currentMonth && p.year === currentYear
    );
  }

  if (filter === FILTERS.YEARLY) {
    return data.filter((p) => p.year === currentYear);
  }

  return data;
};

const ProgramAnalyticsChart = () => {
  const [filter, setFilter] = useState(FILTERS.MONTHLY);

  const filteredData = useMemo(
    () => filterPrograms(PROGRAM_DATA, filter),
    [filter]
  );

  const series = [
    {
      name: "Active Users",
      data: filteredData.map((p) => p.activeUsers),
    },
    {
      name: "Listener Duration (min)",
      data: filteredData.map((p) => p.duration),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },

    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "60%",
      },
    },
    xaxis: {
      title: {
        text: "Users / Duration (minutes)",
        style: {
          fontSize: "13px",
          fontWeight: 600,
          color: "#374151",
        },
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
      categories: filteredData.map((p) => p.name),
    },
    colors: ["#8B5CF6", "#10B981"],
    yaxis: {
      title: {
        text: "Programs",
        style: {
          fontSize: "13px",
          fontWeight: 600,
          color: "#374151",
        },
      },
      labels: {
        style: {
          colors: "#374151",
          fontSize: "12px",
          fontWeight: 500,
        },
        maxWidth: 160,
      },
    },

    dataLabels: { enabled: false },
    xaxis: {
      categories: filteredData.map((p) => p.name),
    },
    legend: {
      position: "top",
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    grid: {
      strokeDashArray: 4,
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Program Engagement
          </h3>
          <p className="text-sm text-gray-500">
            Active users & listener duration
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {Object.values(FILTERS).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium
                ${filter === f
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {filteredData.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No data available
        </p>
      ) : (
        <div
          style={{
            height: Math.max(450, filteredData.length * 40),
          }}
        >
          <Chart
            options={options}
            series={series}
            type="bar"
            height="100%"
          />
        </div>
      )}
    </div>
  );
};

export default ProgramAnalyticsChart;

