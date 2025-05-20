// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const InterviewSchedule = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   // Initialize formData with prefilled fields from state
//   const [formData, setFormData] = useState({
//     dateTime: '',
//     mode: 'Online',
//     meetingLink: '',
//     location: '',
//     remarks: '',
//     status: 'Scheduled',
//     userId: state?.userId || '',
//     interviewerEmail: state?.interviewerEmail || ''
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem('authToken');

//     try {
//       await axios.post('/interview/schedule', {
//         ...formData
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       alert('Interview scheduled successfully!');
//       navigate('/applications');
//     } catch (err) {
//       console.error('Error scheduling interview:', err);
//       alert('Failed to schedule interview.');
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto mt-12 bg-white p-8 shadow-md rounded-md">
//       <h2 className="text-2xl font-bold mb-6 text-indigo-700">Schedule Interview</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">

//         {/* Prefilled read-only fields */}
//         <div>
//           <label className="block font-semibold text-gray-700">User ID</label>
//           <input
//             type="text"
//             name="userId"
//             value={formData.userId}
//             readOnly
//             className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
//           />
//         </div>

//         <div>
//           <label className="block font-semibold text-gray-700">Interviewer Email</label>
//           <input
//             type="email"
//             name="interviewerEmail"
//             value={formData.interviewerEmail}
//             readOnly
//             className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
//           />
//         </div>

//         {/* Other editable fields */}
//         <div>
//           <label className="block font-semibold text-gray-700">Interview Date & Time</label>
//           <input
//             type="datetime-local"
//             name="dateTime"
//             value={formData.dateTime}
//             onChange={handleChange}
//             required
//             className="w-full px-4 py-2 border rounded-md"
//           />
//         </div>

//         <div>
//           <label className="block font-semibold text-gray-700">Mode</label>
//           <select
//             name="mode"
//             value={formData.mode}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border rounded-md"
//           >
//             <option value="Online">Online</option>
//             <option value="Offline">Offline</option>
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold text-gray-700">Meeting Link</label>
//           <input
//             type="url"
//             name="meetingLink"
//             value={formData.meetingLink}
//             onChange={handleChange}
//             placeholder="https://zoom.us/meeting/123"
//             className="w-full px-4 py-2 border rounded-md"
//           />
//         </div>

//         <div>
//           <label className="block font-semibold text-gray-700">Location</label>
//           <input
//             type="text"
//             name="location"
//             value={formData.location}
//             onChange={handleChange}
//             placeholder="E.g., Nashik"
//             className="w-full px-4 py-2 border rounded-md"
//           />
//         </div>

//         <div>
//           <label className="block font-semibold text-gray-700">Remarks</label>
//           <textarea
//             name="remarks"
//             value={formData.remarks}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border rounded-md"
//           />
//         </div>

//         <div>
//           <label className="block font-semibold text-gray-700">Status</label>
//           <select
//             name="status"
//             value={formData.status}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border rounded-md"
//           >
//             <option value="Scheduled">Scheduled</option>
//             <option value="Rescheduled">Rescheduled</option>
//             <option value="Completed">Completed</option>
//           </select>
//         </div>

//         <button
//           type="submit"
//           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow-md"
//         >
//           Submit
//         </button>
//       </form>
//     </div>
//   );
// };

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance'; 

const InterviewSchedule = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');

  const [formData, setFormData] = useState({
    dateTime: '',
    mode: 'Online',
    meetingLink: '',
    location: '',
    remarks: '',
    status: 'Scheduled',
    userId: state?.userId ?? null,
    interviewerEmail: state?.interviewerEmail ?? '',
    candidateEmail: '',
  });

  // Fetch candidate email based on userId
 useEffect(() => {
  const fetchCandidateEmail = async () => {
    if (!formData.userId) return;

    try {
      const response = await axiosInstance.post(
        '/auth/Users/getById',
        { id: formData.userId }
      );
      // Assuming email is in response.data.data.email
      const email = response.data.data?.email || '';
      setFormData(prev => ({ ...prev, candidateEmail: email }));
    } catch (error) {
      console.error('Failed to fetch candidate email:', error);
    }
  };

  fetchCandidateEmail();
}, [formData.userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (formData.mode === 'Online' && !formData.meetingLink) {
      alert('Please provide a meeting link for online mode.');
      return;
    }

    await axiosInstance.post('/interviews/schedule', formData);

    alert('Interview scheduled successfully!');
    navigate('/applications');
  } catch (err) {
    console.error('Error scheduling interview:', err);

    if (err.response && err.response.status === 409) {
      // Show specific message from backend
      const message = err.response.data?.message || 'This email has already interview scheduled';
      alert(message);
    } else {
      alert('Failed to schedule interview. Please try again.');
    }
  }
};

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white p-8 shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Schedule Interview</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block font-semibold text-gray-700">User ID</label>
          <input
            type="text"
            name="userId"
            value={formData.userId || ''}
            readOnly
            className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700">Candidate Email</label>
          <input
            type="email"
            name="candidateEmail"
            value={formData.candidateEmail}
            readOnly
            className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700">Interviewer Email</label>
          <input
            type="email"
            name="interviewerEmail"
            value={formData.interviewerEmail}
            readOnly
            className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700">Interview Date & Time</label>
          <input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700">Mode</label>
          <select
            name="mode"
            value={formData.mode}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700">Meeting Link</label>
          <input
            type="url"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            placeholder="https://zoom.us/meeting/123"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="E.g., Nashik"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default InterviewSchedule;
