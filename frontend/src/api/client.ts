import axios from 'axios';

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Required so the browser sends/accepts the httpOnly auth cookie on
  // every request. Without this, the cookie is silently dropped even
  // if the backend's CORS config allows credentials.
  withCredentials: true,
});

export default apiRequest;
