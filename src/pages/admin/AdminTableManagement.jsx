import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BASE = '/api';

// ─── Sidebar ────────────────────────────────────────────────────
function AdminSidebar({ active, onLogout, admin }) {
  const nav = [
    { label: 'Dashboard', icon: 'dashboard', to: '/admin/dashboard' },
    { label: 'Menu Management', icon: 'restaurant_menu', to: '/admin/menu' },
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
function TableModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    id: item?.id || '',
    capacity: item?.capacity || '',
    status: item?.status || 'available',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSave() {
    if (!form.id || !form.capacity) {
      setErr('ID Meja dan kapasitas wajib diisi.');
      return;
    }
    setSaving(true);
    await onSave(form, !item);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/20 w-full max-w-sm mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#42474b]/15">
          <h3 className="font-bold text-[#e5e2e1]">{item ? 'Edit Meja' : 'Tambah Meja Baru'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-6 space-y-4">
          {err && <p className="text-[#ffb4ab] text-sm bg-red-900/20 px-4 py-2 rounded-lg">{err}</p>}
          
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#ffb59a] mb-1 block">ID Meja</label>
            <input
              type="text" value={form.id} placeholder="T1"
              disabled={!!item}
              onChange={e => setForm(p => ({ ...p, id: e.target.value }))}
              className="w-full bg-[#201f1f] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm border-none focus:ring-1 focus:ring-[#ffb59a] placeholder:text-slate-600 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#ffb59a] mb-1 block">Kapasitas (Orang)</label>
            <input
              type="number" value={form.capacity} placeholder="4"
              onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
              className="w-full bg-[#201f1f] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm border-none focus:ring-1 focus:ring-[#ffb59a] placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#ffb59a] mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full bg-[#201f1f] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm border-none focus:ring-1 focus:ring-[#ffb59a]">
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-[#201f1f] text-slate-400 text-sm font-semibold hover:bg-[#2a2a2a]">Batal</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-lg bg-[#9c3400] hover:bg-[#ffb59a] hover:text-[#5b1b00] text-[#ffbea7] text-sm font-bold transition-all disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function AdminTableManagement() {
  const navigate = useNavigate();
  const adminRaw = localStorage.getItem('inari_admin') || localStorage.getItem('inari_user');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | table object
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!admin || admin.role !== 'admin') navigate('/login', { replace: true });
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/admin/tables`);
      const data = await res.json();
      if (data.success) setTables(data.data);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  async function handleSave(form, isNew) {
    const url = isNew ? `${BASE}/admin/tables` : `${BASE}/admin/tables/${form.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { showToast(isNew ? 'Meja berhasil ditambahkan!' : 'Meja berhasil diperbarui!'); setModal(null); fetchTables(); }
    else showToast('Gagal menyimpan: ' + data.error);
  }

  async function handleDelete(id) {
    const res = await fetch(`${BASE}/admin/tables/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { showToast('Meja dihapus.'); setDeleteId(null); fetchTables(); }
  }

  function handleLogout() {
    ['inari_admin', 'inari_admin_token', 'inari_user', 'inari_token'].forEach(k => localStorage.removeItem(k));
    navigate('/login', { replace: true });
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'reserved': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'occupied': return 'text-[#ffb4ab] bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="bg-[#131313] min-h-screen flex font-['Manrope'] text-[#e5e2e1]">
      <AdminSidebar active="Table Management" onLogout={handleLogout} admin={admin} />

      <main className="ml-64 flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 h-16 bg-[#131313]/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-[#42474b]/15">
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500">Table Management</h2>
        </header>

        <div className="p-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
                Table <span className="text-[#ffb59a]">Management</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Kelola layout dan ketersediaan meja restoran.</p>
            </div>
            <button
              onClick={() => setModal('add')}
              className="bg-[#9c3400] hover:bg-[#ffb59a] hover:text-[#5b1b00] text-[#ffbea7] px-5 py-3 rounded-lg flex items-center gap-2 font-bold text-sm transition-all shadow-lg">
              <span className="material-symbols-outlined text-lg">add_circle</span>Add Table
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Meja</p>
              <h3 className="text-3xl font-bold">{tables.length}</h3>
            </div>
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Available</p>
              <h3 className="text-3xl font-bold text-green-400">{tables.filter(t => t.status === 'available').length}</h3>
            </div>
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Reserved</p>
              <h3 className="text-3xl font-bold text-yellow-400">{tables.filter(t => t.status === 'reserved').length}</h3>
            </div>
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Occupied</p>
              <h3 className="text-3xl font-bold text-[#ffb4ab]">{tables.filter(t => t.status === 'occupied').length}</h3>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-slate-500">Memuat data meja...</div>
            ) : tables.map(table => (
              <div key={table.id} className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/15 p-6 relative group hover:border-[#ffb59a]/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModal(table)} className="text-slate-400 hover:text-[#adcbda]"><span className="material-symbols-outlined text-sm">edit</span></button>
                    <button onClick={() => setDeleteId(table.id)} className="text-slate-400 hover:text-[#ffb4ab]"><span className="material-symbols-outlined text-sm">delete</span></button>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 mb-3 ${table.status === 'available' ? 'border-green-400/20 text-green-400' : table.status === 'reserved' ? 'border-yellow-400/20 text-yellow-400' : 'border-red-400/20 text-[#ffb4ab]'}`}>
                    <span className="material-symbols-outlined text-3xl">table_restaurant</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#e5e2e1]">{table.id}</h3>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider">{table.capacity} Pax</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Add/Edit */}
      {modal && (
        <TableModal
          item={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/20 p-8 max-w-sm mx-4 text-center shadow-2xl">
            <span className="material-symbols-outlined text-4xl text-[#ffb4ab] mb-4 block">delete_forever</span>
            <h3 className="font-bold text-[#e5e2e1] mb-2">Hapus Meja {deleteId}?</h3>
            <p className="text-slate-400 text-sm mb-6">Meja yang dihapus tidak akan tersedia untuk reservasi.</p>
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
