// Configuration for API endpoints.
const RENDER_URL = 'https://mandir-backend-8pc7.onrender.com/api';
const LOCAL_URL = 'http://localhost:5000/api';

const isLocalFrontend = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const isCapacitorApp = Boolean(window.Capacitor);

// Browser localhost uses local backend; Android/iOS Capacitor builds use Render.
const API_BASE = import.meta.env.VITE_USE_LOCAL_API === 'true' || (isLocalFrontend && !isCapacitorApp) ? LOCAL_URL : RENDER_URL;

const getAuthHeaders = () => {
  return { 'Content-Type': 'application/json' };
};

export const api = {
  call: async (endpoint, options = {}) => {
    let response;

    try {
      response = await fetch(`${API_BASE}${endpoint}`, options);
    } catch (error) {
      return { message: `Unable to connect to API server: ${error.message}` };
    }

    const text = await response.text();

    try {
      const data = text ? JSON.parse(text) : {};
      return response.ok ? data : { message: data.message || `Request failed with status ${response.status}` };
    } catch {
      return { message: `Request failed with status ${response.status}` };
    }
  },

  // Auth
  login: (data) => api.call('/auth/login', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  register: (data) => api.call('/auth/register', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  forgotPassword: (email) => api.call('/auth/forgot-password', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => api.call('/auth/reset-password', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ token, password }) }),
  getUsers: () => api.call('/auth/'),
  updateUser: (id, data) => api.call(`/auth/users/${id}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  deleteUser: (id) => api.call(`/auth/users/${id}`, { method: 'DELETE' }),

  // Roles (RBAC)
  getRoles: () => api.call('/roles'),
  createRole: (data) => api.call('/roles', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateRole: (id, data) => api.call(`/roles/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  deleteRole: (id) => api.call(`/roles/${id}`, { method: 'DELETE' }),


  // Events
  getEvents: () => api.call('/events'),
  createEvent: (data) => api.call('/events', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateEvent: (id, data) => api.call(`/events/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  deleteEvent: (id) => api.call(`/events/${id}`, { method: 'DELETE' }),

  // News
  getNews: () => api.call('/news'),
  createNews: (data) => api.call('/news', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateNews: (id, data) => api.call(`/news/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  deleteNews: (id) => api.call(`/news/${id}`, { method: 'DELETE' }),

  // Donations
  getDonations: () => api.call('/donations'),
  createDonation: (data) => api.call('/donations/create-order', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  createAdminDonation: (data) => api.call('/donations/admin-create', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateDonationStatus: (id, status) => api.call(`/donations/status/${id}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status }) }),
  sendDonationReceipt: (id) => api.call(`/donations/${id}/send-receipt`, { method: 'POST', headers: getAuthHeaders() }),

  // Gallery
  getGallery: () => api.call('/gallery'),
  addGalleryItem: (data) => api.call('/gallery', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateGalleryItem: (id, data) => api.call(`/gallery/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  deleteGalleryItem: (id) => api.call(`/gallery/${id}`, { method: 'DELETE' }),

  // Home Carousel
  getCarousel: (activeOnly = false) => api.call(`/carousel${activeOnly ? '?active=true' : ''}`),
  addCarouselItem: (data) => api.call('/carousel', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateCarouselItem: (id, data) => api.call(`/carousel/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  deleteCarouselItem: (id) => api.call(`/carousel/${id}`, { method: 'DELETE' }),

  // Trust Management
  getTrustManagement: () => api.call('/trust-management'),
  addTrustCategory: (data) => api.call('/trust-management/categories', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateTrustCategory: (id, data) => api.call(`/trust-management/categories/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  deleteTrustCategory: (id) => api.call(`/trust-management/categories/${id}`, { method: 'DELETE' }),
  addTrustRole: (data) => api.call('/trust-management/roles', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateTrustRole: (id, data) => api.call(`/trust-management/roles/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  deleteTrustRole: (id) => api.call(`/trust-management/roles/${id}`, { method: 'DELETE' }),
  addTrustMember: (data) => api.call('/trust-management/members', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateTrustMember: (id, data) => api.call(`/trust-management/members/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  deleteTrustMember: (id) => api.call(`/trust-management/members/${id}`, { method: 'DELETE' }),

  // Stats & Dashboard
  getDashboardStats: () => api.call('/stats/dashboard'),
  getReports: () => api.call('/reports'),

  // Site Content
  getSiteContent: () => api.call('/site-content'),
  updateSiteContent: (data) => api.call('/site-content', { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }),

  // Volunteers
  getVolunteers: () => api.call('/volunteers'),
  createVolunteer: (data) => api.call('/volunteers', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  updateVolunteer: (id, data) => api.call(`/volunteers/${id}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data) }),

  // Notifications & Contact
  getNotifications: () => api.call('/notifications'),
  sendNotification: (data) => api.call('/notifications', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  registerDeviceToken: (token, platform) => api.call('/notifications/register-token', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ token, platform }) }),
  sendContact: (data) => api.call('/contact', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  getContactMessages: () => api.call('/contact'),
  deleteContactMessage: (id) => api.call(`/contact/${id}`, { method: 'DELETE' }),
  toggleContactRead: (id) => api.call(`/contact/${id}/read`, { method: 'PATCH' }),

  // Live Stream
  getLiveStatus: () => api.call('/live/status'),
  updateLiveStatus: (data) => api.call('/live/status', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
  getLiveChat: () => api.call('/live/chat'),
  clearLiveChat: () => api.call('/live/chat', { method: 'DELETE' }),
};
