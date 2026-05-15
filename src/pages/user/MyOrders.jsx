import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function MyOrders() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('Ineri_token') || localStorage.getItem('IneriToken');
      if (!token) {
        setError('Sesi Anda tidak valid atau token hilang. Silakan logout dan login kembali.');
        setLoading(false);
        logout();
        return;
      }

      try {
        const response = await fetch('/api/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.error || 'Gagal mengambil data pesanan.');
        }
      } catch (err) {
        console.error(err);
        setError('Gagal memuat pesanan. Periksa koneksi Anda.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (price) => {
    return Number(price).toLocaleString('id-ID');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // Ambil HH:mm saja
  };

  const getStatusBadge = (status, refund_status, notes) => {
    const isRefundPending = refund_status === 'pending' || (notes && notes.includes('[REFUND REQUEST]'));
    const isRefundProcessed = refund_status === 'processed' || (notes && notes.includes('[REFUND PROCESSED]'));

    if (status === 'cancelled' && isRefundPending) {
      return <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full uppercase tracking-wider font-bold">Refund Diproses</span>;
    }
    if (status === 'cancelled' && isRefundProcessed) {
      return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 text-xs rounded-full uppercase tracking-wider font-bold">Refund Selesai</span>;
    }

    switch (status) {
      case 'cart': return <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs rounded-full uppercase tracking-wider font-bold">Keranjang</span>;
      case 'pending': return <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full uppercase tracking-wider font-bold">Menunggu Pembayaran</span>;
      case 'paid': return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 text-xs rounded-full uppercase tracking-wider font-bold">Lunas</span>;
      case 'preparing': return <span className="px-3 py-1 bg-sky-500/20 text-sky-500 text-xs rounded-full uppercase tracking-wider font-bold">Diproses</span>;
      case 'served': return <span className="px-3 py-1 bg-violet-500/20 text-violet-500 text-xs rounded-full uppercase tracking-wider font-bold">Selesai</span>;
      case 'cancelled': return <span className="px-3 py-1 bg-rose-500/20 text-rose-500 text-xs rounded-full uppercase tracking-wider font-bold">Dibatalkan</span>;
      default: return <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs rounded-full uppercase tracking-wider font-bold">{status}</span>;
    }
  };

  const RefundModal = ({ order, onClose, onSuccess }) => {
    const [bank, setBank] = useState('');
    const [accNo, setAccNo] = useState('');
    const [accName, setAccName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      const token = localStorage.getItem('Ineri_token') || localStorage.getItem('IneriToken');
      
      try {
        const res = await fetch(`/api/orders/${order.id}/submit-refund`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bank_name: bank,
            account_number: accNo,
            account_name: accName
          })
        });
        const data = await res.json();
        if (data.success) {
          onSuccess();
        } else {
          alert(data.error || 'Gagal mengirim data refund.');
        }
      } catch (err) {
        alert('Terjadi kesalahan koneksi.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
        <div className="bg-surface-container-low w-full max-w-md rounded-3xl border border-outline-variant/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black tracking-tighter text-on-surface">Ajukan Refund</h3>
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
            </div>
            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
              Karena pesanan Anda dibatalkan, silakan masukkan detail rekening bank untuk proses pengembalian dana manual oleh Admin.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-2 block">Nama Bank</label>
                <input required value={bank} onChange={e => setBank(e.target.value)} placeholder="Contoh: BCA, Mandiri, BNI"
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tertiary transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-2 block">Nomor Rekening</label>
                <input required value={accNo} onChange={e => setAccNo(e.target.value)} placeholder="Nomor rekening Anda"
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tertiary transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-2 block">Nama Pemilik Rekening</label>
                <input required value={accName} onChange={e => setAccName(e.target.value)} placeholder="Nama lengkap sesuai buku tabungan"
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tertiary transition-all" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-tertiary text-on-tertiary rounded-2xl font-bold mt-4 shadow-xl shadow-tertiary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                {submitting ? 'Mengirim...' : 'Kirim Detail Refund'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const [selectedRefundOrder, setSelectedRefundOrder] = useState(null);

  if (!user) {
    return (
      <div className="bg-background text-on-surface min-h-screen">
        <Navbar activePage="my-orders" />
        <div className="pt-32 pb-24 px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Harap Login</h2>
          <p className="text-on-surface-variant mb-8">Anda perlu login untuk melihat riwayat pesanan.</p>
          <Link to="/login" className="px-6 py-3 bg-tertiary text-on-tertiary rounded-xl font-bold">Login Sekarang</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body min-h-screen selection:bg-tertiary/30">
      <Navbar activePage="my-orders" />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Pesanan Saya</h1>
            <p className="text-sm md:text-base text-on-surface-variant">Kelola dan pantau status pesanan Ineri Anda di sini.</p>
          </div>
          <button 
            onClick={async () => {
              setLoading(true);
              const pendingOrders = orders.filter(o => o.status === 'pending');
              for (const order of pendingOrders) {
                try {
                  await fetch(`/api/payments/status/${order.id}`);
                } catch (e) {
                  console.error("Gagal refresh status untuk order " + order.id);
                }
              }
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface rounded-lg text-sm font-bold hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh Status
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary"></div>
            <p className="text-on-surface-variant animate-pulse font-medium">Memuat pesanan...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl text-center">
            <span className="material-symbols-outlined text-rose-500 text-5xl mb-4">error</span>
            <p className="text-rose-400 font-bold text-lg mb-2">Terjadi Kesalahan</p>
            <p className="text-rose-400/80 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold">Coba Lagi</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-20 bg-surface-container-low rounded-3xl text-center border border-outline-variant/10 shadow-inner">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">receipt_long</span>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-3">Belum ada pesanan</h3>
            <p className="text-on-surface-variant mb-8 max-w-sm mx-auto">Sepertinya Anda belum memesan apapun. Mulai jelajahi menu lezat kami!</p>
            <Link to="/menu" className="px-8 py-4 bg-tertiary text-on-tertiary hover:bg-tertiary/90 transition-all rounded-2xl font-bold inline-flex items-center gap-2 shadow-xl shadow-tertiary/20">
              Lihat Menu Sekarang
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-surface-container-low rounded-[32px] overflow-hidden border border-outline-variant/10 shadow-2xl transition-all hover:translate-y-[-4px] group">
                {/* Order Header */}
                <div className="bg-surface-container/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/10">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary flex-shrink-0">
                      <span className="material-symbols-outlined text-2xl md:text-3xl">restaurant</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                        <h2 className="text-lg md:text-xl font-black text-on-surface tracking-tighter uppercase">ORDER #{order.id}</h2>
                        <div className="scale-90 origin-left">{getStatusBadge(order.status, order.refund_status, order.notes)}</div>
                      </div>
                      <p className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        {formatDate(order.created_at)}
                        {order.created_at && (
                          <> • {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-outline-variant/10">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-1">Total Pembayaran</p>
                    <p className="text-2xl md:text-3xl font-black text-tertiary tracking-tighter">IDR {formatPrice(order.total_price)}</p>
                    {order.status === 'pending' && (
                      <Link
                        to={`/payment/${order.id}`}
                        className="mt-3 bg-tertiary text-on-tertiary px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-tertiary/90 transition-all shadow-lg shadow-tertiary/20"
                      >
                        Bayar Sekarang
                      </Link>
                    )}
                    {order.status === 'cancelled' && 
                     (!order.refund_status || order.refund_status === 'none') && 
                     (!order.notes || (!order.notes.includes('[REFUND REQUEST]') && !order.notes.includes('[REFUND PROCESSED]'))) &&
                     order.was_paid === 1 && (
                      <button
                        onClick={() => setSelectedRefundOrder(order)}
                        className="mt-3 bg-rose-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                      >
                        Ajukan Refund
                      </button>
                    )}
                  </div>
                </div>

                {/* Reservation Info Bar */}
                {order.reservation_date && (
                  <div className="bg-tertiary/[0.03] px-8 py-5 flex flex-wrap gap-x-10 gap-y-3 border-b border-outline-variant/10">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-tertiary text-xl">calendar_today</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Tanggal</span>
                        <span className="text-sm font-bold text-on-surface">{formatDate(order.reservation_date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-tertiary text-xl">schedule</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Jam</span>
                        <span className="text-sm font-bold text-on-surface">{formatTime(order.start_time)} WIB</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-tertiary text-xl">group</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Tamu</span>
                        <span className="text-sm font-bold text-on-surface">{order.guest_count} Orang</span>
                      </div>
                    </div>
                    {order.table_number && (
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-tertiary text-xl">table_restaurant</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Meja</span>
                          <span className="text-sm font-bold text-on-surface">{order.table_number}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Items List */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-px flex-1 bg-outline-variant/20"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">Daftar Menu</span>
                    <div className="h-px flex-1 bg-outline-variant/20"></div>
                  </div>
                  
                  <div className="grid gap-6">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start md:items-center gap-4 md:gap-6 p-4 rounded-2xl hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/10">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-surface-container-highest overflow-hidden flex-shrink-0 shadow-lg">
                          <img
                            src={
                              item.image_url || 
                              (item.item_name?.includes('Booking Fee') ? '/images/booking_fee.png' :
                               item.item_name?.includes('Grill Berdua') ? '/images/paket_grill_berdua.png' :
                               item.item_name?.includes('Pahlawan') ? '/images/paket_pahlawan.png' :
                               '/images/booking_fee.png')
                            }
                            alt={item.item_name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => { e.target.src = '/images/booking_fee.png'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-base md:text-lg text-on-surface leading-tight mb-1 truncate">{item.item_name}</h4>
                              <p className="text-xs md:text-sm font-medium text-on-surface-variant">
                                {item.quantity} x <span className="text-tertiary/80">IDR {formatPrice(item.unit_price)}</span>
                              </p>
                            </div>
                            <div className="md:text-right">
                              <p className="text-base md:text-lg font-black text-on-surface">IDR {formatPrice(item.subtotal)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      {selectedRefundOrder && (
        <RefundModal 
          order={selectedRefundOrder} 
          onClose={() => setSelectedRefundOrder(null)} 
          onSuccess={() => {
            setSelectedRefundOrder(null);
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}

export default MyOrders;
