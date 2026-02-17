import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";

const PlatformCharges = () => {
  const [loading, setLoading] = useState(true);
  const [gst, setGst] = useState("");
  const [platformFee, setPlatformFee] = useState("");
  const docId = "platform_charges"; // Fixed document ID for single editable document

  // Fetch the single document
  const fetchCharges = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "platformCharges", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setGst(data.gst || "");
        setPlatformFee(data.platformFee || "");
      } else {
        // If document does not exist, create it with default values
        await setDoc(doc(db, "platformCharges", docId), {
          gst: "",
          platformFee: "",
        });
      }
    } catch (error) {
      console.error("Error fetching platform charges:", error);
      toast.error("Failed to fetch platform charges!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  // Handle Save
  const handleSave = async () => {
    if (!gst || !platformFee) {
      toast.error("Please fill in both fields!");
      return;
    }

    try {
      const docRef = doc(db, "platformCharges", docId);
      await setDoc(docRef, { gst, platformFee });
      toast.success("Platform charges updated successfully!");
    } catch (error) {
      console.error("Error updating platform charges:", error);
      toast.error("Failed to update charges!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ThreeDots height="50" width="50" radius="9" visible={true} color="#9900FF" />
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Platform Charges
        </h2>
        <p className="text-gray-500 text-sm mt-1">Manage global platform fees and tax settings</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          <div className="space-y-6">
            {/* GST */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">GST (%)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter GST percentage"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#9900FF] focus:border-[#9900FF] block p-3 pr-10 transition-colors outline-none hover:bg-white"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 font-medium">
                  %
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Applied to all eligible transactions.</p>
            </div>

            {/* Platform Fee */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Platform Fee</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 font-medium">
                  {/* Add currency symbol if needed, or keeping it distinct */}
                  <i className="fa-solid fa-coins text-xs"></i>
                </div>
                <input
                  type="number"
                  placeholder="Enter platform fee amount"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#9900FF] focus:border-[#9900FF] block p-3 pl-10 transition-colors outline-none hover:bg-white"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Flat fee deducted per transaction.</p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                className="w-full flex cursor-pointer justify-center items-center gap-2 bg-[#9900FF] hover:bg-[#7f00d4] text-white px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
              >
                <i className="fa-regular fa-floppy-disk"></i>
                Save Changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlatformCharges;
