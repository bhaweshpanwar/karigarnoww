import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-dark-surface border-b border-dark-card px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-saffron">
          KarigarNow
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-saffron border border-saffron rounded-lg hover:bg-saffron hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-saffron text-white rounded-lg hover:bg-saffron-light transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === 'consumer' && (
                <Link
                  to="/bookings"
                  className="px-4 py-2 text-saffron hover:underline"
                >
                  My Bookings
                </Link>
              )}
              {user.role === 'thekedar' && (
                <Link
                  to="/thekedar/dashboard"
                  className="px-4 py-2 text-saffron hover:underline"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 bg-dark-card text-white rounded-lg hover:bg-dark transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
