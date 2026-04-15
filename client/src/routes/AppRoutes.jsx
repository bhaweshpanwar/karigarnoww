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
const Settings = lazy(() => import('../pages/Settings'));
const ThekedarLayout = lazy(() => import('../pages/thekedar/ThekedarLayout'));
const Dashboard = lazy(() => import('../pages/thekedar/Dashboard'));
const ManageJobs = lazy(() => import('../pages/thekedar/ManageJobs'));
const JobDetail = lazy(() => import('../pages/thekedar/JobDetail'));
const MyWorkers = lazy(() => import('../pages/thekedar/MyWorkers'));
const Earnings = lazy(() => import('../pages/thekedar/Earnings'));
const ThekedarProfilePage = lazy(() => import('../pages/thekedar/ThekedarProfile'));

function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-10 h-10 border-4 border-[#D44B0A] border-t-transparent rounded-full animate-spin" />
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

function ThekedarShell() {
  return (
    <ThekedarRoute>
      <ThekedarLayout>
        <Suspense fallback={<FullPageSpinner />}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="workers" element={<MyWorkers />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="profile" element={<ThekedarProfilePage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </Suspense>
      </ThekedarLayout>
    </ThekedarRoute>
  );
}

function PublicRoutes() {
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
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/thekedar/*" element={<ThekedarShell />} />
      <Route path="*" element={<PublicRoutes />} />
    </Routes>
  );
}
