// import React, { useEffect, useState } from "react";
// import axiosInstance from "../utils/axiosInstance";

// const UserRoles = () => {
//   const [users, setUsers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [userRoles, setUserRoles] = useState([]);
//   const [formData, setFormData] = useState({
//     userId: "",
//     roleId: ""
//   });
//   const [editUserId, setEditUserId] = useState(null);
//   const [isEdit, setIsEdit] = useState(false);
//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");

//   const fetchAllData = async () => {
//     try {
//       // Fetch users, roles, and user-role mappings from the backend
//       const [userRes, roleRes, userRoleRes] = await Promise.all([
//        axiosInstance.get("/admin/users"), // Fetch all users
//       axiosInstance.get("/roles"), // Fetch all roles
//       axiosInstance.get("/admin/user-roles") // Fetch all user-role assignments
//       ]);
//       setUsers(userRes.data.data || []);
//       setRoles(roleRes.data.data || []);
//       setUserRoles(userRoleRes.data.data || []);
//     } catch (err) {
//       console.error("Error fetching data", err);
//       setError("Failed to load data.");
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (isEdit) {
//         // Update role for the user
//         await axiosInstance.put("/admin/users/update-role", {
//           userId: editUserId,
//           roleId: formData.roleId // The roleId will be updated
//         });
//         setSuccess("User role updated successfully.");
//       } else {
//         // Assign role to user
//         await axiosInstance.post("/admin/users/assign-role", {
//           userId: formData.userId,
//           roleId: formData.roleId // The roleId will be assigned
//         });
//         setSuccess("Role assigned to user successfully.");
//       }
//       setFormData({ userId: "", roleId: "" });
//       setIsEdit(false);
//       setEditUserId(null);
//       fetchAllData();
//     } catch (err) {
//       console.error("Error submitting form", err);
//       setError("Operation failed.");
//     }
//   };

//   const handleEdit = (roleEntry) => {
//     setFormData({
//       userId: roleEntry.userId,
//       roleId: roleEntry.roleId
//     });
//     setEditUserId(roleEntry.userId);
//     setIsEdit(true);
//   };

//   const handleDelete = async (roleEntry) => {
//     try {
//       // Delete role from user
//       await axiosInstance.delete("/admin/users/remove-role", {
//         params: {
//           userId: roleEntry.userId,
//           roleId: roleEntry.roleId
//         }
//       });
//       setSuccess("Role removed from user.");
//       fetchAllData();
//     } catch (err) {
//       console.error("Delete failed", err);
//       setError("Failed to remove role.");
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">User Role Management</h1>

//       {success && <p className="text-green-600 mb-4">{success}</p>}
//       {error && <p className="text-red-600 mb-4">{error}</p>}

//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8"
//       >
//         <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Role" : "Assign Role"}</h2>

//         <select
//           name="userId"
//           value={formData.userId}
//           onChange={handleChange}
//           required={!isEdit}
//           disabled={isEdit}
//           className="w-full p-2 mb-4 border rounded"
//         >
//           <option value="">Select User</option>
//           {users.map((user) => (
//             <option key={user.userId} value={user.userId}>
//               {user.username} ({user.userId})
//             </option>
//           ))}
//         </select>

//         <select
//           name="roleId"
//           value={formData.roleId}
//           onChange={handleChange}
//           required
//           className="w-full p-2 mb-4 border rounded"
//         >
//           <option value="">Select Role</option>
//           {roles.map((role) => (
//             <option key={role.roleId} value={role.roleId}>
//               {role.roleName} ({role.roleId})
//             </option>
//           ))}
//         </select>

//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
//         >
//           {isEdit ? "Update Role" : "Assign Role"}
//         </button>
//       </form>

//       <div className="bg-white p-6 rounded shadow-md">
//         <h2 className="text-xl font-semibold mb-4">Assigned Roles</h2>
//         {userRoles.length === 0 ? (
//           <p>No roles assigned.</p>
//         ) : (
//           <ul className="space-y-4">
//             {userRoles.map((ur, index) => {
//               const user = users.find((u) => u.userId === ur.userId);
//               const role = roles.find((r) => r.roleId === ur.roleId);
//               return (
//                 <li
//                   key={index}
//                   className="flex justify-between items-center border-b pb-2"
//                 >
//                   <div>
//                     <p>
//                       <strong>{user?.username}</strong> - {role?.roleName}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       User ID: {ur.userId}, Role ID: {ur.roleId}
//                     </p>
//                   </div>
//                   <div className="space-x-2">
//                     <button
//                       className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
//                       onClick={() => handleEdit(ur)}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
//                       onClick={() => handleDelete(ur)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserRoles;




import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const UserRoles = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [formData, setFormData] = useState({
    userId: "",
    roleId: ""
  });
  const [editUserId, setEditUserId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchAllData = async () => {
    try {
      const [userRes, roleRes, userRoleRes] = await Promise.all([
        axiosInstance.get("/auth/Users"),  // Updated API path for users
        axiosInstance.get("/roles"),      // Updated API path for roles
        //axiosInstance.get("/admin/user-roles") // Keeping this as it is (confirm with backend)
      ]);
      setUsers(userRes.data.data || []);
      setRoles(roleRes.data.data || []);
      setUserRoles(userRoleRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
      setError("Failed to load data.");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // Update role for the user
        await axiosInstance.put("/admin/users/update-role", {
          userId: editUserId,
          roleId: formData.roleId // The roleId will be updated
        });
        setSuccess("User role updated successfully.");
      } else {
        // Assign role to user
        await axiosInstance.post("/admin/users/assign-role", {
          userId: formData.userId,
          roleId: formData.roleId // The roleId will be assigned
        });
        setSuccess("Role assigned to user successfully.");
      }
      setFormData({ userId: "", roleId: "" });
      setIsEdit(false);
      setEditUserId(null);
      fetchAllData();
    } catch (err) {
      console.error("Error submitting form", err);
      setError("Operation failed.");
    }
  };

  const handleEdit = (roleEntry) => {
    setFormData({
      userId: roleEntry.userId,
      roleId: roleEntry.roleId
    });
    setEditUserId(roleEntry.userId);
    setIsEdit(true);
  };

  const handleDelete = async (roleEntry) => {
    try {
      // Delete role from user
      await axiosInstance.delete("/admin/users/remove-role", {
        params: {
          userId: roleEntry.userId,
          roleId: roleEntry.roleId
        }
      });
      setSuccess("Role removed from user.");
      fetchAllData();
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to remove role.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Role Management</h1>

      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Role" : "Assign Role"}</h2>

        <select
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          required={!isEdit}
          disabled={isEdit}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.username} ({user.userId})
            </option>
          ))}
        </select>

        <select
          name="roleId"
          value={formData.roleId}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.roleId} value={role.roleId}>
              {role.roleName} ({role.roleId})
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {isEdit ? "Update Role" : "Assign Role"}
        </button>
      </form>

      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">Assigned Roles</h2>
        {userRoles.length === 0 ? (
          <p>No roles assigned.</p>
        ) : (
          <ul className="space-y-4">
            {userRoles.map((ur, index) => {
              const user = users.find((u) => u.userId === ur.userId);
              const role = roles.find((r) => r.roleId === ur.roleId);
              return (
                <li
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p>
                      <strong>{user?.username}</strong> - {role?.roleName}
                    </p>
                    <p className="text-sm text-gray-500">
                      User ID: {ur.userId}, Role ID: {ur.roleId}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(ur)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => handleDelete(ur)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserRoles;
