
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { MultiSelect } from "primereact/multiselect";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [formData, setFormData] = useState({
    techIds: [],
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    bloodGroup: "",
    educations: [{ courseName: "", instituteName: "", passingYearMonth: "" }],
    experiences: [{ companyName: "", startDate: "", endDate: "", message: "" }],
  });

  // === Add profileImageBase64 state here ===
  const [profileImage, setProfileImage] = useState(null);


  const [technologies, setTechnologies] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    axiosInstance
      .get("/technologies")
      .then((response) => {
        const techList = response.data?.data?.content;
        if (Array.isArray(techList)) {
          const formattedTechs = techList.map((tech) => ({
            label: tech.techName,
            value: tech.tech_id,
          }));
          setTechnologies(formattedTechs);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load technologies.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Education handlers
  const handleEducationChange = (index, field, value) => {
    const newEducations = [...formData.educations];
    newEducations[index][field] = value;
    setFormData((prev) => ({ ...prev, educations: newEducations }));
  };


  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educations: [...prev.educations, { courseName: "", instituteName: "", passingYearMonth: "" }]

    }));
  };

  const removeEducation = (index) => {
    const newEducations = [...formData.educations];
    newEducations.splice(index, 1);
    setFormData((prev) => ({ ...prev, educations: newEducations }));
  };

  // Experience handlers
  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...formData.experiences];
    updatedExperiences[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      experiences: updatedExperiences,
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { companyName: "", startDate: "", endDate: "", message: "" }],
    }));
  };

  const removeExperience = (index) => {
    const updated = [...formData.experiences];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, experiences: updated }));
  };

  // === Add profile image change handler ===
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".jpg") && !file.name.toLowerCase().endsWith(".png")) {
        alert("Only .jpg or .png files are allowed.");
        return;
      }
      setProfileImage(file);
    }
  };

  const convertToBackendFormat = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`; // dd-MM-yyyy
  };

  const isValidYear = (dateStr) => {
    if (!dateStr) return false;
    const year = dateStr.split("-")[0];
    return /^\d{4}$/.test(year);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidYear(formData.dob)) {
      setError("Date of Birth must have a 4-digit year.");
      return;
    }

    for (let i = 0; i < formData.experiences.length; i++) {
      const exp = formData.experiences[i];
      if (!isValidYear(exp.startDate) || !isValidYear(exp.endDate)) {
        setError(`Experience #${i + 1} dates must have a 4-digit year.`);
        return;
      }
    }

    const payload = {
      ...formData,
      dob: convertToBackendFormat(formData.dob),
      startDates: formData.experiences.map((e) => convertToBackendFormat(e.startDate)),
      endDates: formData.experiences.map((e) => convertToBackendFormat(e.endDate)),
      messages: formData.experiences.map((e) => e.message),
      companyNames: formData.experiences.map((e) => e.companyName),
      courseNames: formData.educations.map((ed) => ed.courseName),
      instituteNames: formData.educations.map((ed) => ed.instituteName),
      passingYearMonth: formData.educations.map((ed) => ed.passingYearMonth),
    };

    const formDataToSend = new FormData();
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });

    formDataToSend.append("profileDTO", blob);
    if (profileImage) {
      formDataToSend.append("profileImage", profileImage);
    }

    try {
      const response = await axiosInstance.put(`/profile/update`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setError("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">Update Profile</h2>

      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4 font-semibold">{error}</p>}
      {success && <p className="text-green-700 bg-green-100 p-3 rounded mb-4 font-semibold">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Technologies */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-gray-700">Select Technologies</label>
          <MultiSelect
            value={formData.techIds}
            onChange={(e) => setFormData({ ...formData, techIds: e.value })}
            options={technologies}
            placeholder="Select Technologies"
            display="chip"
            className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* === Add Profile Image Upload Field === */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-gray-700">Profile Image (JPG only)</label>
          <input
            type="file"
            accept=".jpg"
            onChange={handleProfileImageChange}
            className="border border-gray-300 p-2 rounded-md w-full"
          />
          {profileImage && (
            <img
              src={URL.createObjectURL(profileImage)}
              alt="Profile Preview"
              className="mt-3 h-32 w-32 rounded-full object-cover border"
            />
          )}

        </div>

        <div className="max-w-4xl mx-auto py-6">
          {/* First row: 3 fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input
                name="middleName"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Second row: 2 fields aligned under first two fields of above row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                placeholder="Date of Birth"
                value={formData.dob}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2"
                required
              >
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            {/* Empty to align */}
            <div></div>
          </div>

          {/* Education Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-indigo-700">Education</h3>
            {formData.educations.map((education, index) => (
              <div
                key={index}
                className="mb-4 border border-gray-300 p-4 rounded-lg shadow-sm bg-gray-50"
              >
                <label className="block text-sm font-bold text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="Course Name"
                  value={education.courseName}
                  onChange={(e) => handleEducationChange(index, "courseName", e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                  required
                />
                <label className="block text-sm font-bold text-gray-700 mb-1">Institute Name</label>
                <input
                  type="text"
                  placeholder="Institute Name"
                  value={education.instituteName}
                  onChange={(e) => handleEducationChange(index, "instituteName", e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                  required
                />
                <label className="block text-sm font-bold text-gray-700 mb-1">Passing Year</label>
                <input
                  type="month"
                  value={formData.educations[index].passingYearMonth || ""}
                  onChange={(e) => handleEducationChange(index, "passingYearMonth", e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                  required
                />

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove Education
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add Education
            </button>
          </div>

          {/* Experience Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-indigo-700">Experience</h3>
            {formData.experiences.map((experience, index) => (
              <div
                key={index}
                className="mb-4 border border-gray-300 p-4 rounded-lg shadow-sm bg-gray-50"
              >
                <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={experience.companyName}
                  onChange={(e) => handleExperienceChange(index, "companyName", e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                  required
                />
                <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={experience.startDate}
                  onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                  required
                />
                <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  placeholder="End Date"
                  value={experience.endDate}
                  onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                  required
                />
                <textarea
                  placeholder="Message"
                  value={experience.message}
                  onChange={(e) => handleExperienceChange(index, "message", e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove Experience
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add Experience
            </button>
          </div>

          {/* Submit button */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-8 py-3 rounded hover:bg-indigo-700 font-semibold text-lg"
            >
              Update Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;

