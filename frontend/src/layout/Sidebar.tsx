import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  UserSquare2, 
  FileText, 
  CalendarDays, 
  Settings,
  LogOut
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profiles", label: "Profiles", icon: UserSquare2 },
  { to: "/posts", label: "Posts", icon: FileText },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between p-4 shadow-sm">
      {/* Top Section */}
      <div className="flex flex-col gap-6">
        {/* Workspace Quick-Selector / Branding space */}
        <div className="px-3 py-2 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-200">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 leading-none">My Workspace</span>
            <span className="text-xs text-gray-500 mt-0.5">Free Plan</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline group ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={18} 
                      className={`transition-colors ${
                        isActive 
                          ? "text-blue-700" 
                          : "text-gray-400 group-hover:text-gray-600"
                      }`} 
                    />
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Quick Settings Section */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-700 border border-white ring-2 ring-gray-100">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-900 leading-none">John Doe</span>
            <span className="text-[11px] text-gray-400 mt-0.5">john@postpilot.com</span>
          </div>
        </div>
        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;