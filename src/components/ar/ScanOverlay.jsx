import React, { useState, useMemo, useEffect } from 'react';
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
  Smartphone,
  HelpCircle,
  Zap,
} from 'lucide-react';
import phonesData from '../../data/phones.json';

export const ScanOverlay = ({
  isScanning,
  detectedPhone,
  suggestedPhone,
  detectedBrand,
  confidence,
  detectedBBox,
  isAnalyzing = false,
  hasScannedPhone = false,
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

  // Automatic per-scan random 3 suggestions (Automatically picks on each scan without manual user shuffle)
  const [suggested3Phones, setSuggested3Phones] = useState(() => {
    const shuffled = [...phones].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });

  // Automatically refresh random 3 models every time a phone is scanned in frame
  useEffect(() => {
    if (detectedBBox || hasScannedPhone) {
      if (detectedBrand) {
        const brandPhones = phones.filter(
          (p) => p.brand.toLowerCase() === detectedBrand.toLowerCase()
        );
        if (brandPhones.length >= 3) {
          const shuffled = [...brandPhones].sort(() => 0.5 - Math.random());
          setSuggested3Phones(shuffled.slice(0, 3));
          return;
        }
      }
      const shuffled = [...phones].sort(() => 0.5 - Math.random());
      setSuggested3Phones(shuffled.slice(0, 3));
    }
  }, [detectedBBox, hasScannedPhone, detectedBrand, phones]);

  // Inline search filter
  const matchedPhones = useMemo(() => {
    const rawQ = inlineSearch.toLowerCase().trim();
    if (!rawQ) return [];
    const compactQ = rawQ.replace(/[^a-z0-9]/g, '');
    const tokens = rawQ.split(/\s+/).filter(Boolean);

    return phones.filter((p) => {
      const searchable = `${p.brand} ${p.model} ${p.displayName} ${p.year} ${p.soc}`.toLowerCase();
      const compactSearchable = searchable.replace(/[^a-z0-9]/g, '');
      const allTokens = tokens.every((tok) => searchable.includes(tok));
      const compact = compactQ.length >= 2 && compactSearchable.includes(compactQ);
      return allTokens || compact;
    });
  }, [phones, inlineSearch]);

  const hasPhoneInFrame = Boolean(detectedBBox);
  const hasAttemptedScan = Boolean(hasScannedPhone || hasPhoneInFrame);
  const isConfirmedMatch = Boolean(detectedPhone && confidence >= 75);
  const isSearchActive = inlineSearch.trim().length > 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* 1. Top Status Bar & Controls */}
      <div className="flex items-center justify-between gap-2 pointer-events-auto flex-wrap">
        {/* Status Radar */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-950/85 backdrop-blur-md border border-cyan-500/30 text-xs shadow-cyan-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-cyan-300 font-semibold">
            {isConfirmedMatch
              ? `🎯 IDENTIFIED: ${detectedPhone.brand} ${detectedPhone.model}`
              : isAnalyzing
              ? `🔍 Analyzing Hardware...`
              : hasPhoneInFrame
              ? `📱 Physical Phone Tracked`
              : t('app.scanning')}
          </span>
          {confidence > 0 && isConfirmedMatch && (
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
            <span>All Models ({phones.length})</span>
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

      {/* 2. Real-time AR Phone Anchor Tracking Box (Shows only when phone is physically detected in frame) */}
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
              {isConfirmedMatch
                ? `🎯 ${detectedPhone.displayName || detectedPhone.model}`
                : isAnalyzing
                ? `🔍 Analyzing device...`
                : '📱 Smartphone Tracked'}
            </span>
          </div>

          {/* Center Crosshair Glow */}
          <div className="w-12 h-12 rounded-full border border-dashed border-emerald-400/40 flex items-center justify-center my-auto">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Single Action Button on Tracked Phone */}
          <div className="pointer-events-auto w-full flex flex-col items-center pb-1">
            {isConfirmedMatch ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm?.(detectedPhone);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-cyan-300 text-navy-950 font-black text-xs shadow-[0_0_20px_#00f0ff] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-navy-950 text-navy-950" />
                <span>PROJECT {detectedPhone.model.toUpperCase()} IN AR</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenManualPicker?.();
                }}
                className="px-4 py-1.5 rounded-xl bg-navy-950/90 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900 text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>Choose Model Manually</span>
              </button>
            )}
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
          {isScanning && !isConfirmedMatch && (
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-[scan_2.4s_ease-in-out_infinite]" />
          )}

          {/* Center Instruction Banner */}
          {!isConfirmedMatch ? (
            <div className="text-center p-4 space-y-2 text-cyan-300/80 bg-navy-950/40 backdrop-blur-sm rounded-2xl border border-cyan-500/20 max-w-[220px]">
              <Scan className="w-8 h-8 mx-auto animate-pulse text-cyan-400" />
              <p className="text-xs font-mono tracking-wider text-white">
                ALIGN PHONE IN FRAME
              </p>
              <p className="text-[10px] text-slate-300">
                Hold phone back to camera to scan
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

      {/* 4. Bottom Identification Deck */}
      <div className="max-w-xl w-full mx-auto pointer-events-auto space-y-2.5">
        {/* A. Inline Search Active Results */}
        {isSearchActive ? (
          <div className="glass-card p-4 rounded-3xl border border-white/10 shadow-2xl space-y-3 animate-in fade-in duration-200">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="Search smartphone model..."
                value={inlineSearch}
                onChange={(e) => setInlineSearch(e.target.value)}
                autoFocus
                className="w-full bg-navy-950/80 border border-cyan-500/40 focus:border-cyan-400 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-400 outline-none transition-all font-mono"
              />
              <button
                onClick={() => setInlineSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Empty State vs Matching Results */}
            {matchedPhones.length === 0 ? (
              <div className="p-4 rounded-2xl bg-navy-950/90 border border-cyan-500/20 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Smartphone className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-white font-heading">
                    Your mobile is not in our database
                  </p>
                  <p className="text-[11px] text-slate-300">
                    We couldn't find "<span className="text-cyan-300 font-mono font-medium">{inlineSearch}</span>". In future, definitely we will upgrade our database!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setInlineSearch('');
                    onOpenManualPicker?.();
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium pt-1 inline-block"
                >
                  Browse all {phones.length} database models
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {matchedPhones.slice(0, 3).map((phone) => (
                  <div
                    key={phone.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-white font-heading truncate">
                        {phone.displayName || `${phone.brand} ${phone.model}`}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {phone.year} • {phone.soc || phone.chipset}
                      </p>
                    </div>
                    <button
                      onClick={() => onConfirm?.(phone)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-navy-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:opacity-95 shadow-cyan-sm transition-all flex-shrink-0"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !hasAttemptedScan ? (
          /* B. INITIAL STATE: User has NOT shown a phone yet! Keep view completely clean */
          <div className="max-w-md w-full mx-auto pointer-events-auto text-center space-y-2 animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-950/80 backdrop-blur-md border border-cyan-500/20 text-xs text-slate-300 shadow-lg">
              <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Hold your phone's back panel to camera to scan</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onOpenManualPicker}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Or choose from all {phones.length} models</span>
              </button>
            </div>
          </div>
        ) : isAnalyzing && !isConfirmedMatch ? (
          /* C. ACTIVE SCANNING STATE: Phone is currently being analyzed by AI */
          <div className="glass-card p-4 rounded-3xl border border-cyan-400/40 shadow-cyan-glow text-center space-y-2 animate-pulse">
            <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-mono font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>SCANNING HARDWARE... ANALYZING MODEL SIGNATURES</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Hold steady while AI reads camera layout, brand typography & specs
            </p>
          </div>
        ) : isConfirmedMatch ? (
          /* D. CONFIRMED HIGH-CONFIDENCE MATCH CARD */
          <div className="glass-card p-4 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Recognized Device:
                </span>
                <h4 className="text-base font-bold font-heading text-white">
                  {detectedPhone.brand} {detectedPhone.model}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {detectedPhone.year} • {detectedPhone.soc || detectedPhone.chipset}
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {confidence}% Match
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onConfirm?.(detectedPhone)}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-cyan-glow hover:opacity-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Project in AR Now</span>
              </button>

              <button
                onClick={onOpenManualPicker}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
              >
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Choose Manually</span>
              </button>
            </div>
          </div>
        ) : (
          /* E. SCANNED BUT UNCONFIRMED CARD (Honest prompt, genuine suggestion only if identified) */
          <div className="glass-card p-4 rounded-3xl border border-white/10 shadow-2xl space-y-3 animate-in fade-in duration-300">
            {/* Header: "I'm not able to identify this phone" */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-300 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Scanner Result</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold font-heading text-white leading-snug">
                  I'm not able to identify this phone
                </h4>
                <p className="text-[11px] text-slate-300 leading-normal">
                  I'm an AI, so I'm not able to scan the mobile accurately. If your mobile is in the suggestions below, choose it; otherwise select manually to teardown your mobile.
                </p>
              </div>
            </div>

            {/* 3 Suggested Mobile Phones (Automatically randomizes per scan as user requested) */}
            <div className="pt-1 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs px-0.5">
                <span className="font-mono text-cyan-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>If your mobile is here, choose it:</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  AI Auto-Suggested
                </span>
              </div>

              {/* 3 Compact Suggestion Rows */}
              <div className="space-y-1.5">
                {suggested3Phones.map((phone, idx) => (
                  <div
                    key={phone.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-[10px] font-mono font-bold w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white font-heading truncate">
                          {phone.displayName || `${phone.brand} ${phone.model}`}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 truncate">
                          {phone.year} • {phone.soc || phone.chipset}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onConfirm?.(phone)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-navy-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:opacity-95 transition-all flex-shrink-0 shadow-cyan-sm active:scale-95 cursor-pointer"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Action Button: Otherwise Select Manually */}
            <button
              onClick={onOpenManualPicker}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-cyan-glow hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Otherwise Select Manually ({phones.length} Models)</span>
            </button>

            {/* Quick Inline Search Input */}
            <div className="relative pt-1">
              <Search className="absolute left-3 top-[calc(50%+2px)] -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Or type model name to search (e.g. Note 10, S24, 15 Pro)..."
                value={inlineSearch}
                onChange={(e) => setInlineSearch(e.target.value)}
                className="w-full bg-navy-950/70 border border-white/10 focus:border-cyan-400/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanOverlay;
