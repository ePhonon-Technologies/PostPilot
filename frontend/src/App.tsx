import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter> {/* 👈 This provides the context for useNavigate() */}
      <div className='bg-red-600'>
        <Routes>
          {/* Wrap your routes inside the MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/posts" element={<Post />} />
            <Route path='/profiles' element={<Profile />} />
            <Route path='/schedule' element={<Schedule />} />
            <Route path='/settings' element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;