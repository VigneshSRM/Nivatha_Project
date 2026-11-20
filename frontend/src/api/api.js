import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Jobs
export const getJobs = (params) => API.get('/jobs', { params });
export const getJob = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const getMyJobs = () => API.get('/jobs/employer/myjobs');
export const toggleSaveJob = (id) => API.post(`/jobs/${id}/save`);

// Applications
export const applyJob = (jobId, data) => API.post(`/applications/${jobId}/apply`, data);
export const getMyApplications = () => API.get('/applications/my-applications');
export const getJobApplications = (jobId) => API.get(`/applications/job/${jobId}`);
export const updateAppStatus = (id, status) => API.put(`/applications/${id}/status`, { status });

// Users
export const getProfile = () => API.get('/users/profile');
export const updateSeekerProfile = (data) => API.put('/users/profile/seeker', data);
export const updateEmployerProfile = (data) => API.put('/users/profile/employer', data);
export const getSavedJobs = () => API.get('/users/saved-jobs');
export const getNotifications = () => API.get('/users/notifications');
export const markNotifRead = (id) => API.put(`/users/notifications/${id}/read`);
export const getDashboardStats = () => API.get('/users/dashboard/stats');

export default API;
