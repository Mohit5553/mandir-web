import { lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Donate from './pages/Donate';
import Contact from './pages/Contact';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import LiveDarshan from './pages/LiveDarshan';

// Admin pages - Lazy loaded for code splitting
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminDonations = lazy(() => import('./pages/admin/AdminDonations'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminUsersRoles = lazy(() => import('./pages/admin/AdminUsersRoles'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminTrustManagement = lazy(() => import('./pages/admin/AdminTrustManagement'));
const AdminCarousel = lazy(() => import('./pages/admin/AdminCarousel'));
const AdminSiteContent = lazy(() => import('./pages/admin/AdminSiteContent'));
const AdminVolunteers = lazy(() => import('./pages/admin/AdminVolunteers'));
const AdminLiveStream = lazy(() => import('./pages/admin/AdminLiveStream'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));

import ScrollToTop from './components/ScrollToTop';
import { usePushNotifications } from './hooks/usePushNotifications';

// Guard: redirect to login if not authenticated
const RequireAuth = ({ children }) => {
  const user = localStorage.getItem('adminUser');
  return user ? children : <Navigate to="/admin/login" replace />;
};

const LoadingFallback = () => (
  <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading module...</div>
);

function App() {
  const Router = window.Capacitor ? HashRouter : BrowserRouter;
  usePushNotifications();

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="events" element={<Events />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="donate" element={<Donate />} />
          <Route path="live" element={<LiveDarshan />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="*" element={<div className="container" style={{ padding: '5rem 0', textAlign: 'center', minHeight: '50vh' }}><h2>Page Not Found</h2></div>} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>} />
          <Route path="news" element={<Suspense fallback={<LoadingFallback />}><AdminNews /></Suspense>} />
          <Route path="events" element={<Suspense fallback={<LoadingFallback />}><AdminEvents /></Suspense>} />
          <Route path="donations" element={<Suspense fallback={<LoadingFallback />}><AdminDonations /></Suspense>} />
          <Route path="notifications" element={<Suspense fallback={<LoadingFallback />}><AdminNotifications /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<LoadingFallback />}><AdminUsersRoles /></Suspense>} />
          <Route path="trust-management" element={<Suspense fallback={<LoadingFallback />}><AdminTrustManagement /></Suspense>} />
          <Route path="gallery" element={<Suspense fallback={<LoadingFallback />}><AdminGallery /></Suspense>} />
          <Route path="carousel" element={<Suspense fallback={<LoadingFallback />}><AdminCarousel /></Suspense>} />
          <Route path="site-content" element={<Suspense fallback={<LoadingFallback />}><AdminSiteContent /></Suspense>} />
          <Route path="volunteers" element={<Suspense fallback={<LoadingFallback />}><AdminVolunteers /></Suspense>} />
          <Route path="live" element={<Suspense fallback={<LoadingFallback />}><AdminLiveStream /></Suspense>} />
          <Route path="roles" element={<Suspense fallback={<LoadingFallback />}><AdminUsersRoles /></Suspense>} />
          <Route path="contact" element={<Suspense fallback={<LoadingFallback />}><AdminContact /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<LoadingFallback />}><AdminReports /></Suspense>} />
          <Route path="audit-logs" element={<Suspense fallback={<LoadingFallback />}><AdminAuditLogs /></Suspense>} />
          <Route path="*" element={<div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><h3>Module Under Development</h3></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
