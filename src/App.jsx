import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminEvents from './pages/admin/AdminEvents';
import AdminDonations from './pages/admin/AdminDonations';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminGallery from './pages/admin/AdminGallery';

// Guard: redirect to login if not authenticated
const RequireAuth = ({ children }) => {
  const user = localStorage.getItem('adminUser');
  return user ? children : <Navigate to="/admin/login" replace />;
};

function App() {
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
          <Route path="donate" element={<Donate />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<div className="container" style={{padding: '5rem 0', textAlign: 'center', minHeight: '50vh'}}><h2>Page Not Found</h2></div>} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="*" element={<div className="content-card" style={{textAlign: 'center', padding: '4rem'}}><h3>Module Under Development</h3></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
