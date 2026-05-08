import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const adminRaw = localStorage.getItem('inari_admin') || localStorage.getItem('inari_user');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  useEffect(() => {
    // Guard: jika bukan admin, redirect ke admin login
    if (!admin || admin.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [admin, navigate]);

  function handleLogout() {
    localStorage.removeItem('inari_admin');
    localStorage.removeItem('inari_admin_token');
    localStorage.removeItem('inari_user');
    localStorage.removeItem('inari_token');
    navigate('/login', { replace: true });
  }

  if (!admin) return null;

  return (
    <div className="bg-[#131313] min-h-screen flex font-['Manrope'] text-[#e5e2e1]">

      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#0e0e0e] flex flex-col border-r border-[#42474b]/15 z-50">
        <div className="p-8">
          <span className="text-xl font-bold tracking-tighter text-[#ffb59a]">Inari Admin</span>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Inari Suki & Grill</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 bg-[#3e5b68]/20 text-[#ffb59a] border-r-2 border-[#ffb59a] text-sm tracking-wide transition-colors rounded-sm"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            Dashboard
          </Link>
          <Link
            to="/admin/menu"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 text-sm tracking-wide hover:bg-[#3e5b68]/10 transition-colors rounded-sm"
          >
            <span className="material-symbols-outlined text-base">restaurant_menu</span>
            Menu Management
          </Link>
          <Link
            to="/admin/reservations"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 text-sm tracking-wide hover:bg-[#3e5b68]/10 transition-colors rounded-sm"
          >
            <span className="material-symbols-outlined text-base">event_seat</span>
            Reservations
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 text-sm tracking-wide hover:bg-[#3e5b68]/10 transition-colors rounded-sm"
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            Orders
          </Link>
          <Link
            to="/admin/tables"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 text-sm tracking-wide hover:bg-[#3e5b68]/10 transition-colors rounded-sm"
          >
            <span className="material-symbols-outlined text-base">table_restaurant</span>
            Table Management
          </Link>
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-[#42474b]/15">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 text-sm tracking-wide hover:bg-[#3e5b68]/10 transition-colors cursor-pointer rounded-sm">
            <span className="material-symbols-outlined text-base">settings</span>
            Settings
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-[#ffb4ab] text-sm tracking-wide hover:bg-red-900/10 transition-colors rounded-sm"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
          <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-[#1c1b1b] rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#9c3400] flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-[#ffb59a]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#e5e2e1]">{admin.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500">Executive Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 flex flex-col relative">
        {/* Top Bar */}
        <header className="sticky top-0 h-16 bg-[#131313]/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-[#42474b]/15">
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500">Admin Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-slate-400 hover:text-[#ffb59a] cursor-pointer transition-colors">notifications</span>
            <span className="material-symbols-outlined text-slate-400 hover:text-[#ffb59a] cursor-pointer transition-colors">help</span>
            <span className="text-xs text-slate-500 font-medium">Selamat datang, <span className="text-[#ffb59a] font-bold">{admin.name}</span></span>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Hero */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#e5e2e1] leading-tight">
                Admin <span className="text-[#ffb59a]">Dashboard</span>
              </h1>
              <p className="text-slate-400 mt-2 font-medium">Kelola operasional Inari Suki & Grill dari sini.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Menu', value: '124', icon: 'restaurant_menu', sub: '+4 minggu ini', color: 'text-[#adcbda]' },
              { label: 'Reservasi Hari Ini', value: '18', icon: 'event_seat', sub: '3 pending', color: 'text-[#ffb59a]' },
              { label: 'Order Aktif', value: '7', icon: 'receipt_long', sub: '2 belum diproses', color: 'text-[#ffb59a]' },
              { label: 'Stok Habis', value: '3', icon: 'warning', sub: 'Perlu diperbarui', color: 'text-[#ffb4ab]' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                  <span className={`material-symbols-outlined text-base ${stat.color}`}>{stat.icon}</span>
                </div>
                <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
                <p className="text-[10px] text-slate-600 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Menu Management', desc: 'Tambah, edit, atau hapus item menu.', icon: 'restaurant_menu', to: '/admin/menu' },
              { title: 'Reservations', desc: 'Kelola jadwal dan meja pelanggan.', icon: 'event_seat', to: '/admin/reservations' },
              { title: 'Orders', desc: 'Pantau dan proses pesanan masuk.', icon: 'receipt_long', to: '/admin/orders' },
              { title: 'Manajemen Meja', desc: 'Atur status dan ketersediaan meja.', icon: 'table_restaurant', to: '/admin/tables' },
            ].map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.to)}
                className="bg-[#1c1b1b] hover:bg-[#2a2a2a] p-6 rounded-xl border border-[#42474b]/15 text-left transition-all hover:border-[#ffb59a]/30 group"
              >
                <span className="material-symbols-outlined text-2xl text-[#ffb59a] mb-4 block group-hover:scale-110 transition-transform">{action.icon}</span>
                <h3 className="font-bold text-sm text-[#e5e2e1] mb-1">{action.title}</h3>
                <p className="text-xs text-slate-500">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Fox Watermark */}
        <div className="fixed bottom-[-80px] right-[-80px] opacity-[0.03] pointer-events-none select-none">
          <svg fill="#ffb59a" height="400" viewBox="0 0 100 100" width="400" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10L80 40L70 90H30L20 40L50 10Z"></path>
          </svg>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
