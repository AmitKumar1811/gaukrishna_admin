import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import Pagination from "../../components/Pagiantion";
 
const StreamDetailsPage = () => {
    const { programId, streamId } = useParams();
    const navigate = useNavigate();
    const [stream, setStream] = useState(null);
    const [allCommands, setAllCommands] = useState([]);
    const [allScorecards, setAllScorecards] = useState([]);
 
    // Displayed data (paginated)
    const [commands, setCommands] = useState([]);
    const [scorecards, setScorecards] = useState([]);
 
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("commands");
    const [selectedItem, setSelectedItem] = useState(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
 
    // Pagination
    const [itemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(0);
 
 
    useEffect(() => {
        fetchData();
    }, [programId, streamId]);
 
    const toMillis = (ts) => {
        if (ts === null || ts === undefined) return null;
        if (typeof ts === "number") return ts;
        if (typeof ts === "string" && !isNaN(Number(ts))) return Number(ts);
        if (typeof ts === "string") {
            const parsed = Date.parse(ts);
            if (!isNaN(parsed)) return parsed;
        }
        if (typeof ts === "object") {
            if (typeof ts.toMillis === "function") {
                try {
                    return ts.toMillis();
                } catch (e) { }
            }
            if (typeof ts.toDate === "function") {
                try {
                    return ts.toDate().getTime();
                } catch (e) { }
            }
            if (ts.seconds !== undefined) {
                const secs = Number(ts.seconds) || 0;
                const nanos = Number(ts.nanoseconds || 0);
                return secs * 1000 + Math.floor(nanos / 1e6);
            }
            if (ts._seconds !== undefined) {
                const secs = Number(ts._seconds) || 0;
                const nanos = Number(ts._nanoseconds || 0);
                return secs * 1000 + Math.floor(nanos / 1e6);
            }
        }
        return null;
    };
 
    const formatDateTime = (ts) => {
        const ms = toMillis(ts);
        if (!ms) return "-";
        return new Date(ms).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };
 
    const formatTimestamp = (ts) => {
        const ms = toMillis(ts);
        if (ms) return new Date(ms).toLocaleString();
        if (typeof ts === "string") return ts;
        return ms;
    };
 
    // Fetch ALL data once
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Stream Info
            const streamDoc = await getDoc(doc(db, "programs", programId, "streams", streamId));
            if (streamDoc.exists()) {
                setStream({ id: streamDoc.id, ...streamDoc.data() });
            }
 
            // 2. Fetch All Commands
            const commandsRef = collection(db, "programs", programId, "streams", streamId, "commands");
            // Fetch ALL documents (even those without timestamp)
            const commandsSnap = await getDocs(commandsRef);
            const cmdData = commandsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
 
            // Client-side Sort (Descending)
            cmdData.sort((a, b) => {
                const tA = toMillis(a.timestamp) || 0;
                const tB = toMillis(b.timestamp) || 0;
                return tB - tA;
            });
 
            setAllCommands(cmdData);
 
            // 3. Fetch All Scorecards
            const itemRef = collection(db, "programs", programId, "streams", streamId, "commentaryScoreCard");
            const itemQuery = query(itemRef, orderBy("csServerTimestamp", "desc"));
            const itemSnap = await getDocs(itemQuery);
            const scoreData = itemSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllScorecards(scoreData);
 
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };
 
    // Handle Pagination & Tab Switching Logic
    useEffect(() => {
        if (activeTab === "commands") {
            const start = currentPage * itemsPerPage;
            const end = start + itemsPerPage;
            setCommands(allCommands.slice(start, end));
        } else {
            const start = currentPage * itemsPerPage;
            const end = start + itemsPerPage;
            setScorecards(allScorecards.slice(start, end));
        }
    }, [activeTab, currentPage, allCommands, allScorecards, itemsPerPage]);
 
    // Reset page to 0 when switching tabs
    useEffect(() => {
        setCurrentPage(0);
    }, [activeTab]);
 
    // Calculate total pages based on ACTIVE tab
    const currentTotalItems = activeTab === "commands" ? allCommands.length : allScorecards.length;
    const totalPages = Math.ceil(currentTotalItems / itemsPerPage);
    if (loading) return <div className="p-10 text-center">Loading...</div>;

    const openDetails = (item, type) => {
    setSelectedItem(item);
    setOpenDetailModal(true);
   };
 
 
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="bg-white p-2 rounded-full shadow hover:bg-gray-50">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#9900FF]">{stream?.streamName || "Stream Details"}</h1>
                </div>
            </div>
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("commands")}
                    className={`pb-2 px-4 cursor-pointer font-medium ${activeTab === "commands" ? "border-b-2 border-[#9900FF] text-[#9900FF]" : "text-gray-500"}`}
                >
                    Commands ({allCommands.length})
                </button>
                <button
                    onClick={() => setActiveTab("scorecards")}
                    className={`pb-2 px-4 cursor-pointer font-medium ${activeTab === "scorecards" ? "border-b-2 border-[#9900FF] text-[#9900FF]" : "text-gray-500"}`}
                >
                    Scorecards ({allScorecards.length})
                </button>
            </div>
            <div className="bg-white rounded-xl shadow overflow-hidden">
                {activeTab === "commands" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Unique ID</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Stream ID</th>
                                    {/* <th className="p-4">TVC Timestamp</th> */}
                                    <th className="p-4">Server Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commands.map((cmd) => (
                                    <tr
                                        key={cmd.id}
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="p-4 font-mono text-[10px] text-gray-400">{cmd.id}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${cmd.action ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {cmd.action !== undefined ? String(cmd.action) : "-"}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-xs">{cmd.stream || "-"}</td>
                                        {/* <td className="p-4 font-medium">{formatDateTime(cmd.tvcTimestamp)}</td> */}
                                        <td className="p-4 text-xs">
                                            <div className="flex flex-col">
                                                <span>{formatDateTime(cmd.serverTimestamp)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {commands.length === 0 && (
                                    <tr><td colSpan="6" className="p-4 text-center">No commands found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
 
                {activeTab === "scorecards" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Unique ID</th>
                                    <th className="p-4">Match Info</th>
                                    <th className="p-4">Teams</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scorecards.map((sc) => (
                                    <tr
                                        key={sc.id}
                                        onClick={() => openDetails(sc, 'scorecard')}
                                        className="border-b hover:bg-gray-50 border-gray-200 cursor-pointer transition-colors"
                                    >
                                        <td className="p-4 font-mono text-xs text-gray-400">{sc.id}</td>
                                        <td className="p-4">
                                            <div className="text-xs text-gray-500 mt-1">{sc.matchDetails?.matchDescription}</div>
                                            <div className="text-[10px] text-gray-400 mt-1">CS Server Time: {formatTimestamp(sc.csServerTimestamp)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{sc.team1?.shortName || sc.matchDetails?.team1?.shortName || "T1"}</span>
                                                <span className="text-gray-400 text-xs">vs</span>
                                                <span className="font-semibold">{sc.team2?.shortName || sc.matchDetails?.team2?.shortName || "T2"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${sc.matchDetails?.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {sc.matchDetails?.status || "No Status"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[#9900FF] font-medium text-sm hover:underline">View Details</span>
                                        </td>
                                    </tr>
                                ))}
                                {scorecards.length === 0 && (
                                    <tr><td colSpan="6" className="p-4 text-center text-gray-500 py-10">No scorecards found.</td></tr>
                                )}
                            </tbody>
                        </table>
 
                    </div>
                )}
            </div>
            {openDetailModal && selectedItem && (
                <DetailModal
                    open={openDetailModal}
                    onClose={() => setOpenDetailModal(false)}
                    data={selectedItem}
                    formatTimestamp={formatTimestamp}
                    toMillis={toMillis}
                />
            )}
            <Pagination pageCount={totalPages} pageValue={currentPage} setPage={setCurrentPage} />
        </div>
    );
};
 
 
const DetailModal = ({ open, onClose, data, formatTimestamp, toMillis }) => {
    if (!open) return null;
    const { matchDetails, commentary, scoreCard, csServerTimestamp } = data;
 
    const validScorecards = scoreCard?.filter(inning =>
        inning &&
        (inning.batTeamName || inning.score !== undefined)
    ) || [];


 
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto ring-1 ring-gray-900/5">
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Match Details</h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wide">
                            {matchDetails?.matchFormat} • {matchDetails?.state}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
 
                <div className="p-6 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
                        </div>
 
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-white/20 backdrop-blur-md text-white/90 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-white/10">
                                    {matchDetails?.seriesName || "Series Info"}
                                </span>
                            </div>
 
                            <h2 className="text-xl font-bold leading-snug mb-1">{matchDetails?.matchDescription}</h2>
                            <p className="text-indigo-100 text-sm opacity-90">{matchDetails?.status}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-lg font-black text-gray-700 border border-gray-100">
                                {matchDetails?.team1?.shortName || "T1"}
                            </div>
                            <p className="font-bold text-gray-800 text-sm text-center leading-tight">{matchDetails?.team1?.name}</p>
                        </div>
 
                        <div className="px-4 text-center">
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">VS</span>
                        </div>
 
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-lg font-black text-gray-700 border border-gray-100">
                                {matchDetails?.team2?.shortName || "T2"}
                            </div>
                            <p className="font-bold text-gray-800 text-sm text-center leading-tight">{matchDetails?.team2?.name}</p>
                        </div>
                    </div>
                    {commentary && (
                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl relative">
                            <h4 className="text-blue-700 font-bold mb-2 text-[10px] uppercase flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                                </svg>
                                Latest Commentary
                            </h4>
                            <p className="text-gray-800 text-sm font-medium leading-relaxed">{commentary}</p>
                            <div className="text-[10px] text-gray-400 mt-2">CS Server Time: {formatTimestamp(csServerTimestamp)}</div>
                            <div className="text-[10px] text-gray-400">Raw CS Server Time: {toMillis(csServerTimestamp) ?? String(csServerTimestamp)}</div>
                        </div>
                    )}
 
                    <div className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-50/80 rounded-lg p-3 border border-gray-100">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Match Date</span>
                            <span className="text-xs font-mono font-semibold text-gray-700">
                                {matchDetails?.matchStartTimestamp
                                    ? formatTimestamp(matchDetails.matchStartTimestamp)
                                    : "N/A"}
                            </span>
                        </div>
 
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <table className="w-full text-center text-xs">
                                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="py-2 px-1 text-[10px] uppercase">Zone</th>
                                        <th className="py-2 px-1 text-[10px] uppercase">Start</th>
                                        <th className="py-2 px-1 text-[10px] uppercase">Complete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    <tr>
                                        <td className="py-1.5 px-1 font-medium text-gray-500">GMT</td>
                                        <td className="py-1.5 px-1 font-mono">{matchDetails?.matchStartTimeGMT || "-"}</td>
                                        <td className="py-1.5 px-1 font-mono">{matchDetails?.matchCompleteTimeGMT || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-1 font-medium text-gray-500">IST</td>
                                        <td className="py-1.5 px-1 font-mono text-indigo-600 font-bold">{matchDetails?.matchStartTimeIST || "-"}</td>
                                        <td className="py-1.5 px-1 font-mono">{matchDetails?.matchCompleteTimeIST || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-1 font-medium text-gray-500">Local</td>
                                        <td className="py-1.5 px-1 font-mono">{matchDetails?.matchStartTimeLocal || "-"}</td>
                                        <td className="py-1.5 px-1 font-mono">{matchDetails?.matchCompleteTimeLocal || "-"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
 
                    {validScorecards.map((inning, idx) => (
 
                        <div>
                            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase mb-3 px-1 mt-4 border-t pt-4 border-gray-100">
                                Scorecard Summary
                            </h4>
                            <div className="bg-white border-b border-gray-200 rounded-lg  overflow-hidden ">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-semibold text-[11px] uppercase tracking-wider border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Innings</th>
                                            <th className="px-4 py-3">Team</th>
                                            <th className="px-4 py-3 text-right">Score</th>
                                            <th className="px-4 py-3 text-right">Overs</th>
                                            <th className="px-4 py-3 text-right">Balls</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-gray-700">
 
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className="font-bold text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                        Inn {inning.inningsId}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        {inning.isDeclared && <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 rounded">DEC</span>}
                                                        {inning.isFollowOn && <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 rounded">F/O</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-900">
                                                {inning.batTeamName}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-black text-indigo-600 text-lg">
                                                    {inning.score}/{inning.wickets}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-600">
                                                {inning.overs}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">
                                                {inning.ballNbr}
                                            </td>
                                        </tr>
 
                                        {validScorecards.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-4 text-center text-gray-500 py-10">
                                                    No innings found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
 
            </div>
 
        </div>
    )
}
 
export default StreamDetailsPage;
 
 