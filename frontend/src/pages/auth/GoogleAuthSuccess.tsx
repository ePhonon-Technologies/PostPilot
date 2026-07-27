import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Spinner from '../../components/shared/Spinner';
import { useAppDispatch } from '../../store/hook';
import { fetchCurrentUser } from '../../store/slices/authSlice';

function GoogleAuthSuccess() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateUser = async () => {
      const result = await dispatch(fetchCurrentUser());

      if (fetchCurrentUser.fulfilled.match(result)) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };

    authenticateUser();
  }, [dispatch, navigate]);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Spinner />
    </div>
  );
}

export default GoogleAuthSuccess;
