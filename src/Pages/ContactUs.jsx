import { collection, doc, getDocs, updateDoc, orderBy, query as qq } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../Firebase";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchUnreadContactCount } from "../store/contactSlice";
import Pagination from "../components/Pagiantion";
const Contactus = () => {
  const navigate = useNavigate();
  const query = useSelector((state) => state.search.query);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const savedPage = sessionStorage.getItem("contact_page");
  const shouldRestore = !pageParam && savedPage;
  const effectivePageParam = pageParam || "1";
  const parsedPage = parseInt(effectivePageParam, 10);
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 0 : parsedPage - 1;
  const prevQueryRef = React.useRef(query);
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const dispatch = useDispatch();
  const openModal = async (feedback) => {
    try {
      const currentStatus = feedback.status || (feedback.read ? 'read' : 'unread');
      if (currentStatus === 'unread') {
        const feedbackRef = doc(db, "contactUs", feedback._id);
        await updateDoc(feedbackRef, { read: true, status: 'read' });
        dispatch(fetchUnreadContactCount());

        setFeedbacks(prev =>
          prev.map(fb =>
            fb._id === feedback._id ? { ...fb, read: true, status: 'read' } : fb
          )
        );
        setSelectedFeedback({ ...feedback, read: true, status: 'read' });
      } else {
        setSelectedFeedback(feedback);
      }
      setShowModal(true);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to mark message as read.");
    }
  }

  const handleResolve = async (feedback, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to mark this as resolved?")) return;

    try {
      const feedbackRef = doc(db, "contactUs", feedback._id);
      await updateDoc(feedbackRef, { status: 'resolved' });

      setFeedbacks(prev =>
        prev.map(fb =>
          fb._id === feedback._id ? { ...fb, status: 'resolved' } : fb
        )
      );
      toast.success("Ticket resolved successfully");
    } catch (error) {
      console.error("Error resolving ticket:", error);
      toast.error("Failed to resolve ticket");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeedback(null);
  }
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const contactUsRef = collection(db, "contactUs");
      const q = qq(contactUsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      let data = snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));

      // Filter by search query
      if (query && query.trim() !== "") {
        const lowerQuery = query.toLowerCase();
        data = data.filter(
          (user) =>
            user.name?.toLowerCase().includes(lowerQuery) ||
            user.email?.toLowerCase().includes(lowerQuery)
        );
      }

      // Filter by Status
      if (statusFilter !== "all") {
        data = data.filter((item) => {
          const itemStatus = item.status || (item.read ? 'read' : 'unread');
          return itemStatus === statusFilter;
        });
      }

      // Filter by Date
      if (dateFilter) {
        const selectedDate = new Date(dateFilter).setHours(0, 0, 0, 0);
        data = data.filter((item) => {
          if (!item.createdAt) return false;
          const itemDate = item.createdAt.seconds
            ? new Date(item.createdAt.seconds * 1000).setHours(0, 0, 0, 0)
            : new Date(item.createdAt).setHours(0, 0, 0, 0);
          return itemDate === selectedDate;
        });
      }

      setTotalItems(data.length);

      const paginatedData = data.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
      );


      setFeedbacks(paginatedData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users. Check Firebase rules!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prevQueryRef.current !== query) {
      setSearchParams(prev => {
        prev.set("page", "1");
        return prev;
      });
      prevQueryRef.current = query;
    }
  }, [query]);

  useEffect(() => {
    if (shouldRestore) {
      setSearchParams(prev => {
        prev.set("page", savedPage);
        return prev;
      }, { replace: true });
      return;
    }
    fetchFeedbacks();
  }, [query, currentPage, shouldRestore, statusFilter, dateFilter]);

  useEffect(() => {
    if (pageParam) {
      sessionStorage.setItem("contact_page", pageParam);
    }
  }, [pageParam]);


  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("td")) setOpenMenuIndex(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const truncateMessage = (message, wordLimit = 20) => {
    const words = message?.split(" ") || [];
    if (words.length <= wordLimit) return message;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'unread': return <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold uppercase tracking-wider border border-red-100">Unread</span>;
      case 'read': return null;
      case 'awaiting_admin': return <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs font-bold uppercase tracking-wider border border-orange-100">Awaiting Admin</span>;
      case 'awaiting_user': return <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-bold uppercase tracking-wider border border-purple-100">Awaiting User</span>;
      case 'resolved': return <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold uppercase tracking-wider border border-green-100">Resolved</span>;
      default: return null;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const downloadCSV = async () => {
    try {
      const contactUsRef = collection(db, "contactUs");
      const snapshot = await getDocs(contactUsRef);

      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔍 Apply search filter (same as UI)
      if (query && query.trim() !== "") {
        const lowerQuery = query.toLowerCase();
        data = data.filter(
          (item) =>
            item.name?.toLowerCase().includes(lowerQuery) ||
            item.email?.toLowerCase().includes(lowerQuery) ||
            item._id?.toLowerCase().includes(lowerQuery)
        );
      }

      if (data.length === 0) {
        toast.info("No data to download");
        return;
      }

      // 🧾 CSV headers
      const headers = [
        "ID",
        "Name",
        "Email",
        "Subject",
        "Message",
        "Status",
        "Created At",
      ];

      // 🧾 CSV rows
      const rows = data.map((item) => [
        item.id,
        `"${item.name || ""}"`,
        `"${item.email || ""}"`,
        `"${item.subject || ""}"`,
        `"${item.message?.replace(/"/g, '""') || ""}"`,
        item.status || (item.read ? "Read" : "Unread"),
        item.createdAt?.seconds
          ? new Date(item.createdAt.seconds * 1000).toLocaleString("en-IN")
          : "",
      ]);

      const csvContent =
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      // ⬇️ Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `contact_us_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();

      URL.revokeObjectURL(url);
      toast.success("CSV downloaded successfully");
    } catch (error) {
      console.error("CSV download failed:", error);
      toast.error("Failed to download CSV");
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Contact Us
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage user inquiries and support messages</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#9900FF] focus:border-transparent shadow-sm cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="awaiting_admin">Awaiting Admin</option>
                <option value="awaiting_user">Awaiting User</option>
                <option value="resolved">Resolved</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(0); }}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#9900FF] focus:border-transparent shadow-sm cursor-pointer"
                placeholder="Filter by Date"
              />
              {dateFilter && (
                <button
                  onClick={() => { setDateFilter(""); setCurrentPage(0); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 bg-white p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

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

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th> */}

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8">
                    <div className="flex justify-center items-center py-20">
                      {/* <ThreeDots height="50" width="50" radius="9" visible={true} color="#9900FF" ariaLabel="three-dots-loading" /> */}
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="py-20 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <i className="fa-regular fa-envelope-open text-4xl mb-3 opacity-50"></i>
                      <p className="text-lg font-medium">No messages found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                feedbacks.map((fb, index) => (
                  <tr key={fb._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 text-gray-500 text-sm">{currentPage * itemsPerPage + index + 1}</td>

                    {/* ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group/id cursor-pointer" onClick={() => copyToClipboard(fb._id)}>
                        <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 truncate max-w-[100px]" title={fb._id}>
                          {fb._id}
                        </code>
                        <i className="fa-regular fa-copy text-gray-300 group-hover/id:text-[#9900FF] text-[10px] transition-colors"></i>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 cursor-pointer group/user" onClick={() => navigate(`/users/${fb.uid}`)}>
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shadow-sm">
                          {getInitials(fb.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 group-hover/user:text-[#9900FF] transition-colors">{fb.name}</span>
                          <span className="text-xs text-gray-500">{fb.email}</span>
                        </div>
                      </div>
                    </td>


                    {/* Subject */}
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium max-w-[200px] truncate capitalize" title={fb?.subject?.replace(/_/g, " ")}>
                      {fb?.subject?.replace(/_/g, " ") || "-"}
                    </td>


                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[250px] truncate cursor-default" title={fb.message}>
                      {truncateMessage(fb.message, 10)}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {fb?.createdAt
                          ? new Date(fb.createdAt.seconds * 1000).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                          : "_"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {fb?.createdAt
                          ? new Date(fb.createdAt.seconds * 1000).toLocaleString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[250px] truncate cursor-default">
                      {getStatusBadge(fb.status || (fb.read ? 'read' : 'unread'))}
                    </td>

                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuIndex(openMenuIndex === index ? null : index);
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <i className="fa-solid fa-ellipsis"></i>
                      </button>

                      {openMenuIndex === index && (
                        <div className={`absolute right-10 z-50 w-40 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200 ${(feedbacks.length > 2 && index >= feedbacks.length - 1)
                          ? "bottom-full mb-1 origin-bottom-right"
                          : "top-full mt-1 origin-top-right"
                          }`}>
                          <button
                            onClick={() => {
                              openModal(fb);
                              setOpenMenuIndex(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-[#9900FF] flex items-center gap-2"
                          >
                            <i className="fa-regular fa-eye text-xs"></i> View
                          </button>

                          <button
                            onClick={() => {
                              navigate(`/contact-chat/${fb._id}`);
                              setOpenMenuIndex(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2"
                          >
                            <i className="fa-regular fa-comments text-xs"></i> Chat
                          </button>

                          {fb.status !== 'resolved' && (
                            <>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={(e) => {
                                  handleResolve(fb, e);
                                  setOpenMenuIndex(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <i className="fa-solid fa-check text-xs"></i>Resolved
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            {feedbacks.length > 0 ? (
              <div className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{currentPage * itemsPerPage + 1}</span> to{" "}
                <span className="font-semibold text-gray-900">{Math.min((currentPage + 1) * itemsPerPage, totalItems)}</span> of{" "}
                <span className="font-semibold text-gray-900">{totalItems}</span> results
              </div>
            ) : <div />}
            <Pagination
              pageCount={totalPages}
              pageValue={currentPage}
              setPage={(page) => setSearchParams(prev => {
                prev.set("page", (page + 1).toString());
                return prev;
              })}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] transition-all" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Message Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">From <span className="font-medium text-[#9900FF]">{selectedFeedback.name}</span></p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Subject</label>
                <p className="text-sm font-medium text-gray-900 capitalize">{selectedFeedback.subject?.replace(/_/g, " ")}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Message</label>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedFeedback.message}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-[#9900FF] cursor-pointer text-white text-sm font-medium hover:bg-[#8000d4] shadow-md shadow-purple-200 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contactus;
