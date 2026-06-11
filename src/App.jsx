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

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminEvents from './pages/admin/AdminEvents';
import AdminDonations from './pages/admin/AdminDonations';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminUsersRoles from './pages/admin/AdminUsersRoles';
import AdminReports from './pages/admin/AdminReports';
import AdminGallery from './pages/admin/AdminGallery';
import AdminTrustManagement from './pages/admin/AdminTrustManagement';
import AdminCarousel from './pages/admin/AdminCarousel';
import AdminSiteContent from './pages/admin/AdminSiteContent';
import AdminVolunteers from './pages/admin/AdminVolunteers';
import AdminLiveStream from './pages/admin/AdminLiveStream';
import AdminContact from './pages/admin/AdminContact';

// Guard: redirect to login if not authenticated
const RequireAuth = ({ children }) => {
  const user = localStorage.getItem('adminUser');
  return user ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  const Router = window.Capacitor ? HashRouter : BrowserRouter;

  return (
    <Router>
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
          <Route index element={<AdminDashboard />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="users" element={<AdminUsersRoles />} />
          <Route path="trust-management" element={<AdminTrustManagement />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="carousel" element={<AdminCarousel />} />
          <Route path="site-content" element={<AdminSiteContent />} />
          <Route path="volunteers" element={<AdminVolunteers />} />
          <Route path="live" element={<AdminLiveStream />} />
          <Route path="roles" element={<AdminUsersRoles />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="*" element={<div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><h3>Module Under Development</h3></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
