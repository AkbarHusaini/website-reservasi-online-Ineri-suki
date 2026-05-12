import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] w-full py-12 px-8 md:px-12 border-t border-[#42474b]/15">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2 text-[#ffb59a]">
            <span className="material-symbols-outlined text-2xl">restaurant</span>
            <span className="text-lg font-black uppercase tracking-tighter">Ineri Suki & Grill</span>
          </div>
          <p className="text-slate-500 text-sm tracking-wide">
            © 2024 Ineri Suki & Grill Jember. Semua Hak Dilindungi.
          </p>
        </div>

        {/* Right Side: Simple Social Links */}
        <div className="flex items-center gap-6">
          <a 
            href="https://www.instagram.com/inerisuki.jember/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-[#ffb59a] transition-all group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">photo_camera</span>
            <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Instagram</span>
          </a>
          <div className="h-4 w-px bg-[#42474b]/30"></div>
          <a 
            href="https://wa.me/6285335540992" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-green-500 transition-all group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">chat</span>
            <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
