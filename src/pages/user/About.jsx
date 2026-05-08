import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import '../../index.css';

function About() {
  const { user, logout } = useAuth();
  return (
    <div className="bg-background text-on-surface font-body selection:bg-tertiary/30">
      <Navbar activePage="about" />

      <main>
        {/* Hero Section */}
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden pt-20">
          <img alt="Chef at work" className="absolute inset-0 w-full h-full object-cover editorial-image-mask opacity-60" data-alt="Close-up of a master sushi chef meticulously preparing nigiri with dramatic side lighting and rising steam in a dark high-end kitchen." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4uN7m6PPv5NJFaeiFQ9camS9z7NPXxgvsQnPex03zR8E42qKdVdhgm8Ht-9YlLNNwdNgndpjQpzYViSUAo2yjcSPIFHZshuX0jaxwOgNr7MzQMRcZFZk_oqYB100o8QXDHGXEWT3cCp_C4WzVTDx8ONsEphmqtZAldEX9y8d90EgXLGEvxaNwopQcWQMN3LdAGQ2oW4l1cu8x4tpu7UBsLxtauqqddfl0WL7Tbt-xUU5L1Lto-cVFfIvb7-cvGdblzLSb1ywDncsa" />
          <div className="relative z-10 text-center px-6">
            <span className="text-tertiary text-xs tracking-[0.4em] uppercase mb-8 block">Our Philosophy</span>
            <h1 className="text-6xl md:text-9xl font-extralight tracking-tighter text-on-surface mb-6">
              Zen Mastery
            </h1>
          </div>
        </section>

        {/* The Inari Story - Simplified whitespace layout */}
        <section className="py-40 px-8 md:px-24">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-24 items-start">
            <div className="md:w-1/2 space-y-12">
              <h2 className="text-zinc-500 text-xs tracking-[0.3em] uppercase">The Story</h2>
              <div className="space-y-8 text-on-surface text-xl md:text-2xl font-light leading-relaxed">
                <p>Founded on the principles of precision and patience, Inari represents a convergence of traditional Japanese soul and modern culinary innovation.</p>
                <p className="text-zinc-500">Our journey began with a simple vision: to honor the seasonal rhythms of the earth through the medium of fire and vinegared rice. Every cut of fish is selected daily, and every ember in our grill is managed with intensity.</p>
              </div>
            </div>
            <div className="md:w-1/2 pt-20">
              <img className="w-full grayscale hover:grayscale-0 transition-all duration-1000" data-alt="Artisanal high-quality Wagyu beef slices with intricate marbling on a dark slate platter decorated with microgreens and sea salt." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuubmmh6cjl6mQPSmYs2R3K9tN66aYHsPFO2W6QX4H5py72NK7B5FNH5Mc0BRxQBNIX7PWrE2BF64UOx_zSUd4dm11tXladzVYgh0XVFE70LaRyy7ZWIn1ZfnAM-bTr2PR0CAg7o5KIKgB3GFJwwylKB9Swz20vzYrqTR1a_kKFOOMqnar98-WUA1TTJc0Rsr64Re09nn8sD1dPVGV51Oq32t9mgMSe5CX7MUGr_aVclnii2S6y9-6RVGoTV8BRitpxA1LuYjFMr8K" />
            </div>
          </div>
        </section>

        {/* Full Width Blended Image */}
        <section className="w-full h-[70vh] relative overflow-hidden">
          <img className="absolute inset-0 w-full h-full object-cover grayscale opacity-40" data-alt="Close-up of a sizzling binchotan charcoal grill with skewers of premium chicken and vegetables emitting soft golden glow and smoke." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgKAOzBaUVcmpYxQoihpdqJdx7KxNA7JWmbM1ef6sAuUpJhM9Cm1lSQZSNDLYzlcHMMjEFFABXVtA-tmV-8i8OmSeMJW49osuspjFxlsfFe0BzDzMRF9JFn6iMhSPWNBgec4OS923lJjs-UKFBtontRDjaUqpO48JTVQa2qbEGScMaDMoyfj1HT4zcM5yoONjPjA83Jsnnh9qVRG6avW_CSJgSl2Iss3UqL_vE6wOvPMUlMYp-bkEfHVYPbI_NwZJ0V6dCjQpn11d8" />
        </section>

        {/* Our Values - Typography Focused */}
        <section className="py-40 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              {/* Quality */}
              <div className="space-y-6">
                <h3 className="text-on-surface text-xs tracking-[0.2em] uppercase font-bold">Quality</h3>
                <p className="text-zinc-500 font-light leading-relaxed">Sourcing only the finest, sustainable ingredients from local purveyors and international markets daily.</p>
              </div>
              {/* Authenticity */}
              <div className="space-y-6">
                <h3 className="text-on-surface text-xs tracking-[0.2em] uppercase font-bold">Authenticity</h3>
                <p className="text-zinc-500 font-light leading-relaxed">Preserving age-old techniques while respecting the lineage of Japanese culinary heritage.</p>
              </div>
              {/* Innovation */}
              <div className="space-y-6">
                <h3 className="text-on-surface text-xs tracking-[0.2em] uppercase font-bold">Innovation</h3>
                <p className="text-zinc-500 font-light leading-relaxed">Pushing boundaries with unique flavor profiles and modern presentation that surprises and delights.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Team - Minimalist */}
        <section className="py-40 px-8 md:px-24 bg-surface-container-lowest">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-zinc-500 text-xs tracking-[0.3em] uppercase mb-24 text-center">The Curators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
              {/* Executive Chef */}
              <div className="group">
                <div className="relative overflow-hidden mb-12">
                  <img className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000" data-alt="Elegant portrait of a professional Japanese executive chef in traditional white uniform looking thoughtfully at the camera in a moody studio." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRpzvnn_SCNh0cfPzgeSMs6O9oYda2ndR61ZeANfm5Ldqc6xzs812Es-8lu1TGJTwU1DNl-IDJkDD0Px54L5ftbCW3yd5iaqD6fRj53a23HJse-wVBoHbrQ5wcAEqicSy0kib7CeD-CYVrUjfL0VSMSOsuZ6Gh--C00LIWZlNzGwTlYPTtUGrgXq9-tiMpDJDWwjO-EPXNxgmcwuuwSgeutgA3PTFH-9y4YkBt3dHqDQ-_cTjtExnfUQg1XL30xmjxs8YIebZ3vxin" />
                </div>
                <h3 className="text-on-surface text-xl font-light mb-2">Kenji Inari</h3>
                <p className="text-tertiary text-xs uppercase tracking-widest mb-6">Founder & Executive Chef</p>
                <p className="text-zinc-500 font-light leading-relaxed text-sm max-w-xs">With 25 years of experience in Tokyo's establishments, Chef Kenji brings an unparalleled eye for detail to every plate.</p>
              </div>
              {/* Founder */}
              <div className="group">
                <div className="relative overflow-hidden mb-12">
                  <img className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000" data-alt="Professional portrait of a hospitality visionary in a charcoal suit, sitting in a modern restaurant setting with soft ambient lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNsUZ0Zi_i6pOsbscHFqBg8r9vvUkswxigOGjHBJybjb0GjfjLpmaxANdjy4VBlDCc9N5KFUVzKQQ8Bnz0S0I_kXWe4QjBacjt6p61_LWkW_FOtT-0sGR7BegOhsKyTTsKQNaDxDaLbuUM8a87N2hktKjIStL2Mvi4k9YdirS8vZl-SnkgK3XjthbubMumCB0uxI4xxOdi8L0Tx8VKtmiORq0aurxaHz1R5-mTzMr5JT3lGrA1nlfEXwKEH5vrwPpOFxGvX5RXz3JN" />
                </div>
                <h3 className="text-on-surface text-xl font-light mb-2">Mika Yamamoto</h3>
                <p className="text-tertiary text-xs uppercase tracking-widest mb-6">Director of Operations</p>
                <p className="text-zinc-500 font-light leading-relaxed text-sm max-w-xs">Mika curates the "Zen" atmosphere, ensuring every guest feels the warmth of Japanese hospitality.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Atmosphere - Open Layout */}
        <section className="py-40 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-4 space-y-8">
                <h2 className="text-on-surface text-4xl font-extralight tracking-tight">The Space</h2>
                <p className="text-zinc-500 font-light leading-relaxed">A sanctuary from the urban rush—a place of reclaimed wood, dark stone, and the soft amber glow of fire.</p>
                <a className="inline-block text-xs uppercase tracking-[0.2em] border-b border-zinc-700 pb-2 hover:border-zinc-100 transition-colors" href="#">View Gallery</a>
              </div>
              <div className="md:col-span-8">
                <img className="w-full grayscale hover:grayscale-0 transition-all duration-1000" data-alt="Wide shot of a modern minimalist restaurant interior with dark wooden tables, soft warm lighting, and a prominent open sushi bar." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoFwPDo37zV2WEmKzQH1ZBxQ0mptRs4nUhyUNRAyS9c6wrVfKaIQKTbnNNLq-EQMc7qlCI1xEEdrU9y-LCIogwOH0sRNXdCeCKcBEs3gc0j7zD5MgYzMeMP8HtIegVRDgOF6JhLPY386w0xZo4C-NY1WEKK__D-rK8j3u3QN5mvuiXy0889dH4tAvVn0l0hftTQIfitXMU4MZ6I4zH-DjsepXKbe1tssuYET1C4oEkwCy0Tm7k-a-JMtVop2UcNQlFi7qaZGmA8Qkf" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Simple & Breathable */}
        <section className="py-60 px-8 text-center bg-background">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-7xl font-extralight text-on-surface tracking-tighter">Experience the Mastery</h2>
            <p className="text-zinc-500 text-lg font-light tracking-wide">Reservations are highly recommended for dinner service.</p>
            <div className="pt-8">
              <Link to="/reservation" className="bg-zinc-100 text-zinc-950 px-16 py-5 text-xs uppercase tracking-[0.3em] font-bold hover:bg-tertiary transition-all duration-500">
                Book Table
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 w-full py-12 px-12">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="flex items-center gap-2 text-neutral-500">
              <span className="material-symbols-outlined text-2xl">forest</span>
              <span className="text-lg font-black uppercase tracking-tighter">Inari Suki & Grill</span>
            </div>
            <p className="text-neutral-500 Manrope body-sm tracking-wide opacity-80 hover:opacity-100 transition-opacity">© 2024 Inari Suki & Grill. Modern Zen Mastery.</p>
          </div>
          <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-tertiary transition-colors font-medium text-sm">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default About;
