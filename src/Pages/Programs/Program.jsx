import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import Pagination from "../../components/Pagiantion.jsx";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
// import { db } from "../../Firebase/index.js";
// import {
//   query as Q,
//   collection,
//   getDocs,
//   doc,
//   deleteDoc,
//   updateDoc,
//   where,
// } from "firebase/firestore";
import ProgramForm from "../../components/AddPrograms.jsx";
import StreamModal from "../../components/AddStream.jsx";

const Programs = () => {
  const navigate = useNavigate();
  const query = useSelector((state) => state.search.query);
  const [openStreamModal, setOpenStreamModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [programId, setProgramId] = useState(null);
  const [editStream, setEditStream] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // function to execute
  const [confirmMessage, setConfirmMessage] = useState("");
  const [type, setType] = useState("");

  const getUnixTime = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (val.seconds) return val.seconds; // Firestore Timestamp
    return 0;
  };

  const getProgramStatus = (prog) => {
    if (!prog) return "unknown";

    if (prog.statusMode === "manual" && prog.status) {
      return prog.status.toLowerCase();
    }

    const now = Date.now() / 1000;
    const start = getUnixTime(prog.startTime);
    const end = getUnixTime(prog.endTime);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "live";
    return "completed";
  };
  const statusOrder = {
    upcoming: 1,
    live: 2,
    completed: 3,
    cancelled: 4,
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      let dataWithPaymentsCount = [
        {
          _id: "prog_001",
          programId: "PROG-2024-001",
          programName: "Basic Dribbling Mastery",
          programCategory: "Training",
          subscribersCount: 150,
          startTime: Date.now() / 1000 + 86400, // Tomorrow
          endTime: Date.now() / 1000 + 86400 * 30,
          status: "upcoming",
          type: "publish",
          language: "English",
        },
        {
          _id: "prog_002",
          programId: "PROG-2024-002",
          programName: "Live Championship Finals",
          programCategory: "Tournament",
          subscribersCount: 2300,
          startTime: Date.now() / 1000 - 3600, // 1 hour ago
          endTime: Date.now() / 1000 + 7200, // 2 hours from now
          status: "live",
          type: "publish",
          language: "Hindi",
        },
        {
          _id: "prog_003",
          programId: "PROG-2023-099",
          programName: "Archive: 2023 Highlights",
          programCategory: "Highlights",
          subscribersCount: 500,
          startTime: Date.now() / 1000 - 86400 * 100,
          endTime: Date.now() / 1000 - 86400 * 99,
          status: "completed",
          type: "archive",
          language: "English",
        }
      ];

      // Simple local filtering to simulate query behavior
      if (query?.trim()) {
        const lowerQuery = query.toLowerCase();
        dataWithPaymentsCount = dataWithPaymentsCount.filter((p) =>
          p.programName?.toLowerCase().includes(lowerQuery) ||
          p._id?.toLowerCase().includes(lowerQuery),
        );
      }

      if (statusFilter) {
        dataWithPaymentsCount = dataWithPaymentsCount.filter(
          (p) => getProgramStatus(p) === statusFilter
        );
      }

      setTotalItems(dataWithPaymentsCount.length);
      setAllUsers(dataWithPaymentsCount);

      const paginated = dataWithPaymentsCount.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage,
      );
      setUsers(paginated);
      setProgramId(null);
      console.log("Mock Programs loaded");
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to fetch programs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      // Mock categories
      const cats = ["Training", "Tournament", "Highlights", "Interview", "Documentary"];
      setCategories(cats);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };
  useEffect(() => {
    fetchPrograms();
    fetchOptions();
  }, [
    currentPage,
    query,
    statusFilter,
    languageFilter,
    categoryFilter,
    startDateFilter,
    endDateFilter,
    type
  ]);
  useEffect(() => {
    setCurrentPage(0);
  }, [
    query,
    statusFilter,
    languageFilter,
    categoryFilter,
    startDateFilter,
    endDateFilter,
    type
  ]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("td")) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = async (user) => {
    try {
      console.log("Simulating delete for:", user);
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUsers = allUsers.filter(u => u._id !== user._id);
      setAllUsers(updatedUsers);
      setUsers(updatedUsers.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage));
      setTotalItems(updatedUsers.length);

      toast.success("Program deleted successfully (Dummy)");
      setOpenMenuIndex(null);
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  const handlePublish = async (id, status) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Type Changed Successfully (Dummy)");
      fetchPrograms();
      setOpenMenuIndex(false)
    } catch (error) {
      console.error("Error updating type:", error);
    }
  };


  const downloadCSV = () => {
    if (allUsers.length === 0) {
      toast.info("No data to download");
      return;
    }


    const headers = [
      "#",
      "Program Name",
      "Program Type",
      "Start Time",
      "End Time",
      "Status",
    ];

    const rows = allUsers.map((user, index) => [
      index + 1,
      user.programName || "_",
      user.programType || "_",
      user.startTime ? new Date(user.startTime).toLocaleString() : "_",
      user.endTime ? new Date(user.endTime).toLocaleString() : "_",
      user.status
        ? `${user.status.charAt(0).toUpperCase()}${user.status.slice(1)}`
        : "_",
    ]);

    const csvContent = [headers, ...rows]
      .map((e) => e.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `programs_all_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };


  const handleStatusChange = async (programId, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`Status changed to ${newStatus} (Dummy)`);
      fetchPrograms(); // refresh table
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };


  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Programs
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage your video programs and streams</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/add-programs")}
            className="flex items-center gap-2 cursor-pointer bg-[#9900FF] hover:bg-[#7f00d4] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-plus text-xs"></i> Add Programs
          </button>

          <button
            onClick={downloadCSV}
            className="flex items-center cursor-pointer gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-download text-xs"></i> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
        {/* <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
            >
              <option value="">All Status</option>
              <option value="Live">Live</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div> */}

        {/* <div className="flex-1 min-w-[150px]">
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
        </div> */}

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
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">From</label>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:bg-white focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">To</label>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:bg-white focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF]/20 transition-all text-sm"
          />
        </div>

        <button
          onClick={() => {
            setStatusFilter("");
            setLanguageFilter("");
            setCategoryFilter("");
            setStartDateFilter("");
            setEndDateFilter("");
            setType("")
          }}
          className="px-5 py-2.5 bg-gray-100 cursor-pointer text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          Clear Filters
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Program Id
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Program Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th> */}
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Subscribers
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="11">
                    <div className="flex justify-center items-center py-20">
                      <ThreeDots
                        height="50"
                        width="50"
                        radius="9"
                        visible={true}
                        color="#9900FF"
                        ariaLabel="three-dots-loading"
                      />
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {index + 1 + currentPage * itemsPerPage}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group/id cursor-pointer" onClick={() => copyToClipboard(user?.programId)}>
                        <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 truncate max-w-[100px]" title={user?.programId}>
                          {user?.programId || "_"}
                        </code>
                        <i className="fa-regular fa-copy text-gray-300 group-hover/id:text-[#9900FF] text-[10px] transition-colors"></i>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user?.programName || "_"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-1 border border-blue-100">
                        {user?.programCategory || "_"}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      ₹ {user?.price || "_"}
                    </td> */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-users text-gray-400 text-xs"></i>
                        {user?.subscribersCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user?.startTime
                        ? new Date(user.startTime * 1000).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })

                        : "_"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user?.endTime
                        ? new Date(user.endTime * 1000).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })

                        : "_"}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = getProgramStatus(user);
                        return status ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize border
                             ${status.toLowerCase() === 'live' ? 'bg-green-50 text-green-700 border-green-200' :
                              status.toLowerCase() === 'upcoming' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {status}
                          </span>
                        ) : "_";
                      })()}
                    </td>



                    <td className="px-6 py-4">
                      {user?.type === "publish" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Published
                        </span>
                      )}
                      {user?.type === "draft" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                          Draft
                        </span>
                      )}
                      {user?.type === "archive" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          Archived
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right relative">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 cursor-pointer transition-colors ml-auto"
                        onClick={() =>
                          setOpenMenuIndex(openMenuIndex === index ? null : index)
                        }
                      >
                        <i className="fa-solid fa-ellipsis-vertical text-gray-400"></i>
                      </div>

                      {openMenuIndex === index && (
                        <div
                          className={`absolute right-8 z-50 w-max bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200
                        ${index >= users.length - 2 ? "bottom-0 origin-bottom-right" : "top-0 origin-top-right"}`}
                        >
                          <button
                            onClick={() => navigate(`/program/${user?.programId}`)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-[#9900FF] flex items-center gap-2"
                          >
                            <i className="fa-regular fa-eye w-4"></i> View
                          </button>

                          <button
                            onClick={() => {
                              setConfirmMessage(`Are you sure you want to ${user.type === "publish" ? "archive" : "publish"} this program?`);
                              setConfirmAction(() => () => handlePublish(user._id, user.type === "publish" ? "archive" : "publish"));
                              setConfirmModalOpen(true);
                              setOpenMenuIndex(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 flex items-center gap-2"
                          >
                            <i className={`fa-solid ${user.type === "publish" ? "fa-box-archive" : "fa-cloud-arrow-up"} w-4`}></i>
                            {user.type === "publish" ? "Archive" : "Publish"}
                          </button>

                          {/* {user.status.toLowerCase() === "live"?  <button
                            onClick={() => {
                             handleStatusChange(user?._id,"Completed")
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 flex items-center gap-2"
                          >   
                             Mark Completed
                          </button>:""} */}
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button
                            onClick={() => {
                              setConfirmMessage("Are you sure you want to delete this program? This action cannot be undone.");
                              setConfirmAction(() => () => handleDelete(user));
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="py-20 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <i className="fa-solid fa-film text-4xl mb-3 opacity-50"></i>
                      <p className="text-lg font-medium">No programs found</p>
                      <p className="text-sm">Try adjusting your filters or add a new program.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-2xl">
        {users.length > 0 ? (
          <div className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{currentPage * itemsPerPage + 1}</span> to{" "}
            <span className="font-semibold text-gray-900">{Math.min((currentPage + 1) * itemsPerPage, totalItems)}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalItems}</span> results
          </div>
        ) : <div />}
        <Pagination
          pageCount={totalPages}
          pageValue={currentPage}
          setPage={setCurrentPage}
        />
      </div>

      <StreamModal
        open={openStreamModal}
        onClose={() => setOpenStreamModal(false)}
        programId={programId}
        editData={editStream}
      />

      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmMessage}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (confirmAction) confirmAction(); // execute the action
                  setConfirmModalOpen(false);
                }}
                className="px-4 cursor-pointer py-2 bg-[#9900FF] text-white rounded-xl text-sm font-medium hover:bg-[#7f00d4] transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 cursor-pointer py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
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

export default Programs;
