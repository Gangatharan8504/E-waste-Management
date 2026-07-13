import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { getFileUrl } from "../../services/api";

function MyRequests() {
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message || "");

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);

  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");

  const [confirmSlotModal, setConfirmSlotModal] = useState(null);

  const timeSlots = [
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00"
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests/my");
      setRequests(res.data);
    } catch {
      alert("Failed to load requests");
    }
  };

  const confirmSlot = async (id) => {
    try {
      await api.put(`/requests/${id}/confirm-slot`);
      setConfirmSlotModal(null);
      fetchRequests();
    } catch {
      alert("Failed to confirm slot");
    }
  };

  const cancelRequest = async (id) => {
    try {
      await api.put(`/requests/${id}/cancel`);
      fetchRequests();
    } catch {
      alert("Cancel failed");
    }
  };

  const deleteRequest = async (id) => {
    try {
      await api.delete(`/requests/${id}`);
      fetchRequests();
    } catch {
      alert("Delete failed");
    }
  };

  const requestReschedule = async () => {
    try {
      await api.put(
        `/requests/${rescheduleId}/request-reschedule?requestedDate=${newDate}&requestedSlot=${newSlot}`
      );

      setRescheduleId(null);
      fetchRequests();
    } catch {
      alert("Failed to request reschedule");
    }
  };

  const openImage = (imageUrls, index) => {
    setCurrentImages(imageUrls);
    setImageIndex(index);
    setSelectedImage(imageUrls[index]);
  };

  const nextImage = () => {
    const next = (imageIndex + 1) % currentImages.length;
    setImageIndex(next);
    setSelectedImage(currentImages[next]);
  };

  const prevImage = () => {
    const prev =
      (imageIndex - 1 + currentImages.length) % currentImages.length;
    setImageIndex(prev);
    setSelectedImage(currentImages[prev]);
  };

  const statusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-700";
      case "SCHEDULED":
        return "bg-indigo-100 text-indigo-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  /* USER FRIENDLY FILTER */

  const filteredRequests = requests.filter((req) => {
    if (filter === "ALL") return true;

    if (filter === "PENDING") {
      return ["PENDING", "ACCEPTED"].includes(req.status);
    }

    if (filter === "SCHEDULED") {
      return ["SCHEDULED"].includes(req.status);
    }

    if (filter === "COMPLETED") {
      return req.status === "COMPLETED";
    }

    if (filter === "CANCELLED") {
      return ["CANCELLED", "REJECTED"].includes(req.status);
    }

    return true;
  });

  return (

    <div className="min-h-screen bg-gray-50 p-10">

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl mb-6 shadow-sm flex items-center justify-between animate-fade-in">
          <span className="font-medium text-sm">{message}</span>
          <button onClick={() => setMessage("")} className="text-emerald-500 hover:text-emerald-700 font-bold transition ml-4">✕</button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">
        My Pickup Requests
      </h1>

      {/* FILTER BAR */}

      <div className="flex gap-2 mb-6 flex-wrap">

        {["ALL","PENDING","SCHEDULED","COMPLETED","CANCELLED"].map((f) => (

          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded border ${
              filter === f ? "bg-emerald-600 text-white" : "bg-white"
            }`}
          >
            {f}
          </button>

        ))}

      </div>

      <div className="space-y-4">

        {filteredRequests.map((req) => (

          <div
            key={req.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4"
          >

            {/* LEFT SIDE INFO */}

            <div className="flex-1">

              <div className="flex justify-between mb-2">

                <h2 className="font-semibold">
                  Request #{req.id}
                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(req.status)}`}
                >
                  {req.status}
                </span>

              </div>

              <p className="text-sm">
                <b>Device:</b> {req.deviceType} {req.brand}
              </p>

              <p className="text-sm">
                <b>Address:</b> {req.pickupAddress}
              </p>

              {req.scheduledDate && (
                <p className="text-sm">
                  <b>Pickup Schedule:</b> {req.scheduledDate} ({req.scheduledTime})
                </p>
              )}

              {req.adminNotes && (
                <p className="text-sm text-gray-500 italic mt-1">
                  <b>Team Notes:</b> "{req.adminNotes}"
                </p>
              )}

              {req.aiSummary && (
                <p className="text-xs text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded border border-emerald-100 inline-block mt-2 italic">
                  <b>EcoBot Summary:</b> {req.aiSummary}
                </p>
              )}

              {/* Stepper Timeline */}
              {req.status !== "CANCELLED" && req.status !== "REJECTED" ? (
                <div className="mt-5 mb-3 max-w-md">
                  <div className="flex items-center">
                    {/* Step 1: Submitted */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        ✓
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 mt-1">Submitted</span>
                    </div>

                    {/* Line 1 */}
                    <div className={`flex-1 h-0.5 -mt-3 ${
                      ["ACCEPTED", "SCHEDULED", "COMPLETED"].includes(req.status) ? "bg-emerald-600" : "bg-gray-200"
                    }`}></div>

                    {/* Step 2: Approved */}
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shadow-sm ${
                        ["ACCEPTED", "SCHEDULED", "COMPLETED"].includes(req.status)
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 border border-gray-300 text-gray-400"
                      }`}>
                        {["ACCEPTED", "SCHEDULED", "COMPLETED"].includes(req.status) ? "✓" : "2"}
                      </div>
                      <span className={`text-[10px] font-semibold mt-1 ${
                        ["ACCEPTED", "SCHEDULED", "COMPLETED"].includes(req.status) ? "text-emerald-700" : "text-gray-400"
                      }`}>Approved</span>
                    </div>

                    {/* Line 2 */}
                    <div className={`flex-1 h-0.5 -mt-3 ${
                      ["SCHEDULED", "COMPLETED"].includes(req.status) ? "bg-emerald-600" : "bg-gray-200"
                    }`}></div>

                    {/* Step 3: Scheduled */}
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shadow-sm ${
                        ["SCHEDULED", "COMPLETED"].includes(req.status)
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 border border-gray-300 text-gray-400"
                      }`}>
                        {["SCHEDULED", "COMPLETED"].includes(req.status) ? "✓" : "3"}
                      </div>
                      <span className={`text-[10px] font-semibold mt-1 ${
                        ["SCHEDULED", "COMPLETED"].includes(req.status) ? "text-emerald-700" : "text-gray-400"
                      }`}>Scheduled</span>
                    </div>

                    {/* Line 3 */}
                    <div className={`flex-1 h-0.5 -mt-3 ${
                      req.status === "COMPLETED" ? "bg-emerald-600" : "bg-gray-200"
                    }`}></div>

                    {/* Step 4: Completed */}
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shadow-sm ${
                        req.status === "COMPLETED"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 border border-gray-300 text-gray-400"
                      }`}>
                        {req.status === "COMPLETED" ? "✓" : "4"}
                      </div>
                      <span className={`text-[10px] font-semibold mt-1 ${
                        req.status === "COMPLETED" ? "text-emerald-700" : "text-gray-400"
                      }`}>Completed</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 mb-3 max-w-[200px]">
                  <div className="flex items-center">
                    {/* Step 1: Submitted */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        ✓
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 mt-1">Submitted</span>
                    </div>

                    {/* Line */}
                    <div className="flex-1 h-0.5 -mt-3 bg-red-500"></div>

                    {/* Step 2: Cancelled */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        ✕
                      </div>
                      <span className="text-[10px] font-semibold text-red-600 mt-1">
                        {req.status === "REJECTED" ? "Rejected" : "Cancelled"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-3">

                {req.status === "PENDING" && (
                  <button
                    onClick={() => cancelRequest(req.id)}
                    className="bg-red-500 text-white px-3 py-1 text-sm rounded"
                  >
                    Cancel
                  </button>
                )}

                {req.status === "CANCELLED" && (
                  <button
                    onClick={() => deleteRequest(req.id)}
                    className="bg-gray-700 text-white px-3 py-1 text-sm rounded"
                  >
                    Delete
                  </button>
                )}

                {req.status === "SLOT_PROPOSED" && (

                  <>
                    <button
                      onClick={() => setConfirmSlotModal(req.id)}
                      className="bg-green-600 text-white px-3 py-1 text-sm rounded"
                    >
                      Confirm Slot
                    </button>

                    <button
                      onClick={() => setRescheduleId(req.id)}
                      className="bg-orange-500 text-white px-3 py-1 text-sm rounded"
                    >
                      Request Reschedule
                    </button>
                  </>

                )}

              </div>

              {req.status === "RESCHEDULE_REQUESTED" && (
                <p className="text-orange-600 text-sm mt-2">
                  Your reschedule request is currently under review.
                </p>
              )}

            </div>

            {/* RIGHT IMAGE */}

            {req.imageUrls?.length > 0 && (

              <div
                className="relative w-24 h-24 ml-0 md:ml-4 flex-shrink-0 self-center md:self-auto cursor-pointer"
                onClick={() => openImage(req.imageUrls, 0)}
              >

                <img
                  src={getFileUrl(req.imageUrls[0])}
                  className="w-24 h-24 object-cover rounded"
                />

                {req.imageUrls.length > 1 && (

                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">

                    +{req.imageUrls.length - 1}

                  </div>

                )}

              </div>

            )}

          </div>

        ))}

      </div>

      {/* CONFIRM SLOT MODAL */}

      {confirmSlotModal && (

        <div className="fixed inset-0 bg-gray-200 bg-opacity-60 backdrop-blur-sm flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl shadow w-full max-w-md mx-4">

            <h2 className="font-semibold mb-3">
              Confirm Pickup Slot
            </h2>

            <p className="text-sm mb-4">
              Please confirm the proposed pickup time.
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setConfirmSlotModal(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => confirmSlot(confirmSlotModal)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>

            </div>

          </div>

        </div>

      )}

      {/* RESCHEDULE MODAL */}

      {rescheduleId && (

        <div className="fixed inset-0 bg-gray-200 bg-opacity-60 backdrop-blur-sm flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-full max-w-md mx-4">

            <h2 className="text-lg font-semibold mb-4">
              Request New Pickup Time
            </h2>

            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border p-2 w-full mb-3"
            />

            <select
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="border p-2 w-full mb-4"
            >

              <option value="">Select Time Slot</option>

              {timeSlots.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}

            </select>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setRescheduleId(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={requestReschedule}
                className="bg-emerald-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>

            </div>

          </div>

        </div>

      )}

      {/* IMAGE VIEWER */}

      {selectedImage && (

        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >

          <button
            className="absolute top-6 right-6 text-white text-4xl"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-10 text-white text-4xl"
          >
            ‹
          </button>

          <img
            src={getFileUrl(selectedImage)}
            className="max-h-[90%] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-10 text-white text-4xl"
          >
            ›
          </button>

        </div>

      )}

    </div>
  );
}

export default MyRequests;