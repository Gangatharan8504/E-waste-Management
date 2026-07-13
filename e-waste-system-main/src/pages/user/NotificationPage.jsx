import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Trash2, Check, CheckCheck, Inbox } from "lucide-react";
import api from "../../services/api";

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (notif) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
              <Bell size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Your Notifications</h1>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">STATUS UPDATES & NOTICES</p>
            </div>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-emerald-150 self-end sm:self-auto"
            >
              <CheckCheck size={14} /> Mark all as read
            </button>
          )}
        </div>

        {/* Content list */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="p-4 bg-gray-50 text-gray-400 rounded-full">
              <Inbox size={40} />
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Inbox is empty</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                You will receive updates here whenever the collection agent updates your pickup requests.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md cursor-pointer transition relative overflow-hidden ${
                  !notif.isRead ? "border-l-4 border-l-emerald-600" : ""
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className={`text-sm font-bold ${!notif.isRead ? "text-emerald-800" : "text-gray-800"}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-gray-450 font-semibold">{formatDate(notif.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-xl">{notif.description}</p>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      title="Mark as Read"
                      className="p-2 bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl border transition shadow-sm"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    title="Delete Notification"
                    className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl border transition shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default NotificationPage;
