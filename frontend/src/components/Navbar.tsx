import { Link, useNavigate } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "../app/hooks";
// import { logout } from "../features/auth/authSlice";

const Navbar = () => {
//   const dispatch = useAppDispatch();
  const navigate = useNavigate();
//   const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    // dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <Link to="/" className="font-medium text-gray-900 text-lg no-underline">
        SocialAuto
      </Link>
      <div className="flex items-center gap-4">
        {/* {user && <span className="text-sm text-gray-600">{user.name}</span>} */}
        <span className="text-sm text-gray-600">{"Rajan"}</span>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;