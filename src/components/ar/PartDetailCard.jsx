import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Volume2, VolumeX, Wrench, AlertTriangle, Info, CheckCircle2, } from 'lucide-react';
import { speakPartDetails, stopNarration } from '../../ml/audioNarration';
export const PartDetailCard = ({ part, phone, onClose }) => {
    const { t, i18n } = useTranslation();
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const isTamil = i18n.language === 'ta';
    const toggleSpeech = () => {
        if (isPlayingAudio) {
            stopNarration();
            setIsPlayingAudio(false);
        }
        else {
            const started = speakPartDetails(part, isTamil ? 'ta' : 'en');
            setIsPlayingAudio(started);
        }
    };
    const getDifficultyBadge = () => {
        switch (part.repairDifficulty) {
            case 'easy':
                return {
                    label: isTamil ? 'எளிதானது' : 'Easy',
                    color: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
                    dot: 'bg-emerald-400',
                };
            case 'moderate':
                return {
                    label: isTamil ? 'நடுத்தரமானது' : 'Moderate',
                    color: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
                    dot: 'bg-amber-400',
                };
            case 'hard':
                return {
                    label: isTamil ? 'கடினமானது' : 'Difficult',
                    color: 'bg-rose-950/80 text-rose-400 border-rose-500/40',
                    dot: 'bg-rose-400',
                };
        }
    };
    const diff = getDifficultyBadge();
    return (<div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="glass-card p-5 rounded-3xl border border-cyan-500/40 shadow-glass space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Layer {part.layer}
              </span>
              <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`}/>
                <span>{diff.label}</span>
              </div>
            </div>
            <h3 className="text-base font-bold font-heading text-white leading-snug">
              {isTamil ? part.name_ta : part.name}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={toggleSpeech} className={`p-2 rounded-xl border transition-all ${isPlayingAudio
            ? 'bg-cyan-400 text-navy-950 border-cyan-300 shadow-cyan-sm animate-pulse'
            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'}`} title={isPlayingAudio ? 'Stop Narration' : 'Narrate Details'}>
              {isPlayingAudio ? (<VolumeX className="w-4 h-4"/>) : (<Volume2 className="w-4 h-4 text-cyan-400"/>)}
            </button>
            <button onClick={() => {
            stopNarration();
            onClose();
        }} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* Model Specific Exact Hardware Spec Badge */}
        {phone && (<div className="bg-cyan-950/40 p-2.5 rounded-2xl border border-cyan-500/30 text-xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 font-mono font-semibold uppercase">
                {phone.brand} {phone.model} ({phone.year})
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {phone.segment}
              </span>
            </div>
            <p className="font-medium text-white text-[11px] leading-tight">
              {part.id === 'battery' && `Capacity: ${phone.batteryCapacity} • Charging: ${phone.charging}`}
              {part.id === 'motherboard' && `Chipset: ${phone.soc} • RAM: ${phone.ram} • Storage: ${phone.storage}`}
              {part.id === 'camera_module' && `Optics: ${phone.cameraSpecs} (Front: ${phone.frontCamera})`}
              {part.id === 'front_camera_module' && `Front Selfie: ${phone.frontCamera || '12MP Autofocus'} • Biometrics: ${phone.brand.toLowerCase() === 'apple' ? '3D Face ID VCSEL Array' : 'In-Display Optical / Punch-Hole'}`}
              {part.id === 'screen' && `Display: ${phone.screenSize} • Resolution: ${phone.resolution}`}
              {part.id === 'interconnect_flex' && `Bus: High-Speed Dual FPC Differential Bus • Fast Charge 5V-20V Power Rails`}
              {part.id === 'vapor_chamber' && (
                phone.brand.toLowerCase() === 'apple'
                  ? 'Aerospace Multi-Layer Graphite & Titanium Thermal Dissipation Sheet'
                  : (phone.segment === 'Budget' || phone.brand.toLowerCase() === 'infinix')
                    ? 'Flexible Die-Cut Pyrolytic Carbon Graphite Thermal Sheet with Gold Grounding Foil Tabs'
                    : 'Ultra-Thin Bionic Copper Vapor Chamber Plate with Capillary Liquid Grooves'
              )}
              {part.id === 'loudspeaker' && `Acoustic Box: 1115K Dual Stereo Resonator • Bass Reflex Port • Dolby Atmos Certified`}
              {part.id === 'haptic_engine' && (
                phone.brand.toLowerCase() === 'apple'
                  ? 'Apple Taptic Engine: Oscillating Tungsten Spring Mass'
                  : (phone.segment === 'Budget' || phone.brand.toLowerCase() === 'infinix')
                    ? 'Coin-Type ERM (Eccentric Rotating Mass) Vibration Motor with Red/Blue Lead Wires'
                    : 'X-Axis Ultra-Wideband Linear Resonant Vibration Actuator (LRA)'
              )}
              {part.id === 'frame' && `Chassis: ${phone.frameMaterial || 'Aluminum'} • Weight: ${phone.weight}`}
              {part.id === 'wireless_coil' && (
                phone.brand.toLowerCase() === 'apple'
                  ? 'MagSafe 18 Neodymium Magnets Array + Qi Wireless Induction Coil'
                  : (phone.charging?.toLowerCase().includes('wireless') || phone.charging?.toLowerCase().includes('qi') || phone.segment === 'Flagship')
                    ? 'Qi Planar Wireless Induction & Reverse PowerShare Coil with Ferrite Shield'
                    : 'Reinforced Polycarbonate Mid-Frame Stiffener & Graphite Antenna Shield (No Wireless Coil on Budget Series)'
              )}
              {part.id === 'back_panel' && (
                phone.brand.toLowerCase() === 'infinix'
                  ? `Material: ${phone.colorName || 'Sonic Cyan'} Glossy Polycarbonate with ${phone.backTextureStyle === 'wave_flow' ? 'Holographic Wave Flow Chevron Pattern' : phone.backTextureStyle === 'mecha_blueprint' ? 'Cyber Mecha Transparent Blueprint' : 'Dense Holographic Laser Pinstripes'} & Rear Capacitive Fingerprint Scanner`
                  : phone.brand.toLowerCase() === 'apple'
                    ? `Material: Precision Satin Frosted AG Glass with Centered Mirrored  Logo & Beveled Camera Island`
                    : phone.brand.toLowerCase() === 'samsung'
                      ? `Material: Satin Matte Glasstic with Minimalist Floating Individual Lens Rings (No Baseplate)`
                      : phone.brand.toLowerCase() === 'google'
                        ? `Material: Two-Tone Split Glass with Edge-to-Edge Aluminum Camera Visor Bar & Google "G" Emblem`
                        : phone.brand.toLowerCase() === 'poco'
                          ? `Material: Cyber High-Contrast Finish with Carbon Black Upper Racing Banner & POCO Typography`
                          : phone.brand.toLowerCase() === 'realme'
                            ? `Material: Luxury Embossed Vegan Leather with Golden Central Stitched Zipper Seam`
                            : `Material: ${phone.backMaterial} Cover Glass with ${phone.brand} Custom Finish`
              )}
              {part.id === 'sub_board' && (
                (phone.segment === 'Budget' || phone.brand.toLowerCase() === 'infinix' || (phone.segment === 'Mid-Range' && phone.brand.toLowerCase() !== 'apple' && phone.brand.toLowerCase() !== 'samsung' && phone.brand.toLowerCase() !== 'google'))
                  ? `I/O Controller: USB-C Fast Ingress & 3.5mm Analog Audio Headphone Jack Module • OS: ${phone.osAtLaunch}`
                  : `I/O Controller: High-Density USB-C & Beamforming MEMS Microphones (No 3.5mm Jack) • OS: ${phone.osAtLaunch}`
              )}
            </p>
          </div>)}

        {/* Content sections */}
        <div className="space-y-3 text-xs leading-relaxed max-h-60 overflow-y-auto pr-1">
          {/* Function & Role */}
          <div className="space-y-1">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5"/>
              {t('app.function')}
            </span>
            <p className="text-slate-300">
              {isTamil ? part.function_ta : part.function}
            </p>
          </div>

          {/* Key Specifications */}
          <div className="space-y-1">
            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5"/>
              {t('app.specs')}
            </span>
            <p className="text-slate-400">
              {isTamil ? part.specs_ta : part.specs}
            </p>
          </div>

          {/* Common Issues */}
          <div className="space-y-1">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5"/>
              {t('app.commonIssues')}
            </span>
            <p className="text-slate-400">
              {isTamil ? part.commonIssues_ta : part.commonIssues}
            </p>
          </div>

          {/* Tools required if any */}
          {part.tools && (<div className="pt-2 border-t border-white/5 text-[11px] text-slate-500 flex items-start gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5"/>
              <span>Recommended Tools: {part.tools}</span>
            </div>)}
        </div>
      </div>
    </div>);
};
