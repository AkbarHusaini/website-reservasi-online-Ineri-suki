import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../index.css';

function Home() {
  const { user, logout } = useAuth();
  const { cartItems, cartCount, addToCart } = useCart();
  const [slides, setSlides] = useState([]);
  const [specials, setSpecials] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Featured Items for Slider
        const menuRes = await fetch('/api/featured-menu');
        const menuData = await menuRes.json();
        if (menuData.success) {
          const mappedSlides = menuData.data.map(item => ({
            id: item.id,
            bg: item.image_url,
            cardImg: item.image_url,
            title: item.name,
            desc: item.description,
            price: `Rp ${Math.floor(item.price / 1000)}k`,
            rawPrice: item.price,
            badge: item.badge,
            badge_class: item.badge_class
          }));
          setSlides(mappedSlides);
        }

        // Fetch Specials for Chef's Specials section
        const pkgRes = await fetch('/api/packages');
        const pkgData = await pkgRes.json();
        if (pkgData.success) {
          setSpecials(pkgData.data.slice(0, 3)); // Take top 3
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides]);

  const handleHeroNav = (direction) => {
    if (slides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIdx((prev) => (prev + 1) % slides.length);
      } else {
        setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
      }
      setIsTransitioning(false);
    }, 500);
  };

  const startAutoPlay = () => {
    const scrollStep = 452;
    autoPlayRef.current = setInterval(() => {
      if (sliderRef.current) {
        if (sliderRef.current.scrollLeft + sliderRef.current.offsetWidth >= sliderRef.current.scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: scrollStep, behavior: 'smooth' });
        }
      }
    }, 4000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const handleScrollMenu = (direction) => {
    stopAutoPlay();
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: direction === 'left' ? -452 : 452, behavior: 'smooth' });
    }
    startAutoPlay();
  };

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.title,
      description: item.desc,
      price: item.rawPrice,
      img: item.cardImg,
      alt: item.title
    });
  };

  const slide = slides[currentIdx] || { bg: '', cardImg: '', title: 'Loading...', desc: '', price: '' };

  if (loading && slides.length === 0) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-tertiary animate-pulse text-2xl font-bold uppercase tracking-tighter">Ineri Suki & Grill</div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-tertiary/30">
      <Navbar activePage="home" />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden" id="hero-slider">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              alt="Premium Dining"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
              style={{ opacity: isTransitioning ? 0 : 0.6 }}
              src={slide.bg}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/30 border border-outline-variant/20 text-primary text-sm font-semibold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                Best Seller Selection
              </div>
              <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] text-on-surface uppercase">
                Ineri SUKI<br /><span className="text-gradient-ember italic">& GRILL</span>
              </h1>
              <p className="text-base md:text-xl text-on-surface-variant max-w-lg leading-relaxed font-light">
                Manjakan indra Anda dengan koleksi hidangan terpopuler kami yang dikurasi khusus untuk pecinta kuliner sejati.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-4">
                <Link to="/reservation" className="w-full sm:w-auto bg-tertiary-container text-on-tertiary-container px-8 py-4 rounded-xl font-bold text-lg hover:bg-tertiary transition-all shadow-xl shadow-black/40 group flex items-center justify-center">
                  Reservasi Sekarang
                  <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <Link to="/menu" className="flex items-center gap-2 text-on-surface font-semibold hover:text-tertiary transition-colors pl-2 sm:pl-0">
                  <span className="material-symbols-outlined">play_circle</span>
                  Lihat Menu
                </Link>

              </div>
              <div className="flex gap-3 pt-4">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentIdx(i);
                        setIsTransitioning(false);
                      }, 500);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIdx ? 'w-12 bg-tertiary' : 'w-3 bg-outline-variant/30 hover:bg-tertiary/50'}`}
                  />
                ))}
              </div>
            </div>
            {/* Hero Floating Card Slider */}
            <div className="hidden md:block relative h-[500px]">
              <div
                className={`relative rounded-2xl overflow-hidden border border-outline-variant/10 shadow-2xl transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100 rotate-2 hover:rotate-0'}`}
              >
                <img
                  alt="Signature Dish"
                  className="w-full aspect-[4/5] object-cover transition-all duration-700"
                  src={slide.cardImg}
                />
                <div className={`absolute bottom-6 left-6 right-6 p-6 rounded-xl transition-all duration-700`} style={{ background: 'rgba(20, 19, 19, 0.7)', backdropFilter: 'blur(20px)' }}>
                  <p className="text-tertiary font-bold uppercase text-xs tracking-[0.2em]">Featured Item</p>
                  <h3 className="text-2xl font-bold mt-1">{slide.title}</h3>
                  <p className="text-sm text-neutral-400 mt-2 font-light">{slide.desc}</p>
                  <div className="flex justify-between items-center mt-6">
                    <div className="flex gap-2">
                      <button onClick={() => handleHeroNav('prev')} className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-tertiary transition-all">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      <button onClick={() => handleHeroNav('next')} className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-tertiary transition-all">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                    <span className="text-tertiary font-black text-xl">{slide.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chef's Specials & Seasonal Offers */}
        <section className="py-32 bg-surface relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-tertiary/5 to-transparent opacity-50"></div>
          <div className="max-w-7xl mx-auto px-12 relative z-10">
            <div className="reveal-on-scroll flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-tertiary">
                  <span className="w-12 h-px bg-tertiary"></span>
                  <span className="text-xs font-black tracking-[0.3em] uppercase">Limited Edition</span>
                </div>
                <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase text-on-surface leading-tight">Chef's Specials <br />&amp; <span className="text-gradient-ember">Seasonal Offers</span></h2>
              </div>
              <p className="text-on-surface-variant max-w-sm text-lg font-light leading-relaxed">
                Cita rasa musiman yang dikurasi khusus oleh Chef kami untuk memberikan pengalaman kuliner yang tak terlupakan bulan ini.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {specials.map((item, idx) => (
                <div key={item.id || idx} className="reveal-on-scroll group relative flex flex-col h-full bg-surface-container-low rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                  <div className="relative h-[420px] overflow-hidden">
                    <img alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src={item.image_url} />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      {item.badge && <span className={`${item.badge_class || 'bg-tertiary text-on-tertiary-fixed'} px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg`}>{item.badge}</span>}
                    </div>
                  </div>
                  <div className="p-10 flex-grow flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold tracking-tight">{item.name}</h3>
                      <p className="text-on-surface-variant font-light leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-8">
                      <span className="text-3xl font-black text-tertiary">Rp {Math.floor(item.price / 1000)}k</span>
                      <Link to="/reservation" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-tertiary group-hover:text-on-tertiary-fixed transition-all duration-300">
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reservasi Meja Layout/Floor Plan */}
        <section className="py-32 bg-surface-container-low relative" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 0v100M10 0v100M90 0v100\' stroke=\'%23ffffff\' stroke-width=\'0.5\' fill=\'none\' opacity=\'0.05\'/%3E%3Cpath d=\'M0 50h100M0 10h100M0 90h100\' stroke=\'%23ffffff\' stroke-width=\'0.2\' fill=\'none\' opacity=\'0.03\'/%3E%3C/svg%3E")' }}>
          <div className="max-w-7xl mx-auto px-12 relative z-10">
            <div className="reveal-on-scroll flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tighter uppercase text-on-surface">Pilih Meja Favorit Anda</h2>
                <div className="h-1 w-24 bg-tertiary"></div>
                <p className="text-on-surface-variant max-w-md">Sistem reservasi real-time kami memungkinkan Anda memilih suasana yang paling sesuai untuk momen spesial Anda.</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-highest">
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/40 animate-pulse"></span>
                  <span className="text-sm font-medium">Tersedia</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[
                { id:'T1',  label:'Window Side',   icon:'table_restaurant' },
                { id:'T2',  label:'Garden View',   icon:'table_restaurant' },
                { id:'T3',  label:'Bar Counter',   icon:'table_restaurant' },
                { id:'T4',  label:'Center Hall',   icon:'table_restaurant' },
                { id:'T5',  label:'Grill Central', icon:'outdoor_grill'    },
                { id:'T7',  label:'Cozy Corner',   icon:'table_restaurant' },
                { id:'T8',  label:'Open Terrace',  icon:'table_restaurant' },
                { id:'T10', label:'VIP Lounge',    icon:'star'             },
              ].map(table => (
                <Link key={table.id} to="/reservation"
                  className="reveal-on-scroll group cursor-pointer bg-surface p-6 rounded-2xl border border-outline-variant/10 hover:border-tertiary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 flex flex-col items-center gap-4">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xl font-black text-outline-variant group-hover:text-tertiary/60 transition-colors">{table.id}</span>
                    <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase">Available</span>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-surface-container-highest group-hover:border-tertiary/30 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-3xl text-outline-variant group-hover:text-tertiary transition-colors">{table.icon}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold group-hover:text-tertiary transition-colors">{table.label}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wide">4 Pax</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Digital Menu Carousel */}
        <section className="py-32 bg-surface overflow-hidden">
          <div className="max-w-7xl mx-auto px-12">
            <div className="reveal-on-scroll flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
              <div className="space-y-2">
                <h2 className="text-5xl font-black tracking-tighter uppercase text-on-surface">Digital Menu</h2>
                <p className="text-tertiary font-medium tracking-widest uppercase text-sm">Pesan lebih awal, nikmati lebih cepat</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3">
                  <button onClick={() => handleScrollMenu('left')} className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-tertiary-container hover:text-on-tertiary-container transition-all group/nav">
                    <span className="material-symbols-outlined group-hover/nav:-translate-x-1 transition-transform">arrow_back</span>
                  </button>
                  <button onClick={() => handleScrollMenu('right')} className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-tertiary-container hover:text-on-tertiary-container transition-all group/nav">
                    <span className="material-symbols-outlined group-hover/nav:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
                <Link to="/cart" className="flex items-center gap-4 bg-surface-container-high p-4 rounded-2xl border border-outline-variant/10 hover:border-tertiary transition-colors group">
                  <div className="bg-tertiary-container/20 p-3 rounded-xl group-hover:bg-tertiary transition-colors">
                    <span className="material-symbols-outlined text-tertiary group-hover:text-on-tertiary transition-colors">shopping_cart</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Your Pre-Order</p>
                    <p className="text-lg font-black">{cartCount} Items <span className="text-tertiary mx-1">•</span> Rp {Math.floor(cartSubtotal / 1000)}k</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            <div
              ref={sliderRef}
              onMouseEnter={stopAutoPlay}
              onMouseLeave={startAutoPlay}
              className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory py-4 px-12 scroll-smooth"
            >
              {slides.map((item, index) => (
                <div key={item.id || index} className="reveal-on-scroll min-w-[320px] md:min-w-[420px] snap-center group/card relative bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/60">
                  <div className="relative h-72 overflow-hidden">
                    <img alt={item.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000" src={item.cardImg} />
                    {item.badge && <div className={`absolute top-4 right-4 ${item.badge_class || 'bg-tertiary text-on-tertiary-fixed'} px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase`}>{item.badge}</div>}
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-on-surface">{item.title}</h3>
                        <p className="text-sm text-on-surface-variant mt-2 font-light leading-relaxed">{item.desc}</p>
                      </div>
                      <span className="text-xl font-black text-tertiary">{item.price.replace('Rp ', '')}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-surface-container-highest rounded text-[10px] font-bold text-outline uppercase tracking-wider">Premium</span>
                      <span className="px-2 py-1 bg-surface-container-highest rounded text-[10px] font-bold text-outline uppercase tracking-wider">Fresh</span>
                    </div>
                    <button onClick={() => handleAddToCart(item)} className="w-full py-4 rounded-xl border border-outline-variant/30 font-bold hover:bg-tertiary-container hover:border-tertiary transition-all flex items-center justify-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
                      Pre-Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center pb-20">
              <Link to="/menu" className="text-on-surface-variant hover:text-tertiary font-bold flex items-center gap-2 border-b border-outline-variant/30 pb-2 transition-all group">
                Explore Full Menu
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">menu_book</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
