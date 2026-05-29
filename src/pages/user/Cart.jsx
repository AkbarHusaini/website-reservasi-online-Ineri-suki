import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../index.css';

function formatIDR(num) {
  return num.toLocaleString('id-ID');
}

function Cart() {
  const { cartItems, updateCartItemQty, removeFromCart, clearCart } = useCart();
  const { user, logout } = useAuth();
  const [checkedOut, setCheckedOut] = useState(false);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.1);
  const serviceFee = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax + serviceFee;

  const handleCheckout = async () => {
    const token = localStorage.getItem('Ineri_token') || localStorage.getItem('IneriToken');
    if (!token) {
      alert('Sesi Anda tidak valid atau token hilang. Silakan login kembali.');
      logout();
      navigate('/login');
      return;
    }

    try {
      // Ambil data reservasi jika ada
      let reservationData = null;
      try {
        const savedRes = localStorage.getItem('Ineri_reservation_temp');
        if (savedRes) {
          reservationData = JSON.parse(savedRes);
        }
      } catch (e) {
        console.error("Gagal membaca data reservasi sementara", e);
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cartItems, reservationData })
      });

      const data = await response.json();

      if (data.success) {
        setCheckedOut(true);
        localStorage.removeItem('Ineri_reservation_temp');
        setTimeout(() => {
          setCheckedOut(false);
          clearCart();
          navigate(`/payment/${data.orderId}`);
        }, 2000);
      } else {
        const errorMsg = data.details ? `${data.error} (${data.details})` : (data.error || 'Gagal memproses pesanan.');
        alert(errorMsg);
        if (data.error === 'Token invalid' || data.error === 'Token missing') {
          logout();
          navigate('/login');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen selection:bg-tertiary/30">
      <Navbar activePage="cart" />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-20 -right-20 rotate-12 opacity-[0.03] pointer-events-none">
          <span className="material-symbols-outlined" style={{ fontSize: '400px' }}>restaurant</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Cart Items */}
          <div className="flex-1">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">
                  Keranjang Belanja
                </h1>
                <p className="text-on-surface-variant">
                  Review pesanan Anda sebelum melanjutkan ke reservasi dan pembayaran.
                </p>
              </div>
              <span className="text-tertiary text-xs font-bold tracking-widest uppercase mb-1">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {cartItems.length === 0 ? (
              /* Empty State */
              <div className="mt-8 p-16 bg-surface-container-low rounded-2xl text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">
                  shopping_basket
                </span>
                <h3 className="text-xl font-bold text-on-surface mb-2">Keranjang Kosong</h3>
                <p className="text-on-surface-variant mb-6">
                  Sepertinya Anda belum memilih hidangan apapun.
                </p>
                <Link
                  to="/menu"
                  className="px-6 py-3 border border-tertiary text-tertiary rounded-xl hover:bg-tertiary hover:text-on-tertiary transition-colors font-bold text-sm"
                >
                  Kembali ke Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    className="group flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-surface-container-low transition-all duration-300 hover:bg-surface-container-high border-b border-outline-variant/10"
                  >
                    {/* Image */}
                    <div className="w-full md:w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={
                          item.type === 'booking_fee' || item.name?.includes('Booking Fee') ? '/images/booking_fee.webp' :
                          item.name?.includes('Grill Berdua') ? '/images/paket_grill_berdua.webp' :
                          item.name?.includes('Pahlawan') ? '/images/paket_pahlawan.webp' :
                          (item.img || '/images/booking_fee.webp')
                        }
                        alt={item.alt}
                        onError={(e) => {
                          e.target.src = '/images/booking_fee.webp'; // Global fallback for broken images
                        }}
                      />
                      <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] pointer-events-none rounded-xl" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-on-primary-container leading-tight">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-on-surface-variant hover:text-error transition-colors ml-4 p-1 rounded-lg hover:bg-red-500/10"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                        <p className="text-on-surface-variant text-sm mt-2 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        {/* Qty control */}
                        <div className="flex items-center bg-surface-container-highest rounded-full px-2 py-1 gap-1">
                          <button
                            onClick={() => updateCartItemQty(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-tertiary hover:bg-surface rounded-full transition-colors active:scale-90"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="px-4 font-bold text-sm min-w-[32px] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateCartItemQty(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-tertiary hover:bg-surface rounded-full transition-colors active:scale-90"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-xl font-bold text-on-surface">
                          <span className="text-sm font-normal opacity-50 mr-1">IDR</span>
                          {formatIDR(item.price * item.qty)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Back to Menu */}
            <div className="mt-10">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-on-surface hover:text-tertiary transition-all group font-medium"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Kembali ke Menu
              </Link>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-surface-container sticky top-32 p-8 rounded-2xl shadow-2xl border border-outline-variant/10">
              <h2 className="text-xl font-bold text-white mb-8 tracking-tight border-b border-outline-variant/10 pb-4">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-medium text-on-surface">IDR {formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Pajak (10%)</span>
                  <span className="font-medium text-on-surface">IDR {formatIDR(tax)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Biaya Layanan (5%)</span>
                  <span className="font-medium text-on-surface">IDR {formatIDR(serviceFee)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/30 mb-8">
                <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Grand Total</p>
                <p className="text-3xl font-extrabold text-tertiary">
                  IDR {formatIDR(grandTotal)}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || checkedOut}
                  className={`w-full py-5 rounded-xl font-bold text-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 ${checkedOut
                      ? 'bg-green-600 text-white'
                      : cartItems.length === 0
                        ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                        : 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary'
                    }`}
                >
                  {checkedOut ? '✓ Pesanan Diterima!' : 'Lanjutkan ke Reservasi'}
                  {!checkedOut && <span className="material-symbols-outlined">payments</span>}
                </button>

                <div className="flex items-center gap-2 justify-center text-on-surface-variant text-xs mt-2">
                  <span className="material-symbols-outlined text-base">lock</span>
                  Pembayaran Aman &amp; Terenkripsi
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Cart;
