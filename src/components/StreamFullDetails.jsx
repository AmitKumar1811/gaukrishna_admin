import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../Firebase";
import { XMarkIcon } from "@heroicons/react/24/solid";
 
const StreamFullDetails = ({ open, onClose, programId, streamData }) => {
    const [commands, setCommands] = useState([]);
    const [scorecard, setScorecard] = useState(null);
    const [loading, setLoading] = useState(false);
 
    useEffect(() => {
        if (open && programId && streamData?._id) {
            fetchDetails();
        }
    }, [open, programId, streamData]);
 
    const fetchDetails = async () => {
        setLoading(true);
        try {
            const commandsRef = collection(db, "programs", programId, "streams", streamData._id, "commands");
            const commandsQuery = query(commandsRef, where("action", "==", true), orderBy("timestamp", "desc"));
            const commandsSnap = await getDocs(commandsQuery);
 
            const commandsList = commandsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCommands(commandsList);
            const scorecardRef = collection(db, "programs", programId, "streams", streamData._id, "commentaryScoreCard");
            const scorecardQuery = query(scorecardRef, orderBy("csServerTimestamp", "desc"), limit(1));
            const scorecardSnap = await getDocs(scorecardQuery);
 
            if (!scorecardSnap.empty) {
                setScorecard(scorecardSnap.docs[0].data());
            } else {
                setScorecard(null);
            }
 
        } catch (error) {
            console.error("Error fetching stream details:", error);
        } finally {
            setLoading(false);
        }
    };
 
    if (!open) return null;
 
    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
 
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-4xl bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                        <Dialog.Title className="text-xl font-semibold text-[#9900FF]">
                            Stream Details: {streamData?.streamName}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
 
                    <div className="p-6 space-y-8">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <p className="text-gray-500">Loading details...</p>
                            </div>
                        ) : (
                            <>
                                <section>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-[#9900FF] pl-2">
                                        Commentary & Scorecard
                                    </h3>
                                    {scorecard ? (
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                                            {/* Match Status Header */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm text-gray-500">{scorecard.seriesName}</p>
                                                    <p className="font-semibold text-lg">{scorecard.matchDetails?.matchDescription} - {scorecard.matchDetails?.matchFormat}</p>
                                                    <p className="text-[#9900FF] font-medium">{scorecard.status}</p>
                                                </div>
                                                <div className="text-right text-sm text-gray-600">
                                                    <p>{scorecard.matchDetails?.matchStartTimeIST}</p>
                                                    <p>{scorecard.matchDetails?.state}</p>
                                                </div>
                                            </div>
 
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="bg-white p-3 rounded shadow-sm text-center">
                                                    <p className="font-bold text-lg">{scorecard.team1?.name} ({scorecard.team1?.shortName})</p>
                                                </div>
                                                <div className="bg-white p-3 rounded shadow-sm text-center">
                                                    <p className="font-bold text-lg">{scorecard.team2?.name} ({scorecard.team2?.shortName})</p>
                                                </div>
                                            </div>
 
                                            {scorecard.commentary && (
                                                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded border border-blue-100">
                                                    <p className="font-medium text-sm uppercase mb-1">Latest Commentary</p>
                                                    <p>{scorecard.commentary}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No scorecard data available.</p>
                                    )}
                                </section>
 
                                <section>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-[#9900FF] pl-2">
                                        Commands Log
                                    </h3>
                                    {commands.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-gray-600">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-2">Timestamp</th>
                                                        <th className="px-4 py-2">Stream ID</th>
                                                        <th className="px-4 py-2">Server Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {commands.map((cmd) => (
                                                        <tr key={cmd.id} className="bg-white border-b hover:bg-gray-50">
                                                            <td className="px-4 py-2 font-medium text-gray-900">
                                                                {cmd.humanReadableTimestamp || cmd.timestamp}
                                                            </td>
                                                            <td className="px-4 py-2">{cmd.stream}</td>
                                                            <td className="px-4 py-2">
                                                                {cmd.serverTimestamp?.seconds
                                                                    ? new Date(cmd.serverTimestamp.seconds * 1000).toLocaleString()
                                                                    : (cmd.serverTimestamp || "-")}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No commands found.</p>
                                    )}
                                </section>
                            </>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
 
export default StreamFullDetails;
 