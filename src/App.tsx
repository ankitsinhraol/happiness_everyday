import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorProfilePage from './pages/VendorProfilePage';
import SearchResultsPage from './pages/SearchResultsPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import BookingFormPage from './pages/BookingFormPage'; // <-- IMPORT THIS NEW PAGE

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" expand={false} richColors />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/vendor/:id" element={<VendorProfilePage />} />
              {/* Main Dashboard route (for all users potentially) */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              {/* Vendor specific dashboard route */}
              <Route
                path="/vendor-dashboard/*"
                element={
                  <ProtectedRoute vendorOnly>
                    <VendorDashboardPage />
                  </ProtectedRoute>
                }
              />
              {/* Customer specific dashboard route */}
              <Route
                path="/customer-dashboard"
                element={
                  <ProtectedRoute>
                    <CustomerDashboardPage />
                  </ProtectedRoute>
                }
              />
              {/* Booking form page - ADD THIS NEW ROUTE */}
              <Route
                path="/bookings/new" // This path matches the `Maps` call in CustomerDashboardPage
                element={
                  <ProtectedRoute> {/* Ensure only logged-in users can access */}
                    <BookingFormPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for 404 */}
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;