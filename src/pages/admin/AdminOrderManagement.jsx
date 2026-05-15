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
        <span className="text-xl font-bold tracking-tighter text-[#ffb59a]">Ineri Admin</span>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Ineri Suki & Grill</p>
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
function OrderModal({ item, onClose, onSave }) {
  const [status, setStatus] = useState(item?.status || 'pending');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(item.id, status);
    setSaving(false);
  }

  let itemsArr = [];
  try {
    itemsArr = typeof item.items_json === 'string' ? JSON.parse(item.items_json) : item.items_json;
    if (!Array.isArray(itemsArr)) itemsArr = [];
  } catch(e) {
    itemsArr = [];
  }

  const dateStr = item?.created_at ? new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/20 w-full max-w-lg mx-4 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#42474b]/15 shrink-0">
          <h3 className="font-bold text-[#e5e2e1]">Detail Order #{item?.id}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#201f1f] p-4 rounded-xl border border-[#42474b]/10">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Pelanggan</p>
              <p className="text-[#e5e2e1] font-bold text-sm">{item?.customer_name}</p>
              <p className="text-slate-400 text-xs">{item?.customer_phone}</p>
            </div>
            <div className="bg-[#201f1f] p-4 rounded-xl border border-[#42474b]/10">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Info Waktu</p>
              <p className="text-[#e5e2e1] font-bold text-sm">{dateStr}</p>
              {item?.table_number && <p className="text-[#ffb59a] text-xs font-bold mt-1">Meja: {item.table_number}</p>}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#ffb59a] mb-3">Daftar Pesanan</h4>
            <div className="space-y-2">
              {itemsArr.length > 0 ? itemsArr.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#201f1f] p-3 rounded-lg border border-[#42474b]/10">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#131313] text-[#e5e2e1] text-xs font-bold px-2 py-1 rounded">{product.qty}x</span>
                    <div>
                      <p className="text-sm font-bold text-[#e5e2e1]">{product.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{product.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#ffb59a]">Rp {(product.price * product.qty).toLocaleString('id-ID')}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-500">Tidak ada item.</p>
              )}
            </div>
            <div className="mt-4 flex justify-between items-center px-2">
              <span className="text-sm font-bold text-slate-400">Total Harga</span>
              <span className="text-xl font-black text-[#e5e2e1]">Rp {Number(item?.total_price || 0).toLocaleString('id-ID')}</span>
            </div>
            {item?.notes && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-[10px] uppercase tracking-widest text-yellow-500 mb-1 font-bold">Catatan Pelanggan</p>
                <p className="text-sm text-yellow-200 italic">"{item.notes}"</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#ffb59a] mb-2 block">Update Status Order</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full bg-[#201f1f] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm border-none focus:ring-1 focus:ring-[#ffb59a]">
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="served">Served</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled / Refund</option>
            </select>
          </div>

          {/* Bagian Kalkulasi Refund Otomatis jika Cancelled */}
          {status === 'cancelled' && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#ffb4ab] text-sm">receipt_long</span>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#ffb4ab]">Rincian Pengembalian Dana</h4>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Uang paket makanan dikembalikan kepada pelanggan, namun <strong className="text-white">uang reservasi Rp 5.000 hangus</strong> karena pembatalan/tidak hadir.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Total Pembayaran Awal</span>
                  <span>Rp {Number(item?.total_price || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-red-400">
                  <span>Potongan Reservasi (Hangus)</span>
                  <span>- Rp 5.000</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#42474b]/30 font-bold">
                  <span className="text-[#e5e2e1]">Total yang di-Refund</span>
                  <span className="text-green-400 text-lg">
                    Rp {Math.max(0, Number(item?.total_price || 0) - 5000).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Data Rekening Pelanggan (Smart Detection from Notes) */}
              {(item.refund_status !== 'none' || (item.notes && item.notes.includes('[REFUND REQUEST]'))) && (
                <div className="mt-6 pt-4 border-t border-red-500/20">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffb59a] mb-3">Rekening Tujuan (Manual)</h4>
                  <div className="bg-black/20 p-3 rounded-lg space-y-1">
                    {item.notes && item.notes.includes('[REFUND REQUEST]') ? (
                       <p className="text-xs text-yellow-200 italic font-medium">{item.notes.split('\n').find(l => l.includes('[REFUND REQUEST]'))}</p>
                    ) : (
                      <>
                        <p className="text-xs text-slate-400">Bank: <span className="text-white font-bold">{item.refund_bank_name}</span></p>
                        <p className="text-xs text-slate-400">No. Rek: <span className="text-white font-bold">{item.refund_account_number}</span></p>
                        <p className="text-xs text-slate-400">Atas Nama: <span className="text-white font-bold">{item.refund_account_name}</span></p>
                      </>
                    )}
                  </div>
                  {(item.refund_status === 'pending' || (item.notes && item.notes.includes('[REFUND REQUEST]'))) && !item.notes?.includes('[REFUND PROCESSED]') && (
                    <button 
                      onClick={() => onSave(item.id, 'refund_processed')}
                      className="w-full mt-3 py-2 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-green-600 transition-all">
                      Konfirmasi Refund Selesai
                    </button>
                  )}
                  {(item.refund_status === 'processed' || (item.notes && item.notes.includes('[REFUND PROCESSED]'))) && (
                    <div className="mt-3 py-2 bg-green-500/20 text-green-400 text-center rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-500/30">
                      Refund Sudah Diproses
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 px-6 py-4 border-t border-[#42474b]/15 shrink-0 bg-[#1c1b1b] rounded-b-2xl">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-[#201f1f] text-slate-400 text-sm font-semibold hover:bg-[#2a2a2a]">Tutup</button>
          

          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-lg bg-[#9c3400] hover:bg-[#ffb59a] hover:text-[#5b1b00] text-[#ffbea7] text-sm font-bold transition-all disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function AdminOrderManagement() {
  const navigate = useNavigate();
  const adminRaw = localStorage.getItem('Ineri_admin') || localStorage.getItem('Ineri_user');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); 
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!admin || admin.role !== 'admin') navigate('/login', { replace: true });
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const prevCount = React.useRef(null);

  const fetchOrders = useCallback(async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const res = await fetch(`${BASE}/admin/orders`);
      const data = await res.json();
      if (data.success) {
        if (prevCount.current !== null && data.data.length > prevCount.current) {
          setNewOrderAlert(true);
          setTimeout(() => setNewOrderAlert(false), 5000);
        }
        setOrders(data.data);
        prevCount.current = data.data.length;
      }
    } catch { /* silent */ }
    if (!isAuto) setLoading(false);
  }, []);

  useEffect(() => { 
    fetchOrders(); 
    
    // Auto Refresh setiap 10 detik
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function handleSave(id, status) {
    let url = `${BASE}/admin/orders/${id}`;
    let method = 'PUT';
    let bodyContent = JSON.stringify({ status });
    
    if (status === 'refund') {
      url = `${BASE}/payments/refund/${id}`;
      method = 'POST';
    } else if (status === 'refund_processed') {
      // Endpoint khusus untuk update status refund manual ke 'processed'
      url = `${BASE}/admin/orders/${id}`;
      method = 'PUT';
      // Kita kirim body khusus agar controller tahu harus update refund_status
      bodyContent = JSON.stringify({ refund_status: 'processed' });
    }

    const res = await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: bodyContent 
    });
    
    const data = await res.json();
    if (data.success) { 
      showToast(status === 'refund' ? 'Refund berhasil diproses!' : 'Status order diperbarui!'); 
      setModal(null); 
      fetchOrders(); 
    }
    else showToast('Gagal: ' + (data.error || data.message));
  }

  async function handleDelete(id) {
    const res = await fetch(`${BASE}/admin/orders/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { showToast('Order dihapus.'); setDeleteId(null); fetchOrders(); }
  }

  function handleLogout() {
    ['Ineri_admin', 'Ineri_admin_token', 'Ineri_user', 'Ineri_token'].forEach(k => localStorage.removeItem(k));
    navigate('/login', { replace: true });
  }

  const getStatusBadge = (status, notes) => {
    if (status === 'cancelled' && notes && notes.includes('[REFUND REQUEST]')) {
      return <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-amber-500/30">Refund Pending</span>;
    }
    if (status === 'cancelled' && notes && notes.includes('[REFUND PROCESSED]')) {
      return <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-green-500/30">Refunded</span>;
    }

    switch(status) {
      case 'paid': return <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Paid</span>;
      case 'served': return <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Served</span>;
      case 'preparing': return <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Preparing</span>;
      case 'cancelled': return <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Cancelled</span>;
      default: return <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Pending</span>;
    }
  };

  return (
    <div className="bg-[#131313] min-h-screen flex font-['Manrope'] text-[#e5e2e1]">
      <AdminSidebar active="Orders" onLogout={handleLogout} admin={admin} />

      <main className="ml-64 flex-1 flex flex-col h-screen">
        <header className="sticky top-0 h-16 bg-[#131313]/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-[#42474b]/15 shrink-0">
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500">Order Management</h2>
        </header>

        <div className="p-8 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-end mb-8 shrink-0">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
                Order <span className="text-[#ffb59a]">Management</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Pantau dan proses pesanan makanan secara real-time.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold">{orders.length}</h3>
            </div>
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Pending/Preparing</p>
              <h3 className="text-3xl font-bold text-yellow-400">{orders.filter(r => r.status === 'pending' || r.status === 'preparing').length}</h3>
            </div>
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Paid</p>
              <h3 className="text-3xl font-bold text-green-400">{orders.filter(r => r.status === 'paid').length}</h3>
            </div>
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-[#adcbda]">
                <span className="text-sm opacity-50 mr-1">Rp</span>
                {orders.filter(r => r.status === 'paid').reduce((sum, o) => sum + Number(o.total_price), 0).toLocaleString('id-ID')}
              </h3>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#1c1b1b] rounded-xl border border-[#42474b]/15 flex-1 overflow-hidden flex flex-col shadow-2xl">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="sticky top-0 bg-[#1c1b1b] z-10">
                  <tr className="border-b border-[#42474b]/15">
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Pelanggan</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Total Pembayaran</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Waktu</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#42474b]/10">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">Memuat data...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">Tidak ada pesanan.</td></tr>
                  ) : orders.map(o => {
                    const dateStr = new Date(o.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
                    return (
                      <tr key={o.id} className="hover:bg-[#2a2a2a]/50 transition-colors group cursor-pointer" onClick={() => setModal(o)}>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-400">#ORD-{o.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-[#e5e2e1]">{o.customer_name}</p>
                          <p className="text-xs text-slate-500">{o.table_number ? `Meja: ${o.table_number}` : 'No Table'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[#ffb59a]">Rp {Number(o.total_price).toLocaleString('id-ID')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[#e5e2e1]">{dateStr}</p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(o.status, o.notes)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setModal(o)}
                              className="px-3 py-1 bg-[#201f1f] rounded-lg transition-colors text-xs font-bold text-[#adcbda] hover:bg-[#3e5b68]/30">
                              View
                            </button>
                            <button onClick={() => setDeleteId(o.id)}
                              className="p-1.5 hover:bg-red-900/20 rounded-lg transition-colors text-slate-400 hover:text-[#ffb4ab]">
                              <span className="material-symbols-outlined text-sm">delete</span>
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
              <p className="text-xs text-slate-500">Menampilkan {orders.length} pesanan</p>
            </div>
          </div>
        </div>
      </main>

      {/* New Order Alert */}
      {newOrderAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className="bg-[#ffb59a] text-[#5b1b00] px-8 py-4 rounded-2xl shadow-[0_0_50px_rgba(255,181,154,0.4)] flex items-center gap-4 border-4 border-white/20">
            <span className="material-symbols-outlined text-3xl animate-pulse">notifications_active</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Attention Required</p>
              <h3 className="font-black text-lg leading-none">PESANAN BARU MASUK!</h3>
            </div>
          </div>
        </div>
      )}

      {/* Modal View/Edit */}
      {modal && (
        <OrderModal
          item={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/20 p-8 max-w-sm mx-4 text-center shadow-2xl">
            <span className="material-symbols-outlined text-4xl text-[#ffb4ab] mb-4 block">delete_forever</span>
            <h3 className="font-bold text-[#e5e2e1] mb-2">Hapus Pesanan?</h3>
            <p className="text-slate-400 text-sm mb-6">Order yang dihapus akan hilang dari riwayat selamanya.</p>
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
