  

// import { useState, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   User,
//   Briefcase,
//   FileText,
//   Settings,
//   LogOut,
//   Terminal,
//   Menu,
//   X,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";

// const Layout = ({ children }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isMobileView, setIsMobileView] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isAdminOpen, setIsAdminOpen] = useState(false); // 🆕 Toggle admin dropdown
//   const [userRole, setUserRole] = useState(null);

//   // Check the user's role from the JWT token stored in localStorage
//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       try {
//         const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decoding JWT
//         setUserRole(decodedToken.roles || []); // Assuming 'roles' is an array in the token payload
//       } catch (e) {
//         console.error("Invalid token");
//       }
//     }
//   }, []);

//   // Check for mobile viewport on mount and window resize
//   useEffect(() => {
//     const checkForMobile = () => {
//       const isMobile = window.innerWidth < 768;
//       setIsMobileView(isMobile);
//       if (isMobile && !isSidebarOpen) {
//         setIsCollapsed(true);
//       }
//     };
//     checkForMobile();
//     window.addEventListener("resize", checkForMobile);
//     return () => window.removeEventListener("resize", checkForMobile);
//   }, [isSidebarOpen]);

//   // Close sidebar when navigating on mobile
//   useEffect(() => {
//     if (isMobileView) {
//       setIsSidebarOpen(false);
//     }
//   }, [location.pathname, isMobileView]);

//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//     if (isMobileView) {
//       setIsCollapsed(false);
//     }
//   };

//   // Main navItems (excluding admin sub-items)
//   const navItems = [
//     { path: "/dashboard", icon: <Briefcase size={20} />, text: "Dashboard" },
//     { path: "/profile", icon: <User size={20} />, text: "Profile" },
//     { path: "/profile/update", icon: <User size={20} />, text: "Update Profile" },
//     // { path: "/openings", icon: <Briefcase size={20} />, text: "Openings" },
//     { path: "/resume", icon: <FileText size={20} />, text: "Resume" },
//     { path: "/settings", icon: <Settings size={20} />, text: "Settings" },
//   ];

//   // Conditionally render Admin dropdown only for Admin users
//   const adminNavItems = [
//     <li key="admin">
//       <button
//         onClick={() => setIsAdminOpen(!isAdminOpen)}
//         className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 transition-colors text-left"
//       >
//         <span className="mr-3">
//           <User size={20} />
//         </span>
//         {!isCollapsed && <span>Admin</span>}
//         {!isCollapsed && (
//           <span className="ml-auto">
//             {isAdminOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//           </span>
//         )}
//       </button>

//       {!isCollapsed && isAdminOpen && (
//         <ul className="ml-6 mt-1 space-y-1">
//           <li>
//             <Link to="/roles" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Roles</Link>
//           </li>
//           <li>
//             <Link to="/user-roles" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">User Roles</Link>
//           </li>
//           <li>
//             <Link to="/users-list" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Users List</Link>
//           </li>
//           <li>
//             <Link to="/technologies" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Technologies</Link>
//           </li>
//           <li>
//             <Link to="/openings" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Openings</Link>
//           </li>
//         </ul>
//       )}
//     </li>
//   ];

//   // Desktop Sidebar
//   const DesktopSidebarContent = () => (
//     <>
//       <div className="flex items-center justify-between p-4 border-b border-indigo-700">
//         {!isCollapsed && <h1 className="text-xl font-bold">SRMS</h1>}
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="p-1 rounded-full hover:bg-indigo-700"
//         >
//           {isCollapsed ? (
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
//               viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M13 5l7 7-7 7M5 5l7 7-7 7" />
//             </svg>
//           ) : (
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
//               viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
//             </svg>
//           )}
//         </button>
//       </div>

//       <nav className="mt-6">
//         <ul className="space-y-2 px-2">
//           {navItems.map((item, index) => (
//             <li key={item.path}>
//               <Link
//                 to={item.path}
//                 className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors ${location.pathname === item.path ? "bg-indigo-700" : ""}`}
//               >
//                 <span className="mr-3">{item.icon}</span>
//                 {!isCollapsed && <span>{item.text}</span>}
//               </Link>
//             </li>
//           ))}
          
//           {/* Conditionally render admin dropdown */}
//           {userRole && userRole.includes("ADMIN") && adminNavItems}
          
//           <li>
//             <button
//               onClick={handleLogout}
//               className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 transition-colors text-left"
//             >
//               <span className="mr-3">
//                 <LogOut size={20} />
//               </span>
//               {!isCollapsed && <span>Logout</span>}
//             </button>
//           </li>
//         </ul>
//       </nav>
//     </>
//   );

//   // Mobile Sidebar
//   const MobileSidebarContent = () => (
//     <>
//       <div className="flex items-center justify-between p-4 border-b border-indigo-700">
//         <h1 className="text-xl font-bold">WEOTO HRM</h1>
//         <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-indigo-700">
//           <X size={24} />
//         </button>
//       </div>

//       <nav className="mt-6">
//         <ul className="space-y-2 px-2">
//           {navItems.map((item) => (
//             <li key={item.path}>
//               <Link
//                 to={item.path}
//                 className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors ${location.pathname === item.path ? "bg-indigo-700" : ""}`}
//               >
//                 <span className="mr-3">{item.icon}</span>
//                 <span>{item.text}</span>
//               </Link>
//             </li>
//           ))}

//           {/* Conditionally render Admin Dropdown for Mobile */}
//           {userRole && userRole.includes("ADMIN") && adminNavItems}

//           <li>
//             <button
//               onClick={handleLogout}
//               className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 transition-colors text-left"
//             >
//               <span className="mr-3">
//                 <LogOut size={20} />
//               </span>
//               <span>Logout</span>
//             </button>
//           </li>
//         </ul>
//       </nav>
//     </>
//   );

//   return (
//     <div className="flex h-screen bg-gray-100 relative">
//       {/* Mobile Header */}
//       {isMobileView && (
//         <div className="bg-indigo-800 text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-10">
//           <h1 className="text-xl font-bold">WEOTO HRM</h1>
//           <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-indigo-700">
//             <Menu size={24} />
//           </button>
//         </div>
//       )}

//       {/* Desktop Sidebar */}
//       {!isMobileView && (
//         <div
//           className={`bg-indigo-800 text-white transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
//         >
//           <DesktopSidebarContent />
//         </div>
//       )}

//       {/* Mobile Sidebar (Overlay) */}
//       {isMobileView && (
//         <>
//           {isSidebarOpen && (
//             <div
//               className="fixed inset-0 bg-black bg-opacity-50 z-20"
//               onClick={toggleSidebar}
//             ></div>
//           )}

//           <div
//             className={`fixed inset-y-0 left-0 z-30 bg-indigo-800 text-white w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
//           >
//             <MobileSidebarContent />
//           </div>
//         </>
//       )}

//       {/* Main Content */}
//       <div className={`flex-1 overflow-auto ${isMobileView ? "mt-16" : ""}`}>
//         <main className="p-6">{children}</main>
//       </div>
//     </div>
//   );
// };

// export default Layout;




import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserRole(decodedToken.roles || []);
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  useEffect(() => {
    const checkForMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      if (isMobile && !isSidebarOpen) {
        setIsCollapsed(true);
      }
    };
    checkForMobile();
    window.addEventListener("resize", checkForMobile);
    return () => window.removeEventListener("resize", checkForMobile);
  }, [isSidebarOpen]);

  
useEffect(() => {
  const fetchUserDetails = async () => {
    try {
      const response = await axiosInstance.get("/auth/Users/me");
      setUserDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch user details", error);
    }
  };

  fetchUserDetails();
}, []);

  useEffect(() => {
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobileView]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isMobileView) {
      setIsCollapsed(false);
    }
  };

  const navItems = [
    { path: "/dashboard", icon: <Briefcase size={20} />, text: "Dashboard" },
    { path: "/settings", icon: <Settings size={20} />, text: "Settings" },
  ];

  const adminNavItems = (
    <li key="admin">
      <button
        onClick={() => setIsAdminOpen(!isAdminOpen)}
        className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 transition-colors text-left"
      >
        <span className="mr-3">
          <User size={20} />
        </span>
        {!isCollapsed && <span>Admin</span>}
        {!isCollapsed && (
          <span className="ml-auto">
            {isAdminOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        )}
      </button>

      {!isCollapsed && isAdminOpen && (
        <ul className="ml-6 mt-1 space-y-1">
          <li>
            <Link to="/roles" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Roles</Link>
          </li>
          <li>
            <Link to="/user-roles" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">User Roles</Link>
          </li>
          <li>
            <Link to="/users-list" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Users List</Link>
          </li>
          <li>
            <Link to="/technologies" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Technologies</Link>
          </li>
          <li>
            <Link to="/openings" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Openings</Link>
          </li>
          <li>
            <Link to="/profile/update" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Update Profile</Link>
          </li>
          <li>
            <Link to="/profile" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Profile</Link>
          </li>
        </ul>
      )}
    </li>
  );

  const renderUserDropdown = () => (
    <li className="relative">
      <button
        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 transition-colors text-left"
      >
        <span className="mr-3">
          <User size={20} />
        </span>
        {!isCollapsed && <span>User</span>}
        {!isCollapsed && (
          <span className="ml-auto">
            {userDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        )}
      </button>
      {!isCollapsed && userDropdownOpen && (
        <ul className="ml-6 mt-1 space-y-1">
          <li>
            <Link to="/profile/update" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Update Profile</Link>
          </li>
          <li>
            <Link to="/profile" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Profile</Link>
          </li>
          <li>
            <Link to="/resume" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Resume</Link>
          </li>
          <li>
            <Link to="/openings" className="block px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Openings</Link>
          </li>
        </ul>
      )}
    </li>
  );

  const DesktopSidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-indigo-700">
        {!isCollapsed && <h1 className="text-xl font-bold">SRMS</h1>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-full hover:bg-indigo-700">
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors ${
                  location.pathname === item.path ? "bg-indigo-700" : ""
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {!isCollapsed && <span>{item.text}</span>}
              </Link>
            </li>
          ))}

          {!userRole.includes("ADMIN") && renderUserDropdown()}
          {userRole.includes("ADMIN") && adminNavItems}

          <li>
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 transition-colors text-left"
            >
              <span className="mr-3">
                <LogOut size={20} />
              </span>
              {!isCollapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );

  const MobileSidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-indigo-700">
        <h1 className="text-xl font-bold">SRMS</h1>
        <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-indigo-700">
          <X size={24} />
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors ${
                  location.pathname === item.path ? "bg-indigo-700" : ""
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.text}</span>
              </Link>
            </li>
          ))}

          {!userRole.includes("ADMIN") && renderUserDropdown()}
          {userRole.includes("ADMIN") && adminNavItems}

          <li>
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 transition-colors text-left"
            >
              <span className="mr-3">
                <LogOut size={20} />
              </span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {isMobileView && (
        <div className="bg-indigo-800 text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-10">
          <h1 className="text-xl font-bold">SRMS</h1>
          <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-indigo-700">
            <Menu size={24} />
          </button>
        </div>
      )}

      {!isMobileView && (
        <div
          className={`bg-indigo-800 text-white transition-all duration-300 ${
            isCollapsed ? "w-16" : "w-64"
          }`}
        >
          <DesktopSidebarContent />
        </div>
      )}

      {isMobileView && (
        <>
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={toggleSidebar}></div>
          )}
          <div
            className={`fixed inset-y-0 left-0 z-30 bg-indigo-800 text-white w-64 transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <MobileSidebarContent />
          </div>
        </>
      )}

      <div className={`flex-1 overflow-auto ${isMobileView ? "mt-16" : ""}`}>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
