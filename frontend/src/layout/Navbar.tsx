import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, Sparkles, Menu } from 'lucide-react';
import { useAppSelector } from '../store/hook';
import Avatar from '../components/shared/Avatar';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className='h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shrink-0'>
      {/* Left: Hamburger Button (Mobile) & Brand/Logo */}
      <div className='flex items-center gap-3'>
        {/* Mobile Hamburger Button */}
        <button
          type='button'
          onClick={onToggleSidebar}
          className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl md:hidden transition-colors cursor-pointer'
          aria-label='Toggle Navigation'
        >
          <Menu className='w-5 h-5' />
        </button>

        <Link
          to='/'
          className='font-bold text-xl tracking-tight text-gray-900 no-underline flex items-center gap-2 group'
        >
          <Sparkles className='w-5 h-5 text-blue-600 transition-transform group-hover:rotate-12' />
          <span>PostPilot</span>
        </Link>
      </div>

      {/* Middle: Integrated Quick Search Bar */}
      <div className='hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all'>
        <Search className='text-gray-400 w-4 h-4' />
        <input
          type='text'
          placeholder='Search posts, analytics, profiles...'
          className='bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none w-full'
        />
        <kbd className='hidden sm:inline-block text-[10px] font-medium bg-white text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded shadow-xs'>
          ⌘K
        </kbd>
      </div>

      {/* Right: Actions & Profile Context */}
      <div className='flex items-center gap-2 sm:gap-4'>
        {/* Notifications Icon button */}
        <button
          type='button'
          className='relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer'
        >
          <Bell className='w-5 h-5' />
          <span className='absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white'></span>
        </button>

        {/* Vertical Divider */}
        <div className='h-6 w-px bg-gray-200 hidden sm:block'></div>

        {/* User Account Controls */}
        <div className='flex items-center gap-3 group cursor-pointer'>
          <div className='hidden flex-col items-end px-2 text-right sm:flex'>
            {user?.role && (
              <span className='text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-500'>
                {user.role}
              </span>
            )}

            {user?.profile && (
              <span className='max-w-[120px] truncate text-sm font-semibold text-gray-800'>
                {user.profile.firstName} {user.profile.lastName}
              </span>
            )}
          </div>

          {/* User Avatar Initials Bubble */}
          <Avatar
            className='flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm'
            name={user?.profile?.firstName}
            src={user?.profile?.avatarUrl ?? undefined}
          />

          {/* Logout Trigger button */}
          <button
            type='button'
            onClick={handleLogout}
            title='Log out'
            className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer ml-1'
          >
            <LogOut className='w-4 h-4' />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;