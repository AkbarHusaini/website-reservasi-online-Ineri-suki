import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PaymentPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snapToken, setSnapToken] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const token = localStorage.getItem('Ineri_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch(`/api/my-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const found = data.data.find(o => o.id === parseInt(orderId));
                if (found) {
                    setOrder(found);
                    createMidtransToken(found);
                } else {
                    setError("Pesanan tidak ditemukan.");
                }
            } else {
                setError(data.error || "Gagal mengambil data pesanan.");
            }
        } catch (err) {
            setError("Gagal mengambil data pesanan.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createMidtransToken = async (orderData) => {
        try {
            const userRaw = localStorage.getItem('Ineri_user');
            const user = userRaw ? JSON.parse(userRaw) : {};

            const res = await fetch('/api/payments/create-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderData.id,
                    amount: orderData.total_price,
                    customerDetails: {
                        name: user.name || 'Customer',
                        email: user.email || 'customer@example.com',
                        phone: user.phone || ''
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                setSnapToken(data.snapToken);
            } else {
                setError(data.message || "Gagal mendapatkan token pembayaran.");
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem saat menghubungi Midtrans.");
            console.error("Error creating Midtrans token:", err);
        }
    };

    const [showSuccess, setShowSuccess] = useState(false);

    const handlePayment = async () => {
        if (!snapToken) return;

        window.snap.pay(snapToken, {
            onSuccess: async function (result) {
                console.log('success', result);
                await updateStatusInstantly();
            },
            onPending: async function (result) {
                console.log('pending', result);
                await updateStatusInstantly();
            },
            onError: function (result) {
                console.log('error', result);
                setError("Pembayaran gagal. Silakan coba lagi.");
            },
            onClose: async function () {
                console.log('customer closed the popup');
                await updateStatusInstantly();
            }
        });
    };

    const updateStatusInstantly = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/payments/status/${orderId}?simulate=true`);
            const data = await res.json();
            if (data.success) {
                setShowSuccess(true);
            } else {
                setError(`Gagal sinkronisasi status: ${data.message}`);
            }
        } catch (e) {
            console.error("Gagal update status simulasi", e);
            setError("Gagal memperbarui status secara instan.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-tertiary border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-tertiary font-bold tracking-widest animate-pulse uppercase text-xs">Processing Order...</div>
        </div>
    );

    const subtotal = Number(order?.total_price) || 0;
    const tax = Math.round(subtotal * 0.1);
    const serviceFee = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + tax + serviceFee;

    const SuccessModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="bg-surface-container rounded-[40px] border border-tertiary/30 max-w-sm w-full p-10 text-center relative overflow-hidden shadow-[0_0_80px_rgba(255,181,154,0.1)]">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-tertiary via-orange-400 to-tertiary"></div>
                
                <div className="w-24 h-24 bg-tertiary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <span className="material-symbols-outlined text-5xl text-tertiary">check_circle</span>
                </div>
                
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Pembayaran Berhasil!</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-10">
                    Terima kasih atas pesanan Anda. Kami telah menerima pembayaran dan akan segera menyiapkan hidangan Anda.
                </p>
                
                <button 
                    onClick={() => navigate('/my-orders')}
                    className="w-full py-5 bg-tertiary text-on-tertiary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-tertiary/20"
                >
                    Lihat Pesanan Saya
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-on-surface font-body selection:bg-tertiary/30">
            <Navbar />
            {showSuccess && <SuccessModal />}
            
            <main className="pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 relative z-10">
                    
                    {/* Left Side: Order Summary */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2">Checkout</h1>
                            <p className="text-sm md:text-base text-on-surface-variant">Satu langkah lagi untuk menikmati hidangan Ineri.</p>
                        </div>

                        <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 space-y-6 backdrop-blur-md">
                            <div className="flex items-center gap-4 border-b border-outline-variant/10 pb-4">
                                <div className="w-12 h-12 bg-tertiary/10 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-tertiary">shopping_bag</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Order ID</p>
                                    <p className="text-lg font-black text-white">#ORD-{orderId}</p>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {order?.items && order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface-variant group-hover:bg-tertiary/20 group-hover:text-tertiary transition-colors">
                                                {item.quantity}x
                                            </div>
                                            <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{item.item_name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-on-surface">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-outline-variant/10 space-y-2">
                                <div className="flex justify-between text-xs text-on-surface-variant">
                                    <span>Subtotal</span>
                                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-xs text-on-surface-variant">
                                    <span>Pajak (10%)</span>
                                    <span>Rp {tax.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-xs text-on-surface-variant">
                                    <span>Biaya Layanan (5%)</span>
                                    <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Payment Action */}
                    <div className="flex flex-col justify-end">
                        <div className="bg-surface-container rounded-3xl p-8 border border-tertiary/20 shadow-2xl shadow-tertiary/5 relative overflow-hidden group">
                            {/* Decorative Glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-tertiary/20 rounded-full blur-3xl group-hover:bg-tertiary/30 transition-all duration-700"></div>

                            <div className="relative z-10">
                                <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-1">Total Pembayaran</p>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter">
                                    <span className="text-lg font-medium text-on-surface-variant mr-2 italic">IDR</span>
                                    {grandTotal.toLocaleString('id-ID')}
                                </h2>

                                {error && (
                                    <div className="mb-6 p-4 bg-error-container/20 border border-error/30 rounded-2xl flex items-center gap-3 animate-shake">
                                        <span className="material-symbols-outlined text-error">warning</span>
                                        <p className="text-xs text-error font-medium">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handlePayment}
                                    disabled={!snapToken || error}
                                    className="w-full group/btn relative py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-tertiary via-orange-400 to-tertiary bg-[length:200%_100%] animate-gradient-x group-hover/btn:scale-105 transition-transform"></div>
                                    <span className="relative flex items-center justify-center gap-3 text-on-tertiary">
                                        {snapToken ? 'Bayar Sekarang' : 'Menyiapkan...'}
                                        <span className="material-symbols-outlined text-base group-hover/btn:translate-x-1 transition-transform">arrow_forward_ios</span>
                                    </span>
                                </button>

                                <div className="mt-8 grid grid-cols-3 gap-4 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700">
                                    <div className="h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg p-2 text-[10px] font-bold">VISA</div>
                                    <div className="h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg p-2 text-[10px] font-bold">QRIS</div>
                                    <div className="h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg p-2 text-[10px] font-bold">GOPAY</div>
                                </div>

                                <p className="text-[10px] text-center text-on-surface-variant/40 mt-8 leading-relaxed">
                                    Secure 256-bit SSL Encrypted Payment<br/>
                                    Powered by Midtrans Snap Engine
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/my-orders')}
                            className="mt-6 text-xs font-bold text-on-surface-variant hover:text-tertiary transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Lihat Pesanan Saya
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
