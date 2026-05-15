import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../authController';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    if (!form.terms) {
      setError('Anda harus menyetujui Terms & Conditions untuk melanjutkan.');
      return;
    }

    setLoading(true);
    const result = await registerUser(form);
    setLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        login(result.user);
        navigate('/');
      }
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="bg-background text-on-background font-body selection:bg-tertiary selection:text-on-tertiary min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-neutral-900/70 backdrop-blur-xl shadow-2xl shadow-black/20">
        <div className="flex justify-between items-center px-12 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="Ineri Suki & Grill Logo" 
              className="w-8 h-8 rounded-full border border-white/10"
            />
            <div className="text-xl font-bold tracking-tighter text-neutral-100 uppercase Manrope">
              Ineri Suki & Grill
            </div>
          </div>
          <Link className="text-neutral-300 font-medium hover:text-white transition-colors flex items-center gap-2" to="/">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="min-h-screen flex items-stretch pt-16 flex-grow">
        {/* Visual Brand Side */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-lowest">
          <div className="absolute inset-0 z-0 bamboo-overlay-vertical opacity-20"></div>
          <img className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Ineri Suki & Grill Atmosphere" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs6mWxqSItrl9RdhRGFMphKZrbWS3dnoPg5s0s0xek4kPKBsW6OvlqL-4U0nUJHXDYv1LkdVtMBVtJsxj9OOxN4I_WAagrhFDgRcByBOzXStRHNMO7jljDQSZkvcM7evHYXZwZJ7Zc-9NnOMqJbWAi1E2_abl0w6YVA1WYkqFO1TWoHC-21Me0b8hu2_v7ZjPOLX48D7pIsr0k0GwBJh4qNKQ4ZgAM0ay5F-3h0jSkdeHs2wZ-JhtdPvHAPs3sCjfpqxFobfJOQE72" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="relative z-10 self-end p-20 max-w-xl">
            <div className="w-20 h-20 mb-8 rounded-full border-2 border-tertiary overflow-hidden shadow-2xl">
              <img 
                src="/images/logo.png" 
                alt="Ineri Suki & Grill Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-6xl font-headline font-extrabold tracking-tighter text-on-surface mb-6 leading-none uppercase">
              SUKI & GRILL <br /><span className="text-tertiary">PALING NAGIH</span> <br />DI JEMBER!
            </h2>
            <p className="text-lg text-on-surface-variant leading-relaxed font-light italic">
              "Makan enak gak harus mahal."
            </p>
            <p className="text-base text-on-surface-variant leading-relaxed font-light mt-4">
              Nikmati kelezatan Suki & Grill pilihan terbaik dengan harga yang ramah di kantong, hanya di Ineri Suki & Grill.
            </p>
            <div className="mt-12 w-24 h-1 bg-tertiary-container"></div>
          </div>
        </div>

        {/* Registration Form Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-surface">
          <div className="w-full max-w-md space-y-10">
            <header className="space-y-4">
              <h1 className="text-4xl font-headline font-bold tracking-tight text-on-surface">Daftar Akun Baru</h1>
              <p className="text-on-surface-variant font-light">Silakan isi data diri Anda untuk mulai menikmati layanan reservasi Ineri Suki & Grill.</p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* Error message */}
              {error && (
                <div className="bg-error-container/30 border border-error/30 text-error rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {/* Full Name */}
                <div className="relative group">
                  <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Nama Lengkap</label>
                  <div className="bg-surface-container-highest p-4 rounded-lg focus-within:border-b-2 focus-within:border-tertiary transition-all">
                    <input name="name" className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-neutral-600 focus:ring-0 font-medium" placeholder="Masukkan nama lengkap" type="text" value={form.name} onChange={handleChange} required />
                  </div>
                </div>

                {/* Email */}
                <div className="relative group">
                  <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Alamat Email</label>
                  <div className="bg-surface-container-highest p-4 rounded-lg focus-within:border-b-2 focus-within:border-tertiary transition-all">
                    <input name="email" className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-neutral-600 focus:ring-0 font-medium" placeholder="email@contoh.com" type="email" value={form.email} onChange={handleChange} required />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="relative group">
                  <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Nomor Telepon</label>
                  <div className="bg-surface-container-highest p-4 rounded-lg focus-within:border-b-2 focus-within:border-tertiary transition-all">
                    <input name="phone" className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-neutral-600 focus:ring-0 font-medium" placeholder="081234567890" type="tel" value={form.phone} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="relative group">
                    <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Kata Sandi</label>
                    <div className="bg-surface-container-highest p-4 rounded-lg focus-within:border-b-2 focus-within:border-tertiary transition-all">
                      <input name="password" className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-neutral-600 focus:ring-0 font-medium" placeholder="••••••••" type="password" value={form.password} onChange={handleChange} required />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative group">
                    <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Konfirmasi</label>
                    <div className="bg-surface-container-highest p-4 rounded-lg focus-within:border-b-2 focus-within:border-tertiary transition-all">
                      <input name="confirmPassword" className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-neutral-600 focus:ring-0 font-medium" placeholder="••••••••" type="password" value={form.confirmPassword} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
              </div>

              {/* T&C Checkbox */}
              <div className="flex items-start gap-4 py-2">
                <div className="pt-1">
                  <input name="terms" className="w-5 h-5 rounded border-none bg-surface-container-highest text-tertiary-container focus:ring-offset-background focus:ring-tertiary" id="terms" type="checkbox" checked={form.terms} onChange={handleChange} />
                </div>
                <label className="text-sm text-on-surface-variant leading-tight" htmlFor="terms">
                  Saya setuju dengan <a className="text-tertiary hover:underline" href="#">Syarat & Ketentuan</a> dan memahami <a className="text-tertiary hover:underline" href="#">Kebijakan Privasi</a> yang berlaku.
                </label>
              </div>

              <button
                className="w-full py-5 bg-tertiary-container text-on-tertiary-container font-bold rounded-lg hover:bg-tertiary transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-tertiary-container/10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>
            </form>

            <footer className="pt-8 text-center">
              <p className="text-on-surface-variant text-sm">
                Sudah punya akun?
                <Link className="text-on-surface font-bold hover:text-tertiary transition-colors ml-1" to="/login">Masuk di sini</Link>
              </p>
            </footer>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Register;


