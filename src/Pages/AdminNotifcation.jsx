import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase/index.js";
import {
  Search,
  Bell,
  Mail,
  Send,
  Users,
  CheckCircle2,
  Megaphone,
  Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { message } from "antd";

export default function AdminNotifications() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sendingPush, setSendingPush] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const text = `${u.name || ""} ${u.email || ""} ${u.id || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const toggleUser = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = filteredUsers.map(u => u.id);
    const allSelected = allIds.every(id => selected.includes(id));

    if (allSelected) {
      setSelected(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const sendNotification = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      return toast.error("Please enter a title and message for the push notification.");
    }

    setSendingPush(true);
    try {
      const tokens = users
        .filter(u => selected.includes(u.id))
        .map(u => u.fcmToken)
        .filter(Boolean);

      if (!tokens.length) {
        toast.error("No valid FCM tokens found for selected users.");
        setSendingPush(false);
        return;
      }

      const response = await fetch("https://us-central1-smartremote-eade7.cloudfunctions.net/api/notification"
        , {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: pushTitle,
            message: pushBody,
            deviceTokens: tokens,
          }),
        });

      if (!response.ok) {
        throw new Error("Failed to send push notification via API");
      }

      toast.success("Push notification sent successfully! 🚀");
      setPushTitle("");
      setPushBody("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send push notification.");
    } finally {
      setSendingPush(false);
    }
  };

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      return toast.error("Please enter a subject and body for the email.");
    }

    setSendingEmail(true);
    try {
      const emails = users
        .filter(u => selected.includes(u.id))
        .map(u => u.email)
        .filter(Boolean);

      if (!emails.length) {
        toast.error("No valid emails found for selected users.");
        setSendingEmail(false);
        return;
      }

      console.log({ emailSubject, emailBody, emails });

      const response = await fetch("https://us-central1-smartremote-eade7.cloudfunctions.net/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          emails,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email via API");
      }

      toast.success("Email sent successfully! 📩");
      setEmailSubject("");
      setEmailBody("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selected.includes(u.id));

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans text-slate-800">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-[#9900FF]" />
              Admin Communication
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Manage and send announcements to your user base.
            </p>
          </div>

          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2 text-sm font-medium text-gray-600">
            <Users className="w-4 h-4 text-[#9900FF]" />
            <span>Total Users: <b className="text-gray-900">{users.length}</b></span>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <span>Selected: <b className="text-[#9900FF]">{selected.length}</b></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: User Selection */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">

              {/* List Header */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    Target Audience
                  </h3>

                  {selected.length > 0 && (
                    <button
                      onClick={() => setSelected([])}
                      className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded-md transition"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#9900FF] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9900FF]/20 focus:border-[#9900FF] outline-none transition-all placeholder:text-gray-400"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allFilteredSelected ? "bg-[#9900FF] border-[#9900FF]" : "bg-white border-gray-300"}`}>
                    {allFilteredSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                  />
                  <span className="text-sm font-medium text-gray-700 select-none">
                    Select All ({filteredUsers.length} Users)
                  </span>
                </label>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {loadingUsers ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#9900FF]" />
                    <span className="text-sm">Loading users...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                    <Users className="w-12 h-12 mb-2" />
                    <p>No users found</p>
                  </div>
                ) : (
                  filteredUsers.map(u => {
                    const isSelected = selected.includes(u.id);
                    const initials = (u.name || "U").charAt(0).toUpperCase();

                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleUser(u.id)}
                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected
                          ? "bg-[#F3E8FF] border-[#9900FF]/30 shadow-sm"
                          : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                          }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0 transition-colors ${isSelected ? "bg-[#9900FF] text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}>
                            {initials}
                          </div>
                          <div className="flex flex-col truncate">
                            <span className={`text-sm font-semibold truncate ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                              {u.name || "Unknown User"}
                            </span>
                            <span className="text-xs text-gray-500 truncate">{u.email}</span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-[#9900FF] border-[#9900FF]" : "bg-white border-gray-300 group-hover:border-gray-400"
                          }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Forms */}
          <div className="lg:col-span-7 space-y-6">

            {/* 🔔 Push Notification Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Bell className="w-32 h-32 text-[#9900FF]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#F3E8FF] rounded-lg">
                    <Bell className="w-6 h-6 text-[#9900FF]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Push Notification</h2>
                    <p className="text-sm text-gray-500">Send an instant alert to user devices.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      value={pushTitle}
                      onChange={e => setPushTitle(e.target.value)}
                      placeholder="e.g. New Feature Alert! 🚀"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#9900FF] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={pushBody}
                      onChange={e => setPushBody(e.target.value)}
                      rows={3}
                      placeholder="Type your notification message here..."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#9900FF] focus:border-transparent outline-none transition-all placeholder:text-gray-300 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={sendingPush || selected.length === 0}
                      onClick={sendNotification}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#9900FF] text-white px-8 py-3 rounded-xl hover:bg-[#8000D4] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200 font-medium"
                    >
                      {sendingPush ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Push to {selected.length > 0 ? `${selected.length} Users` : 'Selected'}
                        </>
                      )}
                    </button>
                    {selected.length === 0 && (
                      <p className="text-xs text-red-400 mt-2 ml-1 animate-pulse">* Select users from the list to enable sending.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 📧 Email Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Mail className="w-32 h-32 text-emerald-600" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Mail className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Email Broadcast</h2>
                    <p className="text-sm text-gray-500">Send a detailed email newsletter or update.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="e.g. Weekly Updates"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Content</label>
                    <textarea
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      rows={5}
                      placeholder="Write your email content..."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={sendingEmail || selected.length === 0}
                      onClick={sendEmail}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 font-medium"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Email to {selected.length > 0 ? `${selected.length} Users` : 'Selected'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
