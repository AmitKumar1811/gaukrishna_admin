import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import { toast } from "react-toastify";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../Firebase";
import moment from "moment";

const TransactionNotes = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [internalNote, setInternalNote] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [transactionData, setTransactionData] = useState(null);
  const [linkedItemName, setLinkedItemName] = useState("");
  const [userData, setUserData] = useState(null);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const fetchTransactionDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const docRef = doc(db, "iapPurchases", id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        toast.error("Transaction not found");
        navigate("/transaction");
        return;
      }

      const data = { id: snapshot.id, ...snapshot.data() };
      setTransactionData(data);

      // Fetch linked program/package name
      if (data.productId) {
        // Try Program
        const progQ = query(collection(db, "programs"), where("productId", "==", data.productId));
        const progSnap = await getDocs(progQ);
        if (!progSnap.empty) {
          setLinkedItemName(progSnap.docs[0].data().programName + " (Program)");
        } else {
          // Try Package
          const pkgQ = query(collection(db, "packages"), where("productId", "==", data.productId));
          const pkgSnap = await getDocs(pkgQ);
          if (!pkgSnap.empty) {
            setLinkedItemName(pkgSnap.docs[0].data().packageName + " (Package)");
          } else {
            setLinkedItemName("Unknown Item");
          }
        }
      }

      // Fetch User Details
      if (data.userId) {
        try {
          const userSnap = await getDoc(doc(db, "users", data.userId));
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        } catch (e) {
          console.error("Error fetching user:", e);
        }
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  // Add Internal Note
  const handleSendNote = async () => {
    if (!internalNote.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    try {
      const docRef = doc(db, "iapPurchases", id);
      const newNote = {
        note: internalNote,
        author: "Admin",
        createdAt: Timestamp.now(),
      };

      await updateDoc(docRef, {
        internalNotes: arrayUnion(newNote),
      });

      setTransactionData((prev) => ({
        ...prev,
        internalNotes: [...(prev?.internalNotes || []), newNote],
      }));

      setInternalNote("");
      toast.success("Note added");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add note");
    }
  };

  // Handle Refund
  const handleRefund = async () => {
    if (!refundAmount || Number(refundAmount) <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }
    if (!refundNote.trim()) {
      toast.error("Please add a reason for refund");
      return;
    }

    try {
      setIsProcessingRefund(true);
      const docRef = doc(db, "iapPurchases", id);

      const refundDetails = {
        amount: Number(refundAmount),
        note: refundNote,
        refundedAt: Timestamp.now(),
        refundedBy: "Admin"
      };

      await updateDoc(docRef, {
        status: "refunded",
        refundDetails: refundDetails,
        internalNotes: arrayUnion({
          note: `Refund Processed: ₹${refundAmount}. Reason: ${refundNote}`,
          author: "System",
          createdAt: Timestamp.now()
        })
      });

      setTransactionData(prev => ({
        ...prev,
        status: "refunded",
        refundDetails: refundDetails,
        internalNotes: [...(prev?.internalNotes || []), {
          note: `Refund Processed: ₹${refundAmount}. Reason: ${refundNote}`,
          author: "System",
          createdAt: Timestamp.now()
        }]
      }));

      setRefundAmount("");
      setRefundNote("");
      toast.success("Refund recorded successfully");

    } catch (error) {
      console.error(error);
      toast.error("Failed to process refund");
    } finally {
      setIsProcessingRefund(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8f9fa]">
        <ThreeDots height="50" width="50" radius="9" visible={true} color="#9900FF" />
      </div>
    );
  }

  if (!transactionData) return null;

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Transaction Details</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                    ${transactionData.status === 'success' || transactionData.status === 'purchased' ? 'bg-green-50 text-green-700 border-green-200' :
                  transactionData.status === 'refunded' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {transactionData.status}
              </span>
            </div>

            {/* Transaction ID with Copy */}
            <div className="flex items-center gap-2 mt-2 group cursor-pointer w-fit" onClick={() => copyToClipboard(transactionData.transactionId || transactionData.id)}>
              <span className="text-gray-500 text-sm font-medium">Topic ID:</span>
              <code className="text-sm font-mono text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm group-hover:border-[#9900FF] transition-colors">
                {transactionData.transactionId || transactionData.id}
              </code>
              <i className="fa-regular fa-copy text-gray-400 text-xs group-hover:text-[#9900FF] transition-colors"></i>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-all active:scale-95"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                <i className="fa-regular fa-credit-card text-gray-400"></i>
                Payment Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <InfoItem label="Amount" value={transactionData.price || `₹${transactionData.amount}` || "N/A"} className="text-lg font-semibold text-gray-900" />
                <InfoItem label="Created At" value={transactionData.createdAt ? moment(transactionData.createdAt.seconds * 1000).format("DD MMM YYYY, hh:mm:ss A") : "N/A"} />
                <InfoItem label="Platform" value={transactionData.platform} capitalize />
                <InfoItem label="Product ID" value={transactionData.productId} copyable />
                <InfoItem label="Item Name" value={linkedItemName} />
                <InfoItem label="Type" value={transactionData.type} capitalize />
                <InfoItem label="Notification Type" value={transactionData.notificationType} />
                <div className="col-span-2">
                  <InfoItem label="Purchase Token" value={transactionData.purchaseToken} copyable className="break-all" />
                </div>
              </div>
            </div>

            {/* User Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                <i className="fa-regular fa-user text-gray-400"></i>
                User Information
              </h3>
              {userData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex items-center gap-4 col-span-2 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9900FF]/10 to-blue-50 text-[#9900FF] flex items-center justify-center text-xl font-bold">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{userData.name || "Unknown Name"}</p>
                      <p className="text-sm text-gray-500">{userData.email || "No Email"}</p>
                    </div>
                  </div>

                  <InfoItem label="User ID" value={transactionData.userId} copyable />
                  <InfoItem label="Phone" value={userData.phoneNumber || userData.phone || "N/A"} />
                  <InfoItem label="Status" value={userData.status || "Active"} capitalize />
                  <InfoItem label="Joined At" value={userData.createdAt ? moment(userData.createdAt.seconds * 1000).format("DD MMM YYYY") : "N/A"} />
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-500 italic">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">?</div>
                  <span>User information not available for ID: {transactionData.userId}</span>
                </div>
              )}
            </div>

            {/* Technical Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                <i className="fa-solid fa-code text-gray-400"></i>
                Technical Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <InfoItem label="Package Name" value={transactionData.packageName} />
                <InfoItem label="SKU" value={transactionData.sku} />
                <InfoItem label="Version" value={transactionData.version} />
                <InfoItem label="Event Time Millis" value={transactionData.eventTimeMillis || transactionData.rawNotification?.eventTimeMillis} />
                <InfoItem label="Updated At" value={transactionData.updatedAt ? moment(typeof transactionData.updatedAt === 'object' ? transactionData.updatedAt.seconds * 1000 : transactionData.updatedAt).format("DD MMM YYYY, hh:mm:ss A") : "N/A"} />
              </div>
            </div>

          </div>

          {/* Right Column: Actions & Notes */}
          <div className="space-y-6">

            {/* Refund Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-rotate-left text-orange-500"></i> Refund
              </h3>

              {transactionData.status === 'refunded' ? (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-orange-700 font-bold mb-2">
                    <i className="fa-regular fa-circle-check"></i> Refunded
                  </div>
                  <div className="text-sm text-orange-800 space-y-1">
                    <p><strong>Amount:</strong> ₹{transactionData.refundDetails?.amount}</p>
                    <p><strong>Reason:</strong> {transactionData.refundDetails?.note}</p>
                    <p className="text-xs mt-2 text-orange-600">Processed on {moment(transactionData.refundDetails?.refundedAt?.seconds * 1000).format("DD MMM YYYY")}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Refund Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Reason / Note</label>
                    <textarea
                      value={refundNote}
                      onChange={(e) => setRefundNote(e.target.value)}
                      placeholder="Enter reason for refund..."
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF] outline-none min-h-[80px] resize-none"
                    ></textarea>
                  </div>
                  <button
                    onClick={handleRefund}
                    disabled={isProcessingRefund || !refundAmount}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all
                                    ${isProcessingRefund || !refundAmount
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 active:scale-95"}`}
                  >
                    {isProcessingRefund ? "Processing..." : "Process Refund"}
                  </button>
                </div>
              )}
            </div>

            {/* Internal Notes Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-regular fa-comments text-[#9900FF]"></i> Review Notes
              </h3>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-4">
                {(!transactionData.internalNotes || transactionData.internalNotes.length === 0) ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No notes yet.</div>
                ) : (
                  [...(transactionData.internalNotes)].reverse().map((note, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm">
                      <p className="text-gray-800 mb-2 whitespace-pre-wrap">{note.note}</p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{note.author}</span>
                        <span>{moment(note.createdAt.seconds * 1000).fromNow()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="relative">
                  <textarea
                    placeholder="Add a note..."
                    className="w-full min-h-[80px] bg-white border border-gray-200 text-gray-800 text-sm rounded-xl focus:border-[#9900FF] focus:ring-1 focus:ring-[#9900FF] block p-3 outline-none resize-none"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                  />
                  <button
                    onClick={handleSendNote}
                    disabled={!internalNote.trim()}
                    className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-[#9900FF] text-white rounded-lg hover:bg-[#7f00d4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, copyable, capitalize, className = "" }) => {
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied!`, { autoClose: 1000 });
    }
  }
  return (
    <div className="">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-normal mb-1">{label}</p>
      <div className={`flex items-center gap-2 group ${className}`}>
        <div className={`text-sm font-medium text-gray-900 break-words ${capitalize ? 'capitalize' : ''}`}>
          {value || "N/A"}
        </div>
        {copyable && value && (
          <button onClick={handleCopy} className="text-gray-300 hover:text-[#9900FF] transition-colors opacity-0 group-hover:opacity-100" title="Copy">
            <i className="fa-regular fa-copy text-xs"></i>
          </button>
        )}
      </div>
    </div>
  )
}

export default TransactionNotes;
