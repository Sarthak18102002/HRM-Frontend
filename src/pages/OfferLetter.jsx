import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import Layout from "../components/Layout";
import { FaFileAlt } from "react-icons/fa";

const OfferLetter = () => {
    const [userId, setUserId] = useState("");
    const [message, setMessage] = useState("");
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [downloadError, setDownloadError] = useState(""); // Add this state at the top

    // Modal states
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [modalUserId, setModalUserId] = useState("");
    const [generateStep, setGenerateStep] = useState(1); // 1: input, 2: message+download

    const handleGenerate = () => {
        setModalUserId("");
        setGenerateStep(1);
        setShowGenerateModal(true);
    };

    const handleDownloadPopup = () => {
        setModalUserId("");
        setShowDownloadModal(true);
    };

    const confirmGenerate = async () => {
        if (!modalUserId) {
            setMessage("Please enter a valid userId");
            return;
        }
        try {
            const response = await axios.post("/offer-letter/generate", {
                userId: Number(modalUserId),
            });
            const { message } = response.data;
            setMessage(message);
            setDownloadUrl(`/offer-letter/download?userId=${modalUserId}`);
            setGenerateStep(2); // Move to step 2: show message and download
        } catch (error) {
            setMessage("Failed to generate offer letter.");
            setDownloadUrl(null);
            setGenerateStep(2);
        }
    };

    const handleDownloadById = async (id, isFromDownloadModal = false) => {
        try {
            const response = await axios.get(`/offer-letter/download`, {
                params: { userId: Number(id) },
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            window.open(url, "_blank");
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            if (isFromDownloadModal) {
                setShowDownloadModal(false);
                setDownloadError(""); // Clear error on success
            }
        } catch (error) {
            if (isFromDownloadModal) {
                setDownloadError("Failed to open offer letter.");
            } else {
                setMessage("Failed to open offer letter.");
            }
        }
    };

    const confirmDownload = async () => {
        if (!modalUserId) {
            setDownloadError("Please enter a valid userId");
            return;
        }
        await handleDownloadById(modalUserId, true);
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-screen bg-gradient from-white-100 to-white-200">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-indigo-100">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-indigo-100 p-4 rounded-full mb-2">
                            <FaFileAlt className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-indigo-700 mb-1">Offer Letter</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleGenerate}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold py-2.5 rounded-lg shadow hover:from-indigo-600 hover:to-blue-600 transition"
                        >
                            Generate Offer Letter
                        </button>
                        <button
                            onClick={handleDownloadPopup}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2.5 rounded-lg shadow hover:from-purple-600 hover:to-pink-600 transition"
                        >
                            Download by User ID
                        </button>
                    </div>

                    {/* Generate Modal */}
                    {showGenerateModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs">
                                <h3 className="text-lg font-bold mb-4 text-indigo-700">Generate Offer Letter</h3>
                                {generateStep === 1 ? (
                                    <>
                                        <input
                                            type="number"
                                            value={modalUserId}
                                            onChange={(e) => setModalUserId(e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 transition mb-4"
                                            placeholder="Enter user ID"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={confirmGenerate}
                                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                                            >
                                                Generate
                                            </button>
                                            <button
                                                onClick={() => setShowGenerateModal(false)}
                                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            className={`mb-4 text-center text-sm font-medium ${message.toLowerCase().includes("sent to")
                                                ? "text-green-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            {message}
                                        </div>
                                        <div className="flex gap-2">
                                            {message.toLowerCase().includes("sent to") && (
                                                <button
                                                    onClick={async () => {
                                                        await handleDownloadById(modalUserId);
                                                        setShowGenerateModal(false);
                                                    }}
                                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                                                >
                                                    Download
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowGenerateModal(false)}
                                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Download Modal */}
                    {showDownloadModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs">
                                <h3 className="text-lg font-bold mb-4 text-pink-700">Download Offer Letter</h3>
                                <input
                                    type="number"
                                    value={modalUserId}
                                    onChange={(e) => {
                                        setModalUserId(e.target.value);
                                        setDownloadError(""); // Clear error on input change
                                    }}
                                    className="w-full px-4 py-2 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 transition mb-4"
                                    placeholder="Enter user ID"
                                />
                                {downloadError && (
                                    <div className="mb-2 text-center text-sm text-red-600 font-medium">{downloadError}</div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={confirmDownload}
                                        className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDownloadModal(false);
                                            setDownloadError("");
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default OfferLetter;
