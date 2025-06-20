import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { connect, createLocalVideoTrack, createLocalAudioTrack } from 'twilio-video';
import { LocalDataTrack } from 'twilio-video';
import { useNavigate } from 'react-router-dom'; // Add this import
import { HiVideoCamera, HiUserGroup } from "react-icons/hi2";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaMicrophoneSlash } from 'react-icons/fa';
import { FaMicrophone } from 'react-icons/fa';
import { MdMicOff } from 'react-icons/md';

const MeetingRoom = () => {
  const [identity, setIdentity] = useState('user-' + Math.floor(Math.random() * 1000));
  const [roomName, setRoomName] = useState('');
  const [room, setRoom] = useState(null);
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [joinUrl, setJoinUrl] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [enlargedVideo, setEnlargedVideo] = useState(null); // 'local' or participant identity
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const dataTrackRef = useRef(null);
  const navigate = useNavigate(); // Add this line

  const handleScheduleMeeting = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/video/schedule-meeting', {
        roomName,
        scheduledTime,
      });
      alert('Meeting Scheduled Successfully!');
      setJoinUrl(response.data.joinUrl);
    } catch (error) {
      console.error(error);
      alert('Failed to schedule meeting.');
    }
  };

  const createRoom = async () => {
    try {
      const res = await axios.post('http://localhost:8080/api/video/create-room', null, {
        params: { roomName },
      });
      setJoinUrl(res.data.joinUrl);
      setShowPopup(true);
    } catch (err) {
      // Enhanced error handling for new backend logic
      if (err.response) {
        const message = err.response.data.message?.toLowerCase() || "";
        if (err.response.status === 400 && message.includes("no scheduled meeting")) {
          alert("🚫 Cannot create room. No scheduled meeting found with this room name.");
        } else if (message) {
          alert(`🚫 ${err.response.data.message}`);
        } else {
          alert("🚫 Failed to create room.");
        }
      } else {
        alert("🚫 Failed to create room.");
      }
    }
  };
  const sendMessage = () => {
    if (message.trim() !== '' && dataTrackRef.current) {
      dataTrackRef.current.send(message);
      setChatMessages(prev => [...prev, { sender: 'You', text: message }]);
      setMessage('');
    }
  };
   const joinRoom = async () => {
  setIsJoining(true);
  try {
    const res = await axios.get('http://localhost:8080/api/video/generate-token', {
      params: { identity, roomName },
    });
    const token = res.data.token;
    const videoTrack = await createLocalVideoTrack();
    const audioTrack = await createLocalAudioTrack();

    localVideoTrackRef.current = videoTrack;
    localAudioTrackRef.current = audioTrack;

    dataTrackRef.current = new LocalDataTrack();

    const connectedRoom = await connect(token, {
      name: roomName,
      tracks: [videoTrack, audioTrack, dataTrackRef.current],
    });

    setRoom(connectedRoom);
    setJoined(true);
    setShowJoinPopup(false);
    setIsJoining(false);

    // Attach local video
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = '';
      localVideoRef.current.appendChild(videoTrack.attach());
    }

    // Attach remote participants
    const handleParticipant = (participant) => {
      setParticipants(prev => [...prev, participant.identity]);
      participant.tracks.forEach(publication => {
        if (publication.track) {
          attachTrack(publication.track, participant.identity);
        }
        if (publication.track?.kind === 'data') {
          publication.track.on('message', data => {
            setChatMessages(prev => [...prev, { sender: participant.identity, text: data }]);
          });
        }
      });
      participant.on('trackSubscribed', track => {
        if (track.kind === 'data') {
          track.on('message', data => {
            setChatMessages(prev => [...prev, { sender: participant.identity, text: data }]);
          });
        } else {
          attachTrack(track, participant.identity);
        }
      });
      participant.on('trackUnsubscribed', track => {
        detachTrack(track);
      });
    };

    connectedRoom.participants.forEach(handleParticipant);
    connectedRoom.on('participantConnected', handleParticipant);
    connectedRoom.on('participantDisconnected', participant => {
      participant.tracks.forEach(publication => {
        if (publication.track) {
          detachTrack(publication.track);
        }
      });
      setParticipants(prev => prev.filter(p => p !== participant.identity));
    });

    connectedRoom.on('disconnected', () => {
      connectedRoom.localParticipant.tracks.forEach(publication => {
        publication.track.stop();
        publication.track.detach().forEach(el => el.remove());
      });
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = '';
      }
      setJoined(false);
      setRoom(null);
      setParticipants([]);
    });

  } catch (err) {
    setIsJoining(false);
    // Enhanced error handling for new backend logic
    if (err.response) {
      const message = err.response.data.message?.toLowerCase() || "";
      if (err.response.status === 404 && message.includes("room does not exist")) {
        alert("🚫 Room does not exist. Please use a valid scheduled meeting link.");
      } else if (err.response.status === 400 && message.includes("not active")) {
        alert("🚫 Room is not active yet. Please wait for it to be created.");
      } else if (message) {
        alert(`🚫 ${err.response.data.message}`);
      } else {
        alert("🚫 Unable to join the room.");
      }
    } else {
      alert("🚫 Unable to join the room.");
    }
  }
};


  const leaveRoom = () => {
  if (room) {
    room.localParticipant.tracks.forEach(publication => {
      const track = publication.track;
      if (track && typeof track.stop === 'function') {
        track.stop();
        track.detach().forEach(el => el.remove());
      }
    });
    room.disconnect();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = '';
    }
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = '';
    }
    setRoom(null);
    setJoined(false);
    setParticipants([]);
    navigate('/meeting-room');
  }
};

  const toggleAudio = () => {
    if (localAudioTrackRef.current) {
      const enabled = !audioEnabled;
      localAudioTrackRef.current.enable(enabled);
      setAudioEnabled(enabled);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrackRef.current) {
      const enabled = !videoEnabled;
      localVideoTrackRef.current.enable(enabled);
      setVideoEnabled(enabled);
    }
  };

  const shareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia();
      const screenTrack = stream.getTracks()[0];

      room.localParticipant.publishTrack(screenTrack);

      screenTrack.onended = () => {
        room.localParticipant.unpublishTrack(screenTrack);
        screenTrack.stop();
      };
    } catch (err) {
      console.error('Screen sharing failed', err);
    }
  };

   const attachTrack = (track, identity) => {
  if (track.kind === 'video' || track.kind === 'audio') {
    const element = track.attach();
    if (track.kind === 'video' && identity) {
      element.dataset.identity = identity;
      element.style.cursor = 'pointer';
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.appendChild(element);
    }
  }
};
const detachTrack = (track) => {
  track.detach().forEach(el => el.remove());
};


// Helper to render enlarged video with thumbnails
// Helper to check if a participant (or local) is muted
const isAudioEnabled = (who) => {
  if (who === 'local') {
    return audioEnabled;
  }
  if (room) {
    const participant = Array.from(room.participants.values()).find(p => p.identity === who);
    if (participant) {
      const audioPub = Array.from(participant.audioTracks.values())[0];
      if (audioPub && audioPub.track) {
        return audioPub.track.isEnabled;
      }
    }
  }
  return false;
};

const EnlargedVideoModal = () => {
  if (!enlargedVideo) return null;

  // Helper to get video element for a participant
  const getVideoElement = (who) => {
    let videoElement = null;
    if (who === 'local' && localVideoTrackRef.current) {
      videoElement = localVideoTrackRef.current.attach();
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'contain';
      videoElement.style.transform = 'scaleX(-1)';
    } else if (room && who !== 'local') {
      const participant = Array.from(room.participants.values()).find(
        p => p.identity === who
      );
      if (participant) {
        const videoPub = Array.from(participant.videoTracks.values())[0];
        if (videoPub && videoPub.track) {
          videoElement = videoPub.track.attach();
          videoElement.style.width = '100%';
          videoElement.style.height = '100%';
          videoElement.style.objectFit = 'contain';
          videoElement.style.transform = 'scaleX(-1)';
        }
      }
    }
    return videoElement;
  };

  // Collect all video identities
  const remoteIdentities = room ? Array.from(room.participants.values()).map(p => p.identity) : [];
  const allVideos = ['local', ...remoteIdentities];

  // Main enlarged video
  const mainVideo = getVideoElement(enlargedVideo);

  // Thumbnails (all except enlarged)
  const thumbnails = allVideos.filter(id => id !== enlargedVideo);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-[100]"
      onClick={() => setEnlargedVideo(null)}
    >
      <div
        className="bg-black rounded-2xl shadow-2xl flex flex-col items-center justify-center relative"
        style={{ width: '80vw', height: '75vh', maxWidth: 900, maxHeight: 700 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Main Enlarged Video */}
        <div style={{ width: '100%', height: '80%', position: 'relative' }} className="flex items-center justify-center">
          {mainVideo && (
            <div style={{ width: '100%', height: '100%' }} ref={el => el && el.appendChild(mainVideo)} />
          )}
          {/* Mute/Unmute Icon for enlarged */}
          <div className="absolute top-4 left-4 bg-white/80 rounded-full p-2 shadow">
            {isAudioEnabled(enlargedVideo) ? (
              <FaMicrophone  className="text-green-600 text-2xl" title="Unmuted" />
            ) : (
              <MdMicOff   className="text-red-600 text-2xl" title="Muted" />
            )}
          </div>
        </div>
        {/* Thumbnails */}
        <div className="flex gap-4 mt-4 px-4 w-full justify-center">
          {thumbnails.map(id => {
            const thumb = getVideoElement(id);
            return (
              <div
                key={id}
                className="relative rounded-lg border-2 border-indigo-300 bg-black cursor-pointer"
                style={{ width: 120, height: 90, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setEnlargedVideo(id)}
                title={id === 'local' ? 'You' : id}
              >
                {thumb && (
                  <div style={{ width: '100%', height: '100%' }} ref={el => el && el.appendChild(thumb)} />
                )}
                {/* Mute/Unmute Icon for thumbnail */}
                <div className="absolute top-2 left-2 bg-white/80 rounded-full p-1 shadow">
                  {isAudioEnabled(id) ? (
                    <FaMicrophone  className="text-green-600 text-base" title="Unmuted" />
                  ) : (
                    <MdMicOff  className="text-red-600 text-base" title="Muted" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setEnlargedVideo(null)}
          className="absolute top-4 right-4 bg-white text-black rounded-full px-4 py-2 font-bold shadow hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

  // Attach local video after joining
  useEffect(() => {
    if (joined && localVideoTrackRef.current && localVideoRef.current) {
      localVideoRef.current.innerHTML = '';
      localVideoRef.current.appendChild(localVideoTrackRef.current.attach());
    }
  }, [joined]);

  return (
    <div>
      {/* POPUPS */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xl border-4 border-indigo-300 animate-fadeIn">
            <form
              onSubmit={e => {
                e.preventDefault();
                createRoom();
              }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-center mb-4 text-indigo-700 tracking-wide">
                Create a New Room
              </h2>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
              <input
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="Enter room name"
                required
                className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              />
              <div className="flex space-x-6 justify-center">
                <button
                  type="submit"
                  disabled={!roomName}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition duration-300"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePopup(false)}
                  className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl shadow-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xl border-4 border-indigo-300 animate-fadeIn">
            <form
              onSubmit={e => {
                e.preventDefault();
                joinRoom();
              }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-center mb-4 text-indigo-700 tracking-wide">
                Join a Room
              </h2>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                value={identity}
                onChange={e => setIdentity(e.target.value)}
                placeholder="Your Name"
                required
                className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
              <input
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="Room Name"
                required
                className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              />
              <div className="flex space-x-6 justify-center">
                <button
                  type="submit"
                  disabled={!identity || !roomName}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition duration-300"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinPopup(false)}
                  className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl shadow-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xl border-4 border-indigo-300 animate-fadeIn text-center">
            <h3 className="text-xl font-bold text-green-700 mb-4">Room Created!</h3>
            <div className="mb-4">
              <span className="font-semibold text-indigo-700">Share this link to join:</span>
              <br />
              <a
                href={joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline break-all font-semibold"
              >
                {joinUrl}
              </a>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-green-600 text-white font-bold py-2 px-8 rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 transition duration-300"
              >
                OK
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => {
                  setShowJoinPopup(false);   // Close Join Popup
                  setShowPopup(false);       // Close Link Popup
                  setShowCreatePopup(false); // ✅ Close Create Room Popup
                  setTimeout(() => {
                    joinRoom();              // Start meeting
                  }, 0);
                }}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xl border-4 border-indigo-300 animate-fadeIn">
            <form
              onSubmit={e => {
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
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="Enter room name"
                required
                className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              />
              {joinUrl && (
                <div className="text-green-700 font-semibold">
                  Meeting scheduled successfully!
                  <div
                    className="mt-2 whitespace-nowrap overflow-x-auto"
                    style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                  >
                    Join Link:&nbsp;
                    <a
                      href={joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {joinUrl}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex space-x-6 justify-center">
                <button
                  type="submit"
                  disabled={!roomName || !scheduledTime}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition duration-300"
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl shadow-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAIN BUTTONS */}
      {!joined && (
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
              onClick={() => setShowCreatePopup(true)}
              className="flex flex-col items-center justify-center bg-white hover:bg-indigo-50 border-2 border-indigo-300 rounded-2xl shadow-xl py-10 px-6 transition-all duration-200 group"
            >
              <HiVideoCamera className="text-indigo-600 text-5xl mb-4 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-indigo-700 mb-2">Create Room</span>
              <span className="text-gray-500 text-base">Start a new meeting and invite others</span>
            </button>
            <button
              onClick={() => setShowJoinPopup(true)}
              className="flex flex-col items-center justify-center bg-white hover:bg-green-50 border-2 border-green-300 rounded-2xl shadow-xl py-10 px-6 transition-all duration-200 group"
            >
              <HiUserGroup className="text-green-600 text-5xl mb-4 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-green-700 mb-2">Join Room</span>
              <span className="text-gray-500 text-base">Enter a room name to join an existing meeting</span>
            </button>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="flex flex-col items-center justify-center bg-white hover:bg-yellow-50 border-2 border-yellow-300 rounded-2xl shadow-xl py-10 px-6 transition-all duration-200 group"
            >
              <FaChalkboardTeacher className="text-yellow-600 text-5xl mb-4 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-yellow-700 mb-2">Schedule Meeting</span>
              <span className="text-gray-500 text-base">Set up a meeting for later</span>
            </button>
          </div>
        </div>
      )}

      {/* CONNECTED VIEW */}
      {joined && (
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
              <div
                className={`flex flex-col items-center bg-white/80 rounded-3xl border-4 border-indigo-300 shadow-2xl p-6 transition-all duration-300 ${
                  enlargedVideo && enlargedVideo !== 'local' ? 'scale-75 opacity-60 pointer-events-none' : 'scale-100 opacity-100'
                }`}
                style={{ zIndex: enlargedVideo === 'local' ? 50 : 1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-lg text-indigo-700 font-semibold tracking-wide">You</span>
                </div>
                <div
                  ref={localVideoRef}
                  className="relative rounded-2xl overflow-hidden w-full border-2 border-indigo-200 shadow"
                  style={{
                    width: "100%",
                    height: 400,
                    minWidth: 320,
                    background: "#e3eafc",
                    transform: "scaleX(-1)",
                    cursor: "pointer"
                  }}
                  onClick={() => setEnlargedVideo('local')}
                >
                  {/* Mute/Unmute Icon */}
                  <div className="absolute top-2 left-2 bg-white/80 rounded-full p-2 shadow">
                    {audioEnabled ? (
                      <FaMicrophone  className="text-green-600 text-xl" title="Unmuted" />
                    ) : (
                      <MdMicOff  className="text-red-600 text-xl" title="Muted" />
                    )}
                  </div>
                </div>
              </div>
              {/* Remote videos */}
              <div
                className={`flex flex-col items-center bg-white/80 rounded-3xl border-4 border-blue-200 shadow-2xl p-6 transition-all duration-300 ${
                  enlargedVideo && enlargedVideo !== 'local' ? 'scale-100 opacity-100 z-50' : (enlargedVideo ? 'scale-75 opacity-60 pointer-events-none' : 'scale-100 opacity-100')
                }`}
                style={{ zIndex: enlargedVideo && enlargedVideo !== 'local' ? 50 : 1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
                  <span className="text-lg text-blue-700 font-semibold tracking-wide">Participants</span>
                </div>
                <div
                  ref={remoteVideoRef}
                  className="flex flex-wrap gap-6 justify-center items-center rounded-2xl"
                  style={{
                    minWidth: 320,
                    minHeight: 400,
                    background: "#f8faff",
                    transform: "scaleX(-1)",
                    position: "relative"
                  }}
                  onClick={e => {
                    const video = e.target.closest('video');
                    if (video && video.dataset.identity) {
                      setEnlargedVideo(video.dataset.identity);
                    }
                  }}
                >
                  {/* Overlay icon for each remote participant */}
                  {room &&
                    Array.from(room.participants.values()).map(participant => (
                      <div key={participant.identity} className="absolute" style={{ pointerEvents: "none" }}>
                        <div className="absolute top-2 left-2 bg-white/80 rounded-full p-2 shadow z-10">
                          {isAudioEnabled(participant.identity) ? (
                            <FaMicrophone  className="text-green-600 text-xl" title="Unmuted" />
                          ) : (
                            <MdMicOff  className="text-red-600 text-xl" title="Muted" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center my-8">
            <button
              onClick={shareScreen}
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-all duration-200 text-lg tracking-wide"
            >
              Share Screen
            </button>
            <button
              onClick={leaveRoom}
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
            <div className="h-64 overflow-y-auto mb-4 bg-indigo-50 rounded-xl p-4 text-left text-base shadow-inner flex flex-col gap-2" style={{ minHeight: 120 }}>
              {chatMessages.length === 0 && (
                <div className="text-gray-400 italic text-center mt-10">No messages yet.</div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === identity || msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl shadow
            ${msg.sender === identity || msg.sender === 'You'
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-white text-indigo-800 border border-indigo-200 rounded-bl-none'
            }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-70">
                      {msg.sender === identity || msg.sender === 'You' ? 'You' : msg.sender}
                    </div>
                    <div className="break-words">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <form
              className="flex gap-3"
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-lg"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold px-6 py-3 rounded-xl transition text-lg"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {isJoining && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-4 rounded shadow text-center text-lg font-semibold">Joining Room...</div>
        </div>
      )}

      {enlargedVideo && <EnlargedVideoModal />}
    </div>
  );
};

export default MeetingRoom;

