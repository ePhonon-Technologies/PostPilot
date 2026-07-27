import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from './components/shared/Spinner';
import { useAppSelector } from './store/hook';

function ProtectRoute() {
  const { user, loading, error, initialized } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();

  if (!initialized || loading) {
    return (
      <div className='flex justify-center items-center'>
        <Spinner />
      </div>
    );
  }

  if (error || !user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectRoute;
