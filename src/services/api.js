// Configuration for API Endpoints
const RENDER_URL = 'https://mandir-backend-8pc7.onrender.com/api';
const LOCAL_URL = 'http://localhost:5000/api';

// Default to Render, but we will detect local automatically
let API_BASE = RENDER_URL;

/**
 * Fast check to see if local backend is running.
 * If successful, we switch the base URL to local.
 */
const detectBackend = async () => {
    if (window.location.hostname === 'localhost') {
        try {
            // Quick ping to check if local server is alive
            const response = await fetch(`${LOCAL_URL}/stats/dashboard`, { method: 'GET' });
            if (response.ok) {
                console.log('🔌 Local Backend Detected - Using http://localhost:5000');
                API_BASE = LOCAL_URL;
                return LOCAL_URL;
            }
        } catch (err) {
            console.log('🌐 Local Backend not found - Falling back to Render');
        }
    }
    return RENDER_URL;
};

// Initialize detection
detectBackend();

const getAuthHeaders = () => {
    return { 'Content-Type': 'application/json' };
};

export const api = {
    // Shared fetch wrapper to always use the latest detected BASE_URL
    call: async (endpoint, options = {}) => {
        // If it's the first time on localhost, we might want to wait for detection
        // but for simplicity, we use the variable that gets updated
        return fetch(`${API_BASE}${endpoint}`, options).then(r => r.json());
    },

    // Auth
    login: (data) => api.call('/auth/login', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
    register: (data) => api.call('/auth/register', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
    getUsers: () => api.call('/auth/'),
    updateUser: (id, data) => api.call(`/auth/users/${id}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data) }),
    deleteUser: (id) => api.call(`/auth/users/${id}`, { method: 'DELETE' }),

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
    updateDonationStatus: (id, status) => api.call(`/donations/status/${id}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status }) }),

    // Gallery
    getGallery: () => api.call('/gallery'),
    addGalleryItem: (data) => api.call('/gallery', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
    deleteGalleryItem: (id) => api.call(`/gallery/${id}`, { method: 'DELETE' }),

    // Stats & Dashboard
    getDashboardStats: () => api.call('/stats/dashboard'),

    // Notifications & Contact
    getNotifications: () => api.call('/notifications'),
    sendNotification: (data) => api.call('/notifications', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
    sendContact: (data) => api.call('/contact', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
    getContactMessages: () => api.call('/contact'),
};
