import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { connect, createLocalVideoTrack, LocalDataTrack } from "twilio-video";
import Layout from "../components/Layout";
import { HiVideoCamera, HiUserGroup } from "react-icons/hi2";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function MeetingRoom() {
  const [step, setStep] = useState("initial"); // 'initial', 'create', 'join', 'created', 'connected'
  const [roomInput, setRoomInput] = useState("");
  const [identityInput, setIdentityInput] = useState("");
  const [joinLinkInput, setJoinLinkInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, message: "", success: false });
  const [roomName, setRoomName] = useState("");
  const [token, setToken] = useState("");
  const [joined, setJoined] = useState(false);
  const [roomInstance, setRoomInstance] = useState(null);
  const navigate = useNavigate(); // Add this line

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const dataTrackRef = useRef(null);

  // Screen share state
  const [isSharing, setIsSharing] = useState(false);
  const screenTrackRef = useRef(null);

  // Schedule state
  const [scheduleRoomInput, setScheduleRoomInput] = useState("");
  const [scheduleTimeInput, setScheduleTimeInput] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(null);
  const [scheduledLink, setScheduledLink] = useState(""); // add this state

  // Connect to room after joining
  useEffect(() => {
    if (token && roomName && joined) {
      // Create a DataTrack for chat
      const dataTrack = new LocalDataTrack();
      dataTrackRef.current = dataTrack;

      connect(token, {
        name: roomName,
        tracks: [dataTrack],
      }).then((room) => {
        setRoomInstance(room);

        // Show local video
        createLocalVideoTrack().then((localVideoTrack) => {
          const videoElement = localVideoTrack.attach();
          videoElement.style.width = "100%";
          videoElement.style.height = "100%";
          videoElement.style.objectFit = "cover";
          videoElement.style.borderRadius = "inherit";
          videoElement.style.margin = "0";
          videoElement.style.transform = "scaleX(-1)";
          document.getElementById("local-video").innerHTML = "";
          document.getElementById("local-video").appendChild(videoElement);
        });

        // Helper to attach remote participant tracks
        function attachParticipantTracks(participant) {
          participant.tracks.forEach((publication) => {
            if (publication.track && publication.track.kind === "video") {
              const video = publication.track.attach();
              video.style.width = "100%";
              video.style.height = "100%";
              video.style.objectFit = "cover";
              video.style.borderRadius = "inherit";
              video.style.margin = "0";
              document.getElementById("remote-videos").appendChild(video);
            }
          });
          participant.on("trackSubscribed", (track) => {
            if (track.kind === "video") {
              const video = track.attach();
              video.style.width = "100%";
              video.style.height = "100%";
              video.style.objectFit = "cover";
              video.style.borderRadius = "inherit";
              video.style.margin = "0";
              document.getElementById("remote-videos").appendChild(video);
            }
          });
        }

        // Attach already connected participants
        room.participants.forEach(attachParticipantTracks);

        // Attach new participants as they connect
        room.on("participantConnected", attachParticipantTracks);

        // Chat: Listen for DataTrack messages
        room.on("trackSubscribed", (track, publication, participant) => {
          if (track.kind === "data") {
            track.on("message", (msg) => {
              setChatMessages((prev) => [
                ...prev,
                { sender: participant.identity, text: msg },
              ]);
            });
          }
        });

        // Listen for already published data tracks
        room.participants.forEach((participant) => {
          participant.tracks.forEach((publication) => {
            if (
              publication.track &&
              publication.track.kind === "data" &&
              publication.track !== dataTrack
            ) {
              publication.track.on("message", (msg) => {
                setChatMessages((prev) => [
                  ...prev,
                  { sender: participant.identity, text: msg },
                ]);
              });
            }
          });
        });

        // Remove remote video on participant disconnect
        room.on("participantDisconnected", (participant) => {
          participant.tracks.forEach((publication) => {
            if (publication.track && publication.track.kind === "video") {
              publication.track.detach().forEach((el) => el.remove());
            }
          });
        });
      });
    }
    // eslint-disable-next-line
  }, [token, roomName, joined]);

  // Chat send handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && dataTrackRef.current) {
      dataTrackRef.current.send(chatInput);
      setChatMessages((prev) => [
        ...prev,
        { sender: "You", text: chatInput },
      ]);
      setChatInput("");
    }
  };
  const handleDisconnect = () => {
    // 1. Stop all local tracks (camera, mic)
    if (roomInstance && roomInstance.localParticipant) {
      roomInstance.localParticipant.tracks.forEach(publication => {
        if (publication.track && typeof publication.track.stop === "function") {
          publication.track.stop();
        }
        if (publication.track) {
          roomInstance.localParticipant.unpublishTrack(publication.track);
        }
      });
    }

    // 2. Stop screen sharing if active
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
      setIsSharing(false);
    }

    // 3. Disconnect from Twilio room
    if (roomInstance) {
      roomInstance.disconnect();
      setRoomInstance(null);
    }

    // 4. Remove all video elements from UI
    const localDiv = document.getElementById("local-video");
    if (localDiv) localDiv.innerHTML = "";
    const remoteDiv = document.getElementById("remote-videos");
    if (remoteDiv) remoteDiv.innerHTML = "";

    // 5. Reset state to home screen
    setJoined(false);
    setStep("initial");
    setRoomName("");
    setToken("");
    setChatMessages([]);
    setIdentityInput("");
    setRoomInput("");
    setJoinLinkInput("");
    setScheduleRoomInput("");
    setScheduleTimeInput("");
    setScheduleSuccess(null);
    setScheduledLink("");
  };
  // Screen sharing handler
  const handleScreenShare = async () => {
    if (!roomInstance) return;
    if (!isSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia();
        const screenTrack = stream.getTracks()[0];
        screenTrackRef.current = screenTrack;
        roomInstance.localParticipant.publishTrack(screenTrack);

        // Show screen in local video area
        const screenVideo = document.createElement("video");
        screenVideo.srcObject = new MediaStream([screenTrack]);
        screenVideo.autoplay = true;
        screenVideo.muted = true;
        screenVideo.style.width = "120px";
        screenVideo.style.borderRadius = "8px";
        screenVideo.style.margin = "4px";
        document.getElementById("local-video").appendChild(screenVideo);

        setIsSharing(true);

        screenTrack.onended = () => {
          roomInstance.localParticipant.unpublishTrack(screenTrack);
          setIsSharing(false);
          screenVideo.remove();
        };
      } catch (err) {
        // User cancelled screen share
      }
    } else {
      // Stop sharing
      if (screenTrackRef.current) {
        roomInstance.localParticipant.unpublishTrack(screenTrackRef.current);
        screenTrackRef.current.stop();
        setIsSharing(false);
        // Remove screen video element
        const localVideoDiv = document.getElementById("local-video");
        if (localVideoDiv) {
          Array.from(localVideoDiv.children).forEach((el) => {
            if (el.srcObject instanceof MediaStream) el.remove();
          });
        }
      }
    }
  };

  const handleCreateRoomPopup = () => {
    setRoomInput("");
    setPopup({ open: true, message: "", success: true });
    setStep("create");
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      // Call your backend to create a room and get the join link
      const res = await axios.post("http://localhost:8080/api/video/create-room", null, {
        params: { roomName: roomInput },
      });
      setPopup({
        open: true,
        message: "",
        success: true,
        link: res.data.joinUrl, // Make sure your backend returns joinUrl
      });
      setStep("created");
    } catch (err) {
      setPopup({
        open: true,
        message: "Failed to create room. It may already exist.",
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoomPopup = () => {
    setJoinLinkInput("");
    setIdentityInput("");
    setPopup({ open: true, message: "", success: true });
    setStep("join");
  };

  const handleJoinRoom = async () => {
    setLoading(true);
    setPopup({ open: false, message: "", success: false });
    try {
      const url = new URL(joinLinkInput);
      const roomNameParam = url.searchParams.get("roomName");
      if (!roomNameParam) throw new Error("Invalid join link");
      setRoomName(roomNameParam);

      const response = await axios.get("http://localhost:8080/api/video/generate-token", {
        params: { identity: identityInput, roomName: roomNameParam },
      });

      setToken(response.data.token);
      setJoined(true);
      setPopup({ open: false, message: "", success: true });
      setStep("connected");
    } catch (err) {
      // Check for backend error message
      const errorMsg =
        err.response?.data?.message ||
        "Failed to join room. Please check the link or try again.";
      setPopup({ open: true, message: errorMsg, success: false });
    } finally {
      setLoading(false);
    }
  };

  // Schedule Meeting handler
  const handleScheduleMeetingPopup = () => {
    setScheduleRoomInput("");
    setScheduleTimeInput("");
    setScheduleSuccess(null);
    setPopup({ open: true, message: "", success: true });
    setStep("schedule");
  };

  const handleScheduleMeeting = async () => {
    setScheduleLoading(true);
    setScheduleSuccess(null);
    setScheduledLink(""); // reset link
    try {
      const res = await axios.post("http://localhost:8080/api/video/schedule-meeting", {
        roomName: scheduleRoomInput,
        scheduledTime: scheduleTimeInput,
      });
      setScheduleSuccess(true);
      setScheduledLink(res.data.joinUrl); // set link from backend
    } catch (err) {
      setScheduleSuccess(false);
      setScheduledLink("");
    } finally {
      setScheduleLoading(false);
    }
  };

  const closePopup = () => setPopup({ ...popup, open: false });

  // Popup content rendering
  const renderPopupContent = () => {
    // Always show error popup if open and error
    if (popup.open && popup.message && popup.success === false) {
      return (
        <div className="text-red-700 font-semibold text-center">
          {popup.message}
          <div className="mt-4">
            <button
              onClick={() => {
                setPopup({ ...popup, open: false });
                setStep("initial"); // Reset to home page view
                // Optionally reset other state if needed
              }}
              className="bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    if (step === "create" && popup.open) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateRoom();
          }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-center mb-4 text-indigo-700 tracking-wide">
            Create a New Room
          </h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Enter room name"
            required
            className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <div className="flex space-x-6 justify-center">
            <button
              type="submit"
              disabled={!roomInput || loading}
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition duration-300"
            >
              {loading ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPopup({ open: false });
                setStep("initial");
              }}
              className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl shadow-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      );
    }
    if (step === "created" && popup.open) {
      return (
        <div>
          <h3 className="text-xl font-bold text-green-700 mb-4">Room Created!</h3>
          <div className="mb-4">
            <span className="font-semibold text-indigo-700">Share this link to join:</span>
            <br />
            <a
              href={popup.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline break-all font-semibold"
            >
              {popup.link}
            </a>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                closePopup();
                setStep("initial");
                setRoomInput("");
              }}
              className="bg-green-600 text-white font-bold py-2 px-8 rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 transition duration-300"
            >
              OK
            </button>
            <button
              onClick={() => {
                setPopup({ ...popup, open: false });
                setTimeout(() => {
                  setJoinLinkInput(popup.link || "");
                  setIdentityInput("");
                  setPopup({ open: true, message: "", success: true });
                  setStep("join");
                }, 200);
              }}
              className="bg-indigo-600 text-white font-bold py-2 px-8 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition duration-300"
            >
              Join Room
            </button>
          </div>
        </div>
      );
    }
    if (step === "join" && popup.open) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoinRoom();
          }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-center mb-4 text-indigo-700 tracking-wide">
            Join a Room
          </h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input
            value={identityInput}
            onChange={(e) => setIdentityInput(e.target.value)}
            placeholder="Your Name"
            required
            className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Paste Join Link</label>
          <input
            value={joinLinkInput}
            onChange={(e) => setJoinLinkInput(e.target.value)}
            placeholder="Paste join link here"
            required
            className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <div className="flex space-x-6 justify-center">
            <button
              type="submit"
              disabled={!identityInput || !joinLinkInput || loading}
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition duration-300"
            >
              {loading ? "Joining..." : "Join"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPopup({ open: false });
                setStep("initial");
              }}
              className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl shadow-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      );
    }
    if (step === "schedule" && popup.open) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScheduleMeeting();
          }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-bold text-center mb-4 text-indigo-700 tracking-wide">
            Schedule a Meeting
          </h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
          <input
            value={scheduleRoomInput}
            onChange={(e) => setScheduleRoomInput(e.target.value)}
            placeholder="Enter room name"
            required
            className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
          <input
            type="datetime-local"
            step="1"
            value={scheduleTimeInput}
            onChange={(e) => setScheduleTimeInput(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
          />
          {scheduleSuccess === true && (
            <div className="text-green-700 font-semibold">
              Meeting scheduled successfully!
              {scheduledLink && (
                <div
                  className="mt-2 whitespace-nowrap overflow-x-auto"
                  style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                >
                  Join Link:&nbsp;
                  <a
                    href={scheduledLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {scheduledLink}
                  </a>
                </div>
              )}
            </div>
          )}
          {scheduleSuccess === false && (
            <div className="text-red-700 font-semibold">Failed to schedule meeting.</div>
          )}
          <div className="flex space-x-6 justify-center">
            <button
              type="submit"
              disabled={!scheduleRoomInput || !scheduleTimeInput || scheduleLoading}
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition duration-300"
            >
              {scheduleLoading ? "Scheduling..." : "Schedule"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPopup({ open: false });
                setStep("initial");
              }}
              className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl shadow-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      );
    }
    return null;
  };

  // --- UI STARTS HERE ---
  return (
    <Layout>
      {/* Popup */}
      {popup.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xl border-4 border-indigo-300 animate-fadeIn">
            {renderPopupContent()}
          </div>
        </div>
      )}

      {/* Initial three buttons */}
      {step === "initial" && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-indigo-50 via-white to-blue-100 rounded-3xl shadow-2xl mx-auto max-w- px-6  py-20 animate-fadeIn">
          <div className="mb-12 mt-2 w-full px-2">
            <h1 className="text-5xl font-extrabold text-indigo-800 tracking-wide drop-shadow-lg text-center leading-tight">
              <span className="inline-block bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-700 bg-clip-text text-transparent">
                Video Meeting Room
              </span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <button
              onClick={handleCreateRoomPopup}
              className="flex flex-col items-center justify-center bg-white hover:bg-indigo-50 border-2 border-indigo-300 rounded-2xl shadow-xl py-10 px-6 transition-all duration-200 group"
            >
              <HiVideoCamera className="text-indigo-600 text-5xl mb-4 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-indigo-700 mb-2">Create Room</span>
              <span className="text-gray-500 text-base">Start a new meeting and invite others</span>
            </button>
            <button
              onClick={handleJoinRoomPopup}
              className="flex flex-col items-center justify-center bg-white hover:bg-green-50 border-2 border-green-300 rounded-2xl shadow-xl py-10 px-6 transition-all duration-200 group"
            >
              <HiUserGroup className="text-green-600 text-5xl mb-4 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-green-700 mb-2">Join Room</span>
              <span className="text-gray-500 text-base">Enter a link to join an existing meeting</span>
            </button>
            <button
              onClick={handleScheduleMeetingPopup}
              className="flex flex-col items-center justify-center bg-white hover:bg-yellow-50 border-2 border-yellow-300 rounded-2xl shadow-xl py-10 px-6 transition-all duration-200 group"
            >
              <FaChalkboardTeacher className="text-yellow-600 text-5xl mb-4 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-yellow-700 mb-2">Schedule Meeting</span>
              <span className="text-gray-500 text-base">Set up a meeting for later</span>
            </button>
          </div>
        </div>
      )}

      {/* Connected view */}
      {step === "connected" && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-100 via-white to-blue-200 flex flex-col z-40 overflow-auto animate-fadeIn">
          {/* Header */}
          <div className="w-full flex flex-col items-center pt-10 pb-4">
            <div className="flex items-center gap-4 mb-2">
              <span className="inline-flex items-center justify-center bg-indigo-500/10 rounded-full w-16 h-16 shadow-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
              </span>
              <h2 className="text-4xl font-extrabold text-indigo-900 tracking-wide drop-shadow-lg text-center">
                {roomName}
              </h2>
            </div>
            <div className="text-lg text-indigo-700 font-medium tracking-wide">
              Video Conference Room
            </div>
          </div>
          {/* Video Grid */}
          <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
              {/* Local video */}
              <div className="flex flex-col items-center bg-white/80 rounded-3xl border-4 border-indigo-300 shadow-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-lg text-indigo-700 font-semibold tracking-wide">You</span>
                </div>
                <div
                  id="local-video"
                  className="rounded-2xl overflow-hidden w-full border-2 border-indigo-200 shadow"
                  style={{
                    width: "100%",
                    height: 400,
                    minWidth: 320,
                    background: "#e3eafc",
                  }}
                ></div>
              </div>
              {/* Remote videos */}
              <div className="flex flex-col items-center bg-white/80 rounded-3xl border-4 border-blue-200 shadow-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
                  <span className="text-lg text-blue-700 font-semibold tracking-wide">Participants</span>
                </div>
                <div
                  id="remote-videos"
                  className="flex flex-wrap gap-6 justify-center items-center rounded-2xl"
                  style={{
                    minWidth: 320,
                    minHeight: 400,
                    background: "#f8faff",
                  }}
                ></div>
              </div>
            </div>
          </div>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center my-8">
            <button
              onClick={handleScreenShare}
              className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-all duration-200 text-lg tracking-wide ${isSharing ? "opacity-70" : ""
                }`}
            >
              {isSharing ? "Stop Sharing" : "Share Screen"}
            </button>
            <button
              onClick={handleDisconnect}
              className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-all duration-200 text-lg tracking-wide"
            >
              Disconnect
            </button>
          </div>
          {/* Chat Box */}
          <div className="bg-white/90 border-4 border-indigo-200 rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto mb-10">
            <h3 className="text-2xl font-bold text-indigo-700 mb-4 tracking-wide flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
              </svg>
              Chat
            </h3>
            <div className="h-48 overflow-y-auto mb-4 bg-indigo-50 rounded-xl p-3 text-left text-base shadow-inner" style={{ minHeight: 120 }}>
              {chatMessages.length === 0 && (
                <div className="text-gray-400 italic">No messages yet.</div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx}>
                  <span className="font-semibold text-indigo-700">{msg.sender}:</span>{" "}
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
            <form
              onSubmit={handleSendMessage}
              className="flex gap-3"
              autoComplete="off"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-lg"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold px-6 py-3 rounded-xl transition text-lg"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
      {/* --- END CONNECTED VIEW --- */}
    </Layout>
  );
}

export default MeetingRoom;

