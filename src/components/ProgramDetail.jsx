import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../Firebase";
import StreamModal from "./AddStream";

import Pagination from "./Pagiantion";
import { toast } from "react-toastify";
import { deleteDoc } from "firebase/firestore";


const ProgramDetail = () => {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();
  const [openStreamModal, setOpenStreamModal] = useState(false);
  const [editStream, setEditStream] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'completed' or 'cancelled'
  const [streamToDelete, setStreamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);

  const getUnixTime = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (val.seconds) return val.seconds;
    return 0;
  };

  const getProgramStatus = (prog) => {
    if (!prog) return "unknown";

    if (prog.statusMode === "manual") {
      return prog.status;
    }

    const now = Date.now() / 1000;
    const start = getUnixTime(prog.startTime);
    const end = getUnixTime(prog.endTime);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "live";
    return "completed";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "--";
    return new Date(timestamp * 1000).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Function to truncate text to 7 lines
  const truncateToLines = (text, lines = 7) => {
    if (!text) return { text: "", isTruncated: false };

    const textLines = text.split('\n');
    if (textLines.length > lines) {
      return {
        text: textLines.slice(0, lines).join('\n'),
        isTruncated: true,
        fullText: text
      };
    }

    // If no line breaks, estimate based on character length (rough approximation)
    const charPerLine = 80; // Adjust based on your layout
    const maxChars = lines * charPerLine;

    if (text.length > maxChars) {
      const truncated = text.substring(0, maxChars);
      return {
        text: truncated.substring(0, truncated.lastIndexOf(' ')),
        isTruncated: true,
        fullText: text
      };
    }

    return { text, isTruncated: false };
  };

  const fetchProgram = async () => {
    try {
      setLoading(true)
      const programSnap = await getDoc(doc(db, "programs", id));
      if (!programSnap.exists()) return;
      const programData = {
        _id: programSnap.id,
        ...programSnap.data(),
      };
      const couponIds = programData.coupons || [];
      let couponData = [];
      if (couponIds.length > 0) {
        const couponQuery = query(
          collection(db, "coupons"),
          where("couponId", "in", couponIds)
        );

        const couponSnap = await getDocs(couponQuery);

        couponData = couponSnap.docs.map(doc => ({
          _id: doc.id,
          ...doc.data(),
        }));
      }
      setProgram({
        ...programData,
        couponsData: couponData,
      });
    } catch (error) {
      console.error(error)
    }
    finally {
      setLoading(false)
    }
  };

  const fetchStreams = async () => {
    const streamsRef = collection(db, "programs", id, "streams");
    const snap = await getDocs(streamsRef);
    const data = snap.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
    }))
    setTotalItems(data.length);
    const paginatedUsers = data.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
    console.log("data", paginatedUsers)
    setStreams(
      paginatedUsers
    );
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProgram()]);
      setLoading(false);
    };
    load();
  }, [id]);


  useEffect(() => {
    fetchStreams()
  }, [currentPage])


  const handleStreamModalClose = async () => {
    setOpenStreamModal(false);
    setEditStream(null);


    await fetchStreams();
  };

  const handleDeleteStream = async () => {
    if (!streamToDelete) return;

    try {
      setDeleting(true);

      await deleteDoc(
        doc(db, "programs", id, "streams", streamToDelete._id)
      );

      toast.success("Stream deleted successfully");

      setShowDeleteModal(false);
      setStreamToDelete(null);

      await fetchStreams(); // refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete stream");
    } finally {
      setDeleting(false);
    }
  };


  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const BadgeList = ({ label, items }) => (
    <div className="col-span-2 md:col-span-4">
      <p className="text-gray-500 mb-1">{label}</p>

      {Array.isArray(items) && items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full bg-brand-600/10 text-brand-600 font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">—</p>
      )}
    </div>
  );

  const handleStatusChange = async (programId, newStatus) => {
    try {
      const programRef = doc(db, "programs", programId);

      await updateDoc(programRef, {
        status: newStatus,
        statusMode: "manual", // Force manual mode when manually changing status
      });

      toast.success(`Status changed to ${newStatus}`);
      fetchProgram(); // refresh table
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
        <span className="text-sm text-slate-400 font-medium">Loading program...</span>
      </div>
  }

  if (!program) return null;

  const descriptionData = truncateToLines(program.description, 7);

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <button onClick={() => navigate('/programs')} className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-gray-900 border border-gray-200 shadow-sm transition-colors">
              <i className="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {program.programName}
            </h1>
            <h1 className=" text-gray-400 tracking-tight">
              Program Id :{id}
            </h1>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/edit-program/${id}`)}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl bg-purple-50 text-brand-600 font-medium border border-brand-600/20 hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <i className="fa-regular fa-pen-to-square"></i> Edit Program
            </button>



            {getProgramStatus(program)?.toLowerCase() === "live" && (
              <>
                <button
                  onClick={() => {
                    setActionType("completed");
                    setShowCompleteModal(true);
                  }}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl bg-purple-50 text-brand-600 font-medium border border-brand-600/20 hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <i className="fa-regular fa-circle-check"></i> Mark As Completed
                </button>
                <button
                  onClick={() => {
                    setActionType("cancelled");
                    setShowCompleteModal(true);
                  }}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium border border-red-200 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <i className="fa-regular fa-circle-xmark"></i> Mark As Cancelled
                </button>
              </>
            )}


            {getProgramStatus(program)?.toLowerCase() === "upcoming" && (
              <button
                onClick={() => {
                  setActionType("cancelled");
                  setShowCompleteModal(true);
                }}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl bg-purple-50 text-brand-600 font-medium border border-brand-600/20 hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <i className="fa-regular fa-circle-check"></i> Mark As Cancelled
              </button>
            )}
          </div>

        </div>
      </div>


      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex-shrink-0">
              {program.image ? (
                <img
                  src={program.image}
                  alt="program"
                  className="w-full h-auto rounded-xl shadow-md object-cover border border-gray-100 aspect-video"
                />
              ) : (
                <div className="w-full aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <i className="fa-regular fa-image text-3xl mb-2"></i>
                    <p className="text-sm">No Image</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <div className={`${expandedDescription ? '' : 'line-clamp-none'}`}>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                    {expandedDescription ? (descriptionData.fullText || program.description) : (descriptionData.text || program.description || <span className="text-gray-400 italic">No description provided.</span>)}
                  </p>
                </div>
                {descriptionData.isTruncated && (
                  <button
                    onClick={() => setExpandedDescription(!expandedDescription)}
                    className="mt-3 text-brand-600 hover:text-[#7f00d4] font-medium text-sm transition-colors flex items-center gap-1"
                  >
                    {expandedDescription ? (
                      <>
                        <span>Read less</span>
                        <i className="fa-solid fa-chevron-up text-xs"></i>
                      </>
                    ) : (
                      <>
                        <span>Read more</span>
                        <i className="fa-solid fa-chevron-down text-xs"></i>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                {/* <Info label="Price" value={program.price ? `₹${program.price}` : "Free"} icon="fa-solid fa-tag" /> */}
                <Info label="Category" value={program.programCategory} icon="fa-solid fa-layer-group" />
                <Info label="Program Type" value={program.programType} icon="fa-solid fa-video" />
                <Info
                  label="Start Time"
                  value={formatTime(program.startTime)}
                  icon="fa-solid fa-clock"
                />

                <Info
                  label="End Time"
                  value={formatTime(program.endTime)}
                  icon="fa-solid fa-clock"
                />
                <Info
                  label="Status"
                  value={(() => {
                    const status = getProgramStatus(program);
                    return (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize border
                                  ${status?.toLowerCase() === 'live' ? 'bg-green-50 text-green-700 border-green-200' :
                          status?.toLowerCase() === 'upcoming' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {status}
                      </span>
                    );
                  })()}
                  icon="fa-regular fa-circle-check"
                />

                <Info
                  label="Price"
                  value={`₹${program.appStorePrice}`}
                  icon="fa-solid fa-tag"
                />

                <Info
                  label="Apple Store ID"
                  value={program.appleProductId}
                  icon="fa-brands fa-apple"
                />

                <Info
                  label="Play Store ID"
                  value={program.googleProductId}
                  icon="fa-brands fa-google-play"
                />


                {/* <Info
                  label="Commentary"
                  value={program.isCommentaryEnabled ? "Enabled" : "Disabled"}
                  icon="fa-regular fa-comments"
                /> */}
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <BadgeList label="Languages" items={program.language} />
                <BadgeList label="Tags" items={program.tags} />
                <BadgeList
                  label="Coupons"
                  items={program?.couponsData?.map(coupon => coupon.code)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white max-w-7xl mx-auto rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-6">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-xl font-bold text-gray-900">
            Streams <span className="text-gray-400 text-sm font-normal ml-2">({streams.length})</span>
          </h2>

          <button
            onClick={() => {
              setEditStream(null);
              setOpenStreamModal(true);
            }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-[#7f00d4]  cursor-pointer text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-plus text-xs"></i> Add Stream
          </button>
        </div>

        {streams.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
            <i className="fa-solid fa-film text-3xl mb-2 opacity-50"></i>
            <p>No streams added yet.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">

                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="text-gray-600 font-semibold">
                      <th className="px-5 py-3 text-left">#</th>
                      <th className="px-5 py-3 text-left">Preview</th>
                      <th className="px-5 py-3 text-left">Stream Name</th>
                      <th className="px-5 py-3 text-left">Stream ID</th>

                      <th className="px-5 py-3 text-left">Created</th>
                      <th className="px-5 py-3 text-left">Tags</th>

                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {streams.map((stream, index) => (
                      <tr
                        key={stream._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4 text-gray-500">
                          {currentPage * itemsPerPage + index + 1}
                        </td>

                        <td className="px-5 py-4">
                          {stream.image ? (
                            <img
                              src={stream.image}
                              alt={stream.streamName}
                              className="w-14 h-10 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-14 h-10 flex items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 border">
                              N/A
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-900">
                          {stream.streamName || "Untitled Stream"}
                        </td>

                        <td className="px-5 py-4">
                          {stream.streamId ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-mono rounded-md bg-gray-100 border border-gray-200 text-gray-600">
                              {stream.streamId}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>




                        <td className="px-5 py-4 text-gray-500">
                          {stream.createdAt ? (
                            <>
                              <div>
                                {stream.createdAt.toDate().toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                              <div className="text-xs text-gray-400">
                                {stream.createdAt.toDate().toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "numeric",
                                  second: "numeric",
                                  hour12: true,
                                })}
                              </div>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>



                        <td className="px-5 py-4">
                          <BadgeList items={stream.tags} />
                        </td>





                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setStreamToDelete(stream);
                                setShowDeleteModal(true);
                              }}
                              className="inline-flex items-center cursor-pointer gap-1 px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                            >
                              <i className="fa-solid fa-trash"></i>
                              Delete
                            </button>

                            <button
                              onClick={() => navigate(`/program/${id}/stream/${stream._id}`)}
                              className="inline-flex items-center cursor-pointer gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
                            >
                              <i className="fa-regular fa-eye"></i>
                              View
                            </button>

                            <button
                              onClick={() => {
                                setEditStream(stream);
                                setOpenStreamModal(true);
                              }}
                              className="inline-flex items-center cursor-pointer gap-1 px-3 py-1.5 text-sm rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition"
                            >
                              <i className="fa-solid fa-pen"></i>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4  flex justify-center bg-gray-50">
                <Pagination
                  pageCount={totalPages}
                  pageValue={currentPage}
                  setPage={setCurrentPage}
                />
              </div>
            </div>
          </div>

        )}
      </div>

      <StreamModal
        open={openStreamModal}
        onClose={handleStreamModalClose}
        programId={id}
        editData={editStream}
      />

      {showCompleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowCompleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${actionType === "cancelled" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                }`}>
                <i className={`fa-regular ${actionType === "cancelled" ? "fa-circle-xmark" : "fa-circle-check"}`}></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                Mark Program as {actionType}
              </h3>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-600 mb-6">
              This action will mark the program as <strong>{actionType}</strong>.
              Users will no longer see it as {getProgramStatus(program)?.toLowerCase()}.
              Are you sure you want to continue?
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 cursor-pointer rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleStatusChange(id, actionType === "cancelled" ? "Cancelled" : "Completed");
                  setShowCompleteModal(false);
                }}
                className={`px-5 py-2 cursor-pointer rounded-xl text-sm font-medium text-white transition shadow-sm active:scale-95 ${actionType === "cancelled" ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-[#7f00d4]"
                  }`}
              >
                Yes, Mark {actionType}
              </button>
            </div>
          </div>
        </div>
      )}


      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <i className="fa-solid fa-trash"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete Stream?
              </h3>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{streamToDelete?.streamName}</strong>?
              <br />
              <span className="text-red-500 font-medium">
                This action cannot be undone.
              </span>
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 cursor-pointer rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteStream}
                disabled={deleting}
                className="px-5 py-2 cursor-pointer rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition shadow-sm active:scale-95 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

const Info = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    {icon && (
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 mt-0.5">
        <i className={`${icon} text-xs`}></i>
      </div>
    )}
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value || "-"}</div>
    </div>
  </div>
);

export default ProgramDetail;