// authController.js
// Controller untuk menangani logika autentikasi — terhubung ke Express + MySQL backend

const BASE_URL = '/api'; // Express.js backend via Vite proxy

/**
 * Login user via Express API → MySQL.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: object, token?: string, error?: string}>}
 */
export async function loginUser(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Email dan password wajib diisi.' };
  }

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('inari_token', data.token);
      localStorage.setItem('inari_user', JSON.stringify(data.user));
      
      // Keep admin keys for compatibility with components that might use them specifically
      if (data.user.role === 'admin') {
        localStorage.setItem('inari_admin_token', data.token);
        localStorage.setItem('inari_admin', JSON.stringify(data.user));
      }
      return { success: true, user: data.user, token: data.token };
    }

    return { success: false, error: data.error || 'Login gagal.' };

  } catch (err) {
    return { success: false, error: 'Tidak dapat terhubung ke server. Pastikan XAMPP berjalan.' };
  }
}

/**
 * Register user baru via PHP API → MySQL.
 *
 * @param {{name: string, email: string, phone: string, password: string, confirmPassword: string}} formData
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function registerUser({ name, email, phone, password, confirmPassword }) {
  if (!name || !email || !phone || !password || !confirmPassword) {
    return { success: false, error: 'Semua field wajib diisi.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Password dan konfirmasi password tidak cocok.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter.' };
  }

  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, confirmPassword }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('inari_token', data.token);
      localStorage.setItem('inari_user', JSON.stringify(data.user));
      
      // Keep admin keys for compatibility with components that might use them specifically
      if (data.user.role === 'admin') {
        localStorage.setItem('inari_admin_token', data.token);
        localStorage.setItem('inari_admin', JSON.stringify(data.user));
      }
      return { success: true, user: data.user, token: data.token };
    }

    return { success: false, error: data.error || 'Registrasi gagal.' };

  } catch (err) {
    return { success: false, error: 'Tidak dapat terhubung ke server. Pastikan XAMPP berjalan.' };
  }
}

/**
 * Logout user — hapus sesi dari localStorage.
 */
export function logoutUser() {
  localStorage.removeItem('inari_user');
  localStorage.removeItem('inari_token');
  localStorage.removeItem('inari_admin');
  localStorage.removeItem('inari_admin_token');
}

/**
 * Ambil user yang sedang login dari localStorage.
 * @returns {object|null}
 */
export function getCurrentUser() {
  const raw = localStorage.getItem('inari_user');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Ambil token dari localStorage.
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem('inari_token');
}
