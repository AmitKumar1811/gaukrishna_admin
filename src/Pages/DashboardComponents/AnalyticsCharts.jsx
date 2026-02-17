import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import moment from "moment";
import { Filter } from "lucide-react";

const AnalyticsCharts = ({ programsData, purchasesData }) => {
    const [timeFilter, setTimeFilter] = useState("monthly");
    const [chartData, setChartData] = useState({ series: [], options: {} });

    console.log("programsData", programsData);

    useEffect(() => {
        if (!programsData || !purchasesData) return;

        let startDate;
        switch (timeFilter) {
            case "weekly":
                startDate = moment().startOf("isoWeek");
                break;
            case "yearly":
                startDate = moment().startOf("year");
                break;
            default:
                startDate = moment().startOf("month");
        }

        const filteredPurchases = purchasesData.filter(p => {
            if (!p.createdAt) return false;

            let pDate;
            if (typeof p.createdAt?.toDate === "function") {
                pDate = moment(p.createdAt.toDate());
            } else if (p.createdAt?.seconds) {
                pDate = moment.unix(p.createdAt.seconds);
            } else {
                pDate = moment(p.createdAt);
            }

            return pDate.isValid() && pDate.isSameOrAfter(startDate);
        });

        const conversionMap = {};

        filteredPurchases.forEach(p => {
            const prog = programsData.find(pr =>
                pr.appStoreProductId === p.productId ||
                pr.playStoreProductId === p.productId ||
                pr.appleProductId === p.productId ||
                pr.googleProductId === p.productId ||
                pr.productId === p.productId ||
                pr.programId === p.productId ||
                pr.id === p.productId ||
                pr.appStoreConfig?.productId === p.productId ||
                pr.playStoreConfig?.productId === p.productId
            );

            console.log("prog found for product:", p.productId, prog); // Debug log

            const progName =
                prog?.programName ||
                prog?.title ||
                prog?.appStoreName ||
                prog?.playStoreTitle ||
                prog?.appStoreConfig?.name ||
                prog?.playStoreConfig?.title ||
                `Program (${p.productId})`;


            if (!conversionMap[progName]) {
                conversionMap[progName] = { revenue: 0, count: 0 };
            }

            const amount = Number(p.amount) || Number(prog?.price) || 0;
            conversionMap[progName].revenue += amount;
            conversionMap[progName].count += 1;
        });

        const sortedPrograms = Object.entries(conversionMap)
            .sort(([, a], [, b]) => b.revenue - a.revenue)
            .slice(0, 10);

        const categories = sortedPrograms.map(([name]) => name);
        const revenueData = sortedPrograms.map(([, d]) => d.revenue);
        const countData = sortedPrograms.map(([, d]) => d.count);

        const series = [
            { name: "Total Revenue", data: revenueData },
            { name: "Sales Count", data: countData }
        ];

        const options = {
            chart: {
                type: "bar",
                background: "transparent",
                toolbar: { show: false },
                fontFamily: "Inter, sans-serif",
                animations: {
                    enabled: true,
                    easing: "easeinout",
                    speed: 800,
                    animateGradually: { enabled: true, delay: 150 },
                    dynamicAnimation: { enabled: true, speed: 350 }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    columnWidth: "55%",
                    barHeight: "60%",
                    borderRadius: 4
                }
            },
            colors: ["#8B5CF6", "#10B981"],
            dataLabels: { enabled: false },
            stroke: { show: true, width: 1, colors: ["transparent"] },
            xaxis: {
                categories,
                title: {
                    text: "Revenue / Sales Count",
                    style: {
                        color: "#374151",
                        fontSize: "13px",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif"
                    }
                },
                labels: {
                    style: {
                        colors: "#6B7280",
                        fontSize: "11px",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500
                    }
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },

            yaxis: {
                title: {
                    text: "Programs",
                    rotate: -90,
                    style: {
                        color: "#374151",
                        fontSize: "13px",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif"
                    }
                },
                labels: {
                    style: {
                        colors: "#374151",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif"
                    },
                    maxWidth: 160
                }
            },

            legend: {
                position: "top",
                horizontalAlign: "right",
                offsetY: -10,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                markers: { radius: 12 }
            },
            grid: {
                borderColor: "#f3f4f6",
                strokeDashArray: 4,
                xaxis: { lines: { show: true } },
                padding: { left: 10 }
            },
            tooltip: {
                theme: "light",
                shared: true,
                intersect: false,
                borderRadius: 8,
                style: {
                    fontSize: "12px",
                    fontFamily: "Inter, sans-serif"
                },
                y: {
                    formatter: (val, { seriesIndex }) =>
                        seriesIndex === 0 ? `₹ ${val.toLocaleString()}` : `${val} Sales`
                }
            }
        };

        setChartData({ series, options });
    }, [programsData, purchasesData, timeFilter]);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Program Performance</h3>
                    <p className="text-sm text-gray-500">Revenue vs Purchase Volume</p>
                </div>

                <div className="bg-gray-100 p-1 rounded-xl flex">
                    {["weekly", "monthly", "yearly"].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setTimeFilter(filter)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize ${timeFilter === filter
                                ? "bg-white text-purple-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full h-[500px]">
                {chartData.series?.[0]?.data?.length ? (
                    <Chart
                        options={chartData.options}
                        series={chartData.series}
                        type="bar"
                        height="100%"

                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Filter className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">
                            No performance data found for this period
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsCharts;
