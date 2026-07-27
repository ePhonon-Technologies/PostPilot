import { useNavigate } from 'react-router-dom';
import RegisterBranding from '../../components/auth/RegisterBranding';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAppSelector } from '../../store/hook';
import { useEffect } from 'react';
// import { registerUser } from "../features/auth/authSlice";

const Register = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user) {
    return null; // avoid flashing the login form while the redirect effect runs
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <div className='w-full max-w-5xl bg-white rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2'>
        {/* Left side - form */}
        <RegisterForm />

        {/* Right side - branding */}
        <RegisterBranding />
      </div>
    </div>
  );
};

export default Register;
