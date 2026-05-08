import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../authController';
import { useAuth } from '../../context/AuthContext';

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
          <div className="text-xl font-bold tracking-tighter text-neutral-100 uppercase Manrope">
            Inari Suki & Grill
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
          <img className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Moody high-end close-up of fresh salmon nigiri sushi" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs6mWxqSItrl9RdhRGFMphKZrbWS3dnoPg5s0s0xek4kPKBsW6OvlqL-4U0nUJHXDYv1LkdVtMBVtJsxj9OOxN4I_WAagrhFDgRcByBOzXStRHNMO7jljDQSZkvcM7evHYXZwZJ7Zc-9NnOMqJbWAi1E2_abl0w6YVA1WYkqFO1TWoHC-21Me0b8hu2_v7ZjPOLX48D7pIsr0k0GwBJh4qNKQ4ZgAM0ay5F-3h0jSkdeHs2wZ-JhtdPvHAPs3sCjfpqxFobfJOQE72" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="relative z-10 self-end p-20 max-w-xl">
            <h2 className="text-6xl font-headline font-extrabold tracking-tighter text-on-surface mb-6 leading-none">
              JOIN THE <span className="text-tertiary">INNER CIRCLE</span>
            </h2>
            <p className="text-lg text-on-surface-variant leading-relaxed font-light">
              Experience the precision of Zen mastery and the warmth of the grill. Exclusive reservations and seasonal previews await our members.
            </p>
            <div className="mt-12 w-24 h-1 bg-tertiary-container"></div>
          </div>
        </div>

        {/* Registration Form Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-surface">
          <div className="w-full max-w-md space-y-10">
            <header className="space-y-4">
              <h1 className="text-4xl font-headline font-bold tracking-tight text-on-surface">Begin Your Journey</h1>
              <p className="text-on-surface-variant font-light">Create an account to manage your reservations and culinary preferences.</p>
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
                  <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Full Name</label>
                  <div className="bg-surface-container-highest p-4 rounded-lg focus-within:border-b-2 focus-within:border-tertiary transition-all">
                    <input name="name" className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-neutral-600 focus:ring-0 font-medium" placeholder="Arata Isozaki" type="text" value={form.name} onChange={handleChange} required />
                  </div>
                </div>

                {/* Email */}
                <div className="relative group">
                  <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Email Address</label>
                  <div className="bg-surface-container-highest p-4 rounded-lg focus-within:border-b-2 focus-within:border-tertiary transition-all">
                    <input name="email" className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-neutral-600 focus:ring-0 font-medium" placeholder="arata@inari.culinary" type="email" value={form.email} onChange={handleChange} required />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="relative group">
                  <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Phone Number</label>
                  <div className="bg-surface-container-highest p-4 rounded-lg focus-within:border-b-2 focus-within:border-tertiary transition-all">
                    <input name="phone" className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-neutral-600 focus:ring-0 font-medium" placeholder="+62 812 3456 7890" type="tel" value={form.phone} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="relative group">
                    <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Password</label>
                    <div className="bg-surface-container-highest p-4 rounded-lg focus-within:border-b-2 focus-within:border-tertiary transition-all">
                      <input name="password" className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-neutral-600 focus:ring-0 font-medium" placeholder="••••••••" type="password" value={form.password} onChange={handleChange} required />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative group">
                    <label className="block text-[10px] uppercase tracking-widest text-tertiary font-bold mb-2">Confirm</label>
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
                  I agree to the <a className="text-tertiary hover:underline" href="#">Terms & Conditions</a> and understand the <a className="text-tertiary hover:underline" href="#">Privacy Policy</a> regarding my dining data.
                </label>
              </div>

              <button
                className="w-full py-5 bg-tertiary-container text-on-tertiary-container font-bold rounded-lg hover:bg-tertiary transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-tertiary-container/10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                {loading ? 'Creating Account...' : 'Create My Account'}
              </button>
            </form>

            <footer className="pt-8 text-center">
              <p className="text-on-surface-variant text-sm">
                Already have an account?
                <Link className="text-on-surface font-bold hover:text-tertiary transition-colors ml-1" to="/login">Login</Link>
              </p>
            </footer>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 w-full py-12 px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-screen-2xl mx-auto">
          <div className="text-lg font-black text-neutral-500 uppercase">Inari Suki & Grill</div>
          <div className="text-neutral-500 text-sm font-light Manrope body-sm tracking-wide">© 2024 Inari Suki & Grill. Modern Zen Mastery.</div>
          <nav className="flex gap-8">
            <a className="text-neutral-500 hover:text-orange-400 text-sm hover:underline decoration-orange-600 underline-offset-4 transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
            <a className="text-neutral-500 hover:text-orange-400 text-sm hover:underline decoration-orange-600 underline-offset-4 transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
            <a className="text-neutral-500 hover:text-orange-400 text-sm hover:underline decoration-orange-600 underline-offset-4 transition-all opacity-80 hover:opacity-100" href="#">Sustainability</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default Register;
