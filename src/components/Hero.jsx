import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Layers, ArrowRight, Eye, Sliders, Cpu, ShieldCheck, Zap, } from 'lucide-react';
import { PhoneViewer } from '../three/PhoneViewer';
import phonesData from '../data/phones.json';
import partsData from '../data/parts.json';
export const Hero = () => {
    const { t, i18n } = useTranslation();
    const phones = phonesData;
    const parts = partsData;
    const [selectedPhone, setSelectedPhone] = useState(phones[0]);
    const [explodeFactor, setExplodeFactor] = useState(0.35);
    const [selectedPartId, setSelectedPartId] = useState('motherboard');
    const selectedPart = parts.find((p) => p.id === selectedPartId);
    const isTamil = i18n.language === 'ta';
    return (<section className="relative min-h-[92vh] pt-28 pb-16 flex items-center justify-center overflow-hidden">
      {/* Background glowing ambient orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"/>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"/>

      {/* Subtle background tech grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '40px 40px',
        }}/>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md shadow-cyan-sm">
              <Sparkles className="w-4 h-4 text-cyan-400"/>
              <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">
                {t('hero.badge')}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.12]">
              {t('hero.headline')}
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              {t('hero.subtext')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/app" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-navy-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 shadow-cyan-glow hover:shadow-[0_0_35px_rgba(0,245,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all group">
                <Zap className="w-5 h-5 text-navy-950 fill-navy-950"/>
                <span>{t('hero.launchCTA')}</span>
                <ArrowRight className="w-4 h-4 text-navy-950 group-hover:translate-x-1 transition-transform"/>
              </Link>

              <button onClick={() => setExplodeFactor((prev) => (prev > 0.6 ? 0 : 0.85))} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 glass-card glass-card-hover border border-white/10">
                <Layers className="w-4 h-4 text-cyan-400"/>
                <span>
                  {explodeFactor > 0.6 ? 'Reassemble 3D Layers' : 'Explode 3D Layers'}
                </span>
              </button>
            </div>

            {/* Interactive Model Switcher Pills */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Select Procedural Device Architecture:
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {phones.slice(0, 3).map((phone) => (<button key={phone.id} onClick={() => {
                setSelectedPhone(phone);
                setSelectedPartId(null);
            }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedPhone.id === phone.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-cyan-sm'
                : 'bg-white/[0.04] text-slate-300 border border-white/10 hover:bg-white/[0.08]'}`}>
                    {phone.brand} {phone.model}
                  </button>))}
              </div>
            </div>

            {/* Feature highlights bar */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-left">
              <div className="glass-card p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                  <Cpu className="w-3.5 h-3.5"/>
                  <span>Procedural 3D</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Zero GLB file size</p>
              </div>

              <div className="glass-card p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5"/>
                  <span>Sub-millimeter</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">True component scale</p>
              </div>

              <div className="glass-card p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                  <Zap className="w-3.5 h-3.5"/>
                  <span>MediaPipe AI</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Air gesture control</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Procedural Phone Showcase */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            {/* 3D Canvas Box */}
            <div className="relative w-full h-[450px] sm:h-[520px] rounded-2xl glass-card border border-white/10 shadow-2xl overflow-hidden flex flex-col">
              {/* Top Card Bar with active phone badge & live interactive controls */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 bg-navy-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-white">
                    {selectedPhone.brand} {selectedPhone.model}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {selectedPhone.year}
                  </span>
                </div>

                <div className="pointer-events-auto flex items-center gap-2 bg-navy-950/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-xs text-cyan-300">
                  <Eye className="w-3.5 h-3.5"/>
                  <span className="font-mono text-[11px]">
                    Explode: {Math.round(explodeFactor * 100)}%
                  </span>
                </div>
              </div>

              {/* The Procedural Three.js Phone */}
              <div className="flex-1 w-full h-full">
                <PhoneViewer config={selectedPhone} explodeFactor={explodeFactor} selectedPartId={selectedPartId} onSelectPart={(partId) => setSelectedPartId(partId)} interactive={true} autoRotate={true} quality="high"/>
              </div>

              {/* Interactive Layer Explosion Slider at Bottom of Canvas */}
              <div className="p-3 bg-navy-950/80 backdrop-blur-md border-t border-white/10 z-20 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Sliders className="w-3 h-3 text-cyan-400"/> Layer Explosion:
                  </span>
                  <span className="font-mono text-cyan-400 text-[11px]">
                    {explodeFactor === 0
            ? 'Fully Assembled'
            : explodeFactor >= 0.8
                ? 'Full Teardown'
                : 'Deconstructed'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input type="range" min="0" max="1" step="0.01" value={explodeFactor} onChange={(e) => setExplodeFactor(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"/>
                </div>
              </div>
            </div>

            {/* Quick Part Details preview below 3D model */}
            {selectedPart && (<div className="w-full mt-3 glass-card p-3.5 rounded-xl border border-cyan-500/30 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 font-heading">
                      {isTamil ? selectedPart.name_ta : selectedPart.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/20">
                      Layer {selectedPart.layer}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {isTamil ? selectedPart.function_ta : selectedPart.function}
                  </p>
                </div>
                <button onClick={() => setSelectedPartId(null)} className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5">
                  ✕
                </button>
              </div>)}
          </div>
        </div>
      </div>
    </section>);
};
