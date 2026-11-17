import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, Menu, X, Globe, Camera, ArrowRight, } from 'lucide-react';
export const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ta' : 'en';
        i18n.changeLanguage(newLang);
    };
    const navLinks = [
        { name: t('nav.howItWorks'), href: '/#how-it-works' },
        { name: t('nav.features'), href: '/#features' },
        { name: t('nav.gestures'), href: '/#gestures' },
        { name: t('nav.supportedPhones'), href: '/#supported-phones' },
    ];
    return (<header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-navy-950/80 backdrop-blur-xl border-b border-white/10 shadow-glass py-3'
            : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center shadow-cyan-sm group-hover:scale-105 transition-transform duration-300">
              <Layers className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300"/>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <div>
              <span className="text-lg font-bold font-heading tracking-tight text-white flex items-center gap-1.5">
                AR TEARDOWN <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30">PRO</span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono hidden sm:block">
                {t('nav.tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            {navLinks.map((link) => (<a key={link.name} href={link.href} className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-cyan-300 rounded-full hover:bg-white/[0.06] transition-colors">
                {link.name}
              </a>))}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400" title="Toggle Tamil / English">
              <Globe className="w-3.5 h-3.5 text-cyan-400"/>
              <span>{i18n.language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Launch AR Button */}
            <Link to="/app" className="relative inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-navy-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 shadow-cyan-glow hover:shadow-[0_0_30px_0_rgba(0,245,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all group">
              <Camera className="w-4 h-4 text-navy-950 group-hover:scale-110 transition-transform"/>
              <span>{t('nav.launchAR')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-navy-950 -ml-0.5 group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleLanguage} className="p-2 text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/10 rounded-lg">
              {i18n.language === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300 hover:text-white rounded-lg bg-white/[0.04] border border-white/10 focus:outline-none" aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (<div className="md:hidden glass-panel border-b border-white/10 px-4 pt-4 pb-6 mt-3 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (<a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium text-slate-200 hover:text-cyan-400 hover:bg-white/[0.05] rounded-lg transition-colors">
                {link.name}
              </a>))}
          </div>

          <div className="pt-3 border-t border-white/10">
            <Link to="/app" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-center font-semibold text-navy-950 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-cyan-glow">
              <Camera className="w-4 h-4 text-navy-950"/>
              <span>{t('nav.launchAR')}</span>
              <ArrowRight className="w-4 h-4 text-navy-950"/>
            </Link>
          </div>
        </div>)}
    </header>);
};
