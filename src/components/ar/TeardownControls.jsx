import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getPhoneComponentTags } from '../../data/componentResolver';
import {
  RotateCcw,
  Camera,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  Globe,
  Hand,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
} from 'lucide-react';

export const TeardownControls = ({
  phone,
  currentStep,
  totalSteps,
  explodeFactor,
  onStepChange,
  onExplodeChange,
  onReset,
  onScreenshot,
  quality,
  onToggleQuality,
  showHands,
  onToggleHands,
  onSelectModelClick,
  onZoomIn,
  onZoomOut,
  onResetZoom: _onResetZoom,
  isRotationLocked = false,
  onToggleRotationLock,
  selectedPartId = null,
  onSelectPart,
}) => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const componentTags = useMemo(() => getPhoneComponentTags(phone, isTamil), [phone, isTamil]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  const isFullExploded = explodeFactor >= 0.85;

  return (
    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 pointer-events-none z-30 flex flex-col gap-2.5">
      {/* Top Floating Mini-Bar: Step info & Quick actions */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto pointer-events-auto">
        {/* Step Indicator Pill */}
        <div className="glass-card px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-xs">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-white font-medium">
            {t('app.step', { current: currentStep + 1, total: totalSteps })}
          </span>
          <div className="flex gap-1 ml-1">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentStep ? 'bg-cyan-400 w-3' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action icons bar */}
        <div className="glass-card px-2 py-1 rounded-full border border-white/10 flex items-center gap-1">
          {/* Rotation Lock toggle */}
          {onToggleRotationLock && (
            <button
              onClick={onToggleRotationLock}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isRotationLocked
                  ? 'bg-amber-400 text-navy-950 font-bold shadow-[0_0_15px_rgba(251,191,36,0.7)]'
                  : 'bg-white/5 text-slate-300 hover:text-cyan-300 hover:bg-white/10'
              }`}
              title={isRotationLocked ? '3D Rotation Locked (Click to Unlock)' : 'Click to Lock 3D Rotation'}
            >
              {isRotationLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isRotationLocked ? (isTamil ? '3D பூட்டு' : '3D Locked') : (isTamil ? 'சுழற்று' : 'Rotate')}</span>
            </button>
          )}

          {/* Switch Model button */}
          <button
            onClick={onSelectModelClick}
            className="p-2 text-slate-300 hover:text-cyan-400 rounded-full hover:bg-white/5 transition-colors"
            title="Change Smartphone Model"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Hand tracking toggle */}
          <button
            onClick={onToggleHands}
            className={`p-2 rounded-full transition-colors ${
              showHands
                ? 'bg-cyan-400/20 text-cyan-300'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Hand Tracking & Overlay"
          >
            <Hand className="w-4 h-4" />
          </button>

          {/* Quality toggle */}
          <button
            onClick={onToggleQuality}
            className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white rounded-full bg-white/5 border border-white/10"
            title="Toggle Graphics Quality"
          >
            {quality.toUpperCase()}
          </button>

          {/* Zoom Out Button */}
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="p-2 text-slate-300 hover:text-cyan-400 rounded-full hover:bg-white/5 transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          )}

          {/* Zoom In Button */}
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="p-2 text-slate-300 hover:text-cyan-400 rounded-full hover:bg-white/5 transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          )}

          {/* Screenshot capture */}
          <button
            onClick={onScreenshot}
            className="p-2 text-slate-300 hover:text-cyan-400 rounded-full hover:bg-white/5 transition-colors"
            title="Capture Screenshot"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 text-slate-300 hover:text-cyan-400 rounded-full hover:bg-white/5 transition-colors"
            title="Toggle Language"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* Reset view */}
          <button
            onClick={onReset}
            className="p-2 text-slate-300 hover:text-rose-400 rounded-full hover:bg-white/5 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Bottom Glass Control Deck */}
      <div className="max-w-xl w-full mx-auto glass-card p-3 sm:p-4 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto space-y-2.5">
        {/* Step Navigation & Explode Toggle */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Previous Step */}
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Assemble Layer</span>
          </button>

          {/* Center Explode All Button */}
          <button
            onClick={() => onExplodeChange(isFullExploded ? 0 : 0.95)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-cyan-glow hover:opacity-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-navy-950" />
            <span>{isFullExploded ? t('app.assemble') : t('app.explodeAll')}</span>
          </button>

          {/* Next Step */}
          <button
            onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
            disabled={currentStep === totalSteps - 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <span className="hidden sm:inline">Explode Layer</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Fine Explode Slider */}
        <div className="flex items-center gap-3 pt-0.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodeFactor}
            onChange={(e) => onExplodeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[11px] font-mono text-cyan-300 w-10 text-right">
            {Math.round(explodeFactor * 100)}%
          </span>
        </div>

        {/* 13 Realistic Parts Quick-Tap Bar */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mb-1.5 flex items-center justify-between">
            <span className="text-cyan-400/90 font-semibold">{isTamil ? 'பாகங்கள் தேர்வு (13)' : 'Inspect Parts (1-Tap Selection)'}</span>
            <span className="text-[9px] text-slate-500">{isTamil ? 'எந்த பாகத்தையும் தொடவும்' : 'Tap any component'}</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {componentTags.map((tag, idx) => {
              const isSelected = selectedPartId === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    onSelectPart?.(tag.id);
                    onStepChange?.(idx);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-cyan-400 text-navy-950 font-bold border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.7)] scale-105'
                      : 'bg-navy-900/80 text-slate-300 border-white/10 hover:border-cyan-400/50 hover:text-white'
                  }`}
                >
                  <span className="text-xs">{tag.icon}</span>
                  <span className="text-[11px] font-heading">{isTamil ? tag.name_ta : tag.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
