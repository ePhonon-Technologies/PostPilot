import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, Sparkles } from "lucide-react";
// Uncomment these when your Redux state is live:
// import { useAppDispatch, useAppSelector } from "../store/hooks"; 
// import { logout } from "../store/slices/authSlice";

const Navbar = () => {
  // const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const user = useAppSelector((state) => state.auth.user);
  
  // Temporary fallback data matching your template
  const user = { name: "Rajan", email: "rajan@postpilot.com" };

  const handleLogout = () => {
    // dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Left: Brand/Logo (Kept as fallback or main anchor) */}
      <div className="flex items-center gap-2">
        <Link to="/" className="font-bold text-xl tracking-tight text-gray-900 no-underline flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-blue-600 transition-transform group-hover:rotate-12" />
          <span>PostPilot</span>
        </Link>
      </div>

      {/* Middle: Integrated Quick Search Bar */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search className="text-gray-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search posts, analytics, profiles..." 
          className="bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none w-full"
        />
        <kbd className="hidden sm:inline-block text-[10px] font-medium bg-white text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded shadow-xs">
          ⌘K
        </kbd>
      </div>

      {/* Right: Actions & Profile Context */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon button */}
        <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* User Account Controls */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-semibold text-gray-900 leading-none">
              {user?.name || "Guest"}
            </span>
            <span className="text-[11px] text-gray-400 mt-1">
              {user?.name === "Rajan" ? "Admin Account" : "User"}
            </span>
          </div>

          {/* User Avatar Initials Bubble */}
          <div className="h-9 w-9 bg-linear-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
          </div>

          {/* Logout Trigger button */}
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
