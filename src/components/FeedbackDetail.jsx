import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase";

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Parser for DPC Logs string
  const parseDpcLogsString = (logs) => {
    const parsed = {
      title: "TV Remote Logs",
      summary: null,
      logs: [],
    };

    // Summary
    const summaryMatch = logs.match(
      /=== TV Remote Logs ===\s*DISCOVERY Found:\s*(\d+)\s*devices\s*PAIRING Attempts:\s*(\d+)\s*Success:\s*(\w+)\s*CONTROL Commands Sent:\s*(\d+)/
    );

    if (summaryMatch) {
      parsed.summary = {
        devicesFound: Number(summaryMatch[1]),
        pairingAttempts: Number(summaryMatch[2]),
        pairingSuccess: summaryMatch[3].toLowerCase() === "yes",
        controlCommandsSent: Number(summaryMatch[4]),
      };
    }

    // Logs
    const logLines = logs.split("\n").filter((l) => l.startsWith("["));

    parsed.logs = logLines.map((line) => {
      const timeMatch = line.match(/^\[(.*?)\]/);

      return {
        timestamp: timeMatch ? timeMatch[1] : null,
        message: line.replace(/^\[.*?\]\s*/, "").trim(),
        raw: line.trim(),
      };
    });

    return parsed;
  };

  const downloadJSON = (data, filename = `${new Date(user.createdAt.seconds * 1000).toLocaleDateString()}-${new Date(feedback.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}-${user?.name}-dpc-logs.json`) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const docRef = doc(db, "feedback", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Parse DPC logs string if needed
          if (typeof data.dpcLogs === "string") {
            data.dpcLogs = parseDpcLogsString(data.dpcLogs);
          }
          console.log("data", data);
          setFeedback(data);

          if (data.userId) {
            const userRef = doc(db, "users", data.userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              setUser(userSnap.data());
            }
          }
        } else {
          console.log("No such feedback!");
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#9900FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium ml-2">Loading feedback details...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Feedback Not Found</h3>
          <p className="text-gray-500 mt-2">The requested feedback entry does not exist or has been deleted.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="  ">
          <div className="flex items-center justify-between gap-4">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Feedback Detail</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                View user feedback, logs, and technical details
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="w-10 cursor-pointer h-10 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-gray-900 border border-gray-200 shadow-sm transition-all hover:shadow-md"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          </div>

          <div className="flex gap-3">
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">Message Content</span>
              <span className="text-gray-400 text-xs">ID: {id}</span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Subject</h3>
                <h4 className="text-xl font-bold text-gray-900">{feedback.subject || "No Subject"}</h4>
              </div>

              <div className="prose prose-purple max-w-none">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Description</h3>
                <div className="bg-gray-50 rounded-xl p-5 text-gray-700 text-sm leading-relaxed border border-gray-100">
                  {feedback.message}
                </div>
              </div>
            </div>
          </div>

          {/* DPC Logs Section */}
          {feedback.dpcLogs && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-[#9900FF] flex items-center justify-center">
                    <i className="fa-solid fa-terminal text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{feedback.dpcLogs.title || "Technical Logs"}</h3>
                    <p className="text-xs text-gray-500">Diagnostic information from TV Remote</p>
                  </div>
                </div>
                <button
                  onClick={() => downloadJSON(feedback.dpcLogs)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-download"></i> Download JSON
                </button>
              </div>

              <div className="p-6">
                {/* Stats Grid */}
                {feedback.dpcLogs.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <div className="text-blue-400 text-xs font-bold uppercase mb-1">Devices Found</div>
                      <div className="text-2xl font-bold text-blue-700">{feedback.dpcLogs.summary.devicesFound}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                      <div className="text-purple-400 text-xs font-bold uppercase mb-1">Attempts</div>
                      <div className="text-2xl font-bold text-purple-700">{feedback.dpcLogs.summary.pairingAttempts}</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${feedback.dpcLogs.summary.pairingSuccess ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className={`${feedback.dpcLogs.summary.pairingSuccess ? 'text-green-500' : 'text-red-500'} text-xs font-bold uppercase mb-1`}>Success</div>
                      <div className={`text-2xl font-bold ${feedback.dpcLogs.summary.pairingSuccess ? 'text-green-700' : 'text-red-700'}`}>
                        {feedback.dpcLogs.summary.pairingSuccess ? "Yes" : "No"}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <div className="text-orange-400 text-xs font-bold uppercase mb-1">Cmds Sent</div>
                      <div className="text-2xl font-bold text-orange-700">{feedback.dpcLogs.summary.controlCommandsSent}</div>
                    </div>
                  </div>
                )}

                {/* Console Output */}
                <div className="bg-[#1a1b26] rounded-xl overflow-hidden shadow-inner border border-gray-800">
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-[#16161e] border-b border-gray-800">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-xs text-gray-500 font-mono">logs.txt</span>
                  </div>
                  <div className="p-4 max-h-[350px] overflow-y-auto font-mono text-xs text-gray-300 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
                    {feedback.dpcLogs.logs.map((log, idx) => (
                      <div key={idx} className="flex gap-3 hover:bg-[#20212e] py-0.5 -mx-4 px-4">
                        <span className="text-gray-500 w-[140px] shrink-0 select-none">[{log.timestamp}]</span>
                        <span className={log.message.includes("Error") ? "text-red-400" : "text-emerald-400"}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: User & Meta Info */}
        <div className="space-y-6">

          {/* User Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Submitted By</h3>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9900FF] to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  onClick={() => feedback.userId && navigate(`/users/${feedback.userId}`)}
                  className={`font-bold text-gray-900 truncate ${feedback.userId ? 'cursor-pointer hover:text-[#9900FF] transition-colors' : ''}`}
                >
                  {user?.name || "Unknown User"}
                </div>
                <div className="text-sm text-gray-500 truncate">{user?.email || "No email"}</div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">User ID</div>
                <div className="text-xs font-mono bg-gray-50 py-1 px-2 rounded border border-gray-100 text-gray-600 truncate">
                  {feedback.userId || "N/A"}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Submission Details</h3>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${feedback.read
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
                  }`}>
                  {feedback.read ? "Read" : "Unread"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {feedback.createdAt?.seconds
                    ? new Date(feedback.createdAt.seconds * 1000).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time</span>
                <span className="text-sm font-medium text-gray-900">
                  {feedback.createdAt?.seconds
                    ? new Date(feedback.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "--:--"}
                </span>
              </div>
              {feedback.source && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Source</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {feedback.source.replace(/_/g, " ")}
                  </span>
                </div>
              )}

              {(feedback.programName || feedback.programId) && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Program Details</div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                    {feedback.programName && (
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Name</div>
                        <div className="text-sm font-medium text-gray-900 break-words">{feedback.programName}</div>
                      </div>
                    )}
                    {feedback.programId && (
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">ID</div>
                        <div className="text-xs font-mono text-gray-600 break-all">{feedback.programId}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {feedback.streamId && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Stream ID</div>
                  <div className="text-sm font-mono text-gray-600 break-all bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {feedback.streamId}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Policy Agreement</div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${feedback.policyAgreement
                  ? "bg-green-50 border-green-100 text-green-700"
                  : "bg-red-50 border-red-100 text-red-700"
                  }`}>
                  <i className={`fa-solid ${feedback.policyAgreement ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
                  <span className="text-sm font-semibold">
                    {feedback.policyAgreement ? "Agreed to Policy" : "Not Agreed"}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Contact Consent</div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${feedback.contactConsent
                  ? "bg-green-50 border-green-100 text-green-700"
                  : "bg-red-50 border-red-100 text-red-700"
                  }`}>
                  <i className={`fa-solid ${feedback.contactConsent ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
                  <span className="text-sm font-semibold">
                    {feedback.contactConsent ? "Agreed to Contact" : "Not Agreed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FeedbackDetail;