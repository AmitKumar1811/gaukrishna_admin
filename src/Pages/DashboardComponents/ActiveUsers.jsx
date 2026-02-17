import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import moment from "moment";
import { Calendar } from "lucide-react";

const ActiveUsersLineChart = () => {
  const [filter, setFilter] = useState("week");
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({});

  useEffect(() => {
    let labels = [];
    let data = [];

    if (filter === "week") {
      labels = Array.from({ length: 7 }, (_, i) =>
        moment().subtract(6 - i, "days").format("ddd")
      );
      data = [420, 450, 470, 460, 490, 520, 540];
    }

    if (filter === "month") {
      labels = Array.from({ length: 30 }, (_, i) =>
        moment().subtract(29 - i, "days").format("DD MMM")
      );
      data = Array.from({ length: 30 }, (_, i) => 400 + i * 5);
    }

    if (filter === "year") {
      labels = moment.monthsShort();
      data = [300, 320, 340, 360, 390, 420, 460, 500, 540, 580, 610, 650];
    }

    setSeries([
      {
        name: "Active Users",
        data,
      },
    ]);

    setOptions({
      chart: {
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "Inter, sans-serif",
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      colors: ["#8B5CF6"],
      markers: {
        size: 4,
        strokeWidth: 2,
        hover: { size: 6 },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            colors: "#9CA3AF",
            fontSize: "11px",
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => Math.round(val),
          style: {
            colors: "#9CA3AF",
            fontSize: "11px",
          },
        },
      },
      grid: {
        borderColor: "#f3f4f6",
        strokeDashArray: 4,
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val) => `${val} Users`,
        },
      },
    });
  }, [filter]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Active Users Trend
          </h3>
          <p className="text-xs text-gray-500">
            Static active users overview
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[300px]">
        <Chart options={options} series={series} type="line" height="100%" width="100%" />
      </div>
    </div>
  );
};

export default ActiveUsersLineChart;
