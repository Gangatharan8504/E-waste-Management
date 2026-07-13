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

  const handlePrintBill = (req) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      alert("Please allow pop-ups for this website to print the invoice.");
      return;
    }
    const doc = printWindow.document;
    const firstName = localStorage.getItem("firstName") || "Customer";
    const lastName = localStorage.getItem("lastName") || "";
    const invoiceNum = `REC-${(req._id || req.id || "").substring(0, 8).toUpperCase()}`;
    const formattedDate = new Date(req.createdAt).toLocaleDateString();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceNum} - E-Waste Disposal Invoice</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; margin: 0; background-color: #fff; }
              .invoice-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
            }
          </style>
        </head>
        <body class="bg-gray-50 p-6 font-sans text-gray-800">
          <div class="max-w-3xl mx-auto bg-white border border-gray-200 p-10 rounded-2xl shadow-lg relative overflow-hidden invoice-card">
            <div class="absolute top-0 left-0 right-0 h-2 bg-emerald-600"></div>
            
            <div class="flex justify-between items-start mb-8">
              <div>
                <h1 class="text-3xl font-extrabold text-emerald-800 tracking-wide">EcoSync</h1>
                <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Smart E-Waste Recycling Solutions</p>
              </div>
              <div class="text-right">
                <h2 class="text-xl font-bold text-gray-700">INVOICE & GREEN CERTIFICATE</h2>
                <p class="text-xs text-gray-550 mt-1">Receipt No: <span class="font-mono text-gray-800 font-bold">${invoiceNum}</span></p>
                <p class="text-xs text-gray-550">Date: ${formattedDate}</p>
              </div>
            </div>
            
            <hr class="border-gray-200 my-6"/>
            
            <div class="grid grid-cols-2 gap-6 text-sm mb-8">
              <div>
                <h3 class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Billed To (Customer):</h3>
                <p class="font-bold text-gray-800">${firstName} ${lastName}</p>
                <p class="text-xs text-gray-500 mt-1">${req.pickupAddress}</p>
              </div>
              <div>
                <h3 class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Recycled By:</h3>
                <p class="font-bold text-emerald-700">EcoSync Recycling Hub</p>
                <p class="text-xs text-gray-500 mt-1">Sulur Collection & Extraction Center</p>
                <p class="text-xs text-gray-500">Coimbatore, Tamil Nadu, India</p>
              </div>
            </div>
            
            <div class="mb-8">
              <h3 class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3">Disposed Device Specifications</h3>
              <table class="w-full text-left text-sm border-collapse">
                <thead>
                  <tr class="bg-gray-100 text-gray-600 font-semibold">
                    <th class="p-3 rounded-l-lg">Item Description</th>
                    <th class="p-3">Condition</th>
                    <th class="p-3 text-center">Qty</th>
                    <th class="p-3 text-right rounded-r-lg">AI Verification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-100">
                    <td class="p-3 font-semibold text-gray-800">${req.brand} ${req.model} (${req.deviceType})</td>
                    <td class="p-3 text-gray-600">${req.condition}</td>
                    <td class="p-3 text-center text-gray-700">${req.quantity}</td>
                    <td class="p-3 text-right text-emerald-700 font-bold">SUITABLE (Verified)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="grid grid-cols-2 gap-6 items-start mb-8 bg-emerald-50/20 p-5 rounded-2xl border border-emerald-50">
              <div>
                <h3 class="text-xs text-emerald-800 uppercase font-bold tracking-wider mb-2">AI Valuation Summary</h3>
                <p class="text-xs text-gray-600 leading-relaxed">${req.valuationReason || "Compensation value calculated based on device weight, recycling yields, and condition indexes."}</p>
              </div>
              <div class="space-y-2 text-sm text-right">
                <div class="flex justify-between text-gray-500">
                  <span>Unit Base Value:</span>
                  <span>$${req.estimatedValue || 0}.00</span>
                </div>
                <div class="flex justify-between text-gray-500">
                  <span>Recyclable Yield:</span>
                  <span>${req.recyclablePercentage || 85}%</span>
                </div>
                <hr class="border-gray-250 my-1"/>
                <div class="flex justify-between text-base font-extrabold text-emerald-800">
                  <span>Compensation Total:</span>
                  <span>$${(req.estimatedValue || 0) * (req.quantity || 1)}.00</span>
                </div>
              </div>
            </div>
            
            <div class="border border-dashed border-emerald-300 bg-emerald-50/10 p-6 rounded-2xl text-center mb-8 relative">
              <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Green Environmental Impact Certificate
              </div>
              <p class="text-xs text-gray-500 my-3">This certifies that the disposed electronics were handled in compliance with eco-safety protocols, generating positive carbon credits:</p>
              
              <div class="grid grid-cols-4 gap-4 mt-2">
                <div class="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <p class="text-lg font-extrabold text-emerald-700">${req.quantity * 15} kg</p>
                  <p class="text-[9px] text-gray-400 uppercase font-bold tracking-tight">CO2 Offset</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <p class="text-lg font-extrabold text-emerald-700">${req.quantity * 45}g</p>
                  <p class="text-[9px] text-gray-400 uppercase font-bold tracking-tight">Metals Recovered</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <p class="text-lg font-extrabold text-emerald-700">${req.quantity * 2.8} kg</p>
                  <p class="text-[9px] text-gray-450 uppercase font-bold tracking-tight">Landfill Saved</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <p class="text-lg font-extrabold text-emerald-700">${(req.quantity * 0.8).toFixed(1)}</p>
                  <p class="text-[9px] text-gray-450 uppercase font-bold tracking-tight">Trees Equivalent</p>
                </div>
              </div>
            </div>
            
            <div class="flex justify-between items-end mt-10">
              <div>
                <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Audit Signature</p>
                <div class="mt-2 text-xs font-mono text-emerald-800 font-bold border-b border-gray-350 pb-1 flex items-center gap-1.5">
                  🛡️ EcoSync AI-Audit-Verified
                </div>
              </div>
              <div class="no-print">
                <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-md transition transform hover:scale-105">
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    doc.write(htmlContent);
    doc.close();
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

                {["ACCEPTED", "SCHEDULED", "COMPLETED"].includes(req.status) && (
                  <button
                    type="button"
                    onClick={() => handlePrintBill(req)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1 text-xs font-semibold rounded transition shadow-sm hover:scale-105 cursor-pointer"
                  >
                    View AI Bill PDF
                  </button>
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