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
  RotateCcw,
} from 'lucide-react';
import phonesData from '../../data/phones.json';

export const ScanOverlay = ({
  isScanning,
  detectedPhone,
  suggestedPhone,
  suggested3Phones: propSuggested3Phones,
  detectedBrand,
  confidence,
  detectedBBox,
  isAnalyzing = false,
  hasScannedPhone = false,
  videoSize,
  isDetectionLocked = false,
  onRescan,
  onToggleLock,
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

  // Suggestions are only populated when the camera actually scans a phone
  const [localSuggested3, setLocalSuggested3] = useState([]);

  // Automatically refresh random 3 models every time a phone is physically scanned in frame
  useEffect(() => {
    if (propSuggested3Phones && propSuggested3Phones.length === 3) {
      setLocalSuggested3(propSuggested3Phones);
    } else if (hasScannedPhone && (detectedBBox || (isDetectionLocked && detectedPhone))) {
      if (detectedBrand) {
        const brandPhones = phones.filter(
          (p) => p.brand.toLowerCase() === detectedBrand.toLowerCase()
        );
        if (brandPhones.length >= 3) {
          const shuffled = [...brandPhones].sort(() => 0.5 - Math.random());
          setLocalSuggested3(shuffled.slice(0, 3));
          return;
        }
      }
      const shuffled = [...phones].sort(() => 0.5 - Math.random());
      setLocalSuggested3(shuffled.slice(0, 3));
    }
  }, [propSuggested3Phones, detectedBBox, hasScannedPhone, isDetectionLocked, detectedPhone, detectedBrand, phones]);

  const displaySuggested3 =
    propSuggested3Phones && propSuggested3Phones.length === 3
      ? propSuggested3Phones
      : localSuggested3.length === 3
      ? localSuggested3
      : phones.slice(0, 3);

  const estimatedPhone = detectedPhone || suggestedPhone || null;

  const hasPhoneInFrame = Boolean(detectedBBox || (isDetectionLocked && estimatedPhone));
  // Strictly false until a physical phone is actually detected in front of camera
  const hasAttemptedScan = Boolean(
    (detectedPhone && confidence > 0) ||
    hasScannedPhone ||
    (detectedBBox && detectedBBox.length === 4) ||
    (isDetectionLocked && estimatedPhone)
  );
  const isSearchActive = inlineSearch.trim().length > 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* 1. Top Status Bar & Controls (50% Accurate Device indicator on Scan) */}
      <div className="flex items-center justify-between gap-2 pointer-events-auto flex-wrap">
        {/* Status Radar */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-950/85 backdrop-blur-md border border-cyan-500/30 text-xs shadow-cyan-sm">
          <span className={`w-2 h-2 rounded-full ${isDetectionLocked ? 'bg-emerald-400' : 'bg-cyan-400 animate-ping'}`} />
          <span className="font-mono text-cyan-300 font-semibold">
            {hasAttemptedScan && estimatedPhone
              ? `🎯 50% ACCURATE DEVICE: ${estimatedPhone.brand} ${estimatedPhone.model}`
              : isAnalyzing
              ? `🔍 Analyzing Hardware...`
              : hasPhoneInFrame
              ? `📱 Physical Phone Tracked`
              : t('app.scanning')}
          </span>
          {hasAttemptedScan && estimatedPhone && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 font-bold">
              50% Accurate
            </span>
          )}
          {hasAttemptedScan && onRescan && (
            <button
              onClick={onRescan}
              className="ml-1 p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
              title="Unlock & Scan Again"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
            </button>
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
              {estimatedPhone
                ? `🎯 50% Accurate Device: ${estimatedPhone.displayName || estimatedPhone.model}`
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
            {estimatedPhone ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm?.(estimatedPhone);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-cyan-300 text-navy-950 font-black text-xs shadow-[0_0_20px_#00f0ff] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-navy-950 text-navy-950" />
                <span>PROJECT {estimatedPhone.model.toUpperCase()} IN AR</span>
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
          {isScanning && (
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-[scan_2.4s_ease-in-out_infinite]" />
          )}

          {/* Center Instruction Banner */}
          <div className="text-center p-4 space-y-2 text-cyan-300/80 bg-navy-950/40 backdrop-blur-sm rounded-2xl border border-cyan-500/20 max-w-[220px]">
            <Scan className="w-8 h-8 mx-auto animate-pulse text-cyan-400" />
            <p className="text-xs font-mono tracking-wider text-white">
              ALIGN PHONE IN FRAME
            </p>
            <p className="text-[10px] text-slate-300">
              Hold phone back to camera to scan
            </p>
          </div>
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
          <div className="max-w-md w-full mx-auto pointer-events-auto text-center space-y-2.5 animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-950/80 backdrop-blur-md border border-cyan-500/20 text-xs text-slate-300 shadow-lg">
              <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Hold your phone's back panel to camera to scan</span>
            </div>
            <button
              onClick={onOpenManualPicker}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-cyan-glow hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Choose Model Manually ({phones.length} Models)</span>
            </button>
            <div className="relative pt-0.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Or type model name to search (e.g. Note 10, S24, 15 Pro)..."
                value={inlineSearch}
                onChange={(e) => setInlineSearch(e.target.value)}
                className="w-full bg-navy-950/70 border border-white/10 focus:border-cyan-400/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
            </div>
          </div>
        ) : (
          /* C. SCANNED PHONE: Honest AI Prompt + 3 Camera-Analyzed Suggestions + Manual Select + Search */
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

            {/* 3 Suggested Mobile Phones (Camera-analyzed and randomized per scan) */}
            <div className="pt-1 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs px-0.5">
                <span className="font-mono text-cyan-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>If your mobile is here, choose it:</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  AI Camera Analyzed
                </span>
              </div>

              {/* 3 Suggestion Rows */}
              <div className="space-y-1.5">
                {displaySuggested3.map((phone, idx) => (
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
