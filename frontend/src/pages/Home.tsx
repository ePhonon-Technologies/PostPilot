import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Welcome Home</h1>
      <p className="text-gray-600 max-w-md">
        This is your main landing page. Since it is rendered inside the MainLayout's Outlet, 
        it benefits from the shared layout framework.
      </p>
      
      <button
        onClick={() => navigate("/dashboard")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard →
      </button>
    </div>
  );
};

export default Home;