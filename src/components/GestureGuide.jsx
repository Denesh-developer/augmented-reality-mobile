import React from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, RotateCw, ZoomIn, MoveRight, Focus, RefreshCw, ThumbsUp, } from 'lucide-react';
export const GestureGuide = () => {
    const { t } = useTranslation();
    const gestures = [
        {
            icon: RotateCw,
            title: 'Two Fingers Move (Crossed / Extended)',
            desc: 'Hold two fingers extended or crossed (peace / scissor sign) and move across camera to spin the 3D phone model ultra-smoothly.',
            action: '90 FPS Ultra-Fast 3D Rotation',
            keypoints: 'Index + Middle extended, moving XY',
            accent: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
        },
        {
            icon: MoveRight,
            title: 'Two Fingers Touch & Open',
            desc: 'Touch two fingers together and spread them apart to explode and separate all 13 smartphone hardware layers.',
            action: 'Disassemble (Explode All Layers)',
            keypoints: 'Thumb + Index touch then open',
            accent: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        },
        {
            icon: RefreshCw,
            title: 'Palm Closed / Fist',
            desc: 'Close all fingers into a palm fist to smoothly reassemble and bring all phone components back together.',
            action: 'Assemble All Components',
            keypoints: 'All 4 fingers curled into palm',
            accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        },
        {
            icon: Focus,
            title: 'Two Fingers Joined (Inspect)',
            desc: 'Touch two fingers together and place/hover the cursor over any component to open its authentic real-time specifications card.',
            action: 'Select & Inspect Component Details',
            keypoints: 'Thumb + Index joined over 3D part',
            accent: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        },
    ];
    return (<section id="gestures" className="py-24 relative overflow-hidden bg-navy-950/80 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 uppercase tracking-widest">
            MediaPipe Hand Tracking
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
            {t('gestures.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            {t('gestures.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gestures.map((g, idx) => {
            const Icon = g.icon;
            return (<div key={idx} className="glass-card glass-card-hover p-6 rounded-2xl border border-white/10 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${g.accent} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6"/>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                      Vision Keypoint
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {g.title}
                  </h3>

                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {g.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">Action:</span>
                    <span className="text-cyan-300 font-medium">{g.action}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 bg-white/[0.02] p-2 rounded border border-white/5">
                    {g.keypoints}
                  </div>
                </div>
              </div>);
        })}
        </div>
      </div>
    </section>);
};
