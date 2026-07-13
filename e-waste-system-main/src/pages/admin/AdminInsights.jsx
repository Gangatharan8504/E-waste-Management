import { useState, useEffect } from "react";
import { Sparkles, Recycle, AlertTriangle, TrendingUp, HelpCircle, Lightbulb, HeartHandshake } from "lucide-react";
import api from "../../services/api";

function AdminInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get("/ai/admin-insights");
        setInsights(res.data);
      } catch (err) {
        console.error("Failed to fetch admin insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-semibold">Generating AI executive report...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center text-gray-500 font-medium">
        Unable to load AI Insights report. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white rounded-3xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <Sparkles className="h-8 w-8 animate-pulse text-emerald-300" />
              EcoSync AI Executive Report
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              Monthly collection analysis, product hazard estimations, common user queries, and AI strategic forecasts based on database statistics.
            </p>
          </div>
          <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] uppercase tracking-wider text-emerald-200 block font-bold">REPORT STATUS</span>
            <span className="text-sm font-bold block mt-0.5">COMPLETED BY ECOBOT</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Most Recycled */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit">
                <Recycle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-700">Most Recycled Products</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{insights.mostRecycledProducts}</p>
            </div>
          </div>

          {/* Card 2: Most Hazardous */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-red-50 text-red-600 p-3 rounded-2xl w-fit">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-700">Most Hazardous Products</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{insights.mostHazardousProducts}</p>
            </div>
          </div>

          {/* Card 3: Monthly Trends */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl w-fit">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-700">Monthly Volume Trends</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{insights.monthlyTrends}</p>
            </div>
          </div>

          {/* Card 4: Recommended Actions */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl w-fit">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-700">Most Recommended Actions</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{insights.mostRecommendedActions}</p>
            </div>
          </div>

          {/* Card 5: Common User Queries */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl w-fit">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-700">Common User Questions</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{insights.commonUserQuestions}</p>
            </div>
          </div>

          {/* Card 6: AI Insights */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl w-fit">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-700">AI Recycler Strategy</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{insights.aiRecyclingInsights}</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400">
          * This report is generated dynamically by EcoBot AI using live transactional statistics from your MySQL database.
        </div>
      </div>
    </div>
  );
}

export default AdminInsights;
