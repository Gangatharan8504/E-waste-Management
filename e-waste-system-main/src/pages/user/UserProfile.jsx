import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { getFileUrl } from "../../services/api";

function UserProfile() {

  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState(location.state?.message || "");
  const fileInputRef = useRef(null);

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setMessage("Uploading profile picture...");
      const response = await api.post("/auth/profile-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfile(response.data);
      localStorage.setItem("profilePic", response.data.profilePic || "");
      setMessage("Profile picture updated successfully!");
      window.dispatchEvent(new Event("profile-update"));
    } catch {
      setMessage("Failed to upload profile picture");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        const data = response.data;
        setProfile(data);
        localStorage.setItem("firstName", data.firstName || "");
        localStorage.setItem("lastName", data.lastName || "");
        localStorage.setItem("profilePic", data.profilePic || "");
        window.dispatchEvent(new Event("profile-update"));
      } catch {
        setMessage("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await api.put("/auth/profile", profile);
      localStorage.setItem("firstName", profile.firstName || "");
      localStorage.setItem("lastName", profile.lastName || "");
      setEditMode(false);
      setMessage("Profile updated successfully");
      window.dispatchEvent(new Event("profile-update"));
    } catch {
      setMessage("Update failed");
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  const initials =
    (profile.firstName?.charAt(0) || "") +
    (profile.lastName?.charAt(0) || "");

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-16 px-4 md:px-6">

      <div className="max-w-5xl mx-auto space-y-10">

        {/* HEADER CARD */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">

             {/* Avatar */}
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="relative w-20 h-20 rounded-full cursor-pointer group overflow-hidden shadow-md border-2 border-emerald-500 flex items-center justify-center bg-emerald-600 text-white text-2xl font-bold"
               title="Click to change profile picture"
             >
               {profile.profilePic ? (
                 <img 
                   src={getFileUrl(profile.profilePic)} 
                   className="w-full h-full object-cover" 
                   alt="Avatar"
                 />
               ) : (
                 initials || "U"
               )}
               {/* Overlay on hover */}
               <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] uppercase font-bold">
                 Change
               </div>
             </div>
             
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleProfilePicUpload} 
               accept="image/*" 
               className="hidden" 
             />

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-500">{profile.email}</p>
              <p className="text-sm text-gray-400 mt-2">
                Manage your personal details and account settings.
              </p>
            </div>
          </div>

          <div className="mt-6 md:mt-0">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleUpdate}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Save Changes
              </button>
            )}
          </div>

        </div>

        {/* MESSAGE */}
        {message && (
          <div className="text-center text-emerald-600 font-medium">
            {message}
          </div>
        )}

        {/* PERSONAL INFO CARD */}
        <div className="bg-white rounded-3xl shadow-md p-6 md:p-10">

          <h3 className="text-xl font-semibold text-gray-900 mb-8">
            Personal Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm text-gray-500">First Name</label>
              <input
                name="firstName"
                value={profile.firstName || ""}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Last Name</label>
              <input
                name="lastName"
                value={profile.lastName || ""}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Phone Number</label>
              <input
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Email</label>
              <input
                value={profile.email || ""}
                disabled
                className="w-full mt-2 p-3 border rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Pincode</label>
              <input
                name="pincode"
                value={profile.pincode || ""}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

          </div>

          <div className="mt-6">
            <label className="text-sm text-gray-500">Address</label>
            <textarea
              name="address"
              value={profile.address || ""}
              onChange={handleChange}
              disabled={!editMode}
              rows="3"
              className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate("/user/change-password")}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition"
            >
              Change Password
            </button>
          </div>

        </div>

        {/* ACCOUNT SUMMARY */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow-md text-center">
            <h4 className="text-2xl font-bold text-emerald-600">Active</h4>
            <p className="text-sm text-gray-500 mt-2">
              Account Status
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md text-center">
            <h4 className="text-2xl font-bold text-emerald-600">
              {new Date().getFullYear()}
            </h4>
            <p className="text-sm text-gray-500 mt-2">
              Member Since
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md text-center">
            <h4 className="text-2xl font-bold text-emerald-600">
              Secure
            </h4>
            <p className="text-sm text-gray-500 mt-2">
              Account Protection
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default UserProfile;