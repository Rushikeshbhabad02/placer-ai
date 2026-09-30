import React from "react";
import {
  FaBell,
  FaBriefcase,
  FaCog,
  FaFileAlt,
  FaHome,
  FaRobot,
  FaUser,
  FaFileContract,
  FaMicrophone,
  FaUserTie,
  FaChartLine,
  FaSearch,
  FaClipboardList,
  FaCalendarCheck
} from "react-icons/fa";

const menu = [
  { name: "Dashboard", icon: <FaHome /> },
  { name: "Profile", icon: <FaUser /> },
  { name: "Jobs", icon: <FaBriefcase /> },
  { name: "My Applications", icon: <FaFileAlt /> },
  { name: "AI Recommendations", icon: <FaRobot /> },
  { name: "AI Assistant", icon: <FaRobot /> },
  { name: "Skill Gap Analysis", icon: <FaChartLine /> },
  { name: "Resume & ATS", icon: <FaFileContract /> },
  { name: "AI Job Search", icon: <FaSearch /> },
  { name: "Interviews", icon: <FaCalendarCheck /> },
  { name: "Assessments", icon: <FaClipboardList /> },
  { name: "Mock Interviews", icon: <FaMicrophone /> },
  { name: "Mentors", icon: <FaUserTie /> },
  { name: "Documents", icon: <FaFileAlt /> },
  { name: "Notifications", icon: <FaBell /> },
  { name: "Settings", icon: <FaCog /> }
];

function Sidebar({ active, onChange, notificationCount = 0 }) {
  return (
    <aside className="sidebar">
      <nav>
        {menu.map((item) => (
          <button
            key={item.name}
            className={active === item.name ? "active" : ""}
            onClick={() => onChange(item.name)}
            type="button"
          >
            <span className="menu-left">
              {item.icon}
              <span>{item.name}</span>
            </span>
            {item.name === "Notifications" && notificationCount > 0 && (
              <span className="menu-badge">{notificationCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">PLACER-AI</div>
    </aside>
  );
}

export default Sidebar;
