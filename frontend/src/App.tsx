import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css';

import MainLayout from './layout/MainLayout';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GoogleAuthSuccess from './pages/auth/GoogleAuthSuccess';

import ProtectRoute from './ProtectRoute';

import { useAppDispatch } from './store/hook';
import { fetchCurrentUser } from './store/slices/authSlice';
import { ToastContainer } from 'react-toastify';
import CreatePost from './pages/post/CreatePost';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            Public Routes
        ========================== */}

        <Route path='/login' element={<Login />} />

        <Route path='/register' element={<Register />} />

        {/* Google OAuth callback route */}
        <Route path='/auth/success' element={<GoogleAuthSuccess />} />

        {/* =========================
            Application Layout
        ========================== */}

        <Route element={<MainLayout />}>
          {/* Public home page */}
          <Route path='/' element={<Home />} />

          {/* =========================
              Protected Routes
          ========================== */}

          <Route element={<ProtectRoute />}>
            <Route path='/dashboard' element={<Dashboard />} />

            <Route path='/posts' element={<CreatePost />} />

            <Route path='/profiles' element={<Profile />} />

            <Route path='/schedule' element={<Schedule />} />

            <Route path='/settings' element={<Settings />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
