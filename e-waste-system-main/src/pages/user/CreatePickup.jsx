import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LocationPicker from "../../components/LocationPicker";

function CreatePickup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deviceType: "",
    brand: "",
    model: "",
    condition: "",
    quantity: 1,
    pickupAddress: "",
    remarks: ""
  });

  const [coordinates, setCoordinates] = useState({
    latitude: "",
    longitude: ""
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fieldSuggestions = {
    deviceType: ["Laptop", "Smartphone", "Monitor", "Television", "Keyboard/Mouse", "Charger/Battery"],
    brand: ["Samsung", "Apple", "Dell", "HP", "Lenovo", "Sony"],
    condition: ["Working", "Broken Screen", "Dead (No Power)", "Obsolete"]
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        if (response.data && response.data.address) {
          setFormData((prev) => ({
            ...prev,
            pickupAddress: response.data.address
          }));
        }
      } catch (err) {
        console.error("Failed to load user profile address", err);
      }
    };
    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (lat, lng) => {
    setCoordinates({
      latitude: lat,
      longitude: lng
    });
  };

  const handleAddressUpdate = (address) => {
    setFormData((prev) => ({
      ...prev,
      pickupAddress: address
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = [];
    let err = "";

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        err = "Unsupported file format. Please upload JPEG, PNG, or WEBP images.";
      } else if (file.size > maxSize) {
        err = "Image size must not exceed 5MB.";
      } else {
        validFiles.push(file);
      }
    });

    if (err) {
      setMessage(err);
      return;
    }

    setMessage("");
    const updatedImages = [...images, ...validFiles];
    setImages(updatedImages);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    e.target.value = null;
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setImages(updatedImages);
    setPreviews(updatedPreviews);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setMessage("Please upload at least one image of the electronic item.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      data.append("pickupLat", coordinates.latitude);
      data.append("pickupLng", coordinates.longitude);

      images.forEach((img) => {
        data.append("images", img);
      });

      await api.post("/requests", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/user/my-requests", { state: { message: "Your e-waste pickup request has been successfully submitted!" } });

    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 py-12 text-white text-center shadow-md">
        <h1 className="text-3xl font-bold tracking-wide">
          Create E-Waste Pickup Request
        </h1>
        <p className="mt-2 text-sm opacity-90">
          Schedule safe and eco-friendly disposal of your electronic waste
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 mt-6 md:mt-10 mb-8 md:mb-12 rounded-2xl shadow-xl border border-gray-100">

        {message && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-650 p-4 rounded-xl text-center text-sm font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Form Spec Input Fields */}
          {["deviceType", "brand", "model", "condition"].map((field) => (
            <div key={field} className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {field === "deviceType" ? "Device Type" : field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                name={field}
                placeholder={`Enter ${field === "deviceType" ? "Device Type" : field.replace(/([A-Z])/g, " $1")}`}
                value={formData[field]}
                onChange={handleChange}
                required
                className="w-full border border-gray-350 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-sm"
              />
              {/* Suggestion Chips */}
              {fieldSuggestions[field] && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {fieldSuggestions[field].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, [field]: suggestion }))}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer ${
                        formData[field] === suggestion
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm font-semibold"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Quantity */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="w-full border border-gray-350 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-sm"
            />
          </div>

          {/* Pickup Address */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Pickup Address
            </label>
            <input
              type="text"
              name="pickupAddress"
              placeholder="Pickup Address"
              value={formData.pickupAddress}
              onChange={handleChange}
              required
              className="w-full border border-gray-355 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-sm"
            />
          </div>

          {/* Leaflet Location Picker Map */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Pin Location coordinates
            </label>
            <LocationPicker
              setLocation={handleLocationSelect}
              setAddress={handleAddressUpdate}
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Additional Remarks
            </label>
            <textarea
              name="remarks"
              placeholder="Describe access notes, pickup timings, or device conditions..."
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-350 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-sm"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Upload Images
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border border-gray-250 rounded-xl p-4 bg-gray-50">
              <label className="cursor-pointer bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm text-sm">
                Choose Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-gray-600 font-semibold pointer-events-none">
                {images.length === 0
                  ? "No images selected"
                  : `${images.length} selected`}
              </span>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden shadow-md border"
                  >
                    <img
                      src={src}
                      alt="preview"
                      className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-red-650 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition shadow-md disabled:opacity-60 cursor-pointer font-bold"
            >
              {loading ? "Submitting..." : "Submit Pickup Request"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/user/dashboard")}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition shadow-sm cursor-pointer font-bold"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreatePickup;