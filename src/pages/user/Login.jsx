import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../../authController';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);
    if (result.success) {
      login(result.user);
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col overflow-x-hidden">
      <main className="flex-grow flex items-center justify-center relative px-6 py-12">
        {/* Atmospheric Background Element */}
        <div className="inset-0 z-0 overflow-hidden pointer-events-none fixed" style={{ zIndex: -1 }}>
          <div className="absolute inset-0">
            <img alt="Sizzling Japanese Yakiniku Grill" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB-EwM1IvLECAMB8TCPFIz5aWANOKkOEzye-VKk3eqI9ssAQrrO8E7959fbSPgtRIKme5sgp_GpHx32lLCiNIDyUMmKPGj1WqKazbzjHnNMICl8Afxst7XXsyZyXWq9nEBnL9GAbs-60zAUQ-KtkJIHlNTGmQcLfv-P4CLYFH7WjoIjVaksfHs4t2lRFvIOj0JONI4ZUHR72fStmVG99PpECCyyNg_UyFX3gVcOCSJH2tzED18nIvI_PR6QdWPn8yVnhq4Ks9qKd25" />
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] bg-gradient-to-t from-black via-black/40 to-black/60"></div>
          </div>
        </div>

        <div className="w-full max-w-md z-10">
          {/* Branding Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-tertiary-container flex items-center justify-center rounded-xl shadow-2xl shadow-black/60 border border-white/5">
                <span className="material-symbols-outlined text-4xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>forest</span>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tighter uppercase text-on-surface mb-2">Inari Suki & Grill</h1>
            <p className="text-on-surface-variant font-light tracking-wide text-sm">Welcome back to the Charcoal & Silk experience.</p>
          </div>

          {/* Login Form Card */}
          <div className="glass-panel p-8 md:p-10 rounded-xl shadow-2xl border border-white/5">
            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* Error message */}
              {error && (
                <div className="bg-error-container/30 border border-error/30 text-error rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-tertiary px-1">Email Address</label>
                <input
                  className="w-full bg-surface-container-highest border-none focus:ring-0 text-on-surface px-4 py-4 rounded-lg placeholder:text-on-surface-variant/40 transition-all border-b-2 border-transparent focus:border-tertiary"
                  placeholder="chef@inarisuki.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Password</label>
                  <a className="text-xs font-medium text-on-surface-variant hover:text-tertiary transition-colors" href="#">Forgot Password?</a>
                </div>
                <input
                  className="w-full bg-surface-container-highest border-none focus:ring-0 text-on-surface px-4 py-4 rounded-lg placeholder:text-on-surface-variant/40 transition-all border-b-2 border-transparent focus:border-tertiary"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center px-1">
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input className="sr-only peer" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <div className="w-5 h-5 bg-surface-container-highest rounded border border-outline-variant/30 peer-checked:bg-tertiary peer-checked:border-tertiary transition-all"></div>
                  <span className="material-symbols-outlined absolute text-on-tertiary text-sm scale-0 peer-checked:scale-100 transition-transform">check</span>
                  <span className="ml-3 text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Remember my session</span>
                </label>
              </div>

              <button
                className="w-full bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary font-bold py-4 rounded-lg transition-all duration-300 transform active:scale-95 shadow-xl shadow-tertiary-container/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                {loading ? 'Signing In...' : 'Sign In to Inari'}
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-surface-container px-4 text-on-surface-variant/60">Or Continue With</span></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 bg-surface border border-outline-variant/20 hover:border-tertiary/40 py-3 rounded-lg transition-all group">
                <img alt="Google" className="w-5 h-5 opacity-80 group-hover:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9iIkruAumwldCVS_CtfmS6tXGANwcYGc8OFXfoV1tXjXaFn2JHGTD7BSI91zVZN8gbwObQKALJD2hiVl-nnu4NC50Slkhv-WULLgUQ9qM3SK_8Y1MfWG221LOwCokljpVOJJVIdMV5MzizCNBWLzXKd5Amtb-YVFhVVHfLIzezUuysmW4mq3iVH3hZW3_17C9QmitpUSZf5Ss2F-j4Ktm-Xsxo2LSZLjVzDrJrFW6_eCaFhhrNlUWQhtqjVb7pz4yw8piB4Ygzw7S" />
                <span className="text-sm font-semibold">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 bg-surface border border-outline-variant/20 hover:border-tertiary/40 py-3 rounded-lg transition-all group">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
                <span className="text-sm font-semibold">Apple</span>
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-center mt-8 text-on-surface-variant text-sm">
            New to the grill? 
            <Link className="text-tertiary font-bold hover:underline underline-offset-4 ml-1" to="/register">Create an account</Link>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="hidden lg:block absolute bottom-12 right-12 opacity-10">
          <span className="material-symbols-outlined text-[120px] text-tertiary">restaurant</span>
        </div>
        <div className="hidden lg:block absolute top-12 left-12 opacity-10">
          <span className="material-symbols-outlined text-[120px] text-primary">grid_view</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
