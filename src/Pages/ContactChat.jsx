import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../Firebase";
import { toast } from "react-toastify";
import {
  PaperAirplaneIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/solid";

const ContactChat = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();

  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Format timestamp
  const formatDate = (d) => {
    if (!d) return "";
    const t = d.toDate ? d.toDate() : d;
    const date = new Date(t);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Fetch Contact details
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const ref = doc(db, "contactUs", contactId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          toast.error("Contact not found");
          navigate("/contact-us");
          return;
        }
        setContact({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load contact");
      }
    };
    fetchContact();
  }, [contactId, navigate]);

  // Initialize Chat
  useEffect(() => {
    const initChat = async () => {
      try {
        const q = query(
          collection(db, "chats"),
          where("contactId", "==", contactId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setChatId(snap.docs[0].id);
        } else {
          const newChat = await addDoc(collection(db, "chats"), {
            contactId,
            userId: contact?.uid || null,
            userName: contact?.name || "User",
            userEmail: contact?.email || "",
            lastMessage: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setChatId(newChat.id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize chat");
      } finally {
        setLoading(false);
      }
    };
    if (contact) initChat();
  }, [contact, contactId]);

  // Fetch Messages with Real-time Updates
  useEffect(() => {
    if (!contactId) return;

    const msgRef = collection(db, "contactUs", contactId, "messages");
    const q = query(msgRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      },
      (err) => {
        console.error(err);
        toast.error("Failed to load messages");
      }
    );

    return () => unsubscribe();
  }, [contactId]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Message Logic
  const sendMessage = async () => {
    if (!text.trim()) return;

    setIsSending(true);
    try {
      // 1. Save to Firestore
      await addDoc(
        collection(db, "contactUs", contactId, "messages"),
        {
          sender: "admin",
          text: text.trim(),
          createdAt: serverTimestamp(),
        }
      );

      // Update parent status
      await updateDoc(doc(db, "contactUs", contactId), {
        status: "awaiting_user",
        read: true
      });

      setText("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm z-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-[#0f6845] animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[500px] w-full bg-slate-50 overflow-hidden md:p-6 p-0">
      {/* Main Chat Container */}
      <div className="flex flex-col w-full h-full md:max-w-5xl mx-auto bg-white md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 z-10 sticky top-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-500 hover:text-[#0f6845] transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f6845] to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-200">
                    {contact?.name?.[0]?.toUpperCase() || <UserCircleIcon className="w-6 h-6" />}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    {contact?.name || "User"}
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                      Visitor
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs block">
                    {contact?.email || "No email"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-[#fafafa] custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
              <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mb-6">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No messages yet</h3>
              <p className="text-slate-500 max-w-xs">
                Start the conversation nicely. Your reply will be emailed to the user.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((msg, idx) => {
                const isAdmin = msg.sender === "admin";
                const showAvatar = !isAdmin && (idx === messages.length - 1 || messages[idx + 1]?.sender === "admin");

                return (
                  <div key={msg.id} className={`flex items-end gap-3 ${isAdmin ? "justify-end" : "justify-start"} group`}>
                    {!isAdmin && (
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${showAvatar ? 'bg-gradient-to-br from-gray-400 to-gray-500 opacity-100' : 'opacity-0'}`}>
                        {contact?.name?.[0]?.toUpperCase()}
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]`}>
                      <div
                        className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm relative ${isAdmin
                          ? "bg-[#0f6845] text-white rounded-2xl rounded-tr-sm"
                          : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm"
                          }`}
                      >
                        {msg.text}
                      </div>

                      <div className={`text-[10px] font-medium text-slate-400 ${isAdmin ? "text-right pr-1" : "pl-1"}`}>
                        {msg.createdAt &&
                          new Date(msg.createdAt.toDate()).toLocaleTimeString(
                            "en-IN",
                            { hour: "2-digit", minute: "2-digit", hour12: true }
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-white px-4 md:px-6 py-4 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2 items-end max-w-4xl mx-auto relative"
          >
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-[#0f6845]/20 focus-within:border-[#0f6845] transition-all flex items-center pr-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your reply..."
                className="w-full text-sm px-4 py-3.5 bg-transparent border-none text-slate-700 placeholder:text-slate-400 focus:ring-0 resize-none max-h-32 min-h-[50px] custom-scrollbar"
                disabled={isSending}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isSending && text.trim()) {
                    e.preventDefault();
                    sendMessage();
                  }
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!text.trim() || isSending}
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${!text.trim() || isSending
                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                : "bg-[#0f6845] text-white hover:bg-[#8000d4] shadow-lg shadow-purple-200 hover:scale-105 active:scale-95"
                }`}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5 -ml-0.5" />
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-400 mt-2">
            Press <span className="font-semibold text-slate-600">Enter</span> to send.
            Reply will be sent to <span className="font-medium text-[#0f6845]">{contact?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactChat;