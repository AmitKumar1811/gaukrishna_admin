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
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-brand-600" />
              Admin Communication
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Manage and send announcements to your user base.
            </p>
          </div>

          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-[13px] font-semibold text-slate-600">
            <Users className="w-4 h-4 text-brand-600" />
            <span>Total Users: <b className="text-slate-800">{users.length}</b></span>
            <div className="h-4 w-px bg-slate-200 mx-2"></div>
            <span>Selected: <b className="text-brand-600">{selected.length}</b></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: User Selection */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col h-[600px]">

              {/* List Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-400" />
                    Target Audience
                  </h3>

                  {selected.length > 0 && (
                    <button
                      onClick={() => setSelected([])}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-md transition cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 text-[14px] shadow-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-brand-50/50 rounded-xl cursor-pointer hover:bg-brand-50 transition-colors border border-transparent hover:border-brand-200">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allFilteredSelected ? "bg-brand-600 border-brand-600" : "bg-white border-slate-300"}`}>
                    {allFilteredSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                  />
                  <span className="text-[13px] font-semibold text-slate-700 select-none">
                    Select All ({filteredUsers.length} Users)
                  </span>
                </label>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {loadingUsers ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                    <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Loading users...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                    <Users className="w-12 h-12 mb-2" />
                    <p className="font-medium">No users found</p>
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
                          ? "bg-brand-50 border-brand-200 shadow-sm"
                          : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                          }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm shrink-0 transition-colors ${isSelected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                            }`}>
                            {initials}
                          </div>
                          <div className="flex flex-col truncate">
                            <span className={`text-[13px] font-bold truncate ${isSelected ? "text-slate-800" : "text-slate-700"}`}>
                              {u.name || "Unknown User"}
                            </span>
                            <span className="text-[12px] text-slate-400 truncate">{u.email}</span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-brand-600 border-brand-600" : "bg-white border-slate-300 group-hover:border-slate-400"
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
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 md:p-8 relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Bell className="w-32 h-32 text-brand-600" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-brand-50 rounded-lg border border-brand-200">
                    <Bell className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Push Notification</h2>
                    <p className="text-[13px] text-slate-500 font-medium">Send an instant alert to user devices.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">Title</label>
                    <input
                      value={pushTitle}
                      onChange={e => setPushTitle(e.target.value)}
                      placeholder="e.g. New Feature Alert! 🚀"
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 text-[14px] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">Message</label>
                    <textarea
                      value={pushBody}
                      onChange={e => setPushBody(e.target.value)}
                      rows={3}
                      placeholder="Type your notification message here..."
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 resize-none text-[14px] shadow-sm"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={sendingPush || selected.length === 0}
                      onClick={sendNotification}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-semibold text-[13px] cursor-pointer"
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
                      <p className="text-[11px] text-rose-400 mt-2 ml-1 font-medium">* Select users from the list to enable sending.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 📧 Email Card */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 md:p-8 relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Mail className="w-32 h-32 text-gold-600" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gold-50 rounded-lg border border-gold-200">
                    <Mail className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Email Broadcast</h2>
                    <p className="text-[13px] text-slate-500 font-medium">Send a detailed email newsletter or update.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">Subject</label>
                    <input
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="e.g. Weekly Updates"
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-gold-100 focus:border-gold-500 outline-none transition-all placeholder:text-slate-400 text-[14px] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">Body Content</label>
                    <textarea
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      rows={5}
                      placeholder="Write your email content..."
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-gold-100 focus:border-gold-500 outline-none transition-all placeholder:text-slate-400 resize-none text-[14px] shadow-sm"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={sendingEmail || selected.length === 0}
                      onClick={sendEmail}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-gold-600 text-white px-8 py-3 rounded-lg hover:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-semibold text-[13px] cursor-pointer"
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
