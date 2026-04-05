import { collection, doc, getDoc, getDocs, orderBy, updateDoc, query as qq } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../Firebase";
import { ThreeDots } from "react-loader-spinner";
import Pagination from "../components/Pagiantion";
import { fetchUnreadFeedbackCount } from "../store/feedbackSlice";

const Feedback = () => {
  const navigate = useNavigate()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
  const query = useSelector((state) => state.search.query);
  const [totalItems, setTotalItems] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const savedPage = sessionStorage.getItem("feedback_page");
  const shouldRestore = !pageParam && savedPage;
  const effectivePageParam = pageParam || "1";
  const parsedPage = parseInt(effectivePageParam, 10);
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 0 : parsedPage - 1;
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const dispatch = useDispatch();
  const prevQueryRef = React.useRef(query);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const feedbackRef = collection(db, "feedback");
      const q = qq(feedbackRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      let feedbackData = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }));
      const feedbackWithUsers = await Promise.all(
        feedbackData.map(async (item) => {
          if (!item.userId) return item;

          try {
            const userRef = doc(db, "users", item.userId);
            const userSnap = await getDoc(userRef);

            return {
              ...item,
              user: userSnap.exists() ? userSnap.data() : null,
            };
          } catch (err) {
            console.error("User fetch failed:", err);
            return { ...item, user: null };
          }
        })
      );
      let data = feedbackWithUsers;
      if (query && query.trim() !== "") {
        const lowerQuery = query.toLowerCase();
        data = data.filter(
          (item) =>
            item._id?.toLowerCase().includes(lowerQuery) ||
            item.user?.name?.toLowerCase().includes(lowerQuery) ||
            item.user?.email?.toLowerCase().includes(lowerQuery)
        );
      }
      setTotalItems(data.length);
      const paginated = data.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
      )
      setFeedbacks(paginated);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users. Check Firebase rules!");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (shouldRestore) {
      setSearchParams(prev => {
        prev.set("page", savedPage);
        return prev;
      }, { replace: true });
      return;
    }
    fetchUsers()
  }, [query, currentPage, shouldRestore])

  useEffect(() => {
    if (pageParam) {
      sessionStorage.setItem("feedback_page", pageParam);
    }
  }, [pageParam]);

  useEffect(() => {
    if (prevQueryRef.current !== query) {
      setSearchParams(prev => {
        prev.set("page", "1");
        return prev;
      });
      prevQueryRef.current = query;
    }
  }, [query])


  const statusStyle = {
    new: "bg-blue-100 text-blue-700",
    reviewed: "bg-green-100 text-green-700",
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return "-";
    if (createdAt?.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleString();
    }
    if (createdAt instanceof Date) {
      return createdAt.toLocaleString();
    }
    return new Date(createdAt).toLocaleString();
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };


  const openModal = async (feedback) => {
    try {
      if (!feedback.read) {
        const feedbackRef = doc(db, "feedback", feedback._id);
        await updateDoc(feedbackRef, { read: true });
        dispatch(fetchUnreadFeedbackCount());
      }
      setFeedbacks(prev =>
        prev.map(fb =>
          fb._id === feedback._id ? { ...fb, read: true } : fb
        )
      );

      navigate(`/feedback/${feedback?._id}`)
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to mark message as read.");
    }
  }
  const downloadCSV = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch all feedback
      const feedbackRef = collection(db, "feedback");
      const snapshot = await getDocs(feedbackRef);

      let feedbackData = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }));

      // 2️⃣ Attach user data
      const feedbackWithUsers = await Promise.all(
        feedbackData.map(async (item) => {
          if (!item.userId) return { ...item, user: null };

          try {
            const userSnap = await getDoc(doc(db, "users", item.userId));
            return {
              ...item,
              user: userSnap.exists() ? userSnap.data() : null,
            };
          } catch {
            return { ...item, user: null };
          }
        })
      );

      // 3️⃣ Apply same search filter
      let data = feedbackWithUsers;
      if (query && query.trim()) {
        const q = query.toLowerCase();
        data = data.filter(
          (item) =>
            item.user?.name?.toLowerCase().includes(q) ||
            item.user?.email?.toLowerCase().includes(q)
        );
      }

      if (!data.length) {
        toast.info("No feedback to export");
        return;
      }

      // 4️⃣ Shape CSV rows
      const csvData = data.map((fb) => ({
        Feedback_ID: fb._id,
        User_Name: fb.user?.name || "",
        User_Email: fb.user?.email || "",
        Subject: fb.subject || "",
        Message: fb.message || "",
        Read_Status: fb.read ? "Reviewed" : "New",
        Created_At: fb.createdAt?.seconds
          ? new Date(fb.createdAt.seconds * 1000).toLocaleString()
          : fb.createdAt
            ? new Date(fb.createdAt).toLocaleString()
            : "",
      }));

      const headers = Object.keys(csvData[0]).join(",");
      const rows = csvData.map((row) =>
        Object.values(row)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );

      const csv = [headers, ...rows].join("\n");

      // 5️⃣ Download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `feedback_${Date.now()}.csv`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download CSV");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            User Feedback
          </h2>
          <p className="text-gray-500 text-sm mt-1">View and manage user reports and inquiries</p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-[#0f6845] hover:bg-[#7f00d4] cursor-pointer text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
          </svg>
          Export CSV
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Feedback ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"> </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="flex justify-center items-center py-20">
                      <ThreeDots height="50" width="50" radius="9" visible={true} color="#0f6845" ariaLabel="three-dots-loading" />
                    </div>
                  </td>
                </tr>
              ) : feedbacks.length > 0 ? (
                feedbacks.map((fb, index) => (
                  <tr key={index} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 text-gray-500 text-sm">{index + 1 + currentPage * itemsPerPage}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group/id cursor-pointer" onClick={() => copyToClipboard(fb._id)}>
                        <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 truncate max-w-[100px]" title={fb._id}>
                          {fb._id}
                        </code>
                        <i className="fa-regular fa-copy text-gray-300 group-hover/id:text-[#0f6845] text-[10px] transition-colors"></i>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {fb.user ? (
                        <div className="flex items-center gap-3 cursor-pointer group/user" onClick={() => navigate(`/users/${fb.userId}`)}>
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shadow-sm">
                            {getInitials(fb.user.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 group-hover/user:text-[#0f6845] transition-colors">{fb.user.name}</span>
                            <span className="text-xs text-gray-500">{fb.user.email}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Unknown User</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium max-w-[200px] truncate" title={fb?.subject}>
                      {fb?.subject || "-"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[250px] truncate cursor-default" title={fb?.message}>
                      {fb?.message}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {fb?.createdAt ? new Date(fb.createdAt.seconds ? (fb.createdAt.seconds * 1000) : fb.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        <div className="text-xs text-gray-400 mt-0.5">
                          {fb?.createdAt
                            ? new Date(fb.createdAt.seconds * 1000).toLocaleString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : ""}
                        </div>

                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[250px] truncate cursor-default" >
                      {fb.read === false && (
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(fb)}
                        className="inline-flex cursor-pointer items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-[#0f6845] hover:bg-purple-100 transition-colors"
                      >
                        <i className="fa-regular fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-20 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <i className="fa-regular fa-comments text-4xl mb-3 opacity-50"></i>
                      <p className="text-lg font-medium">No feedback found</p>
                      <p className="text-sm">We're listening! Checks back later.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          {feedbacks.length > 0 ? (
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{currentPage * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-gray-900">{Math.min((currentPage + 1) * itemsPerPage, totalItems)}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalItems}</span> results
            </div>
          ) : <div />}
          <div className="flex gap-2">
            <Pagination
              pageCount={Math.ceil(totalItems / itemsPerPage)}
              pageValue={currentPage}
              setPage={(page) => setSearchParams(prev => {
                prev.set("page", (page + 1).toString());
                return prev;
              })}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Feedback;
