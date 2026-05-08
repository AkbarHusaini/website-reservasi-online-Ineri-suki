import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';
import '../../index.css';

function Menu() {
  const { user, logout } = useAuth();
  const { addToCart, cartCount } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // State untuk data dari database
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories & menu dari API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catRes, menuRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/menu'),
        ]);

        const catData = await catRes.json();
        const menuData = await menuRes.json();

        if (catData.success) setCategories(catData.data);
        if (menuData.success) setMenuItems(menuData.data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data menu. Periksa koneksi server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Daftar tab kategori: "All" + kategori dari DB
  const categoryTabs = [{ id: 0, slug: 'all', label: 'All' }, ...categories];

  // Filter berdasarkan kategori aktif & search
  const filtered = menuItems.filter((item) => {
    const cat = categories.find((c) => c.id === item.category_id);
    const matchesCategory = activeCategory === 'all' || (cat && cat.slug === activeCategory);
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Format harga Rupiah
  const formatPrice = (price) =>
    Number(price).toLocaleString('id-ID');

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      img: item.image_url,
      alt: item.name,
    });
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen selection:bg-tertiary/30">
      <Navbar activePage="menu" />

      {/* Mobile Search Toggle */}
      <div className="md:hidden fixed top-20 left-0 w-full z-40 px-6 pointer-events-none">
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="pointer-events-auto ml-auto bg-tertiary text-on-tertiary w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-90"
        >
          <span className="material-symbols-outlined">{isSearchOpen ? 'search_off' : 'search'}</span>
        </button>
      </div>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Search Bar Mobile Overlay */}
        {isSearchOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start pt-24 px-6">
            <div className="w-full bg-surface-container-highest p-6 rounded-2xl shadow-2xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold uppercase tracking-widest text-xs text-tertiary">Search Menu</h3>
                <button onClick={() => setIsSearchOpen(false)} className="material-symbols-outlined">close</button>
              </div>
              <div className="flex bg-background/50 px-4 py-3 rounded-xl items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">search</span>
                <input
                  autoFocus
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <section className="mb-12 relative overflow-hidden rounded-2xl h-48 md:h-64 flex items-end p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent z-10" />
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg4-kCA_cKCg_iGqGctWXI3VoIeXTVZPITwreBihdTQaTUDIwSAHcGx0MVWZ99YFStaJzYMLQgEmmkiSTnWW3ASxtLBhp7t7eULDNNsEQtjknKkgHaSVAvsy6v2fuOh24GQ29KJhrNuS8qQZIzRKrn6PMkthgI2R8Z1RjdtKXh9v1TcvSyeO3jkGAyHi1sRd1dvhiKKDQ4AI78HI8ECVmcoTO49xbFzabZFeMRjMZagTi1rZRQq23O8qzQXh4-mH223oN4kOgIZ8vi"
            alt="Premium wagyu beef sizzling on a traditional charcoal grill"
          />
          <div className="relative z-20">
            <h1 className="text-3xl md:text-6xl font-extrabold tracking-tighter text-on-surface mb-2 uppercase">
              The Grill Master's Select
            </h1>
            <p className="text-tertiary text-sm md:text-lg font-light tracking-wide">
              Experience the charcoal mastery of Inari.
            </p>
          </div>
        </section>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex bg-surface-container-high px-5 py-3 rounded-xl items-center gap-3 mb-8 max-w-md">
          <span className="material-symbols-outlined text-tertiary">search</span>
          <input
            type="text"
            placeholder="Cari menu…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="material-symbols-outlined text-on-surface-variant text-base">
              close
            </button>
          )}
        </div>

        {/* Category Tabs — dari database */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {loading
            ? // Skeleton tabs
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-24 rounded-full bg-surface-container-high animate-pulse" />
              ))
            : categoryTabs.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`whitespace-nowrap px-6 md:px-8 py-2.5 md:py-3 font-bold tracking-widest text-[10px] md:text-xs uppercase transition-all duration-200 ${
                    activeCategory === cat.slug
                      ? 'bg-tertiary text-on-tertiary rounded-full shadow-lg shadow-tertiary/20'
                      : 'bg-surface-container-high text-on-surface-variant rounded-full hover:bg-surface-container-highest'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="col-span-full py-12 flex flex-col items-center gap-4 text-red-400">
            <span className="material-symbols-outlined text-5xl">error</span>
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {/* Loading Skeleton Grid */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-surface-container-low rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-surface-container-high" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-surface-container-high rounded w-3/4" />
                  <div className="h-3 bg-surface-container-high rounded w-full" />
                  <div className="h-3 bg-surface-container-high rounded w-2/3" />
                  <div className="h-8 bg-surface-container-high rounded w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Menu Grid — dari database */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col bg-surface-container-low rounded-2xl overflow-hidden transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src={item.image_url}
                    alt={item.name}
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400/1a1a2e/c9a96e?text=Inari'; }}
                  />
                  {item.badge && (
                    <div
                      className={`absolute top-4 right-4 ${item.badge_class || 'bg-tertiary text-on-tertiary'} px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase`}
                    >
                      {item.badge}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg md:text-xl font-bold text-on-surface mb-2 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-on-surface-variant text-xs md:text-sm mb-6 line-clamp-2 leading-relaxed font-light">
                    {item.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg md:text-xl font-bold text-tertiary">
                      <span className="opacity-50 text-xs md:text-sm">Rp </span>
                      {formatPrice(item.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center hover:bg-tertiary hover:text-on-tertiary transition-colors active:scale-90 shadow-md"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center gap-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl opacity-40">restaurant_menu</span>
                <p className="text-lg font-medium opacity-60">Tidak ada menu dalam kategori ini.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-8 right-8 z-40 bg-tertiary text-on-tertiary p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        >
          <div className="relative">
            <span className="material-symbols-outlined text-3xl">shopping_cart</span>
            <span className="absolute -top-2 -right-2 bg-on-background text-surface text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
        </Link>
      )}

      {/* Footer */}
      <footer className="bg-neutral-950 w-full py-12 px-12">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="flex items-center gap-2 text-neutral-500">
              <span className="material-symbols-outlined text-2xl">forest</span>
              <span className="text-lg font-black uppercase tracking-tighter">Inari Suki &amp; Grill</span>
            </div>
            <p className="text-neutral-500 text-sm opacity-80">© 2024 Inari Suki &amp; Grill. Modern Zen Mastery.</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-neutral-400 hover:text-tertiary transition-colors font-medium text-sm"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Menu;
