import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserSquare2,
  FileText,
  CalendarDays,
  Settings,
  LogOut,
  LucideShoppingBasket,
  X,
} from 'lucide-react';
import Avatar from '../components/shared/Avatar';
import { useAppSelector } from '../store/hook';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profiles', label: 'Profiles', icon: UserSquare2 },
  { to: '/posts', label: 'Posts', icon: FileText },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/settings/connections', label: 'Test', icon: LucideShoppingBasket },
];

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className='fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs md:hidden transition-opacity'
          aria-hidden='true'
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-full w-64 flex flex-col justify-between overflow-y-auto no-scrollbar border-r border-gray-200 bg-white p-4 shadow-xs transition-transform duration-300 ease-in-out shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Section */}
        <div className='flex flex-col gap-5'>
          {/* Mobile Header with Close Button */}
          <div className='flex items-center justify-between md:hidden pb-2 border-b border-gray-100'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-500'>
              Navigation
            </span>
            <button
              onClick={onClose}
              className='p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
            >
              <X size={18} />
            </button>
          </div>

          {/* Workspace Quick-Selector / Branding Space */}
          <div className='px-3 py-2 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl'>
            <div className='h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-200'>
              P
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-semibold text-gray-900 leading-none'>
                My Workspace
              </span>
              <span className='text-xs text-gray-500 mt-0.5'>Free Plan</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className='flex flex-col gap-1'>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={onClose} // Auto-closes sidebar on mobile after clicking a link
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline group ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        className={`transition-colors ${
                          isActive
                            ? 'text-blue-700'
                            : 'text-gray-400 group-hover:text-gray-600'
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
        <div className='pt-4 border-t border-gray-100 flex items-center justify-between mt-4'>
          <div className='flex items-center gap-3 px-1 min-w-0 pr-2'>
            <Avatar
              name={user?.profile?.firstName}
              src={user?.profile?.avatarUrl ?? undefined}
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-xs'
            />
            <div className='flex flex-col min-w-0'>
              {user?.profile && (
                <span className='text-xs font-semibold text-gray-900 leading-none truncate'>
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </span>
              )}
              {user?.email && (
                <span className='text-[11px] text-gray-400 mt-0.5 truncate'>
                  {user?.email}
                </span>
              )}
            </div>
          </div>

          <button
            type='button'
            className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0'
            title='Logout'
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;