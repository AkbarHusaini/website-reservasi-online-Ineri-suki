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
      <nav className="flex-1 px-4 space-y-1">
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
function CategoryModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({ label: item?.label || '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.label) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c1b1b] rounded-2xl border border-[#42474b]/20 w-full max-w-sm mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#42474b]/15">
          <h3 className="font-bold text-[#e5e2e1]">{item ? 'Edit Category' : 'Add New Category'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#ffb59a] mb-1 block">Category Label</label>
            <input
              type="text" value={form.label} placeholder="e.g. Suki, Grill, Drinks"
              onChange={e => setForm({ label: e.target.value })}
              className="w-full bg-[#201f1f] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm border-none focus:ring-1 focus:ring-[#ffb59a] placeholder:text-slate-600"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-[#201f1f] text-slate-400 text-sm font-semibold hover:bg-[#2a2a2a]">Batal</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-lg bg-[#9c3400] hover:bg-[#ffb59a] hover:text-[#5b1b00] text-[#ffbea7] text-sm font-bold transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoryManagement() {
  const navigate = useNavigate();
  const adminRaw = localStorage.getItem('inari_admin') || localStorage.getItem('inari_user');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!admin || admin.role !== 'admin') navigate('/login', { replace: true });
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function handleSave(form) {
    const isEdit = modal && modal !== 'add';
    const url = isEdit ? `${BASE}/admin/categories/${modal.id}` : `${BASE}/admin/categories`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { showToast('Berhasil disimpan!'); setModal(null); fetchCategories(); }
    else showToast('Gagal: ' + data.error);
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus kategori ini?')) return;
    const res = await fetch(`${BASE}/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { showToast('Kategori dihapus.'); fetchCategories(); }
    else showToast('Gagal: ' + data.error);
  }

  function handleLogout() {
    ['inari_admin', 'inari_admin_token', 'inari_user', 'inari_token'].forEach(k => localStorage.removeItem(k));
    navigate('/login', { replace: true });
  }

  return (
    <div className="bg-[#131313] min-h-screen flex font-['Manrope'] text-[#e5e2e1]">
      <AdminSidebar active="Categories" onLogout={handleLogout} admin={admin} />

      <main className="ml-64 flex-1 flex flex-col p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage <span className="text-[#ffb59a]">Categories</span></h1>
            <p className="text-slate-400 mt-1 text-sm">Organize your menu items by groups.</p>
          </div>
          <button onClick={() => setModal('add')} className="bg-[#9c3400] hover:bg-[#ffb59a] hover:text-[#5b1b00] text-[#ffbea7] px-5 py-3 rounded-lg flex items-center gap-2 font-bold text-sm transition-all shadow-lg">
            <span className="material-symbols-outlined text-lg">add_circle</span>Add Category
          </button>
        </div>

        <div className="bg-[#1c1b1b] rounded-xl border border-[#42474b]/15 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#42474b]/15 bg-[#1c1b1b]">
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">ID</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Label</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#42474b]/10">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-12 text-slate-500">Loading...</td></tr>
              ) : categories.map(cat => (
                <tr key={cat.id} className="hover:bg-[#2a2a2a]/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">#{cat.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#e5e2e1]">{cat.label}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => setModal(cat)} className="p-2 hover:bg-[#201f1f] rounded-lg text-slate-400 hover:text-[#adcbda]">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-[#ffb4ab]">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {modal && <CategoryModal item={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      {toast && <div className="fixed bottom-6 right-6 bg-[#1c1b1b] border border-[#42474b]/30 text-[#e5e2e1] px-5 py-3 rounded-xl shadow-2xl text-sm flex items-center gap-2 animate-slide-up"><span className="material-symbols-outlined text-[#ffb59a] text-base">check_circle</span>{toast}</div>}
    </div>
  );
}
