import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar({ activePage }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', key: 'home' },
    { name: 'Menu', path: '/menu', key: 'menu' },
    { name: 'Reservasi', path: '/reservation', key: 'reservation' },
    { name: 'About', path: '/about', key: 'about' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-2xl shadow-black/20" style={{ background: 'rgba(20, 19, 19, 0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-screen-2xl mx-auto">
        <Link to="/" className="flex items-center gap-2 md:gap-3 group">
          <img 
            src="/images/logo.webp" 
            alt="Ineri Suki & Grill Logo" 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 shadow-lg group-hover:scale-105 transition-transform"
          />
          <span className="text-lg md:text-xl font-bold tracking-tighter text-neutral-100 uppercase Manrope">Ineri Suki & Grill</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            link.path.startsWith('#') ? (
              <a
                key={link.key}
                href={link.path}
                className={`font-medium transition-colors Manrope ${activePage === link.key ? 'text-tertiary font-semibold border-b-2 border-tertiary pb-0.5' : 'text-neutral-300 hover:text-white'}`}
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.key}
                to={link.path}
                className={`font-medium transition-colors Manrope ${activePage === link.key ? 'text-tertiary font-semibold border-b-2 border-tertiary pb-0.5' : 'text-neutral-300 hover:text-white'}`}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 hover:bg-white/5 transition-all duration-300 rounded-full flex items-center justify-center mr-2">
            <span className="material-symbols-outlined text-tertiary text-2xl md:text-[28px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-tertiary/20">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 mr-2">
                <span className="text-neutral-300 font-medium text-sm">Hai, {(user?.name || 'User').split(' ')[0]}</span>
                <Link to="/my-orders" className="text-neutral-300 font-semibold hover:text-white transition-colors text-sm">Pesanan Saya</Link>
                <button onClick={logout} className="text-error font-semibold hover:text-error/80 transition-colors text-sm">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-neutral-300 font-semibold hover:text-white transition-colors text-sm">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded-lg border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest transition-all">
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-neutral-100 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-neutral-900/95 backdrop-blur-xl border-t border-white/5 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[80vh] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
        <div className="flex flex-col items-center gap-6 px-6">
          {navLinks.map((link) => (
            link.path.startsWith('#') ? (
              <a
                key={link.key}
                href={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium text-lg transition-colors ${activePage === link.key ? 'text-tertiary font-bold text-xl uppercase tracking-widest' : 'text-neutral-300 hover:text-white'}`}
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.key}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium text-lg transition-colors ${activePage === link.key ? 'text-tertiary font-bold text-xl uppercase tracking-widest' : 'text-neutral-300 hover:text-white'}`}
              >
                {link.name}
              </Link>
            )
          ))}

          <div className="w-full h-px bg-white/10 my-2"></div>

          {user ? (
            <div className="flex flex-col items-center gap-4">
              <span className="text-neutral-400">Login sebagai: <span className="text-neutral-100 font-bold">{user.name}</span></span>
              <Link onClick={() => setIsMenuOpen(false)} to="/my-orders" className="w-full py-3 text-center bg-white/10 text-white rounded-xl font-bold">Pesanan Saya</Link>
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full py-3 bg-error/10 text-error rounded-xl font-bold">Logout</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full">
              <Link onClick={() => setIsMenuOpen(false)} to="/login" className="py-3 text-center rounded-xl border border-white/10 font-bold text-neutral-300">Login</Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/register" className="py-3 text-center rounded-xl bg-white/10 font-bold text-white">Daftar</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
