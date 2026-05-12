import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser, loginWithGoogle } from '../../authController';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);
    // Simulasi: Menggunakan email Google default
    const googleEmail = "akbar@gmail.com"; 
    const googleName = "Akbar Google";

    const result = await loginWithGoogle(googleEmail, googleName);
    setLoading(false);

    if (result.success) {
      login(result.user);
      navigate(from, { replace: true });
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
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-on-surface">Sign In</h2>
              <p className="text-on-surface-variant text-sm mt-1">Access your account securely</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-error-container/30 border border-error/30 text-error rounded-lg px-4 py-3 text-sm flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}

            {/* Social Logins */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-surface border border-outline-variant/20 hover:border-tertiary hover:bg-tertiary-container/10 py-4 rounded-lg transition-all group disabled:opacity-50 shadow-lg hover:shadow-tertiary/10"
              >
                <img alt="Google" className="w-6 h-6 opacity-80 group-hover:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9iIkruAumwldCVS_CtfmS6tXGANwcYGc8OFXfoV1tXjXaFn2JHGTD7BSI91zVZN8gbwObQKALJD2hiVl-nnu4NC50Slkhv-WULLgUQ9qM3SK_8Y1MfWG221LOwCokljpVOJJVIdMV5MzizCNBWLzXKd5Amtb-YVFhVVHfLIzezUuysmW4mq3iVH3hZW3_17C9QmitpUSZf5Ss2F-j4Ktm-Xsxo2LSZLjVzDrJrFW6_eCaFhhrNlUWQhtqjVb7pz4yw8piB4Ygzw7S" />
                <span className="text-base font-bold">Continue with Google</span>
              </button>
            </div>
            
            <p className="text-center mt-8 text-on-surface-variant/40 text-[10px] uppercase tracking-widest font-bold">
              Securely powered by Inari Auth
            </p>
          </div>
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
