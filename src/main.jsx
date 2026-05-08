import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/user/Home.jsx'
import Login from './pages/user/Login.jsx'
import Register from './pages/user/Register.jsx'
import Menu from './pages/user/Menu.jsx'
import Reservation from './pages/user/Reservation.jsx'
import Cart from './pages/user/Cart.jsx'
import About from './pages/user/About.jsx'
import MyOrders from './pages/user/MyOrders.jsx'
import PaymentPage from './pages/user/PaymentPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminMenuManagement from './pages/admin/AdminMenuManagement.jsx'
import AdminTableManagement from './pages/admin/AdminTableManagement.jsx'
import AdminReservationManagement from './pages/admin/AdminReservationManagement.jsx'
import AdminOrderManagement from './pages/admin/AdminOrderManagement.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/menu" element={<AdminMenuManagement />} />
            <Route path="/admin/tables" element={<AdminTableManagement />} />
            <Route path="/admin/reservations" element={<AdminReservationManagement />} />
            <Route path="/admin/orders" element={<AdminOrderManagement />} />

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
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
