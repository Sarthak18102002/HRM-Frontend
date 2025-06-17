import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axiosInstance from "../utils/axiosInstance";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Layout from "../components/Layout";
import Select from "react-select";

const localizer = momentLocalizer(moment);

const initialEventState = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  technology: "",
  location: "",
  recurrence: "",
  meetingTitle: "",
  members: [],
};

const USER_ID = 1; // Replace with actual user id logic

const Calender = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState(initialEventState);
  const [isEdit, setIsEdit] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState("");

  // Fetch events for user
  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.post("/calender/user", { userId: USER_ID });
      const mapped = res.data.map(ev => ({
        ...ev,
        start: new Date(ev.startTime),
        end: new Date(ev.endTime),
      }));
      setEvents(mapped);
    } catch (err) {
      setEvents([]);
    }
  };

  // Fetch users for dropdown (like UserRoles.jsx)
  const fetchAllUsers = async () => {
    try {
      const response = await axiosInstance.post("/auth/Users", {
        filter: "0",
        pageNumber: 0,
        pageSize: 100
      });
      setAllUsers(response.data?.data?.content || []);
    } catch (err) {
      setAllUsers([]);
      setError("Failed to load users.");
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (modalOpen) {
      fetchAllUsers();
    }
    // eslint-disable-next-line
  }, [modalOpen]);

  // Add event handler
  const handleSelectSlot = ({ start, end }) => {
    setIsEdit(false);
    setSelectedEvent(null);
    setEventForm({
      ...initialEventState,
      startTime: moment(start).format("YYYY-MM-DDTHH:mm"),
      endTime: moment(end).format("YYYY-MM-DDTHH:mm"),
    });
    setModalOpen(true);
  };

  // Show modal on event click
  const handleSelectEvent = (event) => {
    setIsEdit(true);
    setSelectedEvent(event);
    setEventForm({
      ...event,
      startTime: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      endTime: moment(event.end).format("YYYY-MM-DDTHH:mm"),
      members: event.members ? event.members.map(m => m.id) : [],
    });
    setModalOpen(true);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle members dropdown change
  const handleMembersChange = (selectedOptions) => {
    setEventForm((prev) => ({
      ...prev,
      members: selectedOptions ? selectedOptions.map(option => option.value) : [],
    }));
  };

  // Add or Update event
  const handleSave = async () => {
    if (!eventForm.title.trim()) {
      alert("Title cannot be empty.");
      return;
    }
    if (!eventForm.startTime || !eventForm.endTime) {
      alert("Start and End time are required.");
      return;
    }

    const payload = {
      ...eventForm,
      members: eventForm.members.map(id => ({ id })),
    };

    try {
      if (isEdit && selectedEvent) {
        const res = await axiosInstance.put(
          "/calender/update",
          { ...payload, id: selectedEvent.id }
        );
        setEvents(events.map(e =>
          e.id === selectedEvent.id
            ? { ...res.data, start: new Date(res.data.startTime), end: new Date(res.data.endTime) }
            : e
        ));
      } else {
        const res = await axiosInstance.post("/calender/create", payload);
        setEvents([
          ...events,
          { ...res.data, start: new Date(res.data.startTime), end: new Date(res.data.endTime) },
        ]);
      }
      setModalOpen(false);
      setSelectedEvent(null);
      setEventForm(initialEventState);
    } catch (error) {
      alert(isEdit ? "Failed to update event." : "Failed to add event.");
    }
  };

  // Delete event
  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await axiosInstance.delete("/calender/delete", {
        data: { id: selectedEvent.id }
      });
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setModalOpen(false);
      setSelectedEvent(null);
      setEventForm(initialEventState);
    } catch (error) {
      alert("Failed to delete event.");
    }
  };

  // Close modal
  const handleClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setEventForm(initialEventState);
  };

  return (
    <Layout>
 
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-center text-3xl font-extrabold tracking-wide text-blue-600 mb-7">
            Calender
          </h1>
          <div className="rounded-xl shadow">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              style={{
                height: 600,
                background: "#f8fafc",
                padding: 12,
              }}
            />
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
              className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-white via-indigo-50 to-blue-100 rounded-3xl shadow-2xl p-0 border-4 border-indigo-200 animate-fadeIn"
              style={{ maxHeight: "90vh", overflow: "hidden" }}
            >
              {/* Scrollable content */}
              <div className="p-12 overflow-y-auto" style={{ maxHeight: "90vh" }}>
                {/* Close Icon */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-2xl text-indigo-400 hover:text-indigo-700 transition"
                  aria-label="Close"
                  title="Close"
                  type="button"
                >
                  &times;
                </button>
                <h2 className="mb-6 text-3xl font-extrabold text-center text-indigo-700 tracking-wide drop-shadow">
                  {isEdit ? "Edit Event" : "Add Event"}
                </h2>
                <div className="space-y-4">
                 <label className="block mb-1 text-sm font-semibold text-indigo-700">Event Title</label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleFormChange}
                  placeholder="Event Title"
                  className="w-full px-5 py-3 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-700 placeholder-gray-400 shadow"
                  autoFocus
                /> <label className="block mb-1 text-sm font-semibold text-indigo-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={eventForm.description}
                  onChange={handleFormChange}
                  placeholder="Description"
                  className="w-full px-5 py-3 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-700 placeholder-gray-400 shadow"
                />
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-1 w-full">
                    <label className="block mb-1 text-sm font-semibold text-indigo-700" htmlFor="startTime">
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      type="datetime-local"
                      name="startTime"
                      value={eventForm.startTime}
                      onChange={handleFormChange}
                      className="w-full px-5 py-3 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-700 shadow"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block mb-1 text-sm font-semibold text-indigo-700" htmlFor="endTime">
                      End Time
                    </label>
                    <input
                      id="endTime"
                      type="datetime-local"
                      name="endTime"
                      value={eventForm.endTime}
                      min={eventForm.startTime}
                      onChange={handleFormChange}
                      className="w-full px-5 py-3 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-700 shadow"
                    />
                  </div>
                </div>
                 <label className="block mb-1 text-sm font-semibold text-indigo-700">Technology</label>
                <input
                  type="text"
                  name="technology"
                  value={eventForm.technology}
                  onChange={handleFormChange}
                  placeholder="Technology"
                  className="w-full px-5 py-3 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-700 placeholder-gray-400 shadow"
                />
                 <label className="block mb-1 text-sm font-semibold text-indigo-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleFormChange}
                  placeholder="Location"
                  className="w-full px-5 py-3 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-700 placeholder-gray-400 shadow"
                />
                 <label className="block mb-1 text-sm font-semibold text-indigo-700">Meeting Title</label>
                <input
                  type="text"
                  name="meetingTitle"
                  value={eventForm.meetingTitle}
                  onChange={handleFormChange}
                  placeholder="Meeting Title"
                  className="w-full px-5 py-3 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-700 placeholder-gray-400 shadow"
                />
                <div>
                  <label className="block mb-1 text-sm font-semibold text-indigo-700">Members</label>
                  <Select
                    isMulti
                    name="members"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    options={allUsers.map(user => ({
                      value: user.id,
                      label: user.username
                    }))}
                    value={allUsers
                      .filter(user => eventForm.members.includes(user.id))
                      .map(user => ({ value: user.id, label: user.username }))
                    }
                    onChange={selectedOptions =>
                      setEventForm(prev => ({
                        ...prev,
                        members: selectedOptions ? selectedOptions.map(opt => opt.value) : []
                      }))
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        borderColor: "#a5b4fc",
                        minHeight: "48px",
                        boxShadow: "none",
                        fontSize: "1rem"
                      }),
                      menuPortal: base => ({ ...base, zIndex: 9999 }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#e0e7ff",
                        color: "#3730a3"
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#6366f1"
                          : state.isFocused
                          ? "#e0e7ff"
                          : "#fff",
                        color: state.isSelected ? "#fff" : "#3730a3",
                        fontWeight: state.isSelected ? "bold" : "normal"
                      })
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-8">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-blue-700 transition"
                  type="button"
                >
                  {isEdit ? "Update" : "Add"}
                </button>
                {isEdit && (
                  <button
                    onClick={handleDelete}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 text-white font-bold shadow-lg hover:from-rose-600 hover:to-rose-800 transition"
                    type="button"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-8 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold shadow hover:bg-slate-300 transition"
                  type="button"
                >
                  Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
  
    </Layout>
  );
};

export default Calender;