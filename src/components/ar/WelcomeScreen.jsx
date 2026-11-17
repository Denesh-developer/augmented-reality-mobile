import React from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Smartphone, Shield, ArrowLeft, Sparkles, Globe } from 'lucide-react';
export const WelcomeScreen = ({ onStartCamera, onChooseManual, onBack, cameraError, }) => {
    const { t, i18n } = useTranslation();
    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/95 backdrop-blur-2xl overflow-y-auto">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none"/>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"/>

      {/* Top Bar with Back and Language */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 text-xs font-medium transition-colors">
          <ArrowLeft className="w-4 h-4"/>
          <span>Back to Landing</span>
        </button>

        <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 text-xs font-medium transition-colors">
          <Globe className="w-3.5 h-3.5 text-cyan-400"/>
          <span>{i18n.language === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>
      </div>

      <div className="relative max-w-lg w-full glass-card p-8 sm:p-10 rounded-3xl border border-cyan-500/30 shadow-[0_0_60px_rgba(0,240,255,0.2)] text-center space-y-6 my-auto">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 border border-cyan-400/40 flex items-center justify-center shadow-cyan-sm">
          <Camera className="w-8 h-8 text-cyan-400"/>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 uppercase">
            <Sparkles className="w-3 h-3 text-cyan-400"/>
            AI & AR Hardware Diagnostics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            {t('app.welcomeTitle')}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {t('app.welcomeDesc')}
          </p>
        </div>

        {/* Camera Permission Alert if any */}
        {cameraError && (<div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 text-left space-y-1">
            <p className="font-semibold">{cameraError}</p>
            <p className="text-amber-300/80">
              You can still choose any flagship model below and control full 3D gesture teardown!
            </p>
          </div>)}

        <div className="space-y-3 pt-2">
          <button onClick={onStartCamera} className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-navy-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 shadow-cyan-glow hover:shadow-[0_0_35px_rgba(0,245,255,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all">
            <Camera className="w-5 h-5 text-navy-950"/>
            <span>{t('app.startBtn')}</span>
          </button>

          <button onClick={onChooseManual} className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-slate-200 glass-card glass-card-hover border border-white/10">
            <Smartphone className="w-4 h-4 text-cyan-400"/>
            <span>{t('app.manualBtn')}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-cyan-400"/>
          <span>{t('app.cameraNotice')}</span>
        </div>
      </div>
    </div>);
};
