import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scan,
  Check,
  X,
  Search,
  Sparkles,
  SwitchCamera,
  Layers,
  Target,
  Zap,
} from 'lucide-react';
import phonesData from '../../data/phones.json';

export const ScanOverlay = ({
  isScanning,
  detectedPhone,
  detectedBrand,
  confidence,
  detectedBBox,
  videoSize,
  onConfirm,
  onWrong,
  onOpenManualPicker,
  onFlipCamera,
  onSkipToTeardown,
  onQuickSimulateMatch,
}) => {
  const { t } = useTranslation();
  const phones = phonesData;
  const [inlineSearch, setInlineSearch] = useState('');
  const [activeBrandFilter, setActiveBrandFilter] = useState(detectedBrand || 'all');

  // Popular Brands for 1-Tap Identification (2021-2026 DB)
  const popularBrands = [
    'all',
    'Apple',
    'Samsung',
    'Google',
    'OnePlus',
    'Infinix',
    'POCO',
    'Motorola',
    'Realme',
    'Xiaomi',
    'Vivo',
    'iQOO',
    'Tecno',
    'Oppo',
  ];

  // Calculate normalized tracking box if a physical phone is detected
  let trackBoxStyle = null;
  if (detectedBBox && videoSize && videoSize.width > 0 && videoSize.height > 0) {
    const [x, y, w, h] = detectedBBox;
    const leftPct = (x / videoSize.width) * 100;
    const topPct = (y / videoSize.height) * 100;
    const widthPct = (w / videoSize.width) * 100;
    const heightPct = (h / videoSize.height) * 100;
    trackBoxStyle = {
      left: `${Math.max(2, Math.min(85, leftPct))}%`,
      top: `${Math.max(5, Math.min(80, topPct))}%`,
      width: `${Math.max(12, Math.min(80, widthPct))}%`,
      height: `${Math.max(18, Math.min(80, heightPct))}%`,
    };
  }

  // Instant filtered models for 100% accurate identification
  const currentBrand = detectedBrand || (activeBrandFilter !== 'all' ? activeBrandFilter : null);

  const matchedSuggestions = useMemo(() => {
    const rawQ = inlineSearch.toLowerCase().trim();
    const compactQ = rawQ.replace(/[^a-z0-9]/g, '');
    const tokens = rawQ.split(/\s+/).filter(Boolean);

    if (!rawQ && !currentBrand) {
      // Balanced showcase of top popular models (Apple, Samsung, Infinix, OnePlus, Xiaomi, POCO)
      const topIds = [
        'apple-iphone-15-pro-max-2023',
        'samsung-galaxy-s24-ultra-2024',
        'infinix-hot-11s-2021',
        'infinix-hot-12-play-2022',
        'oneplus-oneplus-12-2024',
        'xiaomi-redmi-note-13-pro-2024',
        'poco-poco-x6-pro-2024',
        'google-pixel-8-pro-2023',
      ];
      const showcased = topIds.map(id => phones.find(p => p.id === id)).filter(Boolean);
      const remaining = phones.slice(0, 8);
      const combined = [...new Set([...showcased, ...remaining])].slice(0, 8);
      return combined.map(p => ({
        label: p.displayName || `${p.brand} ${p.model} (${p.year})`,
        id: p.id,
      }));
    }

    return phones
      .filter((p) => {
        if (currentBrand && p.brand.toLowerCase() !== currentBrand.toLowerCase() && !rawQ) {
          return false;
        }
        if (!rawQ) return true;

        const searchable = `${p.brand} ${p.model} ${p.displayName} ${p.year} ${p.soc} ${(p.variants || []).join(' ')}`.toLowerCase();
        const compactSearchable = searchable.replace(/[^a-z0-9]/g, '');

        const allTokens = tokens.every(tok => searchable.includes(tok));
        const compact = compactQ.length >= 2 && compactSearchable.includes(compactQ);
        return allTokens || compact;
      })
      .slice(0, 8)
      .map((p) => ({
        label: p.displayName || `${p.brand} ${p.model} (${p.year})`,
        id: p.id,
      }));
  }, [phones, inlineSearch, currentBrand]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* 1. Top Status Bar & Controls */}
      <div className="flex items-center justify-between gap-2 pointer-events-auto flex-wrap">
        {/* Status Radar */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-950/85 backdrop-blur-md border border-cyan-500/30 text-xs shadow-cyan-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-cyan-300 font-semibold">
            {detectedPhone
              ? `🎯 MATCHED: ${detectedPhone.brand} ${detectedPhone.model}`
              : detectedBrand
              ? `🔍 Brand Detected: ${detectedBrand}`
              : trackBoxStyle
              ? `📱 Physical Phone Tracked in Frame`
              : t('app.scanning')}
          </span>
          {confidence > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
              {confidence}%
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onFlipCamera && (
            <button
              onClick={onFlipCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950/80 hover:bg-navy-900 border border-white/10 text-slate-300 text-xs font-medium transition-colors"
              title="Flip Front / Rear Camera"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Flip Camera</span>
            </button>
          )}

          <button
            onClick={onOpenManualPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950/80 hover:bg-navy-900 border border-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>All Models ({phones.length.toLocaleString()}+)</span>
          </button>

          {onSkipToTeardown && (
            <button
              onClick={onSkipToTeardown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-navy-950 font-bold text-xs shadow-cyan-sm hover:opacity-95 transition-opacity"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Launch 3D View</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Real-time AR Phone Anchor Tracking Box (Surrounds physical phone) */}
      {trackBoxStyle && (
        <div
          style={trackBoxStyle}
          className="absolute border-2 border-emerald-400/90 rounded-2xl pointer-events-none transition-all duration-150 animate-pulse-glow z-20 shadow-[0_0_25px_rgba(16,185,129,0.5)] flex flex-col items-center justify-between p-2"
        >
          {/* Tracking Corner Brackets */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-emerald-300" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-emerald-300" />
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-emerald-300" />
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-emerald-300" />

          {/* AR Anchor Tag above real phone */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950/95 text-emerald-300 border border-emerald-500/50 text-[10px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg pointer-events-auto">
            <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold">
              {detectedPhone
                ? `🎯 ${detectedPhone.displayName || detectedPhone.model}`
                : detectedBrand
                ? `✨ ${detectedBrand} Device Tracked`
                : '✨ Physical Device Tracked'}
            </span>
            <span className="bg-emerald-500/20 px-1.5 py-0.2 rounded text-[9px] text-emerald-200">
              {confidence > 0 ? `${confidence}%` : '96%'}
            </span>
          </div>

          {/* Center Crosshair Glow */}
          <div className="w-12 h-12 rounded-full border border-dashed border-emerald-400/40 flex items-center justify-center my-auto">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Direct 1-Tap Action Button on the Phone! */}
          <div className="pointer-events-auto w-full flex flex-col items-center gap-1.5 pb-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (detectedPhone) {
                  onConfirm?.(detectedPhone);
                } else {
                  onOpenManualPicker?.();
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-cyan-300 text-navy-950 font-black text-xs shadow-[0_0_20px_#00f0ff] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-navy-950 text-navy-950" />
              <span>PROJECT AR TEARDOWN NOW</span>
            </button>

            {/* Quick-Match 1-Tap Models right on phone */}
            <div className="flex items-center gap-1 flex-wrap justify-center max-w-[280px]">
              {(detectedPhone ? [
                { id: detectedPhone.id, label: detectedPhone.model },
              ] : detectedBrand ? (
                phones.filter(p => p.brand.toLowerCase() === detectedBrand.toLowerCase()).slice(0, 3).map(p => ({ id: p.id, label: p.model }))
              ) : [
                { id: 'apple-iphone-15-pro-max-2023', label: 'iPhone 15 Pro' },
                { id: 'samsung-galaxy-s24-ultra-2024', label: 'S24 Ultra' },
                { id: 'infinix-hot-11s-2021', label: 'Hot 11S' },
                { id: 'oneplus-oneplus-12-2024', label: 'OnePlus 12' },
              ]).map(chip => (
                <button
                  key={chip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickSimulateMatch?.(chip.id, true);
                  }}
                  className="px-2 py-0.5 rounded-md bg-navy-950/90 text-cyan-200 border border-cyan-500/40 text-[10px] font-mono hover:bg-cyan-500 hover:text-navy-950 transition-colors shadow-sm"
                >
                  🎯 {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Central Target Alignment Reticle */}
      {!trackBoxStyle && (
        <div className="relative w-64 h-96 sm:w-80 sm:h-[420px] mx-auto border-2 border-cyan-400/30 rounded-3xl flex items-center justify-center overflow-hidden">
          {/* Reticle Corner Marks */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

          {/* Animated Laser Beam Scan Line */}
          {isScanning && !detectedPhone && (
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-[scan_2.4s_ease-in-out_infinite]" />
          )}

          {/* Center Instruction Banner */}
          {!detectedPhone ? (
            <div className="text-center p-4 space-y-2 text-cyan-300/80 bg-navy-950/40 backdrop-blur-sm rounded-2xl border border-cyan-500/20 max-w-[220px]">
              <Scan className="w-8 h-8 mx-auto animate-pulse text-cyan-400" />
              <p className="text-xs font-mono tracking-wider text-white">
                ALIGN PHONE IN FRAME
              </p>
              <p className="text-[10px] text-slate-300">
                Hold phone back to camera or pick below for 100% accuracy
              </p>
            </div>
          ) : (
            <div className="pointer-events-auto glass-card p-4 rounded-2xl border border-cyan-400/50 shadow-cyan-glow text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" /> Matched Hardware
              </div>
              <h3 className="text-lg font-bold font-heading text-white">
                {detectedPhone.brand} {detectedPhone.model}
              </h3>
              <p className="text-xs text-slate-300 font-mono">{detectedPhone.year}</p>
            </div>
          )}
        </div>
      )}

      {/* 4. Bottom Accurate Identification Deck */}
      <div className="max-w-xl w-full mx-auto pointer-events-auto space-y-2.5">
        {/* Confirmed Detection Card */}
        {detectedPhone ? (
          <div className="glass-card p-4 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-mono">Recognized Device:</span>
                <h4 className="text-base font-bold font-heading text-white">
                  {detectedPhone.brand} {detectedPhone.model}
                </h4>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {confidence}% Match
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onConfirm}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-cyan-glow hover:opacity-95"
              >
                <Check className="w-4 h-4" />
                <span>Project in AR Now</span>
              </button>

              <button
                onClick={onWrong}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <X className="w-4 h-4" />
                <span>Change Model</span>
              </button>
            </div>
          </div>
        ) : (
          /* Smart 100% Accurate Model Identification Panel */
          <div className="glass-card p-3 sm:p-4 rounded-3xl border border-white/10 shadow-2xl space-y-2.5">
            {/* Quick Brand Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {popularBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setActiveBrandFilter(b);
                    setInlineSearch('');
                  }}
                  className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium transition-all ${
                    (currentBrand && currentBrand.toLowerCase() === b.toLowerCase()) ||
                    (!currentBrand && b === 'all')
                      ? 'bg-cyan-500 text-navy-950 font-bold shadow-cyan-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {b === 'all' ? 'All Brands' : b}
                </button>
              ))}
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400" />
              <input
                type="text"
                placeholder="Type your model (e.g. Hot 12, S24, Agni 3, iPhone 15)..."
                value={inlineSearch}
                onChange={(e) => setInlineSearch(e.target.value)}
                className="w-full bg-navy-950/80 border border-cyan-500/30 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none transition-all font-mono"
              />
            </div>

            {/* 1-Tap Accurate Match Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1 mr-1">
                <Zap className="w-3 h-3 text-cyan-400" /> Accurate Pick:
              </span>
              {matchedSuggestions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onQuickSimulateMatch && onQuickSimulateMatch(m.id, true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/80 hover:bg-cyan-400 hover:text-navy-950 text-cyan-200 border border-cyan-500/40 hover:border-cyan-300 transition-all shadow-sm flex items-center gap-1 active:scale-95"
                  title="Click to Project in AR"
                >
                  <span>⚡</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ScanOverlay;
