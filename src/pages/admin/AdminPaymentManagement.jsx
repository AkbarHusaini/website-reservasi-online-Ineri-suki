import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminSidebar({ active, onLogout, admin }) {
  const nav = [
    { label: 'Dashboard', icon: 'dashboard', to: '/admin/dashboard' },
    { label: 'Menu Management', icon: 'restaurant_menu', to: '/admin/menu' },
    { label: 'Reservations', icon: 'event_seat', to: '/admin/reservations' },
    { label: 'Orders', icon: 'receipt_long', to: '/admin/orders' },
    { label: 'Payment Confirmation', icon: 'payments', to: '/admin/payments' },
    { label: 'Table Management', icon: 'table_restaurant', to: '/admin/tables' },
  ];
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#0e0e0e] flex flex-col border-r border-[#42474b]/15 z-50">
      <div className="p-8">
        <span className="text-xl font-bold tracking-tighter text-[#ffb59a]">Inari Admin</span>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Inari Suki & Grill</p>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-2">
        {nav.map(n => (
          <Link key={n.label} to={n.to}
            className={`flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-colors rounded-sm ${
              active === n.label
                ? 'bg-[#3e5b68]/20 text-[#ffb59a] border-r-2 border-[#ffb59a]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-[#3e5b68]/10'
            }`}>
            <span className="material-symbols-outlined text-base">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-[#42474b]/15">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-[#ffb4ab] text-sm hover:bg-red-900/10 transition-colors rounded-sm">
          <span className="material-symbols-outlined text-base">logout</span>Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminPaymentManagement() {
  const navigate = useNavigate();
  const adminRaw = localStorage.getItem('inari_admin') || localStorage.getItem('inari_user');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  useEffect(() => {
    if (!admin || admin.role !== 'admin') navigate('/login', { replace: true });
  }, []);

  function handleLogout() {
    ['inari_admin', 'inari_admin_token', 'inari_user', 'inari_token'].forEach(k => localStorage.removeItem(k));
    navigate('/login', { replace: true });
  }

  return (
    <div className="bg-[#131313] min-h-screen flex font-['Manrope'] text-[#e5e2e1]">
      <AdminSidebar active="Payment Confirmation" onLogout={handleLogout} admin={admin} />
      <main className="ml-64 flex-1 flex flex-col h-screen p-8">
        <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Payment <span className="text-[#ffb59a]">Confirmation</span>
        </h1>
        <div className="bg-[#1c1b1b] p-8 rounded-xl border border-[#42474b]/15 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">construction</span>
            <h2 className="text-xl font-bold text-slate-300">Fitur Sedang Dalam Pengembangan</h2>
            <p className="text-sm text-slate-500 mt-2">Halaman Konfirmasi Pembayaran akan segera hadir. Sementara ini Anda dapat mengubah status pembayaran di menu Orders.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
