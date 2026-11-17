import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, Check, Cpu, Battery, Camera } from 'lucide-react';
import phonesData from '../data/phones.json';
export const SupportedPhones = () => {
    const { t } = useTranslation();
    const phones = phonesData;
    const [selectedBrand, setSelectedBrand] = useState('all');
    const brands = [
        { name: 'All Brands', id: 'all' },
        { name: 'Samsung', id: 'Samsung' },
        { name: 'Apple', id: 'Apple' },
        { name: 'OnePlus', id: 'OnePlus' },
        { name: 'Xiaomi', id: 'Xiaomi' },
        { name: 'Google', id: 'Google' },
    ];
    const marqueeBrands = [
        'SAMSUNG',
        'APPLE',
        'ONEPLUS',
        'XIAOMI',
        'REALME',
        'VIVO',
        'OPPO',
        'GOOGLE PIXEL',
        'NOTHING',
        'MOTOROLA',
    ];
    const filteredPhones = selectedBrand === 'all'
        ? phones
        : phones.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    return (<section id="supported-phones" className="py-24 relative overflow-hidden bg-navy-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 uppercase tracking-widest">
            Hardware Topology Database
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
            {t('supported.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            {t('supported.subtitle')}
          </p>
        </div>

        {/* Brand logo marquee bar */}
        <div className="relative w-full overflow-hidden py-4 mb-12 border-y border-white/5 bg-navy-950/40">
          <div className="flex items-center gap-12 whitespace-nowrap animate-[marquee_25s_linear_infinite]">
            {[...marqueeBrands, ...marqueeBrands].map((b, i) => (<span key={i} className="text-base sm:text-lg font-bold font-heading tracking-widest text-slate-400/70 hover:text-cyan-400 transition-colors">
                {b}
              </span>))}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {brands.map((b) => (<button key={b.id} onClick={() => setSelectedBrand(b.id)} className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${selectedBrand === b.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-cyan-sm'
                : 'bg-white/[0.04] text-slate-300 border border-white/10 hover:bg-white/[0.08]'}`}>
              {b.name}
            </button>))}
        </div>

        {/* Phone cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhones.map((phone) => (<div key={phone.id} className="glass-card glass-card-hover p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: phone.color }} title={`Chassis color: ${phone.color}`}/>
                    <span className="text-xs font-mono text-slate-400">
                      {phone.year} • {phone.brand}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                    Procedural 3D Ready
                  </span>
                </div>

                <h3 className="text-xl font-bold font-heading text-white mb-4">
                  {phone.brand} {phone.model}
                </h3>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400 flex-shrink-0"/>
                    <span>{phone.screenSize || 'LTPO AMOLED Display'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400 flex-shrink-0"/>
                    <span className="truncate">{phone.soc || 'Flagship SoC Engine'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
                    <span>{phone.batteryCapacity || 'High Density Li-Ion'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-400 flex-shrink-0"/>
                    <span className="truncate">{phone.cameraSpecs || 'Multi-Lens OIS System'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">
                  {phone.width} × {phone.height} × {phone.thickness} mm
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-medium">
                  <Check className="w-3.5 h-3.5"/> Fully Mapped
                </span>
              </div>
            </div>))}
        </div>
      </div>
    </section>);
};
