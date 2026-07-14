import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/AxiosInstance";
import { ORDERS } from "../../services/Admin/adminEndPoints";
import { toast } from "react-toastify";

const PrintWaybill = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [labelData, setLabelData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabel = async () => {
            try {
                const response = await api.get(`admin/${ORDERS}/${id}/delhivery/label`);
                if (response.data && response.data.label) {
                    setLabelData(response.data.label);
                } else {
                    toast.error("Failed to load label data");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch shipping label");
                navigate("/orders");
            } finally {
                setLoading(false);
            }
        };

        fetchLabel();
    }, [id, navigate]);

    useEffect(() => {
        if (!loading && labelData) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, labelData]);

    if (loading) return <div className="p-8 text-center">Loading shipping label...</div>;
    if (!labelData) return null;

    return (
        <div className="bg-white text-black p-4 font-sans border-2 border-black" style={{ width: "100mm", minHeight: "150mm", margin: "0 auto" }}>
            {/* Courier Header */}
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">DELHIVERY</h1>
                    <p className="text-xs font-bold">{labelData.mot === 'S' ? 'SURFACE' : 'EXPRESS'}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">{labelData.pt}</p>
                    <p className="text-xs">{new Date(labelData.cd).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Destination & Routing */}
            <div className="flex justify-between border-b-2 border-black pb-2 mb-2">
                <div className="w-1/2 border-r-2 border-black pr-2">
                    <p className="text-xs font-bold uppercase">To:</p>
                    <p className="font-bold text-sm leading-tight">{labelData.name}</p>
                    <p className="text-xs leading-tight">{labelData.address}</p>
                    <p className="text-xs leading-tight">{labelData.destination_city || labelData.destination}</p>
                    <p className="text-sm font-black mt-1">PIN: {labelData.pin}</p>
                    <p className="text-xs mt-1">Ph: {labelData.contact || labelData.rph}</p>
                </div>
                <div className="w-1/2 pl-2 text-center flex flex-col justify-center">
                    <h2 className="text-4xl font-black">{labelData.st_code}</h2>
                    <p className="text-sm font-bold">{labelData.sort_code || labelData.st}</p>
                </div>
            </div>

            {/* AWB and Barcode area (placeholder for actual barcode font/img) */}
            <div className="text-center border-b-2 border-black pb-2 mb-2 py-4">
                <p className="text-xs font-bold uppercase mb-1">AWB Number</p>
                <div className="w-full bg-slate-100 h-16 flex items-center justify-center border border-dashed border-slate-400 mb-1">
                    <p className="font-mono text-xs text-slate-500">Barcode: {labelData.wbn}</p>
                </div>
                <h3 className="text-2xl font-black tracking-widest">{labelData.wbn}</h3>
            </div>

            {/* Order Details */}
            <div className="flex border-b-2 border-black pb-2 mb-2 text-xs">
                <div className="w-1/2 border-r-2 border-black pr-2">
                    <p><span className="font-bold">Order ID:</span> {labelData.oid}</p>
                    <p><span className="font-bold">Weight:</span> {labelData.weight}g</p>
                    <p><span className="font-bold">Dimensions:</span> {labelData.shipment_length}x{labelData.shipment_width}x{labelData.shipment_height}</p>
                </div>
                <div className="w-1/2 pl-2">
                    <p><span className="font-bold">Product:</span> {labelData.prd}</p>
                    <p className="font-bold mt-1 text-sm">COD: ₹{labelData.cod || 0}</p>
                </div>
            </div>

            {/* Return Address */}
            <div className="text-xs pt-2">
                <p className="font-bold uppercase">Return Address:</p>
                <p>{labelData.snm || "Gaukrishna"}</p>
                <p>{labelData.sadd}</p>
                <p>{labelData.rcty}, {labelData.rst} - {labelData.rpin}</p>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .bg-white, .bg-white * {
                        visibility: visible;
                    }
                    .bg-white {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100mm !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintWaybill;
