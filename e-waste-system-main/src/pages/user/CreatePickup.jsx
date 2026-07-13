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

  // AI vision state hooks
  const [aiReport, setAiReport] = useState(null);
  const [aiVerified, setAiVerified] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

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

  // Append images with validation
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
      setAiError(err);
      return;
    }

    setAiError("");
    const updatedImages = [...images, ...validFiles];
    setImages(updatedImages);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    // Reset AI validation if image changes
    setAiReport(null);
    setAiVerified(false);

    e.target.value = null;
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setImages(updatedImages);
    setPreviews(updatedPreviews);

    // Reset AI validation if image changes
    setAiReport(null);
    setAiVerified(false);
    setAiError("");
  };

  const handleAiAnalysis = async () => {
    if (images.length === 0) {
      setAiError("Please upload at least one photo of the device for AI analysis.");
      return;
    }
    if (!formData.deviceType || !formData.brand || !formData.condition) {
      setAiError("Please fill in Device Type, Brand, and Condition fields before running AI analysis.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiReport(null);
    setAiVerified(false);

    try {
      const data = new FormData();
      data.append("file", images[0]);
      data.append("deviceType", formData.deviceType);
      data.append("brand", formData.brand);
      data.append("model", formData.model || "");
      data.append("condition", formData.condition);

      const response = await api.post("/requests/analyze-image", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const report = response.data;
      setAiReport(report);

      if (report.isElectronicDevice && report.isSuitableForRecycling) {
        setAiVerified(true);
      } else {
        setAiVerified(false);
        setAiError(report.rejectedReason || "The item does not appear to be a valid electronic device or suitable for recycling.");
      }
    } catch (err) {
      console.error(err);
      setAiError(err.response?.data?.message || "AI image analysis failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aiVerified) {
      setAiError("Please complete AI verification before scheduling a pickup.");
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

      // Append AI Report Fields
      if (aiReport) {
        Object.keys(aiReport).forEach((key) => {
          if (aiReport[key] !== null && aiReport[key] !== undefined) {
            data.append(key, aiReport[key]);
          }
        });
      }

      await api.post("/requests", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/user/my-requests", { state: { message: "Your e-waste pickup request has been successfully submitted!" } });

    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to create request");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔥 Premium Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 py-12 text-white text-center shadow-md">
        <h1 className="text-3xl font-bold tracking-wide">
          Create E-Waste Pickup Request
        </h1>
        <p className="mt-2 text-sm opacity-90">
          Schedule safe and eco-friendly disposal of your electronic waste
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-4 md:p-8 mt-6 md:mt-10 mb-8 md:mb-12 rounded-2xl shadow-xl">

        {message && (
          <div className="mb-6 text-center text-red-600 font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

           {/* Input Fields */}
          {["deviceType", "brand", "model", "condition"].map((field) => (
            <div key={field} className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                name={field}
                placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
                value={formData[field]}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
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
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
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

          <input
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />

          <input
            type="text"
            name="pickupAddress"
            placeholder="Pickup Address"
            value={formData.pickupAddress}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />

          {/* Map */}
          <LocationPicker
            setLocation={handleLocationSelect}
            setAddress={handleAddressUpdate}
          />

          <textarea
            name="remarks"
            placeholder="Additional Remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />

          {/* Image Upload Section */}
          <div className="space-y-3">

            <label className="block text-sm font-semibold text-gray-700">
              Upload Images
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border border-gray-300 rounded-xl p-4 bg-gray-100">

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

              <span className="text-sm text-gray-600 pointer-events-none">
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
                      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* AI Photo Verification Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-800">
                  AI E-Waste Image Verification
                </h3>
                <p className="text-xs text-gray-500">
                  AI must verify your device before scheduling a pickup request.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAiAnalysis}
                disabled={aiLoading || images.length === 0}
                className="bg-emerald-100 text-emerald-800 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {aiLoading ? "Analyzing Device..." : "Verify Device with AI"}
              </button>
            </div>

            {aiError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-left">
                {aiError}
              </div>
            )}

            {/* AI Report Summary Card */}
            {aiReport && (
              <div className={`p-5 rounded-2xl border text-left ${
                aiVerified ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"
              } space-y-4`}>
                <div className="flex justify-between items-center border-b pb-3 border-gray-200/50">
                  <span className="font-semibold text-gray-800">AI Analysis Report</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    aiVerified ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                  }`}>
                    {aiVerified ? "VERIFIED SUITABLE" : "REJECTED"}
                  </span>
                </div>

                {aiVerified ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p><strong className="text-gray-900">Device Type:</strong> {aiReport.deviceType}</p>
                      <p><strong className="text-gray-900">Category:</strong> {aiReport.deviceCategory}</p>
                      <p><strong className="text-gray-900">Estimated Condition:</strong> {aiReport.estimatedCondition}</p>
                      <p><strong className="text-gray-900">Damage Assessment:</strong> {aiReport.damageLevel} ({aiReport.isDamaged ? "Damaged" : "Undamaged"})</p>
                    </div>
                    <div>
                      <p><strong className="text-gray-900">Confidence Score:</strong> {aiReport.confidenceScore}%</p>
                      <p><strong className="text-gray-900">Battery status:</strong> {aiReport.batteryDamage}</p>
                      <p><strong className="text-gray-900">Safety risks:</strong> {aiReport.safetyRisks}</p>
                      <p><strong className="text-gray-900">Visible parts:</strong> {aiReport.visibleParts}</p>
                    </div>
                    <div className="md:col-span-2 space-y-2 border-t pt-3 border-gray-200/50 mt-1">
                      <p><strong className="text-gray-900">Safe Handling Instructions:</strong> {aiReport.safeHandlingInstructions}</p>
                      <p><strong className="text-gray-900">AI Summary:</strong> {aiReport.aiSummary}</p>
                      <p><strong className="text-gray-900">Recommendations (Repair / Reuse / Recycle):</strong></p>
                      <ul className="list-disc ml-5 space-y-0.5 text-xs">
                        <li><strong>Repair:</strong> {aiReport.repairRecommendation}</li>
                        <li><strong>Reuse:</strong> {aiReport.reuseRecommendation}</li>
                        <li><strong>Recycle:</strong> {aiReport.recyclingRecommendation}</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong className="text-red-700">Reason:</strong> {aiReport.rejectedReason}</p>
                    <p className="text-xs text-gray-500">Please upload a valid, clear image of an electronic device to submit your pickup request.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || !aiVerified}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/user/dashboard")}
              className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-xl hover:bg-gray-400 transition shadow-sm cursor-pointer"
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