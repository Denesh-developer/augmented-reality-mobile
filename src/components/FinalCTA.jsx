import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Shield, ArrowRight, Sparkles } from 'lucide-react';
export const FinalCTA = () => {
    const { t } = useTranslation();
    return (<section className="py-24 relative overflow-hidden bg-navy-950 border-t border-white/5">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-cyan-950/20 via-transparent to-navy-950 pointer-events-none"/>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="glass-card p-10 sm:p-14 rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] space-y-6 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"/>
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"/>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-semibold text-cyan-300 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400"/>
            Instant WebAR Teardown
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
            {t('cta.title')}
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('cta.desc')}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/app" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl text-base font-bold text-navy-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 shadow-cyan-glow hover:shadow-[0_0_40px_rgba(0,245,255,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all group">
              <Camera className="w-5 h-5 text-navy-950"/>
              <span>{t('cta.btn')}</span>
              <ArrowRight className="w-4 h-4 text-navy-950 group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>

          {/* Privacy & permission note */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400"/>
            <span>{t('cta.privacy')}</span>
          </div>
        </div>
      </div>
    </section>);
};
