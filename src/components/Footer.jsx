import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Github, Heart, Mail } from 'lucide-react';
export const Footer = () => {
    const { t } = useTranslation();
    return (<footer className="border-t border-white/10 bg-navy-950 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400"/>
              </div>
              <span className="text-base font-bold font-heading text-white tracking-tight">
                AR MOBILE TEARDOWN <span className="text-cyan-400 font-mono text-xs">PRO</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              Browser-based augmented reality system for mobile device teardown, hardware engineering inspection, and interactive electronics repair education.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors" title="GitHub Repository">
                <Github className="w-4 h-4"/>
              </a>
              <a href="mailto:contact@arteardown.dev" className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors" title="Contact Engineering Team">
                <Mail className="w-4 h-4"/>
              </a>
            </div>
          </div>

          {/* Architecture Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Hardware Architecture
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-cyan-400 transition-colors">Vision Pipeline</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Procedural Engine</a></li>
              <li><a href="#gestures" className="hover:text-cyan-400 transition-colors">MediaPipe Gestures</a></li>
              <li><a href="#supported-phones" className="hover:text-cyan-400 transition-colors">Supported Handsets</a></li>
            </ul>
          </div>

          {/* Technologies */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Tech Stack
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Three.js & WebGL 2.0</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> MediaPipe Tasks Vision</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> TensorFlow.js COCO-SSD</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Tesseract.js OCR</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> GSAP Layer Physics</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t('footer.copyright')}</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500"/>
            <span>for WebAR Innovation</span>
          </p>
        </div>
      </div>
    </footer>);
};
