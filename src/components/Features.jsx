import React from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, Cpu, Layers, Sparkles, Languages, Globe2, CheckCircle2, } from 'lucide-react';
export const Features = () => {
    const { t } = useTranslation();
    const featureCards = [
        {
            icon: Hand,
            title: t('features.f1Title'),
            desc: t('features.f1Desc'),
            pill: 'MediaPipe 21-Keypoints',
            glow: 'group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]',
            iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        },
        {
            icon: Cpu,
            title: t('features.f2Title'),
            desc: t('features.f2Desc'),
            pill: 'TF.js + Tesseract OCR',
            glow: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
            iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        },
        {
            icon: Layers,
            title: t('features.f3Title'),
            desc: t('features.f3Desc'),
            pill: 'Code-Generated Three.js',
            glow: 'group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
            iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        },
        {
            icon: Sparkles,
            title: t('features.f4Title'),
            desc: t('features.f4Desc'),
            pill: 'Physics-Based GSAP',
            glow: 'group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]',
            iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        },
        {
            icon: Languages,
            title: t('features.f5Title'),
            desc: t('features.f5Desc'),
            pill: 'English & தமிழ்',
            glow: 'group-hover:border-amber-500/50 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
            iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        },
        {
            icon: Globe2,
            title: t('features.f6Title'),
            desc: t('features.f6Desc'),
            pill: 'PWA & WebXR Ready',
            glow: 'group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
            iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        },
    ];
    return (<section id="features" className="py-24 relative overflow-hidden bg-navy-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 uppercase tracking-widest">
            Core Engineering
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
            {t('features.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, index) => {
            const Icon = feat.icon;
            return (<div key={index} className={`group glass-card p-7 rounded-2xl border border-white/10 transition-all duration-300 ${feat.glow} flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${feat.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6"/>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10">
                      {feat.pill}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-heading text-white mb-2.5 group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-white/5 flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400"/>
                  <span>Hardware-accelerated WebGL 2.0</span>
                </div>
              </div>);
        })}
        </div>
      </div>
    </section>);
};
