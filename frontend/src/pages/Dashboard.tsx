import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Application Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-semibold text-gray-900">1,248</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
          <p className="text-2xl font-semibold text-gray-900">84</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Server Status</h3>
          <p className="text-2xl font-semibold text-green-600">Online</p>
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default Dashboard;