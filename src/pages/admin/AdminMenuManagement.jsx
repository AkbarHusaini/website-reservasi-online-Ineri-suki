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
      <div className="p-6">
        <span className="text-xl font-bold tracking-tighter text-[#ffb59a]">Ineri Admin</span>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Ineri Suki & Grill</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {nav.map(n => (
          <Link key={n.label} to={n.to}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm tracking-wide transition-colors rounded-sm ${
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
        <div className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-slate-100 text-sm hover:bg-[#3e5b68]/10 transition-colors cursor-pointer rounded-sm">
          <span className="material-symbols-outlined text-base">settings</span>Settings
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-[#ffb4ab] text-sm hover:bg-red-900/10 transition-colors rounded-sm">
          <span className="material-symbols-outlined text-base">logout</span>Sign Out
        </button>
        <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-[#1c1b1b] rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[#9c3400] flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-[#ffb59a]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#e5e2e1]">{admin?.name || 'Admin'}</p>
            <p className="text-[10px] text-slate-500">Executive Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Modal Form ─────────────────────────────────────────────────
function MenuItemModal({ item, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    category_id: item?.category_id || '',
    image_url: item?.image_url || '',
    is_available: item?.is_available !== undefined ? Boolean(item.is_available) : true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSave() {
    if (!form.name || !form.price || !form.category_id) {
      setErr('Nama, harga, dan kategori wajib diisi.');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/20 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#42474b]/15">
          <h3 className="font-bold text-sm text-[#e5e2e1]">{item ? 'Edit Menu Item' : 'Add New Item'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined text-lg">close</span></button>
        </div>
        <div className="p-5 space-y-3.5">
          {err && <p className="text-[#ffb4ab] text-sm bg-red-900/20 px-4 py-2 rounded-lg">{err}</p>}
          {/* Image Preview Area */}
          <div className="w-full h-32 rounded-xl bg-[#201f1f] border border-[#42474b]/15 overflow-hidden flex items-center justify-center relative group">
            {form.image_url ? (
              <img 
                src={form.image_url} 
                alt="Preview" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { 
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full items-center justify-center flex-col gap-2 ${form.image_url ? 'hidden' : 'flex'}`}>
              <span className="material-symbols-outlined text-4xl text-slate-700">image_not_supported</span>
              <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Link gambar tidak valid / kosong</p>
            </div>
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-slate-300 font-bold border border-white/5">
              LIVE PREVIEW
            </div>
          </div>

          {[
            { label: 'Nama Item', key: 'name', type: 'text', placeholder: 'Bluefin Otoro Nigiri' },
            { label: 'Deskripsi', key: 'description', type: 'text', placeholder: 'Deskripsi singkat...' },
            { label: 'Harga (Rp)', key: 'price', type: 'number', placeholder: '45000' },
            { label: 'URL Gambar', key: 'image_url', type: 'text', placeholder: 'Tips: Klik kanan gambar di Google > Salin alamat gambar' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#ffb59a] mb-1 block">{f.label}</label>
              <input
                type={f.type} value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-[#201f1f] text-[#e5e2e1] px-4 py-2.5 rounded-lg text-sm border-none focus:ring-1 focus:ring-[#ffb59a] placeholder:text-slate-600"
              />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#ffb59a] mb-1 block">Kategori</label>
            <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
              className="w-full bg-[#201f1f] text-[#e5e2e1] px-4 py-2.5 rounded-lg text-sm border-none focus:ring-1 focus:ring-[#ffb59a]">
              <option value="">-- Pilih Kategori --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="avail" checked={form.is_available}
              onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))}
              className="w-4 h-4 accent-[#ffb59a]" />
            <label htmlFor="avail" className="text-sm text-slate-300">Tersedia</label>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-[#201f1f] text-slate-400 text-sm font-semibold hover:bg-[#2a2a2a]">Batal</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-[#9c3400] hover:bg-[#ffb59a] hover:text-[#5b1b00] text-[#ffbea7] text-sm font-bold transition-all disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function AdminMenuManagement() {
  const navigate = useNavigate();
  const adminRaw = localStorage.getItem('Ineri_admin') || localStorage.getItem('Ineri_user');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, cats: 0 });
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | item object
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!admin || admin.role !== 'admin') navigate('/login', { replace: true });
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (catFilter) params.append('category', catFilter);
      const res = await fetch(`${BASE}/admin/menu?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setStats({ total: data.total, cats: data.categories });
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [search, catFilter]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  useEffect(() => {
    fetch(`${BASE}/categories`)
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data); });
  }, []);

  async function handleSave(form) {
    const isEdit = modal && modal !== 'add';
    const url = isEdit ? `${BASE}/admin/menu/${modal.id}` : `${BASE}/admin/menu`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { showToast(isEdit ? 'Item berhasil diperbarui!' : 'Item berhasil ditambahkan!'); setModal(null); fetchMenu(); }
    else showToast('Gagal menyimpan: ' + data.error);
  }

  async function handleDelete(id) {
    const res = await fetch(`${BASE}/admin/menu/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { showToast('Item dihapus.'); setDeleteId(null); fetchMenu(); }
  }

  function handleLogout() {
    ['Ineri_admin', 'Ineri_admin_token', 'Ineri_user', 'Ineri_token'].forEach(k => localStorage.removeItem(k));
    navigate('/login', { replace: true });
  }

  const soldOut = items.filter(i => !i.is_available).length;

  return (
    <div className="bg-[#131313] min-h-screen flex font-['Manrope'] text-[#e5e2e1]">
      <AdminSidebar active="Menu Management" onLogout={handleLogout} admin={admin} />

      <main className="ml-64 flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 h-16 bg-[#131313]/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-[#42474b]/15">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="material-symbols-outlined text-slate-500 text-lg">search</span>
            <input
              className="flex-1 bg-[#201f1f] border-none rounded-lg py-2 px-3 text-sm text-[#e5e2e1] focus:ring-1 focus:ring-[#ffb59a] placeholder:text-slate-600"
              placeholder="Cari menu items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="bg-transparent border-none text-sm text-slate-400 font-semibold focus:ring-0 cursor-pointer"
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-slate-400 hover:text-[#ffb59a] cursor-pointer">notifications</span>
            <span className="material-symbols-outlined text-slate-400 hover:text-[#ffb59a] cursor-pointer">account_circle</span>
          </div>
        </header>

        <div className="p-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
                Menu <span className="text-[#ffb59a]">Management</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Curate the culinary experience of Ineri Suki & Grill.</p>
            </div>
            <button
              onClick={() => setModal('add')}
              className="bg-[#9c3400] hover:bg-[#ffb59a] hover:text-[#5b1b00] text-[#ffbea7] px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition-all active:scale-95 shadow-lg">
              <span className="material-symbols-outlined text-lg">add_circle</span>Add New Item
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Items', value: stats.total, sub: `${items.length} ditampilkan`, color: '' },
              { label: 'Categories', value: stats.cats, sub: 'kategori aktif', color: '' },
              { label: 'Active Items', value: items.filter(i => i.is_available).length, sub: 'tersedia', color: 'text-[#ffb59a]' },
              { label: 'Stock Alerts', value: soldOut, sub: 'habis', color: 'text-[#ffb4ab]', icon: soldOut > 0 ? 'warning' : null },
            ].map(s => (
              <div key={s.label} className="bg-[#1c1b1b] p-5 rounded-xl border border-[#42474b]/15">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{s.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className={`text-3xl font-bold ${s.color}`}>{s.value}</h3>
                  {s.icon && <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>}
                  {!s.icon && <span className="text-[10px] text-slate-600">{s.sub}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#1c1b1b] rounded-xl border border-[#42474b]/15 flex-1 overflow-hidden flex flex-col shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#42474b]/15">
                    {['Dish Preview', 'Details', 'Category', 'Price', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#42474b]/10">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">Memuat data...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">Tidak ada item ditemukan.</td></tr>
                  ) : items.map(item => (
                    <tr key={item.id} className="hover:bg-[#2a2a2a]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-[#201f1f] relative">
                          {item.image_url || item.img_path ? (
                            <img 
                              src={item.image_url || item.img_path} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full items-center justify-center bg-[#201f1f] ${item.image_url || item.img_path ? 'hidden' : 'flex'}`}>
                            <span className="material-symbols-outlined text-slate-600 text-sm">restaurant</span>
                          </div>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <h4 className="font-bold text-sm text-[#e5e2e1]">{item.name}</h4>
                        <p className="text-slate-500 text-xs truncate max-w-[180px]">{item.description || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-[#3c494f]/40 text-[#aab7bf] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                          {item.category_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[#ffb59a]">
                          <span className="opacity-50 text-xs mr-0.5">Rp</span>
                          {Number(item.price).toLocaleString('id-ID')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-[#ffb4ab]'}`} />
                          <span className="text-xs text-slate-300">{item.is_available ? 'Available' : 'Sold Out'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setModal(item)}
                            className="p-2 hover:bg-[#201f1f] rounded-lg transition-colors text-slate-400 hover:text-[#adcbda]">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => setDeleteId(item.id)}
                            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors text-slate-400 hover:text-[#ffb4ab]">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-[#42474b]/10 flex items-center justify-between bg-[#1c1b1b]/50">
              <p className="text-xs text-slate-500">Showing {items.length} of {stats.total} menu items</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Add/Edit */}
      {modal && (
        <MenuItemModal
          item={modal === 'add' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/20 p-8 max-w-sm mx-4 text-center shadow-2xl">
            <span className="material-symbols-outlined text-4xl text-[#ffb4ab] mb-4 block">delete_forever</span>
            <h3 className="font-bold text-[#e5e2e1] mb-2">Hapus Item?</h3>
            <p className="text-slate-400 text-sm mb-6">Tindakan ini tidak dapat dibatalkan.</p>
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

      {/* Fox watermark */}
      <div className="fixed bottom-[-80px] right-[-80px] opacity-[0.03] pointer-events-none select-none">
        <svg fill="#ffb59a" height="400" viewBox="0 0 100 100" width="400" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10L80 40L70 90H30L20 40L50 10Z" />
        </svg>
      </div>
    </div>
  );
}
