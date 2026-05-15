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
    <div className="bg-surface text-on-surface min-h-screen flex flex-col overflow-x-hidden font-body selection:bg-tertiary/30">
      <main className="flex-grow flex items-center justify-center relative px-6 py-20">
        {/* Atmospheric Background Element */}
        <div className="inset-0 z-0 overflow-hidden pointer-events-none fixed" style={{ zIndex: -1 }}>
          <div className="absolute inset-0">
            <img 
              alt="Ineri Suki & Grill Atmosphere" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs6mWxqSItrl9RdhRGFMphKZrbWS3dnoPg5s0s0xek4kPKBsW6OvlqL-4U0nUJHXDYv1LkdVtMBVtJsxj9OOxN4I_WAagrhFDgRcByBOzXStRHNMO7jljDQSZkvcM7evHYXZwZJ7Zc-9NnOMqJbWAi1E2_abl0w6YVA1WYkqFO1TWoHC-21Me0b8hu2_v7ZjPOLX48D7pIsr0k0GwBJh4qNKQ4ZgAM0ay5F-3h0jSkdeHs2wZ-JhtdPvHAPs3sCjfpqxFobfJOQE72" 
            />
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
          </div>
        </div>

        <div className="w-full max-w-lg z-10">
          {/* Branding Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center mb-4 hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-tertiary-container flex items-center justify-center rounded-2xl shadow-2xl shadow-black/60 border border-white/5">
                <span className="material-symbols-outlined text-3xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
              </div>
            </Link>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-on-surface mb-1">Ineri Suki & Grill</h1>
            <p className="text-tertiary font-bold tracking-[0.2em] text-xs uppercase mb-2">Suki & Grill Paling Nagih di Jember!</p>
            <p className="text-on-surface-variant font-light text-sm italic">"Makan Enak Gak Harus Mahal"</p>
          </div>

          {/* Registration Form Card */}
          <div className="glass-panel p-8 md:p-10 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/5">
            <header className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
              <p className="text-on-surface-variant text-sm font-light mt-1">Join us for a premium dining experience.</p>
            </header>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-error-container/20 border border-error/30 text-error rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-shake">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-tertiary/70 px-1">Full Name</label>
                  <input
                    name="name"
                    className="w-full bg-surface-container-highest/50 border border-white/5 focus:ring-1 focus:ring-tertiary/30 text-on-surface px-4 py-3.5 rounded-xl placeholder:text-on-surface-variant/30 transition-all outline-none"
                    placeholder="Enter your full name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-tertiary/70 px-1">Email Address</label>
                    <input
                      name="email"
                      className="w-full bg-surface-container-highest/50 border border-white/5 focus:ring-1 focus:ring-tertiary/30 text-on-surface px-4 py-3.5 rounded-xl placeholder:text-on-surface-variant/30 transition-all outline-none"
                      placeholder="email@example.com"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-tertiary/70 px-1">Phone Number</label>
                    <input
                      name="phone"
                      className="w-full bg-surface-container-highest/50 border border-white/5 focus:ring-1 focus:ring-tertiary/30 text-on-surface px-4 py-3.5 rounded-xl placeholder:text-on-surface-variant/30 transition-all outline-none"
                      placeholder="0812..."
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-tertiary/70 px-1">Password</label>
                    <input
                      name="password"
                      className="w-full bg-surface-container-highest/50 border border-white/5 focus:ring-1 focus:ring-tertiary/30 text-on-surface px-4 py-3.5 rounded-xl placeholder:text-on-surface-variant/30 transition-all outline-none"
                      placeholder="••••••••"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-tertiary/70 px-1">Confirm</label>
                    <input
                      name="confirmPassword"
                      className="w-full bg-surface-container-highest/50 border border-white/5 focus:ring-1 focus:ring-tertiary/30 text-on-surface px-4 py-3.5 rounded-xl placeholder:text-on-surface-variant/30 transition-all outline-none"
                      placeholder="••••••••"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* T&C */}
              <div className="flex items-start gap-3 py-2 px-1">
                <div className="pt-0.5">
                  <input 
                    name="terms" 
                    className="w-4 h-4 rounded border-white/10 bg-surface-container-highest text-tertiary focus:ring-offset-black focus:ring-tertiary transition-colors" 
                    id="terms" 
                    type="checkbox" 
                    checked={form.terms} 
                    onChange={handleChange} 
                  />
                </div>
                <label className="text-xs text-on-surface-variant leading-relaxed" htmlFor="terms">
                  I agree to the <a className="text-tertiary hover:underline" href="#">Terms & Conditions</a> and privacy policy.
                </label>
              </div>

              <button
                className="w-full bg-tertiary text-on-tertiary font-bold py-4 rounded-xl transition-all duration-300 transform active:scale-95 shadow-xl shadow-tertiary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <p className="text-center mt-8 text-on-surface-variant text-sm">
            Already have an account?
            <Link className="text-tertiary font-bold hover:underline underline-offset-4 ml-1" to="/login">Sign In instead</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Register;

