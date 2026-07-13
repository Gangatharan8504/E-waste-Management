import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, ClipboardList, PlusCircle, LogOut, DollarSign, Sparkles, Menu, X } from "lucide-react";
import api, { getFileUrl } from "../services/api";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [profile, setProfile] = useState(() => {
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const profilePic = localStorage.getItem("profilePic");
    if (firstName || lastName) {
      return { firstName, lastName, profilePic };
    }
    return null;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setRole(localStorage.getItem("role"));
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("profilePic");
    setToken(null);
    setRole(null);
    setProfile(null);
    navigate("/");
  };

  const handleLogoClick = () => {
    if (token) {
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const fetchNavbarProfile = async () => {
      if (token) {
        try {
          const response = await api.get("/auth/profile");
          const data = response.data;
          setProfile(data);
          localStorage.setItem("firstName", data.firstName || "");
          localStorage.setItem("lastName", data.lastName || "");
          localStorage.setItem("profilePic", data.profilePic || "");
        } catch {
          // Keep as null or ignore
        }
      } else {
        setProfile(null);
      }
    };

    fetchNavbarProfile();

    window.addEventListener("profile-update", fetchNavbarProfile);
    return () => window.removeEventListener("profile-update", fetchNavbarProfile);
  }, [token]);

  const isActive = (path) => {
    return location.pathname === path
      ? "text-emerald-600 font-semibold"
      : "text-gray-600 hover:text-emerald-600";
  };

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-10 py-4 flex items-center justify-between">

      {/* LEFT SIDE (LOGO + NAV LINKS) */}
      <div className="flex items-center gap-10">

        {/* LOGO */}
        <h1
          onClick={handleLogoClick}
          className="text-2xl font-bold text-emerald-700 cursor-pointer tracking-wide"
        >
          EcoSync
        </h1>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">

          {token && role === "USER" && (
            <>
              <Link
                to="/user/dashboard"
                className={`flex items-center gap-2 ${isActive("/user/dashboard")}`}
              >
                <Home size={16} /> Home
              </Link>

              <Link
                to="/user/create-pickup"
                className={`flex items-center gap-2 ${isActive("/user/create-pickup")}`}
              >
                <PlusCircle size={16} /> Create Pickup
              </Link>

              <Link
                to="/user/my-requests"
                className={`flex items-center gap-2 ${isActive("/user/my-requests")}`}
              >
                <ClipboardList size={16} /> My Requests
              </Link>

              <Link
                to="/user/value-estimator"
                className={`flex items-center gap-2 ${isActive("/user/value-estimator")}`}
              >
                <DollarSign size={16} /> Value Estimator
              </Link>
            </>
          )}

          {token && role === "ADMIN" && (
            <>
              <Link
                to="/admin/dashboard"
                className={`mr-4 ${isActive("/admin/dashboard")}`}
              >
                Manage Requests
              </Link>
              <Link
                to="/admin/insights"
                className={`flex items-center gap-1 ${isActive("/admin/insights")}`}
              >
                <Sparkles size={16} /> AI Insights
              </Link>
            </>
          )}

        </div>
      </div>

      {/* RIGHT SIDE ACTIONS */}
      <div className="flex items-center gap-4">

        {/* NOT LOGGED IN */}
        {!token && (
          <>
            <Link
              to="/login"
              className="text-gray-600 hover:text-emerald-600 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm hover:scale-105"
            >
              Get Started
            </Link>
          </>
        )}

        {/* LOGGED IN */}
        {token && (
          <>
            <NotificationBell />

            <Link
              to="/user/profile"
              className="flex items-center gap-2.5 group"
            >
              {profile?.profilePic ? (
                <img 
                  src={getFileUrl(profile.profilePic)} 
                  className="w-9 h-9 rounded-full object-cover shadow-sm border border-emerald-500 transition-transform group-hover:scale-105" 
                  alt="Avatar"
                />
              ) : (
                <div className="w-9 h-9 bg-emerald-600 text-white flex items-center justify-center rounded-full text-xs font-semibold group-hover:bg-emerald-700 transition shadow-sm">
                  {profile ? (profile.firstName?.charAt(0) || "") + (profile.lastName?.charAt(0) || "") : "U"}
                </div>
              )}
              <span className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition">
                {profile ? `${profile.firstName} ${profile.lastName}` : "Profile"}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-500 hover:text-white transition hover:scale-105"
            >
              <LogOut size={16} />
              <span className="hidden md:block">Logout</span>
            </button>
            {token && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </>
        )}

      </div>
    </nav>
    {/* Collapsible Mobile Menu Drawer */}
    {mobileMenuOpen && token && (
      <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 animate-slide-in shadow-sm">
        {role === "USER" && (
          <>
            <Link
              to="/user/dashboard"
              className={`flex items-center gap-3 py-2 border-b border-gray-50 text-sm font-semibold ${isActive("/user/dashboard")}`}
            >
              <Home size={18} /> Home
            </Link>
            <Link
              to="/user/create-pickup"
              className={`flex items-center gap-3 py-2 border-b border-gray-50 text-sm font-semibold ${isActive("/user/create-pickup")}`}
            >
              <PlusCircle size={18} /> Create Pickup
            </Link>
            <Link
              to="/user/my-requests"
              className={`flex items-center gap-3 py-2 border-b border-gray-50 text-sm font-semibold ${isActive("/user/my-requests")}`}
            >
              <ClipboardList size={18} /> My Requests
            </Link>
            <Link
              to="/user/value-estimator"
              className={`flex items-center gap-3 py-2 border-b border-gray-50 text-sm font-semibold ${isActive("/user/value-estimator")}`}
            >
              <DollarSign size={18} /> Value Estimator
            </Link>
          </>
        )}
        {role === "ADMIN" && (
          <>
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 py-2 border-b border-gray-50 text-sm font-semibold ${isActive("/admin/dashboard")}`}
            >
              <ClipboardList size={18} /> Manage Requests
            </Link>
            <Link
              to="/admin/insights"
              className={`flex items-center gap-3 py-2 border-b border-gray-50 text-sm font-semibold ${isActive("/admin/insights")}`}
            >
              <Sparkles size={18} /> AI Insights
            </Link>
          </>
        )}
      </div>
    )}
  </>
  );
}

export default Navbar;