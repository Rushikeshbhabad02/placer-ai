import { FaBars, FaBell, FaSearch, FaSignOutAlt, FaEllipsisH, FaCircle, FaUserCircle } from "react-icons/fa";
import { sanitizeProfilePhoto } from "../utils/images";

function Navbar({
  searchTerm,
  onSearchChange,
  notifications = [],
  unreadCount = notifications.length,
  showNotifications,
  onToggleNotifications,
  user,
  onLogout
}) {
  const profilePhoto = sanitizeProfilePhoto(user?.photo);

  return (
    <header className="topbar">
      <div className="brand-block">
        <button className="icon-button menu-button" type="button" aria-label="Open menu">
          <FaBars />
        </button>
        <div className="brand-logo-wrapper">
          <div className="brand-icon">PA</div>
          <h2 className="brand-text">
            PLACER<span className="ai-tag">-AI</span>
          </h2>
        </div>
      </div>

      <label className="search-box">
        <FaSearch />
        <input
          type="text"
          placeholder="Search jobs, skills, companies..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <div className="topbar-actions">
        <div className="notification-wrap">
          <button
            className="icon-button notification-button"
            type="button"
            onClick={onToggleNotifications}
            aria-label="Show notifications"
          >
            <FaBell />
            {unreadCount > 0 && <span>{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-menu">
              <div className="notification-header">
                <h3>Notifications</h3>
              </div>
              <div className="notification-body">
                {notifications.map((item, index) => (
                  <article className={`notification-item ${!item.read ? "unread" : ""}`} key={item.id || index}>
                    <div className="notification-dot">
                      {!item.read && <FaCircle />}
                    </div>
                    <div className="notification-avatar">
                      {item.senderPhoto ? (
                        <img src={item.senderPhoto} alt={item.sender} />
                      ) : (
                        <div className="avatar-placeholder">{item.sender?.slice(0, 1)}</div>
                      )}
                    </div>
                    <div className="notification-content">
                      <p>
                        <strong>{item.sender}</strong> {item.message}
                      </p>
                      {item.actionLabel && (
                        <button className="notification-action-btn" type="button">
                          {item.actionLabel}
                        </button>
                      )}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">{item.createdAt}</span>
                      <button className="icon-button menu-dots" type="button">
                        <FaEllipsisH />
                      </button>
                    </div>
                  </article>
                ))}
                {notifications.length === 0 && <div className="empty-notifications">All caught up.</div>}
              </div>
            </div>
          )}
        </div>

        <div className="user-chip">
          {profilePhoto ? (
            <img src={profilePhoto} alt={`${user?.name || "Student"} profile`} />
          ) : (
            <span className="user-photo-blank" aria-label="No profile photo" />
          )}
          <div>
            <strong>{user?.name || "Student"}</strong>
            <span>{user?.year || "Student"}</span>
          </div>
        </div>

        {onLogout && (
          <button className="icon-button" type="button" onClick={onLogout} title="Logout" aria-label="Logout">
            <FaSignOutAlt />
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;
