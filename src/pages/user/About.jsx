import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../index.css';

function About() {
  const { user, logout } = useAuth();
  
  return (
    <div className="bg-[#131313] text-[#e5e2e1] font-['Manrope'] selection:bg-[#ffb59a]/30">
      <Navbar activePage="about" />

      <main>
        {/* Hero Section */}
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden pt-20">
          <img 
            alt="Suki and Grill" 
            className="absolute inset-0 w-full h-full object-cover opacity-30" 
            src="/gambar/about-hero.webp" 
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#131313]"></div>
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <span className="text-[#ffb59a] text-xs font-bold tracking-[0.4em] uppercase mb-8 block animate-fade-in">Ineri Suki & Grill Jember</span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-[#e5e2e1] mb-6 leading-tight">
              Makan Ala Resto,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb59a] to-[#ffbea7]">Harga Ramah di Kantong.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mt-6">
              Pilihan favorit anak muda dan keluarga di Jember untuk menikmati Suki, Grill, Bento, dan Dimsum berkualitas.
            </p>
          </div>
        </section>

        {/* The Ineri Story */}
        <section className="py-32 px-8 md:px-24">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-20 items-center">
            <div className="md:w-1/2 space-y-8">
              <div className="inline-block bg-[#1c1b1b] border border-[#42474b]/30 px-4 py-2 rounded-full">
                <span className="text-[#ffb59a] text-[10px] font-black tracking-[0.3em] uppercase">Cerita Kami</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight">Hadir Untuk Warga Jember</h2>
              <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
                <p>
                  Berawal dari keinginan untuk menyajikan pengalaman makan ala restoran mewah yang bisa dinikmati oleh semua kalangan, <strong className="text-[#e5e2e1]">Ineri Suki & Grill</strong> hadir di Jember.
                </p>
                <p>
                  Kami percaya bahwa kebersamaan saat memanggang daging atau menikmati hangatnya kuah suki tidak harus mahal. Dengan paket berdua mulai dari <strong className="text-[#ffb59a]">Rp 80.000-an</strong>, Ineri menjadi solusi tempat makan yang nyaman, lezat, dan terjangkau untuk mahasiswa (anak kos) maupun keluarga.
                </p>
              </div>
            </div>
            <div className="md:w-1/2 relative group">
              <div className="absolute inset-0 bg-[#ffb59a] blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
              <img 
                loading="lazy"
                className="w-full rounded-3xl relative z-10 border border-[#42474b]/30 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" 
                alt="Grill and Suki experience" 
                src="/gambar/about-story.webp" 
              />
            </div>
          </div>
        </section>

        {/* Layanan Kami */}
        <section className="py-32 px-8 bg-[#0e0e0e] border-y border-[#42474b]/15">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">Layanan & Penawaran</h2>
              <p className="text-slate-400">Pilihan lengkap untuk segala kebutuhan acara Anda.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Suki & Grill */}
              <div className="bg-[#1c1b1b] p-10 rounded-3xl border border-[#42474b]/20 hover:border-[#ffb59a]/50 transition-colors group">
                <div className="w-16 h-16 rounded-full bg-[#3e5b68]/20 text-[#adcbda] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Suki & Grill</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Paket hemat berdua cuma 80rb-an. Nikmati daging grill berkualitas dan kuah suki yang kaya rasa.
                </p>
              </div>

              {/* Bento & Dimsum */}
              <div className="bg-[#1c1b1b] p-10 rounded-3xl border border-[#42474b]/20 hover:border-[#ffb59a]/50 transition-colors group">
                <div className="w-16 h-16 rounded-full bg-[#9c3400]/20 text-[#ffb59a] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">restaurant</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Bento & Dimsum</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Pilihan cepat dan lezat mulai dari @15ribu. Cocok untuk makan siang atau camilan ringan.
                </p>
              </div>

              {/* Home Service & Catering */}
              <div className="bg-[#1c1b1b] p-10 rounded-3xl border border-[#42474b]/20 hover:border-[#ffb59a]/50 transition-colors group">
                <div className="w-16 h-16 rounded-full bg-[#3e5b68]/20 text-[#adcbda] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">takeout_dining</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Home Service & Catering</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Catering kantor cuma @20ribu. Kami juga menyediakan Home Service (alat & bahan diantar ke rumah).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Informasi Operasional */}
        <section className="py-32 px-8">
          <div className="max-w-6xl mx-auto bg-[#1c1b1b] rounded-3xl border border-[#42474b]/20 overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 p-12 md:p-20 bg-[#9c3400] text-[#ffbea7] flex flex-col justify-center">
              <h2 className="text-4xl font-extrabold text-white mb-6">Buka Setiap Hari</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-3xl text-[#ffb59a]">schedule</span>
                  <div>
                    <p className="font-bold text-white text-lg">Senin - Minggu</p>
                    <p className="text-[#ffb59a] text-xl font-black">09.00 - 21.00 WIB</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-3xl text-[#ffb59a]">info</span>
                  <p className="font-medium text-white text-lg">Open Reservasi Dine-in & Home Service</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ffb59a]">location_on</span>
                Cabang Kami di Jember
              </h3>
              <ul className="space-y-6">
                <li className="flex flex-col border-b border-[#42474b]/20 pb-4">
                  <span className="font-bold text-lg text-[#e5e2e1]">Sumbersari / Roxy</span>
                  <span className="text-slate-400 text-sm">Jl. Sriwijaya 18 No. 6</span>
                </li>
                <li className="flex flex-col border-b border-[#42474b]/20 pb-4">
                  <span className="font-bold text-lg text-[#e5e2e1]">Kaliwates</span>
                </li>
                <li className="flex flex-col border-b border-[#42474b]/20 pb-4">
                  <span className="font-bold text-lg text-[#e5e2e1]">Danau Toba</span>
                </li>
                <li className="flex flex-col pb-4">
                  <span className="font-bold text-lg text-[#e5e2e1]">Unmuh Jember</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 px-8 text-center bg-[#0e0e0e] border-t border-[#42474b]/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#ffb59a] blur-[150px] opacity-10 rounded-full mx-auto w-[600px] h-[600px] -top-[300px]"></div>
          <div className="max-w-3xl mx-auto space-y-12 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-[#e5e2e1] tracking-tighter">Reservasi Sekarang</h2>
            <p className="text-slate-400 text-lg font-medium tracking-wide">
              Pilih cabang terdekat dan nikmati keseruan nge-grill bareng teman dan keluarga!
            </p>
            <div className="pt-8">
              <Link to="/reservation" className="bg-[#9c3400] text-white px-12 py-5 rounded-full text-sm font-bold hover:bg-[#ffb59a] hover:text-[#5b1b00] transition-all duration-300 shadow-[0_0_40px_rgba(156,52,0,0.4)] hover:shadow-[0_0_60px_rgba(255,181,154,0.6)]">
                Pesan Meja
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;
