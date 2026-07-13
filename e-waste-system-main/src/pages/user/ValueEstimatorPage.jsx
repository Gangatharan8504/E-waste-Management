import { useState } from "react";
import { Sparkles, IndianRupee, Recycle, HelpCircle, ShieldAlert, Cpu } from "lucide-react";
import api from "../../services/api";

function ValueEstimatorPage() {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Smartphones & Tablets");
  const [condition, setCondition] = useState("Functional");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/ai/estimate-value", {
        productName,
        brand,
        category,
        condition,
        age,
        weight,
        description,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to compute estimation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Banner header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white rounded-3xl p-6 md:p-8 shadow-md">
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-emerald-300 animate-pulse" />
            AI Recycling Value Estimator
          </h1>
          <p className="text-emerald-100 text-sm mt-2 max-w-xl">
            Input your electronics details below and let EcoBot's valuation engine estimate the recyclable material yield, actions, and fair recycling payouts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Form */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-800 text-lg border-b pb-2 flex items-center gap-1.5">
              <Cpu className="text-emerald-600 h-5 w-5" /> Device Specifications
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Name</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. iPhone 13 Pro"
                className="w-full border border-gray-250 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple"
                  className="w-full border border-gray-250 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-250 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option>Smartphones & Tablets</option>
                  <option>Laptops & Computers</option>
                  <option>Televisions & Monitors</option>
                  <option>Home Appliances</option>
                  <option>Others</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full border border-gray-250 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option>Functional</option>
                  <option>Minor Defects</option>
                  <option>Broken/Dead</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Age (Optional)</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 3 years"
                  className="w-full border border-gray-250 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Weight (Optional)</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 0.2 kg"
                className="w-full border border-gray-250 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe screen condition, missing parts, battery health..."
                className="w-full border border-gray-250 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition shadow-md disabled:bg-emerald-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Estimating values...
                </>
              ) : (
                <>
                  <IndianRupee size={18} /> Estimate Recycling Value
                </>
              )}
            </button>
          </form>

          {/* Right Results */}
          <div className="space-y-6">
            {result ? (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg">AI Estimation Report</h2>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ECOBOT VALUATION ENGINE</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl text-center">
                    <span className="text-[9px] font-bold block uppercase tracking-wider leading-none">Recycling Value</span>
                    <span className="text-xl font-black block mt-0.5 leading-none">{result.estimatedRecyclingValue}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Device Category</span>
                    <span className="font-semibold text-gray-700 mt-0.5 block">{result.deviceCategory}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Recyclable Yield</span>
                    <span className="font-semibold text-gray-750 mt-0.5 block flex items-center gap-1">
                      <Recycle size={14} className="text-emerald-600" /> {result.recyclablePercentage}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Hazard Level</span>
                    <span className={`font-semibold mt-0.5 block flex items-center gap-1 ${
                      result.hazardLevel?.toLowerCase() === "high" ? "text-red-650" : "text-amber-600"
                    }`}>
                      <ShieldAlert size={14} /> {result.hazardLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Confidence Level</span>
                    <span className="font-semibold text-gray-700 mt-0.5 block">{result.confidenceLevel}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Recommended Action</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold w-fit block mt-1.5 border border-emerald-150">
                    {result.recommendedAction}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Recoverable Materials</span>
                  <p className="text-xs text-gray-650 mt-1 leading-relaxed">{result.recoverableMaterials}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Valuation Reasoning</span>
                  <p className="text-xs text-gray-650 mt-1 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100 italic">
                    "{result.reasonForValue}"
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="border-t pt-4 text-[10px] text-gray-450 leading-relaxed font-medium">
                  <strong>DISCLAIMER:</strong> This recycling value is an AI-generated estimate based on the provided information and current recyclable material assumptions. The final amount may vary after physical inspection.
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center space-y-4 h-[350px]">
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full">
                  <HelpCircle className="h-10 w-10 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-700">Waiting for Submission</h3>
                  <p className="text-xs text-gray-400 max-w-xs mt-1">
                    Fill out the specifications on the left to estimate recoverable metals and recycling payouts for your item.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ValueEstimatorPage;
