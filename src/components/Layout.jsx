import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
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
import {
  FaUserShield,
  FaUsersCog,
  FaUsers,
  FaLaptopCode,
  FaBriefcase,
  FaUserEdit,
  FaUser,
  FaFileAlt,
  FaVideo ,
  FaUnlockAlt,
  FaCalendarCheck,
  FaRegCalendarAlt,
} from "react-icons/fa";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isInterviewerOpen, setIsInterviewerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserRole(decodedToken.roles || []);
        setUsername(decodedToken.username || "");
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

  // Define all possible nav items with allowed roles
  const allNavItems = [
    { path: "/dashboard", icon: <Briefcase size={20} />, text: "Dashboard", roles: ["ADMIN", "USER", "INTERVIEWER"] },
    { path: "/roles", icon: <FaUserShield className="mr-2" size={16} />, text: "Roles", roles: ["ADMIN"] },
    { path: "/user-roles", icon: <FaUsersCog className="mr-2" size={16} />, text: "User Roles", roles: ["ADMIN"] },
    { path: "/users-list", icon: <FaUsers className="mr-2" size={16} />, text: "Users List", roles: ["ADMIN"] },
    { path: "/technologies", icon: <FaLaptopCode className="mr-2" size={16} />, text: "Technologies", roles: ["ADMIN", "USER", "INTERVIEWER"] },
    { path: "/openings", icon: <FaBriefcase className="mr-2" size={16} />, text: "Openings", roles: ["ADMIN", "USER", "INTERVIEWER"] },
    { path: "/profile/update", icon: <FaUserEdit className="mr-2" size={16} />, text: "Update Profile", roles: ["ADMIN", "USER", "INTERVIEWER"] },
    { path: "/profile", icon: <FaUser className="mr-2" size={16} />, text: "Profile", roles: ["ADMIN", "USER", "INTERVIEWER"] },
    { path: "/applications", icon: <FaFileAlt className="mr-2" size={16} />, text: "Applications", roles: ["ADMIN", "USER", "INTERVIEWER"] },
    { path: "/InterviewQuestionModule", icon: <FaUserEdit className="mr-2" size={16} />, text: "Interview Questions", roles: ["ADMIN", "INTERVIEWER"] },
    { path: "/offer-letter", icon: <FaFileAlt className="mr-2" size={16} />, text: "Offer Letter", roles: ["ADMIN"] },
    { path: "/meeting-room", icon: <FaVideo  className="mr-2" size={16} />, text: "Video Conferencing", roles:  ["ADMIN", "USER", "INTERVIEWER"] },
    { path: "/interviews", icon: <FaUserShield className="mr-2" size={16} />, text: "Interviews", roles: ["ADMIN", "USER", "INTERVIEWER"] },
    { path: "/schedule-interview", icon: <FaCalendarCheck className="mr-2" size={16} />, text: "Interview Schedule", roles: ["ADMIN", "INTERVIEWER"] },
    { path: "/user-technologies", icon: <FaCalendarCheck className="mr-2" size={16} />, text: "User Technologies", roles: ["ADMIN"] },
    { path: "/forgot-password", icon: <FaUnlockAlt className="mr-2" size={16} />, text: "Forgot Password", roles: ["ADMIN", "USER", "INTERVIEWER"] },
     { path: "/calender", icon: <FaRegCalendarAlt className="mr-2" size={16} />, text: "Calender", roles:["ADMIN", "USER", "INTERVIEWER"] },
  ];

  // Helper to check if user has access to a nav item
  const hasAccess = (item) => item.roles.some((role) => userRole.includes(role));

  const renderSettingsDropdown = () => (
    <li className="relative">
      <button
        onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
        className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 transition-colors text-left"
      >
        <span className="mr-3">
          <Settings size={20} />
        </span>
        {!isCollapsed && <span>Settings</span>}
        {!isCollapsed && (
          <span className="ml-auto">
            {settingsDropdownOpen ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </span>
        )}
      </button>
      {!isCollapsed && settingsDropdownOpen && (
        <ul className="ml-6 mt-1 space-y-1">
          <li>
            <Link
              to="/forgot-password"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUnlockAlt className="mr-2" size={16} />
              Forgot Password
            </Link>
          </li>
        </ul>
      )}
    </li>
  );

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
        <ul>
          <li>
            <Link
              to="/roles"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUserShield className="mr-2" size={16} />
              Roles
            </Link>
          </li>
         
          <li>
            <Link
              to="/user-roles"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUsersCog className="mr-2" size={16} />
              User Roles
            </Link>
          </li>
          <li>
            <Link
              to="/calender"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              < FaRegCalendarAlt className="mr-2" size={16} />
             Calender
            </Link>
          </li>
           <li>
            <Link
              to="/InterviewQuestionModule"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUserEdit className="mr-2" size={16} />
              InterView Questions
            </Link>
          </li>
           <li>
              <Link
                to="/offer-letter"
                onClick={toggleSidebar}
                className="flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FaFileAlt className="mr-2" size={16} />
                OfferLetter
              </Link>
              </li>
               <li>
              <Link
                to="/meeting-room"
                onClick={toggleSidebar}
                className="flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FaFileAlt className="mr-2" size={16} />
                Video Conferencing
              </Link>
            </li>
          {/* <li>
            <Link
              to="/questions"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUsersCog className="mr-2" size={16} />
              Question
            </Link>
          </li> */}
          <li>
            <Link
              to="/users-list"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUsers className="mr-2" size={16} />
              Users List
            </Link>
          </li>
          <li>
            <Link
              to="/technologies"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaLaptopCode className="mr-2" size={16} />
              Technologies
            </Link>
          </li>
          <li>
            <Link
              to="/openings"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaBriefcase className="mr-2" size={16} />
              Openings
            </Link>
          </li>
          <li>
            <Link
              to="/profile/update"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUserEdit className="mr-2" size={16} />
              Update Profile
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUser className="mr-2" size={16} />
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/applications"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaFileAlt className="mr-2" size={16} />
              Applications
            </Link>
          </li>
          <li>
            <Link
              to="/interviews"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUserShield className="mr-2" size={16} />
              Interviews
            </Link>
          </li>
          <li>
            <Link
              to="/schedule-interview"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaCalendarCheck className="mr-2" size={16} />
              Interview Schedule
            </Link>
          </li>
          <li>
            <Link
              to="/user-technologies"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaCalendarCheck className="mr-2" size={16} />
              User Technologies
            </Link>
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
            <Link
              to="/profile/update"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUserEdit className="mr-2" size={16} />
              Update Profile
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUser className="mr-2" size={16} />
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/openings"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaBriefcase className="mr-2" size={16} />
              Openings
            </Link>
          </li>
          <li>
            <Link
              to="/technologies"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaLaptopCode className="mr-2" size={16} />
              Technologies
            </Link>
          </li>
          
          <li>
            <Link
              to="/calender"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              < FaRegCalendarAlt className="mr-2" size={16} />
             Calender
            </Link>
          </li>
          <li>
            <Link
              to="/applications"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaFileAlt className="mr-2" size={16} />
              Applications
            </Link>
          </li>
           <li>
            <Link
              to="/interviews"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUserShield className="mr-2" size={16} />
              Interviews
            </Link>
          </li>
        </ul>
      )}
    </li>
  );
  const renderInterviewerDropdown = () => (
    <li className="relative">
      <button
        onClick={() => setIsInterviewerOpen(!isInterviewerOpen)}
        className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 transition-colors text-left"
      >
        <span className="mr-3">
          <FaUserShield size={20} />
        </span>
        {!isCollapsed && <span>Interviewer</span>}
        {!isCollapsed && (
          <span className="ml-auto">
            {isInterviewerOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        )}
      </button>
      {!isCollapsed && isInterviewerOpen && (
        <ul className="ml-6 mt-1 space-y-1">
           <li>
            <Link
              to="/profile/update"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUserEdit className="mr-2" size={16} />
              Update Profile
            </Link>
          </li>
           <li>
            <Link
              to="/InterviewQuestionModule"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUserEdit className="mr-2" size={16} />
              InterView Questions
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUser className="mr-2" size={16} />
              Profile
            </Link>
          </li>
           <li>
              <Link
                to="/openings"
                onClick={toggleSidebar}
                className="flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FaBriefcase className="mr-2" size={16} />
                Openings
              </Link>
            </li>
            
          {/* <li>
            <Link
              to="/questions"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUsersCog className="mr-2" size={16} />
              Question Answers
            </Link>
          </li> */}
          <li>
            <Link
              to="/applications"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaFileAlt className="mr-2" size={16} />
              Applications
            </Link>
          </li>
          <li>
            <Link
              to="/schedule-interview"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaCalendarCheck className="mr-2" size={16} />
              Interview Schedule
            </Link>
          </li>
           <li>
            <Link
              to="/interviews"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <FaUserShield className="mr-2" size={16} />
              Interviews
            </Link>
          </li>
        </ul>
      )}
    </li>
  );

  // Get sorted nav items (no grouping)
  const sortedNavItems = allNavItems
    .filter((item) => item.path !== "/forgot-password")
    .filter(hasAccess)
    .sort((a, b) => a.text.localeCompare(b.text));

  // Helper: group nav items by first letter
  const groupedNavItems = allNavItems
    .filter((item) => item.path !== "/forgot-password")
    .filter(hasAccess)
    .sort((a, b) => a.text.localeCompare(b.text))
    .reduce((acc, item) => {
      const letter = item.text[0].toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(item);
      return acc;
    }, {});

  const DesktopSidebarContent = () => (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-indigo-700 shrink-0">
        {!isCollapsed && (
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">SRMS</h1>
            {username && (
              <span className="text-xxl font-bold text-indigo-100 mt-1 truncate max-w-[200px]">
                Welcome, {username}
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full hover:bg-indigo-700"
        >
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {/* Scrollable Nav Section with hidden scrollbar */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-hidden">
        <nav className="mt-4">
          <ul>
            {Object.keys(groupedNavItems).sort().map((letter) => (
              <li key={letter}>
                {/* <div className="px-3 py-1 text-xs font-bold text-indigo-300 uppercase">{letter}</div> */}
                <ul>
                  {groupedNavItems[letter].map(({ path, icon, text }) => (
                    <li key={path}>
                      <Link
                        to={path}
                        className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors ${location.pathname === path ? "bg-indigo-700" : ""}`}
                      >
                        <span className="mr-3">{icon}</span>
                        {!isCollapsed && <span>{text}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            {renderSettingsDropdown()}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors w-full text-left"
              >
                <LogOut size={20} className="mr-3" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );

  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full w-64 bg-indigo-900 text-white shadow-lg z-50 fixed top-0 left-0 overflow-y-auto">
      <div className="flex flex-col p-4 border-b border-indigo-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">SRMS</h1>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-indigo-700"
          >
            <X size={24} />
          </button>
        </div>
        {username && (
          <span className="text-sm text-indigo-300 mt-1 truncate max-w-full">
            Welcome, {username}
          </span>
        )}
      </div>

      <nav className="mt-6 flex-grow">
        <ul>
          {/* Always show Dashboard first if user has access */}
          {hasAccess(allNavItems[0]) && (
            <li key={allNavItems[0].path}>
              <Link
                to={allNavItems[0].path}
                onClick={toggleSidebar}
                className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors ${location.pathname === allNavItems[0].path ? "bg-indigo-700" : ""}`}
              >
                <span className="mr-3">{allNavItems[0].icon}</span>
                <span>{allNavItems[0].text}</span>
              </Link>
            </li>
          )}
          {/* Render the rest, except Dashboard */}
          {sortedNavItems
            .filter((item) => item.path !== "/dashboard")
            .map(({ path, icon, text }) => (
              <li key={path}>
                <Link
                  to={path}
                  onClick={toggleSidebar}
                  className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors ${location.pathname === path ? "bg-indigo-700" : ""}`}
                >
                  <span className="mr-3">{icon}</span>
                  <span>{text}</span>
                </Link>
              </li>
            ))}
          {renderSettingsDropdown()}
          <li>
            <button
              onClick={() => {
                handleLogout();
                toggleSidebar();
              }}
              className="flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors w-full text-left"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Top Navbar */}
      <header className="bg-indigo-900 text-white p-3 flex items-center justify-between md:hidden">
        <button onClick={toggleSidebar} className="p-2 rounded hover:bg-indigo-700">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold">SRMS</h1>
        <div className="w-8" /> {/* spacer */}
      </header>

      {/* Sidebar */}
      <aside
        className={`bg-indigo-900 text-white fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out z-40 ${isMobileView
          ? isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
          : isCollapsed
            ? "w-16"
            : "w-64"
          }`}
        style={{ minHeight: "100vh" }}
      >
        {isMobileView ? <MobileSidebarContent /> : <DesktopSidebarContent />}
      </aside>

      {/* Main Content */}
      <main
        className={`ml-0 md:ml-${isCollapsed ? "16" : "64"} p-6 transition-all duration-300 ease-in-out`}
        style={{ marginLeft: isMobileView ? 0 : isCollapsed ? "4rem" : "16rem" }}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;


