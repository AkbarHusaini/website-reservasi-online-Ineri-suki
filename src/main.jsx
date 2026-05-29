import React, { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Lazy loaded pages
const Home = lazy(() => import('./pages/user/Home.jsx'))
const Login = lazy(() => import('./pages/user/Login.jsx'))
const Register = lazy(() => import('./pages/user/Register.jsx'))
const Menu = lazy(() => import('./pages/user/Menu.jsx'))
const Reservation = lazy(() => import('./pages/user/Reservation.jsx'))
const Cart = lazy(() => import('./pages/user/Cart.jsx'))
const About = lazy(() => import('./pages/user/About.jsx'))
const MyOrders = lazy(() => import('./pages/user/MyOrders.jsx'))
const PaymentPage = lazy(() => import('./pages/user/PaymentPage.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'))
const AdminMenuManagement = lazy(() => import('./pages/admin/AdminMenuManagement.jsx'))
const AdminTableManagement = lazy(() => import('./pages/admin/AdminTableManagement.jsx'))
const AdminReservationManagement = lazy(() => import('./pages/admin/AdminReservationManagement.jsx'))
const AdminOrderManagement = lazy(() => import('./pages/admin/AdminOrderManagement.jsx'))
const AdminCategoryManagement = lazy(() => import('./pages/admin/AdminCategoryManagement.jsx'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#131313]">
    <div className="w-10 h-10 border-4 border-t-transparent border-[#ffb59a] rounded-full animate-spin"></div>
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/menu" element={<AdminMenuManagement />} />
              <Route path="/admin/tables" element={<AdminTableManagement />} />
              <Route path="/admin/reservations" element={<AdminReservationManagement />} />
              <Route path="/admin/orders" element={<AdminOrderManagement />} />
              <Route path="/admin/categories" element={<AdminCategoryManagement />} />

              {/* Protected Routes */}
              <Route path="/menu" element={
                <ProtectedRoute>
                  <Menu />
                </ProtectedRoute>
              } />
              <Route path="/reservation" element={
                <ProtectedRoute>
                  <Reservation />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/my-orders" element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              } />
              <Route path="/payment/:orderId" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />

              <Route path="/about" element={<About />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
