import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axiosInstance';

const Interviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [formData, setFormData] = useState({
        id: '',
        userId: '',
        interviewerId: '',
        interviewDate: '',
        location: '',
        status: '',
        remarks: ''
    });

    const [searchId, setSearchId] = useState('');
    const [interviewById, setInterviewById] = useState(null);

    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);

    // Dropdown state
    const [dropdownIdx, setDropdownIdx] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const actionsBtnRefs = useRef({});

    // Add to your InterviewSchedule component state:
    const [dates, setDates] = useState(['']);

    // --- Role logic like Applications.jsx ---
    const getUserRole = () => {
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.roles?.includes('ADMIN') || payload.roles?.includes('INTERVIEWER')) {
                return 'ADMIN';
            }
            return 'USER';
        } catch {
            return null;
        }
    };
    const role = getUserRole();
    // ---------------------------------------

    useEffect(() => {
        fetchInterviews();
        // eslint-disable-next-line
    }, [page, size, role]);

    const fetchInterviews = async () => {
        try {
            let res;
            if (role === 'USER') {
                res = await axios.get(`/interviews/my?page=${page}&size=${size}`);
            } else {
                res = await axios.get(`/interviews/all?page=${page}&size=${size}`);
            }
            setInterviews(res.data.data.content);
        } catch (err) {
            console.error('Error fetching interviews:', err);
        }
    };

    const handleSchedule = async () => {
        try {
            const res = await axios.post('/interviews/schedule', formData);
            alert(res.data.message);
            fetchInterviews();
        } catch (err) {
            alert('Error scheduling interview');
        }
    };

    const handleReschedule = async () => {
        try {
            const res = await axios.put('/interviews/reschedule', formData);
            alert(res.data.message);
            fetchInterviews();
        } catch (err) {
            alert('Error rescheduling interview');
        }
    };

    const handleCancel = async (id) => {
        try {
            await axios.delete('/interviews/cancel', {
                data: { id: id }
            });
            alert('Interview cancelled');
            fetchInterviews();
        } catch (err) {
            alert('Error cancelling interview');
        }
    };


    const handleSearchById = async () => {
        try {
            const res = await axios.post('/interviews/GetById', { id: searchId });
            setInterviewById(res.data.data);
        } catch (err) {
            alert('Interview not found');
        }
    };


    const openDropdown = (idx, interview) => {
        const btn = actionsBtnRefs.current[idx];
        if (btn) {
            const rect = btn.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
            setDropdownIdx(idx);
            setSelectedInterview(interview);
        }
    };


    useEffect(() => {
        const handleClick = (e) => {

            if (
                dropdownIdx !== null &&
                document.getElementById('dropdown-actions') &&
                !document.getElementById('dropdown-actions').contains(e.target)
            ) {
                setDropdownIdx(null);
            }
        };
        if (dropdownIdx !== null) {
            document.addEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownIdx]);

    return (
        <div className="container mx-auto px-6 py-10 max-w-5xl bg-gradient-to-br from-indigo-50 via-white to-blue-100 rounded-3xl shadow-2xl">
            <h2 className="text-4xl font-extrabold mb-8 text-center text-indigo-800 tracking-wide drop-shadow-lg">
                All Interviews
            </h2>

            <div className="overflow-x-auto rounded-2xl shadow-lg mb-8">
                <table className="w-full bg-white rounded-2xl overflow-hidden">
                    <thead className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-900 font-semibold">
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Candidate Email</th>
                            <th className="px-4 py-3 text-left">Interviewer Email</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Mode</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            {role !== 'USER' && (
                                <th className="px-4 py-3 text-center">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {interviews.length === 0 ? (
                            <tr>
                                <td colSpan={role !== 'USER' ? 7 : 6} className="text-center py-8 text-indigo-600 font-semibold">
                                    No interviews found.
                                </td>
                            </tr>
                        ) : (
                            interviews.map((i, idx) => (
                                <tr key={i.id} className="hover:bg-indigo-50 transition">
                                    <td className="px-4 py-3 border-b">{i.id}</td>
                                    <td className="px-4 py-3 border-b">{i.candidateEmail}</td>
                                    <td className="px-4 py-3 border-b">{i.interviewerEmail || 'N/A'}</td>
                                    <td className="px-4 py-3 border-b">{i.dateTime ? new Date(i.dateTime).toLocaleString() : ''}</td>
                                    <td className="px-4 py-3 border-b">{i.mode}</td>
                                    <td className="px-4 py-3 border-b">{i.status}</td>
                                    {role !== 'USER' && (
                                        <td className="px-4 py-3 border-b text-center">
                                            <button
                                                ref={el => (actionsBtnRefs.current[idx] = el)}
                                                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-3 py-1 rounded-xl shadow font-semibold"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    openDropdown(idx, i);
                                                }}
                                                type="button"
                                            >
                                                Actions
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Floating Dropdown */}
            {dropdownIdx !== null && selectedInterview && role !== 'USER' && (
                <div
                    id="dropdown-actions"
                    style={{
                        position: 'absolute',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        zIndex: 1000,
                        minWidth: dropdownPos.width,
                    }}
                    className="bg-white border rounded-xl shadow-lg"
                >
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-indigo-50"
                        onClick={e => {
                            e.stopPropagation();
                            setShowRescheduleModal(true);
                            setFormData({
                                ...selectedInterview,
                                interviewDate: '',
                                remarks: '',
                            });
                            setDropdownIdx(null);
                        }}
                    >
                        Reschedule
                    </button>
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-red-600"
                        onClick={e => {
                            e.stopPropagation();
                            handleCancel(selectedInterview.id);
                            setDropdownIdx(null);
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-500"
                        onClick={e => {
                            e.stopPropagation();
                            setDropdownIdx(null);
                        }}
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center gap-4 mb-10">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={page === 0}
                    className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 disabled:opacity-50 transition"
                >
                    Previous
                </button>
                <span className="font-semibold text-indigo-900 py-2 px-4 bg-indigo-100 rounded-full shadow">
                    Page {page + 1}
                </span>
                <button
                    onClick={() => setPage((p) => p + 1)}
                    className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-indigo-500 hover:to-blue-600 transition"
                >
                    Next
                </button>
            </div>

            {/* Reschedule Modal */}
            {showRescheduleModal && selectedInterview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-indigo-100">
                        <h3 className="text-2xl font-bold mb-6 text-indigo-700 text-center">Reschedule Interview</h3>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const { interviewerId, ...rest } = selectedInterview;
                                await axios.put('/interviews/reschedule', {
                                    ...rest,
                                    dateTime: dates[0], // <-- send the first date only
                                    remarks: formData.remarks,
                                    status: 'Rescheduled'
                                });
                                setShowRescheduleModal(false);
                                fetchInterviews();
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block font-semibold text-indigo-700 mb-1">Candidate Email</label>
                                <input
                                    type="text"
                                    value={selectedInterview.candidateEmail}
                                    readOnly
                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-indigo-700 mb-1">Interviewer Email</label>
                                <input
                                    type="text"
                                    value={selectedInterview.interviewerEmail || 'N/A'}
                                    readOnly
                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-indigo-700 mb-1">Date & Time</label>
                                {dates.map((dt, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="datetime-local"
                                            name={`dateTime${idx}`}
                                            value={dt}
                                            onChange={e => {
                                                const newDates = [...dates];
                                                newDates[idx] = e.target.value;
                                                setDates(newDates);
                                            }}
                                            required
                                            className="w-full px-4 py-2 border rounded-md"
                                        />
                                        {dates.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setDates(dates.filter((_, i) => i !== idx))}
                                                className="text-red-500 font-bold"
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                ))}

                            </div>
                            <div>
                                <label className="block font-semibold text-indigo-700 mb-1">Remarks</label>
                                <textarea
                                    value={formData.remarks}
                                    onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-indigo-700 mb-1">Status</label>
                                <input
                                    type="text"
                                    value="Rescheduled"
                                    readOnly
                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg bg-gray-100"
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowRescheduleModal(false)}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-xl shadow"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow"
                                >
                                    Reschedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search by ID */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-indigo-100">
                <h3 className="text-2xl font-bold mb-4 text-indigo-700 text-center">Search Interview by ID</h3>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-4">
                    <input
                        type="text"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="border-2 border-indigo-200 rounded-lg px-4 py-2 w-full md:w-64"
                        placeholder="Interview ID"
                    />
                    <button
                        onClick={handleSearchById}
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-8 rounded-xl shadow transition"
                    >
                        Search
                    </button>
                </div>
                {interviewById && (
                    <div className="mt-2 bg-indigo-50 rounded-lg p-4 text-indigo-900">
                        <p><strong>ID:</strong> {interviewById.id}</p>
                        <p><strong>Candidate ID:</strong> {interviewById.userId}</p>
                        <p><strong>Candidate Email:</strong> {interviewById.candidateEmail}</p>
                        <p><strong>Interviewer Email:</strong> {interviewById.interviewerEmail || 'N/A'}</p>
                        <p><strong>Date:</strong> {interviewById.dateTime? new Date(interviewById.dateTime).toLocaleString() : ''}</p>
                        <p><strong>Mode:</strong> {interviewById.mode}</p>
                        <p><strong>Meeting Link:</strong> {interviewById.meetingLink}</p>
                        <p><strong>Location:</strong> {interviewById.location}</p>
                        <p><strong>Status:</strong> {interviewById.status}</p>
                        <p><strong>Remarks:</strong> {interviewById.remarks}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Interviews;