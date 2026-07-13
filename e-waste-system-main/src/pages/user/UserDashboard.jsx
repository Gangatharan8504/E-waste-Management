import { useNavigate } from "react-router-dom";
import EcoBot from "../../components/EcoBot";

function UserDashboard() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 text-white py-10 md:py-16 px-4 text-center shadow-md">

        <h1 className="text-4xl font-bold">
          Welcome to EcoSync
        </h1>

        <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
          Safely dispose of your electronic waste with our secure and eco-friendly
          pickup service. Schedule pickups, track requests, and help create a
          cleaner environment.
        </p>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">

          <button
            onClick={() => navigate("/user/create-pickup")}
            className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
          >
            Create Pickup Request
          </button>

          <button
            onClick={() => navigate("/user/my-requests")}
            className="bg-emerald-800 px-6 py-3 rounded-lg font-semibold shadow hover:bg-emerald-900 transition"
          >
            View My Requests
          </button>

        </div>

      </div>

      {/* QUICK ACTION CARDS */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-6">

        {/* CREATE REQUEST */}
        <div
          onClick={() => navigate("/user/create-pickup")}
          className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition"
        >
          <div className="text-3xl mb-4">📦</div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Schedule Pickup
          </h3>

          <p className="text-gray-600 text-sm">
            Submit a new e-waste pickup request and schedule a convenient
            doorstep collection.
          </p>
        </div>

        {/* TRACK REQUEST */}
        <div
          onClick={() => navigate("/user/my-requests")}
          className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition"
        >
          <div className="text-3xl mb-4">📋</div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Track Requests
          </h3>

          <p className="text-gray-600 text-sm">
            Monitor the progress of your pickup requests and view updates
            from the admin team.
          </p>
        </div>

      </div>

      {/* FEATURES SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-6">

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
          Why Use EcoSync?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* FEATURE 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition text-center">
            <div className="text-4xl mb-4">♻️</div>

            <h3 className="font-semibold text-lg mb-2">
              Eco-Friendly Recycling
            </h3>

            <p className="text-sm text-gray-600">
              We ensure responsible recycling of electronic waste according
              to environmental standards.
            </p>
          </div>

          {/* FEATURE 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition text-center">
            <div className="text-4xl mb-4">🔒</div>

            <h3 className="font-semibold text-lg mb-2">
              Data Security
            </h3>

            <p className="text-sm text-gray-600">
              Devices are handled securely to protect your sensitive
              information.
            </p>
          </div>

          {/* FEATURE 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition text-center">
            <div className="text-4xl mb-4">🚚</div>

            <h3 className="font-semibold text-lg mb-2">
              Doorstep Pickup
            </h3>

            <p className="text-sm text-gray-600">
              Schedule convenient pickups from your location without
              leaving home.
            </p>
          </div>

          {/* FEATURE 4 */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition text-center">
            <div className="text-4xl mb-4">📊</div>

            <h3 className="font-semibold text-lg mb-2">
              Track Your Requests
            </h3>

            <p className="text-sm text-gray-600">
              Monitor the status of your pickup from request submission
              to completion.
            </p>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="bg-white border-t py-6 text-center text-sm text-gray-500">
        Together we can reduce electronic waste and build a sustainable future.
      </div>

      <EcoBot />

    </div>
  );
}

export default UserDashboard;