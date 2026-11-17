import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scan, Cpu, Layers, Hand, ArrowRight } from 'lucide-react';
export const HowItWorks = () => {
    const { t } = useTranslation();
    const steps = [
        {
            step: '01',
            icon: Scan,
            title: t('howItWorks.step1Title'),
            desc: t('howItWorks.step1Desc'),
            badge: 'Vision Camera',
            color: 'from-cyan-500/20 to-blue-500/10',
            border: 'border-cyan-500/30',
            iconColor: 'text-cyan-400',
        },
        {
            step: '02',
            icon: Cpu,
            title: t('howItWorks.step2Title'),
            desc: t('howItWorks.step2Desc'),
            badge: 'Dual-Engine ML',
            color: 'from-purple-500/20 to-pink-500/10',
            border: 'border-purple-500/30',
            iconColor: 'text-purple-400',
        },
        {
            step: '03',
            icon: Layers,
            title: t('howItWorks.step3Title'),
            desc: t('howItWorks.step3Desc'),
            badge: 'Procedural 3D',
            color: 'from-cyan-500/20 to-emerald-500/10',
            border: 'border-cyan-500/30',
            iconColor: 'text-cyan-400',
        },
        {
            step: '04',
            icon: Hand,
            title: t('howItWorks.step4Title'),
            desc: t('howItWorks.step4Desc'),
            badge: 'Contactless Air Gestures',
            color: 'from-blue-500/20 to-purple-500/10',
            border: 'border-blue-500/30',
            iconColor: 'text-blue-400',
        },
    ];
    return (<section id="how-it-works" className="py-24 relative overflow-hidden bg-navy-950/60 border-t border-white/5">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[25rem] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none"/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 uppercase tracking-widest">
            Pipeline Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
            {t('howItWorks.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (<div key={index} className="group relative glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between border border-white/10">
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} border ${item.border} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${item.iconColor}`}/>
                  </div>
                  <span className="font-mono text-2xl font-bold text-slate-600 group-hover:text-cyan-400/80 transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/20">
                    {item.badge}
                  </span>
                  <h3 className="text-lg font-bold font-heading text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Subtle indicator link */}
                <div className="pt-4 border-t border-white/5 flex items-center text-xs font-medium text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <span>Interactive Phase</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform"/>
                </div>
              </div>);
        })}
        </div>
      </div>
    </section>);
};
