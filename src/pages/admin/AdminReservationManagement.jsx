import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BASE = '/api';

// ─── Sidebar ────────────────────────────────────────────────────
function AdminSidebar({ active, onLogout, admin }) {
  const nav = [
    { label: 'Dashboard', icon: 'dashboard', to: '/admin/dashboard' },
    { label: 'Menu Management', icon: 'restaurant_menu', to: '/admin/menu' },
    { label: 'Categories', icon: 'category', to: '/admin/categories' },
    { label: 'Reservations', icon: 'event_seat', to: '/admin/reservations' },
    { label: 'Orders', icon: 'receipt_long', to: '/admin/orders' },
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

// ─── Modal Form ─────────────────────────────────────────────────
function ReservationModal({ item, onClose, onSave, tables }) {
  const [form, setForm] = useState({
    status: item?.status || 'pending',
    table_ids: item?.table_ids || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(item.id, form);
    setSaving(false);
  }

  // Helper formatting
  const dateStr = item?.reservation_date ? new Date(item.reservation_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/20 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#42474b]/15">
          <h3 className="font-bold text-[#e5e2e1]">Update Reservasi #{item?.id}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-[#201f1f] p-4 rounded-xl space-y-2 text-sm border border-[#42474b]/10">
            <p className="text-slate-400">Customer: <span className="text-[#e5e2e1] font-bold">{item?.customer_name}</span> ({item?.customer_phone})</p>
            <p className="text-slate-400">Tanggal: <span className="text-[#e5e2e1] font-bold">{dateStr}</span></p>
            <p className="text-slate-400">Waktu: <span className="text-[#e5e2e1] font-bold">{item?.start_time} WIB</span></p>
            <p className="text-slate-400">Jumlah Tamu: <span className="text-[#e5e2e1] font-bold">{item?.guest_count} Pax</span></p>
            {item?.notes && <p className="text-slate-400">Catatan: <span className="text-[#e5e2e1] italic">"{item.notes}"</span></p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#ffb59a] mb-2 block">Pilih Meja</label>
              <div className="relative">
                <input
                  type="text" value={form.table_ids} placeholder="Contoh: T1, T2"
                  onChange={e => setForm(p => ({ ...p, table_ids: e.target.value }))}
                  className="w-full bg-[#201f1f] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm border-none focus:ring-1 focus:ring-[#ffb59a] placeholder:text-slate-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">Pisahkan dengan koma jika lebih dari satu meja.</p>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#ffb59a] mb-2 block">Status Reservasi</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full bg-[#201f1f] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm border-none focus:ring-1 focus:ring-[#ffb59a]">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Tambahan Info Refund */}
            {form.status === 'cancelled' && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-sm">
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="material-symbols-outlined text-[#ffb4ab] text-sm mt-0.5">info</span>
                  <p>
                    <strong>Info Refund:</strong> Sesuai kebijakan, jika pelanggan tidak hadir (No-Show) / Cancel, <span className="text-white font-bold">uang booking Rp 5.000 hangus</span>. Silakan proses refund (pengembalian) hanya untuk uang pesanan paket makanan pelanggan.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-[#201f1f] text-slate-400 text-sm font-semibold hover:bg-[#2a2a2a]">Batal</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-lg bg-[#9c3400] hover:bg-[#ffb59a] hover:text-[#5b1b00] text-[#ffbea7] text-sm font-bold transition-all disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Update Reservasi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function AdminReservationManagement() {
  const navigate = useNavigate();
  const adminRaw = localStorage.getItem('inari_admin') || localStorage.getItem('inari_user');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); 
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!admin || admin.role !== 'admin') navigate('/login', { replace: true });
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const [newResAlert, setNewResAlert] = useState(false);
  const prevCount = React.useRef(null);

  const fetchReservations = useCallback(async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const res = await fetch(`${BASE}/admin/reservations`);
      const data = await res.json();
      if (data.success) {
        if (prevCount.current !== null && data.data.length > prevCount.current) {
          setNewResAlert(true);
          setTimeout(() => setNewResAlert(false), 5000);
        }
        setReservations(data.data);
        prevCount.current = data.data.length;
      }
    } catch { /* silent */ }
    if (!isAuto) setLoading(false);
  }, []);

  useEffect(() => { 
    fetchReservations(); 
    fetch(`${BASE}/admin/tables`).then(r => r.json()).then(d => { if(d.success) setTables(d.data); });

    // Auto Refresh setiap 10 detik
    const interval = setInterval(() => {
      fetchReservations(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchReservations]);

  async function handleSave(id, form) {
    const res = await fetch(`${BASE}/admin/reservations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { showToast('Reservasi berhasil diperbarui!'); setModal(null); fetchReservations(); }
    else showToast('Gagal menyimpan: ' + data.error);
  }

  async function handleDelete(id) {
    const res = await fetch(`${BASE}/admin/reservations/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { showToast('Reservasi dihapus.'); setDeleteId(null); fetchReservations(); }
  }

  function handleLogout() {
    ['inari_admin', 'inari_admin_token', 'inari_user', 'inari_token'].forEach(k => localStorage.removeItem(k));
    navigate('/login', { replace: true });
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed': return <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Confirmed</span>;
      case 'completed': return <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Completed</span>;
      case 'cancelled': return <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Cancelled</span>;
      default: return <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Pending</span>;
    }
  };

  return (
    <div className="bg-[#131313] min-h-screen flex font-['Manrope'] text-[#e5e2e1]">
      <AdminSidebar active="Reservations" onLogout={handleLogout} admin={admin} />

      <main className="ml-64 flex-1 flex flex-col h-screen">
        <header className="sticky top-0 h-16 bg-[#131313]/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-[#42474b]/15 shrink-0">
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500">Reservation Management</h2>
        </header>

        <div className="p-8 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-end mb-8 shrink-0">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
                Reservation <span className="text-[#ffb59a]">Management</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Kelola jadwal dan meja pelanggan Inari Suki & Grill.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total</p>
              <h3 className="text-3xl font-bold">{reservations.length}</h3>
            </div>
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Pending</p>
              <h3 className="text-3xl font-bold text-yellow-400">{reservations.filter(r => r.status === 'pending').length}</h3>
            </div>
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Confirmed</p>
              <h3 className="text-3xl font-bold text-green-400">{reservations.filter(r => r.status === 'confirmed').length}</h3>
            </div>
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Hari Ini</p>
              <h3 className="text-3xl font-bold text-[#adcbda]">
                {reservations.filter(r => new Date(r.reservation_date).toDateString() === new Date().toDateString()).length}
              </h3>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#1c1b1b] rounded-xl border border-[#42474b]/15 flex-1 overflow-hidden flex flex-col shadow-2xl">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-[#1c1b1b] z-10">
                  <tr className="border-b border-[#42474b]/15">
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">ID</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Pelanggan</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Waktu</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Pax & Meja</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#42474b]/10">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">Memuat data...</td></tr>
                  ) : reservations.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">Tidak ada reservasi ditemukan.</td></tr>
                  ) : reservations.map(r => {
                    const d = new Date(r.reservation_date);
                    const formattedDate = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                    return (
                      <tr key={r.id} className="hover:bg-[#2a2a2a]/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-400">#{r.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-[#e5e2e1]">{r.customer_name}</p>
                          <p className="text-xs text-slate-500">{r.customer_phone || r.customer_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[#e5e2e1]">{formattedDate}</p>
                          <p className="text-xs text-slate-400">{r.start_time} WIB</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[#e5e2e1]">{r.guest_count} Orang</p>
                          <p className="text-xs font-semibold text-[#ffb59a]">{r.table_ids ? `Meja: ${r.table_ids}` : 'Belum di-assign'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(r.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setModal(r)}
                              className="p-2 hover:bg-[#201f1f] rounded-lg transition-colors text-slate-400 hover:text-[#adcbda]">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button onClick={() => setDeleteId(r.id)}
                              className="p-2 hover:bg-red-900/20 rounded-lg transition-colors text-slate-400 hover:text-[#ffb4ab]">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-[#42474b]/10 flex items-center justify-between bg-[#1c1b1b]/50 shrink-0">
              <p className="text-xs text-slate-500">Menampilkan {reservations.length} reservasi</p>
            </div>
          </div>
        </div>
      </main>

      {/* New Reservation Alert */}
      {newResAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className="bg-[#adcbda] text-[#1c1b1b] px-8 py-4 rounded-2xl shadow-[0_0_50px_rgba(173,203,218,0.4)] flex items-center gap-4 border-4 border-white/20">
            <span className="material-symbols-outlined text-3xl animate-pulse">event_available</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">New Schedule</p>
              <h3 className="font-black text-lg leading-none">RESERVASI MEJA BARU!</h3>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {modal && (
        <ReservationModal
          item={modal}
          tables={tables}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/20 p-8 max-w-sm mx-4 text-center shadow-2xl">
            <span className="material-symbols-outlined text-4xl text-[#ffb4ab] mb-4 block">event_busy</span>
            <h3 className="font-bold text-[#e5e2e1] mb-2">Hapus Reservasi?</h3>
            <p className="text-slate-400 text-sm mb-6">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-lg bg-[#201f1f] text-slate-400 text-sm font-semibold">Batal</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-bold transition-all">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1b1b] border border-[#42474b]/30 text-[#e5e2e1] px-5 py-3 rounded-xl shadow-2xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffb59a] text-base">check_circle</span>
          {toast}
        </div>
      )}
    </div>
  );
}
