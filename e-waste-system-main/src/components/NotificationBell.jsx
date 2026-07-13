import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Trash2, Check, CheckCheck, X } from "lucide-react";
import api from "../services/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  
  const dropdownRef = useRef(null);
  const lastNotifIdsRef = useRef(new Set());
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const data = res.data;
      setNotifications(data);

      // Detect any new unread notifications that were not present before
      if (lastNotifIdsRef.current.size > 0) {
        const newUnread = data.filter(n => !n.isRead && !lastNotifIdsRef.current.has(n.id));
        if (newUnread.length > 0) {
          const latest = newUnread[0];
          setActiveToast({
            title: latest.title,
            description: latest.description,
            id: latest.id
          });
          // Auto dismiss after 4 seconds
          setTimeout(() => {
            setActiveToast(null);
          }, 4000);
        }
      }

      // Sync notification IDs history
      const currentIds = new Set(data.map(n => n.id));
      lastNotifIdsRef.current = currentIds;

      const countRes = await api.get("/notifications/unread-count");
      setUnreadCount(countRes.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for notifications in the background every 10 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 10000);

    // Event listener for click outside to close dropdown
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
      } catch (err) {
        console.error(err);
      }
    }
    setIsOpen(false);
    fetchNotifications();
    
    // Redirect to my requests or specific request detail
    if (localStorage.getItem("role") === "ADMIN" && notif.requestId) {
      navigate(`/admin/request/${notif.requestId}`);
    } else {
      navigate("/user/my-requests");
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 hover:text-emerald-700 transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3.5 w-80 bg-white rounded-3xl border border-gray-100 shadow-2xl z-50 overflow-hidden py-1 animate-slide-in">
          {/* Header */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-gray-400 font-medium">
                No notifications found.
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-5 py-3.5 border-b border-gray-50 flex gap-3 hover:bg-gray-50 cursor-pointer transition ${
                    !notif.isRead ? "bg-emerald-50/20" : ""
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <span className={`text-xs font-bold ${!notif.isRead ? "text-emerald-700" : "text-gray-700"}`}>
                        {notif.title}
                      </span>
                      <span className="text-[9px] text-gray-450 whitespace-nowrap">{formatDate(notif.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{notif.description}</p>
                  </div>

                  {/* Quick actions inside notif item */}
                  <div className="flex flex-col gap-1.5 justify-center items-center">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        title="Mark as Read"
                        className="p-1 bg-white hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-lg border transition shadow-sm"
                      >
                        <Check size={10} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notif.id, e)}
                      title="Delete"
                      className="p-1 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg border transition shadow-sm"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/user/notifications");
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Pop-up */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full bg-white border border-gray-100 shadow-2xl rounded-3xl p-5 flex gap-3.5 animate-slide-in items-start transition transform duration-300">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-full flex-shrink-0 animate-bounce">
            <Bell size={18} />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-gray-800 text-sm">{activeToast.title}</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">{activeToast.description}</p>
          </div>
          <button 
            onClick={() => setActiveToast(null)} 
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-50 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
