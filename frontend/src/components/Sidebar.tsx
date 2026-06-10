import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/profiles", label: "Profiles" },
  { to: "/posts", label: "Posts" },
  { to: "/schedule", label: "Schedule" },
  { to: "/settings", label: "Settings" },
];

const Sidebar = () => {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 p-3 flex flex-col gap-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
              isActive
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;