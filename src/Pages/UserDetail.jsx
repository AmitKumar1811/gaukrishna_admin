import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import { toast } from "react-toastify";
// import { doc, getDoc, arrayUnion, updateDoc, Timestamp, query, collection, where, getDocs } from "firebase/firestore";
// import { db } from "../Firebase";
import Pagination from "../components/Pagiantion";
import { Coins, Smartphone, Calendar, Mail, Phone, Ruler, User as UserIcon, Settings, Copy } from "lucide-react";

const UserDetail = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalNote, setInternalNote] = useState("");
  const [purchasePage, setPurchasePage] = useState(0);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const badgeStyles = {
    coach: "bg-blue-100 text-blue-700",
    parent: "bg-purple-100 text-purple-700",
    scout: "bg-orange-100 text-orange-700",
    player: "bg-green-100 text-green-700",
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const dummyUser = {
          id: id || "dummy-123",
          name: "Amit Kumar",
          email: "amit.kumar@example.com",
          phoneNumber: "9876543210",
          countryCode: "91",
          role: "player",
          isBlocked: false,
          isLogout: false,
          profileImage: "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/user-profile-icon.png",
          season: "2024-2025",
          schoolName: "Delhi Public School",
          height: "175 cm",
          weight: "70 kg",
          wingspan: "180 cm",
          position: "Guard",
          jerseyNumber: "23",

          appSettings: {
            hapticFeedback: true,
            liveCommentary: false,
            muteUnmute: true,
            notifications: true,
            tvCommands: true,
            volume: {
              isEnable: true,
              volumeUpLevel: 10,
              volumeDownLevel: 5
            },
            brightness: {
              isEnable: false,
              brightnessUpLevel: 80,
              brightnessDownLevel: 20
            }
          },

          deviceInfo: {
            make: "Apple",
            model: "iPhone 13",
            platform: "iOS",
            screenResolution: "1170 x 2532",
            osBuild: "15C5097d",
            osVersion: "15.2",
            updatedAt: { seconds: Date.now() / 1000 }
          },

          internalNotes: [
            {
              note: "Initial consultation done.",
              author: "Admin",
              createdAt: { seconds: Date.now() / 1000 - 86400 }
            }
          ]
        };

        const dummyPayments = [
          {
            id: "pay_12345",
            transactionId: "TXN_98765AB",
            amount: 499,
            status: "success",
            createdAt: { toDate: () => new Date() },
            createdAtFormatted: new Date().toLocaleString(),
            linkedItem: {
              type: "program",
              data: {
                programName: "Advanced Dribbling Drills",
                appStorePrice: 499
              }
            }
          },
          {
            id: "pay_67890",
            transactionId: "TXN_54321ZY",
            amount: 999,
            status: "success",
            createdAt: { toDate: () => new Date(Date.now() - 86400000 * 5) },
            createdAtFormatted: new Date(Date.now() - 86400000 * 5).toLocaleString(),
            linkedItem: {
              type: "package",
              data: {
                packageName: "Premium Season Pass",
                appStorePrice: 999
              }
            }
          }
        ];

        setUserData({
          ...dummyUser,
          payments: dummyPayments,
        });

      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (userData) {
      console.log("Full User Data State:", userData);
      if (userData.appSettings) {
        console.log("App Settings Data:", userData.appSettings);
      } else {
        console.warn("User Data exists but 'appSettings' property is missing/undefined");
      }
    }
  }, [userData]);


  const handleSendNote = async () => {
    if (!internalNote.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newNote = {
        note: internalNote,
        author: "Admin",
        createdAt: { seconds: Date.now() / 1000 },
      };

      setUserData((prev) => ({
        ...prev,
        internalNotes: [...(prev.internalNotes || []), newNote],
      }));

      setInternalNote("");
      toast.success("Internal note added successfully (Dummy)");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <ThreeDots height="60" width="60" radius="9" visible color="#9900FF" />
          <p className="text-gray-500 font-medium">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">User Not Found</h3>
          <p className="text-gray-500 mt-2">The requested user profile does not exist.</p>
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

  const {
    firstName,
    lastName,
    image,
    code,
    teamName,
    season,
    dob,
    gradeLevel,
    height,
    weight,
    wingspan,
    position,
    jerseyNumber,
    schoolName,
    role,
  } = userData;

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between gap-4">

          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">User Profile</h2>
            <p className="text-gray-500 text-sm mt-0.5">Manage user details, history, and notes</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-10 cursor-pointer h-10 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-gray-900 border border-gray-200 shadow-sm transition-all hover:shadow-md"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative shrink-0">
              <img
                src={
                  userData?.profileImage ||
                  "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/user-profile-icon.png"
                }
                alt="User"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-50 shadow-sm"
              />
              {role && (
                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold border-2 border-white shadow-sm whitespace-nowrap capitalize ${badgeStyles[role.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
                  {role}
                </span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-2 justify-center md:justify-start">
                <h2 className="text-2xl font-bold text-gray-900 leading-none">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1) : "Unknown User"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${userData?.isBlocked ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                    {userData?.isBlocked ? "Blocked" : "Active"}
                  </span>
                  {userData?.isLogout !== undefined && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${userData?.isLogout ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                      {userData?.isLogout ? "Logged Out" : "Logged In"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { navigator.clipboard.writeText(userData?.id); toast.success("ID Copied!") }}>
                  <UserIcon size={16} className="text-gray-400" />
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
                    {userData?.id || "No ID"}
                  </span>
                  <Copy size={12} className="text-gray-300 group-hover:text-purple-500" />
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span>{userData?.email || "No email"}</span>
                </div>
                {userData?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>+{userData.countryCode} {userData.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Stats & Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {season && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center md:text-left">
                    <div className="text-xs text-gray-400 font-medium uppercase mb-0.5">Season</div>
                    <div className="font-bold text-gray-900">{season}</div>
                  </div>
                )}
                {schoolName && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center md:text-left col-span-2">
                    <div className="text-xs text-gray-400 font-medium uppercase mb-0.5">School</div>
                    <div className="font-bold text-gray-900 truncate" title={schoolName}>{schoolName}</div>
                  </div>
                )}
                {height && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center md:text-left">
                    <div className="text-xs text-gray-400 font-medium uppercase mb-0.5">Height</div>
                    <div className="font-bold text-gray-900">{height}</div>
                  </div>
                )}
                {weight && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center md:text-left">
                    <div className="text-xs text-gray-400 font-medium uppercase mb-0.5">Weight</div>
                    <div className="font-bold text-gray-900">{weight}</div>
                  </div>
                )}
                {wingspan && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center md:text-left">
                    <div className="text-xs text-gray-400 font-medium uppercase mb-0.5">Wing</div>
                    <div className="font-bold text-gray-900">{wingspan}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {userData?.appSettings && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">User App Settings</h3>
                <p className="text-xs text-gray-500">User preferences and configurations</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">General</h4>
                {[
                  { label: "Haptic Feedback", value: userData?.appSettings?.hapticFeedback },
                  { label: "Live Commentary", value: userData?.appSettings?.liveCommentary },
                  { label: "Mute/Unmute", value: userData?.appSettings?.muteUnmute },
                  { label: "Notifications", value: userData?.appSettings?.notifications },
                  { label: "TV Commands", value: userData?.appSettings?.tvCommands },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition-colors">
                    <span className="text-gray-700">{item.label}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${item.value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {item.value ? "On" : "Off"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Volume Settings */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Volume Control</h4>
                <div className="bg-gray-50/50 rounded-xl p-4 space-y-4 border border-gray-100 h-full">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${userData?.appSettings?.volume?.isEnable ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {userData?.appSettings?.volume?.isEnable ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                      <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Up Lvl</div>
                      <div className="font-bold text-gray-900 text-xl font-mono">{userData?.appSettings?.volume?.volumeUpLevel ?? '-'}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                      <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Down Lvl</div>
                      <div className="font-bold text-gray-900 text-xl font-mono">{userData?.appSettings?.volume?.volumeDownLevel ?? '-'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brightness Settings */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brightness Control</h4>
                <div className="bg-gray-50/50 rounded-xl p-4 space-y-4 border border-gray-100 h-full">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${userData?.appSettings?.brightness?.isEnable ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {userData?.appSettings?.brightness?.isEnable ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                      <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Up Lvl</div>
                      <div className="font-bold text-gray-900 text-xl font-mono">{userData?.appSettings?.brightness?.brightnessUpLevel ?? '-'}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                      <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Down Lvl</div>
                      <div className="font-bold text-gray-900 text-xl font-mono">{userData?.appSettings?.brightness?.brightnessDownLevel ?? '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Device Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                User Device
              </h3>
              <p className="text-xs text-gray-500">
                Last connected app details
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {userData?.deviceInfo ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="py-3 pl-4 font-semibold">Device Model</th>
                        <th className="py-3 font-semibold">Platform</th>
                        <th className="py-3 font-semibold">Resolution</th>
                        <th className="py-3 font-semibold">Os Build</th>
                        <th className="py-3 font-semibold">Os Version</th>
                        <th className="py-3 pr-4 font-semibold text-right">
                          Last Login
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="py-4 pl-4 font-medium text-gray-900">
                          {userData.deviceInfo.make
                            ? userData.deviceInfo.make.charAt(0).toUpperCase() +
                            userData.deviceInfo.make.slice(1)
                            : "_"}
                          <span className="text-gray-400 ml-1">
                            ({userData.deviceInfo.model})
                          </span>
                        </td>

                        <td className="py-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                            {userData.deviceInfo.platform || "_"}
                          </span>
                        </td>

                        <td className="py-4 text-gray-600">
                          {userData.deviceInfo.screenResolution || "-"}
                        </td>
                        <td className="py-4 text-gray-600">
                          {userData.deviceInfo.osBuild || "-"}
                        </td>
                        <td className="py-4 text-gray-600">
                          {userData.deviceInfo.osVersion || "-"}
                        </td>
                        <td className="py-4 pr-4 text-right text-gray-500">
                          {userData.deviceInfo.updatedAt
                            ? new Date(
                              userData.deviceInfo.updatedAt.seconds * 1000
                            ).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ================= MOBILE CARD ================= */}
                <div className="md:hidden space-y-4">
                  <div className="shadow-lg rounded-xl p-4 space-y-2">
                    <div className="font-semibold text-gray-900 text-sm">
                      {userData.deviceInfo.make} ({userData.deviceInfo.model})
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Platform</span>
                      <span className="font-medium">
                        {userData.deviceInfo.platform || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Resolution</span>
                      <span>{userData.deviceInfo.screenResolution || "-"}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Last Paired</span>
                      <span className="text-gray-600">
                        {userData.deviceInfo.updatedAt
                          ? new Date(
                            userData.deviceInfo.updatedAt.seconds * 1000
                          ).toLocaleDateString("en-IN")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                <Smartphone size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No device pairing history found</p>
              </div>
            )}
          </div>
        </div>

        {/* Advertised TV Services */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-tv text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Advertised TV Services
              </h3>
              <p className="text-xs text-gray-500">
                Discovered TVs and connection history
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="py-3 pl-4 font-semibold min-w-[150px]">Status</th>
                    <th className="py-3 font-semibold">TV Details</th>
                    <th className="py-3 font-semibold">OS Info</th>
                    <th className="py-3 font-semibold">Resolution</th>
                    <th className="py-3 pr-4 font-semibold text-right">Capabilities</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {[
                    {
                      id: 1,
                      status: "success",
                      brand: "Sony",
                      model: "Bravia XR-55A80J",
                      year: "2021",
                      os: "Google TV",
                      version: "10.0",
                      resolution: "3840 x 2160 (4K)",
                      capabilities: ["Power", "Volume", "Input", "Apps"],
                      updatedAt: "2 hours ago"
                    },
                    {
                      id: 2,
                      status: "failed",
                      brand: "Samsung",
                      model: "QLED QN90A",
                      year: "2021",
                      os: "Tizen",
                      version: "6.0",
                      resolution: "3840 x 2160 (4K)",
                      capabilities: ["Power", "Volume"],
                      updatedAt: "1 day ago"
                    },
                    {
                      id: 3,
                      status: "discovered",
                      brand: "LG",
                      model: "OLED C1",
                      year: "2021",
                      os: "webOS",
                      version: "6.0",
                      resolution: "3840 x 2160 (4K)",
                      capabilities: ["Power", "Volume", "Cursor"],
                      updatedAt: "3 days ago"
                    }
                  ].map((tv) => (
                    <tr key={tv.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 pl-4 align-top">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${tv.status === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
                          tv.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                          {tv.status}
                        </span>
                      </td>

                      <td className="py-4 align-top">
                        <div className="font-medium text-gray-900">{tv.brand} {tv.model}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Year: {tv.year}</div>
                      </td>

                      <td className="py-4 text-gray-600 align-top">
                        <div className="font-medium">{tv.os}</div>
                        <div className="text-xs text-gray-400">v{tv.version}</div>
                      </td>

                      <td className="py-4 text-gray-600 align-top">
                        {tv.resolution}
                      </td>

                      <td className="py-4 pr-4 text-right align-top">
                        <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px] ml-auto">
                          {tv.capabilities.map((cap, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium border border-gray-200">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {[
                {
                  id: 1,
                  status: "success",
                  brand: "Sony",
                  model: "Bravia XR-55A80J",
                  year: "2021",
                  os: "Google TV",
                  version: "10.0",
                  resolution: "3840 x 2160 (4K)",
                  capabilities: ["Power", "Volume", "Input", "Apps"]
                },
                {
                  id: 2,
                  status: "failed",
                  brand: "Samsung",
                  model: "QLED QN90A",
                  year: "2021",
                  os: "Tizen",
                  version: "6.0",
                  resolution: "3840 x 2160 (4K)",
                  capabilities: ["Power", "Volume"]
                },
                {
                  id: 3,
                  status: "discovered",
                  brand: "LG",
                  model: "OLED C1",
                  year: "2021",
                  os: "webOS",
                  version: "6.0",
                  resolution: "3840 x 2160 (4K)",
                  capabilities: ["Power", "Volume", "Cursor"]
                }
              ].map((tv) => (
                <div key={tv.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900">{tv.brand} {tv.model}</div>
                      <div className="text-xs text-gray-500">{tv.year} • {tv.os} v{tv.version}</div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${tv.status === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
                      tv.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                      {tv.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50">
                    {tv.capabilities.map((cap, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] font-medium border border-gray-100">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Purchase History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Coins size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Purchase History
              </h3>
              <p className="text-xs text-gray-500">
                Transactions and subscriptions
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {userData?.payments?.length > 0 ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="py-3 pl-4 font-semibold w-1/4">Item</th>
                        <th className="py-3 font-semibold w-1/4">Transaction ID</th>
                        <th className="py-3 font-semibold w-[15%]">Amount</th>
                        <th className="py-3 font-semibold text-center w-[15%]">Status</th>
                        <th className="py-3 pr-4 font-semibold text-right w-[20%]">Date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                      {userData.payments
                        .slice(purchasePage * itemsPerPage, (purchasePage + 1) * itemsPerPage)
                        .map((payment) => (
                          <tr
                            key={payment.id}
                            className="hover:bg-gray-50/50 transition group"
                          >
                            <td className="py-4 pl-4 align-top">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 line-clamp-1" title={payment?.linkedItem?.data?.programName || payment?.linkedItem?.data?.packageName}>
                                  {payment?.linkedItem?.data?.programName ||
                                    payment?.linkedItem?.data?.packageName ||
                                    "Unknown"}
                                </span>
                                <span
                                  className={`text-xs font-medium uppercase mt-0.5 ${payment?.linkedItem?.type === "program"
                                    ? "text-[#9900FF]"
                                    : "text-green-600"
                                    }`}
                                >
                                  {payment?.linkedItem?.type}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 align-top">
                              <div className="flex items-center gap-2 group/id cursor-pointer" onClick={() => { navigator.clipboard.writeText(payment?.transactionId); toast.success("Txn ID Copied") }}>
                                <code className="text-xs font-mono bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100 truncate max-w-[140px]" title={payment?.transactionId}>
                                  {payment?.transactionId || "-"}
                                </code>
                                <Copy size={10} className="text-gray-300 opacity-0 group-hover/id:opacity-100 transition-opacity" />
                              </div>
                            </td>

                            <td className="py-4 font-bold text-gray-900 align-top">
                              ₹{payment?.linkedItem?.data?.appStorePrice || "-"}
                            </td>

                            <td className="py-4 text-center align-top">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border
                        ${payment?.status === "success" || payment?.status === "purchased"
                                    ? "bg-green-50 text-green-700 border-green-100"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-100"
                                  }`}
                              >
                                {payment?.status === "success" ? "Purchased" : payment?.status}
                              </span>
                            </td>

                            <td className="py-4 pr-4 text-right text-gray-500 text-xs align-top">
                              <div>{payment.createdAtFormatted?.split(',')[0]}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{payment.createdAtFormatted?.split(',')[1]}</div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4">
                  {userData.payments
                    .slice(purchasePage * itemsPerPage, (purchasePage + 1) * itemsPerPage)
                    .map((payment) => (
                      <div
                        key={payment.id}
                        className=" bg-white border border-gray-100 shadow-sm rounded-xl p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                              {payment?.linkedItem?.data?.programName ||
                                payment?.linkedItem?.data?.packageName ||
                                "Unknown"}
                            </p>
                            <span
                              className={`text-xs font-bold uppercase ${payment?.linkedItem?.type === "program"
                                ? "text-[#9900FF]"
                                : "text-green-600"
                                }`}
                            >
                              {payment?.linkedItem?.type}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                    ${payment?.status === "success" || payment?.status === "purchased"
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                              }`}
                          >
                            {payment?.status === "success" ? "Purchased" : payment?.status}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Amount</span>
                            <span className="font-bold text-gray-900">₹{payment?.linkedItem?.data?.price || "-"}</span>
                          </div>
                          <div className="flex justify-between text-xs items-center">
                            <span className="text-gray-500">Transaction ID</span>
                            <div className="flex items-center gap-1.5" onClick={() => { navigator.clipboard.writeText(payment?.transactionId) }}>
                              <span className="font-mono text-gray-600 truncate max-w-[120px] bg-gray-50 px-1 rounded">{payment?.transactionId || "-"}</span>
                              <Copy size={10} className="text-gray-400" />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Date</span>
                            <span className="text-gray-600">
                              {payment.createdAtFormatted}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {userData.payments.length > itemsPerPage && (
                  <div className="flex justify-end pt-4 border-t border-gray-50 mt-2">
                    <Pagination
                      pageCount={Math.ceil(userData.payments.length / itemsPerPage)}
                      pageValue={purchasePage}
                      setPage={setPurchasePage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                <Coins size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No purchase history found</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <i className="fa-regular fa-note-sticky text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Internal Notes</h3>
              <p className="text-xs text-gray-500">Private team comments</p>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {/* Notes List */}
            <div className="space-y-4">
              {userData?.internalNotes?.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">No internal notes yet.</p>
              ) : (
                userData?.internalNotes?.map((note, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {note.author ? note.author.charAt(0) : "A"}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-900">{note.author}</span>
                        <span className="text-xs text-gray-400">
                          {note.createdAt?.seconds
                            ? new Date(note.createdAt.seconds * 1000).toLocaleString("en-IN", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })
                            : "Just now"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{note.note}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <textarea
                placeholder="Write an internal note..."
                className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#9900FF] focus:border-transparent transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400"
                rows={3}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSendNote}
                  disabled={!internalNote.trim()}
                  className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                        ${!internalNote.trim() ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#9900FF] text-white hover:bg-[#7f00d4] shadow-sm"}
                      `}
                >
                  <span>Add Note</span>
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetail;