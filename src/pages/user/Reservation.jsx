import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../index.css';

const MAX_PER_TABLE = 4;
const BOOKING_FEE_PER_TABLE = 10000;



const timeSlots = [
  '11:00 AM', '12:30 PM', '02:00 PM', '03:30 PM',
  '05:00 PM', '06:30 PM', '08:00 PM', '09:30 PM',
];

function formatIDR(num) {
  return Number(num).toLocaleString('id-ID');
}

function Reservation() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const { addToCart } = useCart();

  const [guestCount, setGuestCount]       = useState(2);
  const [tables, setTables]               = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [packages, setPackages]           = useState([]);
  const [selectedPkg, setSelectedPkg]     = useState(null);
  const [selectedDate, setSelectedDate]   = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime]   = useState('11:00 AM');
  const [bookedTables, setBookedTables]   = useState([]);
  const [confirmed, setConfirmed]         = useState(false);
  const [pkgLoading, setPkgLoading]       = useState(true);

  const tablesNeeded = Math.ceil(guestCount / MAX_PER_TABLE);

  // Fetch packages & tables
  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(d => { if (d.success) setPackages(d.data); })
      .catch(() => {})
      .finally(() => setPkgLoading(false));

    fetch('/api/tables')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const mappedTables = d.data.map(t => ({
            id: t.id, 
            capacity: t.capacity
          }));
          setTables(mappedTables);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch booked tables whenever date or time changes
  useEffect(() => {
    if (!selectedDate || !selectedTime) return;
    
    fetch(`/api/booked?date=${selectedDate}&time=${selectedTime}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setBookedTables(d.data);
          // If a selected table becomes booked, remove it
          setSelectedTables(prev => prev.filter(id => !d.data.includes(id)));
        }
      })
      .catch(err => console.error('Error fetching booked tables:', err));
  }, [selectedDate, selectedTime]);

  // Trim selected tables when tablesNeeded decreases
  useEffect(() => {
    setSelectedTables(prev =>
      prev.filter(id => { const t = tables.find(t => t.id === id); return t && !t.reserved; })
          .slice(0, tablesNeeded)
    );
  }, [tablesNeeded]);

  const isTableSelected = id => selectedTables.includes(id);

  const handleTableClick = table => {
    if (table.reserved) return;
    if (isTableSelected(table.id)) {
      if (selectedTables.length > 1) setSelectedTables(p => p.filter(id => id !== table.id));
      return;
    }
    if (selectedTables.length < tablesNeeded) setSelectedTables(p => [...p, table.id]);
    else setSelectedTables(p => [...p.slice(0, tablesNeeded - 1), table.id]);
  };

  const isSelectionComplete = selectedTables.length === tablesNeeded;

  const handleConfirm = () => {
    if (!isSelectionComplete) return;
    setConfirmed(true);

    // Add Booking Fee for each selected table
    selectedTables.forEach(tableId => {
      addToCart({
        id: `booking-${tableId}-${Date.now()}`,
        name: `Booking Fee - Meja ${tableId}`,
        price: BOOKING_FEE_PER_TABLE,
        description: `Biaya reservasi untuk Meja ${tableId}`,
        img: '/images/booking_fee.webp',
        alt: `Booking Fee Meja ${tableId}`,
        type: 'booking_fee'
      });
    });

    if (selectedPkg) {
      addToCart({
        id: selectedPkg.id,
        name: selectedPkg.name,
        price: Number(selectedPkg.price),
        description: selectedPkg.description,
        img: selectedPkg.image_url,
        alt: selectedPkg.name,
        type: 'package'
      });
    }

    // Save reservation data to localStorage
    const reservationData = {
      tables: selectedTables,
      date: selectedDate, 
      time: selectedTime,
      guestCount: guestCount
    };
    localStorage.setItem('Ineri_reservation_temp', JSON.stringify(reservationData));

    setTimeout(() => { setConfirmed(false); navigate('/cart'); }, 1800);
  };

  const isTimePassed = (timeStr) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (selectedDate !== today) return false;

    // Parse timeStr like "10:00 AM"
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const slotTime = new Date();
    slotTime.setHours(hours, parseInt(minutes, 10), 0, 0);

    return now > slotTime;
  };

  // Auto-select next available time if current is passed
  useEffect(() => {
    if (isTimePassed(selectedTime)) {
      const nextAvailable = timeSlots.find(t => !isTimePassed(t));
      if (nextAvailable) setSelectedTime(nextAvailable);
    }
  }, [selectedDate]);

  return (
    <div className="bg-background text-on-surface font-body min-h-screen selection:bg-tertiary/30">
      <Navbar activePage="reservation" />

      <main className="min-h-screen pt-28 pb-32 px-6 max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-tertiary uppercase text-xs font-bold tracking-[0.2em] mb-2 block">Reservations</span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-on-surface">Secure Your Table</h1>
            <p className="text-on-surface-variant mt-2 max-w-md font-light text-sm">
              Pilih meja, paket, dan waktu yang sesuai untuk momen spesial Anda.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[['bg-tertiary animate-pulse','Available'],['bg-tertiary/80 border border-tertiary','Selected'],['bg-neutral-700','Reserved']].map(([cls,label]) => (
              <div key={label} className="px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant/10 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cls}`} />
                <span className="text-[10px] uppercase font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">

            {/* STEP 1 — Guest Count */}
            <section className="bg-surface-container-low p-6 md:p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary text-xs font-black flex items-center justify-center">1</span>
                <h2 className="text-xl font-bold tracking-tight">Jumlah Tamu</h2>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <button onClick={() => setGuestCount(p => Math.max(1,p-1))} className="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-full text-2xl hover:bg-tertiary hover:text-on-tertiary transition-all active:scale-90">−</button>
                <span className="text-5xl font-bold text-tertiary min-w-[60px] text-center">{String(guestCount).padStart(2,'0')}</span>
                <button onClick={() => setGuestCount(p => Math.min(12,p+1))} className="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-full text-2xl hover:bg-tertiary hover:text-on-tertiary transition-all active:scale-90">+</button>
                <div className="ml-auto">
                  {guestCount <= MAX_PER_TABLE
                    ? <span className="px-3 py-1.5 bg-tertiary/10 text-tertiary text-xs font-bold rounded-full">1 meja diperlukan</span>
                    : <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-sm">info</span>{tablesNeeded} meja diperlukan</span>
                  }
                </div>
              </div>
              {guestCount > MAX_PER_TABLE && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-400 text-xl mt-0.5">table_restaurant</span>
                  <p className="text-on-surface-variant text-sm">
                    Setiap meja maks. <strong className="text-on-surface">{MAX_PER_TABLE} orang</strong>. Untuk <strong className="text-on-surface">{guestCount} tamu</strong>, pilih <strong className="text-amber-400">{tablesNeeded} meja</strong>.
                    {selectedTables.length < tablesNeeded && <span className="text-amber-400 font-semibold"> ({tablesNeeded - selectedTables.length} lagi)</span>}
                  </p>
                </div>
              )}
            </section>

            {/* STEP 2 — Table Selection */}
            <section id="select-table" className="bg-surface-container-low p-6 md:p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary text-xs font-black flex items-center justify-center">2</span>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">{tablesNeeded > 1 ? `Pilih ${tablesNeeded} Meja` : 'Pilih Meja'}</h2>
                    {tablesNeeded > 1 && <p className="text-xs text-on-surface-variant mt-0.5">Dipilih: <span className="text-tertiary font-bold">{selectedTables.length}</span>/{tablesNeeded}</p>}
                  </div>
                </div>
                <span className="text-on-surface-variant text-[10px] font-medium uppercase tracking-widest">Floor Plan 01</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {tables.map(table => {
                  const isSel = isTableSelected(table.id);
                  const isBooked = bookedTables.includes(table.id);
                  const idx   = selectedTables.indexOf(table.id);
                  
                  if (isBooked) return (
                    <div key={table.id} className="aspect-square bg-neutral-800/50 opacity-40 cursor-not-allowed flex flex-col items-center justify-center rounded-xl grayscale">
                      <span className="material-symbols-outlined text-neutral-600 text-lg mb-1">block</span>
                      <span className="text-neutral-500 font-bold text-sm">{table.id}</span>
                      <span className="text-[9px] uppercase font-bold text-neutral-600">Reserved</span>
                    </div>
                  );

                  return (
                    <button key={table.id} onClick={() => handleTableClick(table)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-200 hover:scale-[1.04] active:scale-95 relative ${isSel ? 'bg-tertiary-container border-2 border-tertiary shadow-lg shadow-tertiary/20' : 'bg-surface-container-high hover:bg-surface-container-highest border border-transparent'}`}>
                      {isSel && tablesNeeded > 1 && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-tertiary text-on-tertiary text-[10px] font-black flex items-center justify-center">{idx+1}</span>
                      )}
                      <span className="material-symbols-outlined text-xl mb-1" style={{color: isSel ? 'var(--color-tertiary)' : 'var(--color-on-surface-variant)'}}>table_restaurant</span>
                      <span className={`font-bold text-sm ${isSel ? 'text-on-tertiary-container' : 'text-neutral-300'}`}>{table.id}</span>
                      <span className={`text-[9px] uppercase font-bold mt-0.5 ${isSel ? 'text-tertiary' : 'text-neutral-500'}`}>{table.capacity} pax</span>
                    </button>
                  );
                })}
              </div>

              {selectedTables.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest mr-1">Terpilih:</span>
                  {selectedTables.map((id,i) => (
                    <span key={id} className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold flex items-center gap-1.5">
                      {tablesNeeded > 1 && <span className="opacity-60 text-[10px]">#{i+1}</span>}Meja {id}
                    </span>
                  ))}
                  {!isSelectionComplete && (
                    <span className="px-3 py-1 border border-dashed border-amber-500/40 text-amber-400 rounded-full text-xs font-bold animate-pulse">+ {tablesNeeded - selectedTables.length} lagi</span>
                  )}
                </div>
              )}
            </section>

            {/* STEP 3 — Package Selection */}
            <section className="bg-surface-container-low p-6 md:p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary text-xs font-black flex items-center justify-center">3</span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Pilih Paket (Opsional)</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Pilih paket spesial untuk pengalaman yang lebih berkesan</p>
                </div>
                {selectedPkg && (
                  <button onClick={() => setSelectedPkg(null)} className="ml-auto text-[10px] text-on-surface-variant hover:text-error uppercase tracking-widest font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">close</span>Hapus
                  </button>
                )}
              </div>

              {pkgLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-28 bg-surface-container-high rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
                  {packages.map(pkg => {
                    const isSel = selectedPkg?.id === pkg.id;
                    return (
                      <button key={pkg.id} onClick={() => setSelectedPkg(isSel ? null : pkg)}
                        className={`flex gap-4 p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] border ${isSel ? 'bg-tertiary-container border-tertiary shadow-lg shadow-tertiary/20' : 'bg-surface-container-high border-transparent hover:border-outline-variant/20'}`}>
                        <img src={pkg.image_url} alt={pkg.name} className="w-20 h-20 object-cover rounded-lg shrink-0" onError={e => e.target.style.display='none'} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-bold text-sm leading-tight ${isSel ? 'text-on-tertiary-container' : 'text-on-surface'}`}>{pkg.name}</p>
                            {pkg.badge && (
                              <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${pkg.badge_class || 'bg-tertiary text-on-tertiary'}`}>{pkg.badge}</span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isSel ? 'text-on-tertiary-container/70' : 'text-on-surface-variant'}`}>{pkg.description}</p>
                          <p className={`text-sm font-black mt-2 ${isSel ? 'text-tertiary' : 'text-tertiary'}`}>
                            <span className="text-xs font-normal opacity-60 mr-0.5">Rp</span>{formatIDR(pkg.price)}
                          </p>
                        </div>
                        {isSel && (
                          <span className="material-symbols-outlined text-tertiary text-xl self-center shrink-0">check_circle</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* STEP 4 — Date & Time */}
            <section className="bg-surface-container-low p-6 md:p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary text-xs font-black flex items-center justify-center">4</span>
                <h2 className="text-xl font-bold tracking-tight">Tanggal & Waktu</h2>
              </div>
              
              <div className="mb-8">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">Pilih Tanggal</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full md:w-64 bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:border-tertiary outline-none transition-all"
                />
              </div>

              <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">Pilih Waktu</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {timeSlots.map(time => {
                  const passed = isTimePassed(time);
                  const isSel = selectedTime === time;

                  return (
                    <button 
                      key={time} 
                      disabled={passed}
                      onClick={() => setSelectedTime(time)}
                      className={`relative py-3 px-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                        passed ? 'bg-neutral-800/40 text-neutral-600 cursor-not-allowed opacity-50' : 
                        isSel ? 'bg-tertiary-container text-on-tertiary-container shadow-md shadow-tertiary/10' : 
                        'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                    >
                      {time}
                      {passed && <span className="text-[7px] text-neutral-500 block">Passed</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT — Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-surface-container p-1 rounded-2xl">
              <div className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-tertiary opacity-5 blur-[80px] rounded-full pointer-events-none" />
                <h3 className="text-lg font-bold tracking-tight mb-6 border-b border-outline-variant/10 pb-4">Ringkasan Reservasi</h3>

                <ul className="space-y-5 mb-6">
                  {/* Date */}
                  <li className="flex justify-between items-center">
                    <span className="text-on-surface-variant uppercase text-[10px] font-bold tracking-widest">Tanggal</span>
                    <span className="font-bold">{new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </li>
                  {/* Tables */}
                  <li className="flex justify-between items-start gap-4">
                    <span className="text-on-surface-variant uppercase text-[10px] font-bold tracking-widest pt-1 shrink-0">Meja</span>
                    <div className="flex flex-col items-end gap-1">
                      {selectedTables.length === 0
                        ? <span className="text-neutral-500 text-xs italic">Belum dipilih</span>
                        : selectedTables.map((id,i) => (
                          <span key={id} className="font-bold text-tertiary text-sm">
                            {tablesNeeded > 1 && <span className="text-on-surface-variant font-normal text-xs mr-1">#{i+1}</span>}Meja {id}
                          </span>
                        ))}
                      {!isSelectionComplete && <span className="text-amber-400 text-[10px] font-bold">{tablesNeeded - selectedTables.length} meja belum dipilih</span>}
                    </div>
                  </li>

                  {/* Package */}
                  <li className="flex justify-between items-start gap-4">
                    <span className="text-on-surface-variant uppercase text-[10px] font-bold tracking-widest pt-1 shrink-0">Paket</span>
                    {selectedPkg ? (
                      <div className="text-right">
                        <p className="font-bold text-on-surface text-sm leading-tight">{selectedPkg.name}</p>
                        <p className="text-tertiary text-xs font-bold mt-0.5">Rp {formatIDR(selectedPkg.price)}</p>
                      </div>
                    ) : (
                      <span className="text-neutral-500 text-xs italic">Tanpa paket</span>
                    )}
                  </li>

                  <li className="flex justify-between items-center">
                    <span className="text-on-surface-variant uppercase text-[10px] font-bold tracking-widest">Waktu</span>
                    <span className="font-bold">{selectedTime}</span>
                  </li>

                  <li className="flex justify-between items-center">
                    <span className="text-on-surface-variant uppercase text-[10px] font-bold tracking-widest">Tamu</span>
                    <span className="font-bold">{String(guestCount).padStart(2,'0')} Orang</span>
                  </li>

                  {/* Fee breakdown */}
                  <li className="pt-4 border-t border-outline-variant/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant text-xs">Booking Fee ({tablesNeeded} meja)</span>
                      <span className="font-medium text-sm">Rp {formatIDR(tablesNeeded * BOOKING_FEE_PER_TABLE)}</span>
                    </div>
                    {selectedPkg && (
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-xs">Paket ({selectedPkg.name.length > 18 ? selectedPkg.name.slice(0,18)+'…' : selectedPkg.name})</span>
                        <span className="font-medium text-sm">Rp {formatIDR(selectedPkg.price)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
                      <span className="text-on-surface-variant uppercase text-[10px] font-bold tracking-widest">Total Awal</span>
                      <span className="font-black text-tertiary text-lg">Rp {formatIDR(tablesNeeded * BOOKING_FEE_PER_TABLE + (selectedPkg ? Number(selectedPkg.price) : 0))}</span>
                    </div>
                  </li>
                </ul>

                <div className="bg-surface-container-low p-3 rounded-lg mb-5">
                  <p className="text-[10px] text-on-surface-variant leading-relaxed uppercase tracking-wider">
                    Booking fee Rp 10.000/meja dipotong dari tagihan akhir. Pembatalan perlu pemberitahuan 24 jam.
                  </p>
                </div>

                {!isSelectionComplete && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-amber-400 text-[11px] font-bold text-center">⚠ Pilih {tablesNeeded - selectedTables.length} meja lagi</p>
                  </div>
                )}

                <button onClick={handleConfirm} disabled={!isSelectionComplete || confirmed}
                  className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shadow-lg ${
                    confirmed ? 'bg-green-600 text-white shadow-green-600/20'
                    : !isSelectionComplete ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-60'
                    : 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary shadow-tertiary-container/20'
                  }`}>
                  {confirmed ? '✓ Reservasi Dikonfirmasi!' : 'Konfirmasi Reservasi'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pengalaman Suki & Grill */}
        <div className="mt-24">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent mb-16" />
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter mb-4">Pengalaman Suki & Grill Terbaik</h2>
              <p className="text-on-surface-variant leading-relaxed mb-6 font-light text-sm">
                Nikmati sensasi memanggang daging pilihan dan hangatnya kuah suki dengan resep otentik kami. 
                Suasana resto yang estetik dan nyaman di Jember, cocok untuk momen spesial bersama teman dan 
                keluarga dengan harga yang tetap ramah di kantong.
              </p>
              <Link to="/menu" className="text-tertiary uppercase text-xs font-bold tracking-widest border-b border-tertiary/30 pb-1 hover:border-tertiary transition-all">Lihat Semua Menu →</Link>
            </div>
            <div className="flex-1 order-1 md:order-2 relative">
              <div className="absolute -inset-4 bg-tertiary/10 blur-3xl opacity-20 rounded-3xl" />
              <img className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl relative z-10 border border-white/5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtiZaPq-tHhpJ9MXIDo0YSgNs7Wm-pC68GKxjO1bkwtO1zgosFuG5p7IgiZlybypo9Z8lArWYsRsbX-3nZ4upBwoQDqocdWESUtZmf7kUBnlQzGz-NVR7Dw7sYDEAAFsD7L0Iq4X0Mry7rYZ9GA8xAXa4wZGb-VbTgYQcYvFWfZDtagxQOfE5D6coy2SQHyaGrpbZVtcswhImiVVz4abSw-2DAjIpE6M2ZFxL8IsStPuMAAXGPgEGnlkz9Z1ALK45SjiOtiYxmvTri"
                alt="Suasana Ineri Suki & Grill" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Reservation;
