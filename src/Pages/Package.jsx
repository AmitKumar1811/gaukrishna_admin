import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import Pagination from "../components/Pagiantion.jsx";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import moment from "moment/moment";

import { db } from "../Firebase/index.js";
import { query as Q, where, collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";


const Package = () => {
  const navigate = useNavigate();
  const query = useSelector((state) => state.search.query);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [categories, setCategories] = useState([])
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // function to execute
  const [confirmMessage, setConfirmMessage] = useState(""); // message to show
  const [type, setType] = useState("")
  // Helper to safely parse any date format (Timestamp, seconds, ms, string)
  const parseDate = (value) => {
    if (!value) return null;

    // Handle Firestore Timestamp
    if (typeof value === 'object' && value.seconds) {
      return moment.unix(value.seconds);
    }

    // Handle Numeric inputs
    const num = Number(value);
    if (!isNaN(num)) {
      // If < 100 billion, assume seconds (Unix timestamp)
      if (num < 100000000000) {
        return moment.unix(num);
      }
      // Otherwise milliseconds
      return moment(num);
    }

    // Fallback for strings
    return moment(value);
  };

  const formatTime = (value) => {
    const m = parseDate(value);
    if (!m || !m.isValid()) return "--";
    return m.format("DD MMM YYYY, hh:mm A");
  };

  const getPackageTimeStatus = (pkg) => {
    const now = moment();

    const start = parseDate(pkg.startDate);
    const end = parseDate(pkg.endDate);

    if (!start || !end) return "unknown";

    if (start.isAfter(now)) return "upcoming";
    if (start.isSameOrBefore(now) && end.isSameOrAfter(now)) return "ongoing";
    return "completed";
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return {
          label: "Upcoming",
          bg: "bg-blue-50",
          text: "text-blue-700",
          dot: "bg-blue-500",
          border: "border-blue-200",
        };

      case "ongoing":
        return {
          label: "Ongoing",
          bg: "bg-green-50",
          text: "text-green-700",
          dot: "bg-green-500",
          border: "border-green-200",
        };

      case "completed":
        return {
          label: "Completed",
          bg: "bg-gray-100",
          text: "text-gray-700",
          dot: "bg-gray-500",
          border: "border-gray-200",
        };

      default:
        return {
          label: "Unknown",
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          dot: "bg-yellow-500",
          border: "border-yellow-200",
        };
    }
  };


  const fetchPrograms = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch programs
      const usersRef = collection(db, "packages");
      const snapshot = await getDocs(usersRef);

      let data = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }));

      // 2️⃣ Fetch payments count for each program
      let dataWithPaymentsCount = await Promise.all(
        data.map(async (program) => {
          if (!program.productId) return { ...program, subscribersCount: 0 };

          const paymentsQuery = Q(
            collection(db, "iapPurchases"),
            where("productId", "==", program.productId)
          );
          const paymentsSnap = await getDocs(paymentsQuery);

          return {
            ...program,
            subscribersCount: paymentsSnap.size, // ✅ number of payments/subscribers
          };
        })
      );

      // 3️⃣ Search filter
      if (query?.trim()) {
        const lowerQuery = query.toLowerCase();
        dataWithPaymentsCount = dataWithPaymentsCount.filter((p) =>
          p.packageName?.toLowerCase().includes(lowerQuery) ||
          p._id?.toLowerCase().includes(lowerQuery)
        );
      }

      // ✅ Status filter
      if (statusFilter) {
        dataWithPaymentsCount = dataWithPaymentsCount.filter(
          (p) => getPackageTimeStatus(p) === statusFilter
        );
      }

      // ✅ Language filter
      if (languageFilter) {
        dataWithPaymentsCount = dataWithPaymentsCount.filter(
          (p) => p.language?.toLowerCase() === languageFilter.toLowerCase()
        );
      }

      // ✅ Category filter
      if (categoryFilter) {
        dataWithPaymentsCount = dataWithPaymentsCount.filter(
          (p) => p.programCategory === categoryFilter
        );
      }
      if (type) {
        dataWithPaymentsCount = dataWithPaymentsCount.filter(
          (p) => p.type === type
        );
      }

      // ✅ Date range filter
      if (startDateFilter || endDateFilter) {
        dataWithPaymentsCount = dataWithPaymentsCount.filter((p) => {
          if (!p.startDate) return false;

          const programMoment = parseDate(p.startDate);
          if (!programMoment || !programMoment.isValid()) return false;

          if (startDateFilter) {
            const startMoment = moment(startDateFilter).startOf('day');
            if (programMoment.isBefore(startMoment)) return false;
          }

          if (endDateFilter) {
            // End date inclusive, so take end of day
            const endMoment = moment(endDateFilter).endOf('day');
            if (programMoment.isAfter(endMoment)) return false;
          }

          return true;
        });
      }
      // 🔥 TIME-BASED SORT (IMPORTANT)
      const statusPriority = {
        upcoming: 0,
        ongoing: 1,
        completed: 2,
      };

      dataWithPaymentsCount.sort((a, b) => {
        const statusA = getPackageTimeStatus(a);
        const statusB = getPackageTimeStatus(b);

        // 1️⃣ Sort by status priority
        if (statusPriority[statusA] !== statusPriority[statusB]) {
          return statusPriority[statusA] - statusPriority[statusB];
        }

        // 2️⃣ Same status → sort by start time DESCENDING (greater/later start time first)
        const startA = parseDate(a.startDate);
        const startB = parseDate(b.startDate);

        if (!startA && !startB) return 0;
        if (!startA) return 1;  // Missing dates go to bottom
        if (!startB) return -1;
        return startB.valueOf() - startA.valueOf(); // DESCENDING: greater start time first
      });

      setTotalItems(dataWithPaymentsCount.length);

      // 5️⃣ Pagination
      const paginated = dataWithPaymentsCount.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
      );
      setUsers(paginated);


      console.log("Programs with payments count:", dataWithPaymentsCount);
    } catch (error) {
      console.error("Error fetching package:", error);
      toast.error("Failed to fetch package. Check Firebase rules!");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const catsSnapshot = await getDocs(collection(db, "packageCategories"));

      const cats = catsSnapshot.docs
        .map((doc) => doc.data()?.name)
        .filter(Boolean); // remove null / undefined

      setCategories(cats);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchOptions()
  }, [currentPage,
    query,
    statusFilter,
    languageFilter,
    categoryFilter,
    startDateFilter,
    endDateFilter, type]);
  useEffect(() => {
    setCurrentPage(0)
  }, [query, statusFilter,
    languageFilter,
    categoryFilter,
    startDateFilter,
    endDateFilter, type]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "packages", id));
      setOpenMenuIndex(null);
      toast.success("Package deleted successfully");
      fetchPrograms();
    } catch (error) {
      console.error("Error deleting Package:", error);
      toast.error("Failed to delete proPackagegram");
    }
  };
  const handlePublish = async (id, status) => {
    try {
      const userRef = doc(db, "packages", id);
      await updateDoc(userRef, {
        type: status,
      });

      toast.success("Type Changed Successfully....")
      fetchPrograms();
      setOpenMenuIndex(false)

    } catch (error) {
      console.error("Error updating type:", error);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("td")) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const ALL_PROGRAMS = [
    "Yoga",
    "Meditation",
    "Weight Loss",
    "Nutrition",
  ]

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadCSV = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch all packages
      const snapshot = await getDocs(collection(db, "packages"));
      let data = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }));

      // 2️⃣ Add subscribers count
      data = await Promise.all(
        data.map(async (pkg) => {
          if (!pkg.productId) return { ...pkg, subscribersCount: 0 };

          const paymentsQuery = Q(
            collection(db, "iapPurchases"),
            where("productId", "==", pkg.productId)
          );
          const paymentsSnap = await getDocs(paymentsQuery);

          return {
            ...pkg,
            subscribersCount: paymentsSnap.size,
          };
        })
      );

      // 3️⃣ Apply same filters
      if (query?.trim()) {
        const q = query.toLowerCase();
        data = data.filter(
          (p) =>
            p.packageName?.toLowerCase().includes(q) ||
            p._id?.toLowerCase().includes(q)
        );
      }

      if (statusFilter) {
        dataWithPaymentsCount = dataWithPaymentsCount.filter(
          (p) => getPackageTimeStatus(p) === statusFilter
        );
      }

      if (languageFilter) {
        data = data.filter(
          (p) => p.language?.toLowerCase() === languageFilter.toLowerCase()
        );
      }

      if (categoryFilter) {
        data = data.filter((p) => p.packageCategory === categoryFilter);
      }

      if (startDateFilter || endDateFilter) {
        data = data.filter((p) => {
          const d = parseDate(p.startDate);
          if (!d || !d.isValid()) return false;

          if (startDateFilter && d.isBefore(moment(startDateFilter).startOf("day")))
            return false;
          if (endDateFilter && d.isAfter(moment(endDateFilter).endOf("day")))
            return false;

          return true;
        });
      }

      // 4️⃣ Prepare CSV rows
      const csvData = data.map((p) => ({
        Package_ID: p._id,
        Package_Name: p.packageName || "",
        Type: p.packageType || "",
        Category: p.packageCategory || "",
        Language: p.language || "",
        Price: p.price || "",
        Subscribers: p.subscribersCount || 0,
        Status: p.type || "",
        Start_Date: p.startDate ? moment(parseDate(p.startDate)).format("D MMM YYYY") : "",
        End_Date: p.endDate ? moment(parseDate(p.endDate)).format("D MMM YYYY") : "",
        Created_At: formatTime(p.createdAt),
      }));

      if (!csvData.length) {
        toast.info("No data to export");
        return;
      }

      const headers = Object.keys(csvData[0]).join(",");
      const rows = csvData.map((row) =>
        Object.values(row)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );

      const csv = [headers, ...rows].join("\n");

      // 5️⃣ Download file
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `packages_${Date.now()}.csv`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download CSV");
    } finally {
      setLoading(false);
    }
  };


  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Packages
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage subscription packages </p>
        </div>

        <div className="flex gap-5">
          <button
            onClick={() => navigate("/add-package")}
            className="flex items-center gap-2 bg-[#9900FF] cursor-pointer hover:bg-[#7f00d4] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-plus text-xs"></i> Add Package
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-[#9900FF] hover:bg-[#7f00d4] cursor-pointer text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">

        {/* Status */}
        {/* <div className="flex-1 min-w-[150px]">
           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
           <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
              >
                {/* Options need to be specific to Packages if Status exists on them, assuming same as Programs based on user code filtering */}
        {/* <option value="">All Status</option>
                <option value="Live">Live</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Aired">Aired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <i className="fa-solid fa-chevron-down text-xs"></i>
              </div>
           </div>
        </div> */}
        {/* Status */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
            Status
          </label>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200
        text-gray-700 py-2.5 px-4 pr-8 rounded-xl leading-tight
        focus:outline-none focus:bg-white focus:border-[#9900FF]
        focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>



        {/* Language */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Language</label>
          <div className="relative">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
            >
              <option value="">All Languages</option>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>

            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
            Type
          </label>

          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200
        text-gray-700 py-2.5 px-4 pr-8 rounded-xl leading-tight
        focus:outline-none focus:bg-white focus:border-[#9900FF]
        focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
            >
              <option value="">All type</option>
              <option value="publish">Published</option>
              <option value="draft">Draft</option>
              <option value="archive">Archived</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">From</label>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:bg-white focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">To</label>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:bg-white focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
          />
        </div>

        {/* Clear */}
        <button
          onClick={() => {
            setStatusFilter("");
            setLanguageFilter("");
            setCategoryFilter("");
            setStartDateFilter("");
            setType("")
            setEndDateFilter("");
          }}
          className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package Id</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscribers </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"> Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">End Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="11" >
                    <div className="flex justify-center items-center py-20">
                      <ThreeDots height="50" width="50" radius="9" visible={true} color="#9900FF" ariaLabel="three-dots-loading" />
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 text-gray-500 text-sm">{index + 1 + currentPage * itemsPerPage}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 ">
                      <div className="flex items-center gap-2 group/id cursor-pointer" onClick={() => copyToClipboard(user?._id)}>
                        <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 truncate max-w-[100px]" title={user?._id}>
                          {user?._id ? user?._id : "_"}
                        </code>
                        <i className="fa-regular fa-copy text-gray-300 group-hover/id:text-[#9900FF] text-[10px] transition-colors"></i>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user?.packageName ? user?.packageName : "_"} </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user?.packageType || "_"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-users text-gray-400 text-xs"></i>
                        {user?.subscribersCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {user?.packageCategory || "_"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span>
                        {user?.startDate ? moment(parseDate(user?.startDate)).format("D MMM YYYY") : "--"}
                      </span>
                    </td><td className="px-6 py-4 text-sm text-gray-600">
                      <span>
                        {user?.endDate ? moment(parseDate(user?.endDate)).format("D MMM YYYY") : "--"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      ₹  {user?.price ?
                        ` ${user?.price} `
                        : "_"}
                    </td>

                    <td className="px-6 py-4">
                      {(() => {
                        const status = getPackageTimeStatus(user);
                        const badge = getStatusBadge(status);

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
        ${badge.bg} ${badge.text} ${badge.border} border`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4">
                      {user?.type === "publish" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Published
                        </span>
                      )}
                      {user?.type === "draft" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Draft
                        </span>
                      )}
                      {user?.type === "archive" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 cursor-pointer transition-colors ml-auto"
                        onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}>
                        <i className="fa-solid fa-ellipsis-vertical text-gray-400"></i>
                      </div>

                      {openMenuIndex === index && (
                        <div
                          className={`absolute right-8 z-50 w-max bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200
  ${index >= users.length - 2 ? "bottom-0 origin-bottom-right" : "top-0 origin-top-right"}`}
                        >

                          <button onClick={() => navigate(`/package/${user?._id}`)} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-[#9900FF] flex items-center gap-2"  >
                            <i className="fa-regular fa-eye w-4"></i> View
                          </button>

                          <button
                            onClick={() => {
                              setConfirmMessage(`Are you sure you want to ${user.type === "publish" ? "archive" : "publish"} this package?`);
                              setConfirmAction(() => () => handlePublish(user._id, user.type === "publish" ? "archive" : "publish"));
                              setConfirmModalOpen(true);
                              setOpenMenuIndex(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 flex items-center gap-2"
                          >
                            <i className={`fa-solid ${user.type === "publish" ? "fa-box-archive" : "fa-cloud-arrow-up"} w-4`}></i>
                            {user.type === "publish" ? "Archive" : "Publish"}
                          </button>


                          <div className="h-px bg-gray-100 my-1"></div>
                          <button
                            onClick={() => {
                              setConfirmMessage("Are you sure you want to delete this package? This action cannot be undone.");
                              setConfirmAction(() => () => handleDelete(user._id));
                              setConfirmModalOpen(true);
                              setOpenMenuIndex(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <i className="fa-regular fa-trash-can w-4"></i> Delete
                          </button>

                        </div>
                      )}
                    </td>
                  </tr>))
              ) : (
                <tr>
                  <td colSpan="11" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <i className="fa-solid fa-box-open text-4xl mb-3 opacity-50"></i>
                      <p className="text-lg font-medium">No packages found</p>
                      <p className="text-sm">Try adjusting your filters or add a new package.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          {users.length > 0 ? (
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{currentPage * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-gray-900">{Math.min((currentPage + 1) * itemsPerPage, totalItems)}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalItems}</span> results
            </div>
          ) : <div />}
          <Pagination pageCount={totalPages} pageValue={currentPage} setPage={setCurrentPage} />
        </div>
      </div>

      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmMessage}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                  setConfirmModalOpen(false);
                }}
                className="px-4 cursor-pointer py-2 bg-[#9900FF] text-white rounded-xl text-sm font-medium hover:bg-[#7f00d4] transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Package;

