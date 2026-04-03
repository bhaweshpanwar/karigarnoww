import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';

const Home = lazy(() => import('../pages/public/Home'));
const Login = lazy(() => import('../pages/public/Login'));
const Register = lazy(() => import('../pages/public/Register'));
const Services = lazy(() => import('../pages/Services'));
const ServiceDetail = lazy(() => import('../pages/ServiceDetail'));
const ThekedarProfile = lazy(() => import('../pages/ThekedarProfile'));
const BookingList = lazy(() => import('../pages/BookingList'));
const BookingDetail = lazy(() => import('../pages/BookingDetail'));
const CreateBooking = lazy(() => import('../pages/CreateBooking'));
const ThekedarDashboard = lazy(() => import('../pages/ThekedarDashboard'));

function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function ConsumerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'consumer') {
    return <Navigate to="/thekedar/dashboard" replace />;
  }
  return children;
}

function ThekedarRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'thekedar') {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/thekedars/:id" element={<ThekedarProfile />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <ConsumerRoute>
                  <BookingList />
                </ConsumerRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:thekedarId"
            element={
              <ProtectedRoute>
                <ConsumerRoute>
                  <CreateBooking />
                </ConsumerRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thekedar/dashboard"
            element={
              <ProtectedRoute>
                <ThekedarRoute>
                  <ThekedarDashboard />
                </ThekedarRoute>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
