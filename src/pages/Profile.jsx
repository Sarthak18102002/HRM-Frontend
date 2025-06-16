
  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import axiosInstance from "../utils/axiosInstance";
  import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

  const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Extract just the filename from full path string
    const extractFilename = (fullPath) => {
      if (!fullPath) return null;
      return fullPath.split(/[/\\]/).pop();
    };

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await axiosInstance.get("/auth/Users/me");
          setUser(response.data?.data);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch user data.");
        }
      };

      fetchUser();
    }, []);

    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-10 transition-shadow duration-300 hover:shadow-2xl">
          {error && (
            <p className="mb-6 text-center text-red-600 font-semibold">{error}</p>
          )}

          {user ? (
            <>
              {/* Profile Details Heading */}
              <h2 className="text-4xl font-bold text-center text-indigo-600 mb-4">
                Profile Details
              </h2>

              {/* Profile Image */}
              {user.profileImage && (
                <div className="flex justify-center mb-6">
                  <img
                    src={`http://localhost:8080/uploads/profile-pictures/${extractFilename(
                      user.profileImage
                    )}`}
                    alt="Profile"
                    className="w-50 h-50 rounded-full object-cover border-4 border-indigo-300 shadow-md"
                  />
                </div>
              )}

              {/* Centered full name */}
              <h1 className="text-3xl font-extrabold text-center mb-10 text-indigo-700 tracking-wide">
                {user.firstName} {user.middleName} {user.lastName}
              </h1>

              {/* Details list */}
              <div className="space-y-6">
                {[
                  {
                    label: "Email",
                    value: (
                      <span className="flex items-center space-x-2">
                        <span>{user.email}</span>
                        {user.emailVerified ? (
                          <FaCheckCircle className="text-green-500" title="Verified" />
                        ) : (
                          <FaTimesCircle className="text-red-500" title="Not Verified" />
                        )}
                      </span>
                    ),
                  },
                  { label: "Username", value: user.username },
                  { label: "Mobile No", value: user.mobileNo || "N/A" },
                  { label: "Blood Group", value: user.bloodGroup || "N/A" },
                  { label: "Date of Birth", value: user.dob || "N/A" },
                  { label: "Roles", value: user.roles.join(", ") },
                  { label: "Status", value: user.status || "N/A" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between border-b border-indigo-200 pb-3 cursor-default hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    <span className="font-semibold text-indigo-600">{label}</span>
                    <span className="text-indigo-900">{value}</span>
                  </div>
                ))}
              </div>

              {/* Update Profile Button */}
              <div className="mt-10 text-center">
                <button
                  onClick={() => navigate("/profile/update")}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-indigo-600 text-lg font-medium animate-pulse">
              Loading...
            </p>
          )}
        </div>
      </div>
    );
  };

  export default Profile;
